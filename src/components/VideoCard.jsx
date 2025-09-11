// components/VideoCard.jsx
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { MoreVertical, Clock, Eye } from "lucide-react";

const VideoCard = ({ video, layout = "grid" }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const videoRef = useRef(null);

  if (!video) return null;

  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatViews = (views) => {
    if (!views) return "0 views";
    if (views < 1000) return `${views} views`;
    if (views < 1000000) return `${(views / 1000).toFixed(1)}K views`;
    return `${(views / 1000000).toFixed(1)}M views`;
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
    hover: {
      y: -8,
      transition: {
        duration: 0.2,
        ease: "easeOut",
      },
    },
  };

  const thumbnailVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.05 },
  };

  if (layout === "list") {
    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        className="flex space-x-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Thumbnail */}
        <div className="relative w-48 h-28 flex-shrink-0">
          <a href={`/watch?v=${video._id}`}>
            <motion.div
              variants={thumbnailVariants}
              className="relative w-full h-full rounded-lg overflow-hidden cursor-pointer"
            >
              <img
                src={video.thumbnail || "/api/placeholder/320/180"}
                alt={video.title}
                className="w-full h-full object-cover"
              />
              {/* Duration */}
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 rounded">
                {formatDuration(video.duration)}
              </div>
            </motion.div>
          </a>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <a href={`/watch?v=${video._id}`}>
            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 text-sm hover:text-red-600 dark:hover:text-red-400 cursor-pointer">
              {video.title}
            </h3>
          </a>

          <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
            <span>{formatViews(video.views)}</span>
            <span className="mx-1">•</span>
            <span>
              {formatDistanceToNow(new Date(video.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>

          <a href={`/channel/${video.owner?.username}`}>
            <div className="flex items-center mt-2 hover:text-red-600 dark:hover:text-red-400 cursor-pointer">
              <div className="w-6 h-6 rounded-full overflow-hidden mr-2">
                <img
                  src={video.owner?.avatar || "/api/placeholder/32/32"}
                  alt={video.owner?.fullName}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {video.owner?.fullName}
              </span>
            </div>
          </a>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
            {video.description}
          </p>
        </div>

        {/* Menu */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.preventDefault();
              setShowMenu(!showMenu);
            }}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </motion.button>
        </div>
      </motion.div>
    );
  }
  //   console.log(video);
  // Grid layout (default)
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail */}
      <div className="relative w-full aspect-video">
        <a href={`/watch?v=${video._id}`}>
          <motion.div
            variants={thumbnailVariants}
            className="relative w-full h-full cursor-pointer overflow-hidden"
          >
            <img
              src={video.thumbnail.url || "/api/placeholder/320/180"}
              alt={video.title}
              className="w-full h-full object-cover"
            />

            {/* Hover overlay with play preview */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: isHovered ? 1 : 0 }}
                className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center"
              >
                <div className="w-0 h-0 border-l-4 border-l-white border-t-2 border-t-transparent border-b-2 border-b-transparent ml-1"></div>
              </motion.div>
            </motion.div>

            {/* Duration */}
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
              {formatDuration(video.duration)}
            </div>

            {/* Views indicator */}
            <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
              <Eye className="w-3 h-3" />
              <span>{formatViews(video.views)}</span>
            </div>
          </motion.div>
        </a>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex space-x-3">
          {/* Channel avatar */}
          <a href={`/channel/${video.owner?.username}`}>
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 cursor-pointer"
            >
              <img
                src={video.owner?.avatar || "/api/placeholder/36/36"}
                alt={video.owner?.fullName}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </a>

          {/* Video info */}
          <div className="flex-1 min-w-0">
            <a href={`/watch?v=${video._id}`}>
              <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 text-sm leading-tight hover:text-red-600 dark:hover:text-red-400 cursor-pointer transition-colors">
                {video.title}
              </h3>
            </a>

            <a href={`/channel/${video.owner?.username}`}>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 hover:text-red-600 dark:hover:text-red-400 cursor-pointer transition-colors">
                {video.owner?.fullName}
              </p>
            </a>

            <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
              <span>{formatViews(video.views)}</span>
              <span className="mx-1">•</span>
              <span>
                {formatDistanceToNow(new Date(video.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>

          {/* Menu button */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.preventDefault();
                setShowMenu(!showMenu);
              }}
              className={`p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
            >
              <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </motion.button>

            {/* Menu dropdown */}
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="absolute right-0 top-8 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 z-50"
              >
                <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Save to Watch Later
                </button>
                <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
                  Add to playlist
                </button>
                <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
                  Share
                </button>
                <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
                  Not interested
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VideoCard;
