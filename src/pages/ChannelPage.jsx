import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import {
  getUserChannelProfile,
  getUserVideos,
  toggleSubscription,
  getChannelSubscribers,
  getChannelSubscriberCount,
  getSubscribedChannels,
} from "../lib/api";
import { useUser } from "../components/UserContext";
import { secureUrl } from "../lib/utils";
import VideoCard from "../components/VideoCard";
import CommunityTab from "../components/CommunityTab";

const ChannelPage = () => {
  const { username } = useParams();
  const { user: currentUser, isLoggedIn, loading: userLoading } = useUser();
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [activeTab, setActiveTab] = useState("videos"); // 'videos', 'community', or 'subscribers'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!username || userLoading) return;

    const fetchChannelData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch channel profile
        const profileRes = await getUserChannelProfile(username);
        const channelData = profileRes?.data?.data;

        if (!profileRes?.data?.success || !channelData) {
          throw new Error("Channel not found.");
        }

        // Safely initialize subscribers count
        channelData.subscribersCount =
          Number(channelData.subscribersCount) || 0;

        // Fetch videos, subscribers, and subscriber count in parallel
        const [videosRes, subscribersRes, countRes] = await Promise.all([
          getUserVideos(channelData._id).catch(() => ({ data: { data: [] } })),
          getChannelSubscribers(channelData._id).catch(() => ({
            data: { data: [] },
          })),
          getChannelSubscriberCount(channelData._id).catch(() => 0),
        ]);

        channelData.subscribersCount = countRes || 0;

        // Check subscription status if user is logged in
        if (isLoggedIn && currentUser?._id) {
          try {
            const subscribedChannelsRes = await getSubscribedChannels(
              currentUser._id
            );
            channelData.isSubscribed =
              subscribedChannelsRes?.data?.data?.some(
                (sub) => sub.channel._id === channelData._id
              ) || false;
          } catch (err) {
            console.warn("Failed to fetch subscribed channels, ignoring:", err);
            channelData.isSubscribed = false;
          }
        }

        // Set state safely
        setChannel(channelData);
        setSubscribers(subscribersRes?.data?.data || []);
        setVideos(videosRes?.data?.data?.videos || videosRes?.data?.data || []);
      } catch (err) {
        console.error("Failed to fetch channel data:", err);
        setError(err?.message || "Could not load channel.");
      } finally {
        setLoading(false);
      }
    };

    fetchChannelData();
  }, [username, userLoading, isLoggedIn, currentUser]);

  const handleToggleSubscription = async () => {
    if (!isLoggedIn) {
      toast.error("You must be logged in to subscribe.");
      return;
    }
    if (currentUser?._id === channel._id) {
      toast.error("You cannot subscribe to your own channel.");
      return;
    }

    // Optimistic UI update
    setChannel((prev) => ({
      ...prev,
      isSubscribed: !prev.isSubscribed,
      subscribersCount:
        (prev.subscribersCount || 0) + (prev.isSubscribed ? -1 : 1),
    }));

    try {
      const data = await toggleSubscription(channel._id);
      // Re-sync with the actual server state
      setChannel((prev) => ({
        ...prev,
        isSubscribed: data.isSubscribed,
        subscribersCount: data.subscribersCount,
      }));
    } catch (err) {
      console.error("Subscription toggle failed:", err);
      toast.error("Something went wrong.");
      // Revert UI on failure
      setChannel((prev) => ({
        ...prev,
        isSubscribed: !prev.isSubscribed,
        subscribersCount:
          (prev.subscribersCount || 0) + (prev.isSubscribed ? -1 : 1),
      }));
    }
  };

  if (loading) return <div className="p-6 text-center">Loading channel...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;
  if (!channel)
    return <div className="p-6 text-center">Channel not found.</div>;

  return (
    <div className="bg-[#0f0f0f] text-white min-h-screen">
      <Helmet>
        <title>{`${channel.fullName} (@${channel.username}) - YoutubeClone`}</title>
        <meta
          name="description"
          content={`Watch videos from ${channel.fullName} on YoutubeClone.`}
        />
        <meta property="og:title" content={channel.fullName} />
        <meta property="og:image" content={secureUrl(channel.avatar)} />
      </Helmet>
      {/* Cover Image */}
      <div className="w-full h-48 bg-gray-800">
        {channel.coverImage && (
          <img
            src={secureUrl(channel.coverImage)}
            alt={`${channel.username}'s cover`}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Channel Header */}
      <div className="px-6 py-4 flex items-center gap-6 border-b border-gray-800">
        <img
          src={secureUrl(channel.avatar)}
          alt={channel.username}
          className="w-20 h-20 rounded-full"
        />
        <div className="flex-grow">
          <h1 className="text-2xl font-bold">{channel.fullName}</h1>
          <p className="text-gray-400">@{channel.username}</p>
          <p className="text-gray-400">
            {channel.subscribersCount} subscribers
          </p>
        </div>
        {isLoggedIn && currentUser?._id !== channel._id && (
          <button
            onClick={handleToggleSubscription}
            className={`px-4 py-2 rounded-full font-semibold ${
              channel.isSubscribed
                ? "bg-gray-700 text-white"
                : "bg-white text-black"
            }`}
          >
            {channel.isSubscribed ? "Subscribed" : "Subscribe"}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="px-6 border-b border-gray-800">
        <nav className="flex gap-6">
          <button
            onClick={() => setActiveTab("videos")}
            className={`py-3 font-semibold border-b-2 ${
              activeTab === "videos"
                ? "border-white text-white"
                : "border-transparent text-gray-400"
            }`}
          >
            VIDEOS
          </button>
          <button
            onClick={() => setActiveTab("community")}
            className={`py-3 font-semibold border-b-2 ${
              activeTab === "community"
                ? "border-white text-white"
                : "border-transparent text-gray-400"
            }`}
          >
            COMMUNITY
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === "videos" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.isArray(videos) &&
              videos.map((video) => (
                <VideoCard
                  key={video._id}
                  videoId={video._id}
                  thumbnail={video.thumbnail}
                  title={video.title}
                  views={video.viewsCount ?? video.views ?? 0}
                  timestamp={video.createdAt}
                  channel={video.owner?.username || channel.username} // fallback
                  channelAvatar={video.owner?.avatar || channel.avatar} // fallback
                />
              ))}
          </div>
        )}

        {activeTab === "community" && <CommunityTab channel={channel} />}
        {activeTab === "subscribers" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {subscribers.length > 0 ? (
              subscribers.map(({ subscriber }) => (
                <Link
                  to={`/channel/${subscriber.username}`}
                  key={subscriber._id}
                  className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-gray-800"
                >
                  <img
                    src={secureUrl(subscriber.avatar)}
                    alt={subscriber.username}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                  <p className="font-semibold text-center">
                    {subscriber.username}
                  </p>
                </Link>
              ))
            ) : (
              <p className="col-span-full text-center text-gray-400">
                This channel has no subscribers yet.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelPage;
