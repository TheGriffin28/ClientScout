import { sendEmail } from "../services/emailService.js";
import { generateAndSendOTP, verifyOTP } from "../utils/otpService.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import Config from "../models/Config.js";
import { logAdminAction } from "../utils/logger.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const formatUserResponse = async (user, includeToken = null) => {
  // Check and reset monthly usage if needed
  const today = new Date();
  let usageChanged = false;
  
  const isOldUsage = (lastDate) => {
    if (!lastDate) return false;
    const date = new Date(lastDate);
    return date.getMonth() !== today.getMonth() || date.getFullYear() !== today.getFullYear();
  };

  if (user.aiUsageCount > 0 && isOldUsage(user.lastAIUsedAt)) {
    user.aiUsageCount = 0;
    usageChanged = true;
  }
  
  if (user.mapSearchCount > 0 && isOldUsage(user.lastMapSearchAt)) {
    user.mapSearchCount = 0;
    usageChanged = true;
  }
  
  if (user.emailUsageCount > 0 && isOldUsage(user.lastEmailSentAt)) {
    user.emailUsageCount = 0;
    usageChanged = true;
  }
  
  if (usageChanged) {
    await user.save();
  }

  // Fetch global configs for limits
  const configs = await Config.find({ category: 'limits' });
  const getConfigValue = (key, defaultVal) => {
    const cfg = configs.find(c => c.key === key);
    return cfg && typeof cfg.value === 'number' ? cfg.value : defaultVal;
  };

  const response = {
    id: user._id,
    name: user.name,
    email: user.email,
    mobileNumber: user.mobileNumber,
    role: user.role,
    isActive: user.isActive,
    isVerified: user.isVerified,
    twoFactorEnabled: user.twoFactorEnabled,
    
    // Usage Stats
    aiUsageCount: user.aiUsageCount,
    lastAIUsedAt: user.lastAIUsedAt,
    maxMonthlyAICallsPerUser: typeof user.maxMonthlyAICallsPerUser === 'number' ? user.maxMonthlyAICallsPerUser : getConfigValue('maxMonthlyAICallsPerUser', 100),
    extraAICallsCredits: user.extraAICallsCredits,
    
    mapSearchCount: user.mapSearchCount,
    lastMapSearchAt: user.lastMapSearchAt,
    maxMonthlyMapSearchesPerUser: typeof user.maxMonthlyMapSearchesPerUser === 'number' ? user.maxMonthlyMapSearchesPerUser : getConfigValue('maxMonthlyMapSearchesPerUser', 100),
    extraMapSearchCredits: user.extraMapSearchCredits,
    
    emailUsageCount: user.emailUsageCount,
    lastEmailSentAt: user.lastEmailSentAt,
    maxMonthlyEmailsPerUser: typeof user.maxMonthlyEmailsPerUser === 'number' ? user.maxMonthlyEmailsPerUser : getConfigValue('maxMonthlyEmailsPerUser', 100),
    extraEmailCredits: user.extraEmailCredits,
    
    lastLoginAt: user.lastLoginAt,
    bio: user.bio,
    location: user.location,
    socialLinks: user.socialLinks,
    address: user.address,
  };

  if (includeToken) {
    response.token = includeToken;
  }

  return response;
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
    mobileNumber,
    isVerified: false, // New users are unverified until OTP is confirmed
  });

  // Generate and send OTP for email verification
  await generateAndSendOTP(user);

  // Log user signup
  await logAdminAction({
    action: "USER_SIGNUP",
    userId: user._id,
    details: { name: user.name, email: user.email }
  });

  // Notify admins about new user signup
  const admins = await User.find({ role: "admin" });
  for (const adminUser of admins) {
    await sendEmail({
      to: adminUser.email,
      subject: "New User Signup Notification",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #4f46e5; text-align: center;">New User Signup!</h2>
          <p>Hello Admin,</p>
          <p>A new user has just signed up on ClientScout:</p>
          <ul>
            <li><strong>Name:</strong> ${user.name}</li>
            <li><strong>Email:</strong> ${user.email}</li>
            <li><strong>Mobile Number:</strong> ${user.mobileNumber}</li>
            <li><strong>Signup Date:</strong> ${new Date(user.createdAt).toLocaleString()}</li>
          </ul>
          <p>Please review their account if necessary.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #888; text-align: center;">ClientScout Team</p>
        </div>
      `,
    });
  }

  res.status(201).json({
    message: "User registered successfully. Please verify your email with the OTP sent to your inbox.",
    userId: user._id,
    email: user.email,
  });
};

export const verifyUserEmail = async (req, res) => {
  const { userId, otp } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const verificationResult = await verifyOTP(user, otp);

    if (!verificationResult.success) {
      return res.status(400).json({ message: verificationResult.message });
    }

    user.isVerified = true;
    await user.save();

    // Generate token and log in the user automatically after verification
    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    const response = await formatUserResponse(user, token);
    res.status(200).json({
      message: "Email verified successfully. You are now logged in.",
      ...response
    });
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({ message: "Server error during email verification." });
  }
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

  if (!user.isVerified) {
    // If user is not verified, resend OTP and ask for verification
    await generateAndSendOTP(user);
    return res.status(403).json({ 
      message: "Your email is not verified. A new OTP has been sent to your email. Please verify to log in.",
      userId: user._id,
      email: user.email,
      requiresVerification: true
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // If 2FA is enabled, send OTP and require verification
  if (user.twoFactorEnabled) {
    await generateAndSendOTP(user);
    return res.status(200).json({
      message: "Two-factor authentication required. An OTP has been sent to your email.",
      userId: user._id,
      email: user.email,
      requiresTwoFactor: true
    });
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

  const response = await formatUserResponse(user, token);
  res.status(200).json({
    message: "Login successful",
    ...response
  });
};

export const verifyTwoFactor = async (req, res) => {
  const { userId, otp } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.twoFactorEnabled) {
      return res.status(400).json({ message: "Two-factor authentication is not enabled for this user." });
    }

    const verificationResult = await verifyOTP(user, otp);

    if (!verificationResult.success) {
      return res.status(400).json({ message: verificationResult.message });
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    const response = await formatUserResponse(user, token);
    res.status(200).json({
      message: "Two-factor authentication successful. You are now logged in.",
      ...response
    });
  } catch (error) {
    console.error("Error verifying two-factor authentication:", error);
    res.status(500).json({ message: "Server error during 2FA verification." });
  }
};

export const getMe = async (req, res) => {
  const response = await formatUserResponse(req.user);
  res.status(200).json(response);
};

export const updateProfile = async (req, res) => {
  const { name, email, mobileNumber, bio, location, socialLinks, address } = req.body;

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



      const updatedUser = await user.save();
      const response = await formatUserResponse(updatedUser);
      res.status(200).json(response);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const toggleTwoFactor = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.twoFactorEnabled = !user.twoFactorEnabled;
    await user.save();

    res.status(200).json({
      message: `Two-factor authentication ${user.twoFactorEnabled ? "enabled" : "disabled"} successfully.`,
      twoFactorEnabled: user.twoFactorEnabled,
    });
  } catch (error) {
    console.error("Error toggling 2FA:", error);
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
