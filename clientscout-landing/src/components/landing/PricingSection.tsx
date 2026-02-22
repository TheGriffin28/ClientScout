import { Check, Mail, MapPin, Bot, Zap, Shield, FileText } from 'lucide-react';

const PricingSection = () => {
  const bundles = [
    {
      name: "Starter Bundle",
      price: "₹999",
      tag: "HIGHLY RECOMMENDED",
      tagColor: "bg-pink-600 text-white",
      credits: [
        { icon: Mail, label: "Email Credits", count: 300 },
        { icon: Bot, label: "AI Credits", count: 50 },
        { icon: MapPin, label: "Map Credits", count: 50 },
      ],
      features: [
        { icon: Shield, text: "Secure UPI Payment" },
        { icon: Zap, text: "Instant Credit Activation" },
        { icon: FileText, text: "GST Invoice Available" },
      ],
      gradient: "from-blue-600 to-indigo-600",
      buttonGradient: "bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500",
    },
    {
      name: "Growth Bundle",
      price: "₹2499",
      tag: "BEST VALUE",
      tagColor: "bg-purple-600 text-white",
      credits: [
        { icon: Mail, label: "Email Credits", count: 1000 },
        { icon: Bot, label: "AI Credits", count: 200 },
        { icon: MapPin, label: "Map Credits", count: 300 },
      ],
      features: [
        { icon: Shield, text: "Secure UPI Payment" },
        { icon: Zap, text: "Instant Credit Activation" },
        { icon: FileText, text: "GST Invoice Available" },
      ],
      gradient: "from-purple-600 to-pink-600",
      buttonGradient: "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500",
    }
  ];

  const individualPacks = [
    {
      title: "Email Credits",
      icon: Mail,
      description: "1 credit = 1 outreach email",
      balanceText: "Current Balance: 100", // Placeholder context from screenshot
      color: "blue",
      tiers: [
        { name: "Starter", price: "₹299", credits: "100 CREDITS", perCredit: "₹2.99/credit", tag: "BEST FOR TRIAL" },
        { name: "Popular", price: "₹999", credits: "500 CREDITS", perCredit: "₹1.99/credit", save: "Save 33%", tag: "MOST POPULAR", highlight: true },
        { name: "Pro", price: "₹2999", credits: "2000 CREDITS", perCredit: "₹1.49/credit", save: "Save 50%", tag: "BEST VALUE" },
      ]
    },
    {
      title: "AI Credits",
      icon: Bot,
      description: "1 credit = 1 AI action (rewrite, pitch, audit)",
      balanceText: "Current Balance: 0",
      color: "purple",
      tiers: [
        { name: "Trial", price: "₹199", credits: "25 CREDITS", perCredit: "₹7.96/credit", tag: "TRY AI" },
        { name: "Popular", price: "₹699", credits: "100 CREDITS", perCredit: "₹6.99/credit", save: "Save 12%", tag: "MOST POPULAR", highlight: true },
        { name: "Pro", price: "₹2499", credits: "500 CREDITS", perCredit: "₹4.99/credit", save: "Save 37%", tag: "POWER USERS" },
      ]
    },
    {
      title: "Map Search Credits",
      icon: MapPin,
      description: "1 credit = 1 Google Maps business",
      balanceText: "Current Balance: 0",
      color: "red",
      tiers: [
        { name: "Starter", price: "₹399", credits: "50 CREDITS", perCredit: "₹7.98/credit", tag: "SMALL SEARCH" },
        { name: "Popular", price: "₹1799", credits: "300 CREDITS", perCredit: "₹6/credit", save: "Save 25%", tag: "MOST POPULAR", highlight: true },
        { name: "Agency", price: "₹6999", credits: "1500 CREDITS", perCredit: "₹4.66/credit", save: "Save 42%", tag: "AGENCIES" },
      ]
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-gray-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            No subscriptions. Pay only for what you use.
          </p>
        </div>
        
        {/* Value Bundles */}
        <div className="mb-24">
          <h3 className="text-2xl font-bold mb-8 flex items-center gap-2">
            <span className="text-purple-400">🚀</span> Value Bundles
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {bundles.map((bundle, index) => (
              <div key={index} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-1 relative hover:border-gray-600 transition-all duration-300">
                {/* Tag */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${bundle.tagColor}`}>
                    {bundle.tag}
                  </span>
                </div>

                <div className="bg-gray-900/90 rounded-xl p-8 h-full flex flex-col">
                  <div className="text-center mb-8 pt-4">
                    <h4 className="text-2xl font-bold mb-2">{bundle.name}</h4>
                    <div className="text-4xl font-extrabold">{bundle.price}</div>
                  </div>

                  <div className="space-y-4 mb-8 bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
                    {bundle.credits.map((credit, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-gray-300">
                          <credit.icon size={18} className="text-blue-400" />
                          <span>{credit.label}</span>
                        </div>
                        <span className="font-bold text-white">{credit.count}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 mb-8 flex-grow">
                    {bundle.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-green-400">
                        <Check size={16} />
                        <span>{feature.text}</span>
                      </div>
                    ))}
                  </div>

                  <a 
                    href="https://app.clientscout.xyz/signup" 
                    className={`block w-full py-4 rounded-xl text-center font-bold text-white transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 ${bundle.buttonGradient}`}
                  >
                    Get {bundle.name}
                  </a>
                  {index === 0 && (
                    <p className="text-center text-sm text-gray-400 mt-3 font-medium">
                      Most users start here
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Individual Credit Packs */}
        <div>
          <h3 className="text-2xl font-bold mb-8">Individual Credit Packs</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {individualPacks.map((pack, index) => (
              <div key={index} className="bg-gray-800/30 border border-gray-700 rounded-2xl p-6 hover:border-gray-600 transition-all">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-700">
                  <div className={`p-3 rounded-xl bg-gray-800 border border-gray-700 ${
                    pack.color === 'blue' ? 'text-blue-400' : 
                    pack.color === 'purple' ? 'text-purple-400' : 'text-red-400'
                  }`}>
                    <pack.icon size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{pack.title}</h4>
                    <p className="text-xs text-gray-400">{pack.description}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {pack.tiers.map((tier, idx) => (
                    <div key={idx} className={`relative p-4 rounded-xl border ${tier.highlight ? 'bg-gray-800/80 border-blue-500/50' : 'bg-gray-900/50 border-gray-700'}`}>
                      {tier.highlight && (
                        <div className="absolute -top-2.5 right-4 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                          {tier.tag}
                        </div>
                      )}
                      {!tier.highlight && tier.tag && (
                         <div className="absolute -top-2.5 right-4 bg-gray-700 text-gray-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                          {tier.tag}
                        </div>
                      )}
                      
                      <div className="flex justify-between items-end mb-2 pt-2">
                        <div>
                          <p className="font-bold text-sm text-gray-300">{tier.name}</p>
                          <div className="text-2xl font-bold text-white">{tier.price}</div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-white">{tier.credits}</p>
                          {tier.save && <p className="text-xs text-green-400 font-bold">{tier.save}</p>}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-700/50">
                        <span className="text-xs text-gray-500">{tier.perCredit}</span>
                        <a href="https://app.clientscout.xyz/signup" className="text-sm font-bold bg-gray-700 hover:bg-gray-600 text-white px-4 py-1.5 rounded-lg transition-colors">
                          Choose
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default PricingSection;
