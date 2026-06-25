import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

interface WishlistState {
  wishlistItems: Record<string, boolean>;
  total: number;
  loading: boolean;
  error: string | null;
  isFetched: boolean;
}

const initialState: WishlistState = {
  wishlistItems: {},
  total: 0,
  loading: false,
  error: null,
  isFetched: false,
};

const calcTotal = (items: Record<string, boolean>) => Object.keys(items).length;

export const fetchWishlist = createAsyncThunk(
  "wishlist/fetchWishlist",
  async (_, thunkAPI) => {
    try {
      const res = await fetch("/api/wishlist");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch wishlist");
      return data.wishlist as Record<string, boolean>;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch wishlist";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const toggleWishlistItem = createAsyncThunk(
  "wishlist/toggleWishlistItem",
  async ({ productId }: { productId: string }, thunkAPI) => {
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      return { productId, inWishlist: data.inWishlist as boolean };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    removeFromWishlist: (
      state,
      action: PayloadAction<{ productId: string }>,
    ) => {
      const { productId } = action.payload;
      delete state.wishlistItems[productId];
      state.total = calcTotal(state.wishlistItems);
    },
    clearWishlist: (state) => {
      state.wishlistItems = {};
      state.total = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchWishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        const wishlist = action.payload ?? {};
        state.wishlistItems = wishlist;
        state.total = calcTotal(wishlist);
        state.isFetched = true;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // toggleWishlistItem
      .addCase(toggleWishlistItem.fulfilled, (state, action) => {
        const { productId, inWishlist } = action.payload;
        if (inWishlist) {
          state.wishlistItems[productId] = true;
        } else {
          delete state.wishlistItems[productId];
        }
        state.total = calcTotal(state.wishlistItems);
      })
      .addCase(toggleWishlistItem.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { removeFromWishlist, clearWishlist } = wishlistSlice.actions;

export default wishlistSlice.reducer;
