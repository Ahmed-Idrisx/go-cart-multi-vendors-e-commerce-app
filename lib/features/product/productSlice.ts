import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Product } from "@/types/types";
import { productDummyData } from "@/assets/assets";

interface ProductState {
  list: Product[];
}

const initialState: ProductState = {
  list: productDummyData,
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
});

export const { setProduct, clearProduct } = productSlice.actions;

export default productSlice.reducer;
