import Sidebar from "./Sidebar";
import { motion } from "framer-motion";

const MainLayout = ({ children, isSidebarVisible, onToggleSidebar }) => {
  return (
    <div className="flex flex-1 overflow-hidden relative">
      <Sidebar isOpen={isSidebarVisible} />
      {isSidebarVisible && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onToggleSidebar}
        ></div>
      )}
      <motion.main
        className="flex-1 overflow-y-auto z-10 w-full"
        animate={{
          marginLeft: isSidebarVisible ? "15rem" : "0rem",
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {children}
      </motion.main>
    </div>
  );
};

export default MainLayout;
