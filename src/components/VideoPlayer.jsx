import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Hls from "hls.js";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipForward,
  SkipBack,
  Settings,
  ChevronLeft,
  Check,
} from "lucide-react";

const LAZY_LOAD_OFFSET = "200px";

const VideoPlayer = ({ src, poster, onNext, onPrevious, onPlay }) => {
  const videoRef = useRef(null);
  const playerContainerRef = useRef(null);
  const hlsRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsMenu, setSettingsMenu] = useState("main"); // 'main', 'quality', 'speed'

  const [qualities, setQualities] = useState([]);
  const [currentQuality, setCurrentQuality] = useState(-1); // -1 for auto
  const [playingQuality, setPlayingQuality] = useState(-1);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isSwitchingQuality, setIsSwitchingQuality] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hlsError, setHlsError] = useState(false);

  // Lazy load observer
  const onIntersection = useCallback((entries) => {
    const [entry] = entries;
    if (entry.isIntersecting) setShouldLoad(true);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(onIntersection, {
      rootMargin: LAZY_LOAD_OFFSET,
    });
    const currentRef = playerContainerRef.current;
    if (currentRef) observer.observe(currentRef);
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [onIntersection]);

  // HLS setup
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldLoad || !src) return;

    let blobUrl = null;

    const setupHls = (sourceUrl) => {
      if (Hls.isSupported()) {
        const hls = new Hls({ capLevelToPlayerSize: true });
        hlsRef.current = hls;
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.ERROR, (_, data) => {
          console.error("HLS.js Error:", data);
          if (!data?.fatal) return;
          setHlsError(true);
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
              video.src = sourceUrl;
            }
          }
        });

        hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
          const allLevels = data.levels.map((level, index) => ({
            index,
            height: level.height || 0,
            name: level.name || `${Math.round(level.bitrate / 1000)} kbps`,
          }));
          setQualities(allLevels);
          setCurrentQuality(-1);
          hls.currentLevel = -1; // start in auto
          setPlayingQuality(hls.currentLevel);
        });

        hls.on(Hls.Events.LEVEL_SWITCHING, () => setIsSwitchingQuality(true));
        hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
          setPlayingQuality(data.level);
          setIsSwitchingQuality(false);
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      }
    };

    if (typeof src === "object" && src.masterPlaylist) {
      const blob = new Blob([src.masterPlaylist], {
        type: "application/vnd.apple.mpegurl",
      });
      blobUrl = URL.createObjectURL(blob);
      setupHls(blobUrl);
    } else if (typeof src === "string") {
      if (src.endsWith(".m3u8")) setupHls(src);
      else video.src = src || "";
    } else {
      video.src = "";
    }

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => setIsBuffering(false);
    const handleCanPlay = () => setIsBuffering(false);
    const handleSeeking = () => setIsBuffering(true);

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("durationchange", handleDurationChange);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("seeking", handleSeeking);
    if (onPlay) video.addEventListener("play", onPlay);

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("durationchange", handleDurationChange);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("seeking", handleSeeking);
      if (onPlay) video.removeEventListener("play", onPlay);
    };
  }, [src, onPlay, shouldLoad]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;
      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlayPause();
          break;
        case "m":
          toggleMute();
          break;
        case "f":
          toggleFullScreen();
          break;
        case "arrowright":
          videoRef.current.currentTime += 5;
          break;
        case "arrowleft":
          videoRef.current.currentTime -= 5;
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Controls
  const togglePlayPause = () => {
    const video = videoRef.current;
    if (video.paused) video.play();
    else video.pause();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleVolumeChange = (e) => {
    const video = videoRef.current;
    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
    if (newVolume > 0) setIsMuted(false);
  };

  const handleSpeedChange = (rate) => {
    const video = videoRef.current;
    video.playbackRate = rate;
    setPlaybackRate(rate);
    setSettingsMenu("main");
  };

  const handleQualityChange = (levelIndex) => {
    if (!hlsRef.current) return;

    if (levelIndex === -1) {
      // Auto
      hlsRef.current.currentLevel = -1;
    } else {
      hlsRef.current.currentLevel = levelIndex; // Immediate switch to chosen quality
    }

    setCurrentQuality(levelIndex);
    setSettingsMenu("main");
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const currentQualityLabel = useMemo(() => {
    if (currentQuality === -1) {
      const level = qualities.find((q) => q.index === playingQuality);
      if (level)
        return `Auto (${level.height > 0 ? `${level.height}p` : level.name})`;
      return "Auto";
    }
    const level = qualities.find((q) => q.index === currentQuality);
    return level
      ? level.height > 0
        ? `${level.height}p`
        : level.name
      : "Auto";
  }, [currentQuality, playingQuality, qualities]);

  const sortedQualities = useMemo(
    () => [...qualities].sort((a, b) => b.height - a.height),
    [qualities]
  );

  return (
    <div
      ref={playerContainerRef}
      className="relative w-full aspect-video bg-black group"
      onMouseMove={() => {
        setShowControls(true);
        clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(
          () => setShowControls(false),
          3000
        );
      }}
      onMouseLeave={() => clearTimeout(controlsTimeoutRef.current)}
    >
      <video
        ref={videoRef}
        className="w-full h-full"
        poster={poster}
        onClick={togglePlayPause}
        playsInline
        preload="metadata"
      />

      {/* Loading Spinner */}
      {(isSwitchingQuality || isBuffering) && (
        <div className="absolute inset-0 bg-black/50 flex justify-center items-center z-10">
          <div className="flex flex-col items-center gap-2 text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            <span className="text-sm">
              {isSwitchingQuality ? "Switching quality..." : "Buffering..."}
            </span>
          </div>
        </div>
      )}

      {hlsError && (
        <div className="absolute top-3 left-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
          Stream recovered after an HLS error
        </div>
      )}

      {/* Controls Overlay */}
      <div
        className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${
          showControls || !isPlaying ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
          {/* Timeline */}
          <input
            type="range"
            min="0"
            max={duration}
            value={currentTime}
            onChange={(e) => (videoRef.current.currentTime = e.target.value)}
            className="w-full h-1 accent-blue-500 cursor-pointer"
          />

          {/* Bottom Controls */}
          <div className="flex items-center justify-between mt-1 md:mt-2">
            <div className="flex items-center gap-2 md:gap-4">
              <button onClick={onPrevious} className="text-white">
                <SkipBack size={20} />
              </button>
              <button onClick={togglePlayPause} className="text-white">
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>
              <button onClick={onNext} className="text-white">
                <SkipForward size={20} />
              </button>

              <div className="flex items-center gap-1 md:gap-2">
                <button onClick={toggleMute}>
                  {isMuted || volume === 0 ? <VolumeX /> : <Volume2 />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-12 md:w-20 h-1 accent-blue-500"
                />
              </div>

              <span className="text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-1 md:gap-2">
              <div className="relative">
                <button
                  onClick={() => {
                    setShowSettings(!showSettings);
                    setSettingsMenu("main");
                  }}
                  title="Settings"
                >
                  <Settings size={20} />
                </button>

                {showSettings && (
                  <div className="absolute bottom-full right-0 mb-2 bg-black/80 backdrop-blur-sm rounded-md p-2 w-56 max-h-60 overflow-y-auto">
                    {/* Main Settings */}
                    {settingsMenu === "main" && (
                      <div>
                        {qualities.length > 0 && (
                          <button
                            onClick={() => setSettingsMenu("quality")}
                            className="w-full flex justify-between items-center p-2 hover:bg-gray-700 rounded"
                          >
                            <span>Quality</span>
                            <span className="text-gray-400">
                              {currentQualityLabel} &gt;
                            </span>
                          </button>
                        )}
                        <button
                          onClick={() => setSettingsMenu("speed")}
                          className="w-full flex justify-between items-center p-2 hover:bg-gray-700 rounded"
                        >
                          <span>Playback speed</span>
                          <span className="text-gray-400">
                            {playbackRate === 1 ? "Normal" : `${playbackRate}x`}{" "}
                            &gt;
                          </span>
                        </button>
                      </div>
                    )}

                    {/* Quality Menu */}
                    {settingsMenu === "quality" && (
                      <div>
                        <div className="flex items-center">
                          <button
                            onClick={() => setSettingsMenu("main")}
                            className="p-2 hover:bg-gray-700 rounded-full"
                          >
                            <ChevronLeft size={18} />
                          </button>
                          <h4 className="text-sm font-semibold ml-2">
                            Quality
                          </h4>
                        </div>
                        <div className="border-t border-gray-600 my-1"></div>
                        <button
                          onClick={() => handleQualityChange(-1)}
                          className={`w-full text-sm p-2 rounded hover:bg-gray-700 flex justify-between items-center ${
                            currentQuality === -1 ? "text-blue-400" : ""
                          }`}
                        >
                          <span>Auto</span>
                          {currentQuality === -1 && <Check size={16} />}
                        </button>
                        {sortedQualities.map((level) => (
                          <button
                            key={level.index}
                            onClick={() => handleQualityChange(level.index)}
                            className={`w-full text-left text-sm p-2 rounded hover:bg-gray-700 flex justify-between items-center ${
                              currentQuality === level.index
                                ? "text-blue-400"
                                : ""
                            }`}
                          >
                            <span className="flex-1 text-left">
                              {level.height > 0
                                ? `${level.height}p`
                                : level.name}
                            </span>
                            {currentQuality === level.index && (
                              <Check size={16} />
                            )}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Speed Menu */}
                    {settingsMenu === "speed" && (
                      <div>
                        <div className="flex items-center">
                          <button
                            onClick={() => setSettingsMenu("main")}
                            className="p-2 hover:bg-gray-700 rounded-full"
                          >
                            <ChevronLeft size={18} />
                          </button>
                          <h4 className="text-sm font-semibold ml-2">
                            Playback Speed
                          </h4>
                        </div>
                        <div className="border-t border-gray-600 my-1"></div>
                        {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(
                          (rate) => (
                            <button
                              key={rate}
                              onClick={() => handleSpeedChange(rate)}
                              className={`w-full text-left text-sm p-2 rounded hover:bg-gray-700 flex justify-between items-center ${
                                playbackRate === rate ? "text-blue-400" : ""
                              }`}
                            >
                              <span>{rate}x</span>
                              {playbackRate === rate && <Check size={16} />}
                            </button>
                          )
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button onClick={toggleFullScreen}>
                {isFullScreen ? <Minimize /> : <Maximize />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
