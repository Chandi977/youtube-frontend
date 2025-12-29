import { useEffect } from "react";
import { useUserStore } from "../stores/useUserStore";

export const useUser = () => useUserStore();

export const UserProvider = ({ children }) => {
  const initialize = useUserStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return children;
};
