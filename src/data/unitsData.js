// Fictional seed data for demo purposes — no real customer information.
// Units keep flowing through the same list whether they're still on the
// floor ("available") or already sold ("sold"); Sales/POS is what flips
// the status, in App.jsx's orchestration.
export const INITIAL_UNITS = [
  { id: 1, name: "Honda Vario 125", category: "honda", year: 2021, plate: "B 3311 FQ",
    unitPrice: 14500000, costUnit: 900000, additionalCost: 150000,
    ownerName: "Budi Santoso", ownerAddress: "Jl. Kenanga No. 12, Depok",
    notes: "Pajak hidup s.d. Mar 2027", dateAcquired: "2026-07-02", status: "available" },
  { id: 2, name: "Yamaha NMAX 155", category: "yamaha", year: 2020, plate: "B 4482 KL",
    unitPrice: 21000000, costUnit: 1500000, additionalCost: 300000,
    ownerName: "Siti Herawati", ownerAddress: "Jl. Anggrek Raya No. 8, Depok",
    notes: "Ban baru", dateAcquired: "2026-06-18", status: "available" },
  { id: 3, name: "Honda Beat Street", category: "honda", year: 2019, plate: "B 1290 ZR",
    unitPrice: 9800000, costUnit: 600000, additionalCost: 0,
    ownerName: "Agus Wijaya", ownerAddress: "Jl. Mawar No. 3, Sawangan",
    notes: "", dateAcquired: "2026-05-25", status: "available" },
  { id: 4, name: "Yamaha Aerox 155", category: "yamaha", year: 2022, plate: "B 9087 HT",
    unitPrice: 23500000, costUnit: 700000, additionalCost: 0,
    ownerName: "Fitriani Rahayu", ownerAddress: "Jl. Dahlia No. 6, Depok",
    notes: "", dateAcquired: "2026-08-14", status: "available" },
  { id: 5, name: "Suzuki Satria F150", category: "suzuki", year: 2018, plate: "B 7765 QW",
    unitPrice: 11200000, costUnit: 1100000, additionalCost: 200000,
    ownerName: "Dewi Lestari", ownerAddress: "Jl. Merdeka No. 21, Depok",
    notes: "Servis besar sebelum masuk", dateAcquired: "2026-04-11", status: "sold" },
  { id: 6, name: "Kawasaki Ninja 250", category: "kawasaki", year: 2017, plate: "B 5521 XD",
    unitPrice: 28000000, costUnit: 2000000, additionalCost: 500000,
    ownerName: "Rudi Hartono", ownerAddress: "Jl. Cendrawasih No. 9, Depok",
    notes: "", dateAcquired: "2026-03-08", status: "sold" },
  { id: 7, name: "Honda Vario 125", category: "honda", year: 2020, plate: "B 2200 LM",
    unitPrice: 13200000, costUnit: 800000, additionalCost: 100000,
    ownerName: "Yuni Kartika", ownerAddress: "Jl. Melati No. 5, Depok",
    notes: "", dateAcquired: "2026-02-20", status: "sold" },
];
