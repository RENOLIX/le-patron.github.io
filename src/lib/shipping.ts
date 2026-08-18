export type DeliveryMethod = "domicile" | "bureau";

export interface WilayaShippingRate {
  code: string;
  name: string;
  domicile: number;
  bureau: number;
}

export const WILAYA_SHIPPING_RATES: WilayaShippingRate[] = [
  { code: "01", name: "Adrar", domicile: 1600, bureau: 950 },
  { code: "02", name: "Chlef", domicile: 900, bureau: 550 },
  { code: "03", name: "Laghouat", domicile: 1000, bureau: 600 },
  { code: "04", name: "Oum El Bouaghi", domicile: 950, bureau: 600 },
  { code: "05", name: "Batna", domicile: 900, bureau: 550 },
  { code: "06", name: "Bejaia", domicile: 800, bureau: 500 },
  { code: "07", name: "Biskra", domicile: 950, bureau: 600 },
  { code: "08", name: "Bechar", domicile: 1300, bureau: 750 },
  { code: "09", name: "Blida", domicile: 600, bureau: 400 },
  { code: "10", name: "Bouira", domicile: 700, bureau: 450 },
  { code: "11", name: "Tamanrasset", domicile: 1900, bureau: 1100 },
  { code: "12", name: "Tebessa", domicile: 1050, bureau: 650 },
  { code: "13", name: "Tlemcen", domicile: 950, bureau: 600 },
  { code: "14", name: "Tiaret", domicile: 950, bureau: 600 },
  { code: "15", name: "Tizi Ouzou", domicile: 700, bureau: 450 },
  { code: "16", name: "Alger", domicile: 500, bureau: 350 },
  { code: "17", name: "Djelfa", domicile: 950, bureau: 600 },
  { code: "18", name: "Jijel", domicile: 850, bureau: 500 },
  { code: "19", name: "Setif", domicile: 850, bureau: 500 },
  { code: "20", name: "Saida", domicile: 1000, bureau: 650 },
  { code: "21", name: "Skikda", domicile: 900, bureau: 550 },
  { code: "22", name: "Sidi Bel Abbes", domicile: 950, bureau: 600 },
  { code: "23", name: "Annaba", domicile: 950, bureau: 600 },
  { code: "24", name: "Guelma", domicile: 950, bureau: 600 },
  { code: "25", name: "Constantine", domicile: 900, bureau: 550 },
  { code: "26", name: "Medea", domicile: 750, bureau: 450 },
  { code: "27", name: "Mostaganem", domicile: 900, bureau: 550 },
  { code: "28", name: "M'Sila", domicile: 850, bureau: 500 },
  { code: "29", name: "Mascara", domicile: 950, bureau: 600 },
  { code: "30", name: "Ouargla", domicile: 1200, bureau: 700 },
  { code: "31", name: "Oran", domicile: 850, bureau: 500 },
  { code: "32", name: "El Bayadh", domicile: 1100, bureau: 700 },
  { code: "33", name: "Illizi", domicile: 2000, bureau: 1200 },
  { code: "34", name: "Bordj Bou Arreridj", domicile: 800, bureau: 500 },
  { code: "35", name: "Boumerdes", domicile: 650, bureau: 400 },
  { code: "36", name: "El Tarf", domicile: 1000, bureau: 650 },
  { code: "37", name: "Tindouf", domicile: 1800, bureau: 1100 },
  { code: "38", name: "Tissemsilt", domicile: 950, bureau: 600 },
  { code: "39", name: "El Oued", domicile: 1100, bureau: 700 },
  { code: "40", name: "Khenchela", domicile: 950, bureau: 600 },
  { code: "41", name: "Souk Ahras", domicile: 1000, bureau: 650 },
  { code: "42", name: "Tipaza", domicile: 650, bureau: 400 },
  { code: "43", name: "Mila", domicile: 850, bureau: 500 },
  { code: "44", name: "Ain Defla", domicile: 800, bureau: 500 },
  { code: "45", name: "Naama", domicile: 1200, bureau: 750 },
  { code: "46", name: "Ain Temouchent", domicile: 950, bureau: 600 },
  { code: "47", name: "Ghardaia", domicile: 1100, bureau: 650 },
  { code: "48", name: "Relizane", domicile: 900, bureau: 550 },
  { code: "49", name: "Timimoun", domicile: 1700, bureau: 1000 },
  { code: "50", name: "Bordj Badji Mokhtar", domicile: 2200, bureau: 1300 },
  { code: "51", name: "Ouled Djellal", domicile: 1000, bureau: 650 },
  { code: "52", name: "Beni Abbes", domicile: 1450, bureau: 850 },
  { code: "53", name: "In Salah", domicile: 1700, bureau: 1000 },
  { code: "54", name: "In Guezzam", domicile: 2300, bureau: 1400 },
  { code: "55", name: "Touggourt", domicile: 1150, bureau: 700 },
  { code: "56", name: "Djanet", domicile: 2100, bureau: 1300 },
  { code: "57", name: "El M'Ghair", domicile: 1100, bureau: 650 },
  { code: "58", name: "El Meniaa", domicile: 1300, bureau: 750 },
];

export function getWilayaLabel(wilaya: WilayaShippingRate) {
  return `(${wilaya.code}) ${wilaya.name}`;
}

export function getDeliveryMethodLabel(method: DeliveryMethod) {
  return method === "domicile" ? "Livraison a domicile" : "Livraison bureau";
}
