import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom"; // ✅ Import BrowserRouter
import App from "./App";
import store from "./store";

render(
  <Provider store={store}>
    <BrowserRouter>
      {" "}
      {/* ✅ Wrap App in BrowserRouter */}
      <App />
    </BrowserRouter>
  </Provider>,
  document.getElementById("root")
);
