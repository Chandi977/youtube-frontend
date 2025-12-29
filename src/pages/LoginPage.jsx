import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../lib/api";
import { useUser } from "../components/UserContext";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import { useOAuth } from "../hooks/useOAuth";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { handleLoginSuccess } = useUser();
  const navigate = useNavigate();
  const { handleOAuthLogin } = useOAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await loginUser({ email, password });
      const { user, token, refreshToken } = response.data.data;
      handleLoginSuccess(user);
      if (token) {
        Cookies.set("authToken", token, { expires: 7 });
        Cookies.set("accessToken", token, { expires: 7 });
      }
      if (refreshToken) {
        Cookies.set("refreshToken", refreshToken, { expires: 7 });
      }
      toast.success("Logged in successfully!");
      navigate("/"); // Redirect to home on success
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "Login failed. Please check your credentials.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-3.5rem)] bg-[#0f0f0f] px-4 sm:px-0">
      <div className="w-full max-w-md space-y-6 sm:p-8 sm:bg-[#121212] sm:rounded-lg sm:shadow-md">
        <h1 className="text-2xl font-bold text-center text-white">Login</h1>
        {error && <p className="text-red-500 text-center text-sm">{error}</p>}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-300"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-3 py-2 mt-1 text-white bg-[#0f0f0f] border border-gray-700 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-300"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-3 py-2 mt-1 text-white bg-[#0f0f0f] border border-gray-700 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-500"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="flex flex-col gap-3 mt-4">
          <button
            onClick={() => handleOAuthLogin("google")}
            className="w-full px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            Continue with Google
          </button>
          <button
            onClick={() => handleOAuthLogin("github")}
            className="w-full px-4 py-2 text-white bg-gray-800 rounded-md hover:bg-gray-900"
          >
            Continue with GitHub
          </button>
        </div>

        <p className="text-sm text-center text-gray-400">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-blue-500 hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

