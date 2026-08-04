export const WILAYAS = [
  { id: 1, name: "1 - أدرار" },
  { id: 2, name: "2 - الشلف" },
  { id: 3, name: "3 - الأغواط" },
  { id: 4, name: "4 - أم البواقي" },
  { id: 5, name: "5 - باتنة" },
  { id: 6, name: "6 - بجاية" },
  { id: 7, name: "7 - بسكرة" },
  { id: 8, name: "8 - بشار" },
  { id: 9, name: "9 - البليدة" },
  { id: 10, name: "10 - البويرة" },
  { id: 11, name: "11 - تمنراست" },
  { id: 12, name: "12 - تبسة" },
  { id: 13, name: "13 - تلمسان" },
  { id: 14, name: "14 - تيارت" },
  { id: 15, name: "15 - تيزي وزو" },
  { id: 16, name: "16 - الجزائر" },
  { id: 17, name: "17 - الجلفة" },
  { id: 18, name: "18 - جيجل" },
  { id: 19, name: "19 - سطيف" },
  { id: 20, name: "20 - سعيدة" },
  { id: 21, name: "21 - سكيكدة" },
  { id: 22, name: "22 - سيدي بلعباس" },
  { id: 23, name: "23 - عنابة" },
  { id: 24, name: "24 - قالمة" },
  { id: 25, name: "25 - قسنطينة" },
  { id: 26, name: "26 - المدية" },
  { id: 27, name: "27 - مستغانم" },
  { id: 28, name: "28 - المسيلة" },
  { id: 29, name: "29 - معسكر" },
  { id: 30, name: "30 - ورقلة" },
  { id: 31, name: "31 - وهران" },
  { id: 32, name: "32 - البيض" },
  { id: 33, name: "33 - إليزي" },
  { id: 34, name: "34 - برج بوعريريج" },
  { id: 35, name: "35 - بومرداس" },
  { id: 36, name: "36 - الطارف" },
  { id: 37, name: "37 - تندوف" },
  { id: 38, name: "38 - تيسمسيلت" },
  { id: 39, name: "39 - الوادي" },
  { id: 40, name: "40 - خنشلة" },
  { id: 41, name: "41 - سوق أهراس" },
  { id: 42, name: "42 - تيبازة" },
  { id: 43, name: "43 - ميلة" },
  { id: 44, name: "44 - عين الدفلى" },
  { id: 45, name: "45 - النعامة" },
  { id: 46, name: "46 - عين تموشنت" },
  { id: 47, name: "47 - غرداية" },
  { id: 48, name: "48 - غليزان" },
  { id: 49, name: "49 - تيميمون" },
  { id: 50, name: "50 - برج باجي مختار" },
  { id: 51, name: "51 - أولاد جلال" },
  { id: 52, name: "52 - بني عباس" },
  { id: 53, name: "53 - عين صالح" },
  { id: 54, name: "54 - عين قزام" },
  { id: 55, name: "55 - تقرت" },
  { id: 56, name: "56 - جانت" },
  { id: 57, name: "57 - المغير" },
  { id: 58, name: "58 - المنيعة" }
];

export function getWilayaName(id: number | string): string {
  const numId = typeof id === "string" ? parseInt(id) : id;
  const wilaya = WILAYAS.find(w => w.id === numId);
  if (!wilaya) return "";
  return wilaya.name.split(" - ")[1];
}

export function getWilayaFullName(id: number | string): string {
  const numId = typeof id === "string" ? parseInt(id) : id;
  const wilaya = WILAYAS.find(w => w.id === numId);
  return wilaya ? wilaya.name : "";
}
