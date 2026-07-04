// Seed script — Ethiopian Multi-Vendor Marketplace
// Run: bun run scripts/seed.ts

import { PrismaClient } from '@prisma/client'
import { createHash } from 'crypto'

const db = new PrismaClient()

const hash = (s: string) => createHash('sha256').update(s).digest('hex').slice(0, 32)
const img = (seed: string, w = 600, h = 600) => `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`

// ─────────── Ethiopian marketplace context ───────────
// Real Ethiopia administrative regions (12 regions + 2 chartered cities)
const REGIONS = [
  'Addis Ababa', 'Dire Dawa',
  'Oromia', 'Amhara', 'Tigray', 'Sidama',
  'South Ethiopia', 'South West Ethiopia Peoples', 'Central Ethiopia',
  'Afar', 'Somali', 'Benishangul-Gumuz', 'Gambela', 'Harari',
]
const CITIES: Record<string, string[]> = {
  'Addis Ababa': ['Addis Ababa'],
  'Dire Dawa': ['Dire Dawa'],
  'Oromia': ['Adama', 'Jimma', 'Ambo', 'Nekemte', 'Shashamane', 'Bale Robe', 'Asella', 'Sebeta', 'Bishoftu', 'Ziway'],
  'Amhara': ['Bahir Dar', 'Gondar', 'Dessie', 'Debre Markos', 'Debre Birhan', 'Woldia', 'Kombolcha', 'Debre Tabor', 'Lalibela'],
  'Tigray': ['Mekelle', 'Adwa', 'Axum', 'Adigrat', 'Shire Inda Selassie', 'Wukro', 'Alamata', 'Maichew'],
  'Sidama': ['Hawassa', 'Yirgalem', 'Dilla', 'Boditi', 'Wendo Genet', 'Leku'],
  'South Ethiopia': ['Sodo (Wolaita)', 'Arba Minch', 'Areka', 'Dilla'],
  'South West Ethiopia Peoples': ['Bonga', 'Mizan Teferi', 'Tepi', 'Metu', 'Bedele'],
  'Central Ethiopia': ['Adama', 'Ambo', 'Sebeta', 'Bishoftu', 'Fitche', 'Shashamane'],
  'Afar': ['Semera', 'Asaita', 'Awash', 'Gewane', 'Logiya'],
  'Somali': ['Jijiga', 'Kebri Dahar', 'Gode', 'Degahbur', 'Werder'],
  'Benishangul-Gumuz': ['Assosa', 'Pawe', 'Bambasi', 'Kamashi', 'Gilgil Beles'],
  'Gambela': ['Gambela', 'Itang', 'Abobo', 'Gore'],
  'Harari': ['Harar'],
}
const ALL_CITIES = Object.values(CITIES).flat()

const CATEGORY_TREE = [
  { name: 'Vehicles', icon: 'Car', children: ['Cars', 'Motorcycles', 'Trucks', 'Buses', 'Bicycles', 'Auto Parts', 'Accessories'] },
  { name: 'Electronics', icon: 'Smartphone', children: ['Smartphones', 'Feature Phones', 'Tablets', 'Smart Watches', 'Laptops', 'Desktop Computers', 'Computer Components', 'Monitors', 'Printers', 'Scanners', 'Networking', 'TVs', 'Home Audio', 'Headphones', 'Speakers', 'Cameras', 'Drones', 'Gaming', 'Phone Accessories', 'Computer Accessories'] },
  { name: 'Fashion', icon: 'Shirt', children: ["Men's Clothing", "Women's Clothing", "Kids' Clothing", 'Baby Clothing', 'Shoes', 'Bags', 'Watches', 'Jewelry', 'Accessories'] },
  { name: 'Home & Furniture', icon: 'Home', children: ['Living Room', 'Bedroom', 'Dining Room', 'Kitchen', 'Bathroom', 'Office Furniture', 'Outdoor Furniture', 'Home Decor', 'Curtains', 'Carpets', 'Lighting'] },
  { name: 'Appliances', icon: 'Refrigerator', children: ['Refrigerators', 'Washing Machines', 'Dryers', 'Ovens', 'Cookers', 'Microwaves', 'Coffee Machines', 'Water Dispensers', 'Air Conditioners', 'Fans', 'Vacuum Cleaners', 'Water Heaters'] },
  { name: 'Grocery', icon: 'ShoppingBasket', children: ['Fruits', 'Vegetables', 'Meat', 'Fish', 'Dairy', 'Eggs', 'Bakery', 'Snacks', 'Beverages', 'Coffee', 'Tea', 'Rice', 'Flour', 'Pasta', 'Cooking Oil', 'Spices', 'Frozen Foods'] },
  { name: 'Health & Beauty', icon: 'Heart', children: ['Skin Care', 'Hair Care', 'Makeup', 'Perfume', 'Personal Care', 'Vitamins', 'Medical Supplies', 'Fitness Supplements'] },
  { name: 'Sports & Outdoors', icon: 'Dumbbell', children: ['Football', 'Basketball', 'Volleyball', 'Running', 'Cycling', 'Camping', 'Hiking', 'Fishing', 'Gym Equipment', 'Swimming'] },
  { name: 'Books', icon: 'Book', children: ['Educational', 'Business', 'Technology', 'Fiction', 'Non-Fiction', 'Religion', "Children's Books", 'Language Learning'] },
  { name: 'Office Supplies', icon: 'Paperclip', children: ['Paper', 'Pens', 'Pencils', 'Notebooks', 'Office Chairs', 'Office Desks', 'Filing Cabinets', 'Calculators'] },
  { name: 'Toys & Games', icon: 'Gamepad2', children: ['Educational Toys', 'Dolls', 'Action Figures', 'Building Blocks', 'Board Games', 'Remote Control Toys', 'Outdoor Toys'] },
  { name: 'Baby Products', icon: 'Baby', children: ['Diapers', 'Baby Food', 'Feeding', 'Strollers', 'Car Seats', 'Baby Toys', 'Baby Care'] },
  { name: 'Pet Supplies', icon: 'PawPrint', children: ['Dogs', 'Cats', 'Birds', 'Fish', 'Pet Food', 'Pet Toys', 'Pet Healthcare'] },
  { name: 'Agriculture', icon: 'Wheat', children: ['Seeds', 'Fertilizers', 'Farm Tools', 'Irrigation', 'Tractors', 'Livestock Equipment', 'Greenhouse Equipment'] },
  { name: 'Industrial & Construction', icon: 'HardHat', children: ['Construction Materials', 'Cement', 'Steel', 'Paint', 'Roofing', 'Electrical Supplies', 'Plumbing', 'Welding Equipment', 'Power Tools', 'Safety Equipment', 'Heavy Machinery'] },
  { name: 'Jewelry & Watches', icon: 'Gem', children: ['Gold Jewelry', 'Silver Jewelry', 'Rings', 'Necklaces', 'Bracelets', 'Earrings', 'Luxury Watches', 'Smart Watches'] },
  { name: 'Music & Instruments', icon: 'Music', children: ['Guitars', 'Keyboards', 'Drums', 'Microphones', 'DJ Equipment', 'Studio Equipment'] },
  { name: 'Arts & Crafts', icon: 'Palette', children: ['Painting Supplies', 'Drawing Supplies', 'Sewing', 'Knitting', 'Craft Materials'] },
  { name: 'Real Estate', icon: 'Building', children: ['Houses for Sale', 'Houses for Rent', 'Apartments', 'Commercial Property', 'Land', 'Offices'] },
  { name: 'Services', icon: 'Wrench', children: ['Home Cleaning', 'Plumbing', 'Electrical Repair', 'Car Repair', 'Computer Repair', 'Graphic Design', 'Photography', 'Event Planning', 'Delivery Services', 'Freelance Services'] },
  { name: 'Digital Products', icon: 'HardDrive', children: ['Software', 'eBooks', 'Online Courses', 'Templates', 'Graphics', 'Digital Art', 'Licenses'] },
  { name: 'Gift Shop', icon: 'Gift', children: ['Gift Boxes', 'Flowers', 'Greeting Cards', 'Personalized Gifts', 'Party Supplies'] },
  { name: 'Wholesale & Bulk', icon: 'Package', children: ['Wholesale Electronics', 'Wholesale Grocery', 'Wholesale Fashion', 'Wholesale Construction Materials', 'Wholesale Office Supplies'] },
  { name: 'Handmade & Local Products', icon: 'HandHeart', children: ['Handmade Crafts', 'Traditional Clothing', 'Ethiopian Coffee', 'Leather Goods', 'Pottery', 'Woodwork', 'Cultural Art'] },
  { name: 'Marketplace Deals', icon: 'Tag', children: ['Flash Sales', 'Clearance', 'Open Box', 'Refurbished', 'Best Sellers', 'New Arrivals', 'Featured Products'] },
]

const BRANDS = [
  // Electronics / phones / computers
  'Tecno', 'Samsung', 'Apple', 'Huawei', 'Xiaomi', 'HP', 'Dell', 'Lenovo', 'Sony', 'JBL',
  'Nokia', 'Itel', 'Asus', 'Acer', 'MSI', 'Logitech', 'Canon', 'Epson', 'Cisco', 'TP-Link',
  'Seagate', 'Western Digital', 'Intel', 'AMD', 'Nvidia', 'Kingston', 'Corsair', 'Microsoft',
  'LG', 'Panasonic', 'Philips', 'Braun', 'Bosch', 'Siemens', 'DJI', 'Garmin', 'Anker',
  // Fashion
  'Nike', 'Adidas', 'Puma', 'Gucci', 'Louis Vuitton', 'Tommy Hilfiger', 'Levis', 'Zara',
  'H&M', 'Clarks', 'Ecco', 'Steve Madden', 'Ray-Ban', 'Oakley', 'Casio', 'Fossil', 'Arrow',
  // Home & furniture
  'IKEA', 'Herman Miller', 'Serta',
  // Appliances
  'Haier', 'Dawlance', 'Mabe', 'Midea', 'Gree', 'DeLonghi', 'Westpoint', 'Ariston', 'Bradford White',
  // Grocery / beverages
  'Nestle', 'Heineken', 'Bambu', 'Megenagna', 'Kuraz', 'Tomoca Coffee Co.', 'Moyee',
  'Garden of Coffee', 'Buna Buna', 'Coca-Cola', 'Barilla', 'Filsan', 'Double A', 'Kality',
  // Health & beauty
  "L'Oreal", 'Nivea', 'Maybelline', 'MAC', 'Neutrogena', "Johnson & Johnson", 'Cetaphil',
  'Centrum', 'Omron', 'Beurer', 'Optimum Nutrition', 'MyProtein', 'Sensodyne', 'Aquafresh',
  'Colgate', 'Shea Moisture', 'The Ordinary',
  // Sports
  'Spalding', 'Asics', 'Coleman', 'Osprey', 'Shimano', 'Daiwa', 'Bowflex', 'Speedo', 'Arena',
  'Manduka', 'Trek', 'Giant', 'Specialized',
  // Books
  'Penguin', 'HarperCollins', "O'Reilly", 'Cambridge', 'Oxford', 'Bible Society', 'Moleskine',
  // Office supplies
  'Bic', 'Pilot', 'Staedtler', 'Faber-Castell', 'Staples', 'Texas Instruments',
  // Toys
  'Lego', 'Hasbro', 'Mattel', 'Traxxas', 'Little Tikes', 'Ravensburger',
  // Baby
  'Pampers', 'Huggies', 'Avent', 'Tommy Tippee', 'Chicco', 'Graco', 'Similac',
  // Pet
  'Pedigree', 'Whiskas', 'Royal Canin', 'Purina', 'Petco', 'Aquarium World',
  // Agriculture
  'Ethiopian Seeds', 'Dangote Agro', 'Greenfield Agriculture', 'Netafim', 'Ethio Agro',
  // Industrial & construction
  'Derba', 'Messebo', 'Steely R&D', 'Steel Authority', 'Hayat Rota', 'National Paints', 'Jotun',
  'Cosmoplast', 'Lincoln Electric', 'MSA', '3M', 'Hyundai Heavy', 'Makita', 'Dewalt', 'Stanley',
  // Jewelry
  'Habesha Jewelry', 'Gondar Silver', 'Gondar Leather', 'Cartier', 'Tiffany', 'Rolex', 'Omega', 'Tag Heuer',
  // Music
  'Yamaha Guitars', 'Fender', 'Behringer', 'Shure', 'Audio-Technica', 'Pioneer', 'Numark', 'Alesis', 'Masinko Ethiopia',
  // Arts & crafts
  'Liquitex', 'Winsor & Newton', 'Lion Brand', 'Singer', 'Brother',
  // Real estate
  'Addis Property', 'Bole Realty',
  // Services
  'Addis Cleaning', 'Addis Plumbers', 'Addis Electric', 'Bole Auto Service', 'Addis Tech Repair',
  'Addis Designs', 'Golden Lens Photography', 'Addis Events', 'Addis Delivery',
  // Digital products
  'Kaspersky', 'Norton', 'Bitdefender', 'Udemy', 'Coursera',
  // Gift shop
  'Addis Gifts', 'Addis Flowers',
  // Vehicles
  'Toyota', 'Suzuki', 'Honda', 'Hyundai', 'Ford', 'Yamaha', 'Bajaj', 'Varta', 'Amaron', 'Ate', 'WeatherTech',
  // Local / handmade
  'Lalibela Handicrafts', 'Habesha Crafts', 'Dire Dawa Spices', 'Jimma Honey', 'Wondo Genet',
  // Misc
  'Castrol', 'Shell', 'Mobil 1',
]

const VENDOR_NAMES = [
  // Original storefronts
  'Addis Tech Hub', 'Mercato Express', 'Bole Electronics', 'Habesha Crafts', 'Piazza Fashion House',
  'Lidet Baby Store', 'Megenagna Books', 'Kazanchis Beauty', 'Sarbet Home Center', 'Cmmrce Sports',
  'Tomoca Coffee Co.', 'Gulele Wholesale', 'Yeka Appliances', 'Nifas Silk Furniture', 'Akaki Auto Parts',
  'Cmc Grocery', 'Gola Shoes Ethiopia', 'Selam Stationery', 'Sunset Watches', 'Highland Outdoor',
  'Awash Beverages', 'Lalibela Handicrafts', 'Dire Dawa Spices', 'Gondar Leather', 'Jimma Honey',
  // Vendors for new categories
  'Pawtopia Pet Store', 'Bosco Garden Center', 'Makita Tools Ethiopia', 'Selam Music House',
  'Toyland Addis', 'Bole Office World', 'Gaming Hub Ethiopia', 'PC Builder Addis', 'Cactus Garden Store',
  'Addis Auto Mart', 'Bole Motors', 'Yamaha Ethiopia', 'Bajaj Showroom Addis', 'Mountain Bike Addis',
  'Derba Cement Depot', 'Steel Authority Addis', 'Hayat Paints Ethiopia', 'Construction Supply Co.',
  'Ethio Agro Supplies', 'Greenfield Agriculture', 'Wondo Genet Honey', 'Ethiopian Seeds Co.',
  'Habesha Jewelry', 'Gondar Silver', 'Gold Souk Addis', 'Watch Boutique Ethiopia',
  'Addis Art Studio', 'Craft Corner', 'Sewing World', 'Knitting Circle',
  'Addis Property Listings', 'Bole Realty', 'Cmc Real Estate',
  'Addis Cleaning Services', 'Addis Plumbers', 'Bole Auto Service', 'Addis Tech Repair',
  'Addis Designs Studio', 'Golden Lens Photography', 'Addis Events', 'Addis Delivery Co.',
  'Software Hub Ethiopia', 'Addis Online Courses', 'Addis Digital Products',
  'Addis Gift Shop', 'Bole Flowers', 'Party Supplies Addis',
  'Wholesale Addis Hub', 'Bulk Traders Ethiopia', 'Mercato Wholesale',
  'Handmade Ethiopia', 'Cultural Art Addis', 'Woodwork Workshop',
  'Flash Deals Addis', 'Clearance Outlet', 'Refurbished Tech',
]

const PRODUCT_TEMPLATES: Record<string, { name: string; priceRange: [number, number]; brands: string[]; desc: string }[]> = {
  Vehicles: [
    { name: 'Used Toyota Corolla 2018', priceRange: [850000, 1500000], brands: ['Toyota'], desc: 'Well-maintained 2018 Toyota Corolla sedan, automatic transmission, low mileage, AC, Ethiopian import.' },
    { name: 'Suzuki Swift 2020', priceRange: [950000, 1750000], brands: ['Suzuki'], desc: 'Compact 2020 Suzuki Swift hatchback, fuel-efficient, perfect for Addis Ababa traffic.' },
    { name: 'Toyota Vitz 2017', priceRange: [550000, 950000], brands: ['Toyota'], desc: 'Reliable 2017 Toyota Vitz, manual transmission, economical, ideal for first-time buyers.' },
    { name: 'Yamaha Sport Motorcycle 250cc', priceRange: [85000, 250000], brands: ['Yamaha'], desc: 'Yamaha sport motorcycle, 250cc, sporty design, perfect for Ethiopian roads.' },
    { name: 'Bajaj Boxer 150cc', priceRange: [55000, 120000], brands: ['Bajaj'], desc: 'Bajaj Boxer 150cc motorcycle, fuel-efficient, popular Ethiopian moto-taxi choice.' },
    { name: 'Scooter 125cc', priceRange: [35000, 95000], brands: ['Honda', 'Yamaha'], desc: '125cc scooter, automatic, under-seat storage, perfect for city commuting.' },
    { name: 'Mountain Bike 27.5"', priceRange: [12000, 75000], brands: ['Trek', 'Giant', 'Specialized'], desc: '27.5-inch mountain bike with 21 gears, hydraulic disc brakes, alloy frame.' },
    { name: 'Brake Pad Set Front', priceRange: [1500, 8500], brands: ['Bosch', 'Ate'], desc: 'Front brake pad set for Toyota and Hyundai models, ceramic, low-dust.' },
    { name: 'Car Battery 12V 60Ah', priceRange: [4500, 15000], brands: ['Bosch', 'Varta', 'Amaron'], desc: '12V 60Ah maintenance-free car battery, 18-month warranty.' },
    { name: 'Engine Oil 5W-30 4L', priceRange: [2200, 6500], brands: ['Castrol', 'Shell', 'Mobil 1'], desc: 'Synthetic engine oil for petrol and diesel engines, 4L bottle.' },
    { name: 'Dash Cam Full HD', priceRange: [3500, 15000], brands: ['Xiaomi', 'Garmin'], desc: 'Full HD 1080p dash cam with night vision, G-sensor, loop recording.' },
    { name: 'Car Floor Mats Set 4pc', priceRange: [1200, 5500], brands: ['WeatherTech'], desc: 'Universal-fit rubber car floor mats, 4-piece set, easy to clean.' },
    { name: 'Phone Car Mount Magnetic', priceRange: [450, 2200], brands: ['Akaki Auto Parts', 'Xiaomi'], desc: 'Magnetic phone car mount with 360-degree rotation.' },
    { name: 'Car Air Freshener', priceRange: [150, 850], brands: ['Akaki Auto Parts'], desc: 'Long-lasting car air freshener, multiple fragrances available.' },
  ],
  Electronics: [
    { name: 'Smartphone', priceRange: [8000, 95000], brands: ['Tecno', 'Samsung', 'Apple', 'Huawei', 'Xiaomi'], desc: 'Latest smartphone with high-resolution camera, long battery life, and dual-SIM support for Ethiopian networks.' },
    { name: 'Feature Phone', priceRange: [800, 4500], brands: ['Nokia', 'Tecno', 'Itel'], desc: 'Durable feature phone with FM radio, torch, long battery life.' },
    { name: 'Tablet 10"', priceRange: [12000, 75000], brands: ['Samsung', 'Apple', 'Lenovo'], desc: '10-inch tablet with HD display, perfect for browsing, streaming, and light work.' },
    { name: 'Smart Watch', priceRange: [2500, 25000], brands: ['Apple', 'Samsung', 'Xiaomi', 'Huawei'], desc: 'Smart watch with heart rate, SpO2, sleep tracking, GPS, and notifications.' },
    { name: 'Laptop 15.6"', priceRange: [25000, 180000], brands: ['HP', 'Dell', 'Lenovo', 'Asus', 'Apple'], desc: '15.6-inch laptop with Intel Core i5/i7, 8GB RAM, 512GB SSD.' },
    { name: 'Gaming Laptop RTX', priceRange: [65000, 250000], brands: ['Asus', 'MSI', 'Lenovo'], desc: 'Gaming laptop with RTX graphics, 144Hz display, RGB keyboard.' },
    { name: 'Desktop PC Tower', priceRange: [45000, 180000], brands: ['HP', 'Dell', 'Lenovo'], desc: 'Office desktop PC with Intel Core i5, 8GB RAM, 1TB HDD, Windows 11 Pro.' },
    { name: '4K Monitor 27"', priceRange: [22000, 85000], brands: ['Asus', 'LG', 'Dell', 'Samsung'], desc: '27-inch 4K UHD monitor with HDR, USB-C, height-adjustable stand.' },
    { name: 'Laser Printer Wireless', priceRange: [12000, 55000], brands: ['HP', 'Canon', 'Brother', 'Epson'], desc: 'Wireless monochrome laser printer with auto-duplex, 30ppm, mobile printing.' },
    { name: 'Document Scanner', priceRange: [8500, 45000], brands: ['Canon', 'Epson', 'Fujitsu'], desc: 'High-speed document scanner, 25ppm, duplex, OCR software included.' },
    { name: 'WiFi Router AC1900', priceRange: [3500, 15000], brands: ['TP-Link', 'Asus', 'Cisco'], desc: 'Dual-band WiFi router with Gigabit ports, MU-MIMO, parental controls.' },
    { name: 'Network Switch 8-Port', priceRange: [2500, 12000], brands: ['TP-Link', 'Cisco', 'Netgear'], desc: '8-port Gigabit network switch, unmanaged, plug-and-play.' },
    { name: 'Smart TV 43"', priceRange: [18000, 85000], brands: ['Samsung', 'LG', 'Panasonic', 'Tecno'], desc: '4K Ultra HD Smart TV with built-in streaming apps and HDMI ports.' },
    { name: 'Soundbar 2.1', priceRange: [8500, 45000], brands: ['Sony', 'LG', 'Samsung'], desc: '2.1 channel soundbar with wireless subwoofer, Bluetooth, HDMI ARC.' },
    { name: 'Wireless Earbuds ANC', priceRange: [1500, 18000], brands: ['JBL', 'Sony', 'Apple', 'Tecno'], desc: 'Bluetooth wireless earbuds with ANC and 24h battery case.' },
    { name: 'Bluetooth Speaker', priceRange: [2000, 18000], brands: ['JBL', 'Sony', 'Philips'], desc: 'Portable waterproof Bluetooth speaker with deep bass and 12-hour playtime.' },
    { name: 'DSLR Camera 24MP', priceRange: [45000, 250000], brands: ['Canon', 'Nikon', 'Sony'], desc: '24MP DSLR camera with 18-55mm lens kit, 4K video.' },
    { name: 'Drone 4K', priceRange: [25000, 150000], brands: ['DJI'], desc: '4K camera drone with 30-min flight time, GPS, foldable design.' },
    { name: 'Gaming Console', priceRange: [35000, 75000], brands: ['Sony', 'Microsoft', 'Nintendo'], desc: 'Next-gen gaming console with 1TB storage, 4K gaming, controller included.' },
    { name: 'Phone Case Clear', priceRange: [200, 1800], brands: ['Samsung', 'Apple', 'Tecno'], desc: 'Crystal clear TPU phone case, anti-yellowing, drop protection.' },
    { name: 'Mechanical Keyboard RGB', priceRange: [3500, 18000], brands: ['Logitech', 'Corsair', 'Asus'], desc: 'Mechanical keyboard with Cherry MX switches, RGB backlight, programmable.' },
  ],
  Fashion: [
    { name: "Men's Cotton T-Shirt", priceRange: [400, 2500], brands: ['Nike', 'Adidas', 'Zara', 'Levis'], desc: '100% premium cotton t-shirt, breathable and soft. Available in multiple colors.' },
    { name: "Men's Formal Shirt", priceRange: [1200, 6500], brands: ['Tommy Hilfiger', 'Zara', 'Arrow'], desc: 'Long-sleeve formal shirt, wrinkle-resistant, perfect for office wear.' },
    { name: "Men's Jeans Slim Fit", priceRange: [1800, 8500], brands: ['Levis', 'Zara'], desc: 'Slim-fit denim jeans with stretch fabric for all-day comfort.' },
    { name: "Men's Leather Shoes", priceRange: [2500, 18000], brands: ['Clarks', 'Ecco'], desc: 'Genuine leather formal shoes, handcrafted, durable sole.' },
    { name: "Men's Watch Analog", priceRange: [1500, 65000], brands: ['Casio', 'Tommy Hilfiger', 'Fossil'], desc: 'Stainless steel analog watch with water resistance.' },
    { name: "Men's Leather Wallet", priceRange: [800, 6500], brands: ['Tommy Hilfiger', 'Gondar Leather'], desc: 'Genuine leather bifold wallet with card slots and coin pocket.' },
    { name: "Women's Habesha Dress", priceRange: [2500, 28000], brands: ['Habesha Crafts', 'Lalibela Handicrafts'], desc: 'Hand-woven authentic Habesha kemis with gold tibeb border, wedding-grade.' },
    { name: "Women's Casual Dress", priceRange: [1500, 12000], brands: ['Zara', 'H&M'], desc: 'Casual summer dress, lightweight fabric, multiple sizes available.' },
    { name: "Women's Heels", priceRange: [1800, 12000], brands: ['Steve Madden', 'Clarks'], desc: 'Elegant stiletto heels, comfortable fit, perfect for special occasions.' },
    { name: "Women's Handbag Leather", priceRange: [2500, 25000], brands: ['Gondar Leather', 'Louis Vuitton', 'Tommy Hilfiger'], desc: 'Genuine leather handbag with adjustable strap and multiple pockets.' },
    { name: "Women's Gold Necklace", priceRange: [8000, 75000], brands: ['Habesha Jewelry'], desc: '18K gold-plated handcrafted necklace with traditional Ethiopian design.' },
    { name: "Women's Sunglasses UV400", priceRange: [600, 12000], brands: ['Ray-Ban', 'Oakley'], desc: 'Polarized UV400 sunglasses, lightweight, scratch-resistant lenses.' },
    { name: "Kids' T-Shirt", priceRange: [350, 1500], brands: ['Nike', 'Adidas'], desc: "Soft cotton kids' t-shirt, ages 4-12, colorful designs." },
    { name: "Kids' Sneakers", priceRange: [1200, 6500], brands: ['Nike', 'Adidas', 'Puma'], desc: "Comfortable kids' sneakers with velcro straps, ages 4-12." },
    { name: "Baby Onesie 3-Pack", priceRange: [650, 2500], brands: ['H&M'], desc: 'Soft cotton baby onesies, 0-12 months, 3-pack assorted colors.' },
    { name: "Running Shoes Pro", priceRange: [3500, 22000], brands: ['Nike', 'Adidas', 'Puma'], desc: 'Lightweight running shoes with cushioned soles, breathable mesh upper.' },
  ],
  'Home & Furniture': [
    { name: '3-Seater Sofa Fabric', priceRange: [12000, 95000], brands: ['Nifas Silk Furniture', 'Sarbet Home Center', 'IKEA'], desc: 'Modern fabric 3-seater sofa with hardwood frame and high-density foam.' },
    { name: 'Coffee Table Glass', priceRange: [3500, 18000], brands: ['IKEA', 'Sarbet Home Center'], desc: 'Tempered glass coffee table with chrome legs, modern design.' },
    { name: 'TV Stand 180cm', priceRange: [4500, 22000], brands: ['IKEA'], desc: '180cm TV stand with shelves and cable management, fits 65" TVs.' },
    { name: 'Queen Bed Frame', priceRange: [8500, 45000], brands: ['IKEA', 'Sarbet Home Center'], desc: 'Queen-size wooden bed frame, slat base, no box spring needed.' },
    { name: 'Memory Foam Mattress Queen', priceRange: [6500, 35000], brands: ['IKEA', 'Serta'], desc: 'Queen memory foam mattress, medium-firm, 25cm thick, 10-year warranty.' },
    { name: 'Wardrobe 3-Door Mirror', priceRange: [12000, 55000], brands: ['IKEA'], desc: '3-door wardrobe with mirror, hanging rail, and adjustable shelves.' },
    { name: 'Dining Table 6-Seater', priceRange: [15000, 95000], brands: ['Nifas Silk Furniture'], desc: 'Solid wood 6-seater dining table with cushioned chairs.' },
    { name: 'Office Chair Ergonomic', priceRange: [4500, 35000], brands: ['IKEA', 'Herman Miller'], desc: 'Ergonomic office chair with lumbar support and breathable mesh.' },
    { name: 'Outdoor Patio Set 4pc', priceRange: [15000, 85000], brands: ['Nifas Silk Furniture'], desc: '4-piece outdoor patio furniture set with weather-resistant cushions.' },
    { name: 'Curtains Blackout 2pc', priceRange: [1500, 8500], brands: ['Sarbet Home Center'], desc: 'Blackout curtain set, 2 panels, 140x250cm, thermal insulated.' },
    { name: 'Persian Carpet 2x3m', priceRange: [5500, 45000], brands: ['Sarbet Home Center'], desc: 'Hand-woven Persian-style carpet, 2x3m, intricate traditional patterns.' },
    { name: 'LED Ceiling Light 36W', priceRange: [800, 6500], brands: ['Philips', 'IKEA'], desc: '36W LED ceiling light, remote-controlled, dimmable, 3 color modes.' },
    { name: 'Bath Towel Set 4pc', priceRange: [850, 4500], brands: ['IKEA'], desc: '4-piece cotton bath towel set, 600gsm, soft and absorbent.' },
  ],
  Appliances: [
    { name: 'Refrigerator 350L Double Door', priceRange: [25000, 95000], brands: ['Samsung', 'LG', 'Haier', 'Dawlance'], desc: '350L double-door refrigerator, frost-free, energy-efficient, inverter compressor.' },
    { name: 'Washing Machine 8kg Front Load', priceRange: [22000, 85000], brands: ['Samsung', 'LG', 'Bosch', 'Siemens'], desc: '8kg front-load washing machine, 1400 RPM, 15 wash programs, inverter.' },
    { name: 'Dryer 7kg Heat Pump', priceRange: [35000, 95000], brands: ['Samsung', 'LG', 'Bosch'], desc: '7kg heat pump tumble dryer, energy-efficient, gentle on clothes.' },
    { name: 'Electric Oven 60L', priceRange: [12000, 55000], brands: ['LG', 'Bosch', 'Mabe'], desc: '60L electric built-in oven with convection, rotisserie, grill function.' },
    { name: 'Gas Cooker 4-Burner', priceRange: [8500, 35000], brands: ['LG', 'Bosch', 'Mabe'], desc: '4-burner gas cooker with electric oven, auto-ignition, cast iron grates.' },
    { name: 'Microwave Oven 25L', priceRange: [6500, 25000], brands: ['LG', 'Samsung', 'Panasonic'], desc: '25L digital microwave with 10 power levels and defrost function.' },
    { name: 'Coffee Machine Espresso', priceRange: [8500, 65000], brands: ['Philips', 'DeLonghi', 'Braun'], desc: 'Automatic espresso machine with grinder, milk frother, 15-bar pump.' },
    { name: 'Water Dispenser Hot/Cold', priceRange: [5500, 18000], brands: ['LG', 'Cool Sport'], desc: 'Hot and cold water dispenser with child-safety lock, energy-efficient.' },
    { name: 'Air Conditioner 1.5 Ton Split', priceRange: [25000, 85000], brands: ['LG', 'Samsung', 'Midea', 'Gree'], desc: '1.5-ton inverter split AC, cooling + heating, eco mode, remote control.' },
    { name: 'Pedestal Fan 18"', priceRange: [1500, 6500], brands: ['LG', 'Panasonic', 'Westpoint'], desc: '18-inch pedestal fan with 3 speeds, oscillation, height adjustable.' },
    { name: 'Vacuum Cleaner Bagless', priceRange: [5500, 25000], brands: ['Philips', 'Bosch', 'LG'], desc: 'Bagless vacuum cleaner with HEPA filter, 2000W, 2L dust capacity.' },
    { name: 'Water Heater 50L', priceRange: [5500, 22000], brands: ['Ariston', 'Bradford White'], desc: '50L electric water heater, glass-lined tank, energy-efficient.' },
  ],
  Grocery: [
    { name: 'Ethiopian Yirgacheffe Coffee 1kg', priceRange: [800, 3500], brands: ['Tomoca Coffee Co.', 'Moyee', 'Garden of Coffee'], desc: 'Single-origin Yirgacheffe Arabica coffee beans, freshly roasted.' },
    { name: 'Berbere Spice Mix 500g', priceRange: [250, 850], brands: ['Dire Dawa Spices'], desc: 'Authentic Ethiopian berbere spice blend for traditional wot dishes.' },
    { name: 'Tej Honey 1L', priceRange: [550, 1800], brands: ['Jimma Honey', 'Wondo Genet'], desc: 'Pure organic raw honey from Ethiopian highlands, perfect for tej.' },
    { name: 'Injera Teff Flour 5kg', priceRange: [450, 1200], brands: ['Bambu'], desc: 'Teff flour for traditional injera, gluten-free, stone-ground.' },
    { name: 'Bottled Water 24 Pack', priceRange: [300, 750], brands: ['Highland', 'Awash Beverages'], desc: '24-pack of 500ml pure spring bottled water.' },
    { name: 'Pasta Spaghetti 500g', priceRange: [80, 450], brands: ['Bambu', 'Barilla'], desc: 'Durum wheat spaghetti, 500g pack, al dente texture.' },
    { name: 'Cooking Oil 5L', priceRange: [850, 2800], brands: ['Bambu', 'Filsan'], desc: 'Refined vegetable cooking oil, cholesterol-free.' },
    { name: 'Fresh Bananas 1kg', priceRange: [80, 250], brands: ['Bambu'], desc: 'Fresh ripe bananas, locally grown, picked daily.' },
    { name: 'Fresh Tomatoes 1kg', priceRange: [60, 200], brands: ['Bambu'], desc: 'Fresh ripe tomatoes, locally grown.' },
    { name: 'Fresh Beef 1kg', priceRange: [550, 1200], brands: ['Cmc Grocery'], desc: 'Fresh lean beef, locally sourced, butchered daily.' },
    { name: 'Fresh Fish Tilapia 1kg', priceRange: [350, 850], brands: ['Cmc Grocery'], desc: 'Fresh Nile tilapia, locally caught from Lake Tana.' },
    { name: 'Milk 1L Fresh', priceRange: [55, 120], brands: ['Mame', 'Shoa'], desc: 'Fresh pasteurized cow milk, 1L, daily delivery.' },
    { name: 'Fresh Eggs 30pk', priceRange: [350, 850], brands: ['Bambu'], desc: 'Fresh farm eggs, 30-pack, Grade A large.' },
    { name: 'Fresh Bread Loaf', priceRange: [50, 250], brands: ['Bambu'], desc: 'Freshly baked white bread loaf, soft and fluffy.' },
    { name: 'Coca-Cola 12 Pack', priceRange: [350, 750], brands: ['Awash Beverages', 'Coca-Cola'], desc: '12-pack of 330ml Coca-Cola cans.' },
    { name: 'Jasmine Rice 5kg', priceRange: [650, 1800], brands: ['Bambu'], desc: 'Premium jasmine rice, 5kg bag, fragrant and fluffy.' },
    { name: 'Wheat Flour 5kg', priceRange: [350, 850], brands: ['Bambu', 'Filsan'], desc: 'All-purpose wheat flour, 5kg, perfect for baking.' },
    { name: 'Frozen Chicken 1kg', priceRange: [450, 950], brands: ['Kality'], desc: 'Frozen whole chicken, halal, 1kg average weight.' },
  ],
  'Health & Beauty': [
    { name: 'Vitamin C Serum 30ml', priceRange: [800, 5500], brands: ['The Ordinary', "L'Oreal", 'Nivea'], desc: 'Brightening vitamin C serum for daily skincare routine.' },
    { name: 'Hair Oil Treatment', priceRange: [500, 4500], brands: ['Nivea', 'Shea Moisture', 'Lalibela Handicrafts'], desc: 'Natural hair oil with Ethiopian blackseed and argan.' },
    { name: 'Foundation Makeup SPF 15', priceRange: [1200, 7500], brands: ['Maybelline', "L'Oreal", 'MAC'], desc: 'Long-lasting matte foundation with SPF 15.' },
    { name: 'Eau de Parfum 100ml', priceRange: [3500, 35000], brands: ['Gucci', 'Louis Vuitton', 'Tommy Hilfiger'], desc: 'Eau de parfum with notes of jasmine, amber, and oud.' },
    { name: 'Sunscreen SPF 50', priceRange: [700, 4500], brands: ['Nivea', 'Neutrogena'], desc: 'Lightweight SPF 50 sunscreen, water-resistant, non-greasy.' },
    { name: 'Multivitamin 60 Tablets', priceRange: [800, 4500], brands: ['Centrum', 'Nestle'], desc: 'Daily multivitamin supplement supporting immune and energy.' },
    { name: 'Blood Pressure Monitor', priceRange: [3500, 15000], brands: ['Omron', 'Beurer'], desc: 'Digital upper-arm blood pressure monitor with 90-reading memory.' },
    { name: 'Whey Protein 2kg', priceRange: [5500, 18000], brands: ['Optimum Nutrition', 'MyProtein'], desc: 'Whey protein isolate, 2kg, 24g protein per serving.' },
    { name: 'Toothpaste Whitening', priceRange: [200, 1200], brands: ['Colgate', 'Sensodyne', 'Aquafresh'], desc: 'Whitening toothpaste with fluoride for daily use.' },
    { name: 'Hand Cream Moisturizing', priceRange: [350, 1800], brands: ['Nivea', "L'Oreal", 'Neutrogena'], desc: 'Moisturizing hand cream with shea butter, non-greasy.' },
    { name: 'Glucometer Kit', priceRange: [2200, 8500], brands: ['Accu-Chek', 'Omron'], desc: 'Blood glucose monitoring kit with 25 test strips and lancing device.' },
  ],
  'Sports & Outdoors': [
    { name: 'Football Size 5 FIFA', priceRange: [800, 5500], brands: ['Nike', 'Adidas', 'Puma'], desc: 'Match-quality size 5 football, FIFA approved, stitched panels.' },
    { name: 'Basketball Size 7', priceRange: [1200, 6500], brands: ['Spalding', 'Nike'], desc: 'Indoor/outdoor basketball size 7, premium composite leather.' },
    { name: 'Volleyball Official', priceRange: [850, 4500], brands: ['Mikasa', 'Nike'], desc: 'Official size volleyball, soft touch, indoor/outdoor.' },
    { name: 'Running Shoes Pro', priceRange: [5500, 28000], brands: ['Nike', 'Adidas', 'Asics'], desc: 'Professional running shoes with responsive cushioning and breathable mesh.' },
    { name: 'Mountain Bike 27.5"', priceRange: [12000, 95000], brands: ['Trek', 'Giant', 'Specialized'], desc: '27.5" mountain bike, 21-speed Shimano, hydraulic disc brakes.' },
    { name: 'Camping Tent 4P', priceRange: [4500, 25000], brands: ['Coleman', 'Highland Outdoor'], desc: '4-person waterproof camping tent, easy setup, lightweight.' },
    { name: 'Hiking Backpack 60L', priceRange: [4500, 18000], brands: ['Osprey', 'Highland Outdoor'], desc: '60L hiking backpack with rain cover, hydration-compatible.' },
    { name: 'Fishing Rod Combo', priceRange: [1500, 12000], brands: ['Shimano', 'Daiwa'], desc: 'Fishing rod and reel combo, medium action, includes tackle box.' },
    { name: 'Adjustable Dumbbells 20kg', priceRange: [5500, 22000], brands: ['Bowflex', 'Highland Outdoor'], desc: 'Adjustable dumbbells, 2-20kg per side, space-saving.' },
    { name: 'Yoga Mat Premium 6mm', priceRange: [800, 4500], brands: ['Adidas', 'Manduka'], desc: 'Non-slip 6mm yoga mat with carrying strap.' },
    { name: 'Swimming Goggles', priceRange: [350, 2500], brands: ['Speedo', 'Arena'], desc: 'Anti-fog swimming goggles with UV protection, leak-proof.' },
    { name: 'Treadmill Folding', priceRange: [35000, 150000], brands: ['NordicTrack', 'ProForm'], desc: 'Folding electric treadmill, 3HP, 16 kph, 12 preset programs.' },
  ],
  Books: [
    { name: 'Amharic Dictionary', priceRange: [550, 2200], brands: ['Megenagna Books'], desc: 'Comprehensive Amharic-English-Amharic dictionary, latest edition.' },
    { name: 'Educational Textbook Maths', priceRange: [350, 1800], brands: ['Megenagna Books'], desc: 'Grade 8-12 mathematics textbook, Ethiopian curriculum.' },
    { name: 'Business Strategy Book', priceRange: [650, 3500], brands: ['Penguin', 'HarperCollins'], desc: 'Bestselling business strategy book by leading authors.' },
    { name: 'Programming Book Python', priceRange: [850, 4500], brands: ["O'Reilly"], desc: 'Comprehensive Python programming guide, latest edition.' },
    { name: 'Fiction Novel Bestseller', priceRange: [450, 2500], brands: ['Penguin', 'HarperCollins'], desc: 'New York Times bestseller fiction novel.' },
    { name: 'Non-Fiction Biography', priceRange: [550, 3500], brands: ['Penguin'], desc: 'Bestselling biography of influential world leaders.' },
    { name: 'Religious Book Amharic', priceRange: [350, 1500], brands: ['Megenagna Books', 'Bible Society'], desc: 'Religious book in Amharic, spiritual growth guide.' },
    { name: "Children's Story Book", priceRange: [250, 950], brands: ['Megenagna Books'], desc: 'Illustrated Ethiopian folktales collection for children.' },
    { name: 'English Learning Book', priceRange: [450, 2200], brands: ['Cambridge', 'Oxford'], desc: 'English language learning book for intermediate learners.' },
  ],
  'Office Supplies': [
    { name: 'A4 Paper 5 Reams', priceRange: [1200, 3500], brands: ['Staples', 'Double A'], desc: '5 reams (2500 sheets) A4 80gsm white printer paper, jam-free.' },
    { name: 'Ballpoint Pens 50pk', priceRange: [250, 1200], brands: ['Bic', 'Pilot'], desc: '50-pack blue ballpoint pens, smooth-writing, 1.0mm tip.' },
    { name: 'Pencils HB 12pk', priceRange: [120, 650], brands: ['Staedtler', 'Faber-Castell'], desc: '12-pack HB pencils, perfect for school and office.' },
    { name: 'Notebook A5 200pg', priceRange: [120, 950], brands: ['Megenagna Books', 'Moleskine'], desc: 'Premium A5 lined notebook with hardcover and ribbon bookmark.' },
    { name: 'Office Chair Task', priceRange: [3500, 18000], brands: ['IKEA', 'Staples'], desc: 'Task office chair with lumbar support, mesh back, adjustable height.' },
    { name: 'Office Desk 140cm', priceRange: [6500, 35000], brands: ['IKEA'], desc: '140cm office desk with cable management, metal frame.' },
    { name: 'Filing Cabinet 3-Drawer', priceRange: [8500, 28000], brands: ['Staples', 'IKEA'], desc: '3-drawer metal filing cabinet with lock, accommodates A4.' },
    { name: 'Scientific Calculator', priceRange: [450, 2500], brands: ['Casio', 'Texas Instruments'], desc: 'Scientific calculator with 240+ functions, solar + battery.' },
  ],
  'Toys & Games': [
    { name: 'Building Blocks 500pc', priceRange: [1500, 9500], brands: ['Lego', 'Hasbro'], desc: '500-piece creative building blocks set, compatible with major brands.' },
    { name: 'Action Figure 6"', priceRange: [800, 5500], brands: ['Hasbro', 'Mattel'], desc: '6-inch posable action figure with accessories, collector-grade.' },
    { name: 'Doll with Accessories', priceRange: [950, 6500], brands: ['Mattel'], desc: 'Fashion doll with 5 outfits and accessories, ages 3+.' },
    { name: 'Board Game Family', priceRange: [1200, 7500], brands: ['Hasbro', 'Mattel'], desc: 'Family board game for 2-6 players, ages 8+, easy to learn.' },
    { name: 'RC Car Off-Road 4WD', priceRange: [2500, 15000], brands: ['Hasbro', 'Traxxas'], desc: '4WD remote control off-road car, water-resistant, 30 min runtime.' },
    { name: 'Educational Puzzle 100pc', priceRange: [450, 2500], brands: ['Hasbro', 'Ravensburger'], desc: '100-piece educational jigsaw puzzle, ages 5+.' },
    { name: 'Outdoor Swing Set', priceRange: [8500, 45000], brands: ['Little Tikes'], desc: 'Outdoor swing set with 2 swings and slide, ages 3-10.' },
    { name: 'Video Game Controller', priceRange: [3500, 12000], brands: ['Sony', 'Microsoft', 'Nintendo'], desc: 'Wireless gaming controller with haptic feedback, 40h battery.' },
  ],
  'Baby Products': [
    { name: 'Disposable Diapers 60pk', priceRange: [1200, 3500], brands: ['Pampers', 'Huggies'], desc: 'Soft absorbent diapers, sizes 3-6, 60-pack, 12h protection.' },
    { name: 'Baby Formula 900g', priceRange: [1500, 5500], brands: ['Nestle', 'Similac'], desc: 'Infant formula 0-6 months, 900g tin, easy-digest.' },
    { name: 'Baby Bottle Set 4pc', priceRange: [800, 4500], brands: ['Avent', 'Tommy Tippee'], desc: 'BPA-free baby bottle set, anti-colic, multiple sizes.' },
    { name: 'Baby Stroller Foldable', priceRange: [6500, 35000], brands: ['Chicco', 'Graco'], desc: 'Foldable baby stroller with canopy and storage basket.' },
    { name: 'Car Seat Infant', priceRange: [8500, 35000], brands: ['Chicco', 'Graco'], desc: 'Rear-facing infant car seat, side-impact protection, 0-13kg.' },
    { name: 'Teddy Bear Plush', priceRange: [600, 4500], brands: ['Lidet Baby Store'], desc: 'Soft cuddly teddy bear plush toy, child-safe materials.' },
    { name: 'Baby Lotion 500ml', priceRange: [450, 2200], brands: ['Johnson & Johnson', 'Cetaphil'], desc: 'Gentle baby lotion, hypoallergenic, fragrance-free.' },
  ],
  'Pet Supplies': [
    { name: 'Dry Dog Food 5kg', priceRange: [1800, 8500], brands: ['Pedigree', 'Royal Canin', 'Purina'], desc: 'Premium dry dog food for adult dogs, 5kg, balanced nutrition.' },
    { name: 'Wet Cat Food 12pk', priceRange: [1200, 5500], brands: ['Whiskas', 'Royal Canin'], desc: '12-pack of 85g wet cat food pouches, various flavors.' },
    { name: 'Dog Leash & Collar Set', priceRange: [550, 3500], brands: ['Petco'], desc: 'Adjustable dog collar with matching 1.2m leash, reflective.' },
    { name: 'Bird Cage Large', priceRange: [3500, 18000], brands: ['Petco'], desc: 'Large bird cage with stand, 60x40x80cm, includes perches.' },
    { name: 'Aquarium 100L Tank', priceRange: [5500, 25000], brands: ['Aquarium World'], desc: '100L glass aquarium with filter, LED light, and stand.' },
    { name: 'Cat Litter 10L', priceRange: [800, 4500], brands: ['Petco'], desc: 'Clumping cat litter, 10L, odor control, low-dust.' },
    { name: 'Dog Chew Toy', priceRange: [250, 1800], brands: ['Petco', 'Pedigree'], desc: 'Durable natural rubber dog chew toy, dental-clean design.' },
    { name: 'Pet Vitamins 90 Tablets', priceRange: [850, 4500], brands: ['Petco'], desc: 'Multivitamin tablets for dogs, supports joint and coat health.' },
  ],
  Agriculture: [
    { name: 'Hybrid Maize Seeds 5kg', priceRange: [550, 2500], brands: ['Ethiopian Seeds'], desc: 'High-yield hybrid maize seeds, 5kg bag, drought-resistant.' },
    { name: 'NPK Fertilizer 50kg', priceRange: [2200, 5500], brands: ['Dangote Agro', 'Ethio Agro'], desc: 'NPK 15-15-15 compound fertilizer, 50kg bag.' },
    { name: 'Hoe Farm Tool', priceRange: [250, 950], brands: ['Bosco Garden Center'], desc: 'Forged steel hoe with wooden handle, traditional Ethiopian design.' },
    { name: 'Drip Irrigation Kit 100m', priceRange: [5500, 25000], brands: ['Netafim', 'Greenfield Agriculture'], desc: '100m drip irrigation kit, includes filters, fittings, drippers.' },
    { name: 'Walking Tractor 12HP', priceRange: [85000, 250000], brands: ['Greenfield Agriculture'], desc: '12HP two-wheel walking tractor, diesel, multi-purpose farming.' },
    { name: 'Livestock Feed 50kg', priceRange: [1200, 4500], brands: ['Kality'], desc: 'Mixed livestock feed, 50kg bag, balanced nutrition for cattle.' },
    { name: 'Greenhouse Poly Film 200m²', priceRange: [5500, 18000], brands: ['Greenfield Agriculture'], desc: 'UV-stabilized greenhouse poly film, 200m² coverage, 5-year life.' },
  ],
  'Industrial & Construction': [
    { name: 'Cement OPC 50kg', priceRange: [450, 850], brands: ['Dangote Agro', 'Derba', 'Messebo'], desc: 'OPC 42.5N Portland cement, 50kg bag, Ethiopian standard.' },
    { name: 'Steel Rebar 12mm 12m', priceRange: [850, 2200], brands: ['Steely R&D', 'Steel Authority'], desc: '12mm deformed steel rebar, 12m length, for reinforced concrete.' },
    { name: 'Wall Paint 20L White', priceRange: [2500, 8500], brands: ['Hayat Rota', 'National Paints', 'Jotun'], desc: 'Premium interior acrylic wall paint, 20L, low-VOC.' },
    { name: 'Corrugated Roofing Sheet 3m', priceRange: [550, 1800], brands: ['Steel Authority'], desc: 'Galvanized corrugated roofing sheet, 3m length, 0.4mm thickness.' },
    { name: 'PVC Pipe 110mm 6m', priceRange: [850, 3500], brands: ['Cosmoplast'], desc: 'PVC drainage pipe, 110mm diameter, 6m length, durable.' },
    { name: 'Cordless Drill 18V', priceRange: [5500, 22000], brands: ['Makita', 'Bosch', 'Dewalt'], desc: '18V cordless drill with 2 batteries and 30 accessories.' },
    { name: 'Welding Machine 200A', priceRange: [8500, 35000], brands: ['Lincoln Electric', 'Bosch'], desc: '200A inverter ARC welding machine, IGBT, includes accessories.' },
    { name: 'Safety Helmet', priceRange: [250, 1500], brands: ['MSA', '3M'], desc: 'Industrial safety helmet, ABS material, adjustable ratchet.' },
    { name: 'Concrete Mixer 350L', priceRange: [35000, 95000], brands: ['Hyundai Heavy'], desc: '350L electric concrete mixer, drum rotation, heavy-duty.' },
  ],
  'Jewelry & Watches': [
    { name: '18K Gold Necklace', priceRange: [15000, 250000], brands: ['Habesha Jewelry'], desc: '18K gold handcrafted necklace with traditional Ethiopian design.' },
    { name: '925 Silver Ring', priceRange: [1200, 8500], brands: ['Gondar Silver'], desc: '925 sterling silver ring with cubic zirconia, handmade.' },
    { name: 'Diamond Engagement Ring', priceRange: [45000, 850000], brands: ['Cartier', 'Tiffany'], desc: 'Diamond engagement ring, 0.5-2 carat, 18K white gold band.' },
    { name: 'Gold Bracelet 22K', priceRange: [8500, 95000], brands: ['Habesha Jewelry'], desc: '22K gold bracelet, handcrafted, traditional Ethiopian patterns.' },
    { name: 'Pearl Earrings', priceRange: [1500, 12000], brands: ['Gondar Silver'], desc: 'Freshwater pearl earrings, 925 silver setting, elegant.' },
    { name: "Men's Luxury Watch", priceRange: [15000, 850000], brands: ['Rolex', 'Omega', 'Tag Heuer'], desc: 'Automatic luxury watch, sapphire crystal, 100m water-resistant.' },
    { name: 'Apple Watch Series 9', priceRange: [25000, 65000], brands: ['Apple'], desc: 'Apple Watch Series 9, GPS + Cellular, aluminum case.' },
  ],
  'Music & Instruments': [
    { name: 'Acoustic Guitar', priceRange: [5500, 45000], brands: ['Yamaha Guitars', 'Fender'], desc: 'Full-size acoustic guitar with spruce top, gig bag included.' },
    { name: 'Electric Guitar', priceRange: [12000, 95000], brands: ['Fender', 'Yamaha Guitars'], desc: 'Solid-body electric guitar with humbuckers, tremolo, cable.' },
    { name: 'Digital Keyboard 61-key', priceRange: [8500, 45000], brands: ['Yamaha Guitars', 'Casio'], desc: '61-key digital keyboard with 400 tones, 100 rhythms.' },
    { name: 'Electronic Drum Kit', priceRange: [25000, 95000], brands: ['Yamaha Guitars', 'Alesis'], desc: 'Compact electronic drum kit with mesh heads, 30 kits.' },
    { name: 'Condenser Microphone', priceRange: [3500, 22000], brands: ['Shure', 'Behringer', 'Audio-Technica'], desc: 'Large-diaphragm condenser microphone with shock mount.' },
    { name: 'DJ Controller 2-Channel', priceRange: [18000, 75000], brands: ['Pioneer', 'Numark'], desc: '2-channel DJ controller with Serato, USB, audio interface.' },
    { name: 'Audio Mixer 8ch', priceRange: [8500, 45000], brands: ['Behringer', 'Yamaha Guitars'], desc: '8-channel audio mixer with USB, 2 mic preamps, FX.' },
    { name: 'Masinko Traditional', priceRange: [1800, 8500], brands: ['Masinko Ethiopia'], desc: 'Traditional Ethiopian masinko single-string fiddle, hand-carved.' },
  ],
  'Arts & Crafts': [
    { name: 'Acrylic Paint Set 24 Colors', priceRange: [550, 3500], brands: ['Liquitex', 'Winsor & Newton'], desc: '24-color acrylic paint set, 12ml tubes, vibrant pigments.' },
    { name: 'Drawing Pencil Set 12pc', priceRange: [350, 2500], brands: ['Staedtler', 'Faber-Castell'], desc: '12-piece graphite drawing pencil set, 6B-4H range.' },
    { name: 'Sewing Machine Home', priceRange: [8500, 45000], brands: ['Singer', 'Brother'], desc: 'Home sewing machine with 27 built-in stitches, automatic needle.' },
    { name: 'Knitting Yarn Set 12 Colors', priceRange: [450, 2500], brands: ['Lion Brand'], desc: '12-color acrylic knitting yarn set, 50g per ball.' },
    { name: 'Canvas Pack 5pc', priceRange: [350, 2200], brands: ['Winsor & Newton'], desc: '5-piece stretched canvas pack, 30x40cm, 100% cotton.' },
    { name: 'Craft Glue Gun Kit', priceRange: [250, 1500], brands: ['Stanley'], desc: 'Hot melt glue gun kit with 30 glue sticks, 20W.' },
  ],
  'Real Estate': [
    { name: '3-Bedroom House for Sale — Bole', priceRange: [8500000, 25000000], brands: ['Addis Property'], desc: '3-bedroom house for sale in Bole, Addis Ababa. 250m², modern, gated compound.' },
    { name: '2-Bedroom Apartment Rent — Kazanchis', priceRange: [25000, 85000], brands: ['Bole Realty'], desc: '2-bedroom apartment for rent in Kazanchis, fully furnished, monthly.' },
    { name: 'Studio Apartment Sale — CMC', priceRange: [3500000, 9500000], brands: ['Addis Property'], desc: 'Studio apartment for sale in CMC Sumi, 65m², modern finish.' },
    { name: 'Commercial Shop Space — Mercato', priceRange: [35000, 250000], brands: ['Bole Realty'], desc: 'Commercial shop space for rent in Mercato, 80m², ground floor.' },
    { name: 'Land 500m² — Sululta', priceRange: [1500000, 8500000], brands: ['Addis Property'], desc: '500m² residential land for sale in Sululta, titled, ready to build.' },
    { name: 'Office Space Rent — Bole', priceRange: [55000, 350000], brands: ['Bole Realty'], desc: 'Office space for rent in Bole, 200m², furnished, high-speed internet.' },
  ],
  Services: [
    { name: 'Home Deep Cleaning Service', priceRange: [1500, 8500], brands: ['Addis Cleaning'], desc: 'Professional home deep cleaning service, 3BR house, eco-friendly products.' },
    { name: 'Plumbing Repair Service', priceRange: [500, 5500], brands: ['Addis Plumbers'], desc: 'Professional plumbing repair service, leak fixing, pipe installation.' },
    { name: 'Electrical Repair Home', priceRange: [500, 8500], brands: ['Addis Electric'], desc: 'Licensed electrician for home electrical repair and installation.' },
    { name: 'Car Repair Service', priceRange: [1500, 25000], brands: ['Bole Auto Service'], desc: 'Professional car repair service, diagnostics, oil change, brakes.' },
    { name: 'Computer Repair Service', priceRange: [500, 8500], brands: ['Addis Tech Repair'], desc: 'Computer and laptop repair, hardware + software, data recovery.' },
    { name: 'Logo Design Graphic', priceRange: [1500, 15000], brands: ['Addis Designs'], desc: 'Professional logo design with 3 concepts and unlimited revisions.' },
    { name: 'Wedding Photography', priceRange: [15000, 85000], brands: ['Golden Lens Photography'], desc: 'Wedding photography package, 8 hours, 500+ edited photos.' },
    { name: 'Event Planning Wedding', priceRange: [50000, 850000], brands: ['Addis Events'], desc: 'Full wedding event planning service, venue, catering, decorations.' },
    { name: 'Delivery Service Same-Day', priceRange: [150, 1200], brands: ['Addis Delivery'], desc: 'Same-day local delivery service in Addis Ababa, up to 20kg.' },
  ],
  'Digital Products': [
    { name: 'Microsoft Office 365 1-Year', priceRange: [4500, 9500], brands: ['Microsoft'], desc: 'Microsoft Office 365 Family subscription, 1-year, 6 users.' },
    { name: 'Antivirus Software 1-Year', priceRange: [1200, 5500], brands: ['Kaspersky', 'Norton', 'Bitdefender'], desc: 'Premium antivirus software, 1-year subscription, 3 devices.' },
    { name: 'eBook: Business Strategy', priceRange: [350, 1500], brands: ['Megenagna Books'], desc: 'Digital eBook download, business strategy guide, PDF + EPUB.' },
    { name: 'Online Course: Web Development', priceRange: [2500, 15000], brands: ['Udemy', 'Coursera'], desc: 'Complete web development online course, 50+ hours video.' },
    { name: 'Resume Template Pro', priceRange: [250, 1500], brands: ['Addis Designs'], desc: 'Professional resume template pack, 10 designs, editable.' },
    { name: 'Logo Design Template Pack', priceRange: [450, 3500], brands: ['Addis Designs'], desc: 'Editable logo template pack, 50 designs, AI + PSD + SVG.' },
    { name: 'Digital Art Print', priceRange: [350, 2500], brands: ['Lalibela Handicrafts'], desc: 'High-resolution digital art print, Ethiopian cultural theme.' },
    { name: 'Windows 11 Pro License', priceRange: [3500, 8500], brands: ['Microsoft'], desc: 'Genuine Windows 11 Pro OEM license key, lifetime activation.' },
  ],
  'Gift Shop': [
    { name: 'Gift Box Premium Ethiopian', priceRange: [1500, 12000], brands: ['Addis Gifts'], desc: 'Premium gift box with coffee, honey, and traditional crafts.' },
    { name: 'Flower Bouquet Roses 12pc', priceRange: [850, 5500], brands: ['Addis Flowers'], desc: 'Fresh rose bouquet, 12 stems, beautifully arranged, free delivery in Addis.' },
    { name: 'Greeting Card Set 10pc', priceRange: [250, 1200], brands: ['Addis Gifts'], desc: 'Set of 10 greeting cards for various occasions, handcrafted.' },
    { name: 'Personalized Photo Frame', priceRange: [550, 3500], brands: ['Addis Gifts'], desc: 'Personalized wooden photo frame with custom engraving.' },
    { name: 'Birthday Party Supplies Pack', priceRange: [850, 4500], brands: ['Addis Gifts'], desc: 'Complete birthday party supplies pack, plates, cups, balloons.' },
  ],
  'Wholesale & Bulk': [
    { name: 'Wholesale Smartphone Lot 10pc', priceRange: [80000, 750000], brands: ['Tecno', 'Samsung'], desc: 'Wholesale lot of 10 smartphones, mixed models, bulk pricing.' },
    { name: 'Wholesale Rice 50 Bags', priceRange: [35000, 95000], brands: ['Bambu'], desc: 'Wholesale: 50 bags of 25kg rice, bulk discount, free delivery.' },
    { name: 'Wholesale T-Shirts 100pc', priceRange: [35000, 250000], brands: ['Gola Shoes Ethiopia'], desc: 'Wholesale: 100 mixed t-shirts, bulk pricing, perfect for resale.' },
    { name: 'Wholesale Cement 100 Bags', priceRange: [45000, 85000], brands: ['Dangote Agro', 'Derba'], desc: 'Wholesale: 100 bags of OPC 42.5 cement, bulk pricing, delivery included.' },
    { name: 'Wholesale Paper 50 Reams', priceRange: [12000, 35000], brands: ['Double A'], desc: 'Wholesale: 50 reams A4 paper, bulk discount, business pricing.' },
  ],
  'Handmade & Local Products': [
    { name: 'Habesha Kemis Premium', priceRange: [4500, 35000], brands: ['Habesha Crafts', 'Lalibela Handicrafts'], desc: 'Hand-woven authentic Habesha kemis with gold tibeb border.' },
    { name: 'Yirgacheffe Green Coffee 5kg', priceRange: [2200, 8500], brands: ['Tomoca Coffee Co.', 'Garden of Coffee'], desc: 'Unroasted Yirgacheffe green coffee beans, premium grade 1.' },
    { name: 'Mitmita Spice 250g', priceRange: [180, 850], brands: ['Dire Dawa Spices'], desc: 'Authentic Ethiopian mitmita hot spice blend for kifto.' },
    { name: 'Leather Wallet Handmade', priceRange: [1200, 6500], brands: ['Gondar Leather'], desc: 'Hand-stitched Ethiopian leather wallet with card slots.' },
    { name: 'Cross Mesobe Basket', priceRange: [1500, 8500], brands: ['Lalibela Handicrafts'], desc: 'Hand-woven traditional Ethiopian mesobe food basket.' },
    { name: 'Tigray Cotton Netela', priceRange: [1800, 8500], brands: ['Lalibela Handicrafts', 'Habesha Crafts'], desc: 'Tigray-style cotton netela shawl with hand-embroidered border.' },
    { name: 'Wooden Coffee Table Carved', priceRange: [5500, 25000], brands: ['Lalibela Handicrafts'], desc: 'Hand-carved solid wood coffee table with traditional Ethiopian patterns.' },
    { name: 'Cultural Painting Framed', priceRange: [1500, 12000], brands: ['Lalibela Handicrafts'], desc: 'Original Ethiopian cultural painting, framed, signed by artist.' },
  ],
  'Marketplace Deals': [
    { name: 'Flash Sale Smartphone Bundle', priceRange: [5500, 55000], brands: ['Tecno', 'Samsung'], desc: 'Limited-time flash sale smartphone bundle with accessories. -40% off.' },
    { name: 'Clearance Home Appliances', priceRange: [3500, 45000], brands: ['LG', 'Samsung', 'Philips'], desc: 'Clearance sale on home appliances, last-chance items. -30% to -50% off.' },
    { name: 'Open Box TV 50"', priceRange: [22000, 65000], brands: ['Samsung', 'LG'], desc: 'Open-box 50" smart TV, customer return, full warranty, as-new condition.' },
    { name: 'Refurbished iPhone 13', priceRange: [35000, 65000], brands: ['Apple'], desc: 'Certified refurbished iPhone 13, 6-month warranty, like-new condition.' },
    { name: 'Best Seller Coffee Pack', priceRange: [1500, 5500], brands: ['Tomoca Coffee Co.'], desc: 'Best-selling Ethiopian coffee variety pack — Yirgacheffe, Sidamo, Harrar.' },
    { name: 'New Arrival Smart Watch', priceRange: [3500, 18000], brands: ['Apple', 'Samsung'], desc: 'Just-arrived smart watches, latest models, full warranty.' },
    { name: 'Featured Product Bundle', priceRange: [2500, 22000], brands: ['Various'], desc: 'Featured bundle deal — top products at discounted bundle price.' },
  ],
}

async function main() {
  console.log('🧹 Cleaning existing data...')
  const tables = ['VendorSubscription','VendorPackage','ModerationLog','AuditLog','Notification','Coupon','Banner','TicketMessage','Ticket','Delivery','Refund','Payment','OrderItem','Order','Wishlist','CartItem','Cart','Review','Product','Brand','Category','Withdrawal','Vendor','Address','User','Setting']
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
    // Vendors at indices 30, 31, 32 are PENDING (so admin has pending applications to review)
    // Vendors at indices 33, 34 are SUSPENDED, 35+ REJECTED (after the approved 29)
    const approved = i <= 29
    const isPending = i >= 30 && i <= 32
    const isSuspended = i >= 33 && i <= 34
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
        status: isPending ? 'PENDING' : isSuspended ? 'SUSPENDED' : approved ? 'APPROVED' : 'REJECTED',
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
  // Map each brand to one or more top-level categories it belongs to.
  // Brands not listed here fall back to "Uncategorized" (shown for all categories).
  const BRAND_CATEGORIES: Record<string, string[]> = {
    // Vehicles
    'Toyota': ['Vehicles'], 'Suzuki': ['Vehicles'], 'Honda': ['Vehicles', 'Industrial & Construction'],
    'Hyundai': ['Vehicles', 'Industrial & Construction'], 'Ford': ['Vehicles'],
    'Yamaha': ['Vehicles', 'Music & Instruments'], 'Bajaj': ['Vehicles'],
    'Varta': ['Vehicles'], 'Amaron': ['Vehicles'], 'Ate': ['Vehicles'],
    'WeatherTech': ['Vehicles'], 'Castrol': ['Vehicles'], 'Shell': ['Vehicles'], 'Mobil 1': ['Vehicles'],
    // Electronics
    'Tecno': ['Electronics'], 'Samsung': ['Electronics', 'Appliances'], 'Apple': ['Electronics', 'Jewelry & Watches'],
    'Huawei': ['Electronics'], 'Xiaomi': ['Electronics'], 'HP': ['Electronics', 'Office Supplies'],
    'Dell': ['Electronics', 'Office Supplies'], 'Lenovo': ['Electronics'], 'Sony': ['Electronics', 'Music & Instruments'],
    'JBL': ['Electronics', 'Music & Instruments'], 'Nokia': ['Electronics'], 'Itel': ['Electronics'],
    'Asus': ['Electronics'], 'Acer': ['Electronics'], 'MSI': ['Electronics'],
    'Logitech': ['Electronics', 'Office Supplies'], 'Canon': ['Electronics', 'Office Supplies'],
    'Epson': ['Electronics', 'Office Supplies'], 'Cisco': ['Electronics', 'Office Supplies'],
    'TP-Link': ['Electronics'], 'Seagate': ['Electronics'], 'Western Digital': ['Electronics'],
    'Intel': ['Electronics'], 'AMD': ['Electronics'], 'Nvidia': ['Electronics'],
    'Kingston': ['Electronics'], 'Corsair': ['Electronics'], 'Microsoft': ['Electronics', 'Digital Products', 'Office Supplies'],
    'LG': ['Electronics', 'Appliances'], 'Panasonic': ['Electronics', 'Appliances'],
    'Philips': ['Electronics', 'Appliances'], 'Braun': ['Appliances', 'Health & Beauty'],
    'Bosch': ['Appliances', 'Industrial & Construction', 'Vehicles'], 'Siemens': ['Appliances', 'Industrial & Construction'],
    'DJI': ['Electronics'], 'Garmin': ['Electronics', 'Sports & Outdoors'], 'Anker': ['Electronics'],
    'Fujitsu': ['Electronics', 'Office Supplies'], 'Netgear': ['Electronics'],
    'Nintendo': ['Electronics', 'Toys & Games'],
    // Fashion
    'Nike': ['Fashion', 'Sports & Outdoors'], 'Adidas': ['Fashion', 'Sports & Outdoors'],
    'Puma': ['Fashion', 'Sports & Outdoors'], 'Gucci': ['Fashion', 'Jewelry & Watches'],
    'Louis Vuitton': ['Fashion', 'Jewelry & Watches'], 'Tommy Hilfiger': ['Fashion', 'Jewelry & Watches'],
    'Levis': ['Fashion'], 'Zara': ['Fashion'], 'H&M': ['Fashion', 'Baby Products'],
    'Clarks': ['Fashion'], 'Ecco': ['Fashion'], 'Steve Madden': ['Fashion'],
    'Ray-Ban': ['Fashion'], 'Oakley': ['Fashion', 'Sports & Outdoors'],
    'Casio': ['Fashion', 'Jewelry & Watches', 'Music & Instruments'], 'Fossil': ['Fashion', 'Jewelry & Watches'],
    'Arrow': ['Fashion'],
    // Home & Furniture
    'IKEA': ['Home & Furniture', 'Office Supplies'], 'Herman Miller': ['Home & Furniture', 'Office Supplies'],
    'Serta': ['Home & Furniture'],
    // Appliances
    'Haier': ['Appliances'], 'Dawlance': ['Appliances'], 'Mabe': ['Appliances'], 'Midea': ['Appliances'],
    'Gree': ['Appliances'], 'DeLonghi': ['Appliances'], 'Westpoint': ['Appliances'],
    'Ariston': ['Appliances'], 'Bradford White': ['Appliances'], 'Cool Sport': ['Appliances'],
    // Grocery
    'Nestle': ['Grocery', 'Baby Products'], 'Heineken': ['Grocery'], 'Bambu': ['Grocery', 'Wholesale & Bulk'],
    'Megenagna': ['Grocery', 'Books'], 'Kuraz': ['Grocery'], 'Tomoca Coffee Co.': ['Grocery', 'Handmade & Local Products'],
    'Moyee': ['Grocery', 'Handmade & Local Products'], 'Garden of Coffee': ['Grocery', 'Handmade & Local Products'],
    'Buna Buna': ['Grocery'], 'Coca-Cola': ['Grocery'], 'Barilla': ['Grocery'],
    'Filsan': ['Grocery'], 'Double A': ['Grocery', 'Office Supplies', 'Wholesale & Bulk'],
    'Kality': ['Grocery', 'Agriculture'], 'Mame': ['Grocery'], 'Shoa': ['Grocery'],
    // Health & Beauty
    "L'Oreal": ['Health & Beauty'], 'Nivea': ['Health & Beauty'], 'Maybelline': ['Health & Beauty'],
    'MAC': ['Health & Beauty'], 'Neutrogena': ['Health & Beauty'], "Johnson & Johnson": ['Health & Beauty', 'Baby Products'],
    'Cetaphil': ['Health & Beauty', 'Baby Products'], 'Centrum': ['Health & Beauty'],
    'Omron': ['Health & Beauty'], 'Beurer': ['Health & Beauty'], 'Optimum Nutrition': ['Health & Beauty'],
    'MyProtein': ['Health & Beauty'], 'Sensodyne': ['Health & Beauty'], 'Aquafresh': ['Health & Beauty'],
    'Colgate': ['Health & Beauty'], 'Shea Moisture': ['Health & Beauty'], 'The Ordinary': ['Health & Beauty'],
    'Accu-Chek': ['Health & Beauty'],
    // Sports & Outdoors
    'Spalding': ['Sports & Outdoors'], 'Asics': ['Sports & Outdoors'], 'Coleman': ['Sports & Outdoors'],
    'Osprey': ['Sports & Outdoors'], 'Shimano': ['Sports & Outdoors'], 'Daiwa': ['Sports & Outdoors'],
    'Bowflex': ['Sports & Outdoors'], 'Speedo': ['Sports & Outdoors'], 'Arena': ['Sports & Outdoors'],
    'Manduka': ['Sports & Outdoors'], 'Trek': ['Sports & Outdoors', 'Vehicles'],
    'Giant': ['Sports & Outdoors', 'Vehicles'], 'Specialized': ['Sports & Outdoors', 'Vehicles'],
    'Mikasa': ['Sports & Outdoors'], 'NordicTrack': ['Sports & Outdoors'], 'ProForm': ['Sports & Outdoors'],
    // Books
    'Penguin': ['Books'], 'HarperCollins': ['Books'], "O'Reilly": ['Books'],
    'Cambridge': ['Books'], 'Oxford': ['Books'], 'Bible Society': ['Books'], 'Moleskine': ['Books', 'Office Supplies'],
    // Office Supplies
    'Bic': ['Office Supplies'], 'Pilot': ['Office Supplies'], 'Staedtler': ['Office Supplies', 'Arts & Crafts'],
    'Faber-Castell': ['Office Supplies', 'Arts & Crafts'], 'Staples': ['Office Supplies'],
    'Texas Instruments': ['Office Supplies'],
    // Toys & Games
    'Lego': ['Toys & Games'], 'Hasbro': ['Toys & Games'], 'Mattel': ['Toys & Games'],
    'Traxxas': ['Toys & Games'], 'Little Tikes': ['Toys & Games'], 'Ravensburger': ['Toys & Games'],
    'PlayStation': ['Toys & Games', 'Electronics'], 'Xbox': ['Toys & Games', 'Electronics'],
    // Baby Products
    'Pampers': ['Baby Products'], 'Huggies': ['Baby Products'], 'Avent': ['Baby Products'],
    'Tommy Tippee': ['Baby Products'], 'Chicco': ['Baby Products'], 'Graco': ['Baby Products'],
    'Similac': ['Baby Products'], "Carter's": ['Baby Products'],
    // Pet Supplies
    'Pedigree': ['Pet Supplies'], 'Whiskas': ['Pet Supplies'], 'Royal Canin': ['Pet Supplies'],
    'Purina': ['Pet Supplies'], 'Petco': ['Pet Supplies'], 'Aquarium World': ['Pet Supplies'],
    // Agriculture
    'Ethiopian Seeds': ['Agriculture'], 'Dangote Agro': ['Agriculture', 'Industrial & Construction'],
    'Greenfield Agriculture': ['Agriculture'], 'Netafim': ['Agriculture'], 'Ethio Agro': ['Agriculture'],
    // Industrial & Construction
    'Derba': ['Industrial & Construction', 'Wholesale & Bulk'], 'Messebo': ['Industrial & Construction'],
    'Steely R&D': ['Industrial & Construction'], 'Steel Authority': ['Industrial & Construction'],
    'Hayat Rota': ['Industrial & Construction'], 'National Paints': ['Industrial & Construction'],
    'Jotun': ['Industrial & Construction'], 'Cosmoplast': ['Industrial & Construction'],
    'Lincoln Electric': ['Industrial & Construction'], 'MSA': ['Industrial & Construction'],
    '3M': ['Industrial & Construction', 'Health & Beauty'], 'Hyundai Heavy': ['Industrial & Construction'],
    'Makita': ['Industrial & Construction'], 'Dewalt': ['Industrial & Construction'],
    'Stanley': ['Industrial & Construction', 'Arts & Crafts'],
    // Jewelry & Watches
    'Habesha Jewelry': ['Jewelry & Watches', 'Handmade & Local Products'], 'Gondar Silver': ['Jewelry & Watches'],
    'Cartier': ['Jewelry & Watches'], 'Tiffany': ['Jewelry & Watches'],
    'Rolex': ['Jewelry & Watches'], 'Omega': ['Jewelry & Watches'], 'Tag Heuer': ['Jewelry & Watches'],
    // Music & Instruments
    'Yamaha Guitars': ['Music & Instruments'], 'Fender': ['Music & Instruments'],
    'Behringer': ['Music & Instruments'], 'Shure': ['Music & Instruments'],
    'Audio-Technica': ['Music & Instruments'], 'Pioneer': ['Music & Instruments'],
    'Numark': ['Music & Instruments'], 'Alesis': ['Music & Instruments'],
    'Masinko Ethiopia': ['Music & Instruments', 'Handmade & Local Products'],
    // Arts & Crafts
    'Liquitex': ['Arts & Crafts'], 'Winsor & Newton': ['Arts & Crafts'],
    'Lion Brand': ['Arts & Crafts'], 'Singer': ['Arts & Crafts'], 'Brother': ['Arts & Crafts', 'Office Supplies'],
    // Real Estate
    'Addis Property': ['Real Estate'], 'Bole Realty': ['Real Estate'], 'Cmc Real Estate': ['Real Estate'],
    // Services
    'Addis Cleaning': ['Services'], 'Addis Plumbers': ['Services'], 'Addis Electric': ['Services'],
    'Bole Auto Service': ['Services'], 'Addis Tech Repair': ['Services'],
    'Addis Designs': ['Services', 'Digital Products'], 'Golden Lens Photography': ['Services'],
    'Addis Events': ['Services'], 'Addis Delivery': ['Services', 'Gift Shop'],
    // Digital Products
    'Kaspersky': ['Digital Products'], 'Norton': ['Digital Products'], 'Bitdefender': ['Digital Products'],
    'Udemy': ['Digital Products'], 'Coursera': ['Digital Products'],
    // Gift Shop
    'Addis Gifts': ['Gift Shop'], 'Addis Flowers': ['Gift Shop'],
    // Handmade & Local
    'Lalibela Handicrafts': ['Handmade & Local Products', 'Home & Furniture'],
    'Habesha Crafts': ['Handmade & Local Products', 'Fashion'],
    'Dire Dawa Spices': ['Handmade & Local Products', 'Grocery'],
    'Gondar Leather': ['Handmade & Local Products', 'Fashion'],
    'Jimma Honey': ['Handmade & Local Products', 'Grocery'],
    'Wondo Genet': ['Handmade & Local Products', 'Grocery'],
    // Wholesale uses brands from many categories — no mapping needed
  }

  const brandMap = new Map<string, any>()
  for (const b of BRANDS) {
    const cats = BRAND_CATEGORIES[b] || []
    const catIds = cats.map(c => categoryMap.get(c)?.id).filter(Boolean)
    brandMap.set(b, await db.brand.create({
      data: {
        name: b,
        slug: b.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        logo: img(`brand-${b}`, 200, 200),
        country: 'Various',
        active: true,
        categoryIds: catIds.length > 0 ? JSON.stringify(catIds) : null,
      }
    }))
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
        shippingAddress: (() => {
          const region = REGIONS[Math.floor(Math.random()*REGIONS.length)]
          const cities = CITIES[region] || ['Addis Ababa']
          const city = cities[Math.floor(Math.random()*cities.length)]
          return JSON.stringify({ region, city, subCity: city === 'Addis Ababa' ? ['Bole','Arada','Yeka','Kirkos','Piazza'][Math.floor(Math.random()*5)] : city + ' 01', area: '', detail: 'House 123', phone: cust.phone || '+251911000000' })
        })(),
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
  await db.banner.create({ data: { title: 'Ethiopian Coffee Festival', image: img('banner-coffee', 1400, 500), link: '/products?cat=grocery', position: 'HOME_HERO', order: 1 } })
  await db.banner.create({ data: { title: 'Tech Deals Week', image: img('banner-tech', 1400, 500), link: '/products?cat=electronics', position: 'HOME_HERO', order: 2 } })
  await db.banner.create({ data: { title: 'Made in Ethiopia', image: img('banner-ethio', 1400, 500), link: '/products?cat=handmade-local-products', position: 'HOME_HERO', order: 3 } })
  await db.banner.create({ data: { title: 'Vehicle Deals', image: img('banner-vehicles', 1400, 500), link: '/products?cat=vehicles', position: 'HOME_HERO', order: 4 } })
  await db.banner.create({ data: { title: 'Home & Furniture Sale', image: img('banner-home', 1400, 500), link: '/products?cat=home-furniture', position: 'HOME_HERO', order: 5 } })
  await db.banner.create({ data: { title: 'Appliances Mega Sale', image: img('banner-appliances', 1400, 500), link: '/products?cat=appliances', position: 'HOME_HERO', order: 6 } })
  await db.banner.create({ data: { title: 'Fashion Week', image: img('banner-fashion', 1400, 500), link: '/products?cat=fashion', position: 'HOME_HERO', order: 7 } })
  await db.banner.create({ data: { title: 'Flash Deals', image: img('banner-deals', 1400, 500), link: '/products?cat=marketplace-deals', position: 'HOME_HERO', order: 8 } })
  await db.banner.create({ data: { title: 'Real Estate Listings', image: img('banner-realestate', 1400, 500), link: '/products?cat=real-estate', position: 'HOME_HERO', order: 9 } })
  await db.banner.create({ data: { title: 'Agriculture Supplies', image: img('banner-agriculture', 1400, 500), link: '/products?cat=agriculture', position: 'HOME_HERO', order: 10 } })

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

  console.log('📦 Creating vendor packages...')
  const packages = [
    {
      name: 'Starter', slug: 'starter',
      description: 'Perfect for small businesses just getting started online. List up to 50 products and start selling across Ethiopia.',
      priceMonthly: 500, priceYearly: 5000,
      productLimit: 50, storageLimitMb: 500, imageLimit: 5, videoLimit: 0,
      staffAccounts: 1, warehouses: 1, commissionRate: 10,
      order: 1, active: true, popular: false,
      features: JSON.stringify(['basic_dashboard', 'basic_analytics', 'chapa_payments', 'email_support', 'standard_commission']),
    },
    {
      name: 'Professional', slug: 'professional',
      description: 'For growing businesses ready to scale. List up to 500 products, run promotions, and lower your commission rate.',
      priceMonthly: 1500, priceYearly: 15000,
      productLimit: 500, storageLimitMb: 2000, imageLimit: 10, videoLimit: 1,
      staffAccounts: 3, warehouses: 2, commissionRate: 8,
      order: 2, active: true, popular: true,
      features: JSON.stringify(['basic_dashboard', 'advanced_analytics', 'promotions', 'coupons', 'store_banner', 'priority_approval', 'lower_commission', 'featured_products', 'chapa_payments', 'priority_support']),
    },
    {
      name: 'Business', slug: 'business',
      description: 'For established businesses that need unlimited products, API access, bulk upload, and premium analytics.',
      priceMonthly: 3000, priceYearly: 30000,
      productLimit: -1, storageLimitMb: 10000, imageLimit: 20, videoLimit: 5,
      staffAccounts: 10, warehouses: 5, commissionRate: 5,
      order: 3, active: true, popular: false,
      features: JSON.stringify(['unlimited_products', 'unlimited_categories', 'premium_analytics', 'api_access', 'bulk_upload', 'advanced_reports', 'store_verification_badge', 'featured_store', 'priority_support', 'lowest_commission', 'chapa_payments', 'promotions', 'coupons', 'store_banner']),
    },
    {
      name: 'Enterprise', slug: 'enterprise',
      description: 'Custom solution for large enterprises with multiple stores, warehouses, ERP integration, and dedicated account manager.',
      priceMonthly: 0, priceYearly: 0, // Custom pricing
      productLimit: -1, storageLimitMb: -1, imageLimit: -1, videoLimit: -1,
      staffAccounts: -1, warehouses: -1, commissionRate: 3,
      order: 4, active: true, popular: false,
      features: JSON.stringify(['unlimited_everything', 'multiple_store_managers', 'multiple_warehouses', 'dedicated_account_manager', 'custom_commission', 'custom_integrations', 'erp_integration', 'highest_search_ranking', 'vip_support']),
    },
  ]
  const packageMap: Record<string, any> = {}
  for (const p of packages) {
    packageMap[p.slug] = await db.vendorPackage.create({ data: p })
  }

  console.log('🎫 Creating vendor subscription for demo vendor...')
  // The demo vendor (Addis Tech Hub) has an active Professional subscription
  const now = new Date()
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  await db.vendorSubscription.create({
    data: {
      vendorId: vendors[0].id,
      packageId: packageMap['professional'].id,
      status: 'ACTIVE',
      billingCycle: 'MONTHLY',
      amountPaid: 1500,
      paymentRef: 'CHAPA-PROFESS-' + Math.random().toString(36).substring(2, 12).toUpperCase(),
      paymentProvider: 'chapa',
      paymentMethod: 'mobile',
      startedAt: now,
      expiresAt,
      autoRenew: true,
      businessInfo: JSON.stringify({
        businessName: 'Addis Tech Hub PLC',
        businessType: 'COMPANY',
        licenseNumber: 'AA/14/0034567',
        tinNumber: '0001234567',
        vatNumber: '0001234567001',
        address: 'Bole, Addis Ababa',
        region: 'Addis Ababa', city: 'Addis Ababa', subCity: 'Bole',
        woreda: 'Woreda 03', postalCode: '1000',
      }),
      bankInfo: JSON.stringify({
        bankName: 'Commercial Bank of Ethiopia',
        accountHolder: 'Addis Tech Hub PLC',
        accountNumber: '1000-2034-567890',
        chapaAccount: 'addistechhub@chapa.et',
      }),
      storeInfo: JSON.stringify({
        storeName: 'Addis Tech Hub',
        storeDescription: 'Authorized electronics retailer in Addis Ababa since 2015.',
        storeAddress: 'Bole Road, Addis Ababa',
        businessHours: 'Mon-Sat 9:00-19:00',
      }),
      documents: JSON.stringify({
        nationalId: 'https://picsum.photos/seed/id-card/400/300',
        businessLicense: 'https://picsum.photos/seed/license/400/300',
        tinCertificate: 'https://picsum.photos/seed/tin-cert/400/300',
        storePhoto: 'https://picsum.photos/seed/store-photo/600/400',
        selfieVerification: 'https://picsum.photos/seed/selfie/400/400',
      }),
      reviewedBy: admin.id,
      reviewNote: 'Documents verified. Approved.',
      reviewedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    },
  })

  // Also create pending subscriptions for all pending vendors (so admin has queue to review)
  const pendingVendors = vendors.filter((v: any) => v.status === 'PENDING')
  const pkgSlugs = ['starter', 'professional', 'business']
  for (let pi = 0; pi < pendingVendors.length; pi++) {
    const pendingVendor = pendingVendors[pi]
    const pkgSlug = pkgSlugs[pi % pkgSlugs.length]
    const pkg = packageMap[pkgSlug]
    if (!pendingVendor || !pkg) continue
    await db.vendorSubscription.create({
      data: {
        vendorId: pendingVendor.id,
        packageId: pkg.id,
        status: 'PENDING_APPROVAL',
        billingCycle: 'MONTHLY',
        amountPaid: pkg.priceMonthly,
        paymentRef: `CHAPA-${pkg.slug.toUpperCase()}-${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
        paymentProvider: 'chapa',
        paymentMethod: pi % 2 === 0 ? 'mobile' : 'transfer',
        startedAt: now,
        expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        autoRenew: false,
        businessInfo: JSON.stringify({
          businessName: pendingVendor.storeName,
          businessType: 'SME',
          licenseNumber: `AA/14/00${80000+pi}`,
          tinNumber: `000${80000+pi}0000`,
          address: 'Bole, Addis Ababa',
          region: 'Addis Ababa', city: 'Addis Ababa', subCity: ['Bole','Yeka','Kirkos','Arada'][pi % 4],
          woreda: `Woreda ${pi+1}`, postalCode: '1000',
        }),
        bankInfo: JSON.stringify({
          bankName: ['Commercial Bank of Ethiopia','Dashen Bank','Bank of Abyssinia','Awash Bank'][pi % 4],
          accountHolder: pendingVendor.storeName,
          accountNumber: `1000-${2000+pi}-${30000+pi}`,
        }),
        storeInfo: JSON.stringify({
          storeName: pendingVendor.storeName,
          storeDescription: `${pendingVendor.storeName} — quality products at fair prices for Ethiopian customers.`,
          storeAddress: 'Bole Road, Addis Ababa',
          businessHours: 'Mon-Sat 9:00-19:00',
        }),
        documents: JSON.stringify({
          nationalId: `https://picsum.photos/seed/${pendingVendor.slug}-id/400/300`,
          businessLicense: `https://picsum.photos/seed/${pendingVendor.slug}-license/400/300`,
          tinCertificate: `https://picsum.photos/seed/${pendingVendor.slug}-tin/400/300`,
          storePhoto: `https://picsum.photos/seed/${pendingVendor.slug}-store/600/400`,
          selfieVerification: pi === 0 ? `https://picsum.photos/seed/${pendingVendor.slug}-selfie/400/400` : undefined,
        }),
      },
    })
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
