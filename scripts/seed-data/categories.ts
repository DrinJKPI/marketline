// The store's categories, in menu order. Used by `npm run db:seed`, which
// adds each category's position (sortOrder) and image path.

export type SeedCategory = {
  slug: string;
  name: string;
  description: string;
};

export const seedCategories: SeedCategory[] = [
  {
    slug: "electronics",
    name: "Electronics",
    description: "TVs, headphones, speakers and cameras.",
  },
  {
    slug: "computers",
    name: "Computers",
    description: "Laptops, monitors, keyboards and storage.",
  },
  {
    slug: "mobile",
    name: "Phones & Wearables",
    description: "Smartphones, tablets, smartwatches and chargers.",
  },
  {
    slug: "home-kitchen",
    name: "Home & Kitchen",
    description: "Appliances, cookware and everything for the home.",
  },
  {
    slug: "fashion",
    name: "Fashion",
    description: "Clothing, shoes and bags for every day.",
  },
  {
    slug: "beauty",
    name: "Beauty & Care",
    description: "Skincare, grooming and fragrances.",
  },
  {
    slug: "sports",
    name: "Sports & Outdoors",
    description: "Fitness gear, camping and water sports.",
  },
  {
    slug: "toys",
    name: "Toys & Games",
    description: "Building sets, puzzles and games for all ages.",
  },
  {
    slug: "pets",
    name: "Pet Supplies",
    description: "Beds, toys and accessories for cats and dogs.",
  },
  {
    slug: "garden-diy",
    name: "Garden & DIY",
    description: "Tools, gardening and outdoor living.",
  },
];