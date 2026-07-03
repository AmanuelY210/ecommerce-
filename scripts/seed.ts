// Seed script — Ethiopian Multi-Vendor Marketplace
// Run: bun run scripts/seed.ts

import { PrismaClient } from '@prisma/client'
import { createHash } from 'crypto'

const db = new PrismaClient()

const hash = (s: string) => createHash('sha256').update(s).digest('hex').slice(0, 32)
const img = (seed: string, w = 600, h = 600) => `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`

// ─────────── Ethiopian marketplace context ───────────
const REGIONS = ['Addis Ababa', 'Oromia', 'Amhara', 'Tigray', 'SNNPR', 'Sidama', 'Dire Dawa']
const CITIES = ['Addis Ababa', 'Adama', 'Bahir Dar', 'Gondar', 'Hawassa', 'Mekelle', 'Jimma', 'Dire Dawa', 'Harar']

const CATEGORY_TREE = [
  { name: 'Electronics', icon: 'Smartphone', children: ['Phones & Tablets', 'Laptops & Computers', 'Audio', 'TVs & Accessories', 'Cameras'] },
  { name: 'Fashion', icon: 'Shirt', children: ["Men's Clothing", "Women's Clothing", 'Shoes', 'Bags', 'Watches', 'Jewelry'] },
  { name: 'Home & Kitchen', icon: 'Home', children: ['Appliances', 'Cookware', 'Furniture', 'Bedding', 'Decor'] },
  { name: 'Beauty & Health', icon: 'Heart', children: ['Skincare', 'Haircare', 'Makeup', 'Fragrance', 'Wellness'] },
  { name: 'Groceries', icon: 'ShoppingBasket', children: ['Grains & Spices', 'Beverages', 'Snacks', 'Coffee & Tea', 'Household'] },
  { name: 'Sports & Outdoors', icon: 'Dumbbell', children: ['Fitness', 'Football', 'Cycling', 'Outdoor Gear'] },
  { name: 'Books & Stationery', icon: 'Book', children: ['Books', 'Office Supplies', 'Art Supplies', 'School'] },
  { name: 'Baby & Kids', icon: 'Baby', children: ['Diapers', 'Toys', 'Baby Care', "Kids' Fashion"] },
  { name: 'Automotive', icon: 'Car', children: ['Parts', 'Accessories', 'Motor oil', 'Tools'] },
  { name: 'Made in Ethiopia', icon: 'Award', children: ['Habesha Kemis', 'Coffee', 'Spices', 'Handicrafts', 'Leather Goods'] },
]

const BRANDS = [
  'Tecno', 'Samsung', 'Apple', 'Huawei', 'Xiaomi', 'HP', 'Dell', 'Lenovo', 'Sony', 'JBL',
  'Nike', 'Adidas', 'Puma', 'Gucci', 'Louis Vuitton', 'Tommy Hilfiger', 'Levis', 'Zara',
  'Philips', 'LG', 'Panasonic', 'Braun', 'Nestle', 'Heineken', 'Bambu', 'Megenagna',
  'Kuraz', 'Tomoca', 'Moyee', 'Garden of Coffee', 'Buna Buna'
]

const VENDOR_NAMES = [
  'Addis Tech Hub', 'Mercato Express', 'Bole Electronics', 'Habesha Crafts', 'Piazza Fashion House',
  'Lidet Baby Store', 'Megenagna Books', 'Kazanchis Beauty', 'Sarbet Home Center', 'Cmmrce Sports',
  'Tomoca Coffee Co.', 'Gulele Wholesale', 'Yeka Appliances', 'Nifas Silk Furniture', 'Akaki Auto Parts',
  'Cmc Grocery', 'Gola Shoes Ethiopia', 'Selam Stationery', 'Sunset Watches', 'Highland Outdoor',
  'Awash Beverages', 'Lalibela Handicrafts', 'Dire Dawa Spices', 'Gondar Leather', 'Jimma Honey'
]

const PRODUCT_TEMPLATES: Record<string, { name: string; priceRange: [number, number]; brands: string[]; desc: string }[]> = {
  Electronics: [
    { name: 'Smartphone', priceRange: [8000, 75000], brands: ['Tecno', 'Samsung', 'Apple', 'Huawei', 'Xiaomi'], desc: 'Latest smartphone with high-resolution camera, long battery life, and dual-SIM support for Ethiopian networks.' },
    { name: 'Laptop', priceRange: [25000, 150000], brands: ['HP', 'Dell', 'Lenovo', 'Apple'], desc: 'Powerful laptop for work, study, and entertainment. SSD storage and full HD display.' },
    { name: 'Wireless Earbuds', priceRange: [1500, 12000], brands: ['JBL', 'Sony', 'Apple', 'Tecno'], desc: 'Bluetooth wireless earbuds with active noise cancellation and 24h battery case.' },
    { name: 'Smart TV 43"', priceRange: [18000, 65000], brands: ['Samsung', 'LG', 'Panasonic', 'Tecno'], desc: '4K Ultra HD Smart TV with built-in streaming apps and HDMI ports.' },
    { name: 'Power Bank 20000mAh', priceRange: [1200, 4500], brands: ['Tecno', 'Xiaomi', 'Samsung'], desc: 'High-capacity power bank with fast charging, dual USB output.' },
    { name: 'Bluetooth Speaker', priceRange: [2000, 15000], brands: ['JBL', 'Sony', 'Philips'], desc: 'Portable waterproof Bluetooth speaker with deep bass and 12-hour playtime.' },
    { name: 'Phone Charger Cable', priceRange: [200, 1500], brands: ['Samsung', 'Tecno', 'Xiaomi'], desc: 'Durable USB-C fast charging cable, 1m length, tangle-free.' },
    { name: 'USB Flash Drive 64GB', priceRange: [600, 2500], brands: ['Samsung', 'HP', 'Lexar'], desc: 'USB 3.0 high-speed flash drive with metal casing.' },
    { name: 'Webcam HD', priceRange: [2500, 9000], brands: ['HP', 'Logitech', 'Lenovo'], desc: '1080p HD webcam with built-in microphone for video calls.' },
    { name: 'Wireless Mouse', priceRange: [600, 3500], brands: ['HP', 'Logitech', 'Lenovo'], desc: 'Ergonomic wireless mouse with silent clicks, 2.4GHz.' },
  ],
  Fashion: [
    { name: "Men's Cotton T-Shirt", priceRange: [400, 1800], brands: ['Zara', 'Levis', 'Nike'], desc: '100% premium cotton t-shirt, breathable and soft. Available in multiple colors.' },
    { name: "Women's Habesha Dress", priceRange: [2500, 12000], brands: ['Habesha Crafts', 'Lalibela Handicrafts'], desc: 'Hand-woven traditional Habesha dress with authentic tibeb border, made in Ethiopia.' },
    { name: 'Running Shoes', priceRange: [3500, 18000], brands: ['Nike', 'Adidas', 'Puma'], desc: 'Lightweight running shoes with cushioned soles, ideal for road and trail.' },
    { name: 'Leather Handbag', priceRange: [2500, 15000], brands: ['Gondar Leather', 'Louis Vuitton', 'Tommy Hilfiger'], desc: 'Genuine Ethiopian leather handbag with adjustable strap and multiple pockets.' },
    { name: 'Wrist Watch', priceRange: [1500, 45000], brands: ['Sunset Watches', 'Casio', 'Tommy Hilfiger'], desc: 'Stainless steel analog watch with water resistance and scratch-proof glass.' },
    { name: "Men's Jeans", priceRange: [1800, 7500], brands: ['Levis', 'Zara', 'Tommy Hilfiger'], desc: 'Slim-fit denim jeans with stretch fabric for all-day comfort.' },
    { name: 'Sneakers', priceRange: [2500, 12000], brands: ['Nike', 'Adidas', 'Puma'], desc: 'Casual everyday sneakers with cushioned insole and durable outsole.' },
    { name: 'Gold Necklace', priceRange: [8000, 75000], brands: ['Lalibela Handicrafts', 'Gondar Leather'], desc: '18K gold-plated handcrafted necklace with traditional Ethiopian design.' },
    { name: 'Sun Hat', priceRange: [350, 1800], brands: ['Zara', 'Habesha Crafts'], desc: 'Wide-brim sun hat with UV protection, perfect for highland sun.' },
    { name: 'Wool Sweater', priceRange: [1500, 6500], brands: ['Habesha Crafts', 'Lalibela Handicrafts'], desc: 'Hand-knitted Ethiopian wool sweater, warm and breathable.' },
  ],
  'Home & Kitchen': [
    { name: 'Blender 1.5L', priceRange: [2500, 9500], brands: ['Philips', 'Panasonic', 'Braun'], desc: 'Powerful 600W blender with stainless steel blades and 1.5L jar.' },
    { name: 'Rice Cooker', priceRange: [2500, 8500], brands: ['Philips', 'Panasonic', 'LG'], desc: 'Automatic rice cooker with 1.8L capacity and keep-warm function.' },
    { name: 'Cookware Set 7pc', priceRange: [4500, 22000], brands: ['Philips', 'Tefal', 'Braun'], desc: 'Non-stick aluminum cookware set with glass lids and heat-resistant handles.' },
    { name: 'Sofa 3-Seater', priceRange: [12000, 65000], brands: ['Nifas Silk Furniture', 'Sarbet Home Center'], desc: 'Modern fabric 3-seater sofa with hardwood frame and high-density foam.' },
    { name: 'Bed Sheet Set', priceRange: [1500, 6500], brands: ['Sarbet Home Center', 'Yeka Appliances'], desc: 'Egyptian cotton 4-piece bed sheet set, soft and breathable.' },
    { name: 'Microwave Oven', priceRange: [6500, 22000], brands: ['LG', 'Panasonic', 'Samsung'], desc: '25L digital microwave with 10 power levels and defrost function.' },
    { name: 'Wall Clock', priceRange: [600, 3500], brands: ['Sunset Watches', 'Sarbet Home Center'], desc: 'Silent sweep wall clock with minimalist design.' },
    { name: 'Coffee Maker', priceRange: [3500, 18000], brands: ['Philips', 'Braun', 'Nestle'], desc: 'Drip coffee maker with 12-cup capacity, perfect for Ethiopian coffee ceremony.' },
    { name: 'Electric Kettle', priceRange: [1500, 5500], brands: ['Philips', 'Panasonic', 'Braun'], desc: '1.7L stainless steel electric kettle with auto shut-off.' },
    { name: 'Dining Table Set', priceRange: [15000, 85000], brands: ['Nifas Silk Furniture', 'Sarbet Home Center'], desc: '6-seater solid wood dining table set with cushioned chairs.' },
  ],
  'Beauty & Health': [
    { name: 'Vitamin C Serum', priceRange: [800, 4500], brands: ['The Ordinary', 'Nivea', 'L\'Oreal'], desc: 'Brightening vitamin C serum for daily skincare routine, 30ml bottle.' },
    { name: 'Hair Oil Treatment', priceRange: [500, 3500], brands: ['Nivea', 'Shea Moisture', 'Lalibela Handicrafts'], desc: 'Natural hair oil with Ethiopian blackseed and argan for deep nourishment.' },
    { name: 'Foundation Makeup', priceRange: [1200, 5500], brands: ['Maybelline', 'L\'Oreal', 'MAC'], desc: 'Long-lasting matte foundation with SPF 15, suitable for Ethiopian skin tones.' },
    { name: 'Perfume 100ml', priceRange: [3500, 25000], brands: ['Gucci', 'Louis Vuitton', 'Tommy Hilfiger'], desc: 'Eau de parfum with notes of jasmine, amber, and oud, long-lasting.' },
    { name: 'Multivitamin 60 Tablets', priceRange: [800, 3500], brands: ['Nestle', 'Centrum', 'Wellness'], desc: 'Daily multivitamin supplement supporting immune and energy.' },
    { name: 'Sunscreen SPF 50', priceRange: [700, 3500], brands: ['Nivea', 'L\'Oreal', 'Neutrogena'], desc: 'Lightweight SPF 50 sunscreen, water-resistant, non-greasy formula.' },
    { name: 'Toothpaste Whitening', priceRange: [200, 800], brands: ['Colgate', 'Sensodyne', 'Aquafresh'], desc: 'Whitening toothpaste with fluoride for daily use.' },
    { name: 'Hand Cream', priceRange: [350, 1800], brands: ['Nivea', 'L\'Oreal', 'Neutrogena'], desc: 'Moisturizing hand cream with shea butter, non-greasy.' },
  ],
  Groceries: [
    { name: 'Ethiopian Yirgacheffe Coffee 1kg', priceRange: [800, 3500], brands: ['Tomoca Coffee Co.', 'Moyee', 'Garden of Coffee'], desc: 'Single-origin Yirgacheffe Arabica coffee beans, freshly roasted in Addis Ababa.' },
    { name: 'Berbere Spice Mix 500g', priceRange: [250, 850], brands: ['Dire Dawa Spices', 'Bambu'], desc: 'Authentic Ethiopian berbere spice blend for traditional wot dishes.' },
    { name: 'Tej Honey 1L', priceRange: [550, 1800], brands: ['Jimma Honey', 'Bambu'], desc: 'Pure organic raw honey from Ethiopian highlands, perfect for tej.' },
    { name: 'Injera Flour 5kg', priceRange: [450, 1200], brands: ['Bambu', 'Megenagna Books'], desc: 'Teff flour for traditional injera, gluten-free, stone-ground.' },
    { name: 'Bottled Water 24 Pack', priceRange: [300, 750], brands: ['Highland', 'Awash Beverages'], desc: '24-pack of 500ml pure spring bottled water.' },
    { name: 'Pasta 500g', priceRange: [80, 350], brands: ['Bambu', 'Nestle'], desc: 'Durum wheat spaghetti, 500g pack, al dente texture.' },
    { name: 'Cooking Oil 5L', priceRange: [850, 2200], brands: ['Bambu', 'Nestle'], desc: 'Refined vegetable cooking oil, cholesterol-free.' },
    { name: 'Coca-Cola 12 Pack', priceRange: [350, 650], brands: ['Awash Beverages', 'Heineken'], desc: '12-pack of 330ml Coca-Cola cans, chilled-ready.' },
  ],
  'Sports & Outdoors': [
    { name: 'Football Size 5', priceRange: [800, 4500], brands: ['Nike', 'Adidas', 'Puma'], desc: 'Match-quality size 5 football, FIFA approved, durable stitched panels.' },
    { name: 'Yoga Mat', priceRange: [800, 3500], brands: ['Adidas', 'Highland Outdoor'], desc: 'Non-slip 6mm yoga mat with carrying strap.' },
    { name: 'Dumbbell Set 20kg', priceRange: [2500, 8500], brands: ['Highland Outdoor', 'Cmmrce Sports'], desc: 'Adjustable dumbbell set with carrying case.' },
    { name: 'Mountain Bike', priceRange: [12000, 65000], brands: ['Highland Outdoor', 'Trek', 'Giant'], desc: '21-speed mountain bike with aluminum frame and disc brakes.' },
    { name: 'Camping Tent 4P', priceRange: [4500, 18000], brands: ['Highland Outdoor'], desc: '4-person waterproof camping tent, easy setup.' },
    { name: 'Running Shorts', priceRange: [600, 2800], brands: ['Nike', 'Adidas', 'Puma'], desc: 'Lightweight breathable running shorts with inner liner.' },
  ],
  'Books & Stationery': [
    { name: 'Notebook A5 200pg', priceRange: [120, 750], brands: ['Megenagna Books', 'Selam Stationery'], desc: 'Premium A5 lined notebook with hardcover and ribbon bookmark.' },
    { name: 'Ballpoint Pens 10pk', priceRange: [80, 450], brands: ['Selam Stationery', 'Bic'], desc: 'Smooth-writing blue ballpoint pens, 10-pack.' },
    { name: 'Backpack 30L', priceRange: [1500, 7500], brands: ['Adidas', 'Nike', 'Megenagna Books'], desc: 'Water-resistant 30L backpack with laptop compartment.' },
    { name: 'Amharic Dictionary', priceRange: [550, 1800], brands: ['Megenagna Books'], desc: 'Comprehensive Amharic-English-Amharic dictionary, latest edition.' },
    { name: 'Children\'s Story Book', priceRange: [250, 950], brands: ['Megenagna Books'], desc: 'Illustrated Ethiopian folktales collection for children.' },
  ],
  'Baby & Kids': [
    { name: 'Disposable Diapers 60pk', priceRange: [1200, 3500], brands: ['Pampers', 'Huggies', 'Lidet Baby Store'], desc: 'Soft absorbent diapers, sizes 3-6, 60-pack, 12h protection.' },
    { name: 'Baby Formula 900g', priceRange: [1500, 4500], brands: ['Nestle', 'Similac', 'Lidet Baby Store'], desc: 'Infant formula 0-6 months, 900g tin, easy-digest.' },
    { name: 'Teddy Bear Plush', priceRange: [600, 3500], brands: ['Lidet Baby Store'], desc: 'Soft cuddly teddy bear plush toy, child-safe materials.' },
    { name: 'Baby Stroller', priceRange: [6500, 28000], brands: ['Lidet Baby Store', 'Chicco'], desc: 'Foldable baby stroller with canopy and storage basket.' },
  ],
  Automotive: [
    { name: 'Engine Oil 5W-30 4L', priceRange: [2200, 6500], brands: ['Castrol', 'Shell', 'Mobil 1'], desc: 'Synthetic engine oil for petrol and diesel engines, 4L bottle.' },
    { name: 'Car Floor Mats Set', priceRange: [1500, 5500], brands: ['Akaki Auto Parts'], desc: 'Universal-fit rubber car floor mats, 4-piece set.' },
    { name: 'Phone Car Mount', priceRange: [450, 2200], brands: ['Akaki Auto Parts', 'Tecno'], desc: 'Magnetic phone car mount with 360-degree rotation.' },
    { name: 'Jump Starter Kit', priceRange: [3500, 12000], brands: ['Akaki Auto Parts'], desc: 'Portable 1200A jump starter with USB charging and LED flashlight.' },
  ],
  'Made in Ethiopia': [
    { name: 'Habesha Kemis Premium', priceRange: [4500, 28000], brands: ['Habesha Crafts', 'Lalibela Handicrafts'], desc: 'Hand-woven authentic Habesha kemis with gold tibeb border, wedding-grade.' },
    { name: 'Yirgacheffe Green Coffee 5kg', priceRange: [2200, 6500], brands: ['Tomoca Coffee Co.', 'Garden of Coffee'], desc: 'Unroasted Yirgacheffe green coffee beans, premium grade 1.' },
    { name: 'Mitmita Spice 250g', priceRange: [180, 650], brands: ['Dire Dawa Spices'], desc: 'Authentic Ethiopian mitmita hot spice blend for kifto.' },
    { name: 'Leather Wallet Handmade', priceRange: [1200, 5500], brands: ['Gondar Leather'], desc: 'Hand-stitched Ethiopian leather wallet with card slots and coin pocket.' },
    { name: 'Cross Mesobe Basket', priceRange: [1500, 7500], brands: ['Lalibela Handicrafts'], desc: 'Hand-woven traditional Ethiopian mesobe food basket.' },
    { name: 'Tigray Cotton Netela', priceRange: [1800, 7500], brands: ['Lalibela Handicrafts', 'Habesha Crafts'], desc: 'Tigray-style cotton netela shawl with hand-embroidered border.' },
  ],
}

async function main() {
  console.log('🧹 Cleaning existing data...')
  const tables = ['ModerationLog','AuditLog','Notification','Coupon','Banner','TicketMessage','Ticket','Delivery','Refund','Payment','OrderItem','Order','Wishlist','CartItem','Cart','Review','Product','Brand','Category','Withdrawal','Vendor','Address','User','Setting']
  for (const t of tables) {
    await (db as any)[t].deleteMany({})
  }

  console.log('👥 Creating users (5 demo accounts + extras)...')
  const demoPassword = hash('demo1234')

  const admin = await db.user.create({ data: { email: 'admin@etmarket.et', password: demoPassword, name: 'Selam Admin', phone: '+251911000001', role: 'ADMIN', avatar: img('admin', 200, 200), status: 'ACTIVE' } })
  const moderator = await db.user.create({ data: { email: 'moderator@etmarket.et', password: demoPassword, name: 'Dagim Moderator', phone: '+251911000002', role: 'MODERATOR', avatar: img('mod', 200, 200), status: 'ACTIVE' } })
  const support = await db.user.create({ data: { email: 'support@etmarket.et', password: demoPassword, name: 'Hanan Support', phone: '+251911000003', role: 'SUPPORT', avatar: img('support', 200, 200), status: 'ACTIVE' } })
  const customer = await db.user.create({ data: { email: 'customer@etmarket.et', password: demoPassword, name: 'Abel Customer', phone: '+251911000004', role: 'CUSTOMER', avatar: img('cust', 200, 200), status: 'ACTIVE' } })
  const vendorUser = await db.user.create({ data: { email: 'vendor@etmarket.et', password: demoPassword, name: 'Bethel Vendor', phone: '+251911000005', role: 'VENDOR', avatar: img('vendor', 200, 200), status: 'ACTIVE' } })

  // Extra customers + vendors
  const extraCustomers: any[] = []
  const extraVendorUsers: any[] = []
  for (let i = 0; i < 15; i++) {
    extraCustomers.push(await db.user.create({ data: { email: `customer${i+1}@etmarket.et`, password: demoPassword, name: `Customer ${i+1}`, phone: `+25191100${1000+i}`, role: 'CUSTOMER', avatar: img(`c${i}`, 200, 200), status: 'ACTIVE' } }))
  }
  for (let i = 0; i < VENDOR_NAMES.length - 1; i++) {
    extraVendorUsers.push(await db.user.create({ data: { email: `vendor${i+1}@etmarket.et`, password: demoPassword, name: VENDOR_NAMES[i+1] || `Vendor ${i+1}`, phone: `+25191100${2000+i}`, role: 'VENDOR', avatar: img(`v${i}`, 200, 200), status: 'ACTIVE' } }))
  }

  console.log('🏪 Creating vendors...')
  const vendors: any[] = []
  // Primary demo vendor
  vendors.push(await db.vendor.create({
    data: {
      userId: vendorUser.id,
      storeName: VENDOR_NAMES[0],
      slug: 'addis-tech-hub',
      logo: img('vlogo0', 300, 300),
      banner: img('vban0', 1200, 400),
      description: 'Authorized electronics retailer in Addis Ababa since 2015. Genuine products with warranty.',
      businessType: 'COMPANY',
      licenseNumber: 'AA/14/0034567',
      taxNumber: '0001234567',
      verified: true,
      status: 'APPROVED',
      commissionRate: 8,
      rating: 4.7,
      reviewCount: 342,
      totalSales: 12450000,
      totalOrders: 2840,
      balance: 145000,
      pendingBalance: 38500,
    }
  }))

  for (let i = 1; i < VENDOR_NAMES.length; i++) {
    const v = extraVendorUsers[i-1]
    const approved = i <= 16
    vendors.push(await db.vendor.create({
      data: {
        userId: v.id,
        storeName: VENDOR_NAMES[i],
        slug: VENDOR_NAMES[i].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        logo: img(`vlogo${i}`, 300, 300),
        banner: img(`vban${i}`, 1200, 400),
        description: `${VENDOR_NAMES[i]} — quality products at fair prices for Ethiopian customers.`,
        businessType: i % 3 === 0 ? 'COMPANY' : i % 2 === 0 ? 'SME' : 'INDIVIDUAL',
        licenseNumber: i <= 16 ? `AA/14/00${10000+i}` : null,
        taxNumber: i <= 16 ? `000123${1000+i}` : null,
        verified: i <= 16,
        status: approved ? 'APPROVED' : i === 17 ? 'PENDING' : i === 18 ? 'SUSPENDED' : 'REJECTED',
        commissionRate: 8 + (i % 5),
        rating: 3.5 + (i % 15) / 10,
        reviewCount: 20 + i * 7,
        totalSales: 50000 + i * 38000,
        totalOrders: 30 + i * 15,
        balance: 5000 + i * 3200,
        pendingBalance: 800 + i * 450,
      }
    }))
  }

  console.log('📁 Creating categories...')
  const categoryMap = new Map<string, any>()
  for (let i = 0; i < CATEGORY_TREE.length; i++) {
    const c = CATEGORY_TREE[i]
    const parent = await db.category.create({ data: { name: c.name, slug: c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), icon: c.icon, image: img(`cat${i}`, 400, 400), order: i } })
    categoryMap.set(c.name, parent)
    for (let j = 0; j < c.children.length; j++) {
      const child = await db.category.create({ data: { name: c.children[j], slug: `${c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${c.children[j].toLowerCase().replace(/[^a-z0-9]+/g, '-')}`, icon: c.icon, parentId: parent.id, order: j } })
      categoryMap.set(`${c.name}/${c.children[j]}`, child)
    }
  }

  console.log('🏷️  Creating brands...')
  const brandMap = new Map<string, any>()
  for (const b of BRANDS) {
    brandMap.set(b, await db.brand.create({ data: { name: b, slug: b.toLowerCase().replace(/[^a-z0-9]+/g, '-'), logo: img(`brand-${b}`, 200, 200), country: 'Various', active: true } }))
  }

  console.log('📦 Creating products (target: 100+)...')
  const products: any[] = []
  let productCount = 0
  for (const [catName, templates] of Object.entries(PRODUCT_TEMPLATES)) {
    const cat = categoryMap.get(catName)
    if (!cat) continue
    for (const t of templates) {
      // Each template produces 3-6 variants from different vendors/brands
      const numItems = 3 + Math.floor(Math.random() * 4)
      for (let i = 0; i < numItems; i++) {
        const vendor = vendors[Math.floor(Math.random() * Math.min(17, vendors.length))]
        const brand = t.brands[i % t.brands.length]
        const brandRec = brandMap.get(brand)
        const price = Math.round(t.priceRange[0] + Math.random() * (t.priceRange[1] - t.priceRange[0]))
        const comparePrice = Math.random() > 0.5 ? Math.round(price * (1.1 + Math.random() * 0.4)) : null
        const stock = 5 + Math.floor(Math.random() * 200)
        const sold = Math.floor(Math.random() * 800)
        const rating = Math.round((3.5 + Math.random() * 1.5) * 10) / 10
        const reviewCount = Math.floor(Math.random() * 250)
        const name = `${brand} ${t.name}${i > 0 ? ` ${String.fromCharCode(64+i)}` : ''}`
        productCount++
        products.push(await db.product.create({
          data: {
            vendorId: vendor.id,
            categoryId: cat.id,
            brandId: brandRec?.id || null,
            name,
            slug: `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${productCount}`,
            description: t.desc + ' Comes with manufacturer warranty and free delivery in Addis Ababa for orders over 5,000 ETB.',
            price,
            comparePrice,
            sku: `SKU-${productCount.toString().padStart(5, '0')}`,
            barcode: `6${(100000000000 + productCount * 7).toString().slice(0, 11)}`,
            stock,
            lowStockAt: 5,
            images: JSON.stringify([img(`p${productCount}-1`, 600, 600), img(`p${productCount}-2`, 600, 600), img(`p${productCount}-3`, 600, 600)]),
            tags: JSON.stringify([catName, brand, 'ethiopia']),
            status: 'APPROVED',
            rating,
            reviewCount,
            sold,
            featured: Math.random() > 0.85,
            createdAt: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000),
          }
        }))
      }
    }
  }
  console.log(`   ✓ Created ${productCount} products`)

  console.log('⭐ Creating reviews...')
  const reviewTitles = ['Great product!', 'Worth the price', 'Fast delivery', 'Highly recommend', 'Good quality', 'As described', 'Will buy again', 'Satisfied customer']
  const reviewComments = [
    'Product arrived quickly in Addis Ababa. Quality is excellent and matches the description perfectly.',
    'Good value for money. The vendor was responsive to my questions. Recommended.',
    'Pleasant shopping experience. The packaging was secure and delivery was on time.',
    'I have been using this for two weeks now. Works as expected. No complaints.',
    'The product exceeded my expectations. Will definitely order from this store again.',
    'Decent product at a fair price. The vendor shipped it the same day I ordered.',
    'Happy with my purchase. The delivery partner called before arriving which was helpful.',
    'Great customer service. The product is genuine and works perfectly.'
  ]
  for (let i = 0; i < 80; i++) {
    const p = products[Math.floor(Math.random() * products.length)]
    const u = [customer, ...extraCustomers][Math.floor(Math.random() * 16)]
    await db.review.create({
      data: {
        productId: p.id,
        userId: u.id,
        vendorId: p.vendorId,
        rating: 3 + Math.floor(Math.random() * 3),
        title: reviewTitles[Math.floor(Math.random() * reviewTitles.length)],
        comment: reviewComments[Math.floor(Math.random() * reviewComments.length)],
        status: 'APPROVED',
        helpful: Math.floor(Math.random() * 30),
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000),
      }
    })
  }

  console.log('🛒 Creating orders...')
  const orderStatuses = ['PENDING','CONFIRMED','PACKED','SHIPPED','DELIVERED','DELIVERED','DELIVERED','CANCELLED','RETURNED']
  const paymentStatuses = ['PAID','PAID','PAID','PENDING','FAILED','REFUNDED']
  const paymentMethods = [
    { provider: 'chapa', method: 'mobile', bank: null, label: 'Chapa Mobile Money' },
    { provider: 'chapa', method: 'card', bank: null, label: 'Chapa Card' },
    { provider: 'bank', method: 'transfer', bank: 'cbe', label: 'Commercial Bank of Ethiopia' },
    { provider: 'bank', method: 'transfer', bank: 'dashen', label: 'Dashen Bank' },
    { provider: 'bank', method: 'transfer', bank: 'abyssinia', label: 'Bank of Abyssinia' },
    { provider: 'bank', method: 'transfer', bank: 'awash', label: 'Awash Bank' },
  ]

  for (let i = 0; i < 40; i++) {
    const p = products[Math.floor(Math.random() * products.length)]
    const v = vendors.find(v => v.id === p.vendorId) || vendors[0]
    const cust = i === 0 ? customer : [customer, ...extraCustomers][Math.floor(Math.random() * 16)]
    const qty = 1 + Math.floor(Math.random() * 3)
    const subtotal = p.price * qty
    const shipping = subtotal > 5000 ? 0 : 150
    const tax = Math.round(subtotal * 0.15)
    const commission = Math.round(subtotal * (v.commissionRate / 100))
    const total = subtotal + shipping + tax
    const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)]
    const paymentStatus = status === 'CANCELLED' ? 'FAILED' : status === 'RETURNED' ? 'REFUNDED' : paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)]
    const pm = paymentMethods[Math.floor(Math.random() * paymentMethods.length)]
    const createdAt = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
    const orderNo = `ETM-${createdAt.getFullYear()}${(createdAt.getMonth()+1).toString().padStart(2,'0')}${(1000+i).toString().padStart(4,'0')}`
    const order = await db.order.create({
      data: {
        orderNumber: orderNo,
        customerId: cust.id,
        vendorId: v.id,
        status,
        paymentStatus,
        paymentMethod: pm.bank || 'chapa',
        paymentProvider: pm.provider,
        paymentRef: paymentStatus === 'PAID' ? `${pm.provider.toUpperCase()}-${Math.random().toString(36).substring(2,12).toUpperCase()}` : null,
        subtotal, shipping, tax, commission, total,
        shippingAddress: JSON.stringify({ region: REGIONS[Math.floor(Math.random()*REGIONS.length)], city: CITIES[Math.floor(Math.random()*CITIES.length)], area: 'Bole', detail: 'House 123', phone: cust.phone || '+251911000000' }),
        trackingNumber: ['SHIPPED','DELIVERED'].includes(status) ? `TRK${Math.random().toString(36).substring(2,12).toUpperCase()}` : null,
        notes: Math.random() > 0.7 ? 'Please deliver after 5 PM' : null,
        createdAt,
      }
    })
    await db.orderItem.create({ data: { orderId: order.id, productId: p.id, name: p.name, image: JSON.parse(p.images)[0], price: p.price, quantity: qty, total: subtotal, vendorId: v.id } })
    if (paymentStatus === 'PAID') {
      await db.payment.create({ data: { orderId: order.id, provider: pm.provider, method: pm.method, bank: pm.bank, amount: total, status: 'SUCCESS', reference: order.paymentRef, txnId: `TXN${Date.now().toString().slice(-8)}${i}` } })
    }
    if (['SHIPPED','DELIVERED'].includes(status)) {
      await db.delivery.create({ data: { orderId: order.id, status: status === 'DELIVERED' ? 'DELIVERED' : 'IN_TRANSIT', zone: 'Addis Ababa', otp: String(Math.floor(1000 + Math.random() * 9000)), deliveredAt: status === 'DELIVERED' ? new Date(createdAt.getTime() + 2*24*60*60*1000) : null } })
    }
  }

  console.log('🎁 Creating coupons...')
  await db.coupon.create({ data: { code: 'WELCOME10', type: 'PERCENT', value: 10, minOrder: 1000, expiresAt: new Date(Date.now() + 90*24*60*60*1000), usageLimit: 1000, usedCount: 42, active: true, vendorId: null } })
  await db.coupon.create({ data: { code: 'ADDIS500', type: 'FLAT', value: 500, minOrder: 5000, expiresAt: new Date(Date.now() + 30*24*60*60*1000), usageLimit: 500, usedCount: 18, active: true, vendorId: null } })
  await db.coupon.create({ data: { code: 'COFFEE15', type: 'PERCENT', value: 15, minOrder: 800, expiresAt: new Date(Date.now() + 60*24*60*60*1000), usageLimit: 200, usedCount: 6, active: true, vendorId: vendors[0].id } })

  console.log('🖼️  Creating banners...')
  await db.banner.create({ data: { title: 'Ethiopian Coffee Festival', image: img('banner-coffee', 1400, 500), link: '/products?cat=groceries', position: 'HOME_HERO', order: 1 } })
  await db.banner.create({ data: { title: 'Tech Deals Week', image: img('banner-tech', 1400, 500), link: '/products?cat=electronics', position: 'HOME_HERO', order: 2 } })
  await db.banner.create({ data: { title: 'Made in Ethiopia', image: img('banner-ethio', 1400, 500), link: '/products?cat=made-in-ethiopia', position: 'HOME_HERO', order: 3 } })

  console.log('🎫 Creating support tickets...')
  const ticketSubjects = ['Order not delivered', 'Wrong product received', 'Refund request for order', 'Cannot login to my account', 'Question about product availability', 'Vendor did not respond', 'Payment failed but money deducted', 'Request for invoice']
  const ticketCats = ['ORDER','REFUND','PRODUCT','VENDOR','ACCOUNT','GENERAL']
  for (let i = 0; i < 12; i++) {
    const cust = i === 0 ? customer : [customer, ...extraCustomers][Math.floor(Math.random() * 16)]
    const createdAt = new Date(Date.now() - Math.floor(Math.random() * 14) * 24 * 60 * 60 * 1000)
    const ticket = await db.ticket.create({
      data: {
        ticketNo: `TKT-${(1000+i).toString().padStart(5,'0')}`,
        customerId: cust.id,
        subject: ticketSubjects[i % ticketSubjects.length],
        category: ticketCats[i % ticketCats.length],
        priority: ['LOW','NORMAL','HIGH','URGENT'][Math.floor(Math.random()*4)],
        status: i < 3 ? 'OPEN' : i < 7 ? 'IN_PROGRESS' : i < 10 ? 'RESOLVED' : 'CLOSED',
        assignedTo: i > 0 ? support.id : null,
        createdAt,
      }
    })
    await db.ticketMessage.create({ data: { ticketId: ticket.id, senderId: cust.id, message: ticket.subject + ' — please help me resolve this issue as soon as possible.', isStaff: false, createdAt } })
    if (i > 0) {
      await db.ticketMessage.create({ data: { ticketId: ticket.id, senderId: support.id, message: 'Hello! Thank you for reaching out. Our team is looking into your request and will get back to you within 24 hours.', isStaff: true, createdAt: new Date(createdAt.getTime() + 2*60*60*1000) } })
    }
  }

  console.log('🔔 Creating notifications...')
  for (const u of [admin, moderator, support, customer, vendorUser]) {
    for (let i = 0; i < 5; i++) {
      await db.notification.create({ data: { userId: u.id, type: ['ORDER','PAYMENT','SHIPMENT','SYSTEM','PROMO'][i], title: ['New order received','Payment confirmed','Order shipped','Welcome to ETMarket','Special discount'][i], message: ['You have a new order to review','Your payment was successfully processed','Your order is on the way','Thank you for joining ETMarket','Use WELCOME10 for 10% off'][i], read: i > 2 } })
    }
  }

  console.log('🏦 Creating withdrawals...')
  for (let i = 0; i < 8; i++) {
    const v = vendors[Math.floor(Math.random() * Math.min(17, vendors.length))]
    await db.withdrawal.create({ data: { vendorId: v.id, amount: 2000 + Math.floor(Math.random() * 30000), bankName: ['Commercial Bank of Ethiopia','Dashen Bank','Bank of Abyssinia','Awash Bank'][i % 4], accountNo: `1000${Math.floor(Math.random() * 10000000)}`, status: ['PENDING','APPROVED','PAID','REJECTED'][i % 4], reference: `WD-${1000+i}` } })
  }

  console.log('⚙️  Creating settings...')
  const settings = [
    { key: 'site_name', value: 'ETMarket' },
    { key: 'currency', value: 'ETB' },
    { key: 'default_commission', value: '10' },
    { key: 'min_withdrawal', value: '1000' },
    { key: 'support_email', value: 'support@etmarket.et' },
    { key: 'support_phone', value: '+251911000003' },
    { key: 'maintenance_mode', value: 'false' },
    { key: 'otp_message', value: 'Your ETMarket verification code is {CODE}. Valid for 5 minutes.' },
  ]
  for (const s of settings) {
    await db.setting.create({ data: s })
  }

  console.log('📋 Creating audit logs...')
  await db.auditLog.create({ data: { userId: admin.id, action: 'VENDOR_APPROVED', target: vendors[0].id, ip: '196.188.0.1', meta: 'Approved Addis Tech Hub' } })
  await db.auditLog.create({ data: { userId: moderator.id, action: 'PRODUCT_REJECTED', target: products[5].id, ip: '196.188.0.2', meta: 'Duplicate product listing' } })
  await db.auditLog.create({ data: { userId: admin.id, action: 'SETTINGS_UPDATED', target: 'commission_rate', ip: '196.188.0.1', meta: 'Updated default commission to 10%' } })

  console.log('✅ Seed complete!')
  console.log('   Demo accounts (password: demo1234):')
  console.log('   - admin@etmarket.et (Super Admin)')
  console.log('   - vendor@etmarket.et (Vendor)')
  console.log('   - customer@etmarket.et (Customer)')
  console.log('   - moderator@etmarket.et (Moderator)')
  console.log('   - support@etmarket.et (Customer Support)')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await db.$disconnect() })
