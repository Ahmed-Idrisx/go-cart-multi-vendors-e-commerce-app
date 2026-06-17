import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Address } from "@/types/types";
import { addressDummyData } from "@/assets/assets";

interface AddressState {
  list: Address[];
}

const initialState: AddressState = {
  list: [addressDummyData],
};

const addressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {
    addAddress: (state, action: PayloadAction<Address>) => {
      state.list.push(action.payload);
    },
  },
});

export const { addAddress } = addressSlice.actions;

export default addressSlice.reducer;
