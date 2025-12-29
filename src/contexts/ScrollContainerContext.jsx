import { createContext, useContext } from "react";

const ScrollContainerContext = createContext(null);

export const ScrollContainerProvider = ScrollContainerContext.Provider;

export const useScrollContainer = () => useContext(ScrollContainerContext);
