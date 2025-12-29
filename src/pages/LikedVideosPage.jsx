import { useState, useEffect } from "react";
import { getLikedVideos } from "../lib/api";
import VideoCard from "../components/VideoCard";
import { useUser } from "../components/UserContext";

const LikedVideosPage = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { loading: userLoading, isLoggedIn } = useUser();

  useEffect(() => {
    if (userLoading) return;
    if (!isLoggedIn) {
      setLoading(false);
      setError("You must be logged in to view liked videos.");
      return;
    }
    const fetchLikedVideos = async () => {
      try {
        setLoading(true);
        const response = await getLikedVideos();
        // The API returns an array of liked video documents directly
        setVideos(response || []);
      } catch (err) {
        setError(
          "Failed to fetch liked videos. Please make sure you are logged in."
        );
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLikedVideos();
  }, [userLoading, isLoggedIn]);

  if (loading)
    return <div className="p-6 text-center">Loading Liked Videos...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  return (
    <div className="p-6 bg-[#0f0f0f] min-h-[calc(100vh-3.5rem)]">
      <h1 className="text-2xl font-bold mb-6">Liked Videos</h1>
      <div className="flex flex-col gap-4">
        {videos
          .filter((like) => like.video)
          .map((like, index) => {
            const video = like.video;
            return (
              <VideoCard
                key={like._id || video._id || index}
                videoId={video._id}
                thumbnail={video.thumbnail}
                title={video.title}
                views={video.viewsCount ?? video.views ?? 0}
                timestamp={video.createdAt}
                channel={video.owner?.username}
                channelAvatar={video.owner?.avatar}
                variant="horizontal"
              />
            );
          })}
      </div>
    </div>
  );
};

export default LikedVideosPage;
