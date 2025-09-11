// pages/channel/[username].jsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import { motion, AnimatePresence } from 'framer-motion';
import Head from 'next/head';
import { Bell, BellOff, Users, Video, PlayCircle, Info } from 'lucide-react';
import Layout from '../../components/Layout';
import VideoCard from '../../components/VideoCard';
import { authAPI, videoAPI, subscriptionAPI } from '../../lib/api';
import { useAuthStore } from '../../store';
import toast from 'react-hot-toast';

const ChannelPage = () => {
  const router = useRouter();
  const { username } = router.query;
  const { user, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState('videos');
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Fetch channel data
  const {
    data: channelData,
    isLoading: channelLoading,
    error: channelError
  } = useQuery(
    ['channel', username],
    () => authAPI.getUserChannelProfile(username),
    { enabled: !!username }
  );

  // Fetch channel videos
  const {
    data: videosData,
    isLoading: videosLoading
  } = useQuery(
    ['channel-videos', username],
    () => videoAPI.getAllVideos({ userId: channelData?.data.data._id }),
    { enabled: !!channelData?.data.data._id }
  );

  const channel = channelData?.data.data;
  const videos = videosData?.data.data?.docs || [];

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to subscribe');
      return;
    }
    
    try {
      await subscriptionAPI.toggleSubscription(channel._id);
      setIsSubscribed(!isSubscribed);
      toast.success(isSubscribed ? 'Unsubscribed' : 'Subscribed!');
    } catch (error) {
      toast.error('Failed to update subscription');
    }
  };

  const tabs = [
    { id: 'videos', label: 'Videos', icon: Video, count: videos.length },
    { id: 'playlists', label: 'Playlists', icon: PlayCircle, count: 0 },
    { id: 'about', label: 'About', icon: Info, count: null },
  ];

  if (channelLoading) {
    return (
      <Layout>
        <div className="animate-pulse">
          <div className="h-48 bg-gray-300 rounded-lg mb-6"></div>
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-24 h-24 bg-gray-300 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-6 bg-gray-300 rounded w-48"></div>
              <div className="h-4 bg-gray-300 rounded w-32"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (channelError || !channel) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Channel not found
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            This channel doesn't exist or has been removed.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>{channel.fullName} - YouTube Clone</title>
        <meta name="description" content={`${channel.fullName}'s channel on YouTube Clone`} />
      </Head>

      <Layout>
        <div className="space-y-6">
          {/* Channel Banner */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative h-48 md:h-64 rounded-lg overflow-hidden"
          >
            {channel.coverImage ? (
              <img
                src={channel.coverImage}
                alt={`${channel.fullName} cover`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-red-500 to-red-600"></div>
            )}
          </motion.div>

          {/* Channel Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0"
          >
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-white dark:border-gray-800">
                <img
                  src={channel.avatar || '/api/placeholder/96/96'}
                  alt={channel.fullName}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  {channel.fullName}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">@{channel.username}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    Subscribers count
                  </span>
                  <span className="flex items-center">
                    <Video className="w-4 h-4 mr-1" />
                    {videos.length} videos
                  </span>
                </div>
              </div>
            </div>

            {/* Subscribe Button */}
            {user?._id !== channel._id && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubscribe}
                className={`flex items-center space-x-2 px-6 py-3 rounded-full font-semibold transition-colors ${
                  isSubscribed
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {isSubscribed ? (
                  <>
                    <BellOff className="w-4 h-4" />
                    <span>Subscribed</span>
                  </>
                ) : (
                  <>
                    <Bell className="w-4 h-4" />
                    <span>Subscribe</span>
                  </>
                )}
              </motion.button>
            )}
          </motion.div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-600 dark:text-red-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count !== null && (
                    <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'videos' && (
                <div>
                  {videosLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="aspect-video bg-gray-300 rounded-lg mb-2"></div>
                          <div className="h-4 bg-gray-300 rounded mb-1"></div>
                          <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                        </div>
                      ))}
                    </div>
                  ) : videos.length === 0 ? (
                    <div className="text-center py-12">
                      <Video className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No videos yet
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        This channel hasn't uploaded any videos.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {videos.map((video) => (
                        <VideoCard key={video._id} video={video} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'playlists' && (
                <div className="text-center py-12">
                  <PlayCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No playlists yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    This channel hasn't created any playlists.
                  </p>
                </div>
              )}

              {activeTab === 'about' && (
                <div className="max-w-4xl">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Description
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Channel description would go here if available in your backend.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Details
                      </h3>
                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <p>Joined: {new Date(channel.createdAt).toLocaleDateString()}</p>
                        <p>Total views: Calculate from video views</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </Layout>
    </>
  );
};

export default ChannelPage;