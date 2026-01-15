import { useState, useEffect } from "react";
import { useLocation } from "react-router";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const tab = location.hash.replace("#", "");
      if (["profile", "account"].includes(tab)) {
        setActiveTab(tab);
      }
    }
  }, [location]);

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
            className={`pb-2 text-sm font-medium ${
              activeTab === "profile"
                ? "border-b-2 border-primary text-primary"
                : "text-gray-500 hover:text-primary"
            }`}
            onClick={() => setActiveTab("profile")}
          >
            Edit Profile
          </button>
          <button
            className={`pb-2 text-sm font-medium ${
              activeTab === "account"
                ? "border-b-2 border-primary text-primary"
                : "text-gray-500 hover:text-primary"
            }`}
            onClick={() => setActiveTab("account")}
          >
            Account Settings
          </button>
        </div>

        {activeTab === "profile" && (
          <form className="space-y-8">
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
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-strokedark dark:bg-boxdark"
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
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-strokedark dark:bg-boxdark"
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
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-strokedark dark:bg-boxdark"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4">
              <button
                type="button"
                className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
              >
                Save Profile
              </button>
            </div>
          </form>
        )}

        {activeTab === "account" && (
          <div className="space-y-8">
             <div>
              <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
                Change Password
              </h2>
              <div className="space-y-4">
                <div>
                   <label className="mb-2 block text-sm font-medium text-gray-600 dark:text-gray-300">Current Password</label>
                   <input type="password" className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 dark:border-strokedark dark:bg-boxdark" />
                </div>
                <div>
                   <label className="mb-2 block text-sm font-medium text-gray-600 dark:text-gray-300">New Password</label>
                   <input type="password" className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 dark:border-strokedark dark:bg-boxdark" />
                </div>
                <div>
                   <label className="mb-2 block text-sm font-medium text-gray-600 dark:text-gray-300">Confirm New Password</label>
                   <input type="password" className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 dark:border-strokedark dark:bg-boxdark" />
                </div>
                <button className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700">Update Password</button>
              </div>
             </div>

             <div>
               <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
                 Notifications
               </h2>
               <div className="flex items-center gap-4">
                 <input type="checkbox" className="h-4 w-4" id="email_notif" defaultChecked />
                 <label htmlFor="email_notif" className="text-gray-600 dark:text-gray-300">Receive email notifications</label>
               </div>
               <div className="flex items-center gap-4 mt-2">
                 <input type="checkbox" className="h-4 w-4" id="sms_notif" />
                 <label htmlFor="sms_notif" className="text-gray-600 dark:text-gray-300">Receive SMS notifications</label>
               </div>
             </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Settings;
