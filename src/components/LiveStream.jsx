// components/LiveStream.jsx
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Settings,
  Maximize,
  Users,
  Send,
  Heart,
  Share,
  MoreVertical,
} from "lucide-react";
import { useLiveStreamStore } from "../store";
import io from "socket.io-client";

const LiveStream = ({ streamId, isStreamer = false }) => {
  const {
    isStreaming,
    viewers,
    chatMessages,
    streamQuality,
    setViewers,
    addChatMessage,
    setStreamQuality,
  } = useLiveStreamStore();

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [showChat, setShowChat] = useState(true);
  const [chatMessage, setChatMessage] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  const videoRef = useRef(null);
  const chatContainerRef = useRef(null);
  const socketRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  // Initialize socket connection for live features
  useEffect(() => {
    if (streamId) {
      socketRef.current = io(
        process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8000"
      );

      socketRef.current.emit("join-stream", streamId);

      socketRef.current.on("viewer-count", setViewers);
      socketRef.current.on("chat-message", addChatMessage);
      socketRef.current.on("stream-ended", () => {
        // Handle stream end
        setIsPlaying(false);
      });

      return () => {
        socketRef.current?.disconnect();
      };
    }
  }, [streamId, setViewers, addChatMessage]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Hide controls after inactivity
  const resetControlsTimeout = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (chatMessage.trim() && socketRef.current) {
      const messageData = {
        streamId,
        message: chatMessage.trim(),
        timestamp: Date.now(),
      };

      socketRef.current.emit("chat-message", messageData);
      setChatMessage("");
    }
  };

  const qualityOptions = ["1080p", "720p", "480p", "360p", "240p"];

  return (
    <div className="flex h-screen bg-black">
      {/* Video Player */}
      <div className="flex-1 relative">
        {/* Video Element - This would be replaced with actual stream */}
        <div
          className="w-full h-full bg-gray-900 flex items-center justify-center relative cursor-pointer"
          onMouseMove={resetControlsTimeout}
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {/* Live Stream Video Placeholder */}
          <div className="text-white text-center">
            <div className="w-20 h-20 border-4 border-red-500 rounded-full flex items-center justify-center mb-4 mx-auto">
              <div className="w-8 h-8 bg-red-500 rounded-full animate-pulse"></div>
            </div>
            <h3 className="text-xl font-bold mb-2">LIVE STREAM</h3>
            <p className="text-gray-400">Stream content would appear here</p>
          </div>

          {/* Live indicator */}
          <div className="absolute top-4 left-4">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="bg-red-600 text-white px-3 py-1 rounded text-sm font-bold flex items-center space-x-2"
            >
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span>LIVE</span>
            </motion.div>
          </div>

          {/* Viewer count */}
          <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{viewers.toLocaleString()}</span>
          </div>

          {/* Video Controls */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Play/Pause */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsPlaying(!isPlaying);
                      }}
                      className="text-white hover:text-red-500 transition-colors"
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6" />
                      ) : (
                        <Play className="w-6 h-6" />
                      )}
                    </motion.button>

                    {/* Volume */}
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsMuted(!isMuted);
                        }}
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
                        onChange={(e) => {
                          setVolume(parseFloat(e.target.value));
                          setIsMuted(parseFloat(e.target.value) === 0);
                        }}
                        className="w-20 accent-red-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {/* Settings */}
                    <div className="relative">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowSettings(!showSettings);
                        }}
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
                            <p className="mb-2 font-medium">Quality</p>
                            {qualityOptions.map((quality) => (
                              <button
                                key={quality}
                                onClick={() => setStreamQuality(quality)}
                                className={`block w-full text-left px-2 py-1 rounded hover:bg-gray-700 ${
                                  streamQuality === quality
                                    ? "text-red-500"
                                    : ""
                                }`}
                              >
                                {quality}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle fullscreen
                      }}
                      className="text-white hover:text-red-500 transition-colors"
                    >
                      <Maximize className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Chat Sidebar */}
      {showChat && (
        <motion.div
          initial={{ x: 300 }}
          animate={{ x: 0 }}
          exit={{ x: 300 }}
          className="w-80 bg-gray-900 border-l border-gray-700 flex flex-col"
        >
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">Live Chat</h3>
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-gray-400 hover:text-white"
                >
                  <Heart className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-gray-400 hover:text-white"
                >
                  <Share className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowChat(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <MoreVertical className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-3"
          >
            {chatMessages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm"
              >
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 bg-gray-600 rounded-full flex-shrink-0"></div>
                  <div className="flex-1">
                    <span className="text-gray-300 font-medium">
                      {message.username}
                    </span>
                    <p className="text-white mt-1">{message.message}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Chat Input */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t border-gray-700"
          >
            <div className="flex space-x-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Say something..."
                className="flex-1 bg-gray-800 text-white px-3 py-2 rounded-full border border-gray-600 focus:outline-none focus:border-red-500"
                maxLength={200}
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                type="submit"
                disabled={!chatMessage.trim()}
                className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </motion.button>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  );
};

export default LiveStream;
