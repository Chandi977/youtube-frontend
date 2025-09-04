import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { client } from "../utils";

export const getProfile = createAsyncThunk(
  "profile/getProfile",
  async (username, { rejectWithValue, getState }) => {
    try {
      const { user } = getState().user;

      if (!user?._id) {
        throw new Error("Please login first");
      }

      if (!username) {
        throw new Error("Username is required");
      }

      const response = await client.get(`/users/channel/${username}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Could not fetch profile"
      );
    }
  }
);

const profileSlice = createSlice({
  name: "profile",
  initialState: {
    isFetching: true,
    data: {},
  },
  reducers: {
    updateProfile(state, action) {
      state.data = {
        ...state.data,
        ...action.payload,
      };
    },
    clearProfile(state, action) {
      state.isFetching = true;
      state.data = {};
    },
    subscribeFromProfile(state, action) {
      state.data = {
        ...state.data,
        subscribersCount: state.data.subscribersCount + 1,
        isSubscribed: !state.data.isSubscribed,
      };
    },
    unsubscribeFromProfile(state, action) {
      state.data = {
        ...state.data,
        subscribersCount: state.data.subscribersCount - 1,
        isSubscribed: !state.data.isSubscribed,
      };
    },
  },
  extraReducers: {
    [getProfile.fulfilled]: (state, action) => {
      state.isFetching = false;
      state.data = action.payload;
    },
  },
});

export const {
  updateProfile,
  clearProfile,
  subscribeFromProfile,
  unsubscribeFromProfile,
} = profileSlice.actions;

export default profileSlice.reducer;
