import React, { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { adminService } from "../../services/adminService";
import { toast } from "react-hot-toast";
import InputField from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { FaEdit, FaSave, FaPlus, FaTrash } from "react-icons/fa";

// Default configuration mirroring the hardcoded values in PurchaseCredits.tsx
const DEFAULT_PRICING = {
  bundles: [
    {
      id: "bundle_starter",
      title: "Starter Bundle",
      price: 999,
      features: { email: 300, ai: 50, map: 50 },
      tag: "Highly Recommended",
      isPopular: true
    },
    {
      id: "bundle_growth",
      title: "Growth Bundle",
      price: 2499,
      features: { email: 1000, ai: 200, map: 300 },
      tag: "Best Value",
      isPopular: true
    }
  ],
  creditPacks: {
    email: [
      { name: "Starter", amount: 100, price: 299, tag: "Best for trial" },
      { name: "Popular", amount: 500, price: 999, tag: "Most Popular", isPopular: true, save: "Save 33%" },
      { name: "Pro", amount: 2000, price: 2999, tag: "Best Value", save: "Save 50%" }
    ],
    ai: [
      { name: "Trial", amount: 25, price: 199, tag: "Try AI" },
      { name: "Popular", amount: 100, price: 699, tag: "Most Popular", isPopular: true, save: "Save 12%" },
      { name: "Pro", amount: 500, price: 2499, tag: "Power Users", save: "Save 37%" }
    ],
    map: [
      { name: "Starter", amount: 50, price: 499, tag: "Local Biz" },
      { name: "Growth", amount: 200, price: 1499, tag: "Agency", isPopular: true, save: "Save 25%" },
      { name: "Scale", amount: 500, price: 2999, tag: "Enterprise", save: "Save 40%" }
    ]
  }
};

export default function AdminPricing() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pricing, setPricing] = useState(DEFAULT_PRICING);
  const [activeTab, setActiveTab] = useState<"bundles" | "email" | "ai" | "map">("bundles");

  useEffect(() => {
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    try {
      setLoading(true);
      const configs = await adminService.getConfigs();
      const pricingConfig = configs.find((c: any) => c.key === "pricing");
      if (pricingConfig && pricingConfig.value) {
        // Merge with default to ensure structure exists if new fields are added
        setPricing({ ...DEFAULT_PRICING, ...pricingConfig.value });
      }
    } catch (error) {
      console.error("Failed to fetch pricing config:", error);
      toast.error("Failed to load pricing configuration");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await adminService.updateConfig("pricing", pricing);
      toast.success("Pricing configuration saved successfully");
    } catch (error) {
      console.error("Failed to save pricing config:", error);
      toast.error("Failed to save pricing configuration");
    } finally {
      setSaving(false);
    }
  };

  const updateBundle = (index: number, field: string, value: any) => {
    const newBundles = [...pricing.bundles];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      newBundles[index] = {
        ...newBundles[index],
        [parent]: {
          ...newBundles[index][parent as keyof typeof newBundles[0]],
          [child]: value
        }
      };
    } else {
      newBundles[index] = { ...newBundles[index], [field]: value };
    }
    setPricing({ ...pricing, bundles: newBundles });
  };

  const updatePackage = (type: "email" | "ai" | "map", index: number, field: string, value: any) => {
    const newPacks = [...pricing.creditPacks[type]];
    newPacks[index] = { ...newPacks[index], [field]: value };
    setPricing({
      ...pricing,
      creditPacks: {
        ...pricing.creditPacks,
        [type]: newPacks
      }
    });
  };

  if (loading) {
    return <div className="p-6">Loading pricing configuration...</div>;
  }

  return (
    <>
      <PageMeta title="Manage Pricing | Admin" description="Manage credit packages and bundles" />
      <PageBreadcrumb pageTitle="Manage Pricing" />

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Pricing Configuration</h2>
            <p className="text-sm text-gray-500">Manage prices for bundles and credit packs</p>
          </div>
          <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
            <FaSave /> {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        <div className="flex border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
          {["bundles", "email", "ai", "map"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} {tab !== "bundles" ? "Credits" : ""}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === "bundles" && (
            <div className="space-y-8">
              {pricing.bundles.map((bundle, idx) => (
                <div key={idx} className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    Bundle #{idx + 1}
                    {bundle.isPopular && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Popular</span>}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                      label="Title"
                      type="text"
                      placeholder="Bundle Title"
                      value={bundle.title}
                      onChange={(e) => updateBundle(idx, "title", e.target.value)}
                    />
                    <InputField
                      label="Price (₹)"
                      type="number"
                      placeholder="999"
                      value={bundle.price}
                      onChange={(e) => updateBundle(idx, "price", Number(e.target.value))}
                    />
                    <InputField
                      label="Tag (Optional)"
                      type="text"
                      placeholder="Best Value"
                      value={bundle.tag || ""}
                      onChange={(e) => updateBundle(idx, "tag", e.target.value)}
                    />
                    <div className="grid grid-cols-3 gap-4">
                      <InputField
                        label="Email Credits"
                        type="number"
                        value={bundle.features.email}
                        onChange={(e) => updateBundle(idx, "features.email", Number(e.target.value))}
                      />
                      <InputField
                        label="AI Credits"
                        type="number"
                        value={bundle.features.ai}
                        onChange={(e) => updateBundle(idx, "features.ai", Number(e.target.value))}
                      />
                      <InputField
                        label="Map Credits"
                        type="number"
                        value={bundle.features.map}
                        onChange={(e) => updateBundle(idx, "features.map", Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {["email", "ai", "map"].includes(activeTab) && (
            <div className="space-y-6">
              {pricing.creditPacks[activeTab as "email" | "ai" | "map"].map((pkg, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex flex-col md:flex-row gap-4 items-start md:items-end">
                  <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <InputField
                      label="Package Name"
                      type="text"
                      value={pkg.name}
                      onChange={(e) => updatePackage(activeTab as any, idx, "name", e.target.value)}
                    />
                    <InputField
                      label="Credits Amount"
                      type="number"
                      value={pkg.amount}
                      onChange={(e) => updatePackage(activeTab as any, idx, "amount", Number(e.target.value))}
                    />
                    <InputField
                      label="Price (₹)"
                      type="number"
                      value={pkg.price}
                      onChange={(e) => updatePackage(activeTab as any, idx, "price", Number(e.target.value))}
                    />
                    <InputField
                      label="Savings Text"
                      type="text"
                      placeholder="Save 33%"
                      value={pkg.save || ""}
                      onChange={(e) => updatePackage(activeTab as any, idx, "save", e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
