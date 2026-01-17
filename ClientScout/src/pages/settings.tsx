import { useState, useEffect } from "react";
import { useLocation } from "react-router";
import toast from "react-hot-toast";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import { useUser } from "../context/UserContext";
import api from "../services/api";

const Settings = () => {
  const { user, refreshUser } = useUser();
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

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setMobileNumber(user.mobileNumber || "");
      setBio(user.bio || "");
      setLocationState(user.location || "");
    }
  }, [user]);

  useEffect(() => {
    if (location.hash) {
      const tab = location.hash.replace("#", "");
      if (["profile", "account"].includes(tab)) {
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
        location: locationState 
      });
      await refreshUser();
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsUpdatingProfile(false);
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
        description="Manage your account settings and profile"
      />
      <PageBreadcrumb pageTitle="Settings" />

      <div className="rounded-xl border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-white/[0.03] md:p-6 xl:p-9">
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
              activeTab === "account"
                ? "border-b-2 border-primary text-primary dark:border-white dark:text-white"
                : "text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-white"
            }`}
            onClick={() => setActiveTab("account")}
          >
            Account Settings
          </button>
        </div>

        {activeTab === "profile" && (
          <form className="space-y-8" onSubmit={handleProfileUpdate}>
            {/* Profile Section */}
            <div>
              <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
                Profile Information
              </h2>

              {/* Name */}
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

              {/* Email */}
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

              {/* Bio */}
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

              {/* Location */}
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

            {/* Communication Section */}
            <div>
              <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
                Communication
              </h2>

              {/* WhatsApp */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-600 dark:text-gray-300">
                  WhatsApp Number
                </label>
                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                  This info will be used for outreach messages
                </p>
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

            {/* Save Button */}
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
              <div className="flex items-center gap-4 mt-2">
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
      </div>
    </>
  );
};

export default Settings;
