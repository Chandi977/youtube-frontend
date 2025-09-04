import React from "react";
import { ThemeProvider } from "styled-components";
import { ToastContainer } from "react-toastify";
import GlobalStyle from "./styles/GlobalStyle";
import { darkTheme } from "./styles/theme";
import AppRouter from "./Router"; // ✅ Import router
import "react-toastify/dist/ReactToastify.css";

const App = () => (
  <ThemeProvider theme={darkTheme}>
    <GlobalStyle />
    <ToastContainer autoClose={2500} position="top-right" closeButton={false} />
    <AppRouter />
  </ThemeProvider>
);

export default App;
