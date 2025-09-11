// pages/index.jsx
import { useState, useEffect } from "react";
import { useQuery } from "react-query";
import { motion } from "framer-motion";
import Head from "next/head";
import Layout from "../components/Layout";
import VideoCard from "../components/VideoCard";
import CategoryFilter from "../components/CategoryFilter";
import VideoCardSkeleton from "../components/VideoCardSkeleton";
import { videoAPI } from "../lib/api";
import { useInView } from "react-intersection-observer";

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [page, setPage] = useState(1);
  const [allVideos, setAllVideos] = useState([]);

  const { ref: loadMoreRef, inView } = useInView({ threshold: 0 });

  // Fetch videos with React Query
  const {
    data: videosData,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useQuery(
    ["videos", page, selectedCategory],
    () =>
      videoAPI.getAllVideos({
        page,
        limit: 20,
        sortBy: "createdAt",
        sortType: "desc",
        ...(selectedCategory !== "All" && { category: selectedCategory }),
      }),
    {
      keepPreviousData: true,
      onSuccess: (data) => {
        // API returns { videos, total, page, limit }
        const videos = data?.data?.data?.videos || [];
        if (page === 1) setAllVideos(videos);
        else setAllVideos((prev) => [...prev, ...videos]);
      },
    }
  );

  // Compute hasNextPage
  const hasNextPage =
    videosData?.data?.data?.total >
    page * (videosData?.data?.data?.limit || 20);

  // Load more when inView
  useEffect(() => {
    if (inView && !isFetching && hasNextPage) {
      setPage((prev) => prev + 1);
    }
  }, [inView, isFetching, hasNextPage]);

  // Reset page/videos on category change
  useEffect(() => {
    setPage(1);
    setAllVideos([]);
  }, [selectedCategory]);

  const categories = [
    "All",
    "Music",
    "Gaming",
    "Movies",
    "News",
    "Sports",
    "Technology",
    "Education",
    "Comedy",
    "Entertainment",
    "Science",
    "Travel",
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3, staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <>
      <Head>
        <title>VideoTube</title>
        <meta
          name="description"
          content="Watch and share videos on YouTube Clone"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout>
        <div className="min-h-screen">
          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="sticky top-0 bg-white dark:bg-gray-900 z-10 py-4 border-b border-gray-200 dark:border-gray-700"
          >
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </motion.div>

          {/* Videos Grid */}
          <div className="py-6">
            {isLoading && page === 1 ? (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4"
              >
                {[...Array(20)].map((_, idx) => (
                  <motion.div key={idx} variants={itemVariants}>
                    <VideoCardSkeleton />
                  </motion.div>
                ))}
              </motion.div>
            ) : isError ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Something went wrong
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Failed to load videos. Please try again.
                </p>
                <button
                  onClick={() => refetch()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </motion.div>
            ) : allVideos.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No videos found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Try selecting a different category or check back later.
                </p>
              </motion.div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4"
              >
                {allVideos.map((video) => (
                  <motion.div key={video._id} variants={itemVariants} layout>
                    <VideoCard video={video} />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Infinite scroll loader */}
            {hasNextPage && (
              <div ref={loadMoreRef} className="flex justify-center py-8">
                {isFetching && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 w-full">
                    {[...Array(5)].map((_, idx) => (
                      <VideoCardSkeleton key={idx} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Home;
