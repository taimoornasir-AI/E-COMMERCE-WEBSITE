import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { cartApi } from '../api/endpoints';
import { useAuthStore } from './authStore';
import toast from 'react-hot-toast';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [], // Local cart items (for guests)
      serverCart: null,
      isOpen: false,
      isLoading: false,
      coupon: null,

      // Open/close the cart drawer
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set(state => ({ isOpen: !state.isOpen })),

      // Get the active items (server cart if logged in, local otherwise)
      getItems: () => {
        const { serverCart, items } = get();
        const isAuth = useAuthStore.getState().isAuthenticated();
        return isAuth && serverCart ? serverCart.items || [] : items;
      },

      getSubtotal: () => {
        const items = get().getItems();
        return items.reduce((sum, item) => {
          const price = item.variant?.price ?? item.product?.price ?? 0;
          return sum + price * item.quantity;
        }, 0);
      },

      getItemCount: () => {
        return get().getItems().reduce((sum, item) => sum + item.quantity, 0);
      },

      // Fetch cart from server (for authenticated users)
      fetchCart: async () => {
        if (!useAuthStore.getState().isAuthenticated()) return;
        set({ isLoading: true });
        try {
          const res = await cartApi.get();
          set({ serverCart: res.data.data, isLoading: false });
        } catch {
          set({ isLoading: false });
        }
      },

      // Add item
      addItem: async (variant, product, quantity = 1) => {
        const isAuth = useAuthStore.getState().isAuthenticated();

        if (isAuth) {
          try {
            await cartApi.add({ variantId: variant.id, quantity });
            await get().fetchCart();
            toast.success('Added to cart');
            set({ isOpen: true });
          } catch (err) {
            toast.error(err.response?.data?.error || 'Could not add to cart');
          }
        } else {
          // Local cart for guests
          set(state => {
            const existing = state.items.find(i => i.variant?.id === variant.id);
            const updatedItems = existing
              ? state.items.map(i =>
                  i.variant?.id === variant.id
                    ? { ...i, quantity: i.quantity + quantity }
                    : i
                )
              : [...state.items, { id: `local-${variant.id}`, variant, product, quantity }];
            return { items: updatedItems, isOpen: true };
          });
          toast.success('Added to cart');
        }
      },

      // Update quantity
      updateItem: async (itemId, quantity) => {
        const isAuth = useAuthStore.getState().isAuthenticated();

        if (isAuth) {
          try {
            await cartApi.update(itemId, quantity);
            await get().fetchCart();
          } catch (err) {
            toast.error(err.response?.data?.error || 'Could not update cart');
          }
        } else {
          set(state => ({
            items: state.items.map(i => i.id === itemId ? { ...i, quantity } : i),
          }));
        }
      },

      // Remove item
      removeItem: async (itemId) => {
        const isAuth = useAuthStore.getState().isAuthenticated();

        if (isAuth) {
          try {
            await cartApi.remove(itemId);
            await get().fetchCart();
            toast.success('Removed from cart');
          } catch (err) {
            toast.error('Could not remove item');
          }
        } else {
          set(state => ({ items: state.items.filter(i => i.id !== itemId) }));
          toast.success('Removed from cart');
        }
      },

      // Clear cart
      clearCart: async () => {
        const isAuth = useAuthStore.getState().isAuthenticated();
        if (isAuth) {
          try { await cartApi.clear(); } catch {}
        }
        set({ items: [], serverCart: null, coupon: null });
      },

      // Apply coupon
      setCoupon: (coupon) => set({ coupon }),
      clearCoupon: () => set({ coupon: null }),

      // Merge local cart to server after login
      mergeCartOnLogin: async () => {
        const { items } = get();
        if (!items.length) {
          await get().fetchCart();
          return;
        }
        try {
          for (const item of items) {
            await cartApi.add({ variantId: item.variant.id, quantity: item.quantity });
          }
        } catch {}
        set({ items: [] });
        await get().fetchCart();
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items, coupon: state.coupon }),
    }
  )
);
