import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { wishlistApi } from '../api/endpoints';
import { useAuthStore } from './authStore';
import toast from 'react-hot-toast';

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      fetchWishlist: async () => {
        if (!useAuthStore.getState().isAuthenticated()) return;
        set({ isLoading: true });
        try {
          const res = await wishlistApi.get();
          set({ items: res.data.data, isLoading: false });
        } catch {
          set({ isLoading: false });
        }
      },

      isInWishlist: (productId) => {
        return get().items.some(item =>
          item.productId === productId || item.product?.id === productId
        );
      },

      toggle: async (productId) => {
        if (!useAuthStore.getState().isAuthenticated()) {
          toast.error('Sign in to save items to your wishlist');
          return;
        }

        const inWishlist = get().isInWishlist(productId);

        // Optimistic update
        if (inWishlist) {
          set(state => ({ items: state.items.filter(i => i.productId !== productId && i.product?.id !== productId) }));
        }

        try {
          if (inWishlist) {
            await wishlistApi.remove(productId);
            toast.success('Removed from wishlist');
          } else {
            const res = await wishlistApi.add(productId);
            set(state => ({ items: [...state.items, res.data.data] }));
            toast.success('Saved to wishlist');
          }
        } catch (err) {
          // Revert on error
          await get().fetchWishlist();
          toast.error(err.response?.data?.error || 'Could not update wishlist');
        }
      },

      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'wishlist-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);
