import { useState, useEffect, Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AOS from "aos";
import "aos/dist/aos.css";

import Header from "../components/Header";
import MainLayout from "../components/MainLayout";

// Lazy load page components for better performance
const VideoGrid = lazy(() => import("../components/VideoGrid"));
const LoginPage = lazy(() => import("./LoginPage"));
const RegisterPage = lazy(() => import("./RegisterPage"));
const VideoDetailPage = lazy(() => import("./VideoDetailPage"));
const LikedVideosPage = lazy(() => import("./LikedVideosPage"));
const HistoryPage = lazy(() => import("./HistoryPage"));
const SearchResultsPage = lazy(() => import("./SearchResultsPage"));
const ChannelPage = lazy(() => import("./ChannelPage"));
const DashboardPage = lazy(() => import("./DashboardPage"));
const LibraryPage = lazy(() => import("./LibraryPage"));
const PlaylistDetailPage = lazy(() => import("./PlaylistDetailPage"));
const SubscriptionsPage = lazy(() => import("./SubscriptionsPage"));
const TrendingPage = lazy(() => import("./TrendingPage"));
const OAuthSuccessPage = lazy(() => import("./OAuthSuccessPage"));
const UploadPage = lazy(() => import("./UploadPage"));
const LiveStreamPage = lazy(() => import("./LiveStreamPage"));
const GoLivePage = lazy(() => import("./GoLivePage"));
const LiveStreamViewerPage = lazy(() => import("./LiveStreamViewerPage"));
const HealthCheckPage = lazy(() => import("./HealthCheckPage"));

const VideoGridSkeleton = lazy(() => import("./VideoGridSkeleton"));

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    () => window.innerWidth >= 1024
  );

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true, // Animate elements only once
    });
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
      <Toaster position="top-right" reverseOrder={false} />
      <Header onMenuClick={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      <MainLayout
        isSidebarVisible={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
      >
        <Suspense fallback={<VideoGridSkeleton />}>
          <Routes>
            <Route path="/" element={<VideoGrid />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/oauth-success" element={<OAuthSuccessPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/video/:id" element={<VideoDetailPage />} />
            <Route path="/liked-videos" element={<LikedVideosPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/results" element={<SearchResultsPage />} />
            <Route path="/channel/:username" element={<ChannelPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route
              path="/playlist/:playlistId"
              element={<PlaylistDetailPage />}
            />
            <Route path="/go-live" element={<GoLivePage />} />
            <Route path="/live/:streamId" element={<LiveStreamViewerPage />} />
            <Route path="/live" element={<LiveStreamPage />} />
            <Route path="/healthcheck" element={<HealthCheckPage />} />
            <Route path="/subscriptions" element={<SubscriptionsPage />} />
            <Route path="/trending" element={<TrendingPage />} />
          </Routes>
        </Suspense>
      </MainLayout>
    </>
  );
}

export default App;
