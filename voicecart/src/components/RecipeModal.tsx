'use client';
import React, { useState } from 'react';
import { Recipe, Member } from '@/types';
import { scaleRecipe } from '@/data/recipes';
import { checkAllergies } from '@/utils/allergyChecker';
import { products } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { useMembers } from '@/context/MembersContext';
import { useToast } from './NotificationToast';

interface Props {
  recipe: Recipe;
  onClose: () => void;
}

export function RecipeModal({ recipe, onClose }: Props) {
  const [servings, setServings] = useState(recipe.servings);
  const [selectedIngredients, setSelectedIngredients] = useState<Record<string, boolean>>(
    Object.fromEntries(recipe.ingredients.map(i => [i.name, true]))
  );
  const scaled = scaleRecipe(recipe, servings);
  const { addItem } = useCart();
  const { members, currentUserId } = useMembers();
  const { showToast } = useToast();

  const toggleIngredient = (name: string) => {
    setSelectedIngredients(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const totalSelected = scaled.ingredients
    .filter(i => selectedIngredients[i.name])
    .reduce((s, i) => s + i.price, 0);

  const handleAddAll = () => {
    for (const ing of scaled.ingredients) {
      if (!selectedIngredients[ing.name]) continue;
      const product = products.find(p => p.id === ing.mappedProductId);
      if (product) {
        addItem(product, 1, currentUserId, true);
        const warning = checkAllergies(product, members, products);
        if (warning) {
          showToast(`⚠️ ${product.name}: ${warning.allergens.map(a => a.allergen).join(', ')} alert!`, 'warning');
        }
      }
    }
    showToast(`Added ${scaled.name} ingredients to cart!`, 'success');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <span style={{ fontSize: 40 }}>{recipe.emoji}</span>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--amazon-text)' }}>{scaled.name}</h2>
            <p style={{ fontSize: 13, color: 'var(--amazon-text-secondary)' }}>{scaled.prepTime} • {scaled.dietType}</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <span style={{ fontSize: 13, color: 'var(--amazon-text-secondary)' }}>Servings:</span>
          {[1,2,3,4,5,6,8,10].map(n => (
            <button key={n} className={`chip ${n === servings ? 'active' : ''}`}
              onClick={() => setServings(n)} style={{ padding: '4px 12px', fontSize: 12 }}>{n}</button>
          ))}
        </div>

        <div style={{ marginBottom: 16 }}>
          <h3 className="section-title" style={{ fontSize: 16 }}>Ingredients</h3>
          {scaled.ingredients.map(ing => {
            const product = products.find(p => p.id === ing.mappedProductId);
            const warning = product ? checkAllergies(product, members, products) : null;
            return (
              <div key={ing.name} className="amazon-card" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, cursor: 'pointer', opacity: selectedIngredients[ing.name] ? 1 : 0.5 }}
                onClick={() => toggleIngredient(ing.name)}>
                <div style={{ width: 20, textAlign: 'center' }}>
                  {selectedIngredients[ing.name] ? '✅' : '⬜'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--amazon-text)' }}>{ing.name}</span>
                    {warning && <span className="badge badge-error">⚠️ Allergy</span>}
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--amazon-text-muted)' }}>{ing.quantity}</span>
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--amazon-price)' }}>₹{ing.price}</span>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderTop: '1px solid var(--amazon-border-light)' }}>
          <span style={{ fontSize: 14, color: 'var(--amazon-text-secondary)' }}>
            {scaled.ingredients.filter(i => selectedIngredients[i.name]).length} selected
          </span>
          <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--amazon-price)' }}>₹{totalSelected}</span>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleAddAll}>
            🛒 Add All to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
