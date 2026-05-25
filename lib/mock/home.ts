export type HomeProduct = {
  id: string;
  name: string;
  category: string;
  image: string;
  price: number;
  discount?: number;
  stock: number;
  status?: "sale" | "hot";
};

export type HomeCategory = {
  id: string;
  title: string;
  image: string;
  productCount: number;
};

export type HomeBrand = {
  id: string;
  title: string;
  image: string;
};

export type HomeBlog = {
  id: string;
  title: string;
  category: string;
  image: string;
  date: string;
};

export const headerLinks = [
  { title: "Home", href: "/" },
  { title: "Shop", href: "/shop" },
  { title: "Blog", href: "#blog" },
  { title: "Hot Deal", href: "#products" },
];

export const productTabs = ["Gadget", "Appliances", "Refrigerators", "Others"];

export const products: HomeProduct[] = [
  {
    id: "product-1",
    name: "Wireless Bluetooth Headphones",
    category: "Gadget",
    image: "/shopcartyt/images/products/product_1.png",
    price: 120,
    discount: 15,
    stock: 24,
    status: "sale",
  },
  {
    id: "product-2",
    name: "Smart Watch Ultra Series",
    category: "Gadget",
    image: "/shopcartyt/images/products/product_3.png",
    price: 210,
    discount: 8,
    stock: 18,
    status: "hot",
  },
  {
    id: "product-3",
    name: "Portable Speaker Mini",
    category: "Gadget",
    image: "/shopcartyt/images/products/product_4.png",
    price: 89,
    discount: 10,
    stock: 32,
  },
  {
    id: "product-4",
    name: "Kitchen Blender Pro",
    category: "Appliances",
    image: "/shopcartyt/images/products/product_8.png",
    price: 145,
    stock: 14,
    status: "sale",
  },
  {
    id: "product-5",
    name: "Double Door Refrigerator",
    category: "Refrigerators",
    image: "/shopcartyt/images/products/product_11.png",
    price: 899,
    discount: 12,
    stock: 9,
  },
  {
    id: "product-6",
    name: "Air Conditioner Smart Inverter",
    category: "Appliances",
    image: "/shopcartyt/images/products/product_14.png",
    price: 720,
    stock: 11,
    status: "hot",
  },
  {
    id: "product-7",
    name: "Gaming Keyboard RGB",
    category: "Gadget",
    image: "/shopcartyt/images/products/product_17.png",
    price: 75,
    discount: 7,
    stock: 40,
  },
  {
    id: "product-8",
    name: "Modern Microwave Oven",
    category: "Appliances",
    image: "/shopcartyt/images/products/product_20.png",
    price: 310,
    discount: 5,
    stock: 16,
  },
  {
    id: "product-9",
    name: "Compact Coffee Maker",
    category: "Others",
    image: "/shopcartyt/images/products/product_22.png",
    price: 165,
    stock: 0,
  },
  {
    id: "product-10",
    name: "Home Cleaning Vacuum",
    category: "Others",
    image: "/shopcartyt/images/products/product_23.png",
    price: 255,
    discount: 18,
    stock: 20,
    status: "sale",
  },
];

export const categories: HomeCategory[] = [
  {
    id: "cat-1",
    title: "Mobiles",
    image: "/shopcartyt/images/products/product_2.jpg",
    productCount: 26,
  },
  {
    id: "cat-2",
    title: "Appliances",
    image: "/shopcartyt/images/products/product_8.png",
    productCount: 41,
  },
  {
    id: "cat-3",
    title: "Smartphones",
    image: "/shopcartyt/images/products/product_5.png",
    productCount: 18,
  },
  {
    id: "cat-4",
    title: "Air Conditioners",
    image: "/shopcartyt/images/products/product_14.png",
    productCount: 11,
  },
  {
    id: "cat-5",
    title: "Washing Machine",
    image: "/shopcartyt/images/products/product_16.png",
    productCount: 13,
  },
  {
    id: "cat-6",
    title: "Kitchen Appliances",
    image: "/shopcartyt/images/products/product_22.png",
    productCount: 22,
  },
];

export const brands: HomeBrand[] = Array.from({ length: 8 }, (_, index) => ({
  id: `brand-${index + 1}`,
  title:
    ["Apple", "Samsung", "Sony", "LG", "Intel", "Canon", "Philips", "Xiaomi"][
      index
    ] ?? `Brand ${index + 1}`,
  image:
    index === 0
      ? "/shopcartyt/images/brands/brand_1.webp"
      : index === 1
        ? "/shopcartyt/images/brands/brand_2.jpg"
        : `/shopcartyt/images/brands/brand_${index + 1}.png`,
}));

export const priceRanges = [
  { title: "Under $100", value: "0-100", min: 0, max: 100 },
  { title: "$100 - $200", value: "100-200", min: 100, max: 200 },
  { title: "$200 - $300", value: "200-300", min: 200, max: 300 },
  { title: "$300 - $500", value: "300-500", min: 300, max: 500 },
  { title: "Over $500", value: "500-10000", min: 500, max: 10000 },
];

export const blogs: HomeBlog[] = [
  {
    id: "blog-1",
    title: "How to choose the best smart home devices",
    category: "Gadget",
    image: "/shopcartyt/images/products/product_10.png",
    date: "March 18, 2026",
  },
  {
    id: "blog-2",
    title: "Kitchen upgrades that save time every day",
    category: "Appliances",
    image: "/shopcartyt/images/products/product_8.png",
    date: "March 22, 2026",
  },
  {
    id: "blog-3",
    title: "Top cooling picks for the summer season",
    category: "Lifestyle",
    image: "/shopcartyt/images/products/product_14.png",
    date: "April 2, 2026",
  },
  {
    id: "blog-4",
    title: "Why compact gadgets are perfect for travel",
    category: "Travel",
    image: "/shopcartyt/images/products/product_4.png",
    date: "April 12, 2026",
  },
];

export const quickLinks = [
  "About us",
  "Contact us",
  "Terms & Conditions",
  "Privacy Policy",
  "FAQs",
  "Help",
];

export const footerCategories = [
  "Mobiles",
  "Appliances",
  "Smartphones",
  "Air Conditioners",
  "Washing Machine",
  "Kitchen Appliances",
  "Gadget Accessories",
];
