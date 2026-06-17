import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Rating } from "@/types/types";

interface RatingState {
  ratings: Rating[];
}

const initialState: RatingState = {
  ratings: [],
};

const ratingSlice = createSlice({
  name: "rating",
  initialState,
  reducers: {
    addRating: (state, action: PayloadAction<Rating>) => {
      state.ratings.push(action.payload);
    },
  },
});

export const { addRating } = ratingSlice.actions;

export default ratingSlice.reducer;
