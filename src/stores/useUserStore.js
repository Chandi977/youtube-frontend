import { create } from "zustand";
import Cookies from "js-cookie";
import * as api from "../lib/api";

export const useUserStore = create((set) => ({
  user: null,
  isLoggedIn: false,
  loading: true,
  initialize: async () => {
    try {
      const response = await api.getCurrentUser();
      set({
        user: response.data.data,
        isLoggedIn: true,
        loading: false,
      });
    } catch (error) {
      Cookies.remove("authToken");
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
      set({ user: null, isLoggedIn: false, loading: false });
    }
  },
  handleLoginSuccess: (loggedInUser) =>
    set({ user: loggedInUser, isLoggedIn: true }),
  handleLogout: () => {
    Cookies.remove("authToken");
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    set({ user: null, isLoggedIn: false });
  },
}));
