// Comments.jsx
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import Comment from "./Comment";
import { User } from "lucide-react";
import {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment,
} from "../lib/api";
import { useUser } from "./UserContext";

const PAGE_SIZE = 10;

const Comments = ({ videoId, videoOwnerId }) => {
  const { user, isLoggedIn } = useUser();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [totalComments, setTotalComments] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  // Helper to normalize API responses
  const normalizeComments = (data) => {
    if (!data) return [];
    return Array.isArray(data) ? data : [data];
  };

  const fetchComments = useCallback(
    async (currentPage = 1) => {
      try {
        currentPage === 1 ? setLoading(true) : setLoadingMore(true);

        const response = await getVideoComments(videoId, {
          page: currentPage,
          limit: PAGE_SIZE,
        });

        const rawData = response?.data?.data || [];
        const formatted = normalizeComments(rawData).map((c) => ({
          ...c,
          owner:
            c.owner && typeof c.owner === "object"
              ? c.owner
              : { username: "Unknown", avatar: null },
        }));

        setComments((prev) =>
          currentPage === 1 ? formatted : [...prev, ...formatted]
        );
        const fetchedCount = formatted.length;
        setTotalComments((prev) =>
          currentPage === 1 ? fetchedCount : prev + fetchedCount
        );
        setHasNextPage(fetchedCount === PAGE_SIZE);
      } catch (err) {
        toast.error("Failed to load comments.");
        console.error(err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [videoId]
  );

  useEffect(() => {
    if (!videoId) return;
    setComments([]);
    setPage(1);
    fetchComments(1);
  }, [videoId, fetchComments]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchComments(nextPage);
  };

  const onPostComment = async (text, parentCommentId = null) => {
    if (!isLoggedIn) {
      toast.error("You must be logged in to comment.");
      return;
    }
    if (!text.trim()) return;

    try {
      const payload = { content: text, video: videoId };
      if (parentCommentId) payload.parentId = parentCommentId;

      const response = await addComment(payload, { page, limit: PAGE_SIZE });
      const updatedComments = normalizeComments(response?.data?.data);

      setComments(updatedComments);
      setTotalComments(updatedComments.length);

      toast.success("Comment posted!");
    } catch (err) {
      toast.error("Failed to post comment.");
      console.error(err);
    }
  };

  const onUpdateComment = async (commentId, text) => {
    if (!isLoggedIn) {
      toast.error("You must be logged in to edit a comment.");
      return;
    }
    if (!text.trim()) return;

    try {
      await updateComment(commentId, { updateContent: text });

      // Update comment in state locally
      const updateInComments = (commentsArray) => {
        return commentsArray.map((c) => {
          if (c._id === commentId) {
            return { ...c, content: text };
          }
          if (c.replies && c.replies.length > 0) {
            return { ...c, replies: updateInComments(c.replies) };
          }
          return c;
        });
      };

      setComments((prev) => updateInComments(prev));
      toast.success("Comment updated!");
    } catch (err) {
      toast.error("Failed to update comment.");
      console.error(err);
    }
  };

  const onDeleteComment = async (commentId) => {
    if (!isLoggedIn) {
      toast.error("You must be logged in to delete a comment.");
      return;
    }

    try {
      await deleteComment(commentId);

      // Remove comment from state locally
      const removeInComments = (commentsArray) => {
        return commentsArray
          .filter((c) => c._id !== commentId)
          .map((c) => {
            if (c.replies && c.replies.length > 0) {
              return { ...c, replies: removeInComments(c.replies) };
            }
            return c;
          });
      };

      setComments((prev) => removeInComments(prev));
      setTotalComments((prev) => prev - 1);
      toast.success("Comment deleted!");
    } catch (err) {
      toast.error("Failed to delete comment.");
      console.error(err);
    }
  };

  const handleCommentSubmit = () => {
    onPostComment(newComment, null);
    setNewComment("");
  };

  return (
    <div className="mt-6 text-white">
      <h2 className="text-xl font-bold mb-4">
        {totalComments} {totalComments === 1 ? "Comment" : "Comments"}
      </h2>

      {/* Add Comment Input */}
      <div className="flex items-start gap-4 mb-8">
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt="Your avatar"
            className="w-10 h-10 rounded-full"
          />
        ) : (
          <User size={40} className="rounded-full bg-gray-700 p-2" />
        )}
        <div className="flex-grow">
          <input
            type="text"
            placeholder="Add a comment..."
            className="w-full bg-gray-900 text-white border-b border-gray-600 focus:border-white outline-none pb-2"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          {newComment && (
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setNewComment("")}
                className="px-4 py-2 rounded-full text-sm font-semibold hover:bg-gray-700 text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCommentSubmit}
                className="px-4 py-2 rounded-full text-sm font-semibold bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white"
                disabled={!newComment.trim()}
              >
                Comment
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Comments List */}
      <div className="flex flex-col gap-6">
        {loading && <p className="text-center">Loading comments...</p>}
        {!loading && comments.length === 0 && (
          <p className="text-gray-400 text-center py-4">
            No comments yet. Be the first to comment!
          </p>
        )}
        {comments.map((comment) => (
          <Comment
            key={comment._id}
            id={comment._id}
            commentOwnerId={comment.owner?._id}
            author={comment.owner?.username || "Unknown"}
            avatar={comment.owner?.avatar || null}
            timestamp={comment.createdAt}
            text={comment.content}
            likes={comment.likesCount || 0}
            isLiked={comment.isLiked}
            onPostComment={onPostComment}
            onUpdateComment={onUpdateComment}
            onDeleteComment={onDeleteComment}
            replies={comment.replies || []}
            videoOwnerId={videoOwnerId}
          />
        ))}
        {hasNextPage && !loadingMore && (
          <button
            onClick={handleLoadMore}
            className="w-full mt-4 px-4 py-2 bg-gray-700 rounded-full font-semibold hover:bg-gray-600"
          >
            Load More Comments
          </button>
        )}
        {loadingMore && <p className="text-center">Loading more comments...</p>}
      </div>
    </div>
  );
};

export default Comments;
