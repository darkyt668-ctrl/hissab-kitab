/**
 * firestoreService.js
 * Firestore async operations with offline resilience & subscription enforcement
 *
 * Subscription Enforcement Rules:
 *   - 30 Days Cycle: If not paid after 30 days -> Status becomes "Reminder" (Grace Period)
 *   - 2 Days Grace: After 2 days in reminder (32 days total) -> System enters "Paused" state
 *   - Paused State: Shop owner is locked out with payment instructions.
 *   - Unpause: Admin can manually unpause anytime, or recording a payment automatically unpauses & renews 30 days!
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  initialShops,
  initialPlatformSettings,
  initialSubscriptionTransactions,
  shop1Products, shop1Parties, shop1Invoices, shop1Expenses,
  shop2Products, shop2Parties, shop2Invoices, shop2Expenses,
  shop3Products, shop3Parties, shop3Invoices, shop3Expenses,
} from './dataSeed';

// ─── LOCAL STORAGE FALLBACK HELPERS ──────────────────────────────────────────
const LS_KEY = (k) => `hissab_cloud_cache_${k}`;
const getLs = (k, fallback) => {
  try {
    const raw = localStorage.getItem(LS_KEY(k));
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};
const setLs = (k, val) => {
  try {
    localStorage.setItem(LS_KEY(k), JSON.stringify(val));
  } catch (e) {
    console.warn('LocalStorage error:', e);
  }
};

// Initialize cache with seed data if empty
const initLocalCache = () => {
  if (!getLs('initialized', false)) {
    setLs('shops', initialShops);
    setLs('platform_settings', initialPlatformSettings);
    setLs('sub_tx', initialSubscriptionTransactions);
    setLs('products_shop-1', shop1Products);
    setLs('parties_shop-1', shop1Parties);
    setLs('invoices_shop-1', shop1Invoices);
    setLs('expenses_shop-1', shop1Expenses);

    setLs('products_shop-2', shop2Products);
    setLs('parties_shop-2', shop2Parties);
    setLs('invoices_shop-2', shop2Invoices);
    setLs('expenses_shop-2', shop2Expenses);

    setLs('products_shop-3', shop3Products);
    setLs('parties_shop-3', shop3Parties);
    setLs('invoices_shop-3', shop3Invoices);
    setLs('expenses_shop-3', shop3Expenses);
    setLs('initialized', true);
  }
};
initLocalCache();

// ─── SUBSCRIPTION STATUS LOGIC (EXACT 30 DAYS + 2 DAYS AUTO-PAUSE) ───────────
export function calculateShopSubscriptionStatus(shop) {
  if (!shop) return { status: 'Active', isPaused: false, isReminder: false, daysRemaining: 30 };

  // 1. Check if Admin manually paused this shop
  if (shop.manualPause) {
    return {
      status: 'Paused',
      isPaused: true,
      isReminder: false,
      reason: 'Admin ne is shop ko manually pause (suspend) kiya hua hai.',
      daysOverdue: 0,
      daysRemaining: 0,
      nextDueDate: shop.nextDueDate || 'Overdue',
      graceUntilDate: shop.graceUntilDate || 'Overdue',
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Compute base dates
  const baseDateStr = shop.lastPaymentDate || shop.createdAt || new Date().toISOString().split('T')[0];
  const baseDate = new Date(baseDateStr);
  baseDate.setHours(0, 0, 0, 0);

  // 30 Days Due Date
  const dueDate = shop.nextDueDate 
    ? new Date(shop.nextDueDate) 
    : new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000);
  dueDate.setHours(0, 0, 0, 0);

  // +2 Days Grace Period
  const graceDate = shop.graceUntilDate 
    ? new Date(shop.graceUntilDate) 
    : new Date(dueDate.getTime() + 2 * 24 * 60 * 60 * 1000);
  graceDate.setHours(0, 0, 0, 0);

  const diffDueDateMs = dueDate.getTime() - today.getTime();
  const daysRemainingUntilDue = Math.ceil(diffDueDateMs / (1000 * 60 * 60 * 24));

  const diffGraceMs = graceDate.getTime() - today.getTime();
  const daysRemainingGrace = Math.ceil(diffGraceMs / (1000 * 60 * 60 * 24));

  const nextDueDateStr = dueDate.toISOString().split('T')[0];
  const graceUntilDateStr = graceDate.toISOString().split('T')[0];

  // SCENARIO 1: Within 30 days -> ACTIVE
  if (today <= dueDate) {
    return {
      status: 'Active',
      isPaused: false,
      isReminder: false,
      daysRemaining: Math.max(0, daysRemainingUntilDue),
      daysOverdue: 0,
      nextDueDate: nextDueDateStr,
      graceUntilDate: graceUntilDateStr,
    };
  }
  // SCENARIO 2: 30 days passed, but within 2-day Grace Period -> REMINDER
  else if (today <= graceDate) {
    return {
      status: 'Reminder',
      isPaused: false,
      isReminder: true,
      daysRemaining: 0,
      graceDaysRemaining: Math.max(0, daysRemainingGrace),
      daysOverdue: Math.abs(daysRemainingUntilDue),
      nextDueDate: nextDueDateStr,
      graceUntilDate: graceUntilDateStr,
      reason: `30 din mukammal ho chuke hain! Agle ${Math.max(1, daysRemainingGrace)} din mein payment na hone per system pause ho jayega.`,
    };
  }
  // SCENARIO 3: 32+ days passed without payment -> AUTO-PAUSED!
  else {
    return {
      status: 'Paused',
      isPaused: true,
      isReminder: false,
      daysRemaining: 0,
      daysOverdue: Math.abs(daysRemainingUntilDue),
      nextDueDate: nextDueDateStr,
      graceUntilDate: graceUntilDateStr,
      reason: '1 Month subscription cycle khatam ho gaya hai aur 2 din ka grace period bhi guzar chuka hai. Payment na hone per system pause ho chuka hai.',
    };
  }
}

// ─── FIRESTORE COLLECTIONS & HELPERS ─────────────────────────────────────────
const shopCol = (shopId) => collection(db, 'shops', shopId, 'products');
const partiesCol = (shopId) => collection(db, 'shops', shopId, 'parties');
const invoicesCol = (shopId) => collection(db, 'shops', shopId, 'invoices');
const expensesCol = (shopId) => collection(db, 'shops', shopId, 'expenses');
const toArray = (snapshot) => snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

// Helper to calculate date offsets in YYYY-MM-DD
export const getOffsetDate = (offsetDays) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

// ─── SEED DATABASE (run once on first launch) ────────────────────────────────
export async function seedIfNeeded() {
  try {
    const settingsSnap = await getDoc(doc(db, 'platform', 'settings'));
    if (settingsSnap.exists()) return false;

    console.log('Seeding Firestore with initial data...');
    const batch = writeBatch(db);
    batch.set(doc(db, 'platform', 'settings'), initialPlatformSettings);

    for (const shop of initialShops) {
      batch.set(doc(db, 'shops', shop.id), shop);
    }
    for (const tx of initialSubscriptionTransactions) {
      batch.set(doc(db, 'subscriptionTransactions', tx.id), tx);
    }
    await batch.commit();

    const shopData = {
      'shop-1': { products: shop1Products, parties: shop1Parties, invoices: shop1Invoices, expenses: shop1Expenses },
      'shop-2': { products: shop2Products, parties: shop2Parties, invoices: shop2Invoices, expenses: shop2Expenses },
      'shop-3': { products: shop3Products, parties: shop3Parties, invoices: shop3Invoices, expenses: shop3Expenses },
    };

    for (const [shopId, data] of Object.entries(shopData)) {
      const b2 = writeBatch(db);
      for (const p of data.products) b2.set(doc(db, 'shops', shopId, 'products', p.id), p);
      for (const p of data.parties)  b2.set(doc(db, 'shops', shopId, 'parties',  p.id), p);
      for (const i of data.invoices) b2.set(doc(db, 'shops', shopId, 'invoices', i.id), i);
      for (const e of data.expenses) b2.set(doc(db, 'shops', shopId, 'expenses', e.id), e);
      await b2.commit();
    }
    return true;
  } catch (err) {
    console.warn('Firestore seed skipped (offline or not configured yet):', err.message);
    return false;
  }
}

// ─── PLATFORM SETTINGS ───────────────────────────────────────────────────────
export async function getPlatformSettings() {
  try {
    const snap = await getDoc(doc(db, 'platform', 'settings'));
    if (snap.exists()) {
      const data = snap.data();
      setLs('platform_settings', data);
      return data;
    }
  } catch (err) {
    console.warn('Firestore offline, using local platform settings');
  }
  return getLs('platform_settings', initialPlatformSettings);
}

export async function savePlatformSettings(settings) {
  setLs('platform_settings', settings);
  try {
    await setDoc(doc(db, 'platform', 'settings'), settings, { merge: true });
  } catch (err) {
    console.warn('Saved platform settings locally (Firestore offline)');
  }
  return settings;
}

// Helper to normalize shop plan & price consistency
export function normalizeShopPlan(shop) {
  if (!shop) return shop;
  let price = Number(shop.monthlyPrice);
  let plan = shop.plan || 'Basic';

  // If price is 999, the plan is Basic (never Free)
  if (price === 999 && (!plan || plan.toLowerCase() === 'free')) {
    plan = 'Basic';
  } else if (price === 1999 && (!plan || plan.toLowerCase() === 'free')) {
    plan = 'Pro';
  } else if (price === 3999 && (!plan || plan.toLowerCase() === 'free')) {
    plan = 'Business';
  } else if (plan.toLowerCase() === 'basic' && (isNaN(price) || price === 0)) {
    price = 999;
  }
  return { ...shop, plan, monthlyPrice: price };
}

// ─── SHOPS ───────────────────────────────────────────────────────────────────
export async function getShops() {
  let list = [];
  try {
    const snap = await getDocs(collection(db, 'shops'));
    if (!snap.empty) {
      list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setLs('shops', list);
    }
  } catch (err) {
    console.warn('Firestore offline, reading shops from local cache');
  }
  if (!list.length) {
    list = getLs('shops', initialShops);
  }
  return list.map(normalizeShopPlan);
}

export async function getShopById(shopId) {
  const shops = await getShops();
  return shops.find(s => s.id === shopId) || null;
}

export async function saveShop(shopData) {
  const normalizedData = normalizeShopPlan(shopData);
  const shops = await getShops();
  let updatedShop;

  if (normalizedData.id) {
    updatedShop = { ...shops.find(s => s.id === normalizedData.id), ...normalizedData };
    const newShops = shops.map(s => (s.id === normalizedData.id ? updatedShop : s));
    setLs('shops', newShops);

    try {
      const { id, ...rest } = updatedShop;
      await setDoc(doc(db, 'shops', id), rest, { merge: true });
    } catch (err) {
      console.warn('Updated shop locally (Firestore offline)');
    }
  } else {
    const newId = 'shop-' + Date.now();
    updatedShop = {
      ...normalizedData,
      id: newId,
      currency: normalizedData.currency || 'Rs.',
      plan: normalizedData.plan || 'Basic',
      monthlyPrice: Number(normalizedData.monthlyPrice) || 999,
      status: 'Active',
      createdAt: getOffsetDate(0),
      lastPaymentDate: getOffsetDate(0),
      nextDueDate: getOffsetDate(30),
      graceUntilDate: getOffsetDate(32),
      manualPause: false,
      invoicePrefix: normalizedData.invoicePrefix || 'INV-',
      nextInvoiceNum: 101,
    };
    const newShops = [...shops, updatedShop];
    setLs('shops', newShops);

    try {
      await setDoc(doc(db, 'shops', newId), updatedShop);
    } catch (err) {
      console.warn('Created shop locally (Firestore offline)');
    }
  }
  return updatedShop;
}

export async function deleteShop(shopId) {
  const shops = (await getShops()).filter(s => s.id !== shopId);
  setLs('shops', shops);
  try {
    await deleteDoc(doc(db, 'shops', shopId));
  } catch (err) {
    console.warn('Deleted shop locally (Firestore offline)');
  }
}

// ─── ADMIN PAUSE / UNPAUSE CONTROLS ──────────────────────────────────────────
export async function toggleShopPause(shopId, shouldPause, reason = '') {
  const shops = await getShops();
  const shop = shops.find(s => s.id === shopId);
  if (!shop) return;

  const update = {
    manualPause: shouldPause,
    status: shouldPause ? 'Paused' : 'Active',
    pauseReason: shouldPause ? (reason || 'Admin ne manually pause kiya hai.') : '',
  };

  // If unpausing an expired shop, extend its due date by 30 days so it doesn't immediately re-pause
  if (!shouldPause) {
    const subStatus = calculateShopSubscriptionStatus(shop);
    if (subStatus.isPaused || subStatus.isReminder) {
      update.lastPaymentDate = getOffsetDate(0);
      update.nextDueDate = getOffsetDate(30);
      update.graceUntilDate = getOffsetDate(32);
    }
  }

  return await saveShop({ ...shop, ...update });
}

// ─── DEMO & TESTING SIMULATOR ───────────────────────────────────────────────
export async function simulateShopSubscription(shopId, scenario) {
  const shops = await getShops();
  const shop = shops.find(s => s.id === shopId);
  if (!shop) return;

  let update = {};
  if (scenario === 'due') {
    // 30 days completed! Grace period active (1-2 days left) -> REMINDER
    update = {
      lastPaymentDate: getOffsetDate(-31),
      nextDueDate: getOffsetDate(-1),
      graceUntilDate: getOffsetDate(1),
      manualPause: false,
      status: 'Active',
    };
  } else if (scenario === 'overdue_pause') {
    // 32+ days completed! Grace period passed -> AUTO-PAUSED!
    update = {
      lastPaymentDate: getOffsetDate(-40),
      nextDueDate: getOffsetDate(-10),
      graceUntilDate: getOffsetDate(-8),
      manualPause: false,
      status: 'Paused',
    };
  } else if (scenario === 'active') {
    // Fully renewed 30 days active
    update = {
      lastPaymentDate: getOffsetDate(0),
      nextDueDate: getOffsetDate(30),
      graceUntilDate: getOffsetDate(32),
      manualPause: false,
      status: 'Active',
    };
  } else if (scenario === 'toggle_pause') {
    const isPaused = shop.manualPause || calculateShopSubscriptionStatus(shop).isPaused;
    return await toggleShopPause(shopId, !isPaused);
  }

  return await saveShop({ ...shop, ...update });
}

// ─── PRODUCTS ────────────────────────────────────────────────────────────────
export async function getProducts(shopId) {
  try {
    const snap = await getDocs(shopCol(shopId));
    if (!snap.empty) {
      const items = toArray(snap);
      setLs(`products_${shopId}`, items);
      return items;
    }
  } catch (err) {
    console.warn(`Firestore offline for products_${shopId}`);
  }
  return getLs(`products_${shopId}`, shopId === 'shop-1' ? shop1Products : shopId === 'shop-2' ? shop2Products : shop3Products);
}

export async function saveProduct(product, shopId) {
  const prods = await getProducts(shopId);
  let updated;
  if (product.id) {
    updated = prods.map(p => (p.id === product.id ? { ...p, ...product } : p));
    setLs(`products_${shopId}`, updated);
    try {
      const { id, ...rest } = product;
      await setDoc(doc(db, 'shops', shopId, 'products', id), rest, { merge: true });
    } catch {}
    return product;
  } else {
    const newId = 'prod-' + Date.now();
    const newProd = {
      ...product,
      id: newId,
      costPrice: Number(product.costPrice) || 0,
      sellingPrice: Number(product.sellingPrice) || 0,
      stock: Number(product.stock) || 0,
      minStockAlert: Number(product.minStockAlert) || 5,
    };
    updated = [newProd, ...prods];
    setLs(`products_${shopId}`, updated);
    try {
      await setDoc(doc(db, 'shops', shopId, 'products', newId), newProd);
    } catch {}
    return newProd;
  }
}

export async function deleteProduct(productId, shopId) {
  const prods = (await getProducts(shopId)).filter(p => p.id !== productId);
  setLs(`products_${shopId}`, prods);
  try {
    await deleteDoc(doc(db, 'shops', shopId, 'products', productId));
  } catch {}
}

export async function adjustStock(productId, deltaQty, shopId) {
  const prods = await getProducts(shopId);
  const updated = prods.map(p => {
    if (p.id === productId) {
      return { ...p, stock: Math.max(0, (p.stock || 0) + deltaQty) };
    }
    return p;
  });
  setLs(`products_${shopId}`, updated);
  try {
    const p = updated.find(x => x.id === productId);
    if (p) await updateDoc(doc(db, 'shops', shopId, 'products', productId), { stock: p.stock });
  } catch {}
}

// ─── PARTIES ────────────────────────────────────────────────────────────────
export async function getParties(shopId) {
  try {
    const snap = await getDocs(partiesCol(shopId));
    if (!snap.empty) {
      const items = toArray(snap);
      setLs(`parties_${shopId}`, items);
      return items;
    }
  } catch {}
  return getLs(`parties_${shopId}`, shopId === 'shop-1' ? shop1Parties : shopId === 'shop-2' ? shop2Parties : shop3Parties);
}

export async function saveParty(party, shopId) {
  const parties = await getParties(shopId);
  let updated;
  if (party.id) {
    updated = parties.map(p => (p.id === party.id ? { ...p, ...party } : p));
    setLs(`parties_${shopId}`, updated);
    try {
      const { id, ...rest } = party;
      await setDoc(doc(db, 'shops', shopId, 'parties', id), rest, { merge: true });
    } catch {}
    return party;
  } else {
    const newId = 'party-' + Date.now();
    const newParty = { ...party, id: newId, balance: Number(party.balance) || 0 };
    updated = [newParty, ...parties];
    setLs(`parties_${shopId}`, updated);
    try {
      await setDoc(doc(db, 'shops', shopId, 'parties', newId), newParty);
    } catch {}
    return newParty;
  }
}

export async function deleteParty(partyId, shopId) {
  const parties = (await getParties(shopId)).filter(p => p.id !== partyId);
  setLs(`parties_${shopId}`, parties);
  try {
    await deleteDoc(doc(db, 'shops', shopId, 'parties', partyId));
  } catch {}
}

export async function recordPartyPayment(partyId, amount, type = 'received', notes = '', shopId) {
  const parties = await getParties(shopId);
  const change = type === 'received' ? -Number(amount) : Number(amount);
  const updated = parties.map(p => {
    if (p.id === partyId) {
      return { ...p, balance: (p.balance || 0) + change };
    }
    return p;
  });
  setLs(`parties_${shopId}`, updated);
  try {
    const party = updated.find(p => p.id === partyId);
    if (party) {
      await updateDoc(doc(db, 'shops', shopId, 'parties', partyId), { balance: party.balance });
    }
  } catch {}
}

// ─── INVOICES ────────────────────────────────────────────────────────────────
export async function getInvoices(shopId) {
  try {
    const snap = await getDocs(invoicesCol(shopId));
    if (!snap.empty) {
      const items = toArray(snap);
      setLs(`invoices_${shopId}`, items);
      return items;
    }
  } catch {}
  return getLs(`invoices_${shopId}`, shopId === 'shop-1' ? shop1Invoices : shopId === 'shop-2' ? shop2Invoices : shop3Invoices);
}

export async function createInvoice(invoiceData, shopId) {
  const shop = await getShopById(shopId) || { invoicePrefix: 'INV-', nextInvoiceNum: 1001 };
  const invNumber = (shop.invoicePrefix || 'INV-') + (shop.nextInvoiceNum || 1001);

  // Increment invoice number
  await saveShop({ ...shop, nextInvoiceNum: (shop.nextInvoiceNum || 1001) + 1 });

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

  const newId = 'inv-' + Date.now();
  const newInvoice = {
    ...invoiceData,
    id: newId,
    invoiceNo: invNumber,
    date: invoiceData.date || new Date().toISOString().split('T')[0],
    subtotal, discount, tax,
    total: grandTotal,
    cogs: totalCost,
    paidAmount,
    balanceAdded: balanceDue,
    status,
  };

  // 1. Deduct stock
  for (const item of newInvoice.items) {
    if (item.productId) {
      await adjustStock(item.productId, -Number(item.qty || 1), shopId);
    }
  }

  // 2. Add customer khata balance if balance due
  if (balanceDue > 0 && invoiceData.customerId) {
    await recordPartyPayment(invoiceData.customerId, balanceDue, 'payable', 'Invoice balance', shopId);
  }

  // 3. Save invoice
  const invoices = await getInvoices(shopId);
  const updatedInvoices = [newInvoice, ...invoices];
  setLs(`invoices_${shopId}`, updatedInvoices);

  try {
    await setDoc(doc(db, 'shops', shopId, 'invoices', newId), newInvoice);
  } catch {}

  return newInvoice;
}

export async function deleteInvoice(invoiceId, shopId) {
  const invoices = (await getInvoices(shopId)).filter(i => i.id !== invoiceId);
  setLs(`invoices_${shopId}`, invoices);
  try {
    await deleteDoc(doc(db, 'shops', shopId, 'invoices', invoiceId));
  } catch {}
}

// ─── EXPENSES ────────────────────────────────────────────────────────────────
export async function getExpenses(shopId) {
  try {
    const snap = await getDocs(expensesCol(shopId));
    if (!snap.empty) {
      const items = toArray(snap);
      setLs(`expenses_${shopId}`, items);
      return items;
    }
  } catch {}
  return getLs(`expenses_${shopId}`, shopId === 'shop-1' ? shop1Expenses : shopId === 'shop-2' ? shop2Expenses : shop3Expenses);
}

export async function saveExpense(expense, shopId) {
  const expenses = await getExpenses(shopId);
  let updated;
  if (expense.id) {
    updated = expenses.map(e => (e.id === expense.id ? { ...e, ...expense } : e));
    setLs(`expenses_${shopId}`, updated);
    try {
      const { id, ...rest } = expense;
      await setDoc(doc(db, 'shops', shopId, 'expenses', id), rest, { merge: true });
    } catch {}
    return expense;
  } else {
    const newId = 'exp-' + Date.now();
    const newExp = {
      ...expense,
      id: newId,
      amount: Number(expense.amount) || 0,
      date: expense.date || new Date().toISOString().split('T')[0],
    };
    updated = [newExp, ...expenses];
    setLs(`expenses_${shopId}`, updated);
    try {
      await setDoc(doc(db, 'shops', shopId, 'expenses', newId), newExp);
    } catch {}
    return newExp;
  }
}

export async function deleteExpense(expenseId, shopId) {
  const expenses = (await getExpenses(shopId)).filter(e => e.id !== expenseId);
  setLs(`expenses_${shopId}`, expenses);
  try {
    await deleteDoc(doc(db, 'shops', shopId, 'expenses', expenseId));
  } catch {}
}

// ─── FINANCIAL METRICS ───────────────────────────────────────────────────────
export function computeFinancialMetrics(invoices = [], expenses = [], products = [], parties = []) {
  const totalSales = invoices.reduce((s, i) => s + (Number(i.total) || 0), 0);
  const totalCogs = invoices.reduce((s, i) => s + (Number(i.cogs) || 0), 0);
  const grossProfit = totalSales - totalCogs;
  const totalExpenses = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const netProfit = grossProfit - totalExpenses;
  const totalReceivables = parties.filter(p => p.type === 'Customer' && p.balance > 0).reduce((s, p) => s + p.balance, 0);
  const totalPayables = parties.filter(p => p.type === 'Supplier' && p.balance < 0).reduce((s, p) => s + Math.abs(p.balance), 0);
  const lowStockCount = products.filter(p => (p.stock || 0) <= (p.minStockAlert || 5)).length;
  const totalCashCollected = invoices.reduce((s, i) => s + (Number(i.paidAmount) || 0), 0);

  return {
    totalSales, totalCogs, grossProfit, totalExpenses, netProfit,
    totalReceivables, totalPayables, lowStockCount, totalCashCollected,
    totalProducts: products.length, totalInvoices: invoices.length,
  };
}

// ─── SUBSCRIPTION TRANSACTIONS (RENEWAL EXTENDS 30 DAYS & UNPAUSES) ─────────
export async function getSubscriptionTransactions() {
  try {
    const snap = await getDocs(collection(db, 'subscriptionTransactions'));
    if (!snap.empty) {
      const items = toArray(snap).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      setLs('sub_tx', items);
      return items;
    }
  } catch {}
  return getLs('sub_tx', initialSubscriptionTransactions);
}

export async function recordSubscriptionPayment({
  shopId, shopName, planName, amount, paymentMethod,
  trxId = '', cardLast4 = '', cardBrand = 'Visa',
}) {
  const platform = await getPlatformSettings();
  const newId = 'sub-tx-' + Date.now();
  const newTx = {
    id: newId,
    shopId, shopName, planName,
    amount: Number(amount) || 0,
    paymentMethod,
    trxId: trxId || (paymentMethod === 'Credit / Debit Card' ? `PAY-CARD-${Math.floor(100000 + Math.random() * 900000)}` : ''),
    cardLast4, cardBrand,
    date: new Date().toISOString().split('T')[0],
    status: paymentMethod === 'EasyPaisa' ? 'Deposited to Admin EasyPaisa' : 'Settled to Admin EasyPaisa Account',
    adminAccount: platform.adminEasypaisaNumber,
  };

  const txList = await getSubscriptionTransactions();
  const updatedTx = [newTx, ...txList];
  setLs('sub_tx', updatedTx);

  try {
    await setDoc(doc(db, 'subscriptionTransactions', newId), newTx);
  } catch {}

  // Automatically UNPAUSE & renew shop for +30 Days!
  const shops = await getShops();
  const shop = shops.find(s => s.id === shopId);
  if (shop) {
    const renewedShop = {
      ...shop,
      plan: planName,
      monthlyPrice: Number(amount) || shop.monthlyPrice,
      status: 'Active',
      manualPause: false,
      lastPaymentDate: getOffsetDate(0),
      nextDueDate: getOffsetDate(30),
      graceUntilDate: getOffsetDate(32),
    };
    await saveShop(renewedShop);
  }

  return newTx;
}
