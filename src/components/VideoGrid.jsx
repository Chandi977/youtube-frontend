import { useState, useEffect } from "react";
import VideoCard from "./VideoCard";
import { getAllVideos } from "../lib/api";

const VideoGrid = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const response = await getAllVideos({ limit: 20 });
        setVideos(response.data.data.videos || []);
      } catch (err) {
        console.log(err);
        setError("Failed to fetch videos. Make sure your backend is running.");
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  if (loading)
    return <div className="flex-1 p-6 text-center">Loading videos...</div>;
  if (error)
    return <div className="flex-1 p-6 text-center text-red-500">{error}</div>;

  return (
    <main className="flex-1 p-4 sm:p-6 bg-[#0f0f0f]">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {videos.map((video, index) => (
          <VideoCard
            key={video._id || index}
            videoId={video._id}
            thumbnail={video.thumbnail}
            channelAvatar={video.owner?.avatar}
            title={video.title}
            channel={video.owner?.username}
            views={video.viewsCount ?? video.views ?? 0}
            timestamp={video.createdAt}
          />
        ))}
      </div>
    </main>
  );
};

export default VideoGrid;
