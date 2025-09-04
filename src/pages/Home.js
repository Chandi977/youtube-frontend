import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { Link } from "react-router-dom";
import VideoCard from "../components/VideoCard";
import Skeleton from "../skeletons/HomeSkeleton";
import VideoGrid from "../styles/VideoGrid";
import { getRecommendation } from "../reducers/recommendation";
import UploadVideo from "../components/UploadVideo";

// Styled container
export const StyledHome = styled.div`
  padding: 1.3rem;
  width: 90%;
  margin: 0 auto;
  padding-bottom: 7rem;

  h2 {
    margin-bottom: 1rem;
  }

  @media screen and (max-width: 1093px) {
    width: 95%;
  }
  @media screen and (max-width: 1090px) {
    width: 99%;
  }
  @media screen and (max-width: 870px) {
    width: 90%;
  }
  @media screen and (max-width: 670px) {
    width: 99%;
  }
  @media screen and (max-width: 600px) {
    width: 90%;
  }
  @media screen and (max-width: 530px) {
    width: 100%;
  }
`;

// Floating circular button
const FloatingButton = styled.button`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: #065fd4;
  color: white;
  border: none;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  font-size: 28px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  transition: background 0.2s;
  z-index: 1000;

  &:hover {
    background: #054ab4;
  }
`;

const Home = () => {
  const dispatch = useDispatch();
  const { isFetching, data } = useSelector((state) => state.recommendation);
  const videos = data?.videos || [];

  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleOpenModal = () => setShowUploadModal(true);
  const handleCloseModal = () => setShowUploadModal(false);

  useEffect(() => {
    dispatch(getRecommendation());
  }, [dispatch]);

  if (isFetching) return <Skeleton title={true} />;

  return (
    <StyledHome>
      {/* Floating Upload Button */}
      <FloatingButton onClick={handleOpenModal}>+</FloatingButton>

      {/* Upload Modal */}
      {showUploadModal && <UploadVideo onClose={handleCloseModal} />}

      <h2>Recommended</h2>
      <VideoGrid>
        {videos.map((video) => (
          <Link key={video._id} to={`/watch/${video._id}`}>
            <VideoCard video={video} />
          </Link>
        ))}
      </VideoGrid>
    </StyledHome>
  );
};

export default Home;
