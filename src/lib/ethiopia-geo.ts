// Real Ethiopia administrative geography
// 12 regional states + 2 chartered cities (federal administration)
// Source: Ethiopian Federal Government regional structure (post-2023 reorganization)

export interface SubCity { name: string }
export interface City { name: string; subCities?: string[] }
export interface Region {
  code: string
  name: string
  type: 'REGION' | 'CHARTERED_CITY'
  capital: string
  cities: City[]
}

export const ETHIOPIA_REGIONS: Region[] = [
  {
    code: 'addis_ababa',
    name: 'Addis Ababa',
    type: 'CHARTERED_CITY',
    capital: 'Addis Ababa',
    cities: [
      {
        name: 'Addis Ababa',
        subCities: [
          'Addis Ketema', 'Akaky Kaliti', 'Arada', 'Bole', 'Gulele',
          'Kirkos', 'Kolfe Keranio', 'Lideta', 'Nifas Silk-Lafto', 'Yeka',
        ],
      },
    ],
  },
  {
    code: 'dire_dawa',
    name: 'Dire Dawa',
    type: 'CHARTERED_CITY',
    capital: 'Dire Dawa',
    cities: [
      { name: 'Dire Dawa', subCities: ['Kezira', 'Megala', 'Sabian', 'Gefre Ager', 'Biyo Awash', 'Melka Jebdu'] },
    ],
  },
  {
    code: 'oromia',
    name: 'Oromia',
    type: 'REGION',
    capital: 'Adama',
    cities: [
      { name: 'Adama', subCities: ['Abba Gada', 'Boku Kuteba', 'Dhadacha Abbafoo', 'Lugo', 'Biftu Selaltu'] },
      { name: 'Jimma', subCities: ['Ginjo Guduru', 'Hermata Mentina', 'Bosa Kito', 'Mendera', 'Kochi'] },
      { name: 'Ambo', subCities: ['Ambo 01', 'Ambo 02', 'Ambo 03', 'Ambo 04'] },
      { name: 'Nekemte', subCities: ['Boshe Leku', 'Burka Jato', 'Hackim Gara', 'Leku'] },
      { name: 'Shashamane', subCities: ['Shashamane 01', 'Shashamane 02', 'Shashamane 03', 'Shashamane 04'] },
      { name: 'Bale Robe', subCities: ['Robe 01', 'Robe 02', 'Robe 03'] },
      { name: 'Asella', subCities: ['Asella 01', 'Asella 02', 'Asella 03'] },
      { name: 'Adama Crka', subCities: ['Crka 01', 'Crka 02'] },
      { name: 'Sebeta', subCities: ['Sebeta 01', 'Sebeta 02', 'Sebeta 03'] },
      { name: 'Bishoftu', subCities: ['Bishoftu 01', 'Bishoftu 02', 'Bishoftu 03'] },
      { name: 'Ziway', subCities: ['Ziway 01', 'Ziway 02'] },
      { name: 'Wolisoo', subCities: ['Wolisoo 01', 'Wolisoo 02'] },
      { name: 'Gimbi', subCities: ['Gimbi 01', 'Gimbi 02'] },
      { name: 'Dembi Dolo', subCities: ['Dembi Dolo 01', 'Dembi Dolo 02'] },
      { name: 'Goba', subCities: ['Goba 01', 'Goba 02'] },
      { name: 'Ginir', subCities: ['Ginir 01'] },
      { name: 'Gutu', subCities: ['Gutu 01'] },
      { name: 'Chiro', subCities: ['Chiro 01', 'Chiro 02'] },
      { name: 'Gelemso', subCities: ['Gelemso 01'] },
    ],
  },
  {
    code: 'amhara',
    name: 'Amhara',
    type: 'REGION',
    capital: 'Bahir Dar',
    cities: [
      { name: 'Bahir Dar', subCities: ['Tana', 'Gelgel Abay', 'Zegetam', 'Gishe Abay', 'Hidar 11', 'Seto Semma', 'Achefer', 'Yebokela', 'Enibara', 'Fogera'] },
      { name: 'Gondar', subCities: ['Gondar 01', 'Gondar 02', 'Gondar 03', 'Gondar 04', 'Gondar 05', 'Gondar 06'] },
      { name: 'Dessie', subCities: ['Dessie 01', 'Dessie 02', 'Dessie 03', 'Dessie 04'] },
      { name: 'Debre Markos', subCities: ['Debre Markos 01', 'Debre Markos 02', 'Debre Markos 03'] },
      { name: 'Debre Birhan', subCities: ['Debre Birhan 01', 'Debre Birhan 02', 'Debre Birhan 03'] },
      { name: 'Woldia', subCities: ['Woldia 01', 'Woldia 02'] },
      { name: 'Kombolcha', subCities: ['Kombolcha 01', 'Kombolcha 02'] },
      { name: 'Debre Tabor', subCities: ['Debre Tabor 01', 'Debre Tabor 02'] },
      { name: 'Finote Selam', subCities: ['Finote Selam 01'] },
      { name: 'Bahirdar Zuria', subCities: ['Zuria 01'] },
      { name: 'Metema', subCities: ['Metema 01'] },
      { name: 'Humera', subCities: ['Humera 01'] },
      { name: 'Shire Inda Selassie', subCities: ['Shire 01', 'Shire 02'] },
      { name: 'Wogera', subCities: ['Wogera 01'] },
      { name: 'Lalibela', subCities: ['Lalibela 01'] },
      { name: 'Amba Mariam', subCities: ['Amba Mariam 01'] },
    ],
  },
  {
    code: 'tigray',
    name: 'Tigray',
    type: 'REGION',
    capital: 'Mekelle',
    cities: [
      { name: 'Mekelle', subCities: ['Hawelti', 'Hadnet', 'Adi Haki', 'Aynalem', 'Kwiha', 'Sinke'] },
      { name: 'Adwa', subCities: ['Adwa 01', 'Adwa 02'] },
      { name: 'Axum', subCities: ['Axum 01', 'Axum 02'] },
      { name: 'Adigrat', subCities: ['Adigrat 01', 'Adigrat 02', 'Adigrat 03'] },
      { name: 'Shire Inda Selassie', subCities: ['Shire 01', 'Shire 02', 'Shire 03'] },
      { name: 'Wukro', subCities: ['Wukro 01', 'Wukro 02'] },
      { name: 'Alamata', subCities: ['Alamata 01', 'Alamata 02'] },
      { name: 'Mekoni', subCities: ['Mekoni 01'] },
      { name: 'Maichew', subCities: ['Maichew 01'] },
      { name: 'Humera', subCities: ['Humera 01'] },
      { name: 'Zalambessa', subCities: ['Zalambessa 01'] },
      { name: 'Abiy Addi', subCities: ['Abiy Addi 01'] },
    ],
  },
  {
    code: 'sidama',
    name: 'Sidama',
    type: 'REGION',
    capital: 'Hawassa',
    cities: [
      { name: 'Hawassa', subCities: ['Tabor', 'Hayek Dar', 'Menaharia', 'Misrak', 'Bahil Adarash', 'Gedam Sefer', 'Awela Tula', 'Gurge Bata'] },
      { name: 'Yirgalem', subCities: ['Yirgalem 01', 'Yirgalem 02'] },
      { name: 'Aleta Wendo', subCities: ['Aleta Wendo 01'] },
      { name: 'Dilla', subCities: ['Dilla 01', 'Dilla 02'] },
      { name: 'Wonsho', subCities: ['Wonsho 01'] },
      { name: 'Boditi', subCities: ['Boditi 01', 'Boditi 02'] },
      { name: 'Wendo Genet', subCities: ['Wendo Genet 01'] },
      { name: 'Leku', subCities: ['Leku 01'] },
      { name: 'Bensa', subCities: ['Bensa 01'] },
      { name: 'Chuko', subCities: ['Chuko 01'] },
    ],
  },
  {
    code: 'south_ethiopia',
    name: 'South Ethiopia',
    type: 'REGION',
    capital: 'Sodo',
    cities: [
      { name: 'Sodo (Wolaita)', subCities: ['Sodo 01', 'Sodo 02', 'Sodo 03'] },
      { name: 'Arba Minch', subCities: ['Arba Minch 01', 'Arba Minch 02', 'Arba Minch 03', 'Arba Minch 04'] },
      { name: 'Wolaita Sodo', subCities: ['Wolaita Sodo 01', 'Wolaita Sodo 02'] },
      { name: 'Dilla', subCities: ['Dilla 01', 'Dilla 02'] },
      { name: 'Boditi', subCities: ['Boditi 01'] },
      { name: 'Areka', subCities: ['Areka 01', 'Areka 02'] },
      { name: 'Gidole', subCities: ['Gidole 01'] },
      { name: 'Kemba', subCities: ['Kemba 01'] },
      { name: 'Gato', subCities: ['Gato 01'] },
    ],
  },
  {
    code: 'south_west_ethiopia',
    name: 'South West Ethiopia Peoples',
    type: 'REGION',
    capital: 'Bonga',
    cities: [
      { name: 'Bonga', subCities: ['Bonga 01', 'Bonga 02', 'Bonga 03'] },
      { name: 'Mizan Teferi', subCities: ['Mizan 01', 'Mizan 02'] },
      { name: 'Tepi', subCities: ['Tepi 01', 'Tepi 02'] },
      { name: 'Gimba', subCities: ['Gimba 01'] },
      { name: 'Chena', subCities: ['Chena 01'] },
      { name: 'Wush Wush', subCities: ['Wush Wush 01'] },
      { name: 'Metu', subCities: ['Metu 01', 'Metu 02'] },
      { name: 'Bedele', subCities: ['Bedele 01', 'Bedele 02'] },
      { name: 'Dembidollo', subCities: ['Dembidollo 01'] },
      { name: 'Gimbi', subCities: ['Gimbi 01'] },
    ],
  },
  {
    code: 'central_ethiopia',
    name: 'Central Ethiopia',
    type: 'REGION',
    capital: 'Adama',
    cities: [
      { name: 'Adama', subCities: ['Abba Gada', 'Boku Kuteba', 'Dhadacha Abbafoo', 'Lugo', 'Biftu Selaltu'] },
      { name: 'Ambo', subCities: ['Ambo 01', 'Ambo 02', 'Ambo 03', 'Ambo 04'] },
      { name: 'Sebeta', subCities: ['Sebeta 01', 'Sebeta 02', 'Sebeta 03'] },
      { name: 'Bishoftu', subCities: ['Bishoftu 01', 'Bishoftu 02', 'Bishoftu 03'] },
      { name: 'Ziway', subCities: ['Ziway 01', 'Ziway 02'] },
      { name: 'Wolisoo', subCities: ['Wolisoo 01', 'Wolisoo 02'] },
      { name: 'Fitche', subCities: ['Fitche 01', 'Fitche 02'] },
      { name: 'Genet', subCities: ['Genet 01'] },
      { name: 'Asela', subCities: ['Asela 01', 'Asela 02'] },
      { name: 'Batu', subCities: ['Batu 01', 'Batu 02'] },
      { name: 'Shashamane', subCities: ['Shashamane 01', 'Shashamane 02'] },
      { name: 'Buee', subCities: ['Buee 01'] },
      { name: 'Gedo', subCities: ['Gedo 01'] },
    ],
  },
  {
    code: 'afar',
    name: 'Afar',
    type: 'REGION',
    capital: 'Semera',
    cities: [
      { name: 'Semera', subCities: ['Semera 01', 'Semera 02'] },
      { name: 'Asaita', subCities: ['Asaita 01', 'Asaita 02'] },
      { name: 'Awash', subCities: ['Awash 01', 'Awash 02', 'Awash 07 Kilo'] },
      { name: 'Gewane', subCities: ['Gewane 01'] },
      { name: 'Dubi', subCities: ['Dubi 01'] },
      { name: 'Logiya', subCities: ['Logiya 01'] },
      { name: 'Mille', subCities: ['Mille 01'] },
      { name: 'Eli Daura', subCities: ['Eli Daura 01'] },
      { name: 'Afambo', subCities: ['Afambo 01'] },
      { name: 'Dallol', subCities: ['Dallol 01'] },
    ],
  },
  {
    code: 'somali',
    name: 'Somali',
    type: 'REGION',
    capital: 'Jijiga',
    cities: [
      { name: 'Jijiga', subCities: ['Jijiga 01', 'Jijiga 02', 'Jijiga 03', 'Jijiga 04'] },
      { name: 'Kebri Dahar', subCities: ['Kebri Dahar 01', 'Kebri Dahar 02'] },
      { name: 'Gode', subCities: ['Gode 01', 'Gode 02'] },
      { name: 'Diredawa', subCities: ['Diredawa 01'] },
      { name: 'Degahbur', subCities: ['Degahbur 01'] },
      { name: 'Werder', subCities: ['Werder 01'] },
      { name: 'Kelafo', subCities: ['Kelafo 01'] },
      { name: 'Teferi Ber', subCities: ['Teferi Ber 01'] },
      { name: 'Shilabo', subCities: ['Shilabo 01'] },
      { name: 'Mustahil', subCities: ['Mustahil 01'] },
      { name: 'Ferfer', subCities: ['Ferfer 01'] },
      { name: 'Hartisheikh', subCities: ['Hartisheikh 01'] },
    ],
  },
  {
    code: 'benishangul_gumuz',
    name: 'Benishangul-Gumuz',
    type: 'REGION',
    capital: 'Assosa',
    cities: [
      { name: 'Assosa', subCities: ['Assosa 01', 'Assosa 02', 'Assosa 03'] },
      { name: 'Pawe', subCities: ['Pawe 01', 'Pawe 02'] },
      { name: 'Metekel', subCities: ['Metekel 01'] },
      { name: 'Bambasi', subCities: ['Bambasi 01'] },
      { name: 'Kamashi', subCities: ['Kamashi 01'] },
      { name: 'Mankush', subCities: ['Mankush 01'] },
      { name: 'Bulen', subCities: ['Bulen 01'] },
      { name: 'Gilgil Beles', subCities: ['Gilgil Beles 01'] },
      { name: 'Wembera', subCities: ['Wembera 01'] },
    ],
  },
  {
    code: 'gambela',
    name: 'Gambela',
    type: 'REGION',
    capital: 'Gambela',
    cities: [
      { name: 'Gambela', subCities: ['Gambela 01', 'Gambela 02', 'Gambela 03'] },
      { name: 'Itang', subCities: ['Itang 01', 'Itang 02'] },
      { name: 'Abobo', subCities: ['Abobo 01'] },
      { name: 'Dimma', subCities: ['Dimma 01'] },
      { name: 'Gore', subCities: ['Gore 01'] },
      { name: 'Akobo', subCities: ['Akobo 01'] },
      { name: 'Jikawo', subCities: ['Jikawo 01'] },
      { name: 'Lare', subCities: ['Lare 01'] },
      { name: 'Godere', subCities: ['Godere 01'] },
      { name: 'Mengesh', subCities: ['Mengesh 01'] },
    ],
  },
  {
    code: 'harari',
    name: 'Harari',
    type: 'REGION',
    capital: 'Harar',
    cities: [
      { name: 'Harar', subCities: ['Jugol (Old Town)', 'Amir Nur', 'Aboker', 'Shenkor', 'Hakim Jinbahara', 'Ginnir', 'Abadir', 'Aw Abdulahi'] },
      { name: 'Harar Surrounding', subCities: [' surroundings 01', 'surroundings 02'] },
    ],
  },
]

// Quick lookup helpers
export const REGION_NAMES = ETHIOPIA_REGIONS.map(r => r.name)

export const ALL_CITIES = ETHIOPIA_REGIONS.flatMap(r => r.cities.map(c => c.name))

export function getCitiesForRegion(regionName: string): City[] {
  return ETHIOPIA_REGIONS.find(r => r.name === regionName)?.cities || []
}

export function getSubCitiesForCity(regionName: string, cityName: string): string[] {
  const region = ETHIOPIA_REGIONS.find(r => r.name === regionName)
  if (!region) return []
  return region.cities.find(c => c.name === cityName)?.subCities || []
}

// Shipping zones for delivery fee calculation
export const SHIPPING_ZONES = [
  { name: 'Addis Ababa (Same-day)', regions: ['Addis Ababa'], baseFee: 100, freeThreshold: 5000, estimatedDays: 'Today' },
  { name: 'Central (1-2 days)', regions: ['Oromia', 'Central Ethiopia', 'Dire Dawa', 'Harari'], baseFee: 200, freeThreshold: 8000, estimatedDays: '1-2 days' },
  { name: 'Northern (2-3 days)', regions: ['Amhara', 'Tigray', 'Afar'], baseFee: 300, freeThreshold: 12000, estimatedDays: '2-3 days' },
  { name: 'Southern (2-3 days)', regions: ['Sidama', 'South Ethiopia', 'South West Ethiopia Peoples'], baseFee: 300, freeThreshold: 12000, estimatedDays: '2-3 days' },
  { name: 'Western & Eastern (3-4 days)', regions: ['Benishangul-Gumuz', 'Gambela', 'Somali'], baseFee: 400, freeThreshold: 15000, estimatedDays: '3-4 days' },
]

export function getShippingZone(regionName: string) {
  return SHIPPING_ZONES.find(z => z.regions.includes(regionName)) || SHIPPING_ZONES[1]
}
