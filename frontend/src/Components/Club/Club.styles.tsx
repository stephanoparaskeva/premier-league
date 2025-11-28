import styled from 'styled-components';

export const PageWrapper = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Poppins', sans-serif;
`;

export const Header = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  text-align: center;
  color: #111;
`;

export const BackArrowContainer = styled.div`
  position: absolute;
  left: 50px;
  top: 50px;
  
  @media (max-width: 768px) {
    left: 25px;
    top: 25px;
  }
`;

export const StatsCard = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 12px;
  padding: 1.5rem 2rem;
  margin-bottom: 2rem;
`;

export const Stat = styled.div`
  flex: 0 1 120px;
  margin: 0.5rem 1rem;
  font-weight: 500;
  color: #222;
`;

export const MatchesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
`;

export const MatchCard = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s;
  cursor: default;
  position: relative;

  &:hover {
    transform: translateY(-4px);
  }
`;

export const MatchDate = styled.div`
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.25rem;
`;

export const MatchCompetition = styled.div`
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #111;
`;

export const Teams = styled.div`
  height: 85px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 500;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
`;

export const Team = styled.div<{ $isHome?: boolean }>`
  flex: 1;
  text-align: ${({ $isHome }) => ($isHome ? 'left' : 'right')};
`;

export const Score = styled.div`
  margin: 0 1rem;
  font-weight: 700;
`;

export const Round = styled.div`
  font-size: 0.85rem;
  color: #888;
  text-align: center;
`;

export const Info = styled.div`
  font-size: 0.85rem;
  color: #888;
  text-align: center;
`;

export const Result = styled.div<{ $result: 'W' | 'L' | 'D' }>`
  position: absolute;
  top: 0.5rem;
  right: 0.75rem;
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  color: ${({ $result }) =>
    $result === 'W' ? '#2ecc71' : $result === 'L' ? '#e74c3c' : '#7f8c8d'};
  opacity: 0.9;
`;

export const Divider = styled.div`
  width: 90%;
  height: 4px;
  background-color: #545353;
  margin: 0.75rem auto;
  border-radius: 1px;
  opacity: 0.8;
`;
