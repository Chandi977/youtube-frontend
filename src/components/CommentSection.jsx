// components/CommentSection.jsx
import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  MoreVertical,
  Edit,
  Trash2,
  Flag,
  Reply,
} from "lucide-react";
import { useAuthStore } from "../store";
import { commentAPI } from "../lib/api";
import toast from "react-hot-toast";

const CommentSection = ({ videoId }) => {
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const commentInputRef = useRef(null);

  // Fetch comments
  const {
    data: commentsData,
    isLoading,
    error,
  } = useQuery(
    ["comments", videoId],
    () => commentAPI.getVideoComments(videoId, { limit: 50 }),
    { enabled: !!videoId }
  );  

  // Add comment mutation
  const addCommentMutation = useMutation(
    (content) => commentAPI.addComment(videoId, content),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["comments", videoId]);
        setNewComment("");
        setShowCommentBox(false);
        toast.success("Comment added successfully");
      },
      onError: () => {
        toast.error("Failed to add comment");
      },
    }
  );

  // Delete comment mutation
  const deleteCommentMutation = useMutation(
    (commentId) => commentAPI.deleteComment(commentId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["comments", videoId]);
        toast.success("Comment deleted");
      },
      onError: () => {
        toast.error("Failed to delete comment");
      },
    }
  );

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please sign in to comment");
      return;
    }
    if (!newComment.trim()) return;
    addCommentMutation.mutate(newComment.trim());
  };

  const handleDeleteComment = (commentId) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      deleteCommentMutation.mutate(commentId);
    }
  };

  const comments = commentsData?.data.data || [];
  const commentCount = comments.length;

  return (
    <div className="space-y-6">
      {/* Comments Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {commentCount} Comments
          </h3>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent border-none text-sm text-gray-600 dark:text-gray-400 focus:outline-none cursor-pointer"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="top">Top comments</option>
          </select>
        </div>
      </div>

      {/* Add Comment */}
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
            {isAuthenticated && user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.fullName || "You"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-gray-500" />
              </div>
            )}
          </div>

          <div className="flex-1">
            <form onSubmit={handleSubmitComment} className="space-y-3">
              <div className="relative">
                <textarea
                  ref={commentInputRef}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onFocus={() => setShowCommentBox(true)}
                  placeholder={
                    isAuthenticated
                      ? "Add a public comment..."
                      : "Sign in to add a comment"
                  }
                  disabled={!isAuthenticated}
                  rows={showCommentBox ? 3 : 1}
                  className="w-full px-0 py-2 border-0 border-b-2 border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-red-500 dark:focus:border-red-400 focus:outline-none resize-none transition-all"
                />
              </div>

              <AnimatePresence>
                {showCommentBox && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex justify-end space-x-2"
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => {
                        setShowCommentBox(false);
                        setNewComment("");
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    >
                      Cancel
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={
                        !newComment.trim() || addCommentMutation.isLoading
                      }
                      className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-full hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {addCommentMutation.isLoading ? "Posting..." : "Comment"}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading ? (
          [...Array(5)].map((_, index) => <CommentSkeleton key={index} />)
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              Failed to load comments. Please try again.
            </p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No comments yet
            </p>
            <p className="text-gray-400 dark:text-gray-500">
              Be the first to share what you think!
            </p>
          </div>
        ) : (
          comments.map((comment, index) => (
            <Comment
              key={comment._id}
              comment={comment}
              currentUser={user}
              onDelete={handleDeleteComment}
              index={index}
            />
          ))
        )}
      </div>
    </div>
  );
};

// Individual Comment Component
const Comment = ({ comment, currentUser, onDelete, index }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");

  const isOwner = currentUser?._id === comment.owner?._id;

  const commentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        delay: index * 0.1,
      },
    },
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setIsDisliked(false);
  };

  const handleDislike = () => {
    setIsDisliked(!isDisliked);
    setIsLiked(false);
  };

  return (
    <motion.div
      variants={commentVariants}
      initial="hidden"
      animate="visible"
      className="flex items-start space-x-3"
    >
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
        <img
          src={
            comment.owner?.avatar ||
            `https://ui-avatars.com/api/?name=${
              comment.owner?.fullName || "User"
            }&size=40`
          }
          alt={comment.owner?.fullName || "User"}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Comment Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          <span className="font-semibold text-sm text-gray-900 dark:text-white">
            {comment.owner?.fullName || "User"}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>

        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 break-words">
          {comment.content}
        </p>

        {/* Comment Actions */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleLike}
              className={`p-1 rounded-full transition-colors ${
                isLiked ? "text-blue-600" : "text-gray-500 hover:text-blue-600"
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
            </motion.button>
            <span className="text-xs text-gray-500">{isLiked ? 1 : 0}</span>
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleDislike}
            className={`p-1 rounded-full transition-colors ${
              isDisliked ? "text-red-600" : "text-gray-500 hover:text-red-600"
            }`}
          >
            <ThumbsDown className="w-4 h-4" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowReplyBox(!showReplyBox)}
            className="text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-2 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            REPLY
          </motion.button>

          {/* More Menu */}
          <div className="relative ml-auto">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-full text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </motion.button>

            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 min-w-[150px] z-50"
                >
                  {isOwner && (
                    <>
                      <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2">
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => {
                          onDelete(comment._id);
                          setShowMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2 text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </>
                  )}
                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2">
                    <Flag className="w-4 h-4" />
                    <span>Report</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Reply Box */}
        <AnimatePresence>
          {showReplyBox && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 ml-0"
            >
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                  <img
                    src={
                      currentUser?.avatar ||
                      `https://ui-avatars.com/api/?name=You&size=32`
                    }
                    alt={currentUser?.fullName || "You"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Add a reply..."
                    rows={2}
                    className="w-full px-0 py-2 border-0 border-b-2 border-gray-300 dark:border-gray-600 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-red-500 dark:focus:border-red-400 focus:outline-none resize-none"
                  />
                  <div className="flex justify-end space-x-2 mt-2">
                    <button
                      onClick={() => {
                        setShowReplyBox(false);
                        setReplyText("");
                      }}
                      className="px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={!replyText.trim()}
                      className="px-3 py-1 text-xs font-medium bg-red-600 text-white rounded-full hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// Comment Skeleton
const CommentSkeleton = () => (
  <div className="flex items-start space-x-3 animate-pulse">
    <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex-shrink-0"></div>
    <div className="flex-1 space-y-2">
      <div className="flex items-center space-x-2">
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
      </div>
      <div className="space-y-1">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
      </div>
    </div>
  </div>
);

export default CommentSection;
