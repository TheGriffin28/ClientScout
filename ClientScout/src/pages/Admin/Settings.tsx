import React, { useEffect, useState } from "react";
import PageBreadCrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { adminService } from "../../services/adminService";
import { toast } from "react-hot-toast";
import ComponentCard from "../../components/common/ComponentCard";
import { TableSkeleton } from "../../components/ui/Skeleton";

interface ConfigItem {
  key: string;
  value: any;
  description: string;
  category: string;
}

const AdminSettings: React.FC = () => {
  const [configs, setConfigs] = useState<ConfigItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const data = await adminService.getConfigs();
      setConfigs(data);
    } catch (error) {
      console.error("Failed to fetch configs:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key: string, currentValue: boolean) => {
    try {
      const newValue = !currentValue;
      setConfigs(configs.map(c => c.key === key ? { ...c, value: newValue } : c));
      await adminService.updateConfig(key, newValue);
      toast.success(`${key} updated`);
    } catch (error) {
      toast.error("Failed to update setting");
      fetchConfigs(); // Revert on error
    }
  };

  const handleValueChange = async (key: string, newValue: number) => {
    try {
      await adminService.updateConfig(key, newValue);
      toast.success(`${key} updated`);
    } catch (error) {
      toast.error("Failed to update setting");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await adminService.uploadQRCode(file);
      toast.success("QR Code uploaded successfully");
      
      // Update local state with new image path
      setConfigs(prev => {
        const existing = prev.find(c => c.key === "upiQRCode");
        if (existing) {
          return prev.map(c => c.key === "upiQRCode" ? { ...c, value: response.path } : c);
        } else {
          return [...prev, { 
            key: "upiQRCode", 
            value: response.path, 
            description: "UPI Payment QR Code Image Path", 
            category: "payment" 
          }];
        }
      });
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload QR code");
    } finally {
      setUploading(false);
    }
  };

  const handleTextChange = async (key: string, newValue: string) => {
    try {
        setConfigs(configs.map(c => c.key === key ? { ...c, value: newValue } : c));
        // We might want to debounce this or only save on blur/button click, but for simplicity:
        await adminService.updateConfig(key, newValue);
        toast.success(`${key} updated`);
    } catch (error) {
        toast.error("Failed to update setting");
    }
  };

  const qrCodeConfig = configs.find(c => c.key === "upiQRCode");
  const upiIdConfig = configs.find(c => c.key === "upiId");
  const baseURL = import.meta.env.VITE_API_BASE_URL.replace("/api", "");

  return (
    <>
      <PageMeta
        title="Admin Settings | ClientScout Admin"
        description="Manage platform configurations"
      />
      <PageBreadCrumb pageTitle="Admin Settings" />

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <TableSkeleton rows={8} cols={2} />
        ) : (
          <>
            <ComponentCard title="Payment Configuration">
              <div className="space-y-6">
                
                {/* UPI ID Input */}
                <div className="p-4 bg-gray-50 rounded-xl dark:bg-gray-800">
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        UPI ID (VPA)
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                        Enter your UPI ID (e.g., merchant@upi) to generate dynamic QR codes with amounts.
                    </p>
                    <div className="flex gap-4">
                        <input
                            type="text"
                            value={upiIdConfig?.value || ""}
                            onChange={(e) => setConfigs(configs.map(c => c.key === "upiId" ? { ...c, value: e.target.value } : c))}
                            onBlur={(e) => adminService.updateConfig("upiId", e.target.value).then(() => toast.success("UPI ID updated"))}
                            placeholder="example@upi"
                            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl dark:bg-gray-800">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">UPI QR Code Image (Legacy)</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Upload static QR Code image (fallback if VPA not set)</p>
                    
                    {qrCodeConfig?.value && (
                      <div className="mt-4">
                        <img 
                          src={`${baseURL}${qrCodeConfig.value}`} 
                          alt="Current QR Code" 
                          className="h-32 w-32 object-contain border border-gray-200 rounded-lg bg-white"
                        />
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <label className="block">
                      <span className="sr-only">Choose file</span>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100
                          disabled:opacity-50 disabled:cursor-not-allowed
                        "
                      />
                    </label>
                    {uploading && <p className="text-xs text-blue-600 mt-2">Uploading...</p>}
                  </div>
                </div>

                {/* Other Payment Configs */}
                {configs.filter(c => c.category === "payment" && !["upiId", "upiQRCode"].includes(c.key)).map((config) => (
                  <div key={config.key} className="p-4 bg-gray-50 rounded-xl dark:bg-gray-800">
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        {config.description}
                    </label>
                    <input
                        type="text"
                        value={config.value}
                        onChange={(e) => setConfigs(configs.map(c => c.key === config.key ? { ...c, value: e.target.value } : c))}
                        onBlur={(e) => handleTextChange(config.key, e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                ))}
              </div>
            </ComponentCard>

            <ComponentCard title="Feature Flags">
              <div className="space-y-6">
                {configs.filter(c => c.category === "features").map((config) => (
                  <div key={config.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl dark:bg-gray-800">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{config.key}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{config.description}</p>
                    </div>
                    <div className="flex items-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={config.value} 
                          onChange={() => handleToggle(config.key, config.value)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </ComponentCard>

            <ComponentCard title="Platform Limits">
              <div className="space-y-6">
                {configs.filter(c => c.category === "limits").map((config) => (
                  <div key={config.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl dark:bg-gray-800">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{config.key}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{config.description}</p>
                    </div>
                    <div className="ml-4">
                      <input
                        type="number"
                        value={config.value}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setConfigs(configs.map(c => c.key === config.key ? { ...c, value: isNaN(val) ? 0 : val } : c));
                        }}
                        onBlur={(e) => {
                          const val = parseInt(e.target.value);
                          handleValueChange(config.key, isNaN(val) ? 0 : val);
                        }}
                        className="w-24 bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </ComponentCard>
          </>
        )}
      </div>
    </>
  );
};

export default AdminSettings;
