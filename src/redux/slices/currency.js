import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  code: 'USD',
};

const slice = createSlice({
  name: 'currency',
  initialState,
  reducers: {
    setCurrency(state, action) {
      state.code = action.payload;
    },
  },
});

export default slice.reducer;
export const { setCurrency } = slice.actions;