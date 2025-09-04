import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { client } from "../utils";

const initialState = {
  videos: [],
  loading: false,
  error: null,
};

export const getLikedVideos = createAsyncThunk(
  "likedVideos/getLikedVideos",
  async (_, { rejectWithValue }) => {
    try {
      const response = await client.get("/users/liked-videos");
      return response.data.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Could not fetch liked videos"
      );
    }
  }
);

const likedVideoSlice = createSlice({
  name: "likedVideos",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getLikedVideos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLikedVideos.fulfilled, (state, action) => {
        state.loading = false;
        state.videos = action.payload;
      })
      .addCase(getLikedVideos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default likedVideoSlice.reducer;
