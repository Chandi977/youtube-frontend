import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  getPlaylistById,
  removeVideoFromPlaylist,
  getVideoById,
} from "../lib/api";
import VideoCard from "../components/VideoCard";
import { useUser } from "../components/UserContext";
import { Trash2, PlusCircle } from "lucide-react";
import toast from "react-hot-toast";
import AddVideosToPlaylistModal from "../components/AddVideosToPlaylistModal";

const PlaylistDetailPage = () => {
  const { playlistId } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { user, loading: userLoading } = useUser();

  const isOwner = user?._id === playlist?.owner?._id;

  const fetchPlaylist = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const playlistRes = await getPlaylistById(playlistId);
      const playlistData = playlistRes.data.data;

      // If the playlist contains videos, fetch their full details.
      // This ensures we have all necessary data like thumbnails and owner info.
      // NOTE: This approach can be inefficient for very large playlists.
      // A better long-term solution is for the backend to return fully populated video objects.
      if (playlistData && playlistData.videos.length > 0) {
        const videoDetailPromises = playlistData.videos.map((video) =>
          getVideoById(video._id)
        );
        const videoResponses = await Promise.all(videoDetailPromises);
        // Replace the potentially partial video data with full video data
        playlistData.videos = videoResponses.map((res) => res.data.data);
      }

      setPlaylist(playlistData);
    } catch (err) {
      setError("Failed to fetch playlist details.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [playlistId]);

  useEffect(() => {
    if (!playlistId || userLoading) return;
    fetchPlaylist();
  }, [playlistId, userLoading, fetchPlaylist]);

  const handleRemoveVideo = async (videoId) => {
    if (!isOwner) return;
    try {
      await removeVideoFromPlaylist(videoId, playlistId);
      setPlaylist((prev) => ({
        ...prev,
        videos: prev.videos.filter((v) => v._id !== videoId),
      }));
      toast.success("Video removed from playlist");
    } catch (err) {
      toast.error("Failed to remove video.");
      console.error(err);
    }
  };

  if (loading)
    return <div className="p-6 text-center">Loading Playlist...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;
  if (!playlist)
    return <div className="p-6 text-center">Playlist not found.</div>;

  const existingVideoIds = playlist?.videos.map((v) => v._id) || [];

  return (
    <div className="flex flex-col md:flex-row p-6 gap-6 bg-[#0f0f0f] min-h-screen">
      <div className="w-full md:w-1/3 md:sticky top-20 h-fit bg-[#121212] p-6 rounded-xl">
        <div className="aspect-video bg-gray-700 rounded-lg mb-4">
          {playlist.videos[0] && (
            <img
              src={playlist.videos[0].thumbnail?.url}
              alt="Playlist thumbnail"
              className="w-full h-full object-cover rounded-lg"
            />
          )}
        </div>
        <h1 className="text-2xl font-bold">{playlist.name}</h1>
        <p className="text-gray-400 mt-2">{playlist.description}</p>
        <div className="mt-4 text-sm text-gray-400">
          <p>{playlist.owner?.fullName}</p>
          <p>{playlist.videos.length} videos</p>
        </div>
        {isOwner && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 rounded-full font-semibold hover:bg-blue-700"
          >
            <PlusCircle size={20} /> Add Videos
          </button>
        )}
      </div>

      <div className="flex-grow">
        {playlist.videos.length > 0 ? (
          <div className="flex flex-col gap-4">
            {playlist.videos.map((video, index) => (
              <div key={video._id} className="flex items-center gap-4 group">
                <span className="text-gray-500 w-8 text-center">
                  {index + 1}
                </span>
                <div className="flex-grow">
                  <VideoCard
                    videoId={video._id}
                    thumbnail={video.thumbnail}
                    title={video.title}
                    views={video.viewsCount ?? video.views ?? 0}
                    timestamp={video.createdAt}
                    channel={video.owner?.username}
                    channelAvatar={video.owner?.avatar}
                    variant="horizontal"
                  />
                </div>
                {isOwner && (
                  <button
                    onClick={() => handleRemoveVideo(video._id)}
                    className="p-2 rounded-full hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove from playlist"
                    aria-label="Remove from playlist"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>This playlist is empty.</p>
        )}
      </div>
      {isAddModalOpen && (
        <AddVideosToPlaylistModal
          playlistId={playlistId}
          existingVideoIds={existingVideoIds}
          onClose={() => setIsAddModalOpen(false)}
          onVideosAdded={fetchPlaylist}
        />
      )}
    </div>
  );
};

export default PlaylistDetailPage;
