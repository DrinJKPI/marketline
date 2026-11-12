// How categories and products look when there's no photo: an icon on a
// soft background colour. This is UI configuration, so it lives here and
// not in the database. A product without its own icon uses its category's.

import {
  Activity,
  AudioLines,
  Baby,
  Backpack,
  BatteryCharging,
  BedDouble,
  Bone,
  Bot,
  Brush,
  Camera,
  Car,
  Cat,
  Coffee,
  CookingPot,
  Dice5,
  Dog,
  Drill,
  Droplet,
  Droplets,
  Dumbbell,
  Flame,
  Flower2,
  Footprints,
  GlassWater,
  Hammer,
  HardDrive,
  Headphones,
  Keyboard,
  Laptop,
  Monitor,
  Mountain,
  Mouse,
  Package,
  PawPrint,
  PersonStanding,
  PlugZap,
  Puzzle,
  Rocket,
  Ruler,
  Scissors,
  Shirt,
  Smartphone,
  Smile,
  Snowflake,
  Soup,
  Sparkles,
  Speaker,
  Sprout,
  Sun,
  Tablet,
  Tent,
  TrainFront,
  Tv,
  Usb,
  UtensilsCrossed,
  Volume2,
  Watch,
  Waves,
  Wind,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export type Visual = {
  icon: LucideIcon;
  // Full class names, so Tailwind can find them when it scans this file.
  className: string;
};

const categoryVisuals: Record<string, Visual> = {
  electronics: { icon: Tv, className: "bg-sky-50 text-sky-600" },
  computers: { icon: Laptop, className: "bg-indigo-50 text-indigo-600" },
  mobile: { icon: Smartphone, className: "bg-violet-50 text-violet-600" },
  "home-kitchen": { icon: CookingPot, className: "bg-amber-50 text-amber-600" },
  fashion: { icon: Shirt, className: "bg-rose-50 text-rose-600" },
  beauty: { icon: Sparkles, className: "bg-pink-50 text-pink-600" },
  sports: { icon: Dumbbell, className: "bg-emerald-50 text-emerald-600" },
  toys: { icon: Puzzle, className: "bg-orange-50 text-orange-600" },
  pets: { icon: PawPrint, className: "bg-lime-50 text-lime-700" },
  "garden-diy": { icon: Hammer, className: "bg-teal-50 text-teal-600" },
};

const fallbackVisual: Visual = {
  icon: Package,
  className: "bg-slate-100 text-slate-500",
};

const productIcons: Record<string, LucideIcon> = {
  // Electronics
  "wireless-earbuds-pro": AudioLines,
  "studio-over-ear-headphones": Headphones,
  "55-inch-4k-smart-tv": Tv,
  "portable-bluetooth-speaker": Speaker,
  "mirrorless-camera-kit": Camera,
  "soundbar-with-subwoofer": Volume2,
  // Computers
  "14-inch-ultrabook": Laptop,
  "mechanical-keyboard": Keyboard,
  "ergonomic-wireless-mouse": Mouse,
  "27-inch-qhd-monitor": Monitor,
  "portable-ssd-1tb": HardDrive,
  "usb-c-docking-station": Usb,
  // Phones & Wearables
  "novaline-x-smartphone": Smartphone,
  "11-inch-tablet": Tablet,
  "fitness-smartwatch": Watch,
  "fitness-tracker-band": Activity,
  "20w-usb-c-charger": PlugZap,
  "power-bank-20000mah": BatteryCharging,
  // Home & Kitchen
  "espresso-machine": Coffee,
  "air-fryer-5l": CookingPot,
  "glass-electric-kettle": Flame,
  "cast-iron-casserole": Soup,
  "cotton-bedding-set": BedDouble,
  "robot-vacuum-cleaner": Bot,
  // Fashion
  "classic-denim-jacket": Shirt,
  "relaxed-linen-shirt": Shirt,
  "lightweight-running-shoes": Footprints,
  "leather-backpack": Backpack,
  "merino-wool-scarf": Snowflake,
  "canvas-low-top-sneakers": Footprints,
  // Beauty & Care
  "vitamin-c-serum": Droplet,
  "hydrating-face-cream": Droplets,
  "sonic-electric-toothbrush": Smile,
  "ionic-hair-dryer": Wind,
  "cordless-beard-trimmer": Scissors,
  "amber-bloom-eau-de-parfum": Flower2,
  // Sports & Outdoors
  "non-slip-yoga-mat": PersonStanding,
  "adjustable-dumbbells": Dumbbell,
  "hiking-backpack-40l": Mountain,
  "two-person-tent": Tent,
  "insulated-water-bottle": GlassWater,
  "anti-fog-swim-goggles": Waves,
  // Toys & Games
  "space-station-building-set": Rocket,
  "wooden-train-set": TrainFront,
  "mountain-lake-jigsaw-puzzle": Puzzle,
  "island-traders-board-game": Dice5,
  "remote-control-off-road-car": Car,
  "soft-plush-teddy-bear": Baby,
  // Pet Supplies
  "orthopedic-dog-bed": Dog,
  "cat-scratching-tree": Cat,
  "automatic-pet-feeder": UtensilsCrossed,
  "retractable-dog-lead": PawPrint,
  "durable-chew-toy-set": Bone,
  "self-cleaning-grooming-brush": Brush,
  // Garden & DIY
  "18v-cordless-drill-set": Drill,
  "household-tool-kit": Wrench,
  "expandable-garden-hose": Droplets,
  "raised-garden-bed": Sprout,
  "solar-garden-lights": Sun,
  "laser-distance-measure": Ruler,
};

export function getCategoryVisual(categorySlug: string): Visual {
  return categoryVisuals[categorySlug] ?? fallbackVisual;
}

export function getProductVisual(product: {
  slug: string;
  categorySlug: string;
}): Visual {
  const category = getCategoryVisual(product.categorySlug);
  return { ...category, icon: productIcons[product.slug] ?? category.icon };
}