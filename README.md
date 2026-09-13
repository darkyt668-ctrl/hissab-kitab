# BizTrack — Small Business Management & Khata System

BizTrack is a responsive, fast, and modern business management application tailored for micro, small, and medium retailers, grocery stores, and shop owners.

Built using **Node.js, React, Vite, Tailwind CSS, and JavaScript**.

---

## 🚀 Core Features Built

1. 📦 **Products & Stock Management**:
   - Product catalog with SKU, Category, Cost Price, Selling Price, Margin % calculation, and Units (Pcs, Kg, Bag, Tin, Pkt, etc.).
   - Reorder threshold levels & instant **Low-Stock warning badges**.
   - Quick stock adjustment modal (Receive stock delivery or deduct damaged/spoilage goods).

2. 🧾 **Sales Billing & Invoicing (POS)**:
   - Fast checkout invoice builder with item selection, stock validation, discounts, and payment methods.
   - Immediate stock decrement upon checkout.
   - Udhar tracking: split payments between cash collected and customer receivable balance.
   - Clean **Printable / PDF Sales Receipt** layout with business header.

3. 👥 **Customers & Suppliers Khata (Receivables / Payables)**:
   - Customer Udhar Ledger (Receivables): track who owes money and record cash recoveries (Vasooli).
   - Supplier Khata (Payables): track dues to wholesale vendors and record outbound payments.
   - Party transaction ledger history.

4. 💰 **Expense Tracking**:
   - Categorized operational overhead (Utilities, Salaries, Refreshment/Tea, Transport, Rent, Maintenance).
   - Category-wise spending breakdown.

5. 📊 **Profit & Loss Overview Dashboard**:
   - Total Sales Revenue.
   - Cost of Goods Sold (COGS).
   - Gross Profit & Net Profit calculations.
   - Total Receivables vs Payables.
   - Low-stock alert banner and recent invoices table.

6. 💎 **Subscription & Monetization Tier Engine**:
   - Tiered plans: **Free (Rs. 0)**, **Basic (Rs. 999/mo)**, **Pro (Rs. 1,999/mo)**, **Business (Rs. 3,999/mo)**.
   - Interactive **Monthly Recurring Revenue (MRR) Calculator** for business growth projections.
   - Plan tier switcher to test feature entitlements.

7. ⚙️ **Store Profile, Backup & Restore**:
   - Customize Store Name, Phone, Email, Tagline, and Currency symbol (`Rs.`).
   - One-click JSON backup export and restore.
   - Demo data reset button for instant testing.

---

## 🛠️ How to Run Locally

To launch the development server:

```bash
npm run dev
```

Then open your browser at `http://localhost:3000/`.

To build for production:

```bash
npm run build
```
