import axios from "axios";
import { toast } from "react-toastify";

export const client = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || "http://localhost:8000/api/v1",
  withCredentials: true,
});

// Add request interceptor for debugging
client.interceptors.request.use(
  (config) => {
    console.log("Request:", config.url); // Debug log
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const timeSince = (timestamp) => {
  const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) return interval + " years";

  interval = Math.floor(seconds / 2592000);
  if (interval > 1) return interval + " months";

  interval = Math.floor(seconds / 86400);
  if (interval > 1) return interval + " days";

  interval = Math.floor(seconds / 3600);
  if (interval > 1) return interval + " hours";

  interval = Math.floor(seconds / 60);
  if (interval > 1) return interval + " minutes";

  return Math.floor(seconds) + " seconds";
};

export const upload = async (formData) => {
  try {
    const response = await client.post("/videos/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        console.log("Upload progress:", percentCompleted);
      },
    });
    return response.data;
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};

export const authenticate = async (type, data) => {
  try {
    // Call client() directly
    const res = await client(`${process.env.REACT_APP_BE}/users/${type}`, {
      method: "POST",
      body: data,
    });

    // Backend response structure
    const { data: resData } = res; // resData = { user, accessToken, refreshToken }

    const { user, accessToken, refreshToken } = resData;

    // Save user + tokens in localStorage
    localStorage.setItem(
      "user",
      JSON.stringify({ ...user, accessToken, refreshToken })
    );

    return { ...user, accessToken, refreshToken };
  } catch (err) {
    console.error("Authenticate error:", err);
    toast.error(err.message || "Authentication failed");
    throw err;
  }
};

export const removeChannelLocalSt = (channelId) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return;

  const updated = {
    ...user,
    channels: user.channels.filter((channel) => channel.id !== channelId),
  };

  localStorage.setItem("user", JSON.stringify(updated));
};

export const addChannelLocalSt = (channel) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return;

  const updated = {
    ...user,
    channels: [channel, ...user.channels],
  };

  localStorage.setItem("user", JSON.stringify(updated));
};

export const updateUserLocalSt = (data) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return;

  const updatedUser = { ...user, ...data };
  localStorage.setItem("user", JSON.stringify(updatedUser));
};
