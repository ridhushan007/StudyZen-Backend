// controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Register a new user
exports.signup = async (req, res) => {
  try {
    const { fullName, email, studentId, password } = req.body;
    
    // Check if user exists by email or student ID
    let user = await User.findOne({ $or: [{ email }, { studentId }] });
    if (user) {
      return res.status(400).json({ message: "User with this email or student ID already exists" });
    }

    // Create new user and save to DB
    user = new User({ fullName, email, studentId, password });
    await user.save();

    const payload = { user: { id: user._id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
    
    res.status(201).json({ token, user: { id: user._id, fullName: user.fullName, email: user.email, studentId: user.studentId } });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Login an existing user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email (include password)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const payload = { user: { id: user._id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
    
    res.json({ token, user: { id: user._id, fullName: user.fullName, email: user.email, studentId: user.studentId } });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Request password reset: generate token and (optionally) email reset link
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // Always return 200 to avoid email enumeration
      return res.status(200).json({ message: "If that email address exists in our system, you will receive a reset link." });
    }
    
    // Generate a reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    // Set token and expiration (1 hour from now)
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();
    
    // In production, send an email. Here we log the reset URL.
    const resetUrl = `http://yourfrontend.com/reset-password/${resetToken}`;
    console.log(`Password reset link: ${resetUrl}`);
    
    res.status(200).json({ message: "Password reset link has been sent to your email." });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Reset the user’s password based on token
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    // Find user by token and verify token hasn't expired
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: "Password reset token is invalid or has expired." });
    }
    
    // Hash and update the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    // Clear reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();
    
    res.status(200).json({ message: "Password has been reset successfully." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};