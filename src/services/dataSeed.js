// Helper to format date offset in days from today
const getOffsetDate = (offsetDays) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

// ---------------- MULTI-SHOP LIST ----------------
export const initialShops = [
  {
    id: "shop-1",
    name: "Al-Rehman General & Retail Store",
    tagline: "Quality Groceries, Spices & Wholesale Essentials",
    address: "Shop #14, Commercial Market, Main Road",
    phone: "+92 300 1234567",
    email: "alrehman.store@hissabkitab.pk",
    ownerEmail: "alrehman@hissabkitab.pk",
    currency: "Rs.",
    plan: "Basic",
    monthlyPrice: 999,
    status: "Active",
    ownerName: "Muhammad Usman",
    easypaisaNumber: "0300-1234567",
    easypaisaTitle: "Al-Rehman Store / Muhammad Usman",
    createdAt: getOffsetDate(-15),
    lastPaymentDate: getOffsetDate(-15),
    nextDueDate: getOffsetDate(15),       // Active (15 days remaining)
    graceUntilDate: getOffsetDate(17),
    manualPause: false,
    invoicePrefix: "INV-",
    nextInvoiceNum: 1005
  },
  {
    id: "shop-2",
    name: "Bismillah Mobile & Accessories",
    tagline: "Smartphones, Audio, Chargers & Screen Protection",
    address: "Shop #4, Hafeez Centre Plaza, Mobile Market",
    phone: "+92 321 9876543",
    email: "bismillah.mobile@hissabkitab.pk",
    ownerEmail: "bismillah@hissabkitab.pk",
    currency: "Rs.",
    plan: "Pro",
    monthlyPrice: 1999,
    status: "Active",
    ownerName: "Zubair Ahmed",
    easypaisaNumber: "0321-9876543",
    easypaisaTitle: "Bismillah Mobile / Zubair",
    createdAt: getOffsetDate(-31),
    lastPaymentDate: getOffsetDate(-31),
    nextDueDate: getOffsetDate(-1),       // 1 day overdue -> REMINDER Grace Period (1 day left!)
    graceUntilDate: getOffsetDate(1),
    manualPause: false,
    invoicePrefix: "BM-",
    nextInvoiceNum: 204
  },
  {
    id: "shop-3",
    name: "Madina Cloth & Fabrics",
    tagline: "Ladies Lawn, Gents Wash & Wear, Cotton & Silk",
    address: "Shop #82, Anarkali Bazaar, Cloth Street",
    phone: "+92 345 5556677",
    email: "madina.fabrics@hissabkitab.pk",
    ownerEmail: "madina@hissabkitab.pk",
    currency: "Rs.",
    plan: "Business",
    monthlyPrice: 3999,
    status: "Paused",
    ownerName: "Haji Abdul Rasheed",
    easypaisaNumber: "0345-5556677",
    easypaisaTitle: "Madina Cloth House / Haji Rasheed",
    createdAt: getOffsetDate(-45),
    lastPaymentDate: getOffsetDate(-45),
    nextDueDate: getOffsetDate(-15),      // 15 days overdue -> AUTO-PAUSED!
    graceUntilDate: getOffsetDate(-13),
    manualPause: false,
    invoicePrefix: "MC-",
    nextInvoiceNum: 512
  }
];

// Super Admin Platform Settings (Where SaaS subscriptions are deposited)
export const initialPlatformSettings = {
  adminName: "Hissab Kitab SaaS Platform",
  adminEmail: "admin@hissabkitab.pk",
  adminPin: "786", // Quick access PIN for Super Admin
  // Platform Owner's EasyPaisa details for collecting monthly plan payments:
  adminEasypaisaNumber: "0301-8889990",
  adminEasypaisaTitle: "Hissab Kitab Platform (Admin)",
  adminBankTitle: "Hissab Kitab Financial Services",
  adminIban: "PK36MEZN00012345678901",
  currency: "Rs."
};

// Initial Subscription Payments log (Payments made by shops to Admin)
export const initialSubscriptionTransactions = [
  {
    id: "sub-tx-101",
    shopId: "shop-3",
    shopName: "Madina Cloth & Fabrics",
    planName: "Business",
    amount: 3999,
    paymentMethod: "EasyPaisa",
    trxId: "84729104829",
    date: "2026-09-01",
    status: "Verified & Deposited to Admin EasyPaisa",
    adminAccount: "0301-8889990"
  },
  {
    id: "sub-tx-102",
    shopId: "shop-2",
    shopName: "Bismillah Mobile & Accessories",
    planName: "Pro",
    amount: 1999,
    paymentMethod: "Credit / Debit Card",
    cardLast4: "4242",
    cardBrand: "Visa",
    trxId: "PAY-CC-992144",
    date: "2026-09-05",
    status: "Settled to Admin EasyPaisa",
    adminAccount: "0301-8889990"
  },
  {
    id: "sub-tx-103",
    shopId: "shop-1",
    shopName: "Al-Rehman General & Retail Store",
    planName: "Basic",
    amount: 999,
    paymentMethod: "EasyPaisa",
    trxId: "72194820194",
    date: "2026-09-10",
    status: "Verified & Deposited to Admin EasyPaisa",
    adminAccount: "0301-8889990"
  }
];

// ---------------- SHOP 1: AL-REHMAN GENERAL STORE DATA ----------------
export const shop1Products = [
  {
    id: "prod-1",
    name: "Basmati Rice (Super Kernel 5kg)",
    sku: "RICE-5KG",
    category: "Grains & Rice",
    costPrice: 1200,
    sellingPrice: 1550,
    stock: 24,
    minStockAlert: 10,
    unit: "Bag"
  },
  {
    id: "prod-2",
    name: "Cooking Oil (5 Litre Tin)",
    sku: "OIL-5L",
    category: "Oils & Ghee",
    costPrice: 2200,
    sellingPrice: 2600,
    stock: 5,
    minStockAlert: 8,
    unit: "Tin"
  },
  {
    id: "prod-3",
    name: "Refined White Sugar (1kg)",
    sku: "SUGAR-1KG",
    category: "Pantry",
    costPrice: 130,
    sellingPrice: 155,
    stock: 80,
    minStockAlert: 20,
    unit: "Kg"
  },
  {
    id: "prod-4",
    name: "Black Tea Premium (900g Pouch)",
    sku: "TEA-900G",
    category: "Beverages",
    costPrice: 1450,
    sellingPrice: 1750,
    stock: 3,
    minStockAlert: 6,
    unit: "Pkt"
  }
];

export const shop1Parties = [
  {
    id: "party-1",
    name: "Muhammad Tariq (Regular Customer)",
    phone: "0321-4567890",
    type: "Customer",
    balance: 3200,
    address: "Street 4, House 12, Gulberg",
    notes: "Clears khata on 5th of every month"
  },
  {
    id: "party-3",
    name: "Habib Rice Mills (Supplier)",
    phone: "0333-1122334",
    type: "Supplier",
    balance: -14000,
    address: "Grain Market, Godown #4",
    notes: "Supplies Super Kernel Rice"
  }
];

export const shop1Invoices = [
  {
    id: "inv-1001",
    invoiceNo: "INV-1001",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    customerId: "party-1",
    customerName: "Muhammad Tariq (Regular Customer)",
    items: [
      { productId: "prod-1", name: "Basmati Rice (Super Kernel 5kg)", costPrice: 1200, unitPrice: 1550, qty: 2, total: 3100 }
    ],
    subtotal: 3100,
    discount: 100,
    tax: 0,
    total: 3000,
    cogs: 2400,
    paidAmount: 2000,
    balanceAdded: 1000,
    status: "Partial",
    paymentMethod: "EasyPaisa",
    easypaisaTrxId: "93820194821",
    notes: "Rs. 1000 added to customer ledger"
  }
];

export const shop1Expenses = [
  {
    id: "exp-1",
    title: "Shop Monthly Electricity Bill",
    category: "Utilities",
    amount: 14500,
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    paymentMethod: "EasyPaisa",
    notes: "Paid online via EasyPaisa bill payment"
  }
];

// ---------------- SHOP 2: BISMILLAH MOBILE & ACCESSORIES DATA ----------------
export const shop2Products = [
  {
    id: "bm-1",
    name: "Fast Charger 65W GaN (Type-C + USB)",
    sku: "CHG-65W",
    category: "Chargers & Cables",
    costPrice: 1800,
    sellingPrice: 2700,
    stock: 15,
    minStockAlert: 5,
    unit: "Pcs"
  },
  {
    id: "bm-2",
    name: "True Wireless Earbuds Pro (ANC Active)",
    sku: "TWS-ANC",
    category: "Audio",
    costPrice: 2800,
    sellingPrice: 4200,
    stock: 8,
    minStockAlert: 3,
    unit: "Pcs"
  },
  {
    id: "bm-3",
    name: "Power Bank 20000mAh 22.5W Fast Charge",
    sku: "PB-20K",
    category: "Power Banks",
    costPrice: 3200,
    sellingPrice: 4600,
    stock: 2, // Low stock
    minStockAlert: 4,
    unit: "Pcs"
  },
  {
    id: "bm-4",
    name: "9D Curved Tempered Glass (iPhone / Samsung)",
    sku: "GLS-9D",
    category: "Protection",
    costPrice: 80,
    sellingPrice: 350,
    stock: 65,
    minStockAlert: 20,
    unit: "Pcs"
  }
];

export const shop2Parties = [
  {
    id: "bm-party-1",
    name: "Arslan Mobile Lab (Repair Partner)",
    phone: "0302-3344556",
    type: "Customer",
    balance: 5500,
    address: "Basement Shop #12",
    notes: "Buys spare parts & chargers on credit"
  },
  {
    id: "bm-party-2",
    name: "Shenzhen Wholesale Hub (Importer)",
    phone: "0312-7788990",
    type: "Supplier",
    balance: -28000,
    address: "Hall Road, Lahore",
    notes: "Main accessories importer"
  }
];

export const shop2Invoices = [
  {
    id: "inv-bm-201",
    invoiceNo: "BM-201",
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    customerId: "bm-party-1",
    customerName: "Arslan Mobile Lab",
    items: [
      { productId: "bm-1", name: "Fast Charger 65W GaN", costPrice: 1800, unitPrice: 2700, qty: 2, total: 5400 },
      { productId: "bm-4", name: "9D Curved Tempered Glass", costPrice: 80, unitPrice: 350, qty: 4, total: 1400 }
    ],
    subtotal: 6800,
    discount: 300,
    tax: 0,
    total: 6500,
    cogs: 3920,
    paidAmount: 4000,
    balanceAdded: 2500,
    status: "Partial",
    paymentMethod: "EasyPaisa",
    easypaisaTrxId: "48291048201",
    notes: "Rs. 2500 remaining on repair khata"
  }
];

export const shop2Expenses = [
  {
    id: "bm-exp-1",
    title: "Plaza Monthly Maintenance & Generator",
    category: "Utilities",
    amount: 6000,
    date: new Date().toISOString().split('T')[0],
    paymentMethod: "Cash",
    notes: "Paid to plaza union committee"
  }
];

// ---------------- SHOP 3: MADINA CLOTH HOUSE DATA ----------------
export const shop3Products = [
  {
    id: "mc-1",
    name: "Gents Pure Boski Silk Fabric (4 Metres)",
    sku: "BOSKI-4M",
    category: "Gents Unstitched",
    costPrice: 4500,
    sellingPrice: 6500,
    stock: 12,
    minStockAlert: 5,
    unit: "Suit"
  },
  {
    id: "mc-2",
    name: "Premium Egyptian Cotton (Gents 4.5m)",
    sku: "COT-EGY",
    category: "Gents Unstitched",
    costPrice: 2800,
    sellingPrice: 4200,
    stock: 30,
    minStockAlert: 10,
    unit: "Suit"
  },
  {
    id: "mc-3",
    name: "Designer Embroidered Lawn 3-Piece Suit",
    sku: "LAWN-3PC",
    category: "Ladies Collection",
    costPrice: 3500,
    sellingPrice: 5200,
    stock: 4, // Low stock
    minStockAlert: 8,
    unit: "Suit"
  },
  {
    id: "mc-4",
    name: "Digital Printed Silk Dupatta (2.5m)",
    sku: "DUP-SILK",
    category: "Dupattas",
    costPrice: 850,
    sellingPrice: 1450,
    stock: 25,
    minStockAlert: 8,
    unit: "Pcs"
  }
];

export const shop3Parties = [
  {
    id: "mc-party-1",
    name: "Begum Farzana (Boutique Owner)",
    phone: "0300-8877665",
    type: "Customer",
    balance: 14500,
    address: "DHA Phase 5",
    notes: "Takes lawn volume sets for boutique stitching"
  },
  {
    id: "mc-party-2",
    name: "Faisalabad Weaving Mills (Supplier)",
    phone: "0341-2233445",
    type: "Supplier",
    balance: -65000,
    address: "Factory Area, Faisalabad",
    notes: "Direct loom fabric wholesale supplier"
  }
];

export const shop3Invoices = [
  {
    id: "inv-mc-501",
    invoiceNo: "MC-501",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    customerId: "mc-party-1",
    customerName: "Begum Farzana (Boutique Owner)",
    items: [
      { productId: "mc-1", name: "Gents Pure Boski Silk Fabric", costPrice: 4500, unitPrice: 6500, qty: 2, total: 13000 },
      { productId: "mc-3", name: "Designer Embroidered Lawn 3-Piece", costPrice: 3500, unitPrice: 5200, qty: 3, total: 15600 }
    ],
    subtotal: 28600,
    discount: 1100,
    tax: 0,
    total: 27500,
    cogs: 19500,
    paidAmount: 15000,
    balanceAdded: 12500,
    status: "Partial",
    paymentMethod: "Bank Transfer",
    notes: "Advance Rs. 15,000 received, rest on delivery"
  }
];

export const shop3Expenses = [
  {
    id: "mc-exp-1",
    title: "Master Tailor & Cutting Master Salary",
    category: "Salaries",
    amount: 35000,
    date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    paymentMethod: "EasyPaisa",
    notes: "Sent to Master Aslam EasyPaisa"
  }
];

// SaaS Pricing Plans Config
export const subscriptionPlans = [
  {
    id: "free",
    name: "Free",
    price: 0,
    period: "Forever",
    badge: "Trial / Starter",
    description: "Ideal for very small kiosks and home businesses just getting started.",
    features: [
      "1 Single Business Profile",
      "Up to 30 Sales Invoices",
      "Up to 20 Products in Inventory",
      "Basic Cash/Khata Ledger",
      "Local Device Storage"
    ],
    limitations: "No multi-staff, no PDF export customization",
    popular: false,
    cta: "Free Starter"
  },
  {
    id: "basic",
    name: "Basic",
    price: 999,
    period: "month",
    badge: "Most Popular for Small Shops",
    description: "Designed for small retail shops, grocery stores, and corner businesses.",
    features: [
      "Unlimited Sales Invoices",
      "Unlimited Products & Categories",
      "Automatic Low-Stock Alerts",
      "Customer & Supplier Khata Tracker",
      "Daily Expense Management",
      "Standard Printable Invoices"
    ],
    limitations: "Single login account",
    popular: true,
    cta: "Subscribe Basic"
  },
  {
    id: "pro",
    name: "Pro",
    price: 1999,
    period: "month",
    badge: "Best Value for Growing Stores",
    description: "For expanding businesses needing deeper profit margins and ledger audits.",
    features: [
      "Everything in Basic",
      "Detailed Gross & Net Profit/Loss Analysis",
      "COGS (Cost of Goods Sold) Tracking",
      "Thermal Receipt + A4 Invoice Formats",
      "WhatsApp Invoice Link Sharing",
      "Automated JSON & Excel Data Backups"
    ],
    limitations: "Up to 2 devices",
    popular: false,
    cta: "Subscribe Pro"
  },
  {
    id: "business",
    name: "Business",
    price: 3999,
    period: "month",
    badge: "For Multi-Staff & Branches",
    description: "Full-scale solution for high-volume stores with sales staff and multiple counters.",
    features: [
      "Everything in Pro",
      "Multiple Staff Accounts with Role Permissions",
      "Multi-Branch / Warehouse Stock Tracking",
      "Direct Barcode Scanner Integration",
      "Cloud Automated Sync (Multi-User)",
      "VIP 24/7 Phone & WhatsApp Support"
    ],
    limitations: "None",
    popular: false,
    cta: "Subscribe Business"
  }
];
