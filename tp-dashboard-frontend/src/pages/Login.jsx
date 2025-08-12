import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import {
  Mail,
  Lock,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Loader,
  Shield,
  RefreshCw,
} from "lucide-react";

export default function Login() {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [otpInputs, setOtpInputs] = useState(["", "", "", "", "", ""]);
  const otpRefs = Array.from({ length: 6 }, () => useState(null));
  const navigate = useNavigate();
  const { login } = useAuth();

  // Timer for resend OTP
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(timer - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Helper for email validation
  const isTrustopayEmail = (email) => {
    return /^[^\s@]+@trustopay\.com$/.test(email);
  };

  const sendOTP = async (emailAddress) => {
    setLoading(true);
    setError("");
    try {
      if (!isTrustopayEmail(emailAddress)) {
        throw new Error("Please enter a valid email id");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailAddress }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to send OTP. Try again.");
      }

      setStep("otp");
      setTimer(300);
      setCanResend(false);
      setOtpAttempts(0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP using backend API
  const verifyOTP = async (otpCode) => {
    setLoading(true);
    setError("");

    try {
      // Check attempt limit
      if (otpAttempts >= 3) {
        throw new Error(
          "Too many incorrect attempts. Please request a new OTP."
        );
      }

      // OTP format validation
      if (!/^\d{6}$/.test(otpCode)) {
        setOtpAttempts((prev) => prev + 1);
        throw new Error("OTP must be exactly 6 digits");
      }

      // Simulate expired OTP
      if (timer === 0 && !canResend) {
        throw new Error("OTP has expired. Please request a new one.");
      }

      // Call backend API
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/auth/verify-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, otp: otpCode }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        setOtpAttempts((prev) => prev + 1);
        let errMsg = data.message || "Invalid OTP.";
        // If attempts exceeded
        if (otpAttempts + 1 >= 3) {
          errMsg = "Too many incorrect attempts. Please request a new OTP.";
        }
        throw new Error(errMsg);
      }

      setStep("success");
      // Use AuthContext login to update auth state and redirect
      login({ email: data.email, role: data.role }, () => {
        navigate("/");
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Email address is required");
      return;
    }
    sendOTP(email);
  };

  const handleOTPSubmit = (e) => {
    e.preventDefault();
    const otpValue = otpInputs.join("");
    if (!otpValue.trim()) {
      setError("Please enter the OTP");
      return;
    }
    if (otpValue.length !== 6) {
      setError("OTP must be exactly 6 digits");
      return;
    }
    setOtp(otpValue);
    verifyOTP(otpValue);
  };

  const handleResendOTP = () => {
    if (canResend) {
      setOtpAttempts(0);
      sendOTP(email);
    }
  };

  const handleBackToEmail = () => {
    setStep("email");
    setOtp("");
    setError("");
    setTimer(0);
    setCanResend(true);
    setOtpAttempts(0);
  };

  // OTP input change handler
  const handleOtpInputChange = (e, idx) => {
    const val = e.target.value.replace(/\D/g, "");
    if (!val) return;
    let newOtp = [...otpInputs];
    // If user pastes or types all 6 digits at once
    if (val.length === 6) {
      newOtp = val.split("").slice(0, 6);
      setOtpInputs(newOtp);
      setOtp(newOtp.join(""));
      // Focus last
      const lastRef = otpRefs[5][0];
      if (lastRef) lastRef.focus();
      return;
    }
    // Normal single digit
    newOtp[idx] = val[0];
    setOtpInputs(newOtp);
    setOtp(newOtp.join(""));
    // Move to next
    if (idx < 5 && val) {
      const nextRef = otpRefs[idx + 1][0];
      if (nextRef) nextRef.focus();
    }
  };

  // OTP input keydown handler
  const handleOtpKeyDown = (e, idx) => {
    if (e.key === "Backspace") {
      if (otpInputs[idx]) {
        // Just clear current
        const newOtp = [...otpInputs];
        newOtp[idx] = "";
        setOtpInputs(newOtp);
        setOtp(newOtp.join(""));
      } else if (idx > 0) {
        // Move to previous
        const prevRef = otpRefs[idx - 1][0];
        if (prevRef) prevRef.focus();
      }
    }
  };

  // OTP input paste handler
  const handleOtpPaste = (e) => {
    const val = e.clipboardData.getData("text").replace(/\D/g, "");
    if (val.length === 6) {
      const arr = val.split("").slice(0, 6);
      setOtpInputs(arr);
      setOtp(arr.join(""));
      // Focus last
      const lastRef = otpRefs[5][0];
      if (lastRef) lastRef.focus();
      e.preventDefault();
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen p-4 overflow-hidden bg-white">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating geometric shapes */}
        <div className="absolute w-8 h-8 rotate-45 border-2 border-purple-200 top-20 left-10 animate-float"></div>
        <div className="absolute w-6 h-6 bg-purple-100 rounded-full top-40 right-20 animate-float animation-delay-1000"></div>
        <div className="absolute w-4 h-4 border-2 border-purple-300 bottom-40 left-20 animate-float animation-delay-2000"></div>
        <div className="absolute w-10 h-10 border border-purple-200 rounded-full bottom-20 right-40 animate-float animation-delay-3000"></div>
        <div className="absolute w-5 h-5 bg-purple-200 top-60 left-1/3 animate-float animation-delay-4000"></div>
        <div className="absolute border-2 border-purple-100 top-32 right-1/3 w-7 h-7 rotate-12 animate-float animation-delay-5000"></div>
      </div>

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #ede7f6 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        ></div>
      </div>

      {/* Main login container */}
      <div className="relative z-10 w-full max-w-md">
        <div className="relative p-8 overflow-hidden bg-white border-2 border-purple-100 shadow-2xl rounded-3xl">
          {/* Top accent border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-purple-800"></div>

          {/* Header */}
          <div className="mb-8 text-center">
            <div className="relative flex items-center justify-center w-16 h-16 mx-auto mb-4 border-2 border-purple-200 rounded-full bg-purple-50">
              {step === "email" && <Mail className="w-8 h-8 text-purple-600" />}
              {step === "otp" && <Shield className="w-8 h-8 text-purple-600" />}
              {step === "success" && (
                <CheckCircle className="w-8 h-8 text-purple-600" />
              )}
              <div className="absolute inset-0 border-2 border-purple-300 rounded-full animate-ping opacity-20"></div>
            </div>
            <h1 className="mb-2 text-3xl font-bold text-gray-800">
              {step === "email" && "Welcome"}
              {step === "otp" && "Verify Your Email"}
              {step === "success" && "All Set!"}
            </h1>
            <p className="text-gray-600">
              {step === "email" &&
                "Enter your email to receive a secure verification code"}
              {step === "otp" && "We've sent a 6-digit code to your email"}
              {step === "success" &&
                "Login successful! Redirecting to your dashboard"}
            </p>
          </div>

          {/* Progress indicator */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-500 ${
                  step === "email"
                    ? "bg-purple-600 border-purple-600 text-white"
                    : "bg-green-500 border-green-500 text-white"
                }`}
              >
                <span className="text-sm font-semibold">1</span>
              </div>
              <div
                className={`w-16 h-1 rounded-full transition-all duration-500 ${
                  step !== "email" ? "bg-green-500" : "bg-purple-200"
                }`}
              ></div>
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-500 ${
                  step === "otp"
                    ? "bg-purple-600 border-purple-600 text-white"
                    : step === "success"
                    ? "bg-green-500 border-green-500 text-white"
                    : "bg-white border-purple-200 text-purple-300"
                }`}
              >
                <span className="text-sm font-semibold">2</span>
              </div>
              <div
                className={`w-16 h-1 rounded-full transition-all duration-500 ${
                  step === "success" ? "bg-green-500" : "bg-purple-200"
                }`}
              ></div>
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-500 ${
                  step === "success"
                    ? "bg-green-500 border-green-500 text-white"
                    : "bg-white border-purple-200 text-purple-300"
                }`}
              >
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-4 mb-6 border-l-4 border-red-400 rounded-lg bg-red-50 animate-shake">
              <div className="flex items-center">
                <AlertCircle className="flex-shrink-0 w-5 h-5 mr-3 text-red-400" />
                <div>
                  <p className="text-sm font-medium text-red-800">{error}</p>
                  {error.includes("attempt") && (
                    <p className="mt-1 text-xs text-red-600">
                      For security, you'll need to request a new OTP after 3
                      failed attempts.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Email Step */}
          {step === "email" && (
            <form className="space-y-6" onSubmit={handleEmailSubmit}>
              <div className="relative group">
                <Mail className="absolute w-5 h-5 text-purple-400 transition-colors duration-200 left-4 top-4 group-focus-within:text-purple-600" />
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  className="w-full py-4 pl-12 pr-4 text-gray-800 placeholder-purple-400 transition-all duration-300 border-2 border-purple-100 bg-purple-50 rounded-xl focus:outline-none focus:ring-0 focus:border-purple-600 focus:bg-white"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center w-full py-4 space-x-2 font-semibold text-white transition-all duration-300 transform bg-purple-600 shadow-lg hover:bg-purple-700 rounded-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none hover:shadow-xl"
              >
                {loading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <div className="text-center">
                <p className="text-sm text-gray-500">
                  We'll send you a secure 6-digit code to verify your email
                </p>
              </div>
            </form>
          )}

          {/* OTP Step */}
          {step === "otp" && (
            <form className="space-y-6" onSubmit={handleOTPSubmit}>
              <div className="mb-6 text-center">
                <p className="mb-2 font-medium text-purple-600">
                  Code sent to:
                </p>
                <p className="inline-block px-3 py-1 text-gray-700 rounded-lg bg-purple-50">
                  {email}
                </p>
              </div>

              {/* OTP input boxes */}
              <div
                className="flex justify-center gap-2"
                onPaste={handleOtpPaste}
              >
                {otpInputs.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => otpRefs[idx][1](el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpInputChange(e, idx)}
                    onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                    className="w-12 font-mono text-2xl text-center transition-all duration-200 border-2 border-purple-200 rounded-lg h-14 focus:border-purple-600 focus:outline-none bg-purple-50"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center w-full py-4 space-x-2 font-semibold text-white transition-all duration-300 transform bg-purple-600 shadow-lg hover:bg-purple-700 rounded-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none hover:shadow-xl"
              >
                {loading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Verify Code</span>
                    <CheckCircle className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Timer and resend */}
              <div className="space-y-3 text-center">
                <div className="flex items-center justify-center space-x-2">
                  {timer > 0 ? (
                    <>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                      <p className="text-sm text-purple-600">
                        Code expires in {Math.floor(timer / 60)}:
                        {(timer % 60).toString().padStart(2, "0")}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm font-medium text-red-500">
                      Code has expired
                    </p>
                  )}
                </div>

                <div>
                  <p className="mb-2 text-sm text-gray-500">
                    Didn't receive the code?
                  </p>
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={loading || !canResend}
                    className="flex items-center justify-center mx-auto space-x-1 text-sm font-medium text-purple-600 underline transition-colors duration-300 hover:text-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>{timer > 0 ? `Resend` : "Resend"}</span>
                  </button>
                </div>
              </div>

              {/* Back to email */}
              <button
                type="button"
                onClick={handleBackToEmail}
                className="w-full py-2 text-sm text-purple-600 transition-colors duration-300 border border-purple-200 rounded-lg hover:text-purple-700 hover:bg-purple-50"
              >
                ← Use a different email address
              </button>
            </form>
          )}

          {/* Success Step */}
          {step === "success" && (
            <div className="space-y-6 text-center">
              <div className="relative">
                <div className="flex items-center justify-center w-20 h-20 mx-auto bg-green-100 border-4 border-green-500 rounded-full animate-bounce">
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
                <div className="absolute inset-0 w-20 h-20 mx-auto border-4 border-green-300 rounded-full animate-ping opacity-20"></div>
              </div>
              <div>
                <h3 className="mb-2 text-2xl font-bold text-gray-800">
                  Login Successful!
                </h3>
                <p className="text-gray-600">
                  Welcome back! Redirecting to your dashboard...
                </p>
              </div>
              <div className="w-full h-2 bg-purple-100 rounded-full">
                <div
                  className="h-2 transition-all rounded-full bg-gradient-to-r from-purple-600 to-green-500 animate-pulse duration-2000"
                  style={{ width: "100%" }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(10deg);
          }
        }
        @keyanimations shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-3000 {
          animation-delay: 3s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animation-delay-5000 {
          animation-delay: 5s;
        }
      `}</style>
    </div>
  );
}
