'use client';
import React, { Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useMembers } from '@/context/MembersContext';
import { useCommonCart } from '@/context/CommonCartContext';
import { useToast } from '@/components/NotificationToast';
import { MicrophoneButton } from '@/components/MicrophoneButton';
import { VoiceTranscript } from '@/components/VoiceTranscript';
import { CartItemRow } from '@/components/CartItem';
import { MemberAvatar } from '@/components/MemberAvatar';
import { RecipeModal } from '@/components/RecipeModal';
import { AllergyWarningModal } from '@/components/AllergyWarning';
import { BudgetBar } from '@/components/BudgetBar';
import { useVoice } from '@/hooks/useVoice';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { parseVoiceCommand } from '@/utils/voiceParser';
import { optimizeCartForBudget } from '@/utils/budgetOptimizer';
import { findSubstitution } from '@/utils/substitutionEngine';
import { checkAllergies } from '@/utils/allergyChecker';
import { searchProducts, products } from '@/data/products';
import { recipes, getRecipeById } from '@/data/recipes';
import { Recipe } from '@/types';
import { AllergyWarning as AllergyWarningType } from '@/utils/allergyChecker';

type PageMode = 'voice' | 'recipe' | 'budget' | 'normal';

function VoiceCartPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    items, addItem, removeItem, updateQuantity, toggleShared, clearCart,
    totalItems, totalPrice, getItemsByMember, getSharedItems,
  } = useCart();
  const { members, currentUserId, getMemberById } = useMembers();
  const { currentCart } = useCommonCart();
  const { showToast } = useToast();
  const { isSupported, isListening, transcript, interimTranscript, startListening, stopListening } = useVoice();
  const { speak } = useSpeechSynthesis();

  const [micStatus, setMicStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [recentCommands, setRecentCommands] = useState<string[]>([]);
  const [mode, setMode] = useState<PageMode>('normal');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [allergyWarning, setAllergyWarning] = useState<AllergyWarningType | null>(null);
  const [budgetMode, setBudgetMode] = useState(false);
  const [budgetAmount, setBudgetAmount] = useState(500);
  const [highlightMember, setHighlightMember] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const cartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const budget = searchParams.get('budget');
    if (budget) {
      setBudgetMode(true);
      setBudgetAmount(Number(budget));
      setMode('budget');
      handleBudgetCart(Number(budget));
    }
  }, [searchParams]);

  const handleVoiceCommand = useCallback(async (text: string) => {
    setMicStatus('processing');
    setIsAiTyping(true);

    await new Promise(r => setTimeout(r, 600));

    const command = parseVoiceCommand(text);
    setAiResponse(command.response);
    setIsAiTyping(false);
    setRecentCommands(prev => [text, ...prev].slice(0, 5));

    switch (command.intent) {
      case 'ADD_ITEM': {
        const product = products.find(p => p.id === command.params.productId);
        if (product) {
          if (product.stockStatus === 'out_of_stock') {
            const sub = findSubstitution(product);
            if (sub) {
              addItem(sub.suggested, 1, currentUserId, true);
              showToast(`${product.name} out of stock! Added ${sub.suggested.name} instead`, 'warning');
              speak(`${sub.suggested.name} added as substitute`);
            }
          } else {
            const qty = parseInt(command.params.quantity) || 1;
            addItem(product, qty, currentUserId, false);
            showToast(`Added ${qty} ${product.name}`, 'success');
            speak(command.response);
            const warning = checkAllergies(product, members, products);
            if (warning) {
              setTimeout(() => setAllergyWarning(warning), 500);
            }
          }
        }
        break;
      }
      case 'REMOVE_ITEM': {
        const toRemove = items.find(i => i.product.id === command.params.productId);
        if (toRemove) removeItem(toRemove.id);
        showToast(command.response, 'success');
        speak(command.response);
        break;
      }
      case 'RECIPE': {
        const recipe = getRecipeById(command.params.recipeId);
        if (recipe) {
          const servings = parseInt(command.params.servings) || recipe.servings;
          setSelectedRecipe({ ...recipe, servings });
          setMode('recipe');
          speak(command.response);
        }
        break;
      }
      case 'BUDGET': {
        const amount = parseInt(command.params.amount) || 500;
        setBudgetAmount(amount);
        setBudgetMode(true);
        setMode('budget');
        handleBudgetCart(amount);
        speak(command.response);
        break;
      }
      case 'TEMPLATE': {
        showToast(command.response, 'success');
        speak(command.response);
        break;
      }
      case 'SUMMARY': {
        const summary = items.map(i => `${i.quantity} ${i.product.name}`).join(', ');
        speak(`Your cart has ${totalItems} items: ${summary || 'nothing yet'}`);
        break;
      }
      case 'MARK_SHARED': {
        const item = items.find(i => i.product.id === command.params.productId);
        if (item) toggleShared(item.id);
        speak(command.response);
        break;
      }
      case 'HIGHLIGHT': {
        setHighlightMember(command.params.memberId);
        const member = getMemberById(command.params.memberId);
        speak(`Here&apos;s what ${member?.name || 'they'} added`);
        setTimeout(() => setHighlightMember(null), 3000);
        break;
      }
      case 'CHECKOUT': {
        router.push('/split-payment');
        break;
      }
      case 'REORDER': {
        speak('Reordering your essentials!');
        showToast('Essentials added to cart!', 'success');
        break;
      }
      default: {
        const product = searchProducts(text)[0];
        if (product) {
          addItem(product, 1, currentUserId, false);
          showToast(`Added ${product.name}`, 'success');
          speak(`Added ${product.name} to cart!`);
        } else {
          speak("I didn't quite catch that. Try again!");
        }
      }
    }

    setMicStatus('idle');
  }, [items, addItem, removeItem, toggleShared, showToast, speak, members, currentUserId, totalItems, router, getMemberById]);

  const handleMicToggle = useCallback(() => {
    if (isListening) {
      stopListening();
      if (transcript) handleVoiceCommand(transcript);
      setMicStatus('idle');
    } else {
      startListening();
      setMicStatus('listening');
      setAiResponse('');
    }
  }, [isListening, stopListening, startListening, transcript, handleVoiceCommand]);

  const handleBudgetCart = (amount: number) => {
    const result = optimizeCartForBudget(amount, items, currentUserId);
    for (const item of result.items) {
      addItem(item.product, item.quantity, currentUserId, true);
    }
    showToast(`Budget cart under ₹${amount} built!`, 'success');
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = inputRef.current?.value;
    if (val) {
      handleVoiceCommand(val);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const sharedItems = getSharedItems();
  const memberItemMap = members.reduce((acc, m) => {
    acc[m.id] = getItemsByMember(m.id);
    return acc;
  }, {} as Record<string, typeof items>);

  return (
    <div className="page-content" style={{ paddingTop: 16, paddingBottom: 80 }}>
      {/* Header */}
      <div className="amazon-card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button className="back-btn" onClick={() => router.push('/')}>←</button>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--amazon-text)' }}>
              {currentCart?.name || 'My Cart'}
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {members.map(m => <MemberAvatar key={m.id} member={m} size={32} />)}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--amazon-text-secondary)' }}>
            {totalItems} items
          </span>
          <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--amazon-price)' }}>
            ₹{totalPrice}
          </span>
        </div>
      </div>

      {/* Budget Bar */}
      {budgetMode && (
        <div style={{ marginBottom: 16 }}>
          <BudgetBar current={totalPrice} budget={budgetAmount} />
        </div>
      )}

      {/* Voice Section */}
      <div className="amazon-card" style={{ textAlign: 'center', padding: 20, marginBottom: 16 }}>
        <MicrophoneButton status={micStatus} onClick={handleMicToggle} />
        <VoiceTranscript
          transcript={transcript}
          interimTranscript={interimTranscript}
          aiResponse={aiResponse}
          isTyping={isAiTyping}
        />

        {/* Fallback Text Input */}
        <form onSubmit={handleTextSubmit} style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <input
            ref={inputRef}
            placeholder="Type a command..."
            style={{ flex: 1, fontSize: 13, padding: '8px 12px' }}
          />
          <button type="submit" className="btn btn-primary btn-sm">Send</button>
        </form>

        {/* Suggestion Chips */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginTop: 12 }}>
          <button className={`chip ${mode === 'recipe' ? 'active' : ''}`}
            onClick={() => {
              if (selectedRecipe) { setMode('recipe'); return; }
              setSelectedRecipe(recipes[0]);
              setMode('recipe');
            }}>🍳 Recipe Mode</button>
          <button className={`chip ${budgetMode ? 'active' : ''}`}
            onClick={() => {
              setBudgetMode(!budgetMode);
              setMode(budgetMode ? 'normal' : 'budget');
              if (!budgetMode) handleBudgetCart(budgetAmount);
            }}>💰 Budget Mode</button>
          <button className="chip"
            onClick={() => router.push('/dashboard')}>📋 Templates</button>
          <button className="chip"
            onClick={() => {
              showToast('Essentials added!', 'success');
            }}>📅 Reorder</button>
        </div>

        {/* Recent Commands */}
        {recentCommands.length > 0 && (
          <div style={{ marginTop: 12, textAlign: 'left' }}>
            <p style={{ fontSize: 11, color: 'var(--amazon-text-muted)', marginBottom: 4 }}>Recent commands:</p>
            {recentCommands.map((cmd, i) => (
              <p key={i} style={{ fontSize: 12, color: 'var(--amazon-text-secondary)', padding: '2px 0' }}>
                🎙️ {cmd}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Cart Section */}
      <div ref={cartRef}>
        {items.length === 0 ? (
          <div className="amazon-card" style={{ textAlign: 'center', padding: 32 }}>
            <span style={{ fontSize: 48 }}>🛒</span>
            <p style={{ fontSize: 14, color: 'var(--amazon-text-secondary)', marginTop: 8 }}>
              Your cart is empty. Tap the mic to start!
            </p>
          </div>
        ) : (
          <>
            {/* Shared Items */}
            {sharedItems.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <h3 className="section-title" style={{ fontSize: 16 }}>🤝 Shared Items</h3>
                {sharedItems.map(item => (
                  <div key={item.id} style={{ marginBottom: 8 }}>
                    <CartItemRow
                      item={item}
                      onRemove={removeItem}
                      onToggleShared={toggleShared}
                      onUpdateQty={updateQuantity}
                      allergyWarning={checkAllergies(item.product, members, products) !== null}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Per-Member Items */}
            {members.map(m => {
              const memberItems = memberItemMap[m.id] || [];
              if (memberItems.length === 0) return null;
              const isHighlighted = highlightMember === m.id;
              return (
                <div key={m.id} style={{ marginBottom: 16, opacity: highlightMember && !isHighlighted ? 0.4 : 1 }}>
                  <h3 className="section-title" style={{ fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>{m.avatar}</span>
                    <span>{m.name}&apos;s Items</span>
                    <span style={{ fontSize: 12, color: 'var(--amazon-text-secondary)', fontWeight: 400 }}>
                      ₹{memberItems.reduce((s, i) => s + i.product.price * i.quantity, 0)}
                    </span>
                  </h3>
                  {memberItems.map(item => (
                    <div key={item.id} style={{ marginBottom: 8 }}>
                      <CartItemRow
                        item={item}
                        onRemove={removeItem}
                        onToggleShared={toggleShared}
                        onUpdateQty={updateQuantity}
                        memberName={m.name}
                        allergyWarning={checkAllergies(item.product, members, products) !== null}
                      />
                    </div>
                  ))}
                </div>
              );
            })}

            {/* Total */}
            <div className="amazon-card animate-fadeIn" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #f0c14b', background: '#fffbf0' }}>
              <div>
                <p style={{ fontSize: 13, color: 'var(--amazon-text-secondary)' }}>Grand Total</p>
                <p style={{ fontSize: 11, color: 'var(--amazon-text-muted)' }}>{totalItems} items</p>
              </div>
              <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--amazon-price)' }}>₹{totalPrice}</span>
            </div>

            {/* Checkout Button */}
            <button className="btn btn-primary btn-lg w-full mt-16"
              onClick={() => router.push('/split-payment')}>
              🛒 Proceed to Checkout
            </button>

            {/* Clear Cart */}
            <button className="btn btn-ghost btn-sm w-full mt-8" style={{ color: 'var(--amazon-error)' }}
              onClick={() => { clearCart(); showToast('Cart cleared', 'info'); }}>
              Clear Cart
            </button>
          </>
        )}
      </div>

      {/* Recipe Modal */}
      {selectedRecipe && mode === 'recipe' && (
        <RecipeModal recipe={selectedRecipe} onClose={() => { setMode('normal'); setSelectedRecipe(null); }} />
      )}

      {/* Allergy Warning Modal */}
      {allergyWarning && (
        <AllergyWarningModal warning={allergyWarning} onClose={() => setAllergyWarning(null)} />
      )}
    </div>
  );
}

export default function VoiceCartPage() {
  return (
    <Suspense fallback={
      <div className="page-content" style={{ padding: 40, textAlign: 'center' }}>
        <div className="skeleton skeleton-title" style={{ margin: '0 auto' }} />
        <div className="skeleton skeleton-card" />
        <div className="skeleton skeleton-card" />
      </div>
    }>
      <VoiceCartPageInner />
    </Suspense>
  );
}
