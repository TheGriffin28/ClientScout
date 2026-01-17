import React, { useEffect, useState } from "react";
import PageBreadCrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { adminService } from "../../services/adminService";
import { toast } from "react-hot-toast";
import ComponentCard from "../../components/common/ComponentCard";

interface ConfigItem {
  key: string;
  value: any;
  description: string;
  category: string;
}

const AdminSettings: React.FC = () => {
  const [configs, setConfigs] = useState<ConfigItem[]>([]);
  const [loading, setLoading] = useState(true);

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
      await adminService.updateConfig(key, newValue);
      setConfigs(configs.map(c => c.key === key ? { ...c, value: newValue } : c));
      toast.success(`${key} updated`);
    } catch (error) {
      toast.error("Failed to update setting");
    }
  };

  const handleValueChange = async (key: string, newValue: any) => {
    try {
      await adminService.updateConfig(key, newValue);
      setConfigs(configs.map(c => c.key === key ? { ...c, value: newValue } : c));
      toast.success(`${key} updated`);
    } catch (error) {
      toast.error("Failed to update setting");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Admin Settings | ClientScout Admin"
        description="Manage platform configurations"
      />
      <PageBreadCrumb pageTitle="Admin Settings" />

      <div className="grid grid-cols-1 gap-6">
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
                    onChange={(e) => setConfigs(configs.map(c => c.key === config.key ? { ...c, value: parseInt(e.target.value) } : c))}
                    onBlur={(e) => handleValueChange(config.key, parseInt(e.target.value))}
                    className="w-24 bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </ComponentCard>
      </div>
    </>
  );
};

export default AdminSettings;
