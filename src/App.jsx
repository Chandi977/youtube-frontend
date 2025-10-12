import { useState, useEffect, Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AOS from "aos";
import { AnimatePresence, motion } from "framer-motion";

import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Loading3D from "./components/Loading3D";

// Lazy load page components for better performance
const VideoGrid = lazy(() => import("./components/VideoGrid"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const VideoDetailPage = lazy(() => import("./pages/VideoDetailPage"));
const LikedVideosPage = lazy(() => import("./pages/LikedVideosPage"));
const HistoryPage = lazy(() => import("./pages/HistoryPage"));
const SearchResultsPage = lazy(() => import("./pages/SearchResultsPage"));
const ChannelPage = lazy(() => import("./pages/ChannelPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const LibraryPage = lazy(() => import("./pages/LibraryPage"));
const PlaylistDetailPage = lazy(() => import("./pages/PlaylistDetailPage"));
const SubscriptionsPage = lazy(() => import("./pages/SubscriptionsPage"));
const TrendingPage = lazy(() => import("./pages/TrendingPage"));
const OAuthSuccessPage = lazy(() => import("./pages/OAuthSuccessPage"));
const UploadPage = lazy(() => import("./pages/UploadPage"));
const LiveStreamPage = lazy(() => import("./pages/LiveStreamPage"));
const GoLivePage = lazy(() => import("./pages/GoLivePage"));
const LiveStreamViewerPage = lazy(() => import("./pages/LiveStreamViewerPage"));
const HealthCheckPage = lazy(() => import("./pages/HealthCheckPage"));

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    () => window.innerWidth >= 1024
  );
  // Show loading screen only on the first visit per session
  const [loading, setLoading] = useState(!sessionStorage.getItem("hasVisited"));
  const location = useLocation();

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true, // Animate elements only once
    });

    // Mark that the user has visited, so the loading screen doesn't show on reload
    if (!sessionStorage.getItem("hasVisited")) {
      sessionStorage.setItem("hasVisited", "true");
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <>
      {/* The loading screen will overlay the content and fade out */}
      <Loading3D isLoading={loading} onLoaded={() => setLoading(false)} />
      <Toaster position="top-right" reverseOrder={false} />
      <div className="flex flex-col h-screen bg-[#0f0f0f] text-white">
        <Header onMenuClick={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <div className="flex flex-1 overflow-hidden relative">
          <Sidebar isOpen={isSidebarOpen} />
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-30 lg:hidden"
              onClick={toggleSidebar}
            ></div>
          )}
          <main className="flex-1 overflow-y-auto z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Suspense fallback={<Loading3D />}>
                  <Routes location={location} key={location.pathname}>
                    <Route path="/" element={<VideoGrid />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route
                      path="/oauth-success"
                      element={<OAuthSuccessPage />}
                    />
                    <Route path="/upload" element={<UploadPage />} />
                    <Route path="/video/:id" element={<VideoDetailPage />} />
                    <Route path="/liked-videos" element={<LikedVideosPage />} />
                    <Route path="/history" element={<HistoryPage />} />
                    <Route path="/results" element={<SearchResultsPage />} />
                    <Route
                      path="/channel/:username"
                      element={<ChannelPage />}
                    />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/library" element={<LibraryPage />} />
                    <Route
                      path="/playlist/:playlistId"
                      element={<PlaylistDetailPage />}
                    />
                    <Route path="/go-live" element={<GoLivePage />} />
                    <Route
                      path="/live/:streamId"
                      element={<LiveStreamViewerPage />}
                    />
                    <Route path="/live" element={<LiveStreamPage />} />
                    <Route path="/healthcheck" element={<HealthCheckPage />} />
                    <Route
                      path="/subscriptions"
                      element={<SubscriptionsPage />}
                    />
                    <Route path="/trending" element={<TrendingPage />} />
                  </Routes>
                </Suspense>
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </>
  );
}

export default App;
