import { sendEmail } from "../services/emailService.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { logAdminAction } from "../utils/logger.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

export const registerUser = async (req, res) => {
  const { name, email, password, mobileNumber } = req.body;

  if (!name || !email || !password || !mobileNumber) {
    return res.status(400).json({ message: "All fields required" });
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    mobileNumber
  });

  const token = generateToken(user._id);

  // Log user signup
  await logAdminAction({
    action: "USER_SIGNUP",
    userId: user._id,
    details: { name: user.name, email: user.email }
  });

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax", // Changed from "strict" to "lax" for better localhost compatibility
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.status(201).json({
    id: user._id,
    name: user.name,
    email: user.email,
    mobileNumber: user.mobileNumber,
    role: user.role,
    isActive: user.isActive,
    aiUsageCount: user.aiUsageCount,
    lastAIUsedAt: user.lastAIUsedAt,
    token // Include token in response for header-based auth
  });
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  if (!user.isActive) {
    return res.status(403).json({ message: "Your account has been suspended. Please contact support." });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Update last login
  user.lastLoginAt = new Date();
  await user.save();

  const token = generateToken(user._id);

  // Log admin login
  if (user.role === "admin") {
    await logAdminAction({
      action: "ADMIN_LOGIN",
      adminId: user._id,
      details: { email: user.email }
    });
  }

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax", // Changed from "strict" to "lax" for better localhost compatibility
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.status(200).json({
    id: user._id,
    name: user.name,
    email: user.email,
    mobileNumber: user.mobileNumber,
    role: user.role,
    isActive: user.isActive,
    aiUsageCount: user.aiUsageCount,
    lastAIUsedAt: user.lastAIUsedAt,
    token // Include the token in the response
  });
};

export const getMe = async (req, res) => {
  const user = {
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    mobileNumber: req.user.mobileNumber,
    role: req.user.role,
    isActive: req.user.isActive,
    aiUsageCount: req.user.aiUsageCount,
    lastAIUsedAt: req.user.lastAIUsedAt,
    lastLoginAt: req.user.lastLoginAt,
    bio: req.user.bio,
    location: req.user.location,
    socialLinks: req.user.socialLinks,
    address: req.user.address,
    smtpSettings: req.user.smtpSettings,
  };
  res.status(200).json(user);
};

export const updateProfile = async (req, res) => {
  const { name, email, mobileNumber, bio, location, socialLinks, address, smtpSettings } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = name || user.name;
      user.email = email || user.email;
      user.mobileNumber = mobileNumber || user.mobileNumber;
      user.bio = bio !== undefined ? bio : user.bio;
      user.location = location !== undefined ? location : user.location;
      
      if (socialLinks) {
        user.socialLinks = {
          ...user.socialLinks,
          ...socialLinks
        };
      }

      if (address) {
        user.address = {
          ...user.address,
          ...address
        };
      }

      if (smtpSettings) {
        user.smtpSettings = {
          ...user.smtpSettings,
          ...smtpSettings
        };
      }

      const updatedUser = await user.save();

      res.status(200).json({
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        mobileNumber: updatedUser.mobileNumber,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        aiUsageCount: updatedUser.aiUsageCount,
        lastAIUsedAt: updatedUser.lastAIUsedAt,
        lastLoginAt: updatedUser.lastLoginAt,
        bio: updatedUser.bio,
        location: updatedUser.location,
        socialLinks: updatedUser.socialLinks,
        address: updatedUser.address,
        smtpSettings: updatedUser.smtpSettings,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (user && (await bcrypt.compare(currentPassword, user.password))) {
      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();
      res.status(200).json({ message: "Password updated successfully" });
    } else {
      res.status(401).json({ message: "Invalid current password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    // Send email using our email service
    const resetUrl = `https://${req.get('host') === 'localhost:5000' ? 'localhost:5173' : req.get('host')}/reset-password/${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #4f46e5; text-align: center;">Password Reset Request</h2>
          <p>Hello ${user.name},</p>
          <p>We received a request to reset your password for your ClientScout account. Click the button below to set a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
          </div>
          <p>If you didn't request this, you can safely ignore this email. This link will expire in 1 hour.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #888; text-align: center;">ClientScout Team</p>
        </div>
      `,
    });

    res.status(200).json({ 
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Set new password
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
