
export type IndustryCategory =
  | "salon"
  | "dentist"
  | "gym"
  | "cafe"
  | "restaurant"
  | "realestate"
  | "healthcare"
  | "beauty"
  | "legal"
  | "fitness"
  | "education"
  | "ecommerce"
  | "tech"
  | "photography"
  | "petcare"
  | "automotive"
  | "travel"
  | "construction"
  | "architecture"
  | "consulting"
  | "marketing"
  | "accounting"
  | "default";

export interface ImageMood {
  colorMood: string;
  style: string;
  heroPrompt: string;
  stockImages: {
    hero: string;
    about: string;
    services: string[];
    gallery: string[];
  };
}

export const RELIABLE_FALLBACKS = {
  hero: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
  about: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=700&q=80",
  service1: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=700&q=80",
  service2: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=700&q=80",
  service3: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=700&q=80",
  service4: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=700&q=80",
  gallery1: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=700&q=80",
  gallery2: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=700&q=80",
  gallery3: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=700&q=80",
  gallery4: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=700&q=80",
};

const DEFAULT_IMAGE_MOOD: ImageMood = {
  colorMood: "neutral",
  style: "clean",
  heroPrompt:
    "Modern business interior, professional atmosphere, realistic photography, cinematic composition, premium website hero image",
  stockImages: {
    hero: RELIABLE_FALLBACKS.hero,
    about: RELIABLE_FALLBACKS.about,
    services: [
      RELIABLE_FALLBACKS.service1,
      RELIABLE_FALLBACKS.service2,
      RELIABLE_FALLBACKS.service3,
      RELIABLE_FALLBACKS.service4,
    ],
    gallery: [
      RELIABLE_FALLBACKS.gallery1,
      RELIABLE_FALLBACKS.gallery2,
      RELIABLE_FALLBACKS.gallery3,
      RELIABLE_FALLBACKS.gallery4,
    ],
  },
};

export const getSafeImage = (imageUrl: string, fallback: string): string => {
  if (!imageUrl) return fallback;
  return imageUrl;
};

const INDUSTRY_IMAGE_MOODS: Record<Exclude<IndustryCategory, "default">, ImageMood> = {
  salon: {
    colorMood: "warm",
    style: "luxury",
    heroPrompt:
      "Luxury modern salon interior, warm beige lighting, premium atmosphere, elegant mirrors, realistic photography, cinematic composition, modern business website hero image",
    stockImages: {
      hero: "https://images.pexels.com/photos/3985321/pexels-photo-3985321.jpeg?auto=compress&cs=tinysrgb&w=1200",
      about: "https://images.pexels.com/photos/3997379/pexels-photo-3997379.jpeg?auto=compress&cs=tinysrgb&w=700",
      services: [
        "https://images.pexels.com/photos/3993133/pexels-photo-3993133.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/3738349/pexels-photo-3738349.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/3992875/pexels-photo-3992875.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/3993444/pexels-photo-3993444.jpeg?auto=compress&cs=tinysrgb&w=700",
      ],
      gallery: [
        "https://images.pexels.com/photos/3993444/pexels-photo-3993444.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/3738345/pexels-photo-3738345.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/3738344/pexels-photo-3738344.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/3992901/pexels-photo-3992901.jpeg?auto=compress&cs=tinysrgb&w=700",
      ],
    },
  },
  dentist: {
    colorMood: "clean",
    style: "medical",
    heroPrompt:
      "Modern dental clinic interior, white and blue aesthetic, realistic healthcare environment, premium lighting, clean minimal composition, website hero image",
    stockImages: {
      hero: "https://images.pexels.com/photos/8376178/pexels-photo-8376178.jpeg?auto=compress&cs=tinysrgb&w=1200",
      about: "https://images.pexels.com/photos/3938022/pexels-photo-3938022.jpeg?auto=compress&cs=tinysrgb&w=700",
      services: [
        "https://images.pexels.com/photos/7659571/pexels-photo-7659571.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/4270359/pexels-photo-4270359.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/4386470/pexels-photo-4386470.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/4270373/pexels-photo-4270373.jpeg?auto=compress&cs=tinysrgb&w=700",
      ],
      gallery: [
        "https://images.pexels.com/photos/8460096/pexels-photo-8460096.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/3987386/pexels-photo-3987386.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/4270373/pexels-photo-4270373.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/8376176/pexels-photo-8376176.jpeg?auto=compress&cs=tinysrgb&w=700",
      ],
    },
  },
  gym: {
    colorMood: "dark",
    style: "energetic",
    heroPrompt:
      "Luxury modern gym interior, dark black and red aesthetic, cinematic lighting, energetic atmosphere, realistic fitness environment, premium website hero",
    stockImages: {
      hero: "https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=1200",
      about: "https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=700",
      services: [
        "https://images.pexels.com/photos/1431282/pexels-photo-1431282.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/6550828/pexels-photo-6550828.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/1431283/pexels-photo-1431283.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/1552104/pexels-photo-1552104.jpeg?auto=compress&cs=tinysrgb&w=700",
      ],
      gallery: [
        "https://images.pexels.com/photos/1552104/pexels-photo-1552104.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/7991669/pexels-photo-7991669.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/1552249/pexels-photo-1552249.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/1552241/pexels-photo-1552241.jpeg?auto=compress&cs=tinysrgb&w=700",
      ],
    },
  },
  cafe: {
    colorMood: "warm",
    style: "cozy",
    heroPrompt:
      "Cozy modern cafe interior, warm brown and beige lighting, comfortable atmosphere, realistic photography, cinematic composition, business website hero image",
    stockImages: {
      hero: "https://images.pexels.com/photos/374885/pexels-photo-374885.jpeg?auto=compress&cs=tinysrgb&w=1200",
      about: "https://images.pexels.com/photos/269075/pexels-photo-269075.jpeg?auto=compress&cs=tinysrgb&w=700",
      services: [
        "https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/4259688/pexels-photo-4259688.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/2253643/pexels-photo-2253643.jpeg?auto=compress&cs=tinysrgb&w=700",
      ],
      gallery: [
        "https://images.pexels.com/photos/2253643/pexels-photo-2253643.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/683039/pexels-photo-683039.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/374885/pexels-photo-374885.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/269075/pexels-photo-269075.jpeg?auto=compress&cs=tinysrgb&w=700",
      ],
    },
  },
  restaurant: {
    colorMood: "rich",
    style: "food photography",
    heroPrompt:
      "Elegant restaurant interior, warm ambient lighting, fine dining atmosphere, realistic photography, cinematic composition, premium restaurant website hero",
    stockImages: {
      hero: "https://images.pexels.com/photos/67468/pexels-photo-67468.jpeg?auto=compress&cs=tinysrgb&w=1200",
      about: "https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=700",
      services: [
        "https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/1398688/pexels-photo-1398688.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/262959/pexels-photo-262959.jpeg?auto=compress&cs=tinysrgb&w=700",
      ],
      gallery: [
        "https://images.pexels.com/photos/262959/pexels-photo-262959.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/3769138/pexels-photo-3769138.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/905847/pexels-photo-905847.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/1398688/pexels-photo-1398688.jpeg?auto=compress&cs=tinysrgb&w=700",
      ],
    },
  },
  realestate: {
    colorMood: "luxury",
    style: "modern interiors",
    heroPrompt:
      "Luxury modern home interior, premium real estate, elegant living space, realistic photography, cinematic composition, premium real estate website hero",
    stockImages: {
      hero: "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1200",
      about: "https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=700",
      services: [
        "https://images.pexels.com/photos/280229/pexels-photo-280229.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/439391/pexels-photo-439391.jpeg?auto=compress&cs=tinysrgb&w=700",
      ],
      gallery: [
        "https://images.pexels.com/photos/439391/pexels-photo-439391.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/271816/pexels-photo-271816.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/259580/pexels-photo-259580.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=700",
      ],
    },
  },
  healthcare: {
    colorMood: "clean",
    style: "medical",
    heroPrompt:
      "Modern healthcare clinic interior, clean white aesthetic, professional medical environment, premium lighting, website hero image",
    stockImages: {
      hero: "https://images.pexels.com/photos/1170979/pexels-photo-1170979.jpeg?auto=compress&cs=tinysrgb&w=1200",
      about: "https://images.pexels.com/photos/8376178/pexels-photo-8376178.jpeg?auto=compress&cs=tinysrgb&w=700",
      services: [
        "https://images.pexels.com/photos/3938022/pexels-photo-3938022.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/7659571/pexels-photo-7659571.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/4386470/pexels-photo-4386470.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/4270359/pexels-photo-4270359.jpeg?auto=compress&cs=tinysrgb&w=700",
      ],
      gallery: [
        "https://images.pexels.com/photos/4270359/pexels-photo-4270359.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/3987386/pexels-photo-3987386.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/8460096/pexels-photo-8460096.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/1170986/pexels-photo-1170986.jpeg?auto=compress&cs=tinysrgb&w=700",
      ],
    },
  },
  beauty: {
    colorMood: "warm",
    style: "luxury",
    heroPrompt:
      "Luxury beauty salon and spa interior, warm lighting, premium atmosphere, elegant decor, realistic photography, website hero image",
    stockImages: {
      hero: "https://images.pexels.com/photos/3985321/pexels-photo-3985321.jpeg?auto=compress&cs=tinysrgb&w=1200",
      about: "https://images.pexels.com/photos/3997379/pexels-photo-3997379.jpeg?auto=compress&cs=tinysrgb&w=700",
      services: [
        "https://images.pexels.com/photos/3993133/pexels-photo-3993133.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/3738349/pexels-photo-3738349.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/3992875/pexels-photo-3992875.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/3993444/pexels-photo-3993444.jpeg?auto=compress&cs=tinysrgb&w=700",
      ],
      gallery: [
        "https://images.pexels.com/photos/3993444/pexels-photo-3993444.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/3738345/pexels-photo-3738345.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/3738344/pexels-photo-3738344.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/3992901/pexels-photo-3992901.jpeg?auto=compress&cs=tinysrgb&w=700",
      ],
    },
  },
  legal: {
    colorMood: "neutral",
    style: "professional",
    heroPrompt:
      "Modern law office interior, professional atmosphere, elegant design, realistic photography, cinematic composition, law firm website hero",
    stockImages: {
      hero: "https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=1200",
      about: "https://images.pexels.com/photos/6077326/pexels-photo-6077326.jpeg?auto=compress&cs=tinysrgb&w=700",
      services: [
        "https://images.pexels.com/photos/7841856/pexels-photo-7841856.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/8112172/pexels-photo-8112172.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/5668859/pexels-photo-5668859.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/5668860/pexels-photo-5668860.jpeg?auto=compress&cs=tinysrgb&w=700",
      ],
      gallery: [
        "https://images.pexels.com/photos/5668860/pexels-photo-5668860.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/5668855/pexels-photo-5668855.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/5668856/pexels-photo-5668856.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/5668857/pexels-photo-5668857.jpeg?auto=compress&cs=tinysrgb&w=700",
      ],
    },
  },
  fitness: {
    colorMood: "dark",
    style: "energetic",
    heroPrompt:
      "Modern fitness gym interior, dynamic lighting, energetic atmosphere, realistic environment, premium fitness website hero",
    stockImages: {
      hero: "https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=1200",
      about: "https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=700",
      services: [
        "https://images.pexels.com/photos/1431282/pexels-photo-1431282.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/6550828/pexels-photo-6550828.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/1431283/pexels-photo-1431283.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/1552104/pexels-photo-1552104.jpeg?auto=compress&cs=tinysrgb&w=700",
      ],
      gallery: [
        "https://images.pexels.com/photos/1552104/pexels-photo-1552104.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/7991669/pexels-photo-7991669.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/1552249/pexels-photo-1552249.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/1552241/pexels-photo-1552241.jpeg?auto=compress&cs=tinysrgb&w=700",
      ],
    },
  },
  education: {
    colorMood: "bright",
    style: "academic",
    heroPrompt:
      "Modern educational institution interior, bright and clean, professional learning environment, realistic photography, school website hero",
    stockImages: {
      hero: "https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=1200",
      about: "https://images.pexels.com/photos/4145190/pexels-photo-4145190.jpeg?auto=compress&cs=tinysrgb&w=700",
      services: [
        "https://images.pexels.com/photos/6146931/pexels-photo-6146931.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/4778611/pexels-photo-4778611.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/374631/pexels-photo-374631.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/5212700/pexels-photo-5212700.jpeg?auto=compress&cs=tinysrgb&w=700",
      ],
      gallery: [
        "https://images.pexels.com/photos/5212700/pexels-photo-5212700.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/207691/pexels-photo-207691.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/159711/pexels-photo-159711.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/5212342/pexels-photo-5212342.jpeg?auto=compress&cs=tinysrgb&w=700",
      ],
    },
  },
  ecommerce: {
    colorMood: "vibrant",
    style: "modern retail",
    heroPrompt:
      "Modern retail store and ecommerce concept, clean organized space, professional atmosphere, online business website hero",
    stockImages: {
      hero: "https://images.pexels.com/photos/6169056/pexels-photo-6169056.jpeg?auto=compress&cs=tinysrgb&w=1200",
      about: "https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=700",
      services: [
        "https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/4484075/pexels-photo-4484075.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/3965545/pexels-photo-3965545.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/5624956/pexels-photo-5624956.jpeg?auto=compress&cs=tinysrgb&w=700",
      ],
      gallery: [
        "https://images.pexels.com/photos/5624956/pexels-photo-5624956.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/5632569/pexels-photo-5632569.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/4484606/pexels-photo-4484606.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/5632399/pexels-photo-5632399.jpeg?auto=compress&cs=tinysrgb&w=700",
      ],
    },
  },
  tech: {
    colorMood: "modern",
    style: "digital",
    heroPrompt:
      "Modern tech company office interior, clean and minimalist design, digital atmosphere, realistic photography, tech startup website hero",
    stockImages: {
      hero: "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1200",
      about: "https://images.pexels.com/photos/3861972/pexels-photo-3861972.jpeg?auto=compress&cs=tinysrgb&w=700",
      services: [
        "https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/1181672/pexels-photo-1181672.jpeg?auto=compress&cs=tinysrgb&w=700",
      ],
      gallery: [
        "https://images.pexels.com/photos/1181672/pexels-photo-1181672.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/3861964/pexels-photo-3861964.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/1181471/pexels-photo-1181471.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/3861961/pexels-photo-3861961.jpeg?auto=compress&cs=tinysrgb&w=700",
      ],
    },
  },
  photography: {
    colorMood: "creative",
    style: "artistic",
    heroPrompt: "Modern photography studio interior, creative lighting, artistic atmosphere, realistic photography, website hero",
    stockImages: {
      hero: "https://images.pexels.com/photos/6898851/pexels-photo-6898851.jpeg?auto=compress&cs=tinysrgb&w=1200",
      about: "https://images.pexels.com/photos/2123761/pexels-photo-2123761.jpeg?auto=compress&cs=tinysrgb&w=700",
      services: [
        "https://images.pexels.com/photos/2123784/pexels-photo-2123784.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/160013/pexels-photo-160013.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/6898849/pexels-photo-6898849.jpeg?auto=compress&cs=tinysrgb&w=700",
      ],
      gallery: [
        "https://images.pexels.com/photos/6898849/pexels-photo-6898849.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/160013/pexels-photo-160013.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/2123761/pexels-photo-2123761.jpeg?auto=compress&cs=tinysrgb&w=700",
      ],
    },
  },
  petcare: {
    colorMood: "warm",
    style: "friendly",
    heroPrompt: "Modern pet care salon and clinic interior, warm lighting, friendly atmosphere, realistic photography, pet business website hero",
    stockImages: {
      hero: "https://images.pexels.com/photos/1254140/pexels-photo-1254140.jpeg?auto=compress&cs=tinysrgb&w=1200",
      about: "https://images.pexels.com/photos/4587994/pexels-photo-4587994.jpeg?auto=compress&cs=tinysrgb&w=700",
      services: [
        "https://images.pexels.com/photos/164186/pexels-photo-164186.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/5733480/pexels-photo-5733480.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/1254140/pexels-photo-1254140.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/4587993/pexels-photo-4587993.jpeg?auto=compress&cs=tinysrgb&w=700",
      ],
      gallery: [
        "https://images.pexels.com/photos/4587993/pexels-photo-4587993.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/5733480/pexels-photo-5733480.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/164186/pexels-photo-164186.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/1254140/pexels-photo-1254140.jpeg?auto=compress&cs=tinysrgb&w=700",
      ],
    },
  },
  automotive: {
    colorMood: "modern",
    style: "sleek",
    heroPrompt: "Modern automotive workshop and showroom, professional atmosphere, sleek design, realistic photography, car business website hero",
    stockImages: {
      hero: "https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=1200",
      about: "https://images.pexels.com/photos/1335078/pexels-photo-1335078.jpeg?auto=compress&cs=tinysrgb&w=700",
      services: [
        "https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/248747/pexels-photo-248747.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=700",
      ],
      gallery: [
        "https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/1335078/pexels-photo-1335078.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/248747/pexels-photo-248747.jpeg?auto=compress&cs=tinysrgb&w=700",
      ],
    },
  },
  travel: {
    colorMood: "adventurous",
    style: "scenic",
    heroPrompt: "Luxury car rental and travel concept, premium luxury sedan or SUV on scenic highway, cinematic travel photography, modern travel agency website hero, premium atmosphere",
    stockImages: {
      hero: "https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg?auto=compress&cs=tinysrgb&w=1200",
      about: "https://images.pexels.com/photos/1335077/pexels-photo-1335077.jpeg?auto=compress&cs=tinysrgb&w=700",
      services: [
        "https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/3311574/pexels-photo-3311574.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/1005058/pexels-photo-1005058.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/209955/pexels-photo-209955.jpeg?auto=compress&cs=tinysrgb&w=700",
      ],
      gallery: [
        "https://images.pexels.com/photos/209955/pexels-photo-209955.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/1005058/pexels-photo-1005058.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/3311574/pexels-photo-3311574.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/1335077/pexels-photo-1335077.jpeg?auto=compress&cs=tinysrgb&w=700",
      ],
    },
  },
  construction: {
    colorMood: "industrial",
    style: "professional",
    heroPrompt: "Modern construction site and office, professional industrial atmosphere, realistic photography, construction business website hero",
    stockImages: {
      hero: "https://images.pexels.com/photos/15061664/pexels-photo-15061664.jpeg?auto=compress&cs=tinysrgb&w=1200",
      about: "https://images.pexels.com/photos/1051072/pexels-photo-1051072.jpeg?auto=compress&cs=tinysrgb&w=700",
      services: [
        "https://images.pexels.com/photos/1051072/pexels-photo-1051072.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/15061664/pexels-photo-15061664.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/15061662/pexels-photo-15061662.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/1051070/pexels-photo-1051070.jpeg?auto=compress&cs=tinysrgb&w=700",
      ],
      gallery: [
        "https://images.pexels.com/photos/1051070/pexels-photo-1051070.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/15061662/pexels-photo-15061662.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/15061664/pexels-photo-15061664.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/1051072/pexels-photo-1051072.jpeg?auto=compress&cs=tinysrgb&w=700",
      ],
    },
  },
  architecture: {
    colorMood: "modern",
    style: "minimalist",
    heroPrompt: "Modern architecture firm interior, minimalist design, professional atmosphere, realistic photography, architecture business website hero",
    stockImages: {
      hero: "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1200",
      about: "https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=700",
      services: [
        "https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/271816/pexels-photo-271816.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/439391/pexels-photo-439391.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/323777/pexels-photo-323777.jpeg?auto=compress&cs=tinysrgb&w=700",
      ],
      gallery: [
        "https://images.pexels.com/photos/323777/pexels-photo-323777.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/439391/pexels-photo-439391.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/271816/pexels-photo-271816.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg?auto=compress&cs=tinysrgb&w=700",
      ],
    },
  },
  consulting: {
    colorMood: "professional",
    style: "corporate",
    heroPrompt: "Modern consulting firm office interior, professional corporate atmosphere, realistic photography, consulting business website hero",
    stockImages: {
      hero: "https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=1200",
      about: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=700",
      services: [
        "https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/3184454/pexels-photo-3184454.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=700",
      ],
      gallery: [
        "https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/3184454/pexels-photo-3184454.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg?auto=compress&cs=tinysrgb&w=700",
      ],
    },
  },
  marketing: {
    colorMood: "vibrant",
    style: "creative",
    heroPrompt: "Modern marketing agency interior, vibrant creative atmosphere, realistic photography, marketing business website hero",
    stockImages: {
      hero: "https://images.pexels.com/photos/1181436/pexels-photo-1181436.jpeg?auto=compress&cs=tinysrgb&w=1200",
      about: "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=700",
      services: [
        "https://images.pexels.com/photos/3861972/pexels-photo-3861972.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/1181672/pexels-photo-1181672.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/3861964/pexels-photo-3861964.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/1181471/pexels-photo-1181471.jpeg?auto=compress&cs=tinysrgb&w=700",
      ],
      gallery: [
        "https://images.pexels.com/photos/1181471/pexels-photo-1181471.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/3861964/pexels-photo-3861964.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/1181672/pexels-photo-1181672.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/3861972/pexels-photo-3861972.jpeg?auto=compress&cs=tinysrgb&w=700",
      ],
    },
  },
  accounting: {
    colorMood: "professional",
    style: "corporate",
    heroPrompt: "Modern accounting firm office interior, professional corporate atmosphere, realistic photography, accounting business website hero",
    stockImages: {
      hero: "https://images.pexels.com/photos/53621/office-office-desk-pen-business-53621.jpeg?auto=compress&cs=tinysrgb&w=1200",
      about: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=700",
      services: [
        "https://images.pexels.com/photos/53621/office-office-desk-pen-business-53621.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/58495/pexels-photo-58495.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/53622/pexels-photo-53622.jpeg?auto=compress&cs=tinysrgb&w=700",
      ],
      gallery: [
        "https://images.pexels.com/photos/53622/pexels-photo-53622.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/58495/pexels-photo-58495.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=700",
        "https://images.pexels.com/photos/53621/office-office-desk-pen-business-53621.jpeg?auto=compress&cs=tinysrgb&w=700",
      ],
    },
  },
};

export const resolveIndustryCategory = (industry?: string, businessType?: string): IndustryCategory => {
  const text = `${industry || ""} ${businessType || ""}`.toLowerCase();
  if (/(salon|spa|beauty)/.test(text)) return "salon";
  if (/(dental|dentist)/.test(text)) return "dentist";
  if (/(gym|fitness|workout)/.test(text)) return "gym";
  if (/(cafe|coffee)/.test(text)) return "cafe";
  if (/(restaurant|food|bar|hotel|bakery)/.test(text)) return "restaurant";
  if (/(real estate|property|realtor|builder|construction)/.test(text)) return "realestate";
  if (/(health|clinic|doctor|hospital|medical)/.test(text)) return "healthcare";
  if (/(law|legal|attorney|advocate)/.test(text)) return "legal";
  if (/(school|college|academy|education|training|coaching)/.test(text)) return "education";
  if (/(ecommerce|e-commerce|retail|store|shop)/.test(text)) return "ecommerce";
  if (/(tech|software|it|saas|digital|marketing|agency)/.test(text)) return "tech";
  if (/(photography|photo|photographer)/.test(text)) return "photography";
  if (/(pet|dog|cat|animal|veterinary|vet)/.test(text)) return "petcare";
  if (/(car|auto|automotive|mechanic)/.test(text)) return "automotive";
  if (/(travel|tourism|trip|vacation|rent|rental)/.test(text)) return "travel";
  if (/(construction|builder|contractor)/.test(text)) return "construction";
  if (/(architecture|architect)/.test(text)) return "architecture";
  if (/(consulting|consultant)/.test(text)) return "consulting";
  if (/(accounting|accountant|bookkeeping|tax)/.test(text)) return "accounting";
  return "default";
};

export const getImageMood = (industry?: string, businessType?: string): ImageMood => {
  const category = resolveIndustryCategory(industry, businessType);
  if (category === "default") return DEFAULT_IMAGE_MOOD;
  return INDUSTRY_IMAGE_MOODS[category];
};

export const getAiHeroImageUrl = (prompt: string): string => {
  const encodedPrompt = encodeURIComponent(prompt);
  return `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodedPrompt}&image_size=landscape_16_9`;
};
