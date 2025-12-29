import { useState, useEffect } from "react";
import { getTrendingVideos } from "../lib/api";
import VideoCard from "../components/VideoCard";
import { useUser } from "../components/UserContext";

const TrendingPage = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { loading: userLoading } = useUser();

  useEffect(() => {
    if (userLoading) return;
    const fetchTrending = async () => {
      try {
        setLoading(true);
        const response = await getTrendingVideos();
        setVideos(response.data.data || []);
      } catch (err) {
        setError("Failed to fetch trending videos.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, [userLoading]);

  if (loading)
    return <div className="p-6 text-center">Loading Trending Videos...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  return (
    <div className="p-6 bg-[#0f0f0f] min-h-[calc(100vh-3.5rem)]">
      <h1 className="text-3xl font-bold mb-6">Trending Videos</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {videos.length > 0 ? (
          videos.map((video) => (
            <VideoCard
              key={video._id}
              videoId={video._id}
              thumbnail={video.thumbnail}
              title={video.title}
              views={video.viewsCount ?? video.views ?? 0}
              timestamp={video.createdAt}
              channel={video.owner?.username}
              channelAvatar={video.owner?.avatar}
            />
          ))
        ) : (
          <p>No trending videos available right now.</p>
        )}
      </div>
    </div>
  );
};

export default TrendingPage;
