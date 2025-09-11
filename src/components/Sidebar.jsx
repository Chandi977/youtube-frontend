// components/Sidebar.jsx
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  Home,
  TrendingUp,
  Users,
  Music,
  PlayCircle,
  Radio,
  Gamepad2,
  Trophy,
  Lightbulb,
  History,
  Clock,
  ThumbsUp,
  Download,
  Settings,
  HelpCircle,
  Flag,
} from "lucide-react";
import { useAuthStore, useUIStore } from "../store";

const Sidebar = () => {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { sidebarOpen } = useUIStore();

  const mainMenuItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: TrendingUp, label: "Trending", path: "/trending" },
    {
      icon: Users,
      label: "Subscriptions",
      path: "/subscriptions",
      authRequired: true,
    },
  ];

  const exploreItems = [
    { icon: Music, label: "Music", path: "/explore/music" },
    { icon: PlayCircle, label: "Movies", path: "/explore/movies" },
    { icon: Radio, label: "Live", path: "/explore/live" },
    { icon: Gamepad2, label: "Gaming", path: "/explore/gaming" },
    { icon: Trophy, label: "Sports", path: "/explore/sports" },
    { icon: Lightbulb, label: "Learning", path: "/explore/learning" },
  ];

  const libraryItems = [
    { icon: History, label: "History", path: "/history" },
    { icon: Clock, label: "Watch later", path: "/playlist/watch-later" },
    { icon: ThumbsUp, label: "Liked videos", path: "/playlist/liked" },
    { icon: Download, label: "Downloads", path: "/downloads" },
  ];

  const settingsItems = [
    { icon: Settings, label: "Settings", path: "/settings" },
    { icon: HelpCircle, label: "Help", path: "/help" },
    { icon: Flag, label: "Send feedback", path: "/feedback" },
  ];

  const SidebarItem = ({
    icon: Icon,
    label,
    path,
    authRequired = false,
    isActive = false,
  }) => {
    if (authRequired && !isAuthenticated) return null;

    const handleClick = (e) => {
      if (!isAuthenticated && authRequired) {
        e.preventDefault();
        router.push("/login");
        return;
      }
    };

    return (
      <a href={path}>
        <motion.div
          whileHover={{ scale: 1.02, backgroundColor: "rgba(0, 0, 0, 0.05)" }}
          whileTap={{ scale: 0.98 }}
          onClick={handleClick}
          className={`flex items-center px-3 py-2 rounded-lg cursor-pointer transition-colors ${
            isActive
              ? "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400"
              : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
          } ${!sidebarOpen ? "justify-center" : ""}`}
        >
          <Icon className={`w-5 h-5 ${!sidebarOpen ? "" : "mr-6"}`} />
          {sidebarOpen && <span className="text-sm font-medium">{label}</span>}
        </motion.div>
      </a>
    );
  };

  const SectionTitle = ({ title }) => {
    if (!sidebarOpen) return null;

    return (
      <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {title}
      </h3>
    );
  };

  const Divider = () => (
    <div className="my-2 border-t border-gray-200 dark:border-gray-700" />
  );

  return (
    <div className="h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
      <div className="py-4">
        {/* Main menu */}
        <div className="px-3 space-y-1">
          {mainMenuItems.map((item) => (
            <SidebarItem
              key={item.path}
              icon={item.icon}
              label={item.label}
              path={item.path}
              authRequired={item.authRequired}
              isActive={router.pathname === item.path}
            />
          ))}
        </div>

        <Divider />

        {/* Explore */}
        <div className="px-3">
          <SectionTitle title="Explore" />
          <div className="space-y-1">
            {exploreItems.map((item) => (
              <SidebarItem
                key={item.path}
                icon={item.icon}
                label={item.label}
                path={item.path}
                isActive={router.pathname === item.path}
              />
            ))}
          </div>
        </div>

        {/* Library - only show if authenticated */}
        {isAuthenticated && (
          <>
            <Divider />
            <div className="px-3">
              <SectionTitle title="Library" />
              <div className="space-y-1">
                {libraryItems.map((item) => (
                  <SidebarItem
                    key={item.path}
                    icon={item.icon}
                    label={item.label}
                    path={item.path}
                    isActive={router.pathname === item.path}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Subscriptions - only show if authenticated and has subscriptions */}
        {isAuthenticated && sidebarOpen && (
          <>
            <Divider />
            <div className="px-3">
              <SectionTitle title="Subscriptions" />
              {/* This would be populated with actual subscription data */}
              <div className="space-y-2">
                <div className="flex items-center px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                  No subscriptions yet
                </div>
              </div>
            </div>
          </>
        )}

        <Divider />

        {/* Settings */}
        <div className="px-3">
          <div className="space-y-1">
            {settingsItems.map((item) => (
              <SidebarItem
                key={item.path}
                icon={item.icon}
                label={item.label}
                path={item.path}
                isActive={router.pathname === item.path}
              />
            ))}
          </div>
        </div>

        {/* Footer info */}
        {sidebarOpen && (
          <div className="px-3 mt-4 text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <p>About Press Copyright</p>
            <p>Contact us Creators</p>
            <p>Advertise Developers</p>
            <p className="pt-2">Terms Privacy Policy & Safety</p>
            <p>How YouTube works</p>
            <p>Test new features</p>
            <p className="pt-2">© 2024 YouTube Clone</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
