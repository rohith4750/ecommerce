import { create } from "zustand";

export interface CartItem {
  id: string; // Product ID or unique ID
  productId: string;
  name: string;
  price: number;
  qty: number;
  image: string;
  maxStock: number;
}

export interface Coupon {
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  minCartValue: number;
  category?: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
}

export interface FiltersState {
  category: string;
  type: string;
  color: string;
  minPrice: number;
  maxPrice: number;
  searchQuery: string;
  sortBy: string;
  page: number;
}

interface ToastMessage {
  message: string;
  type: "success" | "error" | "info" | null;
}

interface StoreState {
  user: User | null;
  cart: CartItem[];
  wishlist: string[]; // List of product IDs
  appliedCoupon: Coupon | null;
  toast: ToastMessage;
  filters: FiltersState;

  // Actions
  setUser: (user: User | null) => void;
  addToCart: (item: Omit<CartItem, "qty">, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  applyCoupon: (coupon: Coupon | null) => void;
  toggleWishlist: (productId: string) => void;
  setWishlist: (productIds: string[]) => void;
  setCart: (items: CartItem[]) => void;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
  hideToast: () => void;
  setFilter: <K extends keyof FiltersState>(key: K, value: FiltersState[K]) => void;
  resetFilters: () => void;
}

const initialFilters: FiltersState = {
  category: "",
  type: "",
  color: "",
  minPrice: 0,
  maxPrice: 20000,
  searchQuery: "",
  sortBy: "newest",
  page: 1,
};

export const useStore = create<StoreState>((set) => ({
  user: null,
  cart: [],
  wishlist: [],
  appliedCoupon: null,
  toast: { message: "", type: null },
  filters: { ...initialFilters },

  setUser: (user) => set({ user }),

  addToCart: (item, qty = 1) =>
    set((state) => {
      const existing = state.cart.find((c) => c.productId === item.productId);
      let newCart = [];
      if (existing) {
        const newQty = Math.min(existing.qty + qty, item.maxStock);
        newCart = state.cart.map((c) =>
          c.productId === item.productId ? { ...c, qty: newQty } : c
        );
      } else {
        newCart = [...state.cart, { ...item, qty: Math.min(qty, item.maxStock) }];
      }
      return { cart: newCart };
    }),

  removeFromCart: (productId) =>
    set((state) => ({
      cart: state.cart.filter((c) => c.productId !== productId),
    })),

  updateCartQty: (productId, qty) =>
    set((state) => ({
      cart: state.cart.map((c) =>
        c.productId === productId ? { ...c, qty: Math.min(qty, c.maxStock) } : c
      ),
    })),

  clearCart: () => set({ cart: [], appliedCoupon: null }),

  applyCoupon: (coupon) => set({ appliedCoupon: coupon }),

  toggleWishlist: (productId) =>
    set((state) => {
      const isWish = state.wishlist.includes(productId);
      const newWish = isWish
        ? state.wishlist.filter((id) => id !== productId)
        : [...state.wishlist, productId];
      return { wishlist: newWish };
    }),

  setWishlist: (productIds) => set({ wishlist: productIds }),
  
  setCart: (items) => set({ cart: items }),

  showToast: (message, type = "success") => {
    set({ toast: { message, type } });
  },

  hideToast: () => set({ toast: { message: "", type: null } }),

  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),

  resetFilters: () => set({ filters: { ...initialFilters } }),
}));
