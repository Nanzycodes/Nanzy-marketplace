"use client";

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useCallback,
  type ReactNode,
} from "react";
import { Product, CartItem } from "@/types/product";

// ---------- Types ----------
type CartState = {
  items: CartItem[];
  isHydrated: boolean;
};

type CartAction =
  | { type: "HYDRATE"; payload: CartItem[] }
  | { type: "ADD_ITEM"; payload: { product: Product; quantity?: number; size?: string; color?: string } }
  | { type: "REMOVE_ITEM"; payload: { productId: string; size?: string; color?: string } }
  | { type: "UPDATE_QUANTITY"; payload: { productId: string; quantity: number; size?: string; color?: string } }
  | { type: "CLEAR_CART" };

// ---------- Helpers ----------
function getItemKey(item: { productId: string; size?: string; color?: string }) {
  return `${item.productId}-${item.size || ""}-${item.color || ""}`;
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "HYDRATE":
      return { items: action.payload, isHydrated: true };

    case "ADD_ITEM": {
      const { product, quantity = 1, size, color } = action.payload;
      const key = getItemKey({ productId: product.id, size, color });

      const existingIndex = state.items.findIndex(
        (item) => getItemKey({ productId: item.product.id, size: item.size, color: item.color }) === key
      );

      let newItems: CartItem[];
      if (existingIndex > -1) {
        newItems = state.items.map((item, i) =>
          i === existingIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newItems = [...state.items, { product, quantity, size, color }];
      }
      return { ...state, items: newItems };
    }

    case "REMOVE_ITEM": {
      const key = getItemKey(action.payload);
      return {
        ...state,
        items: state.items.filter(
          (item) => getItemKey({ productId: item.product.id, size: item.size, color: item.color }) !== key
        ),
      };
    }

    case "UPDATE_QUANTITY": {
      const { quantity } = action.payload;
      const key = getItemKey(action.payload);

      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(
            (item) => getItemKey({ productId: item.product.id, size: item.size, color: item.color }) !== key
          ),
        };
      }

      return {
        ...state,
        items: state.items.map((item) =>
          getItemKey({ productId: item.product.id, size: item.size, color: item.color }) === key
            ? { ...item, quantity }
            : item
        ),
      };
    }

    case "CLEAR_CART":
      return { ...state, items: [] };

    default:
      return state;
  }
}

// ---------- Context ----------
type CartContextValue = {
  items: CartItem[];
  isHydrated: boolean;
  itemCount: number;
  subtotal: number;
  addItem: (product: Product, quantity?: number, size?: string, color?: string) => void;
  removeItem: (productId: string, size?: string, color?: string) => void;
  updateQuantity: (productId: string, quantity: number, size?: string, color?: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "nanzy-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isHydrated: false,
  });

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        dispatch({ type: "HYDRATE", payload: parsed });
      } else {
        dispatch({ type: "HYDRATE", payload: [] });
      }
    } catch {
      dispatch({ type: "HYDRATE", payload: [] });
    }
  }, []);

  // Persist to localStorage whenever items change (after hydration)
  useEffect(() => {
    if (state.isHydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    }
  }, [state.items, state.isHydrated]);

  const addItem = useCallback(
    (product: Product, quantity = 1, size?: string, color?: string) => {
      dispatch({ type: "ADD_ITEM", payload: { product, quantity, size, color } });
    },
    []
  );

  const removeItem = useCallback((productId: string, size?: string, color?: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: { productId, size, color } });
  }, []);

  const updateQuantity = useCallback(
    (productId: string, quantity: number, size?: string, color?: string) => {
      dispatch({ type: "UPDATE_QUANTITY", payload: { productId, quantity, size, color } });
    },
    []
  );

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR_CART" });
  }, []);

  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = state.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        isHydrated: state.isHydrated,
        itemCount,
        subtotal,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
