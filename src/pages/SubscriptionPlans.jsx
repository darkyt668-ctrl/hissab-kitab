import React, { useState } from 'react';
import { 
  Check, 
  Crown, 
  Sparkles, 
  Calculator, 
  Users, 
  TrendingUp, 
  ShieldCheck,
  Zap
} from 'lucide-react';
import { subscriptionPlans } from '../services/dataSeed';

export default function SubscriptionPlans({ currentPlan, onSelectPlan, currency }) {
  const [customerCount, setCustomerCount] = useState(100);
  const [selectedTierPrice, setSelectedTierPrice] = useState(1999);

  const estimatedMonthlyRevenue = customerCount * selectedTierPrice;

  return (
    <div className="space-y-10 pb-16">
      {/* Title & Introduction */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          Monetization & Subscription Architecture
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
          Scalable SaaS Pricing Plans
        </h2>
        <p className="text-sm text-slate-600 mt-2">
          Simple tiered model designed for micro and small businesses. You don't need millions of visitors — you need paying businesses.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {subscriptionPlans.map((plan) => {
          const isCurrent = currentPlan?.toLowerCase() === plan.id.toLowerCase();
          const isPro = plan.id === 'pro';

          return (
            <div
              key={plan.id}
              className={`relative rounded-3xl p-6 flex flex-col justify-between transition-all ${
                isCurrent 
                  ? 'bg-white border-2 border-indigo-600 shadow-xl shadow-indigo-600/10 ring-4 ring-indigo-500/10' 
                  : isPro 
                    ? 'bg-gradient-to-b from-slate-900 to-indigo-950 text-white shadow-lg border border-indigo-800' 
                    : 'bg-white border border-slate-200 shadow-sm hover:shadow-md'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-[10px] uppercase tracking-wider py-1 px-3 rounded-full shadow-sm">
                  {plan.badge}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`text-lg font-bold ${isPro ? 'text-white' : 'text-slate-900'}`}>
                    {plan.name}
                  </h3>
                  {isCurrent && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Active
                    </span>
                  )}
                </div>

                <p className={`text-xs mb-4 min-h-[32px] ${isPro ? 'text-slate-300' : 'text-slate-500'}`}>
                  {plan.description}
                </p>

                <div className="mb-6">
                  <span className={`text-3xl font-extrabold ${isPro ? 'text-white' : 'text-slate-900'}`}>
                    {currency} {plan.price.toLocaleString()}
                  </span>
                  <span className={`text-xs ml-1 ${isPro ? 'text-slate-400' : 'text-slate-500'}`}>
                    /{plan.period}
                  </span>
                </div>

                <div className="space-y-2.5 mb-6 text-xs">
                  {plan.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check className={`w-4 h-4 shrink-0 mt-0.5 ${isPro ? 'text-indigo-400' : 'text-indigo-600'}`} />
                      <span className={isPro ? 'text-slate-200' : 'text-slate-700'}>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <button
                  onClick={() => onSelectPlan(plan.name)}
                  disabled={isCurrent}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                    isCurrent
                      ? 'bg-slate-100 text-slate-400 cursor-default'
                      : isPro
                        ? 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-md shadow-indigo-500/30'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                  }`}
                >
                  {isCurrent ? 'Current Plan' : `Switch to ${plan.name}`}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue Projection Interactive Calculator */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-xl space-y-3">
            <div className="inline-flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <Calculator className="w-4 h-4" />
              SaaS Business Revenue Model
            </div>
            <h3 className="text-2xl font-black">
              Monthly Recurring Revenue (MRR) Calculator
            </h3>
            <p className="text-xs text-indigo-200 leading-relaxed">
              Targeting small and medium physical stores: If you get just 100 paying businesses on the Pro plan (Rs. 1,999/mo), that generates <strong>Rs. 199,900/month</strong> in predictable subscription income without needing millions of casual website visitors!
            </p>

            {/* Sliders and Selectors */}
            <div className="space-y-4 pt-3">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>Number of Paying Store Clients:</span>
                  <span className="text-amber-400 text-sm">{customerCount} stores</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="1000"
                  step="10"
                  value={customerCount}
                  onChange={(e) => setCustomerCount(Number(e.target.value))}
                  className="w-full accent-indigo-400 cursor-pointer"
                />
              </div>

              <div>
                <span className="text-xs font-bold block mb-1">Average Plan Price:</span>
                <div className="flex gap-2">
                  {[
                    { label: 'Basic (Rs. 999)', price: 999 },
                    { label: 'Pro (Rs. 1,999)', price: 1999 },
                    { label: 'Business (Rs. 3,999)', price: 3999 }
                  ].map(tier => (
                    <button
                      key={tier.price}
                      onClick={() => setSelectedTierPrice(tier.price)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                        selectedTierPrice === tier.price
                          ? 'bg-white text-indigo-900'
                          : 'bg-indigo-950/60 text-indigo-200 hover:bg-indigo-950'
                      }`}
                    >
                      {tier.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Result Box */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center w-full lg:w-80 shrink-0">
            <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider block mb-1">
              Projected Monthly Revenue
            </span>
            <div className="text-3xl sm:text-4xl font-black text-amber-400">
              {currency} {estimatedMonthlyRevenue.toLocaleString()}
            </div>
            <span className="text-[11px] text-indigo-200 block mt-1">
              per month (~{currency} {(estimatedMonthlyRevenue * 12).toLocaleString()} / year)
            </span>

            <div className="mt-4 pt-4 border-t border-white/10 text-left text-xs text-indigo-100 space-y-1">
              <div className="flex justify-between">
                <span>Paying Clients:</span>
                <span className="font-bold text-white">{customerCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Avg Revenue / User:</span>
                <span className="font-bold text-white">{currency} {selectedTierPrice}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
