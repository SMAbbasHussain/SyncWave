const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const cloudinary = require('../utils/cloudinary');
const dotenv = require('dotenv');

dotenv.config();



passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      passReqToCallback: true, // Add this to access req in callback
      scope: ['profile', 'email'] // Ensure we get profile and email
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists by googleId or email
        let user = await User.findOne({ 
          $or: [
            { googleId: profile.id },
            { email: profile.emails[0].value }
          ] 
        });

        if (!user) {
          // Get higher resolution profile picture (replace s96-c with s400-c)
          const googleProfilePic = profile.photos[0]?.value.replace('s96-c', 's400-c');
          
          let profilePicUrl = '/PFP2.png'; // Default profile picture
          
          // Try to upload Google profile picture to Cloudinary
          if (googleProfilePic) {
            try {
              const uploadedResponse = await cloudinary.uploader.upload(googleProfilePic, {
                folder: "profile_pics",
                transformation: [{ width: 200, height: 200, crop: "fill" }],
              });
              profilePicUrl = uploadedResponse.secure_url;
            } catch (uploadError) {
              console.error("Error uploading Google profile picture:", uploadError);
              // Fall back to Google URL if Cloudinary upload fails
              profilePicUrl = googleProfilePic;
            }
          }

          // Create new user
          user = new User({
            googleId: profile.id,
            username: profile.displayName,
            email: profile.emails[0].value,
            profilePic: profilePicUrl,
            isVerified: true,
            authMethod: 'google'
          });

          await user.save();
          user.isNew = true; // Flag to indicate new user
        } else {
          // Update googleId if user exists but wasn't a Google user before
          if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
          }
          user.isNew = false;
        }

        done(null, user);
      } catch (error) {
        console.error("Google authentication error:", error);
        done(error, null);
      }
    }
  )
);

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;