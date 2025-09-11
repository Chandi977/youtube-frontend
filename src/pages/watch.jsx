// pages/watch.jsx
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { motion, AnimatePresence } from "framer-motion";
import Head from "next/head";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  ThumbsUp,
  ThumbsDown,
  Share,
  Download,
  Flag,
  Users,
  Bell,
  BellOff,
  MoreVertical,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import Layout from "../components/Layout";
import VideoPlayer from "../components/VideoPlayer";
import VideoCard from "../components/VideoCard";
import CommentSection from "../components/CommentSection";
import { videoAPI, likeAPI, subscriptionAPI } from "../lib/api";
import { useAuthStore } from "../store";
import toast from "react-hot-toast";

const Watch = () => {
  const router = useRouter();
  const { v: videoId } = router.query;
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Fetch video data
  const {
    data: videoData,
    isLoading: videoLoading,
    error: videoError,
  } = useQuery(["video", videoId], () => videoAPI.getVideoById(videoId), {
    enabled: !!videoId,
    onSuccess: (data) => {
      // Update view count and watch history
      if (isAuthenticated) {
        // This would typically be handled by a separate API call
      }
    },
  });
  //   console.log(video.data);

  // Fetch related videos
  const { data: relatedVideos, isLoading: relatedLoading } = useQuery(
    ["videos", "related", videoId],
    () => videoAPI.getAllVideos({ limit: 10, sortBy: "views" }),
    {
      enabled: !!videoId,
    }
  );
  //   console.log(
  //     relatedVideos?.data.data,
  //     "related",
  //     videoId,
  //     videoData?.data.data
  //   );

  // Like/Unlike mutation
  const likeMutation = useMutation(() => likeAPI.toggleVideoLike(videoId), {
    onSuccess: () => {
      setIsLiked(!isLiked);
      setIsDisliked(false);
      queryClient.invalidateQueries(["video", videoId]);
      toast.success(
        isLiked ? "Removed from liked videos" : "Added to liked videos"
      );
    },
    onError: () => {
      toast.error("Please sign in to like videos");
    },
  });

  // Subscribe/Unsubscribe mutation
  const subscribeMutation = useMutation(
    () => subscriptionAPI.toggleSubscription(videoData?.data.data.owner._id),
    {
      onSuccess: () => {
        setIsSubscribed(!isSubscribed);
        toast.success(isSubscribed ? "Unsubscribed" : "Subscribed!");
      },
      onError: () => {
        toast.error("Please sign in to subscribe");
      },
    }
  );

  const video = videoData?.data.data;

  const handleLike = () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to like videos");
      return;
    }
    likeMutation.mutate();
  };

  const handleDislike = () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to dislike videos");
      return;
    }
    setIsDisliked(!isDisliked);
    setIsLiked(false);
  };

  const handleSubscribe = () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to subscribe");
      return;
    }
    subscribeMutation.mutate();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: video?.title,
        text: video?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
    setShowShareMenu(false);
  };

  const formatViews = (views) => {
    if (!views) return "0 views";
    if (views < 1000) return `${views} views`;
    if (views < 1000000) return `${(views / 1000).toFixed(1)}K views`;
    return `${(views / 1000000).toFixed(1)}M views`;
  };

  if (videoLoading) {
    return (
      <Layout>
        <div className="animate-pulse">
          <div className="aspect-video bg-gray-300 rounded-lg mb-4"></div>
          <div className="h-6 bg-gray-300 rounded mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      </Layout>
    );
  }

  if (videoError || !video) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Video not found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            This video may have been removed or is not available.
          </p>
          <a href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Go Home
            </motion.button>
          </a>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>{video.title} - YouTube Clone</title>
        <meta name="description" content={video.description} />
        <meta property="og:title" content={video.title} />
        <meta property="og:description" content={video.description} />
        <meta property="og:image" content={video.thumbnail} />
        <meta property="og:type" content="video.other" />
      </Head>

      <Layout>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Video Section */}
          <div className="flex-1">
            {/* Video Player */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <VideoPlayer
                videoUrl={video.videoFile}
                thumbnail={video.thumbnail}
                className="aspect-video w-full"
              />
            </motion.div>

            {/* Video Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {video.title}
              </h1>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-0">
                  <span>{formatViews(video.views)}</span>
                  <span className="mx-2">•</span>
                  <span>
                    {formatDistanceToNow(new Date(video.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Like Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLike}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-colors ${
                      isLiked
                        ? "bg-blue-50 border-blue-300 text-blue-600 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-400"
                        : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    <ThumbsUp className="w-5 h-5" />
                    <span className="text-sm">Like</span>
                  </motion.button>

                  {/* Dislike Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDislike}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-colors ${
                      isDisliked
                        ? "bg-red-50 border-red-300 text-red-600 dark:bg-red-900/20 dark:border-red-700 dark:text-red-400"
                        : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    <ThumbsDown className="w-5 h-5" />
                    <span className="text-sm">Dislike</span>
                  </motion.button>

                  {/* Share Button */}
                  <div className="relative">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowShareMenu(!showShareMenu)}
                      className="flex items-center space-x-2 px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Share className="w-5 h-5" />
                      <span className="text-sm">Share</span>
                    </motion.button>

                    <AnimatePresence>
                      {showShareMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute top-full mt-2 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 min-w-[150px] z-50"
                        >
                          <button
                            onClick={handleShare}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            Copy link
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* More Options */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Channel Info */}
              <div className="flex items-center justify-between py-4 border-y border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-4">
                  <a href={`/channel/${video.owner.username}`}>
                    <div className="w-12 h-12 rounded-full overflow-hidden cursor-pointer">
                      {video.owner.avatar?.url ? (
                        <img
                          src={video.owner.avatar.url}
                          alt={video.owner.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Users className="w-6 h-6 text-gray-500 dark:text-gray-300" />
                      )}
                    </div>
                  </a>

                  <div>
                    <a href={`/channel/${video.owner.username}`}>
                      <h3 className="font-semibold text-gray-900 dark:text-white hover:text-red-600 dark:hover:text-red-400 cursor-pointer transition-colors">
                        {video.owner.fullName}
                      </h3>
                    </a>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Subscribers count would go here
                    </p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSubscribe}
                  disabled={subscribeMutation.isLoading}
                  className={`flex items-center space-x-2 px-6 py-2 rounded-full font-semibold transition-colors ${
                    isSubscribed
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                      : "bg-red-600 text-white hover:bg-red-700"
                  }`}
                >
                  {isSubscribed ? (
                    <>
                      <BellOff className="w-4 h-4" />
                      <span>Subscribed</span>
                    </>
                  ) : (
                    <>
                      <Bell className="w-4 h-4" />
                      <span>Subscribe</span>
                    </>
                  )}
                </motion.button>
              </div>

              {/* Description */}
              <div className="mt-4">
                <motion.div
                  initial={false}
                  animate={{ height: isDescriptionExpanded ? "auto" : "80px" }}
                  className="overflow-hidden"
                >
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {video.description}
                  </p>
                </motion.div>

                {video.description?.length > 200 && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() =>
                      setIsDescriptionExpanded(!isDescriptionExpanded)
                    }
                    className="flex items-center space-x-1 mt-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <span className="text-sm font-medium">
                      {isDescriptionExpanded ? "Show less" : "Show more"}
                    </span>
                    {isDescriptionExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </motion.button>
                )}
              </div>
            </motion.div>

            {/* Comments Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-8"
            >
              {video?._id && <CommentSection videoId={video._id} />}
            </motion.div>
          </div>

          {/* Sidebar - Related Videos */}
          <div className="lg:w-96">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Up next
              </h3>

              <div className="space-y-4">
                {relatedLoading
                  ? [...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse flex space-x-3">
                        <div className="w-40 h-24 bg-gray-300 rounded"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-300 rounded"></div>
                          <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                        </div>
                      </div>
                    ))
                  : relatedVideos?.data.data.docs
                      ?.slice(0, 10)
                      .map((relatedVideo) => (
                        <VideoCard
                          key={relatedVideo._id}
                          video={relatedVideo}
                          layout="list"
                        />
                      ))}
              </div>
            </motion.div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Watch;
