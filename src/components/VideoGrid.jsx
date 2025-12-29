import { useMemo, useEffect, useState, forwardRef } from "react";
import { VirtuosoGrid } from "react-virtuoso";
import { useQuery } from "@tanstack/react-query";
import VideoCard from "./VideoCard";
import { getAllVideos } from "../lib/api";
import { useScrollContainer } from "../contexts/ScrollContainerContext";
import { VideoCardSkeleton } from "./Skeletons";

const VideoGrid = () => {
  const scrollRef = useScrollContainer();
  const [scrollParent, setScrollParent] = useState(null);

  useEffect(() => {
    if (scrollRef?.current) {
      setScrollParent(scrollRef.current);
    }
  }, [scrollRef]);

  const {
    data: videos = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["videos", { limit: 20 }],
    queryFn: async () => {
      const response = await getAllVideos({ limit: 20 });
      return response.data.data.videos || [];
    },
  });

  const gridComponents = useMemo(() => {
    const List = forwardRef(({ style, children, ...props }, ref) => (
      <div
        ref={ref}
        {...props}
        style={style}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
      >
        {children}
      </div>
    ));
    List.displayName = "VideoGridList";

    const Item = forwardRef((props, ref) => (
      <div ref={ref} {...props} className="min-w-0" />
    ));
    Item.displayName = "VideoGridItem";

    return { List, Item };
  }, []);

  if (isLoading)
    return (
      <main className="flex-1 p-4 sm:p-6 bg-[#0f0f0f]">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, idx) => (
            <VideoCardSkeleton key={idx} />
          ))}
        </div>
      </main>
    );
  if (isError)
    return (
      <div className="flex-1 p-6 text-center text-red-500">
        Failed to fetch videos. Make sure your backend is running.
      </div>
    );

  return (
    <main className="flex-1 p-4 sm:p-6 bg-[#0f0f0f]">
      <VirtuosoGrid
        data={videos}
        customScrollParent={scrollParent || undefined}
        components={gridComponents}
        itemContent={(_, video) => (
          <VideoCard
            key={video._id}
            videoId={video._id}
            thumbnail={video.thumbnail}
            channelAvatar={video.owner?.avatar}
            title={video.title}
            channel={video.owner?.username}
            views={video.viewsCount ?? video.views ?? 0}
            timestamp={video.createdAt}
          />
        )}
      />
    </main>
  );
};

export default VideoGrid;
