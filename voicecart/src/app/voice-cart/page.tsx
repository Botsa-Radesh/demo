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
import { AIStatusBadge } from '@/components/AIStatusBadge';
import { useVoice } from '@/hooks/useVoice';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { parseVoiceCommand } from '@/utils/voiceParser';
import { matchLLMItemsToProducts, analyzeCart, CartAnalysis } from '@/utils/llmService';
import { optimizeCartForBudget } from '@/utils/budgetOptimizer';
import { findSubstitution } from '@/utils/substitutionEngine';
import { checkAllergies } from '@/utils/allergyChecker';
import { searchProducts, products } from '@/data/products';
import { recipes, getRecipeById } from '@/data/recipes';
import { Recipe, Cart, SplitMode, CartItem } from '@/types';
import { AllergyWarning as AllergyWarningType } from '@/utils/allergyChecker';

type PageMode = 'voice' | 'recipe' | 'budget' | 'normal';

function VoiceCartPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    carts, activeCartId, personalCartId, activeCart, commonCarts,
    setActiveCart, createPersonalCart, joinCommonCart,
    updateCartSplitMode, updateCartName,
    addItem, removeItem, updateQuantity, toggleShared, clearCart,
    totalItems, totalPrice, getItemsByMember, getSharedItems,
  } = useCart();
  const { members, currentUserId, getMemberById } = useMembers();
  const { pendingInvites, joinCommonCartByCode } = useCommonCart();
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
  const [showCartSelector, setShowCartSelector] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingCartName, setEditingCartName] = useState(false);
  const [cartNameInput, setCartNameInput] = useState('');
  const [showCodeCopied, setShowCodeCopied] = useState(false);
  const [cartAnalysis, setCartAnalysis] = useState<CartAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const cartRef = useRef<HTMLDivElement>(null);

  // Ensure personal cart exists
  useEffect(() => {
    if (!activeCartId && !personalCartId) {
      createPersonalCart(currentUserId, getMemberById(currentUserId)?.name || 'User');
    } else if (!activeCartId && personalCartId) {
      setActiveCart(personalCartId);
    }
  }, [activeCartId, personalCartId, createPersonalCart, currentUserId, getMemberById, setActiveCart]);

  useEffect(() => {
    const budget = searchParams.get('budget');
    if (budget) {
      setBudgetMode(true);
      setBudgetAmount(Number(budget));
      setMode('budget');
      handleBudgetCart(Number(budget));
    }
  }, [searchParams]);

  const handleBatchAdd = useCallback(async (productsToAdd: { productId: string; quantity: number }[]) => {
    for (const { productId, quantity } of productsToAdd) {
      const product = products.find(p => p.id === productId);
      if (!product) continue;
      if (product.stockStatus === 'out_of_stock') {
        const sub = findSubstitution(product);
        if (sub) {
          addItem(sub.suggested, 1, currentUserId, true);
          showToast(`${product.name} out of stock! Added ${sub.suggested.name} instead`, 'warning');
          speak(`${sub.suggested.name} added as substitute`);
        }
      } else {
        addItem(product, quantity, currentUserId, false);
        const warning = checkAllergies(product, members, products);
        if (warning) {
          setTimeout(() => setAllergyWarning(warning), 500);
        }
      }
    }
  }, [addItem, currentUserId, members, showToast, speak]);

  const handleVoiceCommand = useCallback(async (text: string) => {
    setMicStatus('processing');
    setIsAiTyping(true);

    await new Promise(r => setTimeout(r, 600));

    const command = await parseVoiceCommand(text);
    setAiResponse(command.response);
    setIsAiTyping(false);
    setRecentCommands(prev => [text, ...prev].slice(0, 5));

    // Require active cart for item-related intents
    const needsCart = ['ADD_ITEM', 'ADD_BATCH', 'RECIPE_ADD', 'RECIPE', 'BUDGET', 'REMOVE_ITEM', 'MARK_SHARED'];
    if (needsCart.includes(command.intent) && !activeCart) {
      showToast('Select a cart first before adding items!', 'warning');
      speak('Please select a cart first by tapping the cart name at the top.');
      setMicStatus('idle');
      return;
    }

    switch (command.intent) {
      case 'ADD_BATCH': {
        if (command.items && command.items.length > 0) {
          const matched = matchLLMItemsToProducts(command.items);
          const toAdd = matched
            .filter(m => m.matchedProduct)
            .map(m => ({ productId: m.matchedProduct!.id, quantity: m.quantity }));

          if (toAdd.length > 0) {
            await handleBatchAdd(toAdd);
            const names = toAdd.map(t => {
              const p = products.find(pr => pr.id === t.productId);
              return `${t.quantity} ${p?.name || ''}`;
            }).join(', ');
            showToast(`Added ${names}`, 'success');
            speak(command.response);
          } else {
            const fallback = products.find(p => p.id === command.params.productId);
            if (fallback) {
              addItem(fallback, parseInt(command.params.quantity) || 1, currentUserId, false);
              showToast(`Added ${fallback.name}`, 'success');
              speak(`Added ${fallback.name} to cart!`);
            } else {
              speak("I didn't recognize those items. Try again!");
            }
          }
        }
        break;
      }
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
      case 'SWITCH_CART': {
        const target = command.params.target;
        if (target === 'common' && commonCarts.length > 0) {
          setActiveCart(commonCarts[0].id);
          speak('Switched to common cart!');
        } else if (personalCartId) {
          setActiveCart(personalCartId);
          speak('Switched to your personal cart!');
        }
        break;
      }
      case 'SHOW_CODE': {
        if (activeCart) {
          setShowCodeCopied(true);
          navigator.clipboard.writeText(activeCart.code);
          showToast(`Cart code: ${activeCart.code}`, 'info');
          speak(`Your cart code is ${activeCart.code}`);
          setTimeout(() => setShowCodeCopied(false), 2000);
        }
        break;
      }
      case 'CREATE_COMMON': {
        router.push(`/common-cart?name=${encodeURIComponent(command.params.name || 'Common Cart')}`);
        break;
      }
      case 'JOIN_CART': {
        if (command.params.code) {
          const joined = joinCommonCartByCode(command.params.code, currentUserId);
          if (joined) {
            showToast('Joined common cart!', 'success');
            speak('Joined common cart!');
          } else {
            showToast('Cart not found!', 'error');
            speak('Cart not found. Try a different code.');
          }
        }
        break;
      }
      case 'REMOVE_ITEM': {
        const actCart = activeCart;
        if (!actCart) break;
        const toRemove = actCart.items.find(i => i.product.id === command.params.productId);
        if (toRemove) removeItem(toRemove.id);
        showToast(command.response, 'success');
        speak(command.response);
        break;
      }
      case 'RECIPE_ADD': {
        const recipe = getRecipeById(command.params.recipeId);
        if (recipe) {
          const servings = parseInt(command.params.servings) || recipe.servings;
          const scale = servings / recipe.servings;
          const scaledIngredients = recipe.ingredients.map(ing => ({
            productId: ing.mappedProductId,
            quantity: Math.max(1, Math.round(scale)),
          }));
          await handleBatchAdd(scaledIngredients);
          showToast(`Added all ingredients for ${recipe.name} (${servings} servings)!`, 'success');
          speak(`Added all ${recipe.ingredients.length} ingredients for ${recipe.name} to your cart!`);
        }
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
        if (!activeCart) break;
        const summary = activeCart.items.map(i => `${i.quantity} ${i.product.name}`).join(', ');
        speak(`Your cart has ${totalItems} items: ${summary || 'nothing yet'}`);
        break;
      }
      case 'MARK_SHARED': {
        if (!activeCart) break;
        const item = activeCart.items.find(i => i.product.id === command.params.productId);
        if (item) toggleShared(item.id);
        speak(command.response);
        break;
      }
      case 'HIGHLIGHT': {
        setHighlightMember(command.params.memberId);
        const member = getMemberById(command.params.memberId);
        speak(`Here's what ${member?.name || 'they'} added`);
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
        if (activeCart) {
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
    }

    setMicStatus('idle');
  }, [activeCart, addItem, removeItem, toggleShared, showToast, speak, members, currentUserId, totalItems, router, getMemberById, setActiveCart, personalCartId, commonCarts, joinCommonCartByCode, handleBatchAdd]);

  const handleMicToggle = useCallback(() => {
    if (!activeCart) {
      showToast('Select a cart first!', 'warning');
      speak('Please select a cart at the top before using voice.');
      return;
    }
    if (isListening) {
      stopListening();
      if (transcript) handleVoiceCommand(transcript);
      setMicStatus('idle');
    } else {
      startListening();
      setMicStatus('listening');
      setAiResponse('');
    }
  }, [isListening, stopListening, startListening, transcript, handleVoiceCommand, activeCart, showToast, speak]);

  const handleBudgetCart = (amount: number) => {
    if (!activeCart) return;
    const result = optimizeCartForBudget(amount, activeCart.items, currentUserId);
    for (const item of result.items) {
      addItem(item.product, item.quantity, currentUserId, true);
    }
    showToast(`Budget cart under ₹${amount} built!`, 'success');
  };

  const handleAnalyzeCart = useCallback(async () => {
    if (!activeCart || activeCart.items.length === 0) return;
    setIsAnalyzing(true);
    const items = activeCart.items.map(i => ({
      name: i.product.name,
      quantity: i.quantity,
      category: i.product.category,
      price: i.product.price,
    }));
    const result = await analyzeCart(items);
    if (result) {
      setCartAnalysis(result);
      speak(result.summary);
    } else {
      showToast('Analysis failed. Check your API key.', 'error');
    }
    setIsAnalyzing(false);
  }, [activeCart, showToast, speak]);

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCart) {
      showToast('Select a cart first!', 'warning');
      return;
    }
    const val = inputRef.current?.value;
    if (val) {
      handleVoiceCommand(val);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleCopyCode = () => {
    if (!activeCart) return;
    navigator.clipboard.writeText(activeCart.code);
    setShowCodeCopied(true);
    showToast('Code copied!', 'success');
    setTimeout(() => setShowCodeCopied(false), 2000);
  };

  const splitModeOptions: SplitMode[] = ['family', 'auto', 'equal', 'custom'];

  const sharedItems = getSharedItems();
  const cartMembers = activeCart ? members.filter(m => activeCart.memberIds.includes(m.id)) : [];
  const memberItemMap = cartMembers.reduce((acc, m) => {
    acc[m.id] = getItemsByMember(m.id);
    return acc;
  }, {} as Record<string, CartItem[]>);

  return (
    <div className="page-content" style={{ paddingTop: 16, paddingBottom: 80 }}>
      {/* Compact Cart Header */}
      <div className="amazon-card" style={{ marginBottom: 16, background: activeCart ? '#fff' : '#fff8e1', border: activeCart ? '' : '2px solid #f0c14b' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button className="back-btn" onClick={() => router.push('/')} aria-label="Go back to home">←</button>
            <div style={{ position: 'relative', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <h1
                  style={{ fontSize: 16, fontWeight: 700, color: 'var(--amazon-text)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                  onClick={() => setShowCartSelector(!showCartSelector)}
                  aria-expanded={showCartSelector}
                  aria-haspopup="listbox"
                  role="button"
                >
                  {activeCart?.name || 'Select a cart...'}
                  <span style={{ fontSize: 10, color: 'var(--amazon-text-muted)' }}>▼</span>
                </h1>
              </div>
              {showCartSelector && (
                <div role="listbox" aria-label="Cart selection" style={{
                  position: 'absolute', top: '100%', left: 0, zIndex: 100,
                  background: '#fff', border: '1px solid var(--amazon-border)',
                  borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  minWidth: 260, padding: 8, marginTop: 4,
                }}>
                  {personalCartId && carts[personalCartId] && (
                    <div
                      role="option"
                      aria-selected={activeCartId === personalCartId}
                      style={{
                        padding: '10px 12px', borderRadius: 6, cursor: 'pointer',
                        background: activeCartId === personalCartId ? '#fef4e8' : 'transparent',
                        display: 'flex', alignItems: 'center', gap: 8,
                      }}
                      onClick={() => { setActiveCart(personalCartId); setShowCartSelector(false); }}
                    >
                      <span style={{ fontSize: 18 }}>🛒</span>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--amazon-text)' }}>{carts[personalCartId].name}</p>
                        <p style={{ fontSize: 11, color: 'var(--amazon-text-muted)' }}>Personal · {carts[personalCartId].items.length} items</p>
                      </div>
                      {activeCartId === personalCartId && <span style={{ marginLeft: 'auto', fontSize: 11, color: '#b12704' }}>✓</span>}
                    </div>
                  )}
                  {commonCarts.map(cc => (
                    <div
                      key={cc.id}
                      role="option"
                      aria-selected={activeCartId === cc.id}
                      style={{
                        padding: '10px 12px', borderRadius: 6, cursor: 'pointer',
                        background: activeCartId === cc.id ? '#fef4e8' : 'transparent',
                        display: 'flex', alignItems: 'center', gap: 8,
                        borderTop: '1px solid var(--amazon-border-light)',
                      }}
                      onClick={() => { setActiveCart(cc.id); setShowCartSelector(false); }}
                    >
                      <span style={{ fontSize: 18 }}>🏠</span>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--amazon-text)' }}>{cc.name}</p>
                        <p style={{ fontSize: 11, color: 'var(--amazon-text-muted)' }}>Common · {cc.items.length} items</p>
                      </div>
                      {activeCartId === cc.id && <span style={{ marginLeft: 'auto', fontSize: 11, color: '#b12704' }}>✓</span>}
                    </div>
                  ))}
                  <div style={{ borderTop: '1px solid var(--amazon-border-light)', marginTop: 4, paddingTop: 4 }}>
                    <button className="btn btn-ghost btn-sm w-full" style={{ fontSize: 12 }}
                      onClick={() => { setShowCartSelector(false); router.push('/common-cart'); }}>
                      + New Common Cart
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            {activeCart && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setShowSettings(!showSettings)}
                aria-label="Cart settings"
                aria-expanded={showSettings}
                style={{ fontSize: 14, padding: '4px 8px' }}
              >
                ⚙️
              </button>
            )}
            {activeCart ? members.filter(m => activeCart.memberIds.includes(m.id)).map(m => <MemberAvatar key={m.id} member={m} size={28} />) : null}
          </div>
        </div>

        {/* Summary Row */}
        {activeCart && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--amazon-text-secondary)' }}>
                {totalItems} items · {activeCart.splitMode} split
              </span>
              <AIStatusBadge />
            </div>
            <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--amazon-price)' }}>
              ₹{totalPrice}
            </span>
          </div>
        )}

        {!activeCart && (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <p style={{ fontSize: 13, color: 'var(--amazon-text-secondary)' }}>
              👆 Select a cart above to start adding items
            </p>
          </div>
        )}
      </div>

      {/* Collapsible Settings Panel */}
      {showSettings && activeCart && (
        <div className="voice-settings-drawer" aria-label="Cart settings panel">
          {/* Cart Code */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, padding: '8px 12px', background: '#fef4e8', borderRadius: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--amazon-text-secondary)', fontWeight: 500 }}>
              Cart Code:
            </span>
            <code style={{ fontSize: 14, fontWeight: 700, letterSpacing: 2, color: 'var(--amazon-orange)', fontFamily: 'monospace' }}>
              {activeCart.code}
            </code>
            <button className="btn btn-ghost btn-sm" style={{ padding: '2px 8px', fontSize: 11, marginLeft: 'auto' }}
              onClick={handleCopyCode} aria-label="Copy cart code">
              {showCodeCopied ? '✅ Copied!' : '📋 Copy'}
            </button>
          </div>

          {/* Split Mode */}
          <div style={{ marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--amazon-text-secondary)', display: 'block', marginBottom: 6 }}>Split mode:</span>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {splitModeOptions.map(mode => (
                <button
                  key={mode}
                  className={`chip ${activeCart?.splitMode === mode ? 'active' : ''}`}
                  style={{ fontSize: 11, padding: '4px 10px' }}
                  onClick={() => activeCart && updateCartSplitMode(activeCart.id, mode)}
                  aria-pressed={activeCart?.splitMode === mode}
                >
                  {mode === 'family' ? '👨‍👩‍👧' : mode === 'auto' ? '🧾' : mode === 'equal' ? '➗' : '✏️'}
                  {' '}{mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pending Invites */}
      {pendingInvites.length > 0 && (
        <div className="amazon-card" style={{ marginBottom: 16, padding: 12, borderColor: '#f0c14b', background: '#fffbf0' }}>
          <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--amazon-text)' }}>
            📩 Pending Invites
          </p>
          {pendingInvites.map((inv, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: 'var(--amazon-text-secondary)' }}>
                {inv.cartName} · <code style={{ fontSize: 11 }}>{inv.code}</code>
              </span>
              <button className="btn btn-primary btn-sm" style={{ fontSize: 11 }}
                onClick={() => {
                  joinCommonCartByCode(inv.code, currentUserId);
                  showToast('Joined cart!', 'success');
                }}>
                Join
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Budget Bar */}
      {budgetMode && (
        <div style={{ marginBottom: 16 }}>
          <BudgetBar current={totalPrice} budget={budgetAmount} />
        </div>
      )}

      {/* Voice Section - Clean & Focused */}
      <div className="amazon-card" style={{ textAlign: 'center', padding: '24px 20px', marginBottom: 16 }}>
        <MicrophoneButton status={micStatus} onClick={handleMicToggle} />
        <VoiceTranscript
          transcript={transcript}
          interimTranscript={interimTranscript}
          aiResponse={aiResponse}
          isTyping={isAiTyping}
        />

        {/* Text Input */}
        <form onSubmit={handleTextSubmit} style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <input
            ref={inputRef}
            placeholder='Try: "add 2kg rice, milk, and 3 apples"'
            aria-label="Type a voice command"
            style={{ flex: 1, fontSize: 13, padding: '10px 14px' }}
          />
          <button type="submit" className="btn btn-primary btn-sm" aria-label="Send command">Send</button>
        </form>

        {/* Quick Actions - compact row */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginTop: 12 }}>
          <button className={`chip ${mode === 'recipe' ? 'active' : ''}`}
            onClick={() => {
              if (selectedRecipe) { setMode('recipe'); return; }
              setSelectedRecipe(recipes[0]);
              setMode('recipe');
            }}>🍳 Recipe</button>
          <button className={`chip ${budgetMode ? 'active' : ''}`}
            onClick={() => {
              setBudgetMode(!budgetMode);
              setMode(budgetMode ? 'normal' : 'budget');
              if (!budgetMode) handleBudgetCart(budgetAmount);
            }}>💰 Budget</button>
          <button className={`chip ${cartAnalysis ? 'active' : ''}`}
            onClick={handleAnalyzeCart} disabled={!activeCart || activeCart.items.length === 0 || isAnalyzing}>
            {isAnalyzing ? '⏳' : '🤖'} Analyze
          </button>
          <button className="chip" onClick={() => router.push('/dashboard')}>📋 Templates</button>
        </div>

        {/* AI Cart Analysis */}
        {cartAnalysis && (
          <div className="animate-fadeIn" style={{ marginTop: 12, padding: 14, background: '#f0f8ff', borderRadius: 8, border: '1px solid #b7d4f0', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#1a73e8' }}>🤖 AI Analysis</p>
              <button className="btn btn-ghost btn-sm" style={{ fontSize: 10, padding: '2px 8px' }}
                onClick={() => setCartAnalysis(null)} aria-label="Dismiss analysis">✕</button>
            </div>
            <p style={{ fontSize: 12, color: 'var(--amazon-text)', marginBottom: 6 }}>{cartAnalysis.summary}</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', fontSize: 11, marginBottom: 4 }}>
              <span style={{ background: cartAnalysis.balanced ? '#e6f7e6' : '#fff3cd', padding: '2px 6px', borderRadius: 4 }}>
                {cartAnalysis.balanced ? '✅ Balanced' : '⚠️ Needs variety'}
              </span>
              {cartAnalysis.duplicates && (
                <span style={{ background: '#fff3cd', padding: '2px 6px', borderRadius: 4 }}>📋 Duplicates</span>
              )}
            </div>
            <p style={{ fontSize: 11, color: 'var(--amazon-text-secondary)' }}>💡 {cartAnalysis.tip}</p>
            {cartAnalysis.missing && (
              <p style={{ fontSize: 11, color: 'var(--amazon-text-muted)', marginTop: 2 }}>🔔 Missing: {cartAnalysis.missing}</p>
            )}
          </div>
        )}
      </div>

      {/* Cart Items Section */}
      <div ref={cartRef}>
        {!activeCart || activeCart.items.length === 0 ? (
          <div className="amazon-card empty-state">
            <div className="empty-state-icon">🛒</div>
            <p className="empty-state-title">Your cart is empty</p>
            <p className="empty-state-desc">
              Tap the microphone and say something like &ldquo;add 2kg rice, milk, and 3 apples&rdquo; to get started.
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
            {cartMembers.map(m => {
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
                <p style={{ fontSize: 11, color: 'var(--amazon-orange)' }}>Split: {activeCart?.splitMode || 'auto'}</p>
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
