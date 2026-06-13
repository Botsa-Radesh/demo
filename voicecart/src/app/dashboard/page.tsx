'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useCoins } from '@/context/CoinsContext';
import { useCart } from '@/context/CartContext';
import { useOrder } from '@/context/OrderContext';
import { useMembers } from '@/context/MembersContext';
import { useToast } from '@/components/NotificationToast';
import { TemplateCard } from '@/components/TemplateCard';
import { BarChart, DonutChart } from '@/components/AnalyticsChart';

export default function DashboardPage() {
  const router = useRouter();
  const { balance, nextMilestone, redeemOptions, transactions, redeemCoins } = useCoins();
  const { savedTemplates, deleteTemplate, loadTemplate } = useCart();
  const { history } = useOrder();
  const { members } = useMembers();
  const { showToast } = useToast();

  const monthlyTotal = history
    .filter(o => new Date(o.date).getMonth() === new Date().getMonth())
    .reduce((s, o) => s + o.totalAmount, 0);

  const memberTotals = members.reduce((acc, m) => {
    const total = history.reduce((s, o) => {
      const payment = o.memberPayments.find(p => p.memberId === m.id);
      return s + (payment?.amount || 0);
    }, 0);
    acc[m.id] = { name: m.name, avatar: m.avatar, total, color: m.id === 'm1' ? '#FF9900' : m.id === 'm2' ? '#067D62' : '#007185' };
    return acc;
  }, {} as Record<string, { name: string; avatar: string; total: number; color: string }>);

  const categoryTotals = history.reduce((acc, o) => {
    for (const item of o.items) {
      const cat = item.product.category;
      acc[cat] = (acc[cat] || 0) + item.product.price * item.quantity;
    }
    return acc;
  }, {} as Record<string, number>);

  const categoryColors: Record<string, string> = {
    'Staples': '#FF9900',
    'Fruits & Vegetables': '#067D62',
    'Dairy': '#007185',
    'Snacks': '#DDE11D',
    'Beverages': '#E040FB',
    'Personal Care': '#FF69B4',
    'Household': '#00BCD4',
  };

  const categoryData = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .map(([label, value]) => ({ label, value, color: categoryColors[label] || '#888' }));

  const memberBarData = Object.values(memberTotals).map(m => ({
    label: m.name,
    value: m.total,
    color: m.color,
  }));

  const handleRedeem = (cost: number, label: string) => {
    const success = redeemCoins(cost, label);
    if (success) {
      showToast(`Redeemed ${label}!`, 'success');
    } else {
      showToast(`Need ${cost - balance} more coins for ${label}`, 'warning');
    }
  };

  return (
    <div className="page-content" style={{ paddingTop: 16, paddingBottom: 80 }}>
      <div className="page-header" style={{ margin: '-16px -16px 16px', borderRadius: 0 }}>
        <button className="back-btn" onClick={() => router.push('/')}>←</button>
        <h1>Dashboard</h1>
      </div>

      {/* Coins Section */}
      <div className="content-section" style={{ marginBottom: 20, border: '1px solid #f0c14b', background: '#fffbf0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <p style={{ fontSize: 12, color: 'var(--amazon-text-secondary)' }}>🪙 Amazon Coins</p>
            <p style={{ fontSize: 32, fontWeight: 700, color: 'var(--amazon-orange)' }}>{balance.toLocaleString()}</p>
          </div>
          <span style={{ fontSize: 48 }}>🪙</span>
        </div>
        <div className="progress-bar" style={{ height: 8, marginBottom: 4 }}>
          <div className="progress-fill" style={{ width: `${nextMilestone.progress * 100}%` }} />
        </div>
        <p style={{ fontSize: 11, color: 'var(--amazon-text-muted)' }}>
          {nextMilestone.remaining > 0
            ? `${nextMilestone.remaining} more to unlock ${nextMilestone.label}`
            : 'All rewards unlocked!'}
        </p>

        {/* Redeem Options */}
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          {redeemOptions.map(opt => (
            <button key={opt.label} className="btn btn-secondary btn-sm" style={{ flex: 1, fontSize: 11 }}
              onClick={() => handleRedeem(opt.cost, opt.label)}>
              {opt.label}<br />
              <span style={{ fontSize: 10, color: balance >= opt.cost ? 'var(--amazon-success)' : 'var(--amazon-text-muted)' }}>
                🪙{opt.cost}
              </span>
            </button>
          ))}
        </div>

        {/* Recent Transactions */}
        {transactions.length > 0 && (
          <div style={{ marginTop: 12, borderTop: '1px solid var(--amazon-border-light)', paddingTop: 8 }}>
            <p style={{ fontSize: 11, color: 'var(--amazon-text-muted)', marginBottom: 4 }}>Recent</p>
            {transactions.slice(0, 3).map(tx => (
              <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '2px 0' }}>
                <span style={{ color: 'var(--amazon-text-secondary)' }}>{tx.reason}</span>
                <span style={{ color: tx.type === 'earned' ? 'var(--amazon-success)' : 'var(--amazon-error)', fontWeight: 600 }}>
                  {tx.type === 'earned' ? '+' : ''}{tx.amount}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Spending Analytics */}
      <div className="content-section" style={{ marginBottom: 20 }}>
        <h3 className="section-title">📊 Spending Analytics</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <p style={{ fontSize: 11, color: 'var(--amazon-text-muted)' }}>This Month</p>
            <p style={{ fontSize: 24, fontWeight: 700 }}>₹{monthlyTotal.toLocaleString()}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 11, color: 'var(--amazon-text-muted)' }}>Orders</p>
            <p style={{ fontSize: 24, fontWeight: 700 }}>{history.length}</p>
          </div>
        </div>

        <BarChart data={memberBarData} title="Per Member" height={140} />

        <div style={{ marginTop: 20 }}>
          <h3 className="section-title">Category Breakdown</h3>
          <DonutChart data={categoryData} />
        </div>
      </div>

      {/* Cart Templates */}
      <div className="content-section" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 className="section-title" style={{ margin: 0 }}>📋 Cart Templates</h3>
          <span style={{ fontSize: 12, color: 'var(--amazon-text-muted)' }}>{savedTemplates.length} saved</span>
        </div>
        {savedTemplates.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--amazon-text-muted)', textAlign: 'center', padding: 20 }}>
            No templates saved yet
          </p>
        ) : (
          savedTemplates.map(t => (
            <div key={t.id} style={{ marginBottom: 8 }}>
              <TemplateCard template={t} onDelete={deleteTemplate} onLoad={loadTemplate} />
            </div>
          ))
        )}
      </div>

      {/* AI Insights */}
      <div className="content-section" style={{ border: '1px solid #f0c14b' }}>
        <h3 className="section-title">🤖 AI Insights</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="amazon-card" style={{ display: 'flex', gap: 8, alignItems: 'center', padding: 12 }}>
            <span style={{ fontSize: 20 }}>🥛</span>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--amazon-text)' }}>You order milk every 3.5 days</p>
              <p style={{ fontSize: 11, color: 'var(--amazon-text-muted)' }}>Based on 8 past orders</p>
            </div>
          </div>
          <div className="amazon-card" style={{ display: 'flex', gap: 8, alignItems: 'center', padding: 12 }}>
            <span style={{ fontSize: 20 }}>🍟</span>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--amazon-text)' }}>Group snack spending ↑ 40% vs last month</p>
              <p style={{ fontSize: 11, color: 'var(--amazon-text-muted)' }}>Mainly Lays and Maggi</p>
            </div>
          </div>
          <div className="amazon-card" style={{ display: 'flex', gap: 8, alignItems: 'center', padding: 12 }}>
            <span style={{ fontSize: 20 }}>🏷️</span>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--amazon-text)' }}>Switch to Amazon brands → save ₹320/month</p>
              <p style={{ fontSize: 11, color: 'var(--amazon-text-muted)' }}>On staples and dairy</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ height: 24 }} />
    </div>
  );
}
