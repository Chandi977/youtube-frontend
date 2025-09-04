import styled from "styled-components";

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
`;

export const VideoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
  padding: 1rem;
`;

export const LibraryContainer = styled(Container)`
  padding: 2rem 1rem;
  min-height: calc(100vh - 70px);
`;

export default Container;
