const OTP = require('../models/OTP');
const twilio = require('twilio');
const nodemailer = require('nodemailer');

// Initialize Twilio client (for SMS) - only if configured
let twilioClient = null;
try {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
} catch (error) {
  console.log('⚠️ Twilio initialization failed:', error.message);
}

// Initialize Nodemailer transporter (for email) - only if configured
let emailTransporter = null;
try {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
} catch (error) {
  console.log('⚠️ Nodemailer initialization failed:', error.message);
}

class OTPService {
  // Generate a random 6-digit OTP
  static generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Create and save OTP to database
  static async createOTP(phone, email = null, type = 'registration', expiryMinutes = 10) {
    try {
      // Delete any existing unused OTPs for this phone/email and type
      await OTP.deleteMany({
        $or: [{ phone }, { email }],
        type,
        isUsed: false
      });

      const otp = this.generateOTP();
      const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

      const otpRecord = new OTP({
        phone,
        email,
        otp,
        type,
        expiresAt
      });

      await otpRecord.save();
      console.log(`📱 OTP created for ${phone}: ${otp} (expires in ${expiryMinutes} minutes)`);
      
      return otpRecord;
    } catch (error) {
      console.error('🚨 Error creating OTP:', error);
      throw new Error('Failed to create OTP');
    }
  }

  // Send OTP via SMS using Twilio
  static async sendOTPViaSMS(phone, otp, type = 'registration') {
    if (!twilioClient) {
      console.log('⚠️ Twilio not configured, skipping SMS send');
      return { success: false, message: 'SMS service not configured' };
    }

    try {
      const message = this.getSMSMessage(otp, type);
      
      const result = await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone
      });

      console.log(`📱 SMS sent to ${phone}: ${result.sid}`);
      return { success: true, messageId: result.sid };
    } catch (error) {
      console.error('🚨 Error sending SMS:', error);
      return { success: false, error: error.message };
    }
  }

  // Send OTP via Email using Nodemailer
  static async sendOTPViaEmail(email, otp, type = 'registration') {
    if (!emailTransporter) {
      console.log('⚠️ Email not configured, skipping email send');
      return { success: false, message: 'Email service not configured' };
    }

    try {
      const { subject, html } = this.getEmailContent(otp, type);
      
      const result = await emailTransporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject,
        html
      });

      console.log(`📧 Email sent to ${email}: ${result.messageId}`);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('🚨 Error sending email:', error);
      return { success: false, error: error.message };
    }
  }

  // Verify OTP
  static async verifyOTP(phone, email, otp, type = 'registration') {
    try {
      const otpRecord = await OTP.findOne({
        $or: [{ phone }, { email }],
        type,
        otp,
        isUsed: false
      }).sort({ createdAt: -1 });

      if (!otpRecord) {
        return { success: false, message: 'Invalid OTP' };
      }

      if (!otpRecord.canUse()) {
        if (otpRecord.isExpired()) {
          return { success: false, message: 'OTP has expired' };
        }
        if (otpRecord.attempts >= otpRecord.maxAttempts) {
          return { success: false, message: 'Too many attempts. Please request a new OTP' };
        }
        return { success: false, message: 'OTP already used' };
      }

      // Increment attempts
      await otpRecord.incrementAttempts();

      // Mark as used
      await otpRecord.markAsUsed();

      console.log(`✅ OTP verified for ${phone || email}`);
      return { success: true, message: 'OTP verified successfully' };
    } catch (error) {
      console.error('🚨 Error verifying OTP:', error);
      throw new Error('Failed to verify OTP');
    }
  }

  // Get SMS message content
  static getSMSMessage(otp, type) {
    const messages = {
      registration: `Your FixMyArea registration OTP is: ${otp}. Valid for 10 minutes. Do not share this OTP with anyone.`,
      login: `Your FixMyArea login OTP is: ${otp}. Valid for 10 minutes. Do not share this OTP with anyone.`,
      password_reset: `Your FixMyArea password reset OTP is: ${otp}. Valid for 10 minutes. Do not share this OTP with anyone.`
    };
    return messages[type] || messages.registration;
  }

  // Get email content
  static getEmailContent(otp, type) {
    const subjects = {
      registration: 'FixMyArea - Registration OTP',
      login: 'FixMyArea - Login OTP',
      password_reset: 'FixMyArea - Password Reset OTP'
    };

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">FixMyArea</h2>
        <h3>Your OTP Code</h3>
        <p>Your OTP code is: <strong style="font-size: 24px; color: #2563eb;">${otp}</strong></p>
        <p>This code is valid for 10 minutes.</p>
        <p><strong>Important:</strong> Do not share this OTP with anyone.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          If you didn't request this OTP, please ignore this email.
        </p>
      </div>
    `;

    return {
      subject: subjects[type] || subjects.registration,
      html
    };
  }

  // Check if user has recent OTP attempts (rate limiting)
  static async checkRateLimit(phone, email, type = 'registration', maxAttempts = 3, timeWindowMinutes = 15) {
    try {
      const timeWindow = new Date(Date.now() - timeWindowMinutes * 60 * 1000);
      
      const recentAttempts = await OTP.countDocuments({
        $or: [{ phone }, { email }],
        type,
        createdAt: { $gte: timeWindow }
      });

      return recentAttempts < maxAttempts;
    } catch (error) {
      console.error('🚨 Error checking rate limit:', error);
      return true; // Allow if check fails
    }
  }
}

module.exports = OTPService;
