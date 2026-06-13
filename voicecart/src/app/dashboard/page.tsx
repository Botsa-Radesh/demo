'use client';
import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCoins } from '@/context/CoinsContext';
import { useCart } from '@/context/CartContext';
import { useOrder } from '@/context/OrderContext';
import { useMembers } from '@/context/MembersContext';
import { useToast } from '@/components/NotificationToast';
import { TemplateCard } from '@/components/TemplateCard';
import { BarChart, DonutChart } from '@/components/AnalyticsChart';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getTimeBasedTip(hour: number): string {
  if (hour < 10) return '🌅 Morning orders get priority delivery slots!';
  if (hour < 14) return '☀️ Lunch rush — order now for 2-4 PM delivery';
  if (hour < 18) return '🌇 Evening slots filling up — lock yours in!';
  return '🌙 Late orders deliver tomorrow morning';
}

export default function DashboardPage() {
  const router = useRouter();
  const { balance, nextMilestone, redeemOptions, transactions, redeemCoins, streak } = useCoins();
  const { savedTemplates, deleteTemplate, loadTemplate, totalPrice, totalItems } = useCart();
  const { history } = useOrder();
  const { members, currentUserId, getMemberById } = useMembers();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'coins' | 'templates'>('overview');

  const currentUser = getMemberById(currentUserId);

  const monthlyTotal = useMemo(() =>
    history
      .filter(o => new Date(o.date).getMonth() === new Date().getMonth())
      .reduce((s, o) => s + o.totalAmount, 0),
    [history]
  );

  const lastMonthTotal = useMemo(() => {
    const lastMonth = new Date().getMonth() - 1;
    return history
      .filter(o => new Date(o.date).getMonth() === lastMonth)
      .reduce((s, o) => s + o.totalAmount, 0);
  }, [history]);

  const monthlyChange = lastMonthTotal > 0
    ? Math.round(((monthlyTotal - lastMonthTotal) / lastMonthTotal) * 100)
    : 0;

  const memberTotals = useMemo(() =>
    members.reduce((acc, m) => {
      const total = history.reduce((s, o) => {
        const payment = o.memberPayments.find(p => p.memberId === m.id);
        return s + (payment?.amount || 0);
      }, 0);
      acc[m.id] = { name: m.name, avatar: m.avatar, total, color: m.id === 'm1' ? '#FF9900' : m.id === 'm2' ? '#067D62' : '#007185' };
      return acc;
    }, {} as Record<string, { name: string; avatar: string; total: number; color: string }>),
    [members, history]
  );

  const categoryTotals = useMemo(() =>
    history.reduce((acc, o) => {
      for (const item of o.items) {
        const cat = item.product.category;
        acc[cat] = (acc[cat] || 0) + item.product.price * item.quantity;
      }
      return acc;
    }, {} as Record<string, number>),
    [history]
  );

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

  // Dynamic AI Insights based on actual order history
  const aiInsights = useMemo(() => {
    const insights: { icon: string; title: string; subtitle: string }[] = [];

    // Frequency insight
    if (history.length >= 2) {
      const dates = history.map(o => new Date(o.date).getTime()).sort((a, b) => a - b);
      const avgGap = (dates[dates.length - 1] - dates[0]) / (dates.length - 1) / (1000 * 60 * 60 * 24);
      insights.push({
        icon: '📊',
        title: `You order every ${avgGap.toFixed(1)} days on average`,
        subtitle: `Based on ${history.length} past orders`,
      });
    }

    // Top category insight
    if (categoryData.length > 0) {
      const top = categoryData[0];
      const pct = Math.round((top.value / monthlyTotal) * 100) || 0;
      insights.push({
        icon: '🏷️',
        title: `${top.label} is ${pct}% of your spending`,
        subtitle: `₹${top.value} spent this month`,
      });
    }

    // Streak insight
    if (streak >= 3) {
      insights.push({
        icon: '🔥',
        title: `${streak}-order streak! Earning 3% bonus coins`,
        subtitle: 'Keep ordering with Amazon Pay to maintain it',
      });
    }

    // Group spending insight
    const topSpender = Object.values(memberTotals).sort((a, b) => b.total - a.total)[0];
    if (topSpender && topSpender.total > 0) {
      insights.push({
        icon: '👥',
        title: `${topSpender.name} contributes most to the cart`,
        subtitle: `₹${topSpender.total} across all orders`,
      });
    }

    // Time-based tip
    insights.push({
      icon: '⏰',
      title: getTimeBasedTip(new Date().getHours()),
      subtitle: 'Based on delivery patterns in your area',
    });

    // Savings tip
    if (monthlyTotal > 500) {
      const savings = Math.round(monthlyTotal * 0.12);
      insights.push({
        icon: '💡',
        title: `Switch to Amazon brands → save ~₹${savings}/month`,
        subtitle: 'On staples and dairy categories',
      });
    }

    return insights.slice(0, 4);
  }, [history, categoryData, monthlyTotal, streak, memberTotals]);

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
      {/* Greeting Header */}
      <div style={{
        background: 'linear-gradient(135deg, #232F3E 0%, #37475A 100%)',
        borderRadius: 12,
        padding: '24px 20px',
        marginBottom: 20,
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -20, right: -20,
          width: 120, height: 120, borderRadius: '50%',
          background: 'rgba(255,153,0,0.1)',
        }} />
        <div style={{
          position: 'absolute', bottom: -30, right: 40,
          width: 80, height: 80, borderRadius: '50%',
          background: 'rgba(255,153,0,0.05)',
        }} />
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>
          {getGreeting()}, {currentUser?.name || 'there'} 👋
        </p>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
          Your Shopping Dashboard
        </h1>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>This Month</p>
            <p style={{ fontSize: 24, fontWeight: 700, color: '#FF9900' }}>₹{monthlyTotal.toLocaleString()}</p>
            {monthlyChange !== 0 && (
              <p style={{ fontSize: 11, color: monthlyChange > 0 ? '#FF6B6B' : '#67CB33' }}>
                {monthlyChange > 0 ? '↑' : '↓'} {Math.abs(monthlyChange)}% vs last month
              </p>
            )}
          </div>
          <div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Orders</p>
            <p style={{ fontSize: 24, fontWeight: 700 }}>{history.length}</p>
          </div>
          <div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Streak</p>
            <p style={{ fontSize: 24, fontWeight: 700 }}>🔥 {streak}</p>
          </div>
          <div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Coins</p>
            <p style={{ fontSize: 24, fontWeight: 700, color: '#FFD700' }}>🪙 {balance.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 20 }}>
        <button className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          📊 Overview
        </button>
        <button className={`tab ${activeTab === 'coins' ? 'active' : ''}`} onClick={() => setActiveTab('coins')}>
          🪙 Coins & Rewards
        </button>
        <button className={`tab ${activeTab === 'templates' ? 'active' : ''}`} onClick={() => setActiveTab('templates')}>
          📋 Templates
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="animate-fadeIn">
          {/* AI Insights */}
          <div className="content-section" style={{ marginBottom: 20, border: '1px solid rgba(255,153,0,0.2)', background: 'linear-gradient(135deg, #FFFBF0 0%, #FFF8E8 100%)' }}>
            <h3 className="section-title" style={{ fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>🤖</span> Smart Insights
              <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--amazon-text-muted)', marginLeft: 'auto' }}>
                Updated now
              </span>
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
              {aiInsights.map((insight, i) => (
                <div key={i} className="amazon-card animate-fadeIn" style={{
                  display: 'flex', gap: 12, alignItems: 'flex-start', padding: 14,
                  animationDelay: `${i * 0.1}s`,
                  border: '1px solid var(--amazon-border-light)',
                }}>
                  <span style={{ fontSize: 24, flexShrink: 0 }}>{insight.icon}</span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--amazon-text)', lineHeight: 1.3 }}>
                      {insight.title}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--amazon-text-muted)', marginTop: 2 }}>
                      {insight.subtitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Charts Section */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 20 }}>
            {/* Per-Member Chart */}
            <div className="content-section">
              <h3 className="section-title" style={{ fontSize: 14 }}>👥 Spending by Member</h3>
              {memberBarData.some(d => d.value > 0) ? (
                <BarChart data={memberBarData} height={160} />
              ) : (
                <div style={{ textAlign: 'center', padding: 24, color: 'var(--amazon-text-muted)' }}>
                  <span style={{ fontSize: 32 }}>📊</span>
                  <p style={{ fontSize: 13, marginTop: 8 }}>Place orders to see member breakdown</p>
                </div>
              )}
            </div>

            {/* Category Chart */}
            <div className="content-section">
              <h3 className="section-title" style={{ fontSize: 14 }}>🏷️ Category Breakdown</h3>
              {categoryData.length > 0 ? (
                <DonutChart data={categoryData} />
              ) : (
                <div style={{ textAlign: 'center', padding: 24, color: 'var(--amazon-text-muted)' }}>
                  <span style={{ fontSize: 32 }}>🍩</span>
                  <p style={{ fontSize: 13, marginTop: 8 }}>Category data appears after your first order</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Orders */}
          {history.length > 0 && (
            <div className="content-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 className="section-title" style={{ fontSize: 14, margin: 0 }}>📦 Recent Orders</h3>
                <button className="btn btn-link" onClick={() => router.push('/orders')}>View All</button>
              </div>
              {history.slice(0, 3).map(order => (
                <div key={order.id} className="amazon-card" style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--amazon-text)' }}>
                      {order.items.length} items · {order.splitMode} split
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--amazon-text-muted)' }}>
                      {new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--amazon-price)' }}>₹{order.totalAmount}</p>
                    <span className={`badge ${order.status === 'delivered' ? 'badge-success' : 'badge-warning'}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Coins Tab */}
      {activeTab === 'coins' && (
        <div className="animate-fadeIn">
          {/* Coins Balance Card */}
          <div className="content-section" style={{
            marginBottom: 20,
            background: 'linear-gradient(135deg, #FFFBF0 0%, #FFF3D4 100%)',
            border: '1px solid #f0c14b',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <p style={{ fontSize: 12, color: 'var(--amazon-text-secondary)', marginBottom: 4 }}>🪙 Amazon Coins Balance</p>
                <p style={{ fontSize: 40, fontWeight: 800, color: 'var(--amazon-orange)', lineHeight: 1 }}>{balance.toLocaleString()}</p>
                {streak >= 3 && (
                  <p style={{ fontSize: 11, color: 'var(--amazon-success)', marginTop: 4 }}>
                    🔥 {streak}-order streak active! +3% bonus on every order
                  </p>
                )}
              </div>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'linear-gradient(135deg, #FFD700, #FF9900)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 32, boxShadow: '0 4px 12px rgba(255,153,0,0.3)',
              }}>
                🪙
              </div>
            </div>

            {/* Milestone Progress */}
            <div style={{ background: 'rgba(255,255,255,0.6)', borderRadius: 8, padding: 12, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--amazon-text-secondary)' }}>Next: {nextMilestone.label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--amazon-orange)' }}>
                  {Math.round(nextMilestone.progress * 100)}%
                </span>
              </div>
              <div className="progress-bar" style={{ height: 10, background: 'rgba(0,0,0,0.06)' }}>
                <div className="progress-fill" style={{
                  width: `${nextMilestone.progress * 100}%`,
                  background: 'linear-gradient(90deg, #FF9900, #FFD700)',
                  borderRadius: 5,
                }} />
              </div>
              <p style={{ fontSize: 11, color: 'var(--amazon-text-muted)', marginTop: 4 }}>
                {nextMilestone.remaining > 0
                  ? `${nextMilestone.remaining.toLocaleString()} more coins needed`
                  : '🎉 All rewards unlocked!'}
              </p>
            </div>

            {/* Redeem Options */}
            <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--amazon-text)' }}>Redeem Rewards</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {redeemOptions.map(opt => {
                const canRedeem = balance >= opt.cost;
                return (
                  <button key={opt.label} className={`btn ${canRedeem ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                    style={{ flexDirection: 'column', padding: '10px 8px', height: 'auto' }}
                    onClick={() => handleRedeem(opt.cost, opt.label)}
                    disabled={!canRedeem}
                  >
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{opt.label}</span>
                    <span style={{ fontSize: 10, marginTop: 2, color: canRedeem ? '#111' : 'var(--amazon-text-muted)' }}>
                      🪙 {opt.cost.toLocaleString()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Transaction History */}
          <div className="content-section">
            <h3 className="section-title" style={{ fontSize: 14 }}>📜 Transaction History</h3>
            {transactions.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--amazon-text-muted)', textAlign: 'center', padding: 20 }}>
                No transactions yet. Start shopping to earn coins!
              </p>
            ) : (
              <div>
                {transactions.slice(0, 10).map(tx => (
                  <div key={tx.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 0', borderBottom: '1px solid var(--amazon-border-light)',
                  }}>
                    <div>
                      <p style={{ fontSize: 13, color: 'var(--amazon-text)' }}>{tx.reason}</p>
                      <p style={{ fontSize: 11, color: 'var(--amazon-text-muted)' }}>
                        {new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span style={{
                      fontSize: 14, fontWeight: 700,
                      color: tx.type === 'earned' ? 'var(--amazon-success)' : 'var(--amazon-error)',
                    }}>
                      {tx.type === 'earned' ? '+' : ''}{tx.amount}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="animate-fadeIn">
          <div className="content-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 className="section-title" style={{ fontSize: 14, margin: 0 }}>📋 Saved Templates</h3>
              <span className="badge badge-info">{savedTemplates.length} saved</span>
            </div>
            {savedTemplates.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 32 }}>
                <span style={{ fontSize: 48 }}>📋</span>
                <p style={{ fontSize: 14, color: 'var(--amazon-text-secondary)', marginTop: 12 }}>
                  No templates saved yet
                </p>
                <p style={{ fontSize: 12, color: 'var(--amazon-text-muted)', marginTop: 4 }}>
                  Add items to cart and save as a template for quick reordering
                </p>
                <button className="btn btn-primary mt-12" onClick={() => router.push('/voice-cart')}>
                  🎙️ Start Shopping
                </button>
              </div>
            ) : (
              savedTemplates.map(t => (
                <div key={t.id} style={{ marginBottom: 10 }}>
                  <TemplateCard template={t} onDelete={deleteTemplate} onLoad={loadTemplate} />
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
