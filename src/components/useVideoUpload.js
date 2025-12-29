import { useState, useEffect, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import axios from "axios";
import { publishVideo, cancelVideoUpload, getJobStatus } from "../lib/api";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const SOCKET_URL = API_BASE_URL.replace(/\/$/, "");

export const useVideoUpload = (userId) => {
  const [uploadState, setUploadState] = useState({
    isUploading: false,
    isProcessing: false,
    progress: 0,
    stage: null,
    message: "",
    jobId: null,
    error: null,
    result: null,
    isCancelled: false,
  });

  const socketRef = useRef(null);
  const pollingRef = useRef(null);
  const xhrRef = useRef(null);
  const uploadStateRef = useRef(uploadState);

  useEffect(() => {
    uploadStateRef.current = uploadState;
  }, [uploadState]);

  const cleanupSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  const cleanupPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  // Polling fallback for when socket is disconnected
  const startPolling = useCallback(
    (jobId) => {
      if (pollingRef.current) return; // Already polling
      console.log(`[Polling] Fallback activated for job ${jobId}.`);

      pollingRef.current = setInterval(async () => {
        try {
          const response = await getJobStatus(jobId);
          const jobData = response.data.data;

          setUploadState((prev) => ({
            ...prev,
            progress: jobData.progress,
            stage: jobData.state,
            message: jobData.message,
          }));

          if (['completed', 'failed'].includes(jobData.state)) {
            cleanupPolling();
            if (jobData.state === 'completed') {
              toast.success('Video processed (via polling)!');
              setUploadState((prev) => ({ ...prev, result: jobData.result }));
            } else {
              toast.error('Upload failed (via polling).');
              setUploadState((prev) => ({ ...prev, error: jobData.error }));
            }
          }
        } catch (error) {
          console.error('[Polling] Error fetching job status:', error);
          // Stop polling on critical errors like 404
          if (error.response?.status === 404) {
            cleanupPolling();
          }
        }
      }, 5000); // Poll every 5 seconds
    },
    [cleanupPolling]
  );

  // Initialize socket connection
  useEffect(() => {
    if (!userId) return;

    const socket = io(SOCKET_URL, {
      withCredentials: true,
      // The backend socket.io server is listening on the root path, not /api/v1
      // We need to override the default path which would be /api/v1/socket.io/
      // See: https://socket.io/docs/v4/client-options/#path
      path: "/socket.io/",
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to server for video upload updates.");
      if (uploadStateRef.current.jobId && !uploadStateRef.current.result) {
        cleanupPolling(); // Stop polling if socket reconnects
      }
      socket.emit("join_user", userId);
    });

    socket.on("upload_progress", (data) => {
      setUploadState((prev) => ({
        ...prev,
        isProcessing: true,
        progress: data.progress,
        stage: data.stage,
        message: data.message,
        jobId: data.jobId,
      }));
    });

    socket.on("upload_completed", (data) => {
      toast.success("Video processed and ready!");
      setUploadState((prev) => ({
        ...prev,
        isUploading: false,
        isProcessing: false,
        progress: 100,
        stage: "completed",
        message: "Video uploaded successfully!",
        result: data.video,
      }));
      cleanupPolling();
    });

    socket.on("upload_failed", (data) => {
      toast.error(`Upload failed: ${data.error}`);
      setUploadState((prev) => ({
        ...prev,
        isUploading: false,
        isProcessing: false,
        error: data.error,
        stage: "failed",
        message: `Upload failed: ${data.error}`,
      }));
      cleanupPolling();
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server.");
      const currentJobId = uploadStateRef.current.jobId;
      if (currentJobId && !uploadStateRef.current.result && !uploadStateRef.current.error) {
        startPolling(currentJobId);
      }
    });

    return () => {
      cleanupSocket();
      cleanupPolling();
    };
  }, [userId, cleanupSocket, cleanupPolling, startPolling]);

  const uploadVideo = useCallback(
    async (formData) => {
      setUploadState({
        isUploading: true,
        isProcessing: false,
        progress: 0,
        stage: "uploading",
        message: "Starting upload...",
        jobId: null,
        error: null,
        result: null,
        isCancelled: false,
      });

      const source = axios.CancelToken.source();
      xhrRef.current = source;

      try {
        const response = await publishVideo(formData, {
          onUploadProgress: (e) => {
            if (e.lengthComputable) {
              const percent = Math.floor((e.loaded * 100) / e.total);
              setUploadState((prev) => ({ ...prev, progress: percent }));
            }
          },
          cancelToken: source.token,
        });

        const { jobId, message } = response.data.data;

        setUploadState((prev) => ({
          ...prev,
          isUploading: false,
          isProcessing: true,
          jobId,
          stage: "processing",
          message: message || "Processing video...",
        }));

        // Start polling as a backup in case socket connection fails later
        setTimeout(() => {
          if (!socketRef.current?.connected) startPolling(jobId);
        }, 2000);
      } catch (error) {
        if (axios.isCancel(error)) {
          return;
        }
        const errorMessage =
          error.response?.data?.message || error.message || "Upload failed";
        toast.error(errorMessage);
        setUploadState((prev) => ({
          ...prev,
          isUploading: false,
          isProcessing: false,
          error: errorMessage,
          stage: "failed",
          message: `Upload failed: ${errorMessage}`,
        }));
      }
    },
    [startPolling]
  );

  const cancelUpload = useCallback(async () => {
    if (xhrRef.current?.cancel) {
      xhrRef.current.cancel("Upload cancelled by user.");
    }
    if (uploadState.jobId) {
      try {
        await cancelVideoUpload(uploadState.jobId);
      } catch (err) {
        console.error("Failed to cancel job on server:", err);
      }
    }
    setUploadState((prev) => ({
      ...prev,
      isUploading: false,
      isProcessing: false,
      isCancelled: true,
      stage: "cancelled",
      message: "Upload cancelled",
    }));
  }, [uploadState.jobId]);

  const resetUpload = useCallback(() => {
    setUploadState({
      isUploading: false,
      isProcessing: false,
      progress: 0,
      stage: null,
      message: "",
      jobId: null,
      error: null,
      result: null,
      isCancelled: false,
    });
    if (xhrRef.current) xhrRef.current = null;
    cleanupPolling();
    // The socket connection itself is managed by the main useEffect
  }, [cleanupPolling]);

  return { ...uploadState, uploadVideo, cancelUpload, resetUpload };
};
