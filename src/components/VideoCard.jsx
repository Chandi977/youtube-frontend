import { Link } from "react-router-dom";
import { format as formatTimeAgo } from "timeago.js";
import { getCloudinarySrcSet, secureUrl } from "../lib/utils";

const VideoCard = ({
  videoId,
  owner, // Pass the whole owner object
  thumbnail,
  channelAvatar,
  title,
  channel,
  views,
  timestamp,
  variant = "default",
}) => {
  // Use owner object if available, otherwise fallback to individual props
  const channelName = owner?.username || channel;
  const avatarUrl = secureUrl(owner?.avatar || channelAvatar);
  const rawThumbnail =
    typeof thumbnail === "string" ? thumbnail : thumbnail?.url;
  const thumbnailUrl = secureUrl(
    rawThumbnail
  );
  const thumbnailSrcSet = getCloudinarySrcSet(rawThumbnail);
  const timeAgo = timestamp ? formatTimeAgo(timestamp) : "";

  if (variant === "horizontal") {
    return (
      <Link to={`/video/${videoId}`}>
        <div className="flex gap-3 cursor-pointer items-start">
          <div className="w-40 flex-shrink-0 relative aspect-video">
            <img
              src={thumbnailUrl}
              srcSet={thumbnailSrcSet}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              loading="lazy"
              decoding="async"
              alt={title || ""}
              className="absolute top-0 left-0 w-full h-full object-cover rounded-lg"
            />
          </div>
          <div>
            <h3 className="font-semibold text-sm leading-snug text-white line-clamp-2">
              {title}
            </h3>
            <p className="text-gray-400 text-xs mt-1">{channelName}</p>
            <p className="text-gray-400 text-xs">
              {views || 0} views &bull; {timeAgo}
            </p>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/video/${videoId}`} className="flex flex-col h-full">
      <div className="cursor-pointer">
        <div className="relative w-full aspect-video overflow-hidden rounded-xl">
          <img
            src={thumbnailUrl}
            srcSet={thumbnailSrcSet}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading="lazy"
            decoding="async"
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex items-start mt-3 gap-3">
          {avatarUrl && (
            <img
              loading="lazy"
              src={avatarUrl}
              alt={channelName}
              className="w-9 h-9 rounded-full flex-shrink-0"
            />
          )}
          <div>
            <h3 className="font-semibold text-base leading-snug text-white line-clamp-2">
              {title}
            </h3>
            <p className="text-gray-400 text-sm mt-1">{channelName}</p>
            <p className="text-gray-400 text-sm">
              {views || 0} views &bull; {timeAgo}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default VideoCard;
