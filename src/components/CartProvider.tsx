"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { cartLineKey, type CartLineItem } from "@/lib/cart.types";

const STORAGE_KEY = "street-lens-cart";

type AddToCartInput = {
  productId: string;
  name: string;
  price: number;
  image: string;
  size: string | null;
};

type CartContextValue = {
  items: CartLineItem[];
  itemCount: number;
  totalPrice: number;
  addItem: (item: AddToCartInput) => void;
  removeItem: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function readStoredCart(): CartLineItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartLineItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredCart(items: CartLineItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* quota or private mode */
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartLineItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(readStoredCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeStoredCart(items);
  }, [items, hydrated]);

  const addItem = useCallback((input: AddToCartInput) => {
    setItems((current) => {
      const key = cartLineKey(input);
      const existing = current.find((line) => cartLineKey(line) === key);
      if (existing) {
        return current.map((line) =>
          cartLineKey(line) === key
            ? { ...line, quantity: line.quantity + 1 }
            : line
        );
      }
      return [
        ...current,
        {
          productId: input.productId,
          name: input.name,
          price: input.price,
          image: input.image,
          size: input.size,
          quantity: 1,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((current) => current.filter((line) => cartLineKey(line) !== key));
  }, []);

  const setQuantity = useCallback((key: string, quantity: number) => {
    if (quantity < 1) {
      setItems((current) => current.filter((line) => cartLineKey(line) !== key));
      return;
    }
    setItems((current) =>
      current.map((line) =>
        cartLineKey(line) === key ? { ...line, quantity } : line
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const itemCount = useMemo(
    () => items.reduce((sum, line) => sum + line.quantity, 0),
    [items]
  );

  const totalPrice = useMemo(
    () => items.reduce((sum, line) => sum + line.price * line.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      itemCount,
      totalPrice,
      addItem,
      removeItem,
      setQuantity,
      clearCart,
    }),
    [items, itemCount, totalPrice, addItem, removeItem, setQuantity, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
