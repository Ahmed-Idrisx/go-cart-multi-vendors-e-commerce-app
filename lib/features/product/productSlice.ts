import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Product } from "@/types/types";

export const fetchProducts = createAsyncThunk(
  "product/fetchProducts",
  async ({ storeId }: { storeId?: string }, thunkAPI) => {
    try {
      const url = storeId
        ? `/api/products?storeId=${storeId}`
        : "/api/products";
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch products");
      return data.products as Product[];
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch products";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

interface ProductState {
  list: Product[];
  loading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  list: [],
  loading: false,
  error: null,
};

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    setProduct: (state, action: PayloadAction<Product[]>) => {
      state.list = action.payload;
    },
    clearProduct: (state) => {
      state.list = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setProduct, clearProduct } = productSlice.actions;

export default productSlice.reducer;
