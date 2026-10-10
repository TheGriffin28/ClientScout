import { useState, useEffect } from "react";
import PageMeta from "../components/common/PageMeta";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import { useUser } from "../context/UserContext";
import api from "../services/api";
import { adminService } from "../services/adminService";
import { toast } from "react-hot-toast";
import { FaEnvelope, FaRobot, FaMapMarkerAlt, FaFire, FaRocket } from "react-icons/fa";
import { Modal } from "../components/ui/modal";
import { QRCodeSVG } from "qrcode.react";

export default function PurchaseCredits() {
  const { user, refreshUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<{
    type: string;
    amount: number | string;
    price: number;
    name?: string;
    details?: string;
    bundleId?: string;
    bundleCredits?: { email: number; ai: number; map: number };
  } | null>(null);
  const [paymentMethod] = useState<"upi">("upi"); // Only UPI for now
  const [transactionId, setTransactionId] = useState("");
  const [qrCodePath, setQrCodePath] = useState<string>("");
  const [upiId, setUpiId] = useState<string>("");

  const [bundles, setBundles] = useState([
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
  ]);

  const [creditPacks, setCreditPacks] = useState({
    email: [
      { name: "Starter", amount: 100, price: 299, perCredit: 2.99, tag: "Best for trial" },
      { name: "Popular", amount: 500, price: 999, perCredit: 1.99, tag: "Most Popular", isPopular: true, save: "Save 33%" },
      { name: "Pro", amount: 2000, price: 2999, perCredit: 1.49, tag: "Best Value", save: "Save 50%" },
    ],
    ai: [
      { name: "Trial", amount: 25, price: 199, perCredit: 7.96, tag: "Try AI" },
      { name: "Popular", amount: 100, price: 699, perCredit: 6.99, tag: "Most Popular", isPopular: true, save: "Save 12%" },
      { name: "Pro", amount: 500, price: 2499, perCredit: 4.99, tag: "Power Users", save: "Save 37%" },
    ],
    map: [
      { name: "Starter", amount: 50, price: 399, perCredit: 7.98, tag: "Small search" },
      { name: "Popular", amount: 300, price: 1799, perCredit: 6.00, tag: "Most Popular", isPopular: true, save: "Save 25%" },
      { name: "Agency", amount: 1500, price: 6999, perCredit: 4.66, tag: "Agencies", save: "Save 42%" },
    ]
  });

  useEffect(() => {
    fetchPaymentConfig();
    fetchPricingConfig();
  }, []);

  const fetchPricingConfig = async () => {
    try {
      const configs = await adminService.getConfigs();
      const pricingConfig = configs.find((c: any) => c.key === "pricing");
      if (pricingConfig && pricingConfig.value) {
        if (pricingConfig.value.bundles) setBundles(pricingConfig.value.bundles);
        
        if (pricingConfig.value.creditPacks) {
          const processPacks = (packs: any[]) => packs.map((p: any) => ({
            ...p,
            perCredit: p.perCredit || (p.price / p.amount).toFixed(2)
          }));
          
          setCreditPacks({
            email: processPacks(pricingConfig.value.creditPacks.email || creditPacks.email),
            ai: processPacks(pricingConfig.value.creditPacks.ai || creditPacks.ai),
            map: processPacks(pricingConfig.value.creditPacks.map || creditPacks.map)
          });
        }
      }
    } catch {
      // Silent fail - stick to defaults
      console.log("Using default pricing (admin config not accessible)");
    }
  };

  const fetchPaymentConfig = async () => {
    try {
      const response = await api.get("/payment/config");
      if (response.data.upiQRCode) {
        setQrCodePath(response.data.upiQRCode);
      }
      if (response.data.upiId) {
        setUpiId(response.data.upiId);
      }
    } catch (error) {
      console.error("Failed to fetch payment config:", error);
    }
  };

  const baseURL = import.meta.env.VITE_API_BASE_URL?.replace("/api", "") || "";

  const handlePurchase = async () => {
    if (!selectedPackage) return;
    
    if (paymentMethod === "upi" && !transactionId.trim()) {
      toast.error("Please enter the Transaction ID");
      return;
    }

    setLoading(true);
    try {
      const isBundle = selectedPackage.type === "bundle" || selectedPackage.type.startsWith("bundle_");
      const purchaseData = isBundle
        ? {
            type: "bundle",
            bundleId: selectedPackage.bundleId || selectedPackage.type,
            bundleCredits: selectedPackage.bundleCredits,
            credits: selectedPackage.bundleCredits
              ? selectedPackage.bundleCredits.email +
                selectedPackage.bundleCredits.ai +
                selectedPackage.bundleCredits.map
              : 1,
            amount: selectedPackage.price,
            paymentMethod,
            transactionId,
          }
        : {
            type: selectedPackage.type,
            credits: typeof selectedPackage.amount === "number" ? selectedPackage.amount : 1,
            amount: selectedPackage.price,
            paymentMethod,
            transactionId,
          };

      await api.post("/payment/purchase", purchaseData);
      await refreshUser();
      if (paymentMethod === "upi") {
        toast.success("Payment submitted for verification. Credits will be added shortly.");
      } else {
        toast.success("Credits purchased successfully!");
      }
      setSelectedPackage(null);
      setTransactionId("");
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Purchase failed");
    } finally {
      setLoading(false);
    }
  };

  const CreditCard = ({ title, icon, description, type, current, packages, colorClass }: any) => (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 h-full flex flex-col">
      <div className="flex items-center gap-4 mb-4">
        <div className={`p-3 rounded-xl ${colorClass || "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"}`}>
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-500">Current Balance: {current || 0}</p>
        </div>
      </div>
      
      {description && (
        <div className="mb-6 px-3 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 text-center border border-gray-100 dark:border-gray-800">
          {description}
        </div>
      )}
      
      <div className="space-y-4 flex-1">
        {packages.map((pkg: any, idx: number) => (
          <div 
            key={idx} 
            className={`relative p-4 rounded-xl border transition-all ${
              pkg.isPopular 
                ? "border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/10 shadow-sm" 
                : "border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50"
            }`}
          >
            {pkg.tag && (
              <div className={`absolute -top-3 right-4 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                pkg.isPopular 
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md" 
                  : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
              }`}>
                {pkg.tag}
              </div>
            )}
            
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  {pkg.name}
                </h4>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ₹{pkg.price}
                  </p>
                  {pkg.save && (
                    <span className="text-[10px] font-bold text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-1.5 py-0.5 rounded-full">
                      {pkg.save}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  {pkg.amount}
                </span>
                <span className="block text-xs text-gray-500 uppercase">Credits</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
              <span className="text-xs font-medium text-gray-500">
                ₹{pkg.perCredit}/credit
              </span>
              <button
                onClick={() => setSelectedPackage({ ...pkg, type })}
                disabled={loading}
                className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                  pkg.isPopular
                    ? "text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20"
                    : "text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700"
                }`}
              >
                Choose
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const BundleCard = ({ title, price, features, type, tag, isPopular }: any) => (
    <div className={`relative rounded-2xl border p-6 shadow-sm h-full flex flex-col ${
      isPopular 
        ? "border-purple-200 bg-gradient-to-b from-purple-50/50 to-white dark:border-purple-900/50 dark:from-purple-900/10 dark:to-gray-900 dark:bg-gray-900" 
        : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
    }`}>
      {tag && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md flex items-center gap-1">
          <FaFire className="text-yellow-300" /> {tag}
        </div>
      )}

      <div className="text-center mb-6 mt-2">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-3xl font-bold text-gray-900 dark:text-white">₹{price}</span>
        </div>
      </div>

      <div className="space-y-4 flex-1 mb-6">
        <div className="p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-purple-100 dark:border-purple-900/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <FaEnvelope className="text-blue-500" /> Email Credits
            </span>
            <span className="font-bold text-gray-900 dark:text-white">{features.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <FaRobot className="text-purple-500" /> AI Credits
            </span>
            <span className="font-bold text-gray-900 dark:text-white">{features.ai}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <FaMapMarkerAlt className="text-red-500" /> Map Credits
            </span>
            <span className="font-bold text-gray-900 dark:text-white">{features.map}</span>
          </div>
        </div>
      </div>

      <button
        onClick={() =>
          setSelectedPackage({
            type: "bundle",
            bundleId: type,
            bundleCredits: { email: features.email, ai: features.ai, map: features.map },
            amount: `${features.email} Email + ${features.ai} AI + ${features.map} Map`,
            price: price,
            name: title,
            details: `Bundle: ${features.email} Email, ${features.ai} AI, ${features.map} Map`,
          })
        }
        disabled={loading}
        className="w-full py-3 text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/25 mb-6"
      >
        Get Bundle
      </button>

      {/* Trust Badges */}
      <div className="grid grid-cols-1 gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-400">
          <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center text-[10px]">✔</div>
          Secure UPI Payment
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-400">
          <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center text-[10px]">✔</div>
          Instant Credit Activation
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-400">
          <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center text-[10px]">✔</div>
          GST Invoice Available
        </div>
      </div>
    </div>
  );

  return (
    <>
      <PageMeta title="Purchase Credits | ClientScout" description="Buy extra credits" />
      <PageBreadcrumb pageTitle="Purchase Credits" />
      
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <FaRocket className="text-purple-500" /> Value Bundles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {bundles.map((bundle, idx) => (
            <BundleCard 
              key={idx}
              title={bundle.title} 
              price={bundle.price} 
              features={bundle.features}
              type={bundle.id || `bundle_${idx}`}
              tag={bundle.tag}
              isPopular={bundle.isPopular}
            />
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Individual Credit Packs</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CreditCard 
            title="Email Credits" 
            icon={<FaEnvelope size={24} />} 
            description="1 credit = 1 outreach email"
            type="email" 
            current={user?.extraEmailCredits}
            colorClass="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
            packages={creditPacks.email}
          />
          <CreditCard 
            title="AI Credits" 
            icon={<FaRobot size={24} />} 
            description="1 credit = analyze lead, AI drafts, or website mockup generation"
            type="ai" 
            current={user?.extraAICallsCredits}
            colorClass="bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
            packages={creditPacks.ai}
          />
          <CreditCard 
            title="Map Search Credits" 
            icon={<FaMapMarkerAlt size={24} />} 
            description="1 credit = 1 Google Maps business"
            type="map" 
            current={user?.extraMapSearchCredits}
            colorClass="bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
            packages={creditPacks.map}
          />
        </div>
      </div>

      <Modal 
        isOpen={!!selectedPackage} 
        onClose={() => setSelectedPackage(null)}
        title="Complete Purchase"
      >
        {selectedPackage && (
          <div className="space-y-4">
            {/* Header Summary */}
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex justify-between items-center">
               <div>
                  <span className="font-semibold text-gray-900 dark:text-white block">{selectedPackage.name}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {typeof selectedPackage.amount === 'string' ? selectedPackage.amount : `${selectedPackage.amount} Credits`}
                  </span>
               </div>
               <span className="text-lg font-bold text-blue-600">₹{selectedPackage.price}</span>
            </div>

            {paymentMethod === "upi" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                
                {/* Left Side: Scan */}
                <div className="flex flex-col items-center justify-center p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50">
                  <div className="bg-white p-2 inline-block rounded-lg shadow-sm mb-2">
                     {upiId ? (
                       <QRCodeSVG 
                         value={`upi://pay?pa=${upiId}&pn=ClientScout&am=${selectedPackage.price}&cu=INR`}
                         size={140}
                         level="H"
                         includeMargin={true}
                       />
                     ) : qrCodePath ? (
                       <img 
                         src={`${baseURL}${qrCodePath}`} 
                         alt="UPI QR Code" 
                         className="w-36 h-36 object-contain"
                       />
                     ) : (
                       <div className="w-36 h-36 bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                         [QR Code Not Uploaded]
                       </div>
                     )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-1">Scan with any UPI App</p>
                  <p className="font-mono text-xs font-bold text-gray-900 dark:text-white select-all bg-white dark:bg-gray-900 px-2 py-1 rounded border border-gray-200 dark:border-gray-700">
                    {upiId || "pay@clientscout"}
                  </p>
                </div>

                {/* Right Side: Details & Input */}
                <div className="flex flex-col justify-center space-y-4">
                  <div className="text-xs text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-2.5 rounded-lg border border-blue-100 dark:border-blue-800/30">
                     <b>Instructions:</b>
                     <ol className="list-decimal ml-4 mt-1 space-y-1">
                       <li>Scan QR code to pay <b>₹{selectedPackage.price}</b></li>
                       <li>Copy the <b>Transaction ID / UTR</b></li>
                       <li>Paste it below to activate credits</li>
                     </ol>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Transaction ID / UTR <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="e.g. 328491029384"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white transition-all font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setSelectedPackage(null)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePurchase}
                disabled={loading || (paymentMethod === "upi" && !transactionId)}
                className="flex-[2] px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 transition-all"
              >
                {loading ? "Verifying..." : "I Have Paid"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
