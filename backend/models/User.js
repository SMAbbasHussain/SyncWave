const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  googleId: { type: String, unique: true, sparse: true },
  username: { 
    type: String, 
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email']
  },
  password: { 
    type: String,
    minlength: 6,
    select: false
  },
  profilePic: { 
    type: String,
    default: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
  },
  bio: {
    type: String,
    maxlength: 200,
    default: ''
  },
  phoneNo: {
    type: String,
    match: [/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/, 'Invalid phone number'],
    default: ''
  },
  status: { 
    type: String,
    enum: ['online', 'offline', 'away'],
    default: 'offline'
  },
  blockedUsers: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    default: [] 
  }],
  lastSeen: { 
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);