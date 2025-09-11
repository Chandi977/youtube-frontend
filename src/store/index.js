// store/index.js
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

// Auth Store
export const useAuthStore = create(
  devtools(
    persist(
      (set) => ({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        setUser: (user) => set({ user, isAuthenticated: !!user }),
        setLoading: (isLoading) => set({ isLoading }),
        logout: () => set({ user: null, isAuthenticated: false }),
      }),
      {
        name: "auth-storage",
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    {
      name: "auth-store",
    }
  )
);

// Video Store
export const useVideoStore = create(
  devtools(
    persist(
      (set, get) => ({
        videos: [],
        currentVideo: null,
        isPlaying: false,
        volume: 1,
        playbackRate: 1,
        currentTime: 0,
        duration: 0,
        isFullscreen: false,
        isMuted: false,
        autoplay: true,
        setVideos: (videos) => set({ videos }),
        setCurrentVideo: (currentVideo) => set({ currentVideo }),
        setIsPlaying: (isPlaying) => set({ isPlaying }),
        setVolume: (volume) => set({ volume, isMuted: volume === 0 }),
        setPlaybackRate: (playbackRate) => set({ playbackRate }),
        setCurrentTime: (currentTime) => set({ currentTime }),
        setDuration: (duration) => set({ duration }),
        setFullscreen: (isFullscreen) => set({ isFullscreen }),
        setMuted: (isMuted) => set({ isMuted }),
        setAutoplay: (autoplay) => set({ autoplay }),
        togglePlayPause: () =>
          set((state) => ({ isPlaying: !state.isPlaying })),
        toggleMute: () =>
          set((state) => ({
            isMuted: !state.isMuted,
            volume: state.isMuted ? state.volume || 0.5 : 0,
          })),
        toggleFullscreen: () =>
          set((state) => ({ isFullscreen: !state.isFullscreen })),
      }),
      {
        name: "video-storage",
        partialize: (state) => ({
          volume: state.volume,
          playbackRate: state.playbackRate,
          autoplay: state.autoplay,
          isMuted: state.isMuted,
        }),
      }
    ),
    {
      name: "video-store",
    }
  )
);

// UI Store
export const useUIStore = create(
  devtools(
    persist(
      (set, get) => ({
        sidebarOpen: true,
        searchQuery: "",
        searchHistory: [],
        notifications: [],
        theme: "light",
        language: "en",
        setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
        toggleSidebar: () =>
          set((state) => ({ sidebarOpen: !state.sidebarOpen })),
        setSearchQuery: (searchQuery) => set({ searchQuery }),
        addToSearchHistory: (query) =>
          set((state) => ({
            searchHistory: [
              query,
              ...state.searchHistory.filter((q) => q !== query),
            ].slice(0, 10),
          })),
        clearSearchHistory: () => set({ searchHistory: [] }),
        addNotification: (notification) =>
          set((state) => ({
            notifications: [
              {
                ...notification,
                id: Math.random().toString(36).substr(2, 9),
                timestamp: Date.now(),
              },
              ...state.notifications,
            ].slice(0, 5),
          })),
        removeNotification: (id) =>
          set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
          })),
        clearNotifications: () => set({ notifications: [] }),
        setTheme: (theme) => set({ theme }),
        setLanguage: (language) => set({ language }),
      }),
      {
        name: "ui-storage",
        partialize: (state) => ({
          theme: state.theme,
          language: state.language,
          searchHistory: state.searchHistory,
          sidebarOpen: state.sidebarOpen,
        }),
      }
    ),
    {
      name: "ui-store",
    }
  )
);

// Playlist Store
export const usePlaylistStore = create(
  devtools(
    (set, get) => ({
      playlists: [],
      currentPlaylist: null,
      isShuffled: false,
      isRepeating: "none", // 'none' | 'one' | 'all'
      currentIndex: 0,
      setPlaylists: (playlists) => set({ playlists }),
      setCurrentPlaylist: (currentPlaylist) =>
        set({ currentPlaylist, currentIndex: 0 }),
      setShuffled: (isShuffled) => set({ isShuffled }),
      setRepeating: (isRepeating) => set({ isRepeating }),
      setCurrentIndex: (currentIndex) => set({ currentIndex }),
      nextVideo: () => {
        const { currentPlaylist, currentIndex, isRepeating } = get();
        if (!currentPlaylist) return;

        const nextIndex = currentIndex + 1;
        if (nextIndex >= currentPlaylist.videos.length) {
          if (isRepeating === "all") {
            set({ currentIndex: 0 });
          }
        } else {
          set({ currentIndex: nextIndex });
        }
      },
      previousVideo: () => {
        const { currentPlaylist, currentIndex } = get();
        if (!currentPlaylist) return;

        const prevIndex = currentIndex - 1;
        if (prevIndex < 0) {
          set({ currentIndex: currentPlaylist.videos.length - 1 });
        } else {
          set({ currentIndex: prevIndex });
        }
      },
      addPlaylist: (playlist) =>
        set((state) => ({
          playlists: [...state.playlists, playlist],
        })),
      removePlaylist: (id) =>
        set((state) => ({
          playlists: state.playlists.filter((p) => p._id !== id),
          currentPlaylist:
            state.currentPlaylist?._id === id ? null : state.currentPlaylist,
        })),
      updatePlaylist: (id, updates) =>
        set((state) => ({
          playlists: state.playlists.map((p) =>
            p._id === id ? { ...p, ...updates } : p
          ),
          currentPlaylist:
            state.currentPlaylist?._id === id
              ? { ...state.currentPlaylist, ...updates }
              : state.currentPlaylist,
        })),
    }),
    {
      name: "playlist-store",
    }
  )
);

// Live Stream Store for future implementation
export const useLiveStreamStore = create(
  devtools(
    (set, get) => ({
      isStreaming: false,
      streamKey: null,
      viewers: 0,
      chatMessages: [],
      streamQuality: "1080p",
      setIsStreaming: (isStreaming) => set({ isStreaming }),
      setStreamKey: (streamKey) => set({ streamKey }),
      setViewers: (viewers) => set({ viewers }),
      addChatMessage: (message) =>
        set((state) => ({
          chatMessages: [
            ...state.chatMessages,
            {
              ...message,
              id: Math.random().toString(36).substr(2, 9),
              timestamp: Date.now(),
            },
          ].slice(-100), // Keep only last 100 messages
        })),
      clearChatMessages: () => set({ chatMessages: [] }),
      setStreamQuality: (streamQuality) => set({ streamQuality }),
    }),
    {
      name: "livestream-store",
    }
  )
);
