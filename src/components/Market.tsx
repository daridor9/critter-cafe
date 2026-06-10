import { useState } from 'react'
import { KITCHENS, findFoodById, type KitchenId } from '../food/kitchens'
import { shelfLifeOf, isPerishable } from '../food/shelfLife'
import type { Food } from '../food/types'
import './Market.css'

type Props = {
  wallet: number
  homeKitchen: KitchenId
  ownedOf: (foodId: string) => number
  /** Units of this food already on (unserved) plates — can't return those. */
  reservedOf: (foodId: string) => number
  specials: ReadonlySet<string>
  priceOf: (food: Food) => number
  onBuy: (food: Food) => void
  onSell: (food: Food) => void
  onBack: () => void
}

export function Market({ wallet, homeKitchen, ownedOf, reservedOf, specials, priceOf, onBuy, onSell, onBack }: Props) {
  const [tab, setTab] = useState<KitchenId>(homeKitchen)
  const pantry = KITCHENS[tab].pantry
  const specialEmojis = [...specials].map(id => findFoodById(id)?.emoji).filter(Boolean).join(' ')

  return (
    <section className="market" aria-label="Market">
      <h2 className="market-title">🛒 Market</h2>
      <div className="market-wallet" aria-label={`Wallet: ${wallet} coins`}>
        💰 <strong>{wallet}</strong> coins
        {specialEmojis && <span className="market-specials-note">· 🏷 today's specials: {specialEmojis}</span>}
      </div>
      <p className="market-hint">
        Stock your pantry — meals can only use food you own. Fresh food spoils; dry goods keep forever. Unspent coins carry over.
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
          const owned = ownedOf(food.id)
          const reserved = reservedOf(food.id)
          const price = priceOf(food)
          const onSale = specials.has(food.id)
          const canBuy = wallet >= price
          const canSell = owned > reserved
          return (
            <div key={food.id} className={`market-item ${onSale ? 'market-item-sale' : ''}`}>
              {onSale && <span className="market-sale-badge" aria-label="On special today">🏷 SALE</span>}
              <span className="market-item-emoji" aria-hidden="true">{food.emoji}</span>
              <span className="market-item-name">{food.name}</span>
              <span className="market-item-price">
                {onSale
                  ? <>💰 <s className="market-price-old">{food.cost}</s> <strong className="market-price-sale">{price}</strong></>
                  : <>💰 {price}</>}
              </span>
              <span className="market-item-fresh">
                {isPerishable(food.id) ? `⏳ fresh ${shelfLifeOf(food.id)}d` : '♾ keeps forever'}
              </span>
              <div className="market-item-controls">
                <button
                  type="button"
                  className="market-step-button"
                  onClick={() => onSell(food)}
                  disabled={!canSell}
                  aria-label={`Return one ${food.name}`}
                  title={owned > 0 && !canSell ? 'Already on plates — unassign it first' : 'Refunds what you paid'}
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
                  aria-label={`Buy one ${food.name} for ${price} coins`}
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
