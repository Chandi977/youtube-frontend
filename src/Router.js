import React, { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch,
} from "react-router-dom";
import { toast } from "react-toastify";
// import { updateUserLocalSt } from "./utils"; // your client helper

// components
import ScrollToTop from "./components/ScrollToTop";
import Navbar from "./components/Navbar";
import BottomBar from "./components/BottomBar";
import Sidebar from "./components/Sidebar";
import Auth from "./components/Auth";

// styles
import { Container } from "./styles/Container";

// pages
import Home from "./pages/Home";
import Trending from "./pages/Trending";
import Subscriptions from "./pages/Subscriptions";
import Channel from "./pages/Channel";
import WatchVideo from "./pages/WatchVideo";
import SearchResults from "./pages/SearchResults";
import Library from "./pages/Library";
import History from "./pages/History";
import YourVideos from "./pages/YourVideos";
import LikedVideos from "./pages/LikedVideos";

const AppRouter = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.data);
  const [loading, setLoading] = useState(true);

  const refreshAccessToken = useCallback(async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!storedUser?.refreshToken) return null;

      const res = await fetch(
        `${process.env.REACT_APP_BE}/users/refresh-token`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: storedUser.refreshToken }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Token refresh failed");

      const updatedUser = { ...storedUser, accessToken: data.accessToken };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      dispatch({ type: "UPDATE_USER", payload: updatedUser });
      return data.accessToken;
    } catch (err) {
      console.error("Refresh token error:", err);
      toast.error("Session expired. Please login again.");
      localStorage.removeItem("user");
      dispatch({ type: "LOGOUT" });
      return null;
    }
  }, [dispatch]);

  useEffect(() => {
    const checkToken = async () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!storedUser?.accessToken) {
        await refreshAccessToken();
      }
      setLoading(false);
    };

    checkToken();
  }, [refreshAccessToken]);

  if (loading) return <div>Loading...</div>;

  const PrivateRoute = ({ children, ...rest }) => {
    const token = user?.accessToken;
    return (
      <Route
        {...rest}
        render={({ location }) =>
          token ? (
            children
          ) : (
            <Redirect
              to={{
                pathname: "/login",
                state: { from: location },
              }}
            />
          )
        }
      />
    );
  };

  return (
    <Router>
      <ScrollToTop />
      {user?.accessToken && <Navbar />}
      {user?.accessToken && <Sidebar />}
      {user?.accessToken && <BottomBar />}
      <Container>
        <Switch>
          {/* Public routes */}
          <Route path="/login" exact>
            {!user?.accessToken ? <Auth /> : <Redirect to="/" />}
          </Route>

          {/* Protected routes */}
          <PrivateRoute path="/watch/:videoId">
            <WatchVideo />
          </PrivateRoute>
          <PrivateRoute path="/channel/:userId">
            <Channel />
          </PrivateRoute>
          <PrivateRoute path="/results/:searchterm">
            <SearchResults />
          </PrivateRoute>
          <PrivateRoute path="/feed/trending">
            <Trending />
          </PrivateRoute>
          <PrivateRoute path="/feed/subscriptions">
            <Subscriptions />
          </PrivateRoute>
          <PrivateRoute path="/feed/library">
            <Library />
          </PrivateRoute>
          <PrivateRoute path="/feed/history">
            <History />
          </PrivateRoute>
          <PrivateRoute path="/feed/my_videos">
            <YourVideos />
          </PrivateRoute>
          <PrivateRoute path="/feed/liked_videos">
            <LikedVideos />
          </PrivateRoute>

          {/* Home route */}
          <PrivateRoute path="/" exact>
            <Home />
          </PrivateRoute>

          {/* Fallback */}
          <Redirect to="/" />
        </Switch>
      </Container>
    </Router>
  );
};

export default AppRouter;
