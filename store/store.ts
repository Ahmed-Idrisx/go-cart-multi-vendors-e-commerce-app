import { configureStore } from "@reduxjs/toolkit";

import cartReducer from "../lib/features/cart/cartSlice";
import productReducer from "../lib/features/product/productSlice";
import addressReducer from "../lib/features/address/addressSlice";
import ratingReducer from "../lib/features/rating/ratingSlice";
import wishlistReducer from "../lib/features/wishlist/wishlistSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      cart: cartReducer,
      product: productReducer,
      address: addressReducer,
      rating: ratingReducer,
      wishlist: wishlistReducer,
    },
  });
};

let store: ReturnType<typeof makeStore> | undefined;

export const getStore = () => {
  if (!store) {
    store = makeStore();
  }
  return store;
};

// Types
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
