import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getSubscribedChannels,
  getUserChannelProfile,
} from "../lib/api";
import { secureUrl } from "../lib/utils";
import { useUser } from "../components/UserContext";

const SubscriptionsPage = () => {
  const { user } = useUser();
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?._id) {
      setError("You must be logged in to see your subscriptions.");
      setLoading(false);
      return;
    }

    const fetchSubscriptions = async () => {
      try {
        setLoading(true);
        const subscriptions = await getSubscribedChannels(user._id);
        const baseChannels = subscriptions.map((sub) => sub.channel) || [];

        // Enrich each channel with profile info (subs count, cover, full name)
        const withDetails = await Promise.all(
          baseChannels.map(async (channel) => {
            try {
              const res = await getUserChannelProfile(channel.username);
              const profile = res.data.data;
              return {
                ...channel,
                fullName: profile.fullName,
                coverImage: profile.coverImage,
                subscribersCount: profile.subscribersCount,
                channelsSubscribedToCount: profile.channelsSubscribedToCount,
              };
            } catch (err) {
              console.error("Failed to load channel profile", channel.username, err);
              return channel; // Fallback to basic info
            }
          })
        );

        setChannels(withDetails);
      } catch (err) {
        setError("Failed to fetch subscriptions.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, [user]);

  if (loading)
    return <div className="p-6 text-center">Loading Subscriptions...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  return (
    <div className="p-6 bg-[#0f0f0f] min-h-[calc(100vh-3.5rem)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-gray-400">Subscriptions</p>
          <h1 className="text-2xl font-bold">
            Channels you follow ({channels.length})
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {channels.length > 0 ? (
          channels.map((channel) => (
            <Link
              to={`/channel/${channel.username}`}
              key={channel._id || channel.username}
              className="relative overflow-hidden rounded-xl border border-gray-800 bg-gradient-to-br from-gray-900 to-[#0f0f0f] hover:from-gray-800 hover:to-gray-900 transition-all duration-200 shadow-lg"
            >
              {/* Cover / top strip */}
              <div className="h-24 w-full overflow-hidden bg-gray-800">
                {channel.coverImage ? (
                  <img
                    src={secureUrl(channel.coverImage)}
                    alt={`${channel.username} cover`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-r from-slate-800 to-slate-700" />
                )}
              </div>

              {/* Avatar */}
              <div className="px-4 -mt-8 flex items-center gap-3">
                <img
                  src={secureUrl(channel.avatar)}
                  alt={channel.username}
                  className="w-14 h-14 rounded-full border-4 border-gray-900 bg-gray-900 object-cover"
                  loading="lazy"
                />
                <div>
                  <p className="font-semibold leading-tight">
                    {channel.fullName || channel.username}
                  </p>
                  <p className="text-sm text-gray-400">@{channel.username}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="px-4 pb-4 pt-2 flex items-center gap-4 text-sm text-gray-300">
                <span>
                  {channel.subscribersCount ?? "—"} subscribers
                </span>
                <span className="text-gray-600">•</span>
                <span>
                  {channel.channelsSubscribedToCount ?? 0} following
                </span>
              </div>

              <div className="px-4 pb-4">
                <span className="inline-flex items-center gap-2 text-sm text-blue-300">
                  View channel →
                </span>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-gray-400">
            You are not subscribed to any channels yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default SubscriptionsPage;
