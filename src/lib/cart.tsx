import { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { Produit } from './supabase';

interface CartItem {
  produit: Produit;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (produit: Produit) => void;
  removeItem: (produitId: string) => void;
  updateQuantity: (produitId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CART_STORAGE_KEY = 'gco-store-cart';

const loadCartFromStorage = (): CartItem[] => {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // ignore parse errors
  }
  return [];
};

const saveCartToStorage = (items: CartItem[]) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore storage errors
  }
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => loadCartFromStorage());

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    saveCartToStorage(items);
  }, [items]);

  const addItem = (produit: Produit) => {
    setItems(prev => {
      const existing = prev.find(item => item.produit.id === produit.id);
      if (existing) {
        return prev.map(item =>
          item.produit.id === produit.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { produit, quantity: 1 }];
    });
  };

  const removeItem = (produitId: string) => {
    setItems(prev => prev.filter(item => item.produit.id !== produitId));
  };

  const updateQuantity = (produitId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(produitId);
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.produit.id === produitId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const totalPrice = useMemo(() => items.reduce((sum, item) => sum + item.produit.prix * item.quantity, 0), [items]);

  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};