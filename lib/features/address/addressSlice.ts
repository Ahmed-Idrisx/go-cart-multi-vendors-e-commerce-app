import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Address } from "@/types/types";

interface AddressState {
  list: Address[];
  loading: boolean;
  error: string | null;
}

const initialState: AddressState = {
  list: [],
  loading: false,
  error: null,
};

export const fetchAddress = createAsyncThunk(
  "address/fetchAddress",
  async (_, thunkAPI) => {
    try {
      const res = await fetch("/api/address");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch addresses");
      return (data.addresses as Address[]) ?? [];
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch addresses";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

const addressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {
    addAddress: (state, action: PayloadAction<Address>) => {
      state.list.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { addAddress } = addressSlice.actions;

export default addressSlice.reducer;
