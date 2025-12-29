import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getLiveStreams } from "../lib/api";
import { Helmet } from "react-helmet-async";
import { secureUrl } from "../lib/utils";

const FALLBACK_THUMBNAIL =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='640' height='360'><rect width='100%' height='100%' fill='%231f2937'/><text x='50%' y='50%' fill='%23ffffff' font-size='24' font-family='Arial' dominant-baseline='middle' text-anchor='middle'>Live Stream</text></svg>";

const LiveStreamPage = () => {
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch live streams
  const fetchStreams = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getLiveStreams();
      setStreams(response.data.data.streams || []);
      setError(null);
    } catch (err) {
      setError("Failed to fetch live streams.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch + polling every 30s
  useEffect(() => {
    fetchStreams();
    const interval = setInterval(fetchStreams, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [fetchStreams]);

  if (loading) {
    return (
      <div className="p-6 text-center text-white">Loading live streams...</div>
    );
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="p-6 bg-[#0f0f0f] min-h-[calc(100vh-3.5rem)] text-white">
      {/* SEO Optimizations */}
      <Helmet>
        <title>Live Streams - YoutubeClone</title>
        <meta
          name="description"
          content="Watch live streams happening now on YoutubeClone. Join your favorite creators and interact in real-time."
        />
        <link
          rel="canonical"
          href="https://client-nine-green-46.vercel.app/live"
        />
      </Helmet>

      <h1 className="text-3xl font-bold mb-6" data-aos="fade-in">
        Live Now
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {streams.length > 0 ? (
          streams.map((stream) => (
            <Link
              to={`/live/${stream._id}`}
              key={stream._id}
              className="bg-[#121212] p-4 rounded-lg hover:bg-gray-800 transition-colors duration-200"
              data-aos="fade-up"
            >
              {/* Thumbnail */}
              <div className="aspect-video bg-gray-800 rounded-md mb-2 flex items-center justify-center overflow-hidden">
                <img
                  src={secureUrl(stream.thumbnail?.url) || FALLBACK_THUMBNAIL}
                  alt={stream.title || "Live Stream Thumbnail"}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Stream info */}
              <h3 className="font-semibold text-white line-clamp-2">
                {stream.title}
              </h3>
              <p className="text-gray-400 text-sm mt-1">
                {stream.owner?.username}
              </p>

              {/* Viewer count + LIVE label */}
              <p
                className="text-sm text-red-500 font-bold mt-1"
                aria-live="polite"
              >
                LIVE - {stream.currentViewers || 0} viewers
              </p>
            </Link>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-400">
            No one is live right now.
          </p>
        )}
      </div>
    </div>
  );
};

export default LiveStreamPage;

