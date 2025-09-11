// pages/studio/index.jsx
import { useState } from "react";
import { useQuery } from "react-query";
import { motion } from "framer-motion";
import Head from "next/head";
import Link from "next/link";
import {
  Upload,
  Video,
  Eye,
  ThumbsUp,
  MessageCircle,
  TrendingUp,
  Users,
  DollarSign,
  Plus,
  BarChart3,
  Calendar,
} from "lucide-react";
import { dashboardAPI, videoAPI } from "../../lib/api";
import { useAuthStore } from "../../store";
import { formatDistanceToNow } from "date-fns";

const StudioDashboard = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [timeRange, setTimeRange] = useState("7d");

  // Fetch dashboard stats
  const { data: statsData, isLoading: statsLoading } = useQuery(
    ["dashboard-stats", timeRange],
    () => dashboardAPI.getChannelStats(),
    {
      enabled: isAuthenticated,
    }
  );

  // Fetch recent videos
  // Fetch recent videos
  const { data: videosData, isLoading: videosLoading } = useQuery(
    ["dashboard-videos"],
    () => dashboardAPI.getChannelVideos(),
    {
      enabled: isAuthenticated,
    }
  );

  // Ensure videos is always an array
  const videos = Array.isArray(videosData?.data?.data)
    ? videosData.data.data
    : [];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please sign in to access YouTube Studio.
          </p>
          <a href="/login">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Sign In
            </motion.button>
          </a>
        </div>
      </div>
    );
  }

  const stats = statsData?.data.data || {};
  //   const videos = videosData?.data.data || [];

  // Mock data for demonstration
  const mockStats = {
    totalViews: 45672,
    totalSubscribers: 1234,
    totalVideos: 28,
    totalRevenue: 234.56,
    viewsChange: 12.5,
    subscribersChange: 8.2,
    videosChange: 0,
    revenueChange: 15.3,
  };

  const statCards = [
    {
      title: "Total Views",
      value: mockStats.totalViews.toLocaleString(),
      change: mockStats.viewsChange,
      icon: Eye,
      color: "blue",
    },
    {
      title: "Subscribers",
      value: mockStats.totalSubscribers.toLocaleString(),
      change: mockStats.subscribersChange,
      icon: Users,
      color: "green",
    },
    {
      title: "Videos",
      value: mockStats.totalVideos.toString(),
      change: mockStats.videosChange,
      icon: Video,
      color: "purple",
    },
    {
      title: "Revenue",
      value: `$${mockStats.totalRevenue}`,
      change: mockStats.revenueChange,
      icon: DollarSign,
      color: "yellow",
    },
  ];

  return (
    <>
      <Head>
        <title>YouTube Studio - Dashboard</title>
        <meta
          name="description"
          content="Manage your YouTube channel and videos"
        />
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <a href="/" className="text-red-600 hover:text-red-700">
                  ← Back to YouTube
                </a>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  YouTube Studio
                </h1>
              </div>

              <div className="flex items-center space-x-4">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>

                <a href="/studio/upload">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Upload Video</span>
                  </motion.button>
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back, {user?.fullName}!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Here's how your channel is performing.
            </p>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`p-3 rounded-full bg-${stat.color}-100 dark:bg-${stat.color}-900/20`}
                  >
                    <stat.icon
                      className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`}
                    />
                  </div>
                </div>

                {stat.change !== 0 && (
                  <div className="mt-4 flex items-center">
                    <TrendingUp
                      className={`w-4 h-4 mr-1 ${
                        stat.change > 0 ? "text-green-500" : "text-red-500"
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        stat.change > 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {stat.change > 0 ? "+" : ""}
                      {stat.change}% from last period
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Recent Videos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Videos
                </h3>
                <a
                  href="/studio/videos"
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  View all
                </a>
              </div>
            </div>

            <div className="p-6">
              {videosLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="animate-pulse flex items-center space-x-4"
                    >
                      <div className="w-32 h-18 bg-gray-300 rounded"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : videos.length === 0 ? (
                <div className="text-center py-12">
                  <Video className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No videos yet
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Upload your first video to get started.
                  </p>
                  <a href="/studio/upload">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Upload Video
                    </motion.button>
                  </a>
                </div>
              ) : (
                <div className="space-y-4">
                  {videos.slice(0, 5).map((video) => (
                    <div
                      key={video._id}
                      className="flex items-center space-x-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <div className="w-32 h-18 rounded overflow-hidden flex-shrink-0">
                        <img
                          src={video.thumbnail || "/api/placeholder/128/72"}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-white truncate">
                          {video.title}
                        </h4>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center">
                            <Eye className="w-4 h-4 mr-1" />
                            {video.views || 0} views
                          </span>
                          <span className="flex items-center">
                            <ThumbsUp className="w-4 h-4 mr-1" />0 likes
                          </span>
                          <span className="flex items-center">
                            <MessageCircle className="w-4 h-4 mr-1" />0 comments
                          </span>
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDistanceToNow(new Date(video.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            video.isPublished
                              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                          }`}
                        >
                          {video.isPublished ? "Published" : "Draft"}
                        </span>

                        <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                          <BarChart3 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <a href="/studio/upload" className="block">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                    <MessageCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Comments
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Manage comments
                    </p>
                  </div>
                </div>
              </div>
            </a>
          </motion.div>
        </main>
      </div>
    </>
  );
};

export default StudioDashboard;
