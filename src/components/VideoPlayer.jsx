// components/VideoPlayer.jsx
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactPlayer from "react-player";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  SkipBack,
  SkipForward,
  Loader,
} from "lucide-react";
import { useVideoStore } from "../store";

const VideoPlayer = ({
  videoUrl,
  thumbnail,
  onEnded,
  onProgress,
  className = "",
}) => {
  const {
    isPlaying,
    volume,
    playbackRate,
    currentTime,
    duration,
    isFullscreen,
    isMuted,
    setIsPlaying,
    setVolume,
    setPlaybackRate,
    setCurrentTime,
    setDuration,
    setFullscreen,
    setMuted,
    togglePlayPause,
    toggleMute,
    toggleFullscreen,
  } = useVideoStore();

  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [played, setPlayed] = useState(0);
  const [seeking, setSeeking] = useState(false);

  const playerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const containerRef = useRef(null);

  // Auto-hide controls
  const resetControlsTimeout = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT") return;

      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlayPause();
          break;
        case "m":
          toggleMute();
          break;
        case "f":
          toggleFullscreen();
          break;
        case "ArrowLeft":
          e.preventDefault();
          seek(Math.max(0, currentTime - 10));
          break;
        case "ArrowRight":
          e.preventDefault();
          seek(Math.min(duration, currentTime + 10));
          break;
        case "ArrowUp":
          e.preventDefault();
          setVolume(Math.min(1, volume + 0.1));
          break;
        case "ArrowDown":
          e.preventDefault();
          setVolume(Math.max(0, volume - 0.1));
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    currentTime,
    duration,
    volume,
    togglePlayPause,
    toggleMute,
    toggleFullscreen,
  ]);

  const seek = (time) => {
    setCurrentTime(time);
    playerRef.current?.seekTo(time, "seconds");
  };

  const handleProgress = (progress) => {
    if (!seeking) {
      setPlayed(progress.played);
      setCurrentTime(progress.playedSeconds);
    }
    onProgress?.(progress);
  };

  const handleDuration = (duration) => {
    setDuration(duration);
  };

  const handleSeekStart = () => {
    setSeeking(true);
  };

  const handleSeekChange = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    setPlayed(pos);
    setCurrentTime(pos * duration);
  };

  const handleSeekEnd = () => {
    setSeeking(false);
    seek(currentTime);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const playbackRates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  const controlsVariants = {
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: { duration: 0.3 },
    },
  };
  //   console.log(videoUrl.url);

  return (
    <div
      ref={containerRef}
      className={`relative bg-black rounded-lg overflow-hidden ${className} ${
        isFullscreen ? "fixed inset-0 z-50" : ""
      }`}
      onMouseMove={resetControlsTimeout}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video Player */}
      <ReactPlayer
        ref={playerRef}
        url={videoUrl.url}
        playing={isPlaying}
        volume={isMuted ? 0 : volume}
        playbackRate={playbackRate}
        width="100%"
        height="100%"
        onReady={() => setIsLoading(false)}
        onBuffer={() => setIsBuffering(true)}
        onBufferEnd={() => setIsBuffering(false)}
        onProgress={handleProgress}
        onDuration={handleDuration}
        onEnded={onEnded}
        config={{
          youtube: {
            playerVars: { showinfo: 0, controls: 0 },
          },
          file: {
            attributes: {
              poster: thumbnail,
            },
          },
        }}
      />

      {/* Loading Indicator */}
      {(isLoading || isBuffering) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader className="w-12 h-12 text-white" />
          </motion.div>
        </div>
      )}
      {/* Play/Pause Overlay */}
      <div
        className="absolute inset-0 flex items-center justify-center cursor-pointer"
        onClick={togglePlayPause}
      >
        <AnimatePresence>
          {!isPlaying && !isLoading && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="w-20 h-20 bg-black bg-opacity-70 rounded-full flex items-center justify-center"
            >
              <Play className="w-10 h-10 text-white fill-current ml-2" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            variants={controlsVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/70 to-transparent p-4"
          >
            {/* Progress Bar */}
            <div className="mb-4">
              <div
                className="w-full h-1 bg-gray-600 rounded cursor-pointer"
                onMouseDown={handleSeekStart}
                onMouseMove={seeking ? handleSeekChange : undefined}
                onMouseUp={handleSeekEnd}
                onMouseLeave={handleSeekEnd}
              >
                <div
                  className="h-full bg-red-600 rounded relative"
                  style={{ width: `${played * 100}%` }}
                >
                  <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-red-600 rounded-full opacity-0 hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Play/Pause */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={togglePlayPause}
                  className="text-white hover:text-red-500 transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6" />
                  )}
                </motion.button>

                {/* Skip Back */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => seek(Math.max(0, currentTime - 10))}
                  className="text-white hover:text-red-500 transition-colors"
                >
                  <SkipBack className="w-5 h-5" />
                </motion.button>

                {/* Skip Forward */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => seek(Math.min(duration, currentTime + 10))}
                  className="text-white hover:text-red-500 transition-colors"
                >
                  <SkipForward className="w-5 h-5" />
                </motion.button>

                {/* Volume */}
                <div className="flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleMute}
                    className="text-white hover:text-red-500 transition-colors"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </motion.button>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-20 accent-red-500"
                  />
                </div>

                {/* Time */}
                <span className="text-white text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center space-x-4">
                {/* Settings */}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowSettings(!showSettings)}
                    className="text-white hover:text-red-500 transition-colors"
                  >
                    <Settings className="w-5 h-5" />
                  </motion.button>

                  {showSettings && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute bottom-8 right-0 bg-gray-800 rounded-lg p-3 min-w-[150px]"
                    >
                      <div className="text-white text-sm">
                        <p className="mb-2 font-medium">Playback Speed</p>
                        {playbackRates.map((rate) => (
                          <button
                            key={rate}
                            onClick={() => {
                              setPlaybackRate(rate);
                              setShowSettings(false);
                            }}
                            className={`block w-full text-left px-2 py-1 rounded hover:bg-gray-700 ${
                              playbackRate === rate ? "text-red-500" : ""
                            }`}
                          >
                            {rate === 1 ? "Normal" : `${rate}x`}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Fullscreen */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleFullscreen}
                  className="text-white hover:text-red-500 transition-colors"
                >
                  {isFullscreen ? (
                    <Minimize className="w-5 h-5" />
                  ) : (
                    <Maximize className="w-5 h-5" />
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VideoPlayer;
