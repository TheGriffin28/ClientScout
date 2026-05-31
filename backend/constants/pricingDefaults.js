/** Default bundles — aligned with app + landing. Admin config key "pricing" can override. */
export const DEFAULT_BUNDLES = {
  bundle_starter: {
    id: "bundle_starter",
    title: "Starter Bundle",
    price: 999,
    credits: { email: 300, ai: 50, map: 50 },
  },
  bundle_growth: {
    id: "bundle_growth",
    title: "Growth Bundle",
    price: 2499,
    credits: { email: 1000, ai: 200, map: 300 },
  },
};

export function resolveBundleCredits(bundleId, bundleCreditsFromClient) {
  const known = DEFAULT_BUNDLES[bundleId];
  if (known) {
    return { ...known.credits };
  }
  if (
    bundleCreditsFromClient &&
    typeof bundleCreditsFromClient.email === "number" &&
    typeof bundleCreditsFromClient.ai === "number" &&
    typeof bundleCreditsFromClient.map === "number"
  ) {
    return {
      email: bundleCreditsFromClient.email,
      ai: bundleCreditsFromClient.ai,
      map: bundleCreditsFromClient.map,
    };
  }
  return null;
}

export function applyCreditsToUser(user, type, credits, bundleCredits) {
  if (type === "bundle" && bundleCredits) {
    user.extraEmailCredits = (user.extraEmailCredits || 0) + bundleCredits.email;
    user.extraAICallsCredits = (user.extraAICallsCredits || 0) + bundleCredits.ai;
    user.extraMapSearchCredits = (user.extraMapSearchCredits || 0) + bundleCredits.map;
    return;
  }
  if (type === "email") {
    user.extraEmailCredits = (user.extraEmailCredits || 0) + credits;
  } else if (type === "ai") {
    user.extraAICallsCredits = (user.extraAICallsCredits || 0) + credits;
  } else if (type === "map") {
    user.extraMapSearchCredits = (user.extraMapSearchCredits || 0) + credits;
  }
}

export function formatPackageLabel(type, credits, bundleCredits, bundleId) {
  if (type === "bundle" && bundleCredits) {
    const title = DEFAULT_BUNDLES[bundleId]?.title || bundleId || "Bundle";
    return `${title}: ${bundleCredits.email} Email, ${bundleCredits.ai} AI, ${bundleCredits.map} Map`;
  }
  if (type === "ai") return `${credits} AI Credits`;
  if (type === "map") return `${credits} Map Credits`;
  return `${credits} Email Credits`;
}
