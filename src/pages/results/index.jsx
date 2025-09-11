// pages/results/index.jsx
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useQuery } from "react-query";
import { motion } from "framer-motion";
import Head from "next/head";
import { Filter, SlidersHorizontal } from "lucide-react";
import Layout from "../../components/Layout";
import VideoCard from "../../components/VideoCard";
import VideoCardSkeleton from "../../components/VideoCardSkeleton";
import { videoAPI } from "../../lib/api";

const SearchResults = () => {
  const router = useRouter();
  const { search_query: query, filter = "all" } = router.query;
  const [sortBy, setSortBy] = useState("relevance");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch search results
  const {
    data: resultsData,
    isLoading,
    error,
  } = useQuery(
    ["search", query, sortBy],
    () =>
      videoAPI.getAllVideos({
        query,
        sortBy: sortBy === "relevance" ? "views" : sortBy,
        sortType: sortBy === "upload_date" ? "desc" : "desc",
        limit: 20,
      }),
    {
      enabled: !!query,
    }
  );

  const results = resultsData?.data.data?.docs || [];
  const totalResults = resultsData?.data.data?.totalDocs || 0;

  const filters = [
    { id: "all", label: "All" },
    { id: "video", label: "Videos" },
    { id: "channel", label: "Channels" },
    { id: "playlist", label: "Playlists" },
  ];

  const sortOptions = [
    { id: "relevance", label: "Relevance" },
    { id: "upload_date", label: "Upload date" },
    { id: "views", label: "View count" },
    { id: "rating", label: "Rating" },
  ];

  if (!query) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Search YouTube Clone
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Enter a search term to find videos, channels, and playlists.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>{query} - Search Results - YouTube Clone</title>
        <meta
          name="description"
          content={`Search results for "${query}" on YouTube Clone`}
        />
      </Head>

      <Layout>
        <div className="space-y-6">
          {/* Search Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-medium text-gray-900 dark:text-white">
                Search results for "{query}"
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                About {totalResults.toLocaleString()} results
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </motion.button>
          </div>

          {/* Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {filters.map((filterOption) => (
                      <button
                        key={filterOption.id}
                        onClick={() =>
                          router.push({
                            pathname: "/results",
                            query: { ...router.query, filter: filterOption.id },
                          })
                        }
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          filter === filterOption.id
                            ? "bg-red-600 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                        }`}
                      >
                        {filterOption.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sort by
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {/* Results */}
          <div>
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(12)].map((_, i) => (
                  <VideoCardSkeleton key={i} />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Something went wrong
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Failed to load search results. Please try again.
                </p>
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No results found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try different keywords or remove search filters.
                </p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              >
                {results.map((video, index) => (
                  <motion.div
                    key={video._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <VideoCard video={video} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
};

export default SearchResults;
