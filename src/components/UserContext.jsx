/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import Cookies from "js-cookie";
import * as api from "../lib/api";

const UserContext = createContext(null);

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await api.getCurrentUser(); // Assumes this calls /api/v1/users/me
        setUser(response.data.data);
        setIsLoggedIn(true);
      } catch (error) {
        console.error("Session expired or invalid:", error);
        Cookies.remove("authToken");
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        setUser(null);
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const handleLoginSuccess = useCallback((loggedInUser) => {
    setUser(loggedInUser);
    setIsLoggedIn(true);
  }, []);

  const handleLogout = useCallback(() => {
    Cookies.remove("authToken");
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    setUser(null);
    setIsLoggedIn(false);
  }, []);

  const value = { user, isLoggedIn, loading, handleLoginSuccess, handleLogout };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
