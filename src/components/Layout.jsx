// components/Layout.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuthStore, useUIStore } from "../store";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useRouter } from "next/router";

const Layout = ({ children, showSidebar = true }) => {
  const { sidebarOpen } = useUIStore();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  // Pages that don't need sidebar
  const noSidebarPages = ["/login", "/register", "/studio"];
  const shouldShowSidebar =
    showSidebar && !noSidebarPages.includes(router.pathname);

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900">
      {/* Sidebar */}
      {shouldShowSidebar && (
        <motion.aside
          initial={{ x: -280 }}
          animate={{ x: sidebarOpen ? 0 : -240 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className={`fixed left-0 top-16 h-full z-40 ${
            sidebarOpen ? "w-64" : "w-16"
          } transition-all duration-300`}
        >
          <Sidebar />
        </motion.aside>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header />

        {/* Content */}
        <main
          className={`flex-1 transition-all duration-300 ${
            shouldShowSidebar
              ? sidebarOpen
                ? "ml-64 pt-16"
                : "ml-16 pt-16"
              : "pt-16"
          } overflow-y-auto`}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-4 md:p-6"
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {shouldShowSidebar && sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => useUIStore.getState().toggleSidebar()}
        />
      )}
    </div>
  );
};

export default Layout;
