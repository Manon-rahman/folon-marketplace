import { useCartStore } from '~/stores/cart'

export function useCart() {
  const store = useCartStore()
  return {
    items: computed(() => store.items),
    total: computed(() => store.total),
    count: computed(() => store.count),
    addItem: store.addItem,
    removeItem: store.removeItem,
    updateQuantity: store.updateQuantity,
    clearCart: store.clearCart,
  }
}
