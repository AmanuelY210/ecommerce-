// Fallback demo data used when the database is empty (e.g., on Vercel without DB)
// This ensures the homepage always shows content even without a seeded database

export function generateSvgImage(seed: string, w = 600, h = 600, text = ''): string {
  // Generate a deterministic gradient based on the seed string
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue1 = Math.abs(hash) % 360
  const hue2 = (hue1 + 60) % 360
  const label = text || seed.charAt(0).toUpperCase()
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:hsl(${hue1},70%,60%)"/>
        <stop offset="100%" style="stop-color:hsl(${hue2},70%,40%)"/>
      </linearGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#g)"/>
    <text x="50%" y="50%" font-size="${Math.floor(w / 6)}" font-family="sans-serif" font-weight="bold" fill="rgba(255,255,255,0.8)" text-anchor="middle" dominant-baseline="middle">${label}</text>
  </svg>`
  
  return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64')
}

export const FALLBACK_BANNERS = [
  { id: 'fb1', title: 'Ethiopian Coffee Festival', image: generateSvgImage('coffee', 1400, 500, '☕ Coffee'), link: '/products?cat=grocery', position: 'HOME_HERO', active: true, order: 1, startAt: null, endAt: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'fb2', title: 'Tech Deals Week', image: generateSvgImage('tech', 1400, 500, '📱 Tech'), link: '/products?cat=electronics', position: 'HOME_HERO', active: true, order: 2, startAt: null, endAt: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'fb3', title: 'Made in Ethiopia', image: generateSvgImage('ethio', 1400, 500, '🇪🇹 Ethiopia'), link: '/products?cat=handmade-local-products', position: 'HOME_HERO', active: true, order: 3, startAt: null, endAt: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
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
]

export const FALLBACK_PRODUCTS = [
  { id: 'fp1', name: 'Samsung Galaxy Smartphone', slug: 'samsung-galaxy-1', price: 25000, comparePrice: 35000, images: [generateSvgImage('phone1', 600, 600, '📱')], rating: 4.5, reviewCount: 128, sold: 350, stock: 25, vendor: { storeName: 'Addis Tech Hub', verified: true }, category: { name: 'Electronics' }, brand: { name: 'Samsung' } },
  { id: 'fp2', name: 'Ethiopian Yirgacheffe Coffee 1kg', slug: 'coffee-1', price: 1200, comparePrice: 1800, images: [generateSvgImage('coffee1', 600, 600, '☕')], rating: 4.8, reviewCount: 256, sold: 890, stock: 50, vendor: { storeName: 'Tomoca Coffee Co.', verified: true }, category: { name: 'Grocery' }, brand: { name: 'Tomoca' } },
  { id: 'fp3', name: 'Habesha Kemis Premium', slug: 'habesha-1', price: 8500, comparePrice: 12000, images: [generateSvgImage('habesha1', 600, 600, '👗')], rating: 4.9, reviewCount: 89, sold: 120, stock: 15, vendor: { storeName: 'Habesha Crafts', verified: true }, category: { name: 'Fashion' }, brand: { name: 'Habesha' } },
  { id: 'fp4', name: 'Toyota Corolla 2018', slug: 'toyota-1', price: 1200000, comparePrice: null, images: [generateSvgImage('car1', 600, 600, '🚗')], rating: 4.3, reviewCount: 12, sold: 3, stock: 1, vendor: { storeName: 'Addis Auto Mart', verified: false }, category: { name: 'Vehicles' }, brand: { name: 'Toyota' } },
  { id: 'fp5', name: 'Samsung 43" Smart TV', slug: 'tv-1', price: 35000, comparePrice: 45000, images: [generateSvgImage('tv1', 600, 600, '📺')], rating: 4.6, reviewCount: 167, sold: 230, stock: 18, vendor: { storeName: 'Bole Electronics', verified: true }, category: { name: 'Electronics' }, brand: { name: 'Samsung' } },
  { id: 'fp6', name: 'Nike Running Shoes Pro', slug: 'nike-1', price: 8500, comparePrice: 12000, images: [generateSvgImage('shoes1', 600, 600, '👟')], rating: 4.7, reviewCount: 342, sold: 560, stock: 40, vendor: { storeName: 'Gola Shoes Ethiopia', verified: true }, category: { name: 'Fashion' }, brand: { name: 'Nike' } },
  { id: 'fp7', name: 'LG Refrigerator 350L', slug: 'fridge-1', price: 55000, comparePrice: 68000, images: [generateSvgImage('fridge1', 600, 600, '🧊')], rating: 4.4, reviewCount: 78, sold: 45, stock: 8, vendor: { storeName: 'Yeka Appliances', verified: true }, category: { name: 'Appliances' }, brand: { name: 'LG' } },
  { id: 'fp8', name: 'Berbere Spice Mix 500g', slug: 'berbere-1', price: 450, comparePrice: 650, images: [generateSvgImage('spice1', 600, 600, '🌶️')], rating: 4.9, reviewCount: 198, sold: 1200, stock: 100, vendor: { storeName: 'Dire Dawa Spices', verified: true }, category: { name: 'Grocery' }, brand: { name: 'Dire Dawa' } },
  { id: 'fp9', name: 'Dell Laptop 15.6"', slug: 'laptop-1', price: 45000, comparePrice: 55000, images: [generateSvgImage('laptop1', 600, 600, '💻')], rating: 4.5, reviewCount: 234, sold: 180, stock: 12, vendor: { storeName: 'Addis Tech Hub', verified: true }, category: { name: 'Electronics' }, brand: { name: 'Dell' } },
  { id: 'fp10', name: 'Cordless Drill 18V Bosch', slug: 'drill-1', price: 8500, comparePrice: 12000, images: [generateSvgImage('drill1', 600, 600, '🔧')], rating: 4.6, reviewCount: 56, sold: 89, stock: 20, vendor: { storeName: 'Makita Tools Ethiopia', verified: true }, category: { name: 'Industrial & Construction' }, brand: { name: 'Bosch' } },
  { id: 'fp11', name: 'Acoustic Guitar Yamaha', slug: 'guitar-1', price: 15000, comparePrice: 22000, images: [generateSvgImage('guitar1', 600, 600, '🎸')], rating: 4.8, reviewCount: 45, sold: 23, stock: 5, vendor: { storeName: 'Selam Music House', verified: false }, category: { name: 'Music & Instruments' }, brand: { name: 'Yamaha' } },
  { id: 'fp12', name: 'Royal Canin Dog Food 5kg', slug: 'dogfood-1', price: 3500, comparePrice: 4500, images: [generateSvgImage('dogfood1', 600, 600, '🐾')], rating: 4.7, reviewCount: 89, sold: 340, stock: 60, vendor: { storeName: 'Pawtopia Pet Store', verified: false }, category: { name: 'Pet Supplies' }, brand: { name: 'Royal Canin' } },
]

export const FALLBACK_VENDORS = [
  { id: 'fv1', storeName: 'Addis Tech Hub', slug: 'addis-tech-hub', logo: generateSvgImage('vlogo1', 80, 80, 'AT'), banner: generateSvgImage('vban1', 1200, 400, 'Addis Tech Hub'), description: 'Authorized electronics retailer in Addis Ababa since 2015.', verified: true, rating: 4.7, reviewCount: 342, totalOrders: 2840, totalSales: 12450000, packageName: 'Professional', packageSlug: 'professional', productCount: 62, sampleProducts: [], createdAt: new Date().toISOString() },
  { id: 'fv2', storeName: 'Tomoca Coffee Co.', slug: 'tomoca-coffee', logo: generateSvgImage('vlogo2', 80, 80, 'TC'), banner: generateSvgImage('vban2', 1200, 400, 'Tomoca Coffee'), description: 'Premium Ethiopian coffee roasters since 1974.', verified: true, rating: 4.9, reviewCount: 256, totalOrders: 1500, totalSales: 4500000, packageName: 'Business', packageSlug: 'business', productCount: 28, sampleProducts: [], createdAt: new Date().toISOString() },
  { id: 'fv3', storeName: 'Habesha Crafts', slug: 'habesha-crafts', logo: generateSvgImage('vlogo3', 80, 80, 'HC'), banner: generateSvgImage('vban3', 1200, 400, 'Habesha Crafts'), description: 'Traditional Ethiopian handmade clothing and crafts.', verified: true, rating: 4.8, reviewCount: 189, totalOrders: 980, totalSales: 2800000, packageName: 'Professional', packageSlug: 'professional', productCount: 45, sampleProducts: [], createdAt: new Date().toISOString() },
  { id: 'fv4', storeName: 'Bole Electronics', slug: 'bole-electronics', logo: generateSvgImage('vlogo4', 80, 80, 'BE'), banner: generateSvgImage('vban4', 1200, 400, 'Bole Electronics'), description: 'Latest electronics, TVs, and gadgets in Addis Ababa.', verified: true, rating: 4.5, reviewCount: 167, totalOrders: 1200, totalSales: 6800000, packageName: 'Business', packageSlug: 'business', productCount: 38, sampleProducts: [], createdAt: new Date().toISOString() },
  { id: 'fv5', storeName: 'Gola Shoes Ethiopia', slug: 'gola-shoes', logo: generateSvgImage('vlogo5', 80, 80, 'GS'), banner: generateSvgImage('vban5', 1200, 400, 'Gola Shoes'), description: 'Quality footwear for all occasions.', verified: false, rating: 4.3, reviewCount: 98, totalOrders: 560, totalSales: 1800000, packageName: 'Starter', packageSlug: 'starter', productCount: 22, sampleProducts: [], createdAt: new Date().toISOString() },
  { id: 'fv6', storeName: 'Pawtopia Pet Store', slug: 'pawtopia', logo: generateSvgImage('vlogo6', 80, 80, 'PP'), banner: generateSvgImage('vban6', 1200, 400, 'Pawtopia'), description: 'Everything for your pets — food, toys, and accessories.', verified: false, rating: 4.6, reviewCount: 89, totalOrders: 340, totalSales: 950000, packageName: 'Starter', packageSlug: 'starter', productCount: 18, sampleProducts: [], createdAt: new Date().toISOString() },
  { id: 'fv7', storeName: 'Selam Music House', slug: 'selam-music', logo: generateSvgImage('vlogo7', 80, 80, 'SM'), banner: generateSvgImage('vban7', 1200, 400, 'Selam Music'), description: 'Musical instruments and audio equipment.', verified: false, rating: 4.4, reviewCount: 45, totalOrders: 120, totalSales: 650000, packageName: 'Starter', packageSlug: 'starter', productCount: 15, sampleProducts: [], createdAt: new Date().toISOString() },
  { id: 'fv8', storeName: 'Makita Tools Ethiopia', slug: 'makita-tools', logo: generateSvgImage('vlogo8', 80, 80, 'MT'), banner: generateSvgImage('vban8', 1200, 400, 'Makita Tools'), description: 'Professional power tools and construction equipment.', verified: true, rating: 4.7, reviewCount: 56, totalOrders: 230, totalSales: 2200000, packageName: 'Professional', packageSlug: 'professional', productCount: 30, sampleProducts: [], createdAt: new Date().toISOString() },
]
