const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const { createServer } = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

const aiRoutes = require('./routes/aiRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const groupRoutes = require('./routes/groupRoutes');
const chatRoutes = require('./routes/chatRoutes');
const friendRoutes = require('./routes/friendRoutes');
const groupMessageRoutes = require('./routes/groupMessageRoutes');
const { initializeSocket } = require('./services/socket');
require('./services/passport');

// Load environment variables
dotenv.config({ path: './.env' });

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Enhanced security middleware
app.use(helmet());
app.use(mongoSanitize());
app.use(cors({
  origin: process.env.CLIENT_URLS ? process.env.CLIENT_URLS.split(',') : 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', apiLimiter);

// Body parsing
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Session configuration for OAuth
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'supersecretkey',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  },
  store: process.env.NODE_ENV === 'production' ?
    new (require('connect-mongo')(session))({
      mongooseConnection: mongoose.connection,
      ttl: 24 * 60 * 60 // 1 day
    }) : null
});

app.use(sessionMiddleware);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Initialize Socket.IO with better configuration
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URLS ? process.env.CLIENT_URLS.split(',') : 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000,
    skipMiddlewares: true
  }
});

// Database connection with retry logic
const connectWithRetry = () => {
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: process.env.NODE_ENV !== 'production'
  })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    setTimeout(connectWithRetry, 5000);
  });
};

connectWithRetry();

// <<< FIX: Middleware to attach io to each request
app.use((req, res, next) => {
  req.io = io;
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/group-messages', groupMessageRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/friends', friendRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({ error: 'Internal Server Error' });
});

// JWT verification function
const verifyJWT = async (token) => {
  try {
    if (!token) throw new Error('No token provided');
    const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
    const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId || decoded.id).select('-password');
    if (!user) throw new Error('User not found');
    return user;
  } catch (error) {
    console.error('JWT verification error:', error.message);
    throw new Error('Invalid token');
  }
};


// Socket.IO authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('No token provided'));
    }
    const user = await verifyJWT(token);
    socket.user = user;
    socket.userId = user._id.toString();
    next();
  } catch (err) {
    console.error('Socket authentication error:', err.message);
    next(new Error(`Authentication failed: ${err.message}`));
  }
});

// Connection event handler
io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.user.username} (${socket.id})`);

  // <<< FIX: Join a room based on the user's ID
  socket.join(socket.userId);
  console.log(`   > User ${socket.userId} joined their personal room.`);

  socket.on('disconnect', (reason) => {
    console.log(`❌ User disconnected: ${socket.user.username} - Reason: ${reason}`);
  });

  socket.on('error', (error) => {
    console.error(`Socket error for user ${socket.user.username}:`, error);
  });
});

// Initialize Socket.IO handlers from other services if any
initializeSocket(io);

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

process.on('unhandledRejection', (err) => console.error('Unhandled Rejection:', err));
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});