// Firestore seed script — populates Firebase Firestore with demo data
// Run: bun run scripts/seed-firestore.ts

import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// You need to set these environment variables OR put your service account JSON here
// Get it from: Firebase Console → Project Settings → Service Accounts → Generate New Private Key

const serviceAccount = {
  type: 'service_account',
  project_id: 'amanuel-ecommerce',
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || '',
  private_key: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL || '',
  client_id: process.env.FIREBASE_CLIENT_ID || '',
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk%40amanuel-ecommerce.iam.gserviceaccount.com',
}

if (!serviceAccount.private_key) {
  console.error('❌ You need to set FIREBASE_PRIVATE_KEY environment variable!')
  console.error('   Get your service account key from:')
  console.error('   Firebase Console → Project Settings → Service Accounts → Generate New Private Key')
  console.error('   Then set: export FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n..."')
  process.exit(1)
}

initializeApp({ credential: cert(serviceAccount as any) })
const db = getFirestore()
db.settings({ ignoreUndefinedProperties: true })

const img = (seed: string, w = 600, h = 600) => `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`

async function main() {
  console.log('🔥 Seeding Firestore...')

  // Categories
  console.log('📁 Creating categories...')
  const categories = [
    { name: 'Electronics', slug: 'electronics', icon: 'Smartphone', order: 0, active: true, image: img('cat-electronics', 400, 400) },
    { name: 'Fashion', slug: 'fashion', icon: 'Shirt', order: 1, active: true, image: img('cat-fashion', 400, 400) },
    { name: 'Home & Furniture', slug: 'home-furniture', icon: 'Home', order: 2, active: true, image: img('cat-home', 400, 400) },
    { name: 'Appliances', slug: 'appliances', icon: 'Refrigerator', order: 3, active: true, image: img('cat-appliances', 400, 400) },
    { name: 'Grocery', slug: 'grocery', icon: 'ShoppingBasket', order: 4, active: true, image: img('cat-grocery', 400, 400) },
    { name: 'Vehicles', slug: 'vehicles', icon: 'Car', order: 5, active: true, image: img('cat-vehicles', 400, 400) },
    { name: 'Health & Beauty', slug: 'health-beauty', icon: 'Heart', order: 6, active: true, image: img('cat-beauty', 400, 400) },
    { name: 'Sports & Outdoors', slug: 'sports-outdoors', icon: 'Dumbbell', order: 7, active: true, image: img('cat-sports', 400, 400) },
    { name: 'Books', slug: 'books', icon: 'Book', order: 8, active: true, image: img('cat-books', 400, 400) },
    { name: 'Pet Supplies', slug: 'pet-supplies', icon: 'PawPrint', order: 9, active: true, image: img('cat-pets', 400, 400) },
  ]
  for (const c of categories) {
    await db.collection('Category').add({ ...c, createdAt: new Date(), updatedAt: new Date() })
  }

  // Banners
  console.log('🖼️  Creating banners...')
  const banners = [
    { title: 'Ethiopian Coffee Festival', image: img('banner-coffee', 1400, 500), link: '/products?cat=grocery', position: 'HOME_HERO', active: true, order: 1, startAt: null, endAt: null },
    { title: 'Tech Deals Week', image: img('banner-tech', 1400, 500), link: '/products?cat=electronics', position: 'HOME_HERO', active: true, order: 2, startAt: null, endAt: null },
    { title: 'Made in Ethiopia', image: img('banner-ethio', 1400, 500), link: '/products?cat=fashion', position: 'HOME_HERO', active: true, order: 3, startAt: null, endAt: null },
  ]
  for (const b of banners) {
    await db.collection('Banner').add({ ...b, createdAt: new Date(), updatedAt: new Date() })
  }

  // Settings
  console.log('⚙️  Creating settings...')
  const settings = [
    { key: 'site_name', value: 'ETMarket' },
    { key: 'site_tagline', value: "Ethiopia's Marketplace" },
    { key: 'currency', value: 'ETB' },
    { key: 'default_commission', value: '10' },
    { key: 'min_withdrawal', value: '1000' },
    { key: 'maintenance_mode', value: 'false' },
    { key: 'support_email', value: 'support@etmarket.et' },
    { key: 'support_phone', value: '+251911000003' },
    { key: 'logo_text', value: 'et' },
    { key: 'logo_text_highlight', value: 'market' },
    { key: 'logo_url', value: '' },
    { key: 'favicon_url', value: '/logo.svg' },
    { key: 'site_description', value: "Shop millions of products from trusted Ethiopian vendors. Pay with Chapa or your local bank." },
    { key: 'announcement_bar_active', value: 'true' },
    { key: 'announcement_bar_text', value: '🚚 Free delivery in Addis Ababa on orders over 5,000 ETB · Pay with Chapa or your Ethiopian bank' },
    { key: 'announcement_bar_color', value: '#232f3e' },
    { key: 'header_show_search', value: 'true' },
    { key: 'header_show_language', value: 'true' },
    { key: 'header_deliver_to', value: 'Addis Ababa' },
    { key: 'footer_about', value: "ETMarket is Ethiopia's premier multi-vendor marketplace." },
    { key: 'footer_copyright', value: '© 2026 ETMarket Ethiopia. All rights reserved.' },
    { key: 'footer_made_in', value: 'Made in Ethiopia with ❤️' },
    { key: 'footer_show_about', value: 'true' },
    { key: 'footer_show_sell', value: 'true' },
    { key: 'footer_show_help', value: 'true' },
    { key: 'footer_show_payment', value: 'true' },
    { key: 'seo_meta_title', value: "ETMarket — Ethiopia's Marketplace | Shop Online with Chapa & Ethiopian Banks" },
    { key: 'seo_meta_description', value: "Shop millions of products from trusted Ethiopian vendors. Pay with Chapa or your local bank. Fast delivery across Ethiopia." },
    { key: 'seo_meta_keywords', value: 'Ethiopia marketplace, Addis Ababa shopping, Chapa payment, Ethiopian e-commerce, ETMarket' },
    { key: 'theme_primary_color', value: '#131921' },
    { key: 'theme_secondary_color', value: '#232f3e' },
    { key: 'theme_accent_color', value: '#ff9900' },
    { key: 'theme_button_color', value: '#ffd814' },
    { key: 'social_facebook', value: 'https://facebook.com/etmarket' },
    { key: 'social_twitter', value: 'https://twitter.com/etmarket' },
    { key: 'social_instagram', value: 'https://instagram.com/etmarket' },
    { key: 'social_telegram', value: 'https://t.me/etmarket' },
    { key: 'payment_chapa_enabled', value: 'true' },
    { key: 'payment_bank_enabled', value: 'true' },
    { key: 'payment_cod_enabled', value: 'true' },
    { key: 'feature_wishlist', value: 'true' },
    { key: 'feature_reviews', value: 'true' },
    { key: 'feature_coupons', value: 'true' },
    { key: 'feature_flash_deals', value: 'true' },
    { key: 'feature_vendor_signup', value: 'true' },
    { key: 'feature_guest_checkout', value: 'true' },
  ]
  for (const s of settings) {
    await db.collection('Setting').add(s)
  }

  // Demo products (simplified)
  console.log('📦 Creating products...')
  const products = [
    { name: 'Samsung Galaxy Smartphone', slug: 'samsung-galaxy', price: 25000, comparePrice: 35000, images: JSON.stringify([img('phone1', 600, 600)]), status: 'APPROVED', rating: 4.5, reviewCount: 128, sold: 350, stock: 25, featured: true, description: 'Latest smartphone with high-resolution camera.', categoryId: 'cat-electronics', vendorId: 'vendor-1', tags: JSON.stringify(['electronics']), lowStockAt: 5 },
    { name: 'Ethiopian Yirgacheffe Coffee 1kg', slug: 'yirgacheffe-coffee', price: 1200, comparePrice: 1800, images: JSON.stringify([img('coffee1', 600, 600)]), status: 'APPROVED', rating: 4.8, reviewCount: 256, sold: 890, stock: 50, featured: true, description: 'Single-origin Yirgacheffe Arabica coffee beans.', categoryId: 'cat-grocery', vendorId: 'vendor-1', tags: JSON.stringify(['coffee']), lowStockAt: 5 },
    { name: 'Habesha Kemis Premium', slug: 'habesha-kemis', price: 8500, comparePrice: 12000, images: JSON.stringify([img('habesha1', 600, 600)]), status: 'APPROVED', rating: 4.9, reviewCount: 89, sold: 120, stock: 15, featured: true, description: 'Hand-woven authentic Habesha kemis.', categoryId: 'cat-fashion', vendorId: 'vendor-1', tags: JSON.stringify(['fashion']), lowStockAt: 3 },
    { name: 'Nike Running Shoes Pro', slug: 'nike-shoes', price: 8500, comparePrice: 12000, images: JSON.stringify([img('shoes1', 600, 600)]), status: 'APPROVED', rating: 4.7, reviewCount: 342, sold: 560, stock: 40, featured: true, description: 'Lightweight running shoes.', categoryId: 'cat-fashion', vendorId: 'vendor-1', tags: JSON.stringify(['shoes']), lowStockAt: 5 },
    { name: 'LG Refrigerator 350L', slug: 'lg-fridge', price: 55000, comparePrice: 68000, images: JSON.stringify([img('fridge1', 600, 600)]), status: 'APPROVED', rating: 4.4, reviewCount: 78, sold: 45, stock: 8, featured: true, description: '350L double-door refrigerator.', categoryId: 'cat-appliances', vendorId: 'vendor-1', tags: JSON.stringify(['appliances']), lowStockAt: 2 },
    { name: 'Dell Laptop 15.6"', slug: 'dell-laptop', price: 45000, comparePrice: 55000, images: JSON.stringify([img('laptop1', 600, 600)]), status: 'APPROVED', rating: 4.5, reviewCount: 234, sold: 180, stock: 12, featured: true, description: '15.6-inch laptop with Intel Core i5.', categoryId: 'cat-electronics', vendorId: 'vendor-1', tags: JSON.stringify(['laptop']), lowStockAt: 3 },
    { name: 'Berbere Spice Mix 500g', slug: 'berbere-spice', price: 450, comparePrice: 650, images: JSON.stringify([img('spice1', 600, 600)]), status: 'APPROVED', rating: 4.9, reviewCount: 198, sold: 1200, stock: 100, featured: true, description: 'Authentic Ethiopian berbere spice blend.', categoryId: 'cat-grocery', vendorId: 'vendor-1', tags: JSON.stringify(['spice']), lowStockAt: 10 },
    { name: 'Toyota Corolla 2018', slug: 'toyota-corolla', price: 1200000, comparePrice: null, images: JSON.stringify([img('car1', 600, 600)]), status: 'APPROVED', rating: 4.3, reviewCount: 12, sold: 3, stock: 1, featured: false, description: 'Well-maintained 2018 Toyota Corolla.', categoryId: 'cat-vehicles', vendorId: 'vendor-1', tags: JSON.stringify(['car']), lowStockAt: 1 },
  ]
  for (const p of products) {
    await db.collection('Product').add({ ...p, createdAt: new Date(), updatedAt: new Date() })
  }

  console.log('✅ Firestore seed complete!')
  console.log('   Your Firebase project now has demo data.')
}

main().catch(console.error)
