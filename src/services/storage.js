import {
  initialShops,
  initialPlatformSettings,
  initialSubscriptionTransactions,
  shop1Products,
  shop1Parties,
  shop1Invoices,
  shop1Expenses,
  shop2Products,
  shop2Parties,
  shop2Invoices,
  shop2Expenses,
  shop3Products,
  shop3Parties,
  shop3Invoices,
  shop3Expenses
} from './dataSeed';

const STORAGE_KEYS = {
  SHOPS: 'hissab_shops_v2',
  ACTIVE_SHOP_ID: 'hissab_active_shop_id_v2',
  USER_ROLE: 'hissab_user_role_v2',
  PLATFORM_SETTINGS: 'hissab_platform_settings_v2',
  SUBSCRIPTION_TRANSACTIONS: 'hissab_sub_tx_v2',
  INITIALIZED: 'hissab_initialized_v2'
};

const getShopKey = (type, shopId) => `hissab_${type}_${shopId || getActiveShopId()}_v2`;

// Initialize default multi-tenant stores if first time
export function initStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.INITIALIZED)) {
    resetToSampleData();
  }
}

export function resetToSampleData() {
  localStorage.setItem(STORAGE_KEYS.SHOPS, JSON.stringify(initialShops));
  localStorage.setItem(STORAGE_KEYS.ACTIVE_SHOP_ID, 'shop-1');
  localStorage.setItem(STORAGE_KEYS.USER_ROLE, 'admin'); // Default to admin so user can inspect everything
  localStorage.setItem(STORAGE_KEYS.PLATFORM_SETTINGS, JSON.stringify(initialPlatformSettings));
  localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION_TRANSACTIONS, JSON.stringify(initialSubscriptionTransactions));

  // Shop 1 data
  localStorage.setItem(`hissab_products_shop-1_v2`, JSON.stringify(shop1Products));
  localStorage.setItem(`hissab_parties_shop-1_v2`, JSON.stringify(shop1Parties));
  localStorage.setItem(`hissab_invoices_shop-1_v2`, JSON.stringify(shop1Invoices));
  localStorage.setItem(`hissab_expenses_shop-1_v2`, JSON.stringify(shop1Expenses));

  // Shop 2 data
  localStorage.setItem(`hissab_products_shop-2_v2`, JSON.stringify(shop2Products));
  localStorage.setItem(`hissab_parties_shop-2_v2`, JSON.stringify(shop2Parties));
  localStorage.setItem(`hissab_invoices_shop-2_v2`, JSON.stringify(shop2Invoices));
  localStorage.setItem(`hissab_expenses_shop-2_v2`, JSON.stringify(shop2Expenses));

  // Shop 3 data
  localStorage.setItem(`hissab_products_shop-3_v2`, JSON.stringify(shop3Products));
  localStorage.setItem(`hissab_parties_shop-3_v2`, JSON.stringify(shop3Parties));
  localStorage.setItem(`hissab_invoices_shop-3_v2`, JSON.stringify(shop3Invoices));
  localStorage.setItem(`hissab_expenses_shop-3_v2`, JSON.stringify(shop3Expenses));

  localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
}

// ---------------- USER ROLE (Super Admin vs Shop Owner) ----------------
export function getUserRole() {
  initStorage();
  return localStorage.getItem(STORAGE_KEYS.USER_ROLE) || 'admin';
}

export function setUserRole(role) {
  localStorage.setItem(STORAGE_KEYS.USER_ROLE, role);
  return role;
}

// ---------------- SUPER ADMIN PLATFORM SETTINGS ----------------
export function getPlatformSettings() {
  initStorage();
  const data = localStorage.getItem(STORAGE_KEYS.PLATFORM_SETTINGS);
  return data ? { ...initialPlatformSettings, ...JSON.parse(data) } : initialPlatformSettings;
}

export function savePlatformSettings(settings) {
  localStorage.setItem(STORAGE_KEYS.PLATFORM_SETTINGS, JSON.stringify(settings));
  return settings;
}

// ---------------- MULTI-SHOP MANAGEMENT ----------------
export function getShops() {
  initStorage();
  const data = localStorage.getItem(STORAGE_KEYS.SHOPS);
  return data ? JSON.parse(data) : initialShops;
}

export function getActiveShopId() {
  initStorage();
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_SHOP_ID) || 'shop-1';
}

export function setActiveShopId(shopId) {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_SHOP_ID, shopId);
  return shopId;
}

export function getActiveShop() {
  const shops = getShops();
  const activeId = getActiveShopId();
  return shops.find(s => s.id === activeId) || shops[0] || initialShops[0];
}

export function saveShop(shopData) {
  const shops = getShops();
  let updated;
  if (shopData.id) {
    updated = shops.map(s => (s.id === shopData.id ? { ...s, ...shopData } : s));
  } else {
    const newId = 'shop-' + Date.now();
    const newShop = {
      ...shopData,
      id: newId,
      currency: shopData.currency || 'Rs.',
      plan: shopData.plan || 'Basic',
      monthlyPrice: Number(shopData.monthlyPrice) || 999,
      status: 'Active',
      createdAt: new Date().toISOString().split('T')[0],
      invoicePrefix: shopData.invoicePrefix || 'INV-',
      nextInvoiceNum: 101
    };
    // Initialize empty collections for new shop
    localStorage.setItem(`hissab_products_${newId}_v2`, JSON.stringify([]));
    localStorage.setItem(`hissab_parties_${newId}_v2`, JSON.stringify([]));
    localStorage.setItem(`hissab_invoices_${newId}_v2`, JSON.stringify([]));
    localStorage.setItem(`hissab_expenses_${newId}_v2`, JSON.stringify([]));

    updated = [...shops, newShop];
  }
  localStorage.setItem(STORAGE_KEYS.SHOPS, JSON.stringify(updated));
  return updated;
}

export function deleteShop(shopId) {
  const shops = getShops().filter(s => s.id !== shopId);
  localStorage.setItem(STORAGE_KEYS.SHOPS, JSON.stringify(shops));
  // Clean up shop data
  localStorage.removeItem(`hissab_products_${shopId}_v2`);
  localStorage.removeItem(`hissab_parties_${shopId}_v2`);
  localStorage.removeItem(`hissab_invoices_${shopId}_v2`);
  localStorage.removeItem(`hissab_expenses_${shopId}_v2`);

  if (getActiveShopId() === shopId && shops.length > 0) {
    setActiveShopId(shops[0].id);
  }
  return shops;
}

// ---------------- BUSINESS PROFILE (Active Shop profile alias) ----------------
export function getBusinessProfile() {
  return getActiveShop();
}

export function saveBusinessProfile(profile) {
  return saveShop(profile);
}

// ---------------- ISOLATED PRODUCTS PER SHOP ----------------
export function getProducts(shopId = null) {
  initStorage();
  const key = getShopKey('products', shopId);
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

export function saveProduct(product, shopId = null) {
  const key = getShopKey('products', shopId);
  const products = getProducts(shopId);
  let updated;
  if (product.id) {
    updated = products.map(p => (p.id === product.id ? { ...p, ...product } : p));
  } else {
    const newProd = {
      ...product,
      id: 'prod-' + Date.now(),
      costPrice: Number(product.costPrice) || 0,
      sellingPrice: Number(product.sellingPrice) || 0,
      stock: Number(product.stock) || 0,
      minStockAlert: Number(product.minStockAlert) || 5
    };
    updated = [newProd, ...products];
  }
  localStorage.setItem(key, JSON.stringify(updated));
  return updated;
}

export function deleteProduct(productId, shopId = null) {
  const key = getShopKey('products', shopId);
  const products = getProducts(shopId).filter(p => p.id !== productId);
  localStorage.setItem(key, JSON.stringify(products));
  return products;
}

export function adjustStock(productId, deltaQty, shopId = null) {
  const key = getShopKey('products', shopId);
  const products = getProducts(shopId).map(p => {
    if (p.id === productId) {
      const newStock = Math.max(0, (p.stock || 0) + deltaQty);
      return { ...p, stock: newStock };
    }
    return p;
  });
  localStorage.setItem(key, JSON.stringify(products));
  return products;
}

// ---------------- ISOLATED PARTIES (CUSTOMERS & SUPPLIERS) ----------------
export function getParties(shopId = null) {
  initStorage();
  const key = getShopKey('parties', shopId);
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

export function saveParty(party, shopId = null) {
  const key = getShopKey('parties', shopId);
  const parties = getParties(shopId);
  let updated;
  if (party.id) {
    updated = parties.map(p => (p.id === party.id ? { ...p, ...party } : p));
  } else {
    const newParty = {
      ...party,
      id: 'party-' + Date.now(),
      balance: Number(party.balance) || 0
    };
    updated = [newParty, ...parties];
  }
  localStorage.setItem(key, JSON.stringify(updated));
  return updated;
}

export function deleteParty(partyId, shopId = null) {
  const key = getShopKey('parties', shopId);
  const parties = getParties(shopId).filter(p => p.id !== partyId);
  localStorage.setItem(key, JSON.stringify(parties));
  return parties;
}

export function recordPartyPayment(partyId, amount, type = 'received', notes = '', shopId = null) {
  const key = getShopKey('parties', shopId);
  const parties = getParties(shopId).map(p => {
    if (p.id === partyId) {
      const change = type === 'received' ? -Number(amount) : Number(amount);
      return { ...p, balance: (p.balance || 0) + change };
    }
    return p;
  });
  localStorage.setItem(key, JSON.stringify(parties));
  return parties;
}

// ---------------- ISOLATED INVOICES ----------------
export function getInvoices(shopId = null) {
  initStorage();
  const key = getShopKey('invoices', shopId);
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

export function createInvoice(invoiceData, shopId = null) {
  const currentShopId = shopId || getActiveShopId();
  const invoicesKey = getShopKey('invoices', currentShopId);
  const productsKey = getShopKey('products', currentShopId);
  const partiesKey = getShopKey('parties', currentShopId);

  const invoices = getInvoices(currentShopId);
  const shop = getActiveShop();
  
  const invNumber = (shop.invoicePrefix || 'INV-') + (shop.nextInvoiceNum || 1001);
  shop.nextInvoiceNum = (shop.nextInvoiceNum || 1001) + 1;
  saveShop(shop);

  // Calculate COGS and total
  let totalCost = 0;
  invoiceData.items.forEach(item => {
    totalCost += (Number(item.costPrice) || 0) * (Number(item.qty) || 1);
  });

  const subtotal = Number(invoiceData.subtotal) || 0;
  const discount = Number(invoiceData.discount) || 0;
  const tax = Number(invoiceData.tax) || 0;
  const grandTotal = Math.max(0, subtotal - discount + tax);
  const paidAmount = Math.min(grandTotal, Number(invoiceData.paidAmount) || 0);
  const balanceDue = grandTotal - paidAmount;

  let status = 'Paid';
  if (paidAmount === 0 && grandTotal > 0) status = 'Unpaid';
  else if (balanceDue > 0) status = 'Partial';

  const newInvoice = {
    ...invoiceData,
    id: 'inv-' + Date.now(),
    invoiceNo: invNumber,
    date: invoiceData.date || new Date().toISOString().split('T')[0],
    subtotal,
    discount,
    tax,
    total: grandTotal,
    cogs: totalCost,
    paidAmount,
    balanceAdded: balanceDue,
    status
  };

  // 1. Deduct Product Stocks
  const products = getProducts(currentShopId);
  newInvoice.items.forEach(item => {
    const prod = products.find(p => p.id === item.productId);
    if (prod) {
      prod.stock = Math.max(0, (prod.stock || 0) - (Number(item.qty) || 0));
    }
  });
  localStorage.setItem(productsKey, JSON.stringify(products));

  // 2. Add balance if customer was selected
  if (balanceDue > 0 && invoiceData.customerId) {
    const parties = getParties(currentShopId);
    const party = parties.find(p => p.id === invoiceData.customerId);
    if (party) {
      party.balance = (party.balance || 0) + balanceDue;
      localStorage.setItem(partiesKey, JSON.stringify(parties));
    }
  }

  // 3. Save Invoice
  const updatedInvoices = [newInvoice, ...invoices];
  localStorage.setItem(invoicesKey, JSON.stringify(updatedInvoices));

  return newInvoice;
}

export function deleteInvoice(invoiceId, shopId = null) {
  const key = getShopKey('invoices', shopId);
  const invoices = getInvoices(shopId).filter(i => i.id !== invoiceId);
  localStorage.setItem(key, JSON.stringify(invoices));
  return invoices;
}

// ---------------- ISOLATED EXPENSES ----------------
export function getExpenses(shopId = null) {
  initStorage();
  const key = getShopKey('expenses', shopId);
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

export function saveExpense(expense, shopId = null) {
  const key = getShopKey('expenses', shopId);
  const expenses = getExpenses(shopId);
  let updated;
  if (expense.id) {
    updated = expenses.map(e => (e.id === expense.id ? { ...e, ...expense } : e));
  } else {
    const newExp = {
      ...expense,
      id: 'exp-' + Date.now(),
      amount: Number(expense.amount) || 0,
      date: expense.date || new Date().toISOString().split('T')[0]
    };
    updated = [newExp, ...expenses];
  }
  localStorage.setItem(key, JSON.stringify(updated));
  return updated;
}

export function deleteExpense(expenseId, shopId = null) {
  const key = getShopKey('expenses', shopId);
  const expenses = getExpenses(shopId).filter(e => e.id !== expenseId);
  localStorage.setItem(key, JSON.stringify(expenses));
  return expenses;
}

// ---------------- FINANCIAL METRICS FOR ACTIVE SHOP ----------------
export function getFinancialMetrics(shopId = null) {
  const invoices = getInvoices(shopId);
  const expenses = getExpenses(shopId);
  const products = getProducts(shopId);
  const parties = getParties(shopId);

  const totalSales = invoices.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
  const totalCogs = invoices.reduce((sum, inv) => sum + (Number(inv.cogs) || 0), 0);
  const grossProfit = totalSales - totalCogs;

  const totalExpenses = expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
  const netProfit = grossProfit - totalExpenses;

  const totalReceivables = parties
    .filter(p => p.type === 'Customer' && p.balance > 0)
    .reduce((sum, p) => sum + p.balance, 0);

  const totalPayables = parties
    .filter(p => p.type === 'Supplier' && p.balance < 0)
    .reduce((sum, p) => sum + Math.abs(p.balance), 0);

  const lowStockCount = products.filter(p => (p.stock || 0) <= (p.minStockAlert || 5)).length;
  const totalCashCollected = invoices.reduce((sum, inv) => sum + (Number(inv.paidAmount) || 0), 0);

  return {
    totalSales,
    totalCogs,
    grossProfit,
    totalExpenses,
    netProfit,
    totalReceivables,
    totalPayables,
    lowStockCount,
    totalCashCollected,
    totalProducts: products.length,
    totalInvoices: invoices.length
  };
}

// ---------------- SUPER ADMIN SUBSCRIPTION TRANSACTIONS (EasyPaisa & Card) ----------------
export function getSubscriptionTransactions() {
  initStorage();
  const data = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION_TRANSACTIONS);
  return data ? JSON.parse(data) : initialSubscriptionTransactions;
}

export function recordSubscriptionPayment({
  shopId,
  shopName,
  planName,
  amount,
  paymentMethod,
  trxId = '',
  cardLast4 = '',
  cardBrand = 'Visa'
}) {
  const platform = getPlatformSettings();
  const txList = getSubscriptionTransactions();

  const newTx = {
    id: 'sub-tx-' + Date.now(),
    shopId,
    shopName,
    planName,
    amount: Number(amount) || 0,
    paymentMethod,
    trxId: trxId || (paymentMethod === 'Credit / Debit Card' ? `PAY-CARD-${Math.floor(100000 + Math.random() * 900000)}` : ''),
    cardLast4,
    cardBrand,
    date: new Date().toISOString().split('T')[0],
    status: paymentMethod === 'EasyPaisa' ? 'Deposited to Admin EasyPaisa' : 'Settled to Admin EasyPaisa Account',
    adminAccount: platform.adminEasypaisaNumber
  };

  const updatedTx = [newTx, ...txList];
  localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION_TRANSACTIONS, JSON.stringify(updatedTx));

  // Update the shop's active plan and monthly pricing
  const shops = getShops();
  const shop = shops.find(s => s.id === shopId);
  if (shop) {
    shop.plan = planName;
    shop.monthlyPrice = Number(amount) || shop.monthlyPrice;
    shop.status = 'Active';
    localStorage.setItem(STORAGE_KEYS.SHOPS, JSON.stringify(shops));
  }

  return newTx;
}

// ---------------- BACKUP & RESTORE ----------------
export function exportAllData() {
  return JSON.stringify({
    shops: getShops(),
    activeShopId: getActiveShopId(),
    platformSettings: getPlatformSettings(),
    subscriptionTransactions: getSubscriptionTransactions(),
    exportDate: new Date().toISOString()
  }, null, 2);
}

export function importAllData(jsonStr) {
  try {
    const data = JSON.parse(jsonStr);
    if (data.shops) localStorage.setItem(STORAGE_KEYS.SHOPS, JSON.stringify(data.shops));
    if (data.activeShopId) localStorage.setItem(STORAGE_KEYS.ACTIVE_SHOP_ID, data.activeShopId);
    if (data.platformSettings) localStorage.setItem(STORAGE_KEYS.PLATFORM_SETTINGS, JSON.stringify(data.platformSettings));
    if (data.subscriptionTransactions) localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION_TRANSACTIONS, JSON.stringify(data.subscriptionTransactions));
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
