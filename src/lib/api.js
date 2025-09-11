// lib/api.js
import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PRODUCTION_API_URL ||
  "http://localhost:8000/api/v1";

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

// Request interceptor to attach access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          const response = await axios.post(
            `${API_BASE_URL}/users/refresh-token`,
            {},
            { headers: { Authorization: `Bearer ${refreshToken}` } }
          );

          const { accessToken } = response.data.data;
          localStorage.setItem("accessToken", accessToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        if (typeof window !== "undefined") window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

// -------------------- AUTH / USER --------------------
export const authAPI = {
  register: (data) =>
    api.post("/users/register", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  login: (data) => api.post("/users/login", data),
  logout: () => api.post("/users/logout"),
  getCurrentUser: async () => {
    try {
      const res = await api.get("/users/me");
      return res.data;
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 404)
        return null;
      throw err;
    }
  },
  refreshToken: () => api.post("/users/refresh-token"),
  updateProfile: (data) =>
    api.patch("/users/update-account", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  changePassword: (data) => api.patch("/users/change-password", data),
  updateAvatar: (file) => {
    const formData = new FormData();
    formData.append("avatar", file);
    return api.patch("/users/update-avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  updateCover: (file) => {
    const formData = new FormData();
    formData.append("coverImage", file);
    return api.patch("/users/update-cover", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  getUserChannelProfile: (username) => api.get(`/users/channel/${username}`),
  getWatchHistory: () => api.get("/users/watch-history"),
  getFeed: () => api.get("/users/feed"),
  recommendedVideos: () => api.get("/users/recommended-videos"),
  recommendChannels: () => api.get("/users/recommended-channels"),
  getLikedVideos: () => api.get("/users/liked-videos"),
  getHistory: () => api.get("/users/history"),
};

// -------------------- VIDEOS --------------------
export const videoAPI = {
  getAllVideos: (params = {}) => api.get("/videos/getvideos", { params }),
  searchVideos: (params = {}) => api.get("/videos/search", { params }),
  getVideoById: (videoId) => api.get(`/videos/${videoId}`),
  getUserVideos: (userId) => api.get(`/videos/user/${userId}`),
  uploadVideo: (data) =>
    api.post("/videos/upload", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateVideo: (videoId, data) => {
    const formData = new FormData();
    if (data.title) formData.append("title", data.title);
    if (data.description) formData.append("description", data.description);
    if (data.thumbnail) formData.append("thumbnail", data.thumbnail);
    return api.patch(`/videos/${videoId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  deleteVideo: (videoId) => api.delete(`/videos/${videoId}`),
  togglePublishStatus: (videoId) =>
    api.patch(`/videos/${videoId}/toggle-publish`),
  recordView: (videoId) => api.post(`/videos/${videoId}/view`),
};

// -------------------- COMMENTS --------------------
export const commentAPI = {
  getVideoComments: (videoId, params = {}) =>
    api.get(`/comments/${videoId}`, { params }),
  addComment: (videoId, content) =>
    api.post(`/comments/${videoId}`, { content }),
  updateComment: (commentId, content) =>
    api.patch(`/comments/c/${commentId}`, { content }),
  deleteComment: (commentId) => api.delete(`/comments/c/${commentId}`),
};

// -------------------- LIKES --------------------
export const likeAPI = {
  toggleVideoLike: (videoId) => api.post(`/likes/toggle/v/${videoId}`),
  toggleCommentLike: (commentId) => api.post(`/likes/toggle/c/${commentId}`),
  toggleTweetLike: (tweetId) => api.post(`/likes/toggle/t/${tweetId}`),
  getLikedVideos: () => api.get("/likes/videos"),
};

// -------------------- SUBSCRIPTIONS --------------------
export const subscriptionAPI = {
  toggleSubscription: (subscriberId) =>
    api.post(`/subscriptions/c/${subscriberId}`),
  getUserChannelSubscribers: (channelId) =>
    api.get(`/subscriptions/u/${channelId}`),
  getSubscribedChannels: (subscriberId) =>
    api.get(`/subscriptions/c/${subscriberId}`),
};

// -------------------- PLAYLISTS --------------------
export const playlistAPI = {
  createPlaylist: (data) => api.post("/playlist", data),
  getPlaylistById: (playlistId) => api.get(`/playlist/${playlistId}`),
  getUserPlaylists: (userId) => api.get(`/playlist/user/${userId}`),
  updatePlaylist: (playlistId, data) =>
    api.patch(`/playlist/${playlistId}`, data),
  deletePlaylist: (playlistId) => api.delete(`/playlist/${playlistId}`),
  addVideoToPlaylist: (playlistId, videoId) =>
    api.patch(`/playlist/add/${videoId}/${playlistId}`),
  removeVideoFromPlaylist: (playlistId, videoId) =>
    api.patch(`/playlist/remove/${videoId}/${playlistId}`),
};

// -------------------- TWEETS --------------------
export const tweetAPI = {
  createTweet: (content) => api.post("/tweets", { content }),
  getUserTweets: (userId) => api.get(`/tweets/user/${userId}`),
  updateTweet: (tweetId, content) =>
    api.patch(`/tweets/${tweetId}`, { content }),
  deleteTweet: (tweetId) => api.delete(`/tweets/${tweetId}`),
};

// -------------------- DASHBOARD --------------------
export const dashboardAPI = {
  getChannelStats: () => api.get("/dashboard/stats"),
  getChannelVideos: () => api.get("/dashboard/videos"),
};

// -------------------- HEALTHCHECK --------------------
export const healthAPI = {
  check: () => api.get("/healthcheck"),
};
