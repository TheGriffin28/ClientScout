import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import axios from "axios";
import api from "../../services/api";
import { useUser } from "../../context/UserContext";

interface PendingVerification {
  userId: string;
  email: string;
}

export default function VerifyEmailOTPForm() {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useUser();

  useEffect(() => {
    const state = location.state as PendingVerification | null;
    if (state?.userId && state.email) {
      setUserId(state.userId);
      setEmail(state.email);
      return;
    }

    const stored = localStorage.getItem("pendingVerification");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as PendingVerification;
        if (parsed.userId && parsed.email) {
          setUserId(parsed.userId);
          setEmail(parsed.email);
        }
      } catch {
        localStorage.removeItem("pendingVerification");
      }
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!otp.trim()) {
      setError("Please enter the OTP");
      return;
    }

    if (!userId) {
      setError("Verification session expired. Please sign in again.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/verify-email", { userId, otp });
      const { token, ...userData } = response.data;

      if (!token) {
        setError("Verification failed. Please try again.");
        return;
      }

      localStorage.setItem("token", token);
      sessionStorage.removeItem("token");
      setUser(userData);
      localStorage.removeItem("pendingVerification");

      const redirectPath = userData.role === "admin" ? "/admin" : "/";
      setSuccess("Email verified successfully. Redirecting...");
      setTimeout(() => {
        navigate(redirectPath);
      }, 1500);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Invalid or expired OTP. Please try again.");
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const hasSession = Boolean(userId && email);

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Verify Email
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {hasSession
                ? `Enter the OTP sent to ${email} to verify your account.`
                : "Your verification session has expired. Please sign in again to request a new OTP."}
            </p>
          </div>
          <div>
            {error && (
              <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800">
                {error}
              </div>
            )}
            {success && (
              <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg dark:bg-green-200 dark:text-green-800">
                {success}
              </div>
            )}
            {hasSession ? (
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div>
                    <Label>
                      OTP <span className="text-error-500">*</span>{" "}
                    </Label>
                    <Input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Button className="w-full" disabled={loading} type="submit">
                      {loading ? "Verifying..." : "Verify Email"}
                    </Button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="mt-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Go back to{" "}
                  <Link
                    to="/signin"
                    className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Sign In
                  </Link>{" "}
                  to request a new OTP.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

