import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import VideoCard from "../components/VideoCard";
import { Container, VideoGrid } from "../styles/Container";
import { getLikedVideos } from "../reducers/likedVideo";
import NoResults from "../components/NoResults";

const Wrapper = styled.div`
  h2 {
    margin-bottom: 2rem;
    font-size: 1.5rem;
  }
`;

const LikedVideos = () => {
  const dispatch = useDispatch();
  const { videos, loading, error } = useSelector(
    (state) => state.likedVideos || { videos: [], loading: false }
  );

  useEffect(() => {
    dispatch(getLikedVideos());
  }, [dispatch]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Container>
      <Wrapper>
        <h2>Liked Videos</h2>
        <VideoGrid>
          {videos?.length > 0 ? (
            videos.map((video) => <VideoCard key={video._id} video={video} />)
          ) : (
            <NoResults text="No liked videos found" />
          )}
        </VideoGrid>
      </Wrapper>
    </Container>
  );
};

export default LikedVideos;
