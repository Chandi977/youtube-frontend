// pages/studio/upload.jsx
import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import {
  Upload,
  X,
  Play,
  Image,
  FileVideo,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Globe,
  Users,
  Calendar,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { videoAPI } from "../../lib/api";
import { useAuthStore } from "../../store";
import toast from "react-hot-toast";

// lib/api.js
import axios from "axios";

export const uploadVideoAPI = async (formData) => {
  const response = await axios.post(
    "http://localhost:8000/api/v1/videos/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`, // if auth needed
      },
    }
  );
  return response.data;
};

const UploadVideo = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();
  const [uploadStep, setUploadStep] = useState("select"); // select, uploading, details, success
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  const videoInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    defaultValues: {
      visibility: "public",
      category: "entertainment",
    },
  });

  // Upload video mutation

  const uploadMutation = useMutation(uploadVideoAPI, {
    onSuccess: (data) => {
      console.log("Upload successful:", data);
      setUploadStep("success");
      toast.success("Video uploaded successfully!");
    },
    onError: (error) => {
      console.error("Upload failed:", error);
      toast.error(error?.message || "Upload failed");
      setUploadStep("details");
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please sign in to upload videos.
          </p>
          <a href="/login">
            <button className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors">
              Sign In
            </button>
          </a>
        </div>
      </div>
    );
  }

  const handleVideoSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("video/")) {
        toast.error("Please select a video file");
        return;
      }

      // Validate file size (500MB limit)
      if (file.size > 500 * 1024 * 1024) {
        toast.error("File size must be less than 500MB");
        return;
      }

      setVideoFile(file);

      // Create video preview
      const url = URL.createObjectURL(file);
      setVideoPreview(url);

      setUploadStep("details");
    }
  };

  const handleThumbnailSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      setThumbnailFile(file);

      const url = URL.createObjectURL(file);
      setThumbnailPreview(url);
    }
  };

  const onSubmit = (data) => {
    if (!videoFile) {
      toast.error("Please select a video file");
      return;
    }

    setUploadStep("uploading");
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("videoFile", videoFile);
    formData.append("title", data.title);
    formData.append("description", data.description || "");

    if (thumbnailFile) {
      formData.append("thumbnail", thumbnailFile);
    }

    // ✅ Trigger mutation
    uploadMutation.mutate(formData);
  };

  const handleStartOver = () => {
    setUploadStep("select");
    setVideoFile(null);
    setThumbnailFile(null);
    setVideoPreview(null);
    setThumbnailPreview(null);
    setUploadProgress(0);
    reset();
  };

  const categories = [
    "entertainment",
    "music",
    "gaming",
    "sports",
    "news",
    "education",
    "technology",
    "comedy",
    "travel",
    "lifestyle",
    "science",
    "other",
  ];

  const visibilityOptions = [
    {
      value: "public",
      label: "Public",
      icon: Globe,
      description: "Anyone can search for and view",
    },
    {
      value: "unlisted",
      label: "Unlisted",
      icon: Eye,
      description: "Anyone with the link can view",
    },
    {
      value: "private",
      label: "Private",
      icon: EyeOff,
      description: "Only you can view",
    },
  ];

  return (
    <>
      <Head>
        <title>Upload Video - YouTube Studio</title>
        <meta name="description" content="Upload and manage your videos" />
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <a href="/studio" className="text-red-600 hover:text-red-700">
                  ← Back to Studio
                </a>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Upload Video
                </h1>
              </div>

              {uploadStep !== "select" && uploadStep !== "success" && (
                <button
                  onClick={handleStartOver}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Start Over
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AnimatePresence mode="wait">
            {/* Step 1: Select Video */}
            {uploadStep === "select" && (
              <motion.div
                key="select"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                <div className="max-w-md mx-auto">
                  <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-12 hover:border-red-500 dark:hover:border-red-400 transition-colors cursor-pointer">
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleVideoSelect}
                      className="hidden"
                    />

                    <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Select video to upload
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Or drag and drop a video file
                    </p>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => videoInputRef.current?.click()}
                      className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Select File
                    </motion.button>

                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                      Max file size: 500MB • Supported formats: MP4, MOV, AVI,
                      WMV, FLV, WebM
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Video Details */}
            {uploadStep === "details" && (
              <motion.div
                key="details"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Video Details
                  </h2>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Left Column - Form */}
                      <div className="lg:col-span-2 space-y-6">
                        {/* Title */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Title *
                          </label>
                          <input
                            {...register("title", {
                              required: "Title is required",
                              maxLength: {
                                value: 100,
                                message:
                                  "Title must be less than 100 characters",
                              },
                            })}
                            type="text"
                            placeholder="Add a title that describes your video"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
                          {errors.title && (
                            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                              {errors.title.message}
                            </p>
                          )}
                        </div>

                        {/* Description */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Description
                          </label>
                          <textarea
                            {...register("description")}
                            rows={6}
                            placeholder="Tell viewers about your video"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                          />
                        </div>

                        {/* Thumbnail */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Thumbnail
                          </label>
                          <div className="flex items-center space-x-4">
                            <div className="w-32 h-20 bg-gray-200 dark:bg-gray-600 rounded-lg overflow-hidden flex items-center justify-center">
                              {thumbnailPreview ? (
                                <img
                                  src={thumbnailPreview}
                                  alt="Thumbnail preview"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Image className="w-8 h-8 text-gray-400" />
                              )}
                            </div>

                            <div>
                              <input
                                ref={thumbnailInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleThumbnailSelect}
                                className="hidden"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  thumbnailInputRef.current?.click()
                                }
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                              >
                                {thumbnailFile ? "Change" : "Upload"} Thumbnail
                              </button>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                1280x720 recommended
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Visibility */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Visibility
                          </label>
                          <div className="space-y-3">
                            {visibilityOptions.map((option) => (
                              <label
                                key={option.value}
                                className="flex items-start space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                              >
                                <input
                                  {...register("visibility")}
                                  type="radio"
                                  value={option.value}
                                  className="mt-1"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <option.icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                    <span className="font-medium text-gray-900 dark:text-white">
                                      {option.label}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {option.description}
                                  </p>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right Column - Preview */}
                      <div className="lg:col-span-1">
                        <div className="sticky top-8">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Preview
                          </h3>

                          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                            {videoPreview && (
                              <div className="mb-4">
                                <video
                                  src={videoPreview}
                                  className="w-full rounded-lg"
                                  controls
                                  style={{ maxHeight: "200px" }}
                                />
                              </div>
                            )}

                            <div className="space-y-2 text-sm">
                              <div className="flex items-center space-x-2">
                                <FileVideo className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                <span className="text-gray-600 dark:text-gray-400">
                                  {videoFile?.name}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-gray-600 dark:text-gray-400">
                                  Size:{" "}
                                  {videoFile
                                    ? (videoFile.size / 1024 / 1024).toFixed(
                                        2
                                      ) + " MB"
                                    : "N/A"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        disabled={uploadMutation.isLoading}
                        className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        <Upload className="w-5 h-5" />
                        <span>Upload Video</span>
                      </motion.button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {/* Step 3: Uploading */}
            {uploadStep === "uploading" && (
              <motion.div
                key="uploading"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                <div className="bg-white dark:bg-gray-800 rounded-lg p-12 border border-gray-200 dark:border-gray-700 max-w-md mx-auto">
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Upload className="w-8 h-8 text-red-600 dark:text-red-400" />
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Uploading Video
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Please don't close this window
                  </p>

                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 mb-4">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      className="bg-red-600 h-3 rounded-full transition-all duration-300"
                    />
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {uploadProgress}% complete
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step 4: Success */}
            {uploadStep === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                <div className="bg-white dark:bg-gray-800 rounded-lg p-12 border border-gray-200 dark:border-gray-700 max-w-md mx-auto">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Upload Complete!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-8">
                    Your video has been uploaded successfully and is now being
                    processed.
                  </p>

                  <div className="space-y-3">
                    <a href="/studio">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Go to Studio
                      </motion.button>
                    </a>

                    <button
                      onClick={handleStartOver}
                      className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Upload Another Video
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </>
  );
};

export default UploadVideo;
