// Comment.jsx
import { useState, useEffect, memo } from "react";
import { ThumbsUp, User, MoreVertical, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { format as formatTimeAgo } from "timeago.js";
import toast from "react-hot-toast";
import { toggleCommentLike } from "../lib/api";
import { secureUrl } from "../lib/utils";
import { useUser } from "./UserContext";

const Comment = ({
  id,
  avatar,
  commentOwnerId,
  author,
  timestamp,
  text,
  likes = 0,
  replies = [],
  isLiked: initialIsLiked = false,
  onPostComment,
  onUpdateComment,
  onDeleteComment,
  videoOwnerId,
}) => {
  const { user, isLoggedIn } = useUser();

  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(likes);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);
  const [showActions, setShowActions] = useState(false);

  const formattedTimestamp = timestamp ? formatTimeAgo(timestamp) : "";
  const fullTimestamp = timestamp
    ? format(new Date(timestamp), "d MMMM yyyy 'at' h:mm a")
    : "";

  useEffect(() => {
    setIsLiked(initialIsLiked);
    setLikesCount(likes);
  }, [initialIsLiked, likes]);

  const handleToggleLike = async () => {
    if (!isLoggedIn) return toast.error("Login to like a comment.");

    const original = { isLiked, likesCount };
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);

    try {
      await toggleCommentLike(id);
    } catch (err) {
      setIsLiked(original.isLiked);
      setLikesCount(original.likesCount);
      console.error("Failed to toggle like:", err);
    }
  };

  const handleReplySubmit = () => {
    if (!replyText.trim()) return;
    onPostComment(replyText, id);
    setReplyText("");
    setIsReplying(false);
  };

  const handleUpdateSubmit = () => {
    if (!editText.trim() || editText === text) return setIsEditing(false);
    onUpdateComment(id, editText);
    setIsEditing(false);
  };

  const normalizeComments = (data) => {
    if (!data) return [];
    return Array.isArray(data) ? data : [data];
  };

  return (
    <div className="flex items-start gap-4 text-white">
      {/* Avatar */}
      {avatar ? (
        <img
          src={secureUrl(avatar)}
          alt={author}
          loading="lazy"
          className="w-10 h-10 rounded-full object-cover"
        />
      ) : (
        <User size={40} className="rounded-full bg-gray-700 p-2" />
      )}

      <div className="flex-grow min-w-0 relative">
        {/* Author & Timestamp */}
        <div className="flex items-center gap-2">
          <p
            className={`font-semibold text-sm ${
              commentOwnerId === videoOwnerId
                ? "bg-gray-700 px-2 py-0.5 rounded-md"
                : ""
            }`}
          >
            {author}
          </p>
          <p
            className="text-xs text-gray-400 hover:text-white"
            title={fullTimestamp}
          >
            {formattedTimestamp}
          </p>
        </div>

        {/* Text / Edit */}
        {isEditing ? (
          <div className="mt-2">
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full bg-gray-900 text-white border-b border-gray-600 focus:border-white outline-none pb-1 text-sm"
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 rounded-full text-xs font-semibold hover:bg-gray-800 text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateSubmit}
                className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white"
                disabled={!editText.trim()}
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="mt-1 text-sm text-gray-200">{text}</p>

            <div className="flex items-center gap-4 mt-2">
              <button
                onClick={handleToggleLike}
                className={`flex items-center gap-1 text-gray-400 hover:text-blue-400 ${
                  isLiked ? "text-blue-500" : ""
                }`}
              >
                <ThumbsUp size={16} />
                <span className="text-xs">{likesCount}</span>
              </button>
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="text-xs font-semibold text-gray-400 hover:text-white"
              >
                REPLY
              </button>
            </div>
          </>
        )}

        {/* Reply Input */}
        {isReplying && (
          <div className="flex items-start gap-4 mt-4">
            <User size={24} className="rounded-full mt-1 bg-gray-700 p-1" />
            <div className="flex-grow min-w-0">
              <input
                type="text"
                placeholder={`Reply to ${author}...`}
                className="w-full bg-gray-900 text-white border-b border-gray-600 focus:border-white outline-none pb-1 text-sm"
                autoFocus
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => setIsReplying(false)}
                  className="px-3 py-1 rounded-full text-xs font-semibold hover:bg-gray-800 text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReplySubmit}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white"
                  disabled={!replyText.trim()}
                >
                  Reply
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Actions Menu */}
        {isLoggedIn && user?._id === commentOwnerId && (
          <div className="absolute top-0 right-0">
            <button onClick={() => setShowActions(!showActions)}>
              <MoreVertical size={18} />
            </button>
            {showActions && (
              <div className="absolute right-0 mt-2 w-28 bg-gray-800 rounded-md shadow-lg z-10">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setShowActions(false);
                  }}
                  className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-700"
                >
                  <Edit size={14} /> Edit
                </button>
                <button
                  onClick={() => onDeleteComment(id)}
                  className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        )}

        {/* Replies */}
        {Array.isArray(replies) && replies.length > 0 && (
          <div className="mt-4 flex flex-col gap-4">
            {normalizeComments(replies)
              .filter((r) => r && r._id)
              .map((reply) => (
                <MemoizedComment
                  key={reply._id}
                  id={reply._id}
                  text={reply.content}
                  timestamp={reply.createdAt}
                  commentOwnerId={reply.owner?._id}
                  author={reply.owner?.username || "Unknown"}
                  avatar={reply.owner?.avatar || null}
                  likes={reply.likesCount || 0}
                  isLiked={reply.isLiked}
                  replies={reply.replies || []}
                  onPostComment={onPostComment}
                  onUpdateComment={onUpdateComment}
                  onDeleteComment={onDeleteComment}
                  videoOwnerId={videoOwnerId}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Use memo to prevent unnecessary re-renders
const MemoizedComment = memo(Comment);

export default MemoizedComment;
