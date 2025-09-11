// pages/login.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Play, Mail, Lock, AlertCircle } from "lucide-react";
import { useAuthStore } from "../store";
import { authAPI } from "../lib/api";
import toast from "react-hot-toast";
import Cookies from "js-cookie";

const Login = () => {
  const router = useRouter();
  const { setUser, isAuthenticated, setLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();

  // Initialize user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [setUser]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setLoading(true);

      const response = await authAPI.login(data);
      const { user, accessToken, refreshToken } = response.data.data;

      // Store tokens in cookies
      Cookies.set("accessToken", accessToken, { expires: 1 }); // 1 day
      Cookies.set("refreshToken", refreshToken, { expires: 30 }); // 30 days

      // Update store
      setUser(user);

      // Store user in localStorage for persistence
      localStorage.setItem("user", JSON.stringify(user));

      toast.success("Login successful!");

      // Redirect to intended page or home
      const redirectTo = router.query.redirect || "/";
      router.push(redirectTo);
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";

      if (error.response?.status === 401) {
        setError("root", { message: "Invalid email/username or password" });
      } else if (error.response?.status === 404) {
        setError("root", { message: "User not found" });
      } else {
        setError("root", { message });
      }

      toast.error(message);
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const pageVariants = {
    initial: { opacity: 0, x: -50 },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
    exit: { opacity: 0, x: 50 },
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <>
      <Head>
        <title>Sign In - YouTube Clone</title>
        <meta
          name="description"
          content="Sign in to your YouTube Clone account"
        />
      </Head>

      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4"
      >
        <div className="max-w-md w-full">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <a href="/" className="inline-flex items-center space-x-2">
              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                <Play className="w-8 h-8 text-white fill-current" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                YouTube
              </span>
            </a>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">
              Welcome back
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Sign in to continue to YouTube
            </p>
          </motion.div>

          {/* Login Form */}
          <motion.div
            variants={formVariants}
            initial="hidden"
            animate="visible"
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Root Error */}
              {errors.root && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-center space-x-2"
                >
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="text-sm text-red-600 dark:text-red-400">
                    {errors.root.message}
                  </span>
                </motion.div>
              )}

              {/* Email/Username Field */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email or Username
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    {...register("email", {
                      required: "Email or username is required",
                      validate: (value) => {
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        const isEmail = emailRegex.test(value);
                        const isUsername =
                          /^[a-zA-Z0-9_]+$/.test(value) && value.length >= 3;

                        if (!isEmail && !isUsername) {
                          return "Please enter a valid email or username";
                        }
                        return true;
                      },
                    })}
                    type="text"
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-transparent transition-colors ${
                      errors.email
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder="Enter your email or username"
                  />
                </div>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-red-600 dark:text-red-400 mt-1"
                  >
                    {errors.email.message}
                  </motion.p>
                )}
              </motion.div>

              {/* Password Field */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                    type={showPassword ? "text" : "password"}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-transparent transition-colors ${
                      errors.password
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-red-600 dark:text-red-400 mt-1"
                  >
                    {errors.password.message}
                  </motion.p>
                )}
              </motion.div>

              {/* Submit Button */}
              <motion.div variants={itemVariants}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Sign In"
                  )}
                </motion.button>
              </motion.div>
            </form>

            {/* Register Link */}
            <motion.div
              variants={itemVariants}
              className="text-center mt-6 pt-6 border-t border-gray-200 dark:border-gray-600"
            >
              <p className="text-gray-600 dark:text-gray-400">
                Don't have an account?{" "}
                <a
                  href="/register"
                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-semibold transition-colors"
                >
                  Create account
                </a>
              </p>
            </motion.div>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400"
          >
            <p>© 2024 YouTube Clone. All rights reserved.</p>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};

export default Login;
