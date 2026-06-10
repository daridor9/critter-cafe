import { useState } from 'react'
import { KITCHENS, type KitchenId } from '../food/kitchens'
import type { Food } from '../food/types'
import './Market.css'

type Props = {
  wallet: number
  stock: Record<string, number>
  homeKitchen: KitchenId
  /** Units of this food already on (unserved) plates — can't sell those back. */
  reservedOf: (foodId: string) => number
  onBuy: (food: Food) => void
  onSell: (food: Food) => void
  onBack: () => void
}

export function Market({ wallet, stock, homeKitchen, reservedOf, onBuy, onSell, onBack }: Props) {
  const [tab, setTab] = useState<KitchenId>(homeKitchen)
  const pantry = KITCHENS[tab].pantry

  return (
    <section className="market" aria-label="Market">
      <h2 className="market-title">🛒 Market</h2>
      <div className="market-wallet" aria-label={`Wallet: ${wallet} coins`}>
        💰 <strong>{wallet}</strong> coins
      </div>
      <p className="market-hint">
        Stock your pantry — meals can only use food you own. Unspent coins carry over to tomorrow.
      </p>
      <div className="pantry-tabs" role="tablist" aria-label="Kitchens">
        {Object.values(KITCHENS).map(k => (
          <button
            key={k.id}
            type="button"
            role="tab"
            aria-selected={tab === k.id}
            className={`pantry-tab ${tab === k.id ? 'pantry-tab-active' : ''}`}
            onClick={() => setTab(k.id)}
          >
            <span aria-hidden="true">{k.emoji}</span>
            <span className="pantry-tab-name">{k.name.replace(' Kitchen', '')}</span>
          </button>
        ))}
      </div>
      <div className="market-grid">
        {pantry.map(food => {
          const owned = stock[food.id] ?? 0
          const reserved = reservedOf(food.id)
          const canBuy = wallet >= food.cost
          const canSell = owned > reserved
          return (
            <div key={food.id} className="market-item">
              <span className="market-item-emoji" aria-hidden="true">{food.emoji}</span>
              <span className="market-item-name">{food.name}</span>
              <span className="market-item-price">💰 {food.cost}</span>
              <div className="market-item-controls">
                <button
                  type="button"
                  className="market-step-button"
                  onClick={() => onSell(food)}
                  disabled={!canSell}
                  aria-label={`Return one ${food.name} for ${food.cost} coins`}
                  title={owned > 0 && !canSell ? 'Already on plates — unassign it first' : undefined}
                >
                  −
                </button>
                <span className={`market-item-owned ${owned > 0 ? 'has-stock' : ''}`} aria-label={`${owned} in pantry`}>
                  🧺 {owned}
                </span>
                <button
                  type="button"
                  className="market-step-button"
                  onClick={() => onBuy(food)}
                  disabled={!canBuy}
                  aria-label={`Buy one ${food.name} for ${food.cost} coins`}
                  title={!canBuy ? 'Not enough coins' : undefined}
                >
                  +
                </button>
              </div>
            </div>
          )
        })}
      </div>
      <div className="kitchen-actions">
        <button type="button" className="primary-action" onClick={onBack}>← Back to kitchen</button>
      </div>
    </section>
  )
}
