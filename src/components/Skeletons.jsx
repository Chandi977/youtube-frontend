export const VideoCardSkeleton = ({ variant = "default" }) => {
  if (variant === "horizontal") {
    return (
      <div className="flex gap-3 items-start animate-pulse">
        <div className="w-40 aspect-video bg-gray-800 rounded-lg" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-800 rounded w-3/4" />
          <div className="h-3 bg-gray-800 rounded w-1/2" />
          <div className="h-3 bg-gray-800 rounded w-2/5" />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-pulse">
      <div className="w-full aspect-video bg-gray-800 rounded-xl" />
      <div className="flex items-start gap-3 mt-3">
        <div className="w-9 h-9 bg-gray-800 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-800 rounded w-5/6" />
          <div className="h-3 bg-gray-800 rounded w-1/2" />
          <div className="h-3 bg-gray-800 rounded w-2/5" />
        </div>
      </div>
    </div>
  );
};

export const CommentSkeleton = () => (
  <div className="flex items-start gap-4 animate-pulse">
    <div className="w-10 h-10 rounded-full bg-gray-800" />
    <div className="flex-1 space-y-2">
      <div className="h-3 bg-gray-800 rounded w-1/3" />
      <div className="h-4 bg-gray-800 rounded w-4/5" />
      <div className="h-3 bg-gray-800 rounded w-1/4" />
    </div>
  </div>
);
