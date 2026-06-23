import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Rating } from "@/types/types";

interface RatingState {
  ratings: Rating[];
  loading: boolean;
  error: string | null;
}

export const fetchRatings = createAsyncThunk(
  "rating/fetchUserRatings",
  async (_, thunkAPI) => {
    try {
      const res = await fetch("/api/rating");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch ratings");
      return (data.ratings as Rating[]) ?? [];
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch ratings";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

const initialState: RatingState = {
  ratings: [],
  loading: false,
  error: null,
};

const ratingSlice = createSlice({
  name: "rating",
  initialState,
  reducers: {
    addRating: (state, action: PayloadAction<Rating>) => {
      state.ratings.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRatings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRatings.fulfilled, (state, action) => {
        state.loading = false;
        state.ratings = action.payload;
      })
      .addCase(fetchRatings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { addRating } = ratingSlice.actions;

export default ratingSlice.reducer;
