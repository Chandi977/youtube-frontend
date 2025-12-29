import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import { getLiveStream } from "../lib/api";
import { useUser } from "../components/UserContext";
import { secureUrl } from "../lib/utils";
import VideoPlayer from "../components/VideoPlayer";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || window.location.origin || "http://localhost:8000"
).replace(/\/$/, "");

const LiveStreamViewerPage = () => {
  const { streamId } = useParams();
  const [stream, setStream] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useUser();

  // Construct the HLS playback URL.
  // This assumes your backend media server exposes HLS streams at a `/live` path.
  // e.g., http://your-backend.com/live/STREAM_KEY.m3u8
  const hlsSrc = stream ? `${API_BASE_URL}/live/${stream.streamKey}.m3u8` : "";

  useEffect(() => {
    if (!streamId) return;

    const fetchStream = async () => {
      try {
        setLoading(true);
        const response = await getLiveStream(streamId);
        setStream(response.data.data);
      } catch (err) {
        setError(
          "Failed to load live stream. It may have ended or does not exist."
        );
        toast.error("Could not load stream.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStream();
  }, [streamId]);

  if (loading) {
    return <div className="p-6 text-center">Loading stream...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  if (!stream) {
    return <div className="p-6 text-center">Stream not found.</div>;
  }

  return (
    <div className="flex flex-col lg:flex-row p-4 md:p-6 gap-6 min-h-[calc(100vh-3.5rem)]">
      <Helmet>
        <title>{`${stream.title} (LIVE) - YoutubeClone`}</title>
        <meta name="description" content={stream.description} />
      </Helmet>

      <div className="w-full lg:flex-1 min-w-0">
        <div className="aspect-video bg-black rounded-xl mb-4 overflow-hidden">
          <VideoPlayer src={hlsSrc} poster={secureUrl(stream.thumbnail)} />
        </div>

        <h1 className="text-2xl font-bold mb-2">{stream.title}</h1>
        <div className="flex items-center gap-3 mb-4">
          <Link to={`/channel/${stream.owner?.username}`}>
            <img
              src={secureUrl(stream.owner?.avatar)}
              alt={stream.owner?.username}
              className="w-12 h-12 rounded-full"
            />
          </Link>
          <div>
            <p className="font-semibold">{stream.owner?.username}</p>
            <p className="text-sm text-red-500 font-bold">LIVE</p>
          </div>
        </div>
        <div className="bg-gray-800 p-4 rounded-xl">
          <p className="mt-2">{stream.description}</p>
        </div>
      </div>

      <div className="w-full lg:w-96 lg:flex-shrink-0 bg-[#121212] rounded-xl p-4">
        <h2 className="text-xl font-bold mb-4">Live Chat</h2>
        {/* Live Chat component would go here */}
        <div className="h-full flex items-center justify-center text-gray-500">
          <p>Chat is coming soon!</p>
        </div>
      </div>
    </div>
  );
};

export default LiveStreamViewerPage;
