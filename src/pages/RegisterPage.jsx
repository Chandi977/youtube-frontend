import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../lib/api";
import toast from "react-hot-toast";
import { useOAuth } from "../hooks/useOAuth";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    avatar: null,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { handleOAuthLogin } = useOAuth();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const data = new FormData();
    data.append("fullName", formData.fullName);
    data.append("username", formData.username);
    data.append("email", formData.email);
    data.append("password", formData.password);
    if (formData.avatar) data.append("avatar", formData.avatar);

    try {
      await registerUser(data);
      toast.success("Registration successful! Please log in.");
      navigate("/login");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Registration failed.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-3.5rem)] bg-[#0f0f0f] px-4 sm:px-0">
      <div className="w-full max-w-md space-y-6 sm:p-8 sm:bg-[#121212] sm:rounded-lg sm:shadow-md">
        <h1 className="text-2xl font-bold text-center text-white">
          Create an Account
        </h1>
        {error && <p className="text-red-500 text-center text-sm">{error}</p>}

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Full Name */}
          <div>
            <label
              htmlFor="fullName"
              className="text-sm font-medium text-gray-300"
            >
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              className="w-full px-3 py-2 mt-1 text-white bg-[#0f0f0f] border border-gray-700 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
              placeholder="John Doe"
              onChange={handleChange}
              required
            />
          </div>

          {/* Username */}
          <div>
            <label
              htmlFor="username"
              className="text-sm font-medium text-gray-300"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              className="w-full px-3 py-2 mt-1 text-white bg-[#0f0f0f] border border-gray-700 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
              placeholder="yourusername"
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
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
              name="email"
              className="w-full px-3 py-2 mt-1 text-white bg-[#0f0f0f] border border-gray-700 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
              placeholder="you@example.com"
              onChange={handleChange}
              required
            />
          </div>

          {/* Password */}
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
              name="password"
              className="w-full px-3 py-2 mt-1 text-white bg-[#0f0f0f] border border-gray-700 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
              placeholder="••••••••"
              onChange={handleChange}
              required
            />
          </div>

          {/* Avatar */}
          <div>
            <label
              htmlFor="avatar"
              className="block text-sm font-medium text-gray-300"
            >
              Avatar
            </label>
            <input
              type="file"
              id="avatar"
              name="avatar"
              accept="image/*"
              className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-500"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        {/* OAuth Buttons */}
        <div className="flex flex-col gap-3 mt-4">
          <button
            onClick={() => handleOAuthLogin("google")}
            className="w-full px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            <span className="hidden xs:inline">Continue with </span>Google
          </button>
          <button
            onClick={() => handleOAuthLogin("github")}
            className="w-full px-4 py-2 text-white bg-gray-800 rounded-md hover:bg-gray-900"
          >
            <span className="hidden xs:inline">Continue with </span>GitHub
          </button>
        </div>

        <p className="text-sm text-center text-gray-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-blue-500 hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
