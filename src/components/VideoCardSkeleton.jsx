// components/VideoCardSkeleton.jsx
import { motion } from "framer-motion";

const VideoCardSkeleton = () => {
  const shimmerVariants = {
    initial: { x: "-100%" },
    animate: {
      x: "100%",
      transition: {
        repeat: Infinity,
        duration: 1.5,
        ease: "linear",
      },
    },
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-sm">
      {/* Thumbnail skeleton */}
      <div className="relative w-full aspect-video bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <motion.div
          variants={shimmerVariants}
          initial="initial"
          animate="animate"
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        />
      </div>

      {/* Content skeleton */}
      <div className="p-4">
        <div className="flex space-x-3">
          {/* Avatar skeleton */}
          <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0 overflow-hidden relative">
            <motion.div
              variants={shimmerVariants}
              initial="initial"
              animate="animate"
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
          </div>

          {/* Text content skeleton */}
          <div className="flex-1 space-y-2">
            {/* Title skeleton */}
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden relative">
                <motion.div
                  variants={shimmerVariants}
                  initial="initial"
                  animate="animate"
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                />
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 overflow-hidden relative">
                <motion.div
                  variants={shimmerVariants}
                  initial="initial"
                  animate="animate"
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                />
              </div>
            </div>

            {/* Channel name skeleton */}
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 overflow-hidden relative">
              <motion.div
                variants={shimmerVariants}
                initial="initial"
                animate="animate"
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              />
            </div>

            {/* Views and date skeleton */}
            <div className="flex space-x-2">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 overflow-hidden relative">
                <motion.div
                  variants={shimmerVariants}
                  initial="initial"
                  animate="animate"
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                />
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 overflow-hidden relative">
                <motion.div
                  variants={shimmerVariants}
                  initial="initial"
                  animate="animate"
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCardSkeleton;
