import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../components/UserContext";
import Cookies from "js-cookie";
import * as api from "../lib/api";

const OAuthSuccessPage = () => {
  const navigate = useNavigate();
  const { handleLoginSuccess } = useUser();

  useEffect(() => {
    const bootstrap = async () => {
      const params = new URLSearchParams(window.location.search);
      const accessTokenFromQuery = params.get("accessToken");
      const refreshTokenFromQuery = params.get("refreshToken");
      const userData = params.get("user"); // optional user info

      // Prefer tokens from query (non-httpOnly) else rely on httpOnly cookies
      const accessToken =
        accessTokenFromQuery ||
        Cookies.get("accessToken") ||
        Cookies.get("authToken");
      const refreshToken =
        refreshTokenFromQuery || Cookies.get("refreshToken");

      if (!accessToken) {
        navigate("/login");
        return;
      }

      try {
        let user = userData
          ? JSON.parse(decodeURIComponent(userData))
          : null;

        // If user info not passed via query, fetch with existing cookies
        if (!user) {
          const res = await api.getCurrentUser();
          user = res.data.data;
        }

        // Store tokens for client-side paths if present
        if (accessTokenFromQuery) {
          Cookies.set("authToken", accessTokenFromQuery, { expires: 1 });
          Cookies.set("accessToken", accessTokenFromQuery, { expires: 1 });
        }
        if (refreshTokenFromQuery) {
          Cookies.set("refreshToken", refreshTokenFromQuery, { expires: 7 });
        } else if (refreshToken) {
          Cookies.set("refreshToken", refreshToken, { expires: 7 });
        }

        handleLoginSuccess(user); // Update context with user info

        // Send postMessage to opener (popup)
        if (window.opener) {
          window.opener.postMessage(
            {
              oauthSuccess: true,
              loginResponse: {
                statusCode: 200,
                data: { user, accessToken, refreshToken },
                message: "OAuth login successful",
                success: true,
              },
            },
            window.location.origin
          );
          window.close();
        } else {
          navigate("/"); // fallback if no opener
        }
      } catch (err) {
        console.error("Failed to process OAuth success:", err);
        navigate("/login");
      }
    };

    bootstrap();
  }, [handleLoginSuccess, navigate]);

  return (
    <div className="p-6 text-center">
      Processing authentication... Please wait.
    </div>
  );
};

export default OAuthSuccessPage;
