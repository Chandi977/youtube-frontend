import React from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import VideoCard from "../components/VideoCard";
import NoResults from "../components/NoResults";
import { LibraryContainer, VideoGrid } from "../styles/Container";

const Wrapper = styled.div`
  h2 {
    margin-bottom: 2rem;
    font-size: 1.5rem;
  }
`;

const Library = () => {
  const { videos, loading } = useSelector((state) => state.likedVideos);

  if (loading) return <div>Loading...</div>;

  return (
    <LibraryContainer>
      <Wrapper>
        <h2>Library</h2>
        <VideoGrid>
          {videos?.length > 0 ? (
            videos.map((video) => <VideoCard key={video._id} video={video} />)
          ) : (
            <NoResults text="No videos in library" />
          )}
        </VideoGrid>
      </Wrapper>
    </LibraryContainer>
  );
};

export default Library;
