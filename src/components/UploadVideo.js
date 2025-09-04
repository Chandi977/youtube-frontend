  import React, { useState } from "react";
  import { upload } from "../utils";
  import { toast } from "react-toastify";
  import styled from "styled-components";
  import { CloseIcon } from "./Icons";

  const Wrapper = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    z-index: 999;
    display: flex;
    justify-content: center;
    align-items: center;
  `;

  const FormWrapper = styled.div`
    background: ${(props) => props.theme.bg};
    padding: 2rem;
    border-radius: 4px;
    width: 100%;
    max-width: 600px;
    position: relative;
  `;

  const CloseButton = styled.button`
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    cursor: pointer;
    color: ${(props) => props.theme.textSecondary};
    &:hover {
      color: ${(props) => props.theme.red};
    }
  `;

  const StyledForm = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1rem;

    input,
    textarea {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid ${(props) => props.theme.borderColor};
      border-radius: 4px;
      background: ${(props) => props.theme.black};
      color: ${(props) => props.theme.primaryColor};
    }

    textarea {
      height: 100px;
      resize: vertical;
    }

    button[type="submit"] {
      background: ${(props) => props.theme.blue};
      color: white;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
    }
  `;

  const UploadVideo = ({ onClose }) => {
    const [uploading, setUploading] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [video, setVideo] = useState(null);
    const [thumbnail, setThumbnail] = useState(null);

    const handleSubmit = async (e) => {
      e.preventDefault();

      if (!title.trim() || !description.trim() || !video || !thumbnail) {
        return toast.error("Please fill in all fields");
      }

      const formData = new FormData();
      formData.append("videoFile", video);
      formData.append("thumbnail", thumbnail);
      formData.append("title", title.trim());
      formData.append("description", description.trim());

      setUploading(true);
      try {
        const response = await upload(formData);
        toast.success("Video published successfully!");
        onClose();
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to publish video");
      } finally {
        setUploading(false);
      }
    };

    return (
      <Wrapper onClick={(e) => e.target === e.currentTarget && onClose()}>
        <FormWrapper>
          <CloseButton onClick={onClose}>
            <CloseIcon />
          </CloseButton>
          <h2>Upload Video</h2>
          <StyledForm onSubmit={handleSubmit}>
            <div>
              <label>Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter video title"
                required
              />
            </div>
            <div>
              <label>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter video description"
                required
              />
            </div>
            <div>
              <label>Video File</label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setVideo(e.target.files[0])}
                required
              />
            </div>
            <div>
              <label>Thumbnail</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setThumbnail(e.target.files[0])}
                required
              />
            </div>
            <button type="submit" disabled={uploading}>
              {uploading ? "Publishing..." : "Publish Video"}
            </button>
          </StyledForm>
        </FormWrapper>
      </Wrapper>
    );
  };

  export default UploadVideo;
