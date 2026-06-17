import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const calcTotal = (cartItems: Record<string, number>) =>
  Object.values(cartItems).reduce((sum, qty) => sum + qty, 0);

interface CartState {
  total: number;
  cartItems: Record<string, number>;
}
const initialState: CartState = {
  total: 0,
  cartItems: {},
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<{ productId: string }>) => {
      const { productId } = action.payload;
      state.cartItems[productId] = (state.cartItems[productId] ?? 0) + 1;
      state.total = calcTotal(state.cartItems);
    },
    removeFromCart: (state, action: PayloadAction<{ productId: string }>) => {
      const { productId } = action.payload;
      if (!state.cartItems[productId]) return;
      state.cartItems[productId]--;
      if (state.cartItems[productId] === 0) {
        delete state.cartItems[productId];
      }
      state.total = calcTotal(state.cartItems);
    },
    deleteItemFromCart: (
      state,
      action: PayloadAction<{ productId: string }>,
    ) => {
      const { productId } = action.payload;
      delete state.cartItems[productId];
      state.total = calcTotal(state.cartItems);
    },
    clearCart: (state) => {
      state.cartItems = {};
      state.total = 0;
    },
  },
});

export const { addToCart, removeFromCart, clearCart, deleteItemFromCart } =
  cartSlice.actions;

export default cartSlice.reducer;
