// The store's starting products, six per category. Used by `npm run db:seed`,
// which adds the category, image path and date to each product.
// All brands and products are made up for this project.

export type SeedProduct = {
  slug: string;
  name: string;
  brand: string;
  description: string;
  priceCents: number; // 7999 = 79.99
  compareAtPriceCents?: number; // old price, for products on sale
  rating: number;
  reviewCount: number;
  stock: number;
  featured?: boolean;
  tags: string[];
};

// Keys are category slugs (see categories.ts).
export const seedProducts: Record<string, SeedProduct[]> = {
  electronics: [
    {
      slug: "wireless-earbuds-pro",
      name: "Wireless Earbuds Pro",
      brand: "Auralis",
      description:
        "True wireless earbuds with active noise cancelling, 30 hours of battery with the charging case and a water-resistant design for workouts.",
      priceCents: 7999,
      compareAtPriceCents: 9999,
      rating: 4.6,
      reviewCount: 1284,
      stock: 42,
      featured: true,
      tags: ["earbuds", "headphones", "bluetooth", "noise cancelling"],
    },
    {
      slug: "studio-over-ear-headphones",
      name: "Studio Over-Ear Headphones",
      brand: "Auralis",
      description:
        "Comfortable over-ear headphones with deep bass, a foldable frame and up to 40 hours of wireless listening.",
      priceCents: 12999,
      rating: 4.4,
      reviewCount: 652,
      stock: 18,
      tags: ["headphones", "bluetooth", "wireless"],
    },
    {
      slug: "55-inch-4k-smart-tv",
      name: '55" 4K Smart TV',
      brand: "Lumora",
      description:
        "A 55-inch 4K HDR television with built-in streaming apps, voice control and three HDMI ports.",
      priceCents: 54900,
      compareAtPriceCents: 64900,
      rating: 4.5,
      reviewCount: 873,
      stock: 9,
      tags: ["tv", "television", "4k", "smart tv", "hdr"],
    },
    {
      slug: "portable-bluetooth-speaker",
      name: "Portable Bluetooth Speaker",
      brand: "Auralis",
      description:
        "A rugged, waterproof speaker with 360° sound and 12 hours of playtime. Pair two for stereo.",
      priceCents: 4999,
      rating: 4.3,
      reviewCount: 2210,
      stock: 75,
      tags: ["speaker", "bluetooth", "waterproof"],
    },
    {
      slug: "mirrorless-camera-kit",
      name: "Mirrorless Camera Kit",
      brand: "Optiq",
      description:
        "A 24-megapixel mirrorless camera with a 15–45 mm lens, 4K video and fast autofocus for sharp shots on the move.",
      priceCents: 89900,
      rating: 4.7,
      reviewCount: 214,
      stock: 0,
      tags: ["camera", "photography", "mirrorless", "lens"],
    },
    {
      slug: "soundbar-with-subwoofer",
      name: "Soundbar with Wireless Subwoofer",
      brand: "Lumora",
      description:
        "Cinema-style sound for your TV: a slim soundbar with a wireless subwoofer and a dedicated dialogue mode.",
      priceCents: 27900,
      compareAtPriceCents: 32900,
      rating: 4.2,
      reviewCount: 389,
      stock: 14,
      tags: ["soundbar", "tv", "audio", "home cinema"],
    },
  ],

  computers: [
    {
      slug: "14-inch-ultrabook",
      name: '14" Ultrabook Laptop',
      brand: "Voltix",
      description:
        "A light 14-inch laptop with a 2.8K display, 16 GB of memory, a 512 GB SSD and all-day battery life.",
      priceCents: 109900,
      rating: 4.6,
      reviewCount: 512,
      stock: 12,
      featured: true,
      tags: ["laptop", "notebook", "ultrabook"],
    },
    {
      slug: "mechanical-keyboard",
      name: "Mechanical Keyboard",
      brand: "Keyforge",
      description:
        "A tenkeyless mechanical keyboard with hot-swappable switches, RGB lighting and a detachable USB-C cable.",
      priceCents: 8999,
      rating: 4.7,
      reviewCount: 1890,
      stock: 60,
      tags: ["keyboard", "mechanical", "rgb", "gaming"],
    },
    {
      slug: "ergonomic-wireless-mouse",
      name: "Ergonomic Wireless Mouse",
      brand: "Keyforge",
      description:
        "A sculpted mouse that supports your hand, with silent clicks, adjustable DPI and a rechargeable battery.",
      priceCents: 3999,
      compareAtPriceCents: 4999,
      rating: 4.5,
      reviewCount: 3120,
      stock: 140,
      tags: ["mouse", "wireless", "ergonomic"],
    },
    {
      slug: "27-inch-qhd-monitor",
      name: '27" QHD Monitor',
      brand: "Voltix",
      description:
        "A 27-inch QHD IPS monitor with a 144 Hz refresh rate, thin bezels and a height-adjustable stand.",
      priceCents: 27999,
      rating: 4.4,
      reviewCount: 701,
      stock: 23,
      tags: ["monitor", "display", "screen", "qhd"],
    },
    {
      slug: "portable-ssd-1tb",
      name: "Portable SSD 1 TB",
      brand: "Datanest",
      description:
        "Pocket-sized solid-state storage with transfer speeds up to 1,050 MB/s and a drop-resistant shell.",
      priceCents: 9999,
      compareAtPriceCents: 12999,
      rating: 4.8,
      reviewCount: 2405,
      stock: 88,
      tags: ["ssd", "storage", "external drive", "usb-c"],
    },
    {
      slug: "usb-c-docking-station",
      name: "USB-C Docking Station",
      brand: "Datanest",
      description:
        "Connect two monitors, ethernet, an SD card and five USB devices to your laptop through a single USB-C cable.",
      priceCents: 14999,
      rating: 4.1,
      reviewCount: 266,
      stock: 0,
      tags: ["dock", "hub", "usb-c", "laptop accessories"],
    },
  ],

  mobile: [
    {
      slug: "novaline-x-smartphone",
      name: "Novaline X Smartphone 128 GB",
      brand: "Novaline",
      description:
        "A 6.4-inch OLED smartphone with a triple camera, 5G and a battery that lasts a full day and more.",
      priceCents: 59900,
      compareAtPriceCents: 69900,
      rating: 4.5,
      reviewCount: 1033,
      stock: 31,
      featured: true,
      tags: ["phone", "smartphone", "android", "5g"],
    },
    {
      slug: "11-inch-tablet",
      name: '11" Tablet 64 GB',
      brand: "Novaline",
      description:
        "A slim 11-inch tablet with a sharp display and four speakers, made for streaming, reading and video calls.",
      priceCents: 32900,
      rating: 4.3,
      reviewCount: 488,
      stock: 19,
      tags: ["tablet", "android", "streaming"],
    },
    {
      slug: "fitness-smartwatch",
      name: "Fitness Smartwatch",
      brand: "Pulsewear",
      description:
        "Track workouts, heart rate and sleep with built-in GPS, a bright always-on display and up to 10 days of battery.",
      priceCents: 19900,
      rating: 4.4,
      reviewCount: 1567,
      stock: 47,
      tags: ["smartwatch", "fitness", "gps", "wearable"],
    },
    {
      slug: "fitness-tracker-band",
      name: "Fitness Tracker Band",
      brand: "Pulsewear",
      description:
        "A light, water-resistant band that counts steps, monitors sleep and shows notifications from your phone.",
      priceCents: 4999,
      compareAtPriceCents: 6999,
      rating: 4.0,
      reviewCount: 2980,
      stock: 120,
      tags: ["fitness tracker", "wearable", "steps"],
    },
    {
      slug: "20w-usb-c-charger",
      name: "20 W USB-C Fast Charger",
      brand: "Voltix",
      description:
        "A compact wall charger that charges compatible phones to 50% in about 30 minutes.",
      priceCents: 1999,
      rating: 4.6,
      reviewCount: 4210,
      stock: 300,
      tags: ["charger", "usb-c", "fast charging"],
    },
    {
      slug: "power-bank-20000mah",
      name: "Power Bank 20,000 mAh",
      brand: "Voltix",
      description:
        "Charge a phone up to four times, with two USB-C ports and a display that shows the remaining charge.",
      priceCents: 3999,
      rating: 4.5,
      reviewCount: 1755,
      stock: 4,
      tags: ["power bank", "battery", "portable charger"],
    },
  ],

  "home-kitchen": [
    {
      slug: "espresso-machine",
      name: "Espresso Machine with Milk Frother",
      brand: "Brewcraft",
      description:
        "A 15-bar espresso machine with a steam wand for lattes and cappuccinos and a removable 1.5 litre water tank.",
      priceCents: 24900,
      compareAtPriceCents: 29900,
      rating: 4.6,
      reviewCount: 932,
      stock: 16,
      featured: true,
      tags: ["coffee", "espresso", "kitchen appliance"],
    },
    {
      slug: "air-fryer-5l",
      name: "Air Fryer 5 L",
      brand: "Kettlewise",
      description:
        "Crispy results with little or no oil: eight presets, a dishwasher-safe basket and room for a family-sized meal.",
      priceCents: 8999,
      rating: 4.7,
      reviewCount: 3804,
      stock: 54,
      tags: ["air fryer", "kitchen appliance", "cooking"],
    },
    {
      slug: "glass-electric-kettle",
      name: "Glass Electric Kettle 1.7 L",
      brand: "Kettlewise",
      description:
        "Boils quickly with a soft blue glow, switches off automatically and has a keep-warm setting.",
      priceCents: 3499,
      rating: 4.4,
      reviewCount: 1290,
      stock: 80,
      tags: ["kettle", "tea", "kitchen"],
    },
    {
      slug: "cast-iron-casserole",
      name: "Cast Iron Casserole 24 cm",
      brand: "Nordhaus",
      description:
        "An enamelled cast iron pot for slow cooking, braising and baking, suitable for all hobs and the oven.",
      priceCents: 7999,
      rating: 4.8,
      reviewCount: 640,
      stock: 22,
      tags: ["cookware", "casserole", "cast iron"],
    },
    {
      slug: "cotton-bedding-set",
      name: "Cotton Bedding Set, Double",
      brand: "Nordhaus",
      description:
        "A soft, breathable 100% cotton duvet cover with two pillowcases, finished with hidden button fastening.",
      priceCents: 5999,
      compareAtPriceCents: 7999,
      rating: 4.3,
      reviewCount: 412,
      stock: 35,
      tags: ["bedding", "duvet cover", "bedroom"],
    },
    {
      slug: "robot-vacuum-cleaner",
      name: "Robot Vacuum Cleaner",
      brand: "Nordhaus",
      description:
        "Maps your home, cleans on a schedule and returns to its dock to recharge. Controlled from an app or by voice.",
      priceCents: 19900,
      rating: 4.2,
      reviewCount: 718,
      stock: 0,
      tags: ["vacuum", "robot", "cleaning", "smart home"],
    },
  ],

  fashion: [
    {
      slug: "classic-denim-jacket",
      name: "Classic Denim Jacket",
      brand: "Northbound",
      description:
        "A timeless denim jacket in a relaxed fit, made from sturdy cotton that softens with every wear.",
      priceCents: 6999,
      rating: 4.5,
      reviewCount: 845,
      stock: 40,
      featured: true,
      tags: ["jacket", "denim", "outerwear"],
    },
    {
      slug: "relaxed-linen-shirt",
      name: "Relaxed Linen Shirt",
      brand: "Linen & Loom",
      description:
        "A breathable linen shirt with a relaxed cut, perfect on warm days or layered over a T-shirt.",
      priceCents: 3999,
      compareAtPriceCents: 4999,
      rating: 4.3,
      reviewCount: 377,
      stock: 65,
      tags: ["shirt", "linen", "summer"],
    },
    {
      slug: "lightweight-running-shoes",
      name: "Lightweight Running Shoes",
      brand: "Stridewell",
      description:
        "Cushioned running shoes with a breathable mesh upper and a grippy outsole for road and treadmill.",
      priceCents: 8999,
      rating: 4.6,
      reviewCount: 2150,
      stock: 33,
      tags: ["shoes", "running", "trainers", "sneakers"],
    },
    {
      slug: "leather-backpack",
      name: "Leather Backpack",
      brand: "Northbound",
      description:
        "A full-grain leather backpack with a padded 15-inch laptop sleeve and plenty of pockets for the daily commute.",
      priceCents: 11900,
      rating: 4.7,
      reviewCount: 290,
      stock: 8,
      tags: ["backpack", "bag", "leather", "laptop bag"],
    },
    {
      slug: "merino-wool-scarf",
      name: "Merino Wool Scarf",
      brand: "Linen & Loom",
      description:
        "A warm, soft merino scarf that's light enough to wear every day from autumn to spring.",
      priceCents: 2999,
      rating: 4.4,
      reviewCount: 198,
      stock: 0,
      tags: ["scarf", "wool", "winter", "accessories"],
    },
    {
      slug: "canvas-low-top-sneakers",
      name: "Canvas Low-Top Sneakers",
      brand: "Stridewell",
      description:
        "Everyday sneakers with a cotton canvas upper, a cushioned insole and a classic rubber sole.",
      priceCents: 4999,
      compareAtPriceCents: 5999,
      rating: 4.2,
      reviewCount: 1340,
      stock: 95,
      tags: ["shoes", "sneakers", "canvas", "casual"],
    },
  ],

  beauty: [
    {
      slug: "vitamin-c-serum",
      name: "Vitamin C Serum 30 ml",
      brand: "Purelab",
      description:
        "A lightweight serum with 15% vitamin C that brightens the skin and evens out its tone.",
      priceCents: 2499,
      rating: 4.5,
      reviewCount: 2670,
      stock: 110,
      featured: true,
      tags: ["skincare", "serum", "vitamin c", "face"],
    },
    {
      slug: "hydrating-face-cream",
      name: "Hydrating Face Cream 50 ml",
      brand: "Purelab",
      description:
        "A rich but fast-absorbing cream with hyaluronic acid that keeps skin hydrated all day.",
      priceCents: 1999,
      rating: 4.4,
      reviewCount: 1488,
      stock: 76,
      tags: ["skincare", "moisturiser", "face cream"],
    },
    {
      slug: "sonic-electric-toothbrush",
      name: "Sonic Electric Toothbrush",
      brand: "Groomly",
      description:
        "Up to 31,000 strokes per minute, a two-minute timer and a travel case. One charge lasts three weeks.",
      priceCents: 5999,
      compareAtPriceCents: 7999,
      rating: 4.7,
      reviewCount: 3320,
      stock: 58,
      tags: ["toothbrush", "oral care", "electric"],
    },
    {
      slug: "ionic-hair-dryer",
      name: "Ionic Hair Dryer",
      brand: "Velvetine",
      description:
        "A powerful 2,000 W dryer with ionic technology for smooth, frizz-free hair and three heat settings.",
      priceCents: 4999,
      rating: 4.3,
      reviewCount: 905,
      stock: 27,
      tags: ["hair dryer", "hair care", "styling"],
    },
    {
      slug: "cordless-beard-trimmer",
      name: "Cordless Beard Trimmer",
      brand: "Groomly",
      description:
        "A cordless trimmer with 20 length settings, a precision guide and 90 minutes of runtime.",
      priceCents: 3499,
      rating: 4.5,
      reviewCount: 1902,
      stock: 3,
      tags: ["trimmer", "beard", "grooming"],
    },
    {
      slug: "amber-bloom-eau-de-parfum",
      name: "Amber Bloom Eau de Parfum 50 ml",
      brand: "Velvetine",
      description:
        "A warm floral fragrance with notes of jasmine, amber and vanilla that lasts from morning to evening.",
      priceCents: 6499,
      rating: 4.6,
      reviewCount: 433,
      stock: 41,
      tags: ["perfume", "fragrance", "eau de parfum"],
    },
  ],

  sports: [
    {
      slug: "non-slip-yoga-mat",
      name: "Non-Slip Yoga Mat 6 mm",
      brand: "Ironcore",
      description:
        "A cushioned, non-slip mat with alignment lines and a carrying strap, for yoga, pilates and floor workouts.",
      priceCents: 2999,
      rating: 4.6,
      reviewCount: 2045,
      stock: 130,
      featured: true,
      tags: ["yoga", "mat", "fitness", "exercise"],
    },
    {
      slug: "adjustable-dumbbells",
      name: "Adjustable Dumbbells 2 × 24 kg",
      brand: "Ironcore",
      description:
        "Replace fifteen pairs of weights: turn the dial to choose anything from 2.5 to 24 kg in seconds.",
      priceCents: 29900,
      compareAtPriceCents: 34900,
      rating: 4.7,
      reviewCount: 615,
      stock: 6,
      tags: ["dumbbells", "weights", "strength", "home gym"],
    },
    {
      slug: "hiking-backpack-40l",
      name: "Hiking Backpack 40 L",
      brand: "Trailpeak",
      description:
        "A ventilated trekking pack with a rain cover, an adjustable back system and a hydration sleeve.",
      priceCents: 8999,
      rating: 4.5,
      reviewCount: 588,
      stock: 28,
      tags: ["backpack", "hiking", "outdoor", "camping"],
    },
    {
      slug: "two-person-tent",
      name: "Two-Person Tent",
      brand: "Trailpeak",
      description:
        "A light, waterproof dome tent that pitches in five minutes and packs down to the size of a sleeping bag.",
      priceCents: 12900,
      rating: 4.3,
      reviewCount: 344,
      stock: 0,
      tags: ["tent", "camping", "outdoor"],
    },
    {
      slug: "insulated-water-bottle",
      name: "Insulated Water Bottle 750 ml",
      brand: "Aquaflow",
      description:
        "Keeps drinks cold for 24 hours or hot for 12. Stainless steel, leak-proof and BPA-free.",
      priceCents: 2499,
      rating: 4.8,
      reviewCount: 4120,
      stock: 200,
      tags: ["water bottle", "insulated", "stainless steel"],
    },
    {
      slug: "anti-fog-swim-goggles",
      name: "Anti-Fog Swim Goggles",
      brand: "Aquaflow",
      description:
        "Clear, anti-fog lenses with UV protection and a soft silicone seal that stays comfortable lap after lap.",
      priceCents: 1799,
      compareAtPriceCents: 2299,
      rating: 4.4,
      reviewCount: 1012,
      stock: 85,
      tags: ["swimming", "goggles", "pool"],
    },
  ],

  toys: [
    {
      slug: "space-station-building-set",
      name: "Space Station Building Set",
      brand: "Brickly",
      description:
        "A 780-piece building set with a rotating module, a docking shuttle and four astronaut figures. Ages 8+.",
      priceCents: 6999,
      rating: 4.8,
      reviewCount: 980,
      stock: 25,
      featured: true,
      tags: ["building blocks", "construction", "space", "kids"],
    },
    {
      slug: "wooden-train-set",
      name: "Wooden Train Set",
      brand: "Playnest",
      description:
        "A 50-piece wooden railway with bridges, a station and magnetic carriages. Ages 3+.",
      priceCents: 4499,
      rating: 4.7,
      reviewCount: 655,
      stock: 37,
      tags: ["train", "wooden toys", "toddler"],
    },
    {
      slug: "mountain-lake-jigsaw-puzzle",
      name: "Mountain Lake Jigsaw Puzzle, 1000 Pieces",
      brand: "Puzzlecraft",
      description:
        "A 1,000-piece puzzle of a mountain lake, with thick, snug-fitting pieces and a poster for reference.",
      priceCents: 1999,
      rating: 4.5,
      reviewCount: 742,
      stock: 64,
      tags: ["puzzle", "jigsaw", "family"],
    },
    {
      slug: "island-traders-board-game",
      name: "Island Traders Board Game",
      brand: "Puzzlecraft",
      description:
        "Trade, build and expand your settlements in this strategy game for 2–4 players. About 60 minutes. Ages 10+.",
      priceCents: 3999,
      compareAtPriceCents: 4499,
      rating: 4.6,
      reviewCount: 1203,
      stock: 45,
      tags: ["board game", "strategy", "family", "games night"],
    },
    {
      slug: "remote-control-off-road-car",
      name: "Remote Control Off-Road Car",
      brand: "Playnest",
      description:
        "A fast, shock-absorbing off-road car with a rechargeable battery and a 2.4 GHz remote. Ages 8+.",
      priceCents: 5499,
      rating: 4.2,
      reviewCount: 860,
      stock: 12,
      tags: ["rc car", "remote control", "outdoor"],
    },
    {
      slug: "soft-plush-teddy-bear",
      name: "Soft Plush Teddy Bear",
      brand: "Playnest",
      description:
        "An extra-soft 35 cm teddy bear with embroidered eyes, suitable from birth and machine washable.",
      priceCents: 2499,
      rating: 4.9,
      reviewCount: 1544,
      stock: 2,
      tags: ["teddy bear", "plush", "soft toy", "baby"],
    },
  ],

  pets: [
    {
      slug: "orthopedic-dog-bed",
      name: "Orthopedic Dog Bed, Medium",
      brand: "Pawsome",
      description:
        "A memory foam bed with raised edges and a removable, washable cover. Ideal for older dogs.",
      priceCents: 5999,
      compareAtPriceCents: 7499,
      rating: 4.6,
      reviewCount: 1320,
      stock: 30,
      featured: true,
      tags: ["dog", "bed", "orthopedic"],
    },
    {
      slug: "cat-scratching-tree",
      name: "Cat Scratching Tree",
      brand: "Tailwag",
      description:
        "A 120 cm tree with sisal posts, two platforms, a hideaway and hanging toys.",
      priceCents: 6999,
      rating: 4.4,
      reviewCount: 876,
      stock: 15,
      tags: ["cat", "scratching post", "cat tree"],
    },
    {
      slug: "automatic-pet-feeder",
      name: "Automatic Pet Feeder",
      brand: "Pawsome",
      description:
        "Schedules up to six meals a day with portion control, and plays a recorded message to call your pet.",
      priceCents: 7999,
      rating: 4.3,
      reviewCount: 512,
      stock: 0,
      tags: ["feeder", "cat", "dog", "smart home"],
    },
    {
      slug: "retractable-dog-lead",
      name: "Retractable Dog Lead 5 m",
      brand: "Tailwag",
      description:
        "A tangle-free 5 m lead with a one-button brake and lock and a comfortable grip. For dogs up to 25 kg.",
      priceCents: 1999,
      rating: 4.5,
      reviewCount: 2210,
      stock: 90,
      tags: ["dog", "lead", "leash", "walking"],
    },
    {
      slug: "durable-chew-toy-set",
      name: "Durable Chew Toy Set",
      brand: "Tailwag",
      description:
        "Five tough rubber and rope toys that help clean teeth and keep strong chewers busy.",
      priceCents: 1499,
      rating: 4.2,
      reviewCount: 1678,
      stock: 150,
      tags: ["dog", "toys", "chew"],
    },
    {
      slug: "self-cleaning-grooming-brush",
      name: "Self-Cleaning Grooming Brush",
      brand: "Pawsome",
      description:
        "Removes loose fur and tangles; one click retracts the bristles so the hair slides right off.",
      priceCents: 1299,
      rating: 4.7,
      reviewCount: 3890,
      stock: 175,
      tags: ["grooming", "brush", "cat", "dog"],
    },
  ],

  "garden-diy": [
    {
      slug: "18v-cordless-drill-set",
      name: "18 V Cordless Drill Set",
      brand: "Toolsmith",
      description:
        "A drill driver with two batteries, a fast charger and a 30-piece bit set, all in a sturdy case.",
      priceCents: 8999,
      compareAtPriceCents: 10999,
      rating: 4.7,
      reviewCount: 1450,
      stock: 26,
      featured: true,
      tags: ["drill", "power tools", "diy", "cordless"],
    },
    {
      slug: "household-tool-kit",
      name: "100-Piece Household Tool Kit",
      brand: "Toolsmith",
      description:
        "Everything for everyday repairs: hammer, screwdrivers, pliers, tape measure and more in a compact case.",
      priceCents: 4999,
      rating: 4.5,
      reviewCount: 980,
      stock: 44,
      tags: ["tools", "tool kit", "diy", "home repair"],
    },
    {
      slug: "expandable-garden-hose",
      name: "Expandable Garden Hose 30 m",
      brand: "Greenthumb",
      description:
        "A light hose that expands to 30 m when filled and shrinks back for storage, with an 8-pattern spray gun.",
      priceCents: 3499,
      rating: 4.1,
      reviewCount: 765,
      stock: 52,
      tags: ["hose", "garden", "watering"],
    },
    {
      slug: "raised-garden-bed",
      name: "Raised Garden Bed",
      brand: "Greenthumb",
      description:
        "A galvanised steel bed, 180 × 90 cm, for growing vegetables and herbs without bending down.",
      priceCents: 7999,
      rating: 4.4,
      reviewCount: 312,
      stock: 11,
      tags: ["garden bed", "planter", "vegetables", "outdoor"],
    },
    {
      slug: "solar-garden-lights",
      name: "Solar Garden Lights, Set of 8",
      brand: "Greenthumb",
      description:
        "Warm white path lights that charge in the sun and switch on automatically at dusk. No wiring needed.",
      priceCents: 2999,
      compareAtPriceCents: 3999,
      rating: 4.3,
      reviewCount: 1840,
      stock: 0,
      tags: ["lights", "solar", "garden", "outdoor lighting"],
    },
    {
      slug: "laser-distance-measure",
      name: "Laser Distance Measure 40 m",
      brand: "Toolsmith",
      description:
        "Measures distances up to 40 m to the millimetre and calculates area and volume at the push of a button.",
      priceCents: 3999,
      rating: 4.6,
      reviewCount: 640,
      stock: 37,
      tags: ["measure", "laser", "tools", "diy"],
    },
  ],
};
