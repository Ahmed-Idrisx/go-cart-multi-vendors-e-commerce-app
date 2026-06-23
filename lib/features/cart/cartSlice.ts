import { RootState } from "@/store/store";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

const calcTotal = (cartItems: Record<string, number>) =>
  Object.values(cartItems).reduce((sum, qty) => sum + qty, 0);

interface CartState {
  total: number;
  cartItems: Record<string, number>;
  loading: boolean;
  error: string | null;
  isFetched: boolean;
}
const initialState: CartState = {
  total: 0,
  cartItems: {},
  loading: false,
  error: null,
  isFetched: false,
};

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export const uploadCart = createAsyncThunk(
  "cart/uploadCart",
  async (_, thunkAPI) => {
    return new Promise<void>((resolve, reject) => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(async () => {
        try {
          const { cartItems } = (thunkAPI.getState() as RootState).cart;
          const res = await fetch("/api/cart", {
            method: "POST",
            body: JSON.stringify({ cart: cartItems }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Failed to update cart");
          resolve();
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Failed to update cart";
          reject(thunkAPI.rejectWithValue(message));
        }
      }, 1000);
    });
  },
);

export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, thunkAPI) => {
    try {
      const res = await fetch("/api/cart");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch cart");
      return data.cart as Record<string, number>;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch cart";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

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
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        const cart = action.payload ?? {};
        state.cartItems = cart;
        state.total = calcTotal(cart);
        state.isFetched = true;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { addToCart, removeFromCart, clearCart, deleteItemFromCart } =
  cartSlice.actions;

export default cartSlice.reducer;
