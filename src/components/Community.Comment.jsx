import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useUser } from "./UserContext";
import {
  getTweetComments,
  addTweetComment,
  updateTweetComment,
  deleteTweetComment,
} from "../lib/api";
import { secureUrl } from "../lib/utils";
import Comment from "./Comment";

const PAGE_SIZE = 10;

const CommunityComment = ({ tweetId }) => {
  const { user, isLoggedIn } = useUser();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchComments = async (currentPage) => {
    setLoading(true);
    try {
      const response = await getTweetComments(tweetId, {
        page: currentPage,
        limit: PAGE_SIZE,
      });
      const fetchedComments = response.data?.data;

      if (Array.isArray(fetchedComments)) {
        setComments((prev) =>
          currentPage === 1 ? fetchedComments : [...prev, ...fetchedComments]
        );
        setHasMore(fetchedComments.length === PAGE_SIZE);
        setPage(currentPage);
      } else {
        setComments((prev) => (currentPage === 1 ? [] : prev));
        setHasMore(false);
      }
    } catch (error) {
      toast.error("Could not load comments.");
      console.error("Failed to fetch comments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!tweetId) return;
    setPage(1);
    fetchComments(1); // Fetch first page on tweetId change
  }, [tweetId]);

  const handleAddComment = async (content, parentId = null) => {
    if (!content.trim() || !isLoggedIn) {
      if (!isLoggedIn) toast.error("You must be logged in to comment.");
      return;
    }

    try {
      const response = await addTweetComment(tweetId, {
        content,
        parentId,
      });
      // The backend returns the full, updated list of nested comments.
      // We can just replace our local state with this new list.
      const updatedComments = response.data?.data;
      setComments(Array.isArray(updatedComments) ? updatedComments : []);
      setNewComment("");
      toast.success(parentId ? "Reply posted!" : "Comment posted!");
    } catch (error) {
      console.error("Failed to post comment:", error);
      toast.error(error.response?.data?.message || "Failed to post comment.");
    }
  };

  const handleUpdateComment = async (commentId, newContent) => {
    try {
      await updateTweetComment(commentId, { content: newContent });
      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId ? { ...c, content: newContent } : c
        )
      );
      toast.success("Comment updated.");
    } catch (error) {
      console.error("Failed to update comment:", error);
      toast.error("Failed to update comment.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteTweetComment(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      toast.success("Comment deleted.");
    } catch (error) {
      console.error("Failed to delete comment:", error);
      toast.error("Failed to delete comment.");
    }
  };

  return (
    <div className="mt-4 border-t border-gray-700 pt-4">
      <h3 className="text-lg font-semibold mb-4">{comments.length} Comments</h3>
      {isLoggedIn && (
        <div className="flex gap-4 mb-6 items-start">
          <img
            src={secureUrl(user.avatar)}
            alt="Your avatar"
            className="w-10 h-10 rounded-full"
          />
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-grow bg-transparent border-b border-gray-600 focus:border-white outline-none pb-2"
          />
          <button
            onClick={() => handleAddComment(newComment)}
            className="px-4 py-2 bg-blue-600 rounded-full font-semibold hover:bg-blue-700 disabled:bg-gray-600"
            disabled={!newComment.trim()}
          >
            Post
          </button>
        </div>
      )}
      <div className="space-y-6">
        {loading && <p>Loading comments...</p>}
        {!loading && comments.length === 0 && (
          <p className="text-gray-400">
            No comments yet. Be the first to comment!
          </p>
        )}
        {!loading && Array.isArray(comments)
          ? comments.map((comment) => (
              <Comment
                key={comment._id}
                id={comment._id}
                commentOwnerId={comment.owner?._id}
                author={comment.owner?.username}
                avatar={comment.owner?.avatar}
                timestamp={comment.createdAt}
                text={comment.content}
                likes={comment.likesCount}
                isLiked={comment.isLiked}
                onPostComment={handleAddComment}
                onUpdateComment={handleUpdateComment}
                onDeleteComment={handleDeleteComment}
              />
            ))
          : null}
      </div>
      {hasMore && !loading && (
        <button
          onClick={() => {
            const nextPage = page + 1;
            fetchComments(nextPage);
          }}
          className="text-blue-500 hover:underline mt-4"
        >
          Load More Comments
        </button>
      )}
    </div>
  );
};

export default CommunityComment;
