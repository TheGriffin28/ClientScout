import { useState, useEffect } from "react";
import { useLocation } from "react-router";
import toast from "react-hot-toast";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import { useUser } from "../context/UserContext";
import api from "../services/api";
import { ProfileSkeleton } from "../components/ui/Skeleton";
import {
  FaEnvelope,
  FaWhatsapp,
  FaKey,
  FaServer,
  FaCheckCircle,
  FaExternalLinkAlt,
  FaSync,
} from "react-icons/fa";

const Settings = () => {
  const { user, loading, refreshUser } = useUser();
  const [activeTab, setActiveTab] = useState("profile");
  const location = useLocation();

  // Profile State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [bio, setBio] = useState("");
  const [locationState, setLocationState] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Outreach Channels State (Gmail SMTP & WhatsApp API)
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");
  const [smtpFromName, setSmtpFromName] = useState("");
  const [smtpHost, setSmtpHost] = useState("smtp.gmail.com");
  const [smtpPort, setSmtpPort] = useState(465);

  const [whatsappApiUrl, setWhatsappApiUrl] = useState(
    "https://3bgvriotyazubuqc8a6sclta.140.238.254.100.sslip.io/api/send"
  );
  const [whatsappApiKey, setWhatsappApiKey] = useState("");

  const [isSavingOutreach, setIsSavingOutreach] = useState(false);
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [isTestingWhatsApp, setIsTestingWhatsApp] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setMobileNumber(user.mobileNumber || "");
      setBio(user.bio || "");
      setLocationState(user.location || "");

      // Outreach state
      setSmtpUser(user.smtpSettings?.user || user.email || "");
      setSmtpFromName(user.smtpSettings?.fromName || user.name || "");
      setSmtpHost(user.smtpSettings?.host || "smtp.gmail.com");
      setSmtpPort(user.smtpSettings?.port || 465);

      setWhatsappApiUrl(
        user.whatsappSettings?.apiUrl ||
          "https://3bgvriotyazubuqc8a6sclta.140.238.254.100.sslip.io/api/send"
      );
      setWhatsappApiKey(user.whatsappSettings?.apiKey || "");
    }
  }, [user]);

  useEffect(() => {
    if (location.hash) {
      const tab = location.hash.replace("#", "");
      if (["profile", "outreach", "account"].includes(tab)) {
        setActiveTab(tab);
      }
    }
  }, [location]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      await api.put("/auth/profile", {
        name,
        email,
        mobileNumber,
        bio,
        location: locationState,
      });
      await refreshUser();
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleOutreachSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingOutreach(true);
    try {
      await api.put("/auth/profile", {
        smtpSettings: {
          user: smtpUser,
          pass: smtpPass || undefined, // only update password if entered
          fromName: smtpFromName,
          host: smtpHost,
          port: Number(smtpPort),
        },
        whatsappSettings: {
          apiUrl: whatsappApiUrl,
          apiKey: whatsappApiKey || undefined,
        },
      });
      await refreshUser();
      setSmtpPass(""); // Clear password field after saving
      toast.success("Outreach channels configured successfully!");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to save outreach settings"
      );
    } finally {
      setIsSavingOutreach(false);
    }
  };

  const handleTestSmtp = async () => {
    setIsTestingSmtp(true);
    try {
      const res = await api.post("/auth/test-smtp", {
        smtpSettings: {
          user: smtpUser,
          pass: smtpPass || undefined,
          fromName: smtpFromName,
          host: smtpHost,
          port: Number(smtpPort),
        },
      });
      toast.success(res.data.message || "Test email sent to your inbox!");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "SMTP test failed. Please verify your 16-character App Password."
      );
    } finally {
      setIsTestingSmtp(false);
    }
  };

  const handleTestWhatsApp = async () => {
    setIsTestingWhatsApp(true);
    try {
      const res = await api.post("/auth/test-whatsapp", {
        phone: mobileNumber,
        whatsappSettings: {
          apiUrl: whatsappApiUrl,
          apiKey: whatsappApiKey || undefined,
        },
      });
      toast.success(
        res.data.message || "Test WhatsApp message sent to your phone!"
      );
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "WhatsApp test failed. Check API endpoint and key."
      );
    } finally {
      setIsTestingWhatsApp(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    setIsUpdatingPassword(true);
    try {
      await api.put("/auth/update-password", { currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Settings | ClientScout"
        description="Manage your account settings and outreach channels"
      />
      <PageBreadcrumb pageTitle="Settings" />

      <div className="rounded-xl border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-white/[0.03] md:p-6 xl:p-9">
        {loading ? (
          <ProfileSkeleton />
        ) : (
          <>
            <div className="mb-6 flex gap-4 border-b border-stroke dark:border-strokedark">
              <button
                className={`pb-2 text-sm font-medium transition-colors ${
                  activeTab === "profile"
                    ? "border-b-2 border-primary text-primary dark:border-white dark:text-white"
                    : "text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-white"
                }`}
                onClick={() => setActiveTab("profile")}
              >
                Edit Profile
              </button>
              <button
                className={`pb-2 text-sm font-medium transition-colors ${
                  activeTab === "outreach"
                    ? "border-b-2 border-primary text-primary dark:border-white dark:text-white"
                    : "text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-white"
                }`}
                onClick={() => setActiveTab("outreach")}
              >
                Outreach Channels (Gmail & WhatsApp)
              </button>
              <button
                className={`pb-2 text-sm font-medium transition-colors ${
                  activeTab === "account"
                    ? "border-b-2 border-primary text-primary dark:border-white dark:text-white"
                    : "text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-white"
                }`}
                onClick={() => setActiveTab("account")}
              >
                Account Settings
              </button>
            </div>

            {/* TAB: PROFILE */}
            {activeTab === "profile" && (
              <form className="space-y-8" onSubmit={handleProfileUpdate}>
                <div>
                  <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
                    Profile Information
                  </h2>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-600 dark:text-gray-300">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-strokedark dark:bg-boxdark dark:text-white"
                      required
                    />
                  </div>

                  <div className="mt-4">
                    <label className="mb-2 block text-sm font-medium text-gray-600 dark:text-gray-300">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-strokedark dark:bg-boxdark dark:text-white"
                      required
                    />
                  </div>

                  <div className="mt-4">
                    <label className="mb-2 block text-sm font-medium text-gray-600 dark:text-gray-300">
                      Bio
                    </label>
                    <input
                      type="text"
                      placeholder="Tell us about yourself"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-strokedark dark:bg-boxdark dark:text-white"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="mb-2 block text-sm font-medium text-gray-600 dark:text-gray-300">
                      Location / Address
                    </label>
                    <input
                      type="text"
                      placeholder="Your location"
                      value={locationState}
                      onChange={(e) => setLocationState(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-strokedark dark:bg-boxdark dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
                    Primary Phone Number
                  </h2>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-600 dark:text-gray-300">
                      Mobile Number
                    </label>
                    <input
                      type="text"
                      placeholder="+91XXXXXXXXXX"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-strokedark dark:bg-boxdark dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isUpdatingProfile ? "Saving..." : "Save Profile"}
                  </button>
                </div>
              </form>
            )}

            {/* TAB: OUTREACH CHANNELS */}
            {activeTab === "outreach" && (
              <form className="space-y-8" onSubmit={handleOutreachSave}>
                {/* SECTION 1: GMAIL SMTP */}
                <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-gray-900/40">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-3 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-red-100 p-2 text-red-600 dark:bg-red-950/50 dark:text-red-400">
                        <FaEnvelope className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-semibold text-gray-800 dark:text-white">
                          Gmail SMTP (Direct Cold Pitching)
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Emails to leads are sent directly from your verified Gmail address
                        </p>
                      </div>
                    </div>
                    {user?.smtpSettings?.hasPassword && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-950/60 dark:text-green-300">
                        <FaCheckCircle className="h-3 w-3" /> Configured
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Gmail Address
                      </label>
                      <input
                        type="email"
                        placeholder="you@gmail.com"
                        value={smtpUser}
                        onChange={(e) => setSmtpUser(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-strokedark dark:bg-boxdark dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Sender Display Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Saurav Pawar"
                        value={smtpFromName}
                        onChange={(e) => setSmtpFromName(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-strokedark dark:bg-boxdark dark:text-white"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <div className="flex items-center justify-between">
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Google 16-Character App Password
                        </label>
                        <a
                          href="https://myaccount.google.com/apppasswords"
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-xs text-blue-600 hover:underline dark:text-blue-400"
                        >
                          Generate App Password <FaExternalLinkAlt className="h-2.5 w-2.5" />
                        </a>
                      </div>
                      <input
                        type="password"
                        placeholder={
                          user?.smtpSettings?.hasPassword
                            ? "•••••••••••••••• (Leave blank to keep existing)"
                            : "Enter 16-character Google App Password (e.g. abcd efgh ijkl mnop)"
                        }
                        value={smtpPass}
                        onChange={(e) => setSmtpPass(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none dark:border-strokedark dark:bg-boxdark dark:text-white"
                      />
                      <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                        Note: Google requires a dedicated App Password instead of your regular Gmail login password. Enable 2-Step Verification on Google, then generate an App Password with app name &quot;ClientScout&quot;.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={handleTestSmtp}
                      disabled={isTestingSmtp || !smtpUser}
                      className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    >
                      <FaSync className={isTestingSmtp ? "animate-spin" : ""} />
                      {isTestingSmtp ? "Testing..." : "Send Test Email to Self"}
                    </button>
                  </div>
                </div>

                {/* SECTION 2: WHATSAPP API */}
                <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-gray-900/40">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-3 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-green-100 p-2 text-green-600 dark:bg-green-950/50 dark:text-green-400">
                        <FaWhatsapp className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-semibold text-gray-800 dark:text-white">
                          WhatsApp API (1-Click Outreach)
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Automated WhatsApp delivery with personalized pitch drafts
                        </p>
                      </div>
                    </div>
                    {user?.whatsappSettings?.hasApiKey && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-950/60 dark:text-green-300">
                        <FaCheckCircle className="h-3 w-3" /> API Key Configured
                      </span>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        API Endpoint URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://3bgvriotyazubuqc8a6sclta.140.238.254.100.sslip.io/api/send"
                        value={whatsappApiUrl}
                        onChange={(e) => setWhatsappApiUrl(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none dark:border-strokedark dark:bg-boxdark dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        API Key (x-api-key)
                      </label>
                      <input
                        type="text"
                        placeholder={
                          user?.whatsappSettings?.hasApiKey
                            ? "•••••••• (Configured - enter new key to override)"
                            : "Enter custom WhatsApp API key"
                        }
                        value={whatsappApiKey}
                        onChange={(e) => setWhatsappApiKey(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none dark:border-strokedark dark:bg-boxdark dark:text-white"
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Leave blank to use the shared system WhatsApp gateway.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={handleTestWhatsApp}
                      disabled={isTestingWhatsApp || !mobileNumber}
                      className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    >
                      <FaSync className={isTestingWhatsApp ? "animate-spin" : ""} />
                      {isTestingWhatsApp
                        ? "Testing..."
                        : `Send Test WhatsApp Ping to ${mobileNumber || "My Number"}`}
                    </button>
                  </div>
                </div>

                {/* SAVE BUTTON */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSavingOutreach}
                    className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSavingOutreach ? "Saving Channels..." : "Save Outreach Configuration"}
                  </button>
                </div>
              </form>
            )}

            {/* TAB: ACCOUNT */}
            {activeTab === "account" && (
              <div className="space-y-8">
                <form onSubmit={handlePasswordUpdate}>
                  <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
                    Change Password
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-600 dark:text-gray-300">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 dark:border-strokedark dark:bg-boxdark dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-600 dark:text-gray-300">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 dark:border-strokedark dark:bg-boxdark dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-600 dark:text-gray-300">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 dark:border-strokedark dark:bg-boxdark dark:text-white"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isUpdatingPassword}
                      className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isUpdatingPassword ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </form>

                <div>
                  <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
                    Notifications
                  </h2>
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      id="email_notif"
                      defaultChecked
                    />
                    <label
                      htmlFor="email_notif"
                      className="text-gray-600 dark:text-gray-300"
                    >
                      Receive email notifications
                    </label>
                  </div>
                  <div className="mt-2 flex items-center gap-4">
                    <input type="checkbox" className="h-4 w-4" id="sms_notif" />
                    <label
                      htmlFor="sms_notif"
                      className="text-gray-600 dark:text-gray-300"
                    >
                      Receive SMS notifications
                    </label>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Settings;
