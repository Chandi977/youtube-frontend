import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import {
  createTweet,
  getUserTweets,
  deleteTweet,
  toggleTweetLike,
} from "../lib/api";
import { secureUrl } from "../lib/utils";
import { useUser } from "./UserContext";
import {
  ThumbsUp,
  Trash2,
  MessageCircle,
  Share2,
  ImagePlus,
} from "lucide-react";
import CommunityComment from "./Community.Comment.jsx";

const CommunityTab = ({ channel }) => {
  const { user, isLoggedIn } = useUser();
  const [tweets, setTweets] = useState([]);
  const [newTweet, setNewTweet] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [activeCommentSection, setActiveCommentSection] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!channel?._id) {
      setLoading(false);
      return;
    }
    const fetchTweets = async () => {
      try {
        const response = await getUserTweets(channel._id);
        // Ensure each tweet has isLiked and likesCount properties
        const tweetsWithLikes = (response.data.data || []).map((tweet) => ({
          ...tweet,
          isLiked: tweet.isLiked || false,
          likesCount: tweet.likesCount || 0,
        }));
        setTweets(tweetsWithLikes);
      } catch (error) {
        console.error("Failed to fetch tweets", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTweets();
  }, [channel]);

  const handlePostTweet = async () => {
    if (!newTweet.trim() && !imageFile) return;

    try {
      const response = await createTweet({
        content: newTweet.trim(),
        imageFile: imageFile,
      });
      // Manually construct the new tweet object with owner info for immediate UI update
      const newTweetData = {
        ...response.data.data,
        owner: { ...channel },
        likesCount: 0,
        isLiked: false,
        image: response.data.data.image,
      };

      setTweets((prev) => [newTweetData, ...prev]);

      // Reset form
      setNewTweet("");
      setImageFile(null);
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
      }

      toast.success("Post created!");
    } catch (error) {
      toast.error("Failed to create post.");
    }
  };

  const handleDeleteTweet = async (tweetId) => {
    try {
      await deleteTweet(tweetId);
      setTweets((prev) => prev.filter((t) => t._id !== tweetId));
      toast.success("Post deleted.");
    } catch (error) {
      toast.error("Failed to delete post.");
    }
  };

  const handleToggleLike = async (tweetId) => {
    if (!isLoggedIn) {
      return toast.error("You must be logged in to like a post.");
    }

    // Optimistic UI update
    const originalTweets = [...tweets];
    setTweets((prev) =>
      prev.map((t) =>
        t._id === tweetId
          ? {
              ...t,
              isLiked: !t.isLiked,
              likesCount: t.isLiked ? t.likesCount - 1 : t.likesCount + 1,
            }
          : t
      )
    );

    try {
      await toggleTweetLike(tweetId);
    } catch (error) {
      toast.error("Failed to update like status.");
      setTweets(originalTweets); // Revert on failure
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const isOwner = isLoggedIn && user?._id === channel?._id;

  return (
    <div className="space-y-6 text-white">
      {!isLoggedIn && (
        <div className="bg-[#121212] p-4 rounded-lg text-center">
          <p className="mb-4">
            <Link to="/login" className="text-blue-500 hover:underline">
              Log in
            </Link>{" "}
            to create a post and interact with the community.
          </p>
        </div>
      )}

      {isOwner && (
        <div className="bg-[#121212] p-4 rounded-lg">
          <textarea
            value={newTweet}
            onChange={(e) => setNewTweet(e.target.value)}
            placeholder="Create a new post..."
            className="w-full bg-[#0f0f0f] p-2 rounded-md border border-gray-700"
            rows="3"
          />
          {imagePreview && (
            <div className="mt-2 relative w-32 h-32">
              <img
                src={imagePreview}
                alt="Preview"
                className="rounded-lg object-cover w-full h-full"
              />
              <button
                onClick={() => {
                  setImageFile(null);
                  setImagePreview(null);
                }}
                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
          <div className="flex justify-between items-center mt-2">
            <label
              htmlFor="image-upload"
              className="cursor-pointer text-gray-400 hover:text-blue-500"
            >
              <ImagePlus size={22} />
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
            <button
              onClick={handlePostTweet}
              className="px-4 py-2 bg-blue-600 rounded-full font-semibold hover:bg-blue-700 disabled:bg-gray-500"
              disabled={!newTweet.trim() && !imageFile}
            >
              Post
            </button>
          </div>
        </div>
      )}

      {loading && <p className="text-center">Loading posts...</p>}

      {!loading && tweets.length === 0 && (
        <p className="text-center text-gray-400">No posts yet.</p>
      )}

      {tweets.map((tweet) => (
        <div key={tweet._id} className="bg-[#121212] p-4 rounded-lg flex gap-4">
          <img
            src={secureUrl(channel.avatar)}
            alt={channel.username}
            className="w-12 h-12 rounded-full flex-shrink-0"
          />
          <div className="flex-grow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="font-semibold">{channel.fullName}</p>
                <p className="text-sm text-gray-400">
                  @{channel.username} &bull;{" "}
                  {new Date(tweet.createdAt).toLocaleDateString()}
                </p>
              </div>
              {isOwner && (
                <button
                  onClick={() => handleDeleteTweet(tweet._id)}
                  className="p-2 text-gray-400 hover:text-red-500 rounded-full"
                  aria-label="Delete post"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
            <p className="mt-2">{tweet.content}</p>
            {tweet.image && (
              <img
                src={secureUrl(tweet.image.url || tweet.image)}
                alt="Post content"
                className="mt-3 rounded-lg w-full max-w-lg"
              />
            )}
            <div className="flex items-center gap-6 mt-4 text-gray-400">
              <button
                onClick={() => handleToggleLike(tweet._id)}
                className={`flex items-center gap-2 transition-colors ${
                  tweet.isLiked ? "text-red-500" : "hover:text-red-500"
                }`}
              >
                <ThumbsUp size={18} /> <span>{tweet.likesCount}</span>
              </button>
              <button
                onClick={() =>
                  setActiveCommentSection(
                    activeCommentSection === tweet._id ? null : tweet._id
                  )
                }
                className="flex items-center gap-2 hover:text-blue-500"
              >
                <MessageCircle size={18} /> <span>Comment</span>
              </button>
              <button className="flex items-center gap-2 hover:text-green-500">
                <Share2 size={18} /> <span>Share</span>
              </button>
            </div>
            {activeCommentSection === tweet._id && (
              <div className="mt-4">
                <CommunityComment tweetId={tweet._id} />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommunityTab;
