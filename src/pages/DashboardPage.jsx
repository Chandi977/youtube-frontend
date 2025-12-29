import { useState, useEffect } from "react";
import { getChannelStats, getChannelVideos } from "../lib/api";
import { Link } from "react-router-dom";
import VideoCard from "../components/VideoCard";
import { Video, Users, ThumbsUp, Eye } from "lucide-react";
import { useUser } from "../components/UserContext";

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user, loading: userLoading } = useUser();

  useEffect(() => {
    if (userLoading) return;
    if (!user?._id) {
      setError("You must be logged in to view the dashboard.");
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, videosRes] = await Promise.all([
          getChannelStats(user._id),
          getChannelVideos(user._id),
        ]);
        setStats(statsRes.data.data);
        // Handle cases where API returns an object with a 'videos' property or a direct array.
        setVideos(videosRes.data?.data?.videos || videosRes.data?.data || []);
      } catch (err) {
        setError("Failed to load dashboard data. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, userLoading]);

  if (loading)
    return <div className="p-6 text-center">Loading Dashboard...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  const StatCard = ({ icon, label, value }) => (
    <div
      className="bg-[#121212] p-6 rounded-lg flex items-center gap-4"
      data-aos="fade-up"
    >
      <div className="bg-gray-800 p-3 rounded-full">{icon}</div>
      <div>
        <p className="text-gray-400 text-sm">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-[#0f0f0f] text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Channel Dashboard</h1>

      {/* Stats Section */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Users size={24} />}
            label="Total Subscribers"
            value={stats.totalSubscribers}
          />
          <StatCard
            icon={<Eye size={24} />}
            label="Total Views"
            value={stats.totalViews}
          />
          <StatCard
            icon={<Video size={24} />}
            label="Total Videos"
            value={stats.totalVideos}
          />
          <StatCard
            icon={<ThumbsUp size={24} />}
            label="Total Likes"
            value={stats.totalLikes}
          />
        </div>
      )}

      {/* Videos Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Your Videos</h2>
        {Array.isArray(videos) && videos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {videos.map((video) => (
              <VideoCard
                key={video._id}
                videoId={video._id}
                thumbnail={video.thumbnail}
                title={video.title}
                views={video.viewsCount ?? video.views ?? 0}
                timestamp={video.createdAt}
                channel={user.username}
                channelAvatar={user.avatar}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-[#121212] rounded-lg">
            <p className="text-gray-400 text-lg">
              You haven't uploaded any videos yet.
            </p>
            <Link
              to="/upload"
              className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors"
            >
              Upload your first video
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
