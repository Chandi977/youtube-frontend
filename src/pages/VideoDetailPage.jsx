import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ThumbsUp, Share2, Download, ListPlus } from "lucide-react";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";

import VideoCard from "../components/VideoCard";
import VideoPlayer from "../components/VideoPlayer";
import { useUser } from "../components/UserContext";
import * as api from "../lib/api";
import { secureUrl } from "../lib/utils";

// Lazy load components
const Comments = lazy(() => import("../components/Comments"));
const AddToPlaylistModal = lazy(() =>
  import("../components/AddToPlaylistModal")
);

const createMasterPlaylist = (resolutions) => {
  if (!resolutions?.length) return null;

  // Map heights to approximate bitrates (in kbps) for a better player experience
  const bitrateMap = {
    144: 200,
    240: 400,
    360: 800,
    480: 1500,
    720: 2800,
    1080: 5000,
  };

  // Sort resolutions by height. HLS players often prefer this.
  const sortedResolutions = [...resolutions].sort(
    (a, b) => a.height - b.height
  );

  const playlist =
    "#EXTM3U\n#EXT-X-VERSION:4\n" +
    sortedResolutions
      .map((res) => {
        const bitrate = bitrateMap[res.height] || 800;
        const bandwidth = bitrate * 1000;
        return `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${
          res.width
        }x${res.height}\n${secureUrl(res.url)}`;
      })
      .join("\n");

  console.log("Generated Master Playlist:\n", playlist);
  return playlist;
};

const VideoDetailPage = () => {
  const { id } = useParams();
  // console.log(id);

  const navigate = useNavigate();
  const { user, isLoggedIn, loading: userLoading } = useUser();

  const [video, setVideo] = useState(null);
  const [recommendedVideos, setRecommendedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);

  /** Fetch video & recommendations */
  const fetchVideoData = useCallback(async () => {
    if (!id || userLoading) return;

    setLoading(true);
    setError(null);

    try {
      const [videoRes, allVideosRes] = await Promise.all([
        api.getVideoById(id),
        api.getAllVideos({ limit: 10 }),
      ]);

      let fetchedVideo = videoRes?.data?.data || null;

      if (fetchedVideo) {
        // Fetch like status and merge it into the video object
        try {
          const likesData = await api.getVideoLikes(id);
          fetchedVideo.isLiked = likesData.isLiked;
          fetchedVideo.likesCount = likesData.count;
        } catch (likeError) {
          console.error("Could not fetch like status:", likeError);
          // Gracefully handle if likes fail to load
          fetchedVideo.isLiked = false;
          fetchedVideo.likesCount = fetchedVideo.likesCount || 0;
        }

        // Check initial subscription status
        if (isLoggedIn && user?._id && fetchedVideo.owner?._id) {
          const subscribedChannels = await api.getSubscribedChannels(user._id);
          fetchedVideo.isSubscribed =
            subscribedChannels.some(
              (sub) => sub.channel._id === fetchedVideo.owner._id
            ) || false;

          // Fetch subscriber count
          const countRes = await api.getChannelSubscriberCount(
            fetchedVideo.owner._id
          );
          fetchedVideo.owner.subscribersCount = countRes || 0;
        }
      }

      setVideo(fetchedVideo);
      setRecommendedVideos(
        allVideosRes?.data?.data?.videos?.filter((v) => v._id !== id) || []
      );
    } catch (err) {
      setError("Failed to load video details.");
      console.error("Failed to load video:", err);
    } finally {
      setLoading(false);
    }
  }, [id, user, isLoggedIn, userLoading]); // Keep dependencies here for useCallback

  useEffect(() => {
    fetchVideoData();
  }, [fetchVideoData]);

  // Record video view
  useEffect(() => {
    if (!video?._id) return;

    // Use sessionStorage to prevent re-recording views during the same session
    const viewedKey = `viewed_${video._id}`;
    if (sessionStorage.getItem(viewedKey)) {
      return;
    }

    const recordUserView = async () => {
      try {
        // Optimistically update the UI
        setVideo((prev) =>
          prev
            ? {
                ...prev,
                viewsCount: (prev.viewsCount ?? prev.views ?? 0) + 1,
                views:
                  prev.views !== undefined
                    ? (prev.views || 0) + 1
                    : prev.views,
              }
            : prev
        );
        sessionStorage.setItem(viewedKey, "true");
        // Then, send the request to the backend
        await api.recordView(video._id);
      } catch (err) {
        console.error("Failed to record view:", err);
        // Revert on failure if necessary, though for views it's often okay to leave it.
      }
    };
    recordUserView();
  }, [video?._id, isLoggedIn]); // Depends only on video ID and login status

  /** Toggle like status */
  const handleToggleVideoLike = async () => {
    if (!isLoggedIn)
      return toast.error("You must be logged in to like a video.");

    const originalVideo = { ...video };
    setVideo((prev) =>
      prev
        ? {
            ...prev,
            isLiked: !prev.isLiked,
            likesCount: (prev.likesCount || 0) + (prev.isLiked ? -1 : 1),
          }
        : prev
    );

    try {
      await api.toggleVideoLike(id);
    } catch {
      toast.error("Failed to update like status.");
      setVideo(originalVideo);
    }
  };

  /** Toggle subscription */
  const handleToggleSubscription = async () => {
    if (!isLoggedIn) {
      toast.error("You must be logged in to subscribe.");
      return;
    }

    if (!video || !video.owner) return;

    // Prevent subscribing to own channel
    if (user?._id === video.owner._id) {
      toast.error("You cannot subscribe to your own channel.");
      return;
    }

    // Optimistic UI update
    setVideo((prev) => {
      if (!prev || !prev.owner) return prev;

      const currentlySubscribed = prev.isSubscribed || false;
      return {
        ...prev,
        isSubscribed: !currentlySubscribed,
        owner: {
          ...prev.owner,
          subscribersCount:
            (prev.owner.subscribersCount || 0) + (currentlySubscribed ? -1 : 1),
        },
      };
    });

    try {
      const data = await api.toggleSubscription(video.owner._id);

      // Sync with backend
      setVideo((prev) => {
        if (!prev || !prev.owner) return prev;
        return {
          ...prev,
          isSubscribed: data.isSubscribed,
          owner: {
            ...prev.owner,
            subscribersCount: data.subscribersCount,
          },
        };
      });
    } catch (err) {
      console.error("Subscription toggle failed:", err);
      toast.error("Something went wrong.");

      // Revert UI on failure
      setVideo((prev) => {
        if (!prev || !prev.owner) return prev;

        const currentlySubscribed = prev.isSubscribed || false;
        return {
          ...prev,
          isSubscribed: !currentlySubscribed,
          owner: {
            ...prev.owner,
            subscribersCount:
              (prev.owner.subscribersCount || 0) +
              (currentlySubscribed ? 1 : -1),
          },
        };
      });
    }
  };

  const handleNextVideo = () => {
    if (!recommendedVideos.length) return toast("No next video available.");
    navigate(`/video/${recommendedVideos[0]._id}`);
  };

  const handlePreviousVideo = () => toast("No previous video in this context.");

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;
  if (!video) return <div className="p-6 text-center">Video not found.</div>;

  return (
    <div className="flex flex-col lg:flex-row p-4 md:p-6 gap-6 min-h-[calc(100vh-3.5rem)]">
      <Helmet>
        <title>{`${video.title} - YoutubeClone`}</title>
        <meta name="description" content={video.description} />
        <meta property="og:title" content={video.title} />
        <meta property="og:description" content={video.description} />
        <meta property="og:image" content={secureUrl(video.thumbnail?.url)} />
      </Helmet>

      <div className="w-full lg:flex-1 min-w-0">
        <div className="aspect-video bg-black rounded-xl mb-4 overflow-hidden">
          <Suspense fallback={<div className="w-full h-full bg-black" />}>
            <VideoPlayer
              src={
                video.videoFile?.adaptive?.length > 0
                  ? {
                      masterPlaylist: createMasterPlaylist(
                        video.videoFile.adaptive
                      ),
                    }
                  : secureUrl(video.videoFile?.url || video.videoFile)
              }
              poster={secureUrl(video.thumbnail?.url)}
              onNext={handleNextVideo}
              onPrevious={handlePreviousVideo}
            />
          </Suspense>
        </div>

        <h1 className="text-xl md:text-2xl font-bold mb-2">{video.title}</h1>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link
              to={`/channel/${video.owner?.username}`}
              className="flex items-center gap-3"
            >
              <img
                src={secureUrl(video.owner?.avatar)}
                alt={video.owner?.username}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="font-semibold">{video.owner?.username}</p>
                <p className="text-sm text-gray-400">
                  {video.owner?.subscribersCount} subscribers
                </p>
              </div>
            </Link>
            <button
              onClick={handleToggleSubscription}
              className={`px-4 py-2 rounded-full font-semibold ${
                video.isSubscribed
                  ? "bg-gray-700 text-white"
                  : "bg-white text-black"
              }`}
            >
              {video.isSubscribed ? "Subscribed" : "Subscribe"}
            </button>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleToggleVideoLike}
              className={`flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-full hover:bg-gray-700 ${
                video.isLiked ? "text-blue-500" : ""
              }`}
            >
              <ThumbsUp size={20} /> {video.likesCount || 0}
            </button>
            <button className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-full hover:bg-gray-700">
              <Share2 size={20} /> Share
            </button>
            <button className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-full hover:bg-gray-700">
              <Download size={20} /> Download
            </button>
            <button
              onClick={() => setIsPlaylistModalOpen(true)}
              className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-full hover:bg-gray-700"
            >
              <ListPlus size={20} /> Save
            </button>
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-xl">
          <p className="font-semibold">
            {video.viewsCount ?? video.views ?? 0} views &bull;{" "}
            {video.createdAt
              ? new Date(video.createdAt).toLocaleDateString()
              : ""}
          </p>
          <p className="mt-2">{video.description}</p>
        </div>

        <Suspense
          fallback={<div className="text-center p-4">Loading comments...</div>}
        >
          <Comments videoId={id} videoOwnerId={video.owner?._id} />
        </Suspense>
      </div>

      <div className="w-full lg:w-96 lg:flex-shrink-0">
        <h2 className="text-xl font-bold mb-4">Up next</h2>
        <div className="flex flex-col gap-4">
          {recommendedVideos.map((recVideo, idx) => (
            <VideoCard
              key={recVideo._id || idx}
              variant="horizontal"
              videoId={recVideo._id}
              thumbnail={recVideo.thumbnail?.url}
              title={recVideo.title}
              channel={recVideo.owner?.username}
              channelAvatar={recVideo.owner?.avatar}
              views={recVideo.views}
              timestamp={recVideo.createdAt}
            />
          ))}
        </div>
      </div>

      {isPlaylistModalOpen && (
        <Suspense fallback={<div />}>
          <AddToPlaylistModal
            videoId={id}
            onClose={() => setIsPlaylistModalOpen(false)}
          />
        </Suspense>
      )}
    </div>
  );
};

export default VideoDetailPage;
