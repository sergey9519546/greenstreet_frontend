import React from 'react';
import { Zap, ArrowUpRight, DollarSign, Percent, RefreshCw } from 'lucide-react';
import { swatch, radius } from '../theme';

export interface DealRescuePanelProps {
  currentDSCR: number;
  monthlyPITIA: number;
  monthlyRent: number;
  purchasePrice: number;
  loanAmount: number;
  currentRatePct: number;
  onApplyAction: (actionKey: 'IO' | 'BUYDOWN' | 'SELLER_CREDIT' | 'TOP_UP_LTV' | 'AIRDNA_STR') => void;
}

export function DealRescuePanel({
  currentDSCR,
  monthlyPITIA,
  monthlyRent,
  purchasePrice,
  loanAmount,
  currentRatePct,
  onApplyAction,
}: DealRescuePanelProps) {
  if (currentDSCR >= 1.0) {
    return null; // Deal already qualifies (DSCR >= 1.0x)
  }

  // Calculate rescue metrics
  const ioEstimatedPayment = (loanAmount * (currentRatePct / 100)) / 12 + (monthlyPITIA - (loanAmount * (currentRatePct / 100)) / 12);
  const ioDSCRBoost = Math.max(0, (monthlyRent / (monthlyPITIA * 0.82)) - currentDSCR);
  const topUpDownPaymentAmount = Math.round(purchasePrice * 0.05);

  const actions = [
    {
      key: 'IO' as const,
      icon: <Zap className="w-4 h-4" style={{ color: swatch.lemon }} />,
      title: 'Switch to Interest-Only (IO)',
      description: 'Lowers debt service by 15–22%, boosting DSCR by ~+0.15 points.',
      badge: `+${ioDSCRBoost.toFixed(2)}x DSCR`,
      tagColor: swatch.lemon,
    },
    {
      key: 'BUYDOWN' as const,
      icon: <Percent className="w-4 h-4" style={{ color: swatch.emerald }} />,
      title: 'Add 1.0 Discount Point Buydown',
      description: 'Reduces interest rate by ~0.25%, lowering monthly P&I payment.',
      badge: '-0.25% Rate',
      tagColor: swatch.emerald,
    },
    {
      key: 'SELLER_CREDIT' as const,
      icon: <DollarSign className="w-4 h-4" style={{ color: swatch.pistachio }} />,
      title: 'Request 2% Seller Closing Credit',
      description: 'Offsets upfront points without increasing borrower cash out-of-pocket.',
      badge: 'Cash Neutral',
      tagColor: swatch.pistachio,
    },
    {
      key: 'TOP_UP_LTV' as const,
      icon: <ArrowUpRight className="w-4 h-4" style={{ color: swatch.lemon }} />,
      title: `Top-Up Down Payment by 5% ($${topUpDownPaymentAmount.toLocaleString()})`,
      description: 'Lowers loan balance to drop into a lower LTV pricing tier.',
      badge: 'Lower LTV Tier',
      tagColor: swatch.lemon,
    },
    {
      key: 'AIRDNA_STR' as const,
      icon: <RefreshCw className="w-4 h-4" style={{ color: swatch.emerald }} />,
      title: 'Switch to AirDNA STR Projection',
      description: 'Underwrite using short-term rental market revenue data.',
      badge: 'STR Market Net',
      tagColor: swatch.emerald,
    },
  ];

  return (
    <div
      className="p-5 my-4"
      style={{
        background: '#064a4c',
        border: '1px solid rgba(216,217,88,0.3)',
        borderRadius: radius.md,
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span
          className="w-7 h-7 flex items-center justify-center font-bold text-xs"
          style={{
            background: 'rgba(216,217,88,0.2)',
            color: swatch.lemon,
            borderRadius: '50%',
          }}
        >
          !
        </span>
        <div>
          <h4
            className="text-sm font-bold tracking-tight"
            style={{ color: swatch.pistachio }}
          >
            Interactive Deal Rescue Panel
          </h4>
          <p className="text-xs" style={{ color: 'rgba(238,239,211,0.72)' }}>
            Current DSCR is <span className="font-mono text-red-400 font-bold">{currentDSCR.toFixed(2)}x</span> (below 1.00x qualification floor). Select an optimization below to restructure:
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
        {actions.map((act) => (
          <button
            key={act.key}
            onClick={() => onApplyAction(act.key)}
            className="p-3 text-left transition flex flex-col justify-between group"
            style={{
              background: 'rgba(238,239,211,0.04)',
              border: '1px solid rgba(238,239,211,0.14)',
              borderRadius: radius.sm,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(216,217,88,0.12)';
              e.currentTarget.style.borderColor = 'rgba(216,217,88,0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(238,239,211,0.04)';
              e.currentTarget.style.borderColor = 'rgba(238,239,211,0.14)';
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {act.icon}
                  <span
                    className="text-xs font-bold"
                    style={{ color: swatch.pistachio }}
                  >
                    {act.title}
                  </span>
                </div>
                <span
                  className="text-[10px] font-mono font-bold px-1.5 py-0.5"
                  style={{
                    background: `${act.tagColor}20`,
                    color: act.tagColor,
                    borderRadius: radius.pill,
                  }}
                >
                  {act.badge}
                </span>
              </div>
              <p
                className="text-[11px] leading-relaxed"
                style={{ color: 'rgba(238,239,211,0.65)' }}
              >
                {act.description}
              </p>
            </div>
            <div
              className="mt-2 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 opacity-80 group-hover:opacity-100"
              style={{ color: swatch.lemon }}
            >
              Apply Rescue Strategy &rarr;
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
