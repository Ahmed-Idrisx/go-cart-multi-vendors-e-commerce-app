"use client";

import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { fetchAddress } from "@/lib/features/address/addressSlice";
import { fetchCart, uploadCart } from "@/lib/features/cart/cartSlice";
import { fetchProducts } from "@/lib/features/product/productSlice";
import { fetchRatings } from "@/lib/features/rating/ratingSlice";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";

export default function AppInitializer() {
  const dispatch = useAppDispatch();
  const { user } = useUser();
  const { cartItems, isFetched } = useAppSelector((state) => state.cart);

  useEffect(() => {
    dispatch(fetchProducts({}));
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      dispatch(fetchCart());
      dispatch(fetchAddress());
      dispatch(fetchRatings());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (user && isFetched) {
      dispatch(uploadCart());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems, dispatch, user]);

  return null;
}
