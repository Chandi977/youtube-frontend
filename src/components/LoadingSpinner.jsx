// components/LoadingSpinner.jsx
import { motion } from "framer-motion";

const LoadingSpinner = ({ size = "md", color = "red" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const colorClasses = {
    red: "border-red-500",
    blue: "border-blue-500",
    green: "border-green-500",
    gray: "border-gray-500",
  };

  return (
    <div className="flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className={`border-2 border-transparent ${colorClasses[color]} border-t-transparent rounded-full ${sizeClasses[size]}`}
      />
    </div>
  );
};

export default LoadingSpinner;
