// Comments.jsx
import { useState, useMemo, useEffect } from "react";
import toast from "react-hot-toast";
import Comment from "./Comment";
import { User } from "lucide-react";
import { Virtuoso } from "react-virtuoso";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment,
} from "../lib/api";
import { useUser } from "./UserContext";
import { useScrollContainer } from "../contexts/ScrollContainerContext";
import { CommentSkeleton } from "./Skeletons";

const PAGE_SIZE = 10;

const Comments = ({ videoId, videoOwnerId }) => {
  const { user, isLoggedIn } = useUser();
  const [newComment, setNewComment] = useState("");
  const scrollRef = useScrollContainer();
  const [scrollParent, setScrollParent] = useState(null);

  useEffect(() => {
    if (scrollRef?.current) {
      setScrollParent(scrollRef.current);
    }
  }, [scrollRef]);

  // Helper to normalize API responses
  const normalizeComments = (data) => {
    if (!data) return [];
    return Array.isArray(data) ? data : [data];
  };

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["comments", videoId],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await getVideoComments(videoId, {
        page: pageParam,
        limit: PAGE_SIZE,
      });
      const rawData = response?.data?.data || [];
      return normalizeComments(rawData).map((c) => ({
        ...c,
        owner:
          c.owner && typeof c.owner === "object"
            ? c.owner
            : { username: "Unknown", avatar: null },
      }));
    },
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.length + 1 : undefined,
    enabled: !!videoId,
  });

  const comments = useMemo(
    () => (data?.pages ? data.pages.flat() : []),
    [data]
  );
  const totalComments = comments.length;

  const onPostComment = async (text, parentCommentId = null) => {
    if (!isLoggedIn) {
      toast.error("You must be logged in to comment.");
      return;
    }
    if (!text.trim()) return;

    try {
      const payload = { content: text, video: videoId };
      if (parentCommentId) payload.parentId = parentCommentId;

      await addComment(payload, { page: 1, limit: PAGE_SIZE });
      await refetch();

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
      await refetch();
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
      await refetch();
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
        {isLoading && (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <CommentSkeleton key={idx} />
            ))}
          </div>
        )}
        {!isLoading && comments.length === 0 && (
          <p className="text-gray-400 text-center py-4">
            No comments yet. Be the first to comment!
          </p>
        )}
        {comments.length > 0 && (
          <Virtuoso
            data={comments}
            customScrollParent={scrollParent || undefined}
            increaseViewportBy={200}
            endReached={() => {
              if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            }}
            itemContent={(_, comment) => (
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
            )}
          />
        )}
        {isFetchingNextPage && (
          <p className="text-center">Loading more comments...</p>
        )}
      </div>
    </div>
  );
};

export default Comments;
