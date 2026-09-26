import { createContext, ReactNode, useContext, useMemo } from 'react';
import { useSessionState } from './useSessionState';
import type { Product } from '../types/listing';

export type CartItem = {
  product: Product;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  // Total number of units, for the cart badge.
  count: number;
  subtotal: number;
  isInCart: (productId: string) => boolean;
  addItem: (product: Product) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useSessionState<CartItem[]>([]);

  const value = useMemo<CartContextValue>(() => {
    const removeItem = (productId: string) =>
      setItems(current => current.filter(i => i.product.id !== productId));

    return {
      items,
      count: items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
      isInCart: productId => items.some(i => i.product.id === productId),
      addItem: product =>
        setItems(current => {
          const existing = current.find(i => i.product.id === product.id);
          if (existing) {
            return current.map(i =>
              i === existing ? { ...i, quantity: i.quantity + 1 } : i,
            );
          }
          return [...current, { product, quantity: 1 }];
        }),
      setQuantity: (productId, quantity) => {
        if (quantity < 1) {
          removeItem(productId);
          return;
        }
        setItems(current =>
          current.map(i =>
            i.product.id === productId ? { ...i, quantity } : i,
          ),
        );
      },
      removeItem,
      clear: () => setItems([]),
    };
  }, [items, setItems]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used inside CartProvider');
  }
  return context;
}
