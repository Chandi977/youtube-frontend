import { useMemo, useEffect, useState, forwardRef } from "react";
import { VirtuosoGrid } from "react-virtuoso";
import { useQuery } from "@tanstack/react-query";
import { getTrendingVideos } from "../lib/api";
import VideoCard from "../components/VideoCard";
import { VideoCardSkeleton } from "../components/Skeletons";
import { useScrollContainer } from "../contexts/ScrollContainerContext";

const TrendingPage = () => {
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
    queryKey: ["videos", "trending"],
    queryFn: async () => {
      const response = await getTrendingVideos();
      return response.data.data || [];
    },
    staleTime: 30 * 1000,
  });

  const gridComponents = useMemo(() => {
    const List = forwardRef(({ style, children, ...props }, ref) => (
      <div
        ref={ref}
        {...props}
        style={style}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
      >
        {children}
      </div>
    ));
    List.displayName = "TrendingGridList";

    const Item = forwardRef((props, ref) => (
      <div ref={ref} {...props} className="min-w-0" />
    ));
    Item.displayName = "TrendingGridItem";

    return { List, Item };
  }, []);

  if (isLoading)
    return (
      <div className="p-6 bg-[#0f0f0f] min-h-[calc(100vh-3.5rem)]">
        <h1 className="text-3xl font-bold mb-6">Trending Videos</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, idx) => (
            <VideoCardSkeleton key={idx} />
          ))}
        </div>
      </div>
    );
  if (isError)
    return <div className="p-6 text-center text-red-500">Failed to fetch trending videos.</div>;

  return (
    <div className="p-6 bg-[#0f0f0f] min-h-[calc(100vh-3.5rem)]">
      <h1 className="text-3xl font-bold mb-6">Trending Videos</h1>
      {videos.length > 0 ? (
        <VirtuosoGrid
          data={videos}
          customScrollParent={scrollParent || undefined}
          components={gridComponents}
          itemContent={(_, video) => (
            <VideoCard
              key={video._id}
              videoId={video._id}
              thumbnail={video.thumbnail}
              title={video.title}
              views={video.viewsCount ?? video.views ?? 0}
              timestamp={video.createdAt}
              channel={video.owner?.username}
              channelAvatar={video.owner?.avatar}
            />
          )}
        />
      ) : (
        <p>No trending videos available right now.</p>
      )}
    </div>
  );
};

export default TrendingPage;
