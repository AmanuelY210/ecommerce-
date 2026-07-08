// Fallback demo data used when the database is empty (e.g., on Vercel without DB)
// This ensures the homepage always shows content even without a seeded database
// All images use inline SVG data URIs — no external dependencies

export function generateSvgImage(seed: string, w = 600, h = 600, text = ''): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue1 = Math.abs(hash) % 360
  const hue2 = (hue1 + 60) % 360
  const label = text || seed.charAt(0).toUpperCase()
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:hsl(${hue1},70%,60%)"/><stop offset="100%" style="stop-color:hsl(${hue2},70%,40%)"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#g)"/><text x="50%" y="50%" font-size="${Math.floor(w / 6)}" font-family="sans-serif" font-weight="bold" fill="rgba(255,255,255,0.8)" text-anchor="middle" dominant-baseline="middle">${label}</text></svg>`
  return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64')
}

export const FALLBACK_BANNERS = [
  { id: 'fb1', title: 'Ethiopian Coffee Festival', image: generateSvgImage('coffee', 1400, 500, '☕ Coffee'), link: '/products?cat=grocery', position: 'HOME_HERO', active: true, order: 1, startAt: null, endAt: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'fb2', title: 'Tech Deals Week', image: generateSvgImage('tech', 1400, 500, '📱 Tech'), link: '/products?cat=electronics', position: 'HOME_HERO', active: true, order: 2, startAt: null, endAt: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'fb3', title: 'Made in Ethiopia', image: generateSvgImage('ethio', 1400, 500, '🇪🇹 Ethiopia'), link: '/products?cat=fashion', position: 'HOME_HERO', active: true, order: 3, startAt: null, endAt: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'fb4', title: 'Vehicle Deals', image: generateSvgImage('vehicles', 1400, 500, '🚗 Vehicles'), link: '/products?cat=vehicles', position: 'HOME_HERO', active: true, order: 4, startAt: null, endAt: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'fb5', title: 'Fashion Week', image: generateSvgImage('fashion', 1400, 500, '👗 Fashion'), link: '/products?cat=fashion', position: 'HOME_HERO', active: true, order: 5, startAt: null, endAt: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
]

export const FALLBACK_CATEGORIES = [
  { id: 'fc1', name: 'Vehicles', slug: 'vehicles', icon: 'Car', image: generateSvgImage('vehicles', 400, 400, '🚗'), parentId: null, order: 0, active: true },
  { id: 'fc2', name: 'Electronics', slug: 'electronics', icon: 'Smartphone', image: generateSvgImage('electronics', 400, 400, '📱'), parentId: null, order: 1, active: true },
  { id: 'fc3', name: 'Fashion', slug: 'fashion', icon: 'Shirt', image: generateSvgImage('fashion', 400, 400, '👗'), parentId: null, order: 2, active: true },
  { id: 'fc4', name: 'Home & Furniture', slug: 'home-furniture', icon: 'Home', image: generateSvgImage('home', 400, 400, '🛋️'), parentId: null, order: 3, active: true },
  { id: 'fc5', name: 'Appliances', slug: 'appliances', icon: 'Refrigerator', image: generateSvgImage('appliances', 400, 400, '🌀'), parentId: null, order: 4, active: true },
  { id: 'fc6', name: 'Grocery', slug: 'grocery', icon: 'ShoppingBasket', image: generateSvgImage('grocery', 400, 400, '🛒'), parentId: null, order: 5, active: true },
  { id: 'fc7', name: 'Health & Beauty', slug: 'health-beauty', icon: 'Heart', image: generateSvgImage('beauty', 400, 400, '💄'), parentId: null, order: 6, active: true },
  { id: 'fc8', name: 'Sports & Outdoors', slug: 'sports-outdoors', icon: 'Dumbbell', image: generateSvgImage('sports', 400, 400, '⚽'), parentId: null, order: 7, active: true },
  { id: 'fc9', name: 'Books', slug: 'books', icon: 'Book', image: generateSvgImage('books', 400, 400, '📚'), parentId: null, order: 8, active: true },
  { id: 'fc10', name: 'Pet Supplies', slug: 'pet-supplies', icon: 'PawPrint', image: generateSvgImage('pets', 400, 400, '🐾'), parentId: null, order: 9, active: true },
  { id: 'fc11', name: 'Jewelry & Watches', slug: 'jewelry-watches', icon: 'Gem', image: generateSvgImage('jewelry', 400, 400, '💎'), parentId: null, order: 10, active: true },
  { id: 'fc12', name: 'Music & Instruments', slug: 'music-instruments', icon: 'Music', image: generateSvgImage('music', 400, 400, '🎸'), parentId: null, order: 11, active: true },
  { id: 'fc13', name: 'Toys & Games', slug: 'toys-games', icon: 'Gamepad2', image: generateSvgImage('toys', 400, 400, '🎮'), parentId: null, order: 12, active: true },
  { id: 'fc14', name: 'Real Estate', slug: 'real-estate', icon: 'Building', image: generateSvgImage('realestate', 400, 400, '🏠'), parentId: null, order: 13, active: true },
  { id: 'fc15', name: 'Services', slug: 'services', icon: 'Wrench', image: generateSvgImage('services', 400, 400, '🛠️'), parentId: null, order: 14, active: true },
]

const p = (id: string, name: string, cat: string, price: number, comparePrice: number | null, vendor: string, verified: boolean, brand: string, emoji: string, rating: number, reviewCount: number, sold: number, stock: number, featured: boolean = true, desc?: string) => ({
  id, name, slug: id, price, comparePrice,
  images: [generateSvgImage(id + '-1', 600, 600, emoji), generateSvgImage(id + '-2', 600, 600, emoji), generateSvgImage(id + '-3', 600, 600, emoji)],
  rating, reviewCount, sold, stock, featured,
  vendor: { storeName: vendor, verified },
  category: { name: cat },
  brand: { name: brand },
  description: desc || `${name} — quality product from ${vendor}. Available now on ETMarket Ethiopia.`,
  tags: [cat.toLowerCase(), brand.toLowerCase()],
})

export const FALLBACK_PRODUCTS = [
  p('fp1', 'Samsung Galaxy Smartphone', 'Electronics', 25000, 35000, 'Addis Tech Hub', true, 'Samsung', '📱', 4.5, 128, 350, 25),
  p('fp2', 'Ethiopian Yirgacheffe Coffee 1kg', 'Grocery', 1200, 1800, 'Tomoca Coffee Co.', true, 'Tomoca', '☕', 4.8, 256, 890, 50, true, 'Single-origin Yirgacheffe Arabica coffee beans, freshly roasted in Addis Ababa.'),
  p('fp3', 'Habesha Kemis Premium', 'Fashion', 8500, 12000, 'Habesha Crafts', true, 'Habesha', '👗', 4.9, 89, 120, 15, true, 'Hand-woven authentic Habesha kemis with gold tibeb border, wedding-grade.'),
  p('fp4', 'Toyota Corolla 2018', 'Vehicles', 1200000, null, 'Addis Auto Mart', false, 'Toyota', '🚗', 4.3, 12, 3, 1),
  p('fp5', 'Samsung 43" Smart TV', 'Electronics', 35000, 45000, 'Bole Electronics', true, 'Samsung', '📺', 4.6, 167, 230, 18),
  p('fp6', 'Nike Running Shoes Pro', 'Fashion', 8500, 12000, 'Gola Shoes Ethiopia', true, 'Nike', '👟', 4.7, 342, 560, 40),
  p('fp7', 'LG Refrigerator 350L', 'Appliances', 55000, 68000, 'Yeka Appliances', true, 'LG', '🧊', 4.4, 78, 45, 8),
  p('fp8', 'Berbere Spice Mix 500g', 'Grocery', 450, 650, 'Dire Dawa Spices', true, 'Dire Dawa', '🌶️', 4.9, 198, 1200, 100),
  p('fp9', 'Dell Laptop 15.6"', 'Electronics', 45000, 55000, 'Addis Tech Hub', true, 'Dell', '💻', 4.5, 234, 180, 12),
  p('fp10', 'Cordless Drill 18V Bosch', 'Industrial & Construction', 8500, 12000, 'Makita Tools Ethiopia', true, 'Bosch', '🔧', 4.6, 56, 89, 20),
  p('fp11', 'Acoustic Guitar Yamaha', 'Music & Instruments', 15000, 22000, 'Selam Music House', false, 'Yamaha', '🎸', 4.8, 45, 23, 5),
  p('fp12', 'Royal Canin Dog Food 5kg', 'Pet Supplies', 3500, 4500, 'Pawtopia Pet Store', false, 'Royal Canin', '🐾', 4.7, 89, 340, 60),
  p('fp13', 'Gold Necklace 18K', 'Jewelry & Watches', 45000, null, 'Habesha Jewelry', true, 'Habesha Jewelry', '💎', 4.9, 34, 12, 3),
  p('fp14', '3-Bedroom House — Bole', 'Real Estate', 12500000, null, 'Addis Property', true, 'Addis Property', '🏠', 4.5, 8, 0, 1),
  p('fp15', 'Home Deep Cleaning Service', 'Services', 3500, null, 'Addis Cleaning', false, 'Addis Cleaning', '🧹', 4.6, 67, 450, 999),
  p('fp16', 'Wireless Earbuds ANC', 'Electronics', 3500, 5500, 'Bole Electronics', true, 'JBL', '🎧', 4.4, 189, 420, 35),
  p('fp17', 'Football Size 5 FIFA', 'Sports & Outdoors', 2500, 3500, 'Cmmrce Sports', true, 'Nike', '⚽', 4.5, 134, 670, 45),
  p('fp18', 'Memory Foam Mattress Queen', 'Home & Furniture', 18500, 28000, 'Sarbet Home Center', true, 'IKEA', '🛏️', 4.6, 92, 156, 10),
  p('fp19', 'Vitamin C Serum 30ml', 'Health & Beauty', 1800, 2800, 'Kazanchis Beauty', true, 'The Ordinary', '💄', 4.5, 234, 890, 80),
  p('fp20', 'Building Blocks 500pc Lego', 'Toys & Games', 4500, 6500, 'Toyland Addis', false, 'Lego', '🧩', 4.8, 78, 230, 15),
  p('fp21', 'Yamaha Sport Motorcycle 250cc', 'Vehicles', 185000, null, 'Yamaha Ethiopia', false, 'Yamaha', '🏍️', 4.4, 23, 15, 2),
  p('fp22', 'Washing Machine 8kg Samsung', 'Appliances', 42000, 55000, 'Yeka Appliances', true, 'Samsung', '🌀', 4.5, 112, 180, 7),
  p('fp23', 'Tej Honey 1L Pure Organic', 'Grocery', 850, null, 'Jimma Honey', true, 'Jimma Honey', '🍯', 4.9, 156, 670, 120, true, 'Pure organic raw honey from Ethiopian highlands, perfect for tej.'),
  p('fp24', 'Office Chair Ergonomic', 'Office Supplies', 12000, 18000, 'Bole Office World', true, 'IKEA', '🪑', 4.4, 89, 145, 20),
]

export const FALLBACK_VENDORS = [
  { id: 'fv1', storeName: 'Addis Tech Hub', slug: 'addis-tech-hub', logo: generateSvgImage('vlogo1', 80, 80, 'AT'), banner: generateSvgImage('vban1', 1200, 400, 'Addis Tech Hub'), description: 'Authorized electronics retailer in Addis Ababa since 2015. Genuine products with warranty.', businessType: 'COMPANY', verified: true, rating: 4.7, reviewCount: 342, totalOrders: 2840, totalSales: 12450000, packageName: 'Professional', packageSlug: 'professional', productCount: 62, sampleProducts: [], createdAt: new Date().toISOString() },
  { id: 'fv2', storeName: 'Tomoca Coffee Co.', slug: 'tomoca-coffee', logo: generateSvgImage('vlogo2', 80, 80, 'TC'), banner: generateSvgImage('vban2', 1200, 400, 'Tomoca Coffee'), description: 'Premium Ethiopian coffee roasters since 1974. Yirgacheffe, Sidamo, Harrar.', businessType: 'COMPANY', verified: true, rating: 4.9, reviewCount: 256, totalOrders: 1500, totalSales: 4500000, packageName: 'Business', packageSlug: 'business', productCount: 28, sampleProducts: [], createdAt: new Date().toISOString() },
  { id: 'fv3', storeName: 'Habesha Crafts', slug: 'habesha-crafts', logo: generateSvgImage('vlogo3', 80, 80, 'HC'), banner: generateSvgImage('vban3', 1200, 400, 'Habesha Crafts'), description: 'Traditional Ethiopian handmade clothing and crafts. Authentic tibeb patterns.', businessType: 'SME', verified: true, rating: 4.8, reviewCount: 189, totalOrders: 980, totalSales: 2800000, packageName: 'Professional', packageSlug: 'professional', productCount: 45, sampleProducts: [], createdAt: new Date().toISOString() },
  { id: 'fv4', storeName: 'Bole Electronics', slug: 'bole-electronics', logo: generateSvgImage('vlogo4', 80, 80, 'BE'), banner: generateSvgImage('vban4', 1200, 400, 'Bole Electronics'), description: 'Latest electronics, TVs, and gadgets in Addis Ababa. Best prices guaranteed.', businessType: 'COMPANY', verified: true, rating: 4.5, reviewCount: 167, totalOrders: 1200, totalSales: 6800000, packageName: 'Business', packageSlug: 'business', productCount: 38, sampleProducts: [], createdAt: new Date().toISOString() },
  { id: 'fv5', storeName: 'Gola Shoes Ethiopia', slug: 'gola-shoes', logo: generateSvgImage('vlogo5', 80, 80, 'GS'), banner: generateSvgImage('vban5', 1200, 400, 'Gola Shoes'), description: 'Quality footwear for all occasions. Nike, Adidas, Puma and more.', businessType: 'SME', verified: false, rating: 4.3, reviewCount: 98, totalOrders: 560, totalSales: 1800000, packageName: 'Starter', packageSlug: 'starter', productCount: 22, sampleProducts: [], createdAt: new Date().toISOString() },
  { id: 'fv6', storeName: 'Pawtopia Pet Store', slug: 'pawtopia', logo: generateSvgImage('vlogo6', 80, 80, 'PP'), banner: generateSvgImage('vban6', 1200, 400, 'Pawtopia'), description: 'Everything for your pets — food, toys, and accessories.', businessType: 'SME', verified: false, rating: 4.6, reviewCount: 89, totalOrders: 340, totalSales: 950000, packageName: 'Starter', packageSlug: 'starter', productCount: 18, sampleProducts: [], createdAt: new Date().toISOString() },
  { id: 'fv7', storeName: 'Selam Music House', slug: 'selam-music', logo: generateSvgImage('vlogo7', 80, 80, 'SM'), banner: generateSvgImage('vban7', 1200, 400, 'Selam Music'), description: 'Musical instruments and audio equipment. Yamaha, Fender, JBL.', businessType: 'INDIVIDUAL', verified: false, rating: 4.4, reviewCount: 45, totalOrders: 120, totalSales: 650000, packageName: 'Starter', packageSlug: 'starter', productCount: 15, sampleProducts: [], createdAt: new Date().toISOString() },
  { id: 'fv8', storeName: 'Makita Tools Ethiopia', slug: 'makita-tools', logo: generateSvgImage('vlogo8', 80, 80, 'MT'), banner: generateSvgImage('vban8', 1200, 400, 'Makita Tools'), description: 'Professional power tools and construction equipment.', businessType: 'COMPANY', verified: true, rating: 4.7, reviewCount: 56, totalOrders: 230, totalSales: 2200000, packageName: 'Professional', packageSlug: 'professional', productCount: 30, sampleProducts: [], createdAt: new Date().toISOString() },
]

export const FALLBACK_SETTINGS: Record<string, string> = {
  site_name: 'ETMarket',
  site_tagline: "Ethiopia's Marketplace",
  currency: 'ETB',
  logo_text: 'et',
  logo_text_highlight: 'market',
  logo_url: '',
  favicon_url: '/logo.svg',
  site_description: "Shop millions of products from trusted Ethiopian vendors. Pay with Chapa or your local bank. Fast delivery across Ethiopia.",
  announcement_bar_active: 'true',
  announcement_bar_text: '🚚 Free delivery in Addis Ababa on orders over 5,000 ETB · Pay with Chapa or your Ethiopian bank',
  announcement_bar_color: '#232f3e',
  header_show_search: 'true',
  header_show_language: 'true',
  header_deliver_to: 'Addis Ababa',
  footer_about: "ETMarket is Ethiopia's premier multi-vendor marketplace, connecting customers with verified vendors across all 14 regions.",
  footer_copyright: '© 2026 ETMarket Ethiopia. All rights reserved.',
  footer_made_in: 'Made in Ethiopia with ❤️',
  footer_show_about: 'true',
  footer_show_sell: 'true',
  footer_show_help: 'true',
  footer_show_payment: 'true',
  seo_meta_title: "ETMarket — Ethiopia's Marketplace | Shop Online with Chapa & Ethiopian Banks",
  seo_meta_description: "Shop millions of products from trusted Ethiopian vendors. Pay with Chapa or your local bank. Fast delivery across Ethiopia.",
  seo_meta_keywords: 'Ethiopia marketplace, Addis Ababa shopping, Chapa payment, Ethiopian e-commerce, ETMarket',
  theme_primary_color: '#131921',
  theme_secondary_color: '#232f3e',
  theme_accent_color: '#ff9900',
  theme_button_color: '#ffd814',
  social_facebook: 'https://facebook.com/etmarket',
  social_twitter: 'https://twitter.com/etmarket',
  social_instagram: 'https://instagram.com/etmarket',
  social_telegram: 'https://t.me/etmarket',
  social_youtube: 'https://youtube.com/@etmarket',
  payment_chapa_enabled: 'true',
  payment_bank_enabled: 'true',
  payment_cod_enabled: 'true',
  feature_wishlist: 'true',
  feature_reviews: 'true',
  feature_coupons: 'true',
  feature_flash_deals: 'true',
  feature_vendor_signup: 'true',
  feature_guest_checkout: 'true',
}
