import React, { useState, useEffect } from 'react';
import { validateField, getFieldError, hasFieldError } from '../utils/validation';

const OTPVerification = ({ 
  phone, 
  email, 
  type = 'registration', 
  onVerify, 
  onResend, 
  onCancel,
  isLoading = false 
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [errors, setErrors] = useState({});
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(false);

  // Countdown timer for resend button
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Clear error for this field
    setErrors(prev => ({ ...prev, otp: null }));

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '');
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      setErrors(prev => ({ ...prev, otp: null }));
    }
  };

  const handleVerify = () => {
    const otpString = otp.join('');
    
    console.log('🔍 OTP Verification Component - handleVerify called');
    console.log('🔢 OTP String:', otpString);
    console.log('📱 Phone:', phone);
    console.log('📧 Email:', email);
    console.log('🎯 onVerify function:', onVerify);
    
    // Test alert to see if function is called
    alert(`OTP Verification clicked! OTP: ${otpString}`);
    
    // Validate OTP - pass the fieldType as third parameter
    const otpError = validateField('otp', otpString, 'otp');
    console.log('🔍 OTP validation result:', otpError);
    
    if (otpError && otpError.length > 0) {
      console.log('❌ OTP validation error:', otpError);
      setErrors({ otp: otpError[0] }); // Take first error message
      return;
    }

    console.log('✅ OTP validation passed, calling onVerify...');
    onVerify(otpString);
  };

  const handleResend = async () => {
    setCanResend(false);
    setCountdown(60); // 60 seconds cooldown
    setOtp(['', '', '', '', '', '']);
    setErrors({});
    
    if (onResend) {
      await onResend();
    }
  };

  const isOtpComplete = otp.every(digit => digit !== '');

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-primary-900 mb-2">
          Verify Your {type === 'registration' ? 'Registration' : 'Login'}
        </h2>
        <p className="text-neutral-600">
          We've sent a 6-digit code to:
        </p>
        <p className="font-medium text-primary-700 mt-1">
          {phone}
          {email && (
            <>
              <br />
              {email}
            </>
          )}
        </p>
      </div>

      {/* OTP Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-neutral-700 mb-3">
          Enter 6-digit OTP
        </label>
        <div className="flex gap-2 justify-center">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className={`w-12 h-12 text-center text-lg font-semibold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                hasFieldError(errors, 'otp') 
                  ? 'border-danger-500' 
                  : 'border-neutral-300 focus:border-primary-500'
              }`}
              disabled={isLoading}
            />
          ))}
        </div>
        {hasFieldError(errors, 'otp') && (
          <p className="text-danger-500 text-sm mt-2 text-center">
            {getFieldError(errors, 'otp')}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={handleVerify}
          disabled={!isOtpComplete || isLoading}
          className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          title={`OTP Complete: ${isOtpComplete}, Loading: ${isLoading}`}
        >
          {isLoading ? 'Verifying...' : 'Verify OTP'}
        </button>
        <div className="text-xs text-gray-500 mt-2 text-center">
          Button State: OTP Complete: {isOtpComplete ? 'Yes' : 'No'}, Loading: {isLoading ? 'Yes' : 'No'}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleResend}
            disabled={!canResend || isLoading}
            className="flex-1 btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
          </button>

          {onCancel && (
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-4 text-center">
        <p className="text-sm text-neutral-500">
          Didn't receive the code? Check your spam folder or try resending.
        </p>
      </div>
    </div>
  );
};

export default OTPVerification;
