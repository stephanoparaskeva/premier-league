import React from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  BackArrowContainer,
  Divider,
  Header,
  Info,
  MatchCard,
  MatchCompetition,
  MatchDate,
  MatchesGrid,
  PageWrapper,
  Result,
  Round,
  Score,
  Stat,
  StatsCard,
  Team,
  Teams,
} from './Club.styles';
import { TClubsData, TFixture } from '../../App';
import BackArrow from '../../Assets/BackArrow';

export const Club = ({ sortedClubsWithData }: { sortedClubsWithData: TClubsData }) => {
  const navigate = useNavigate();
  const { clubCode } = useParams();

  const club = sortedClubsWithData.find(club => club.code === clubCode);

  const sortByMatchday = (a: TFixture, b: TFixture) => {
    const numA = Number(a?.round.split(' ')[1]);
    const numB = Number(b?.round.split(' ')[1]);
    return numA - numB;
  };

  const matchesSorted = [...(club?.history || [])].sort(sortByMatchday);

  const getResult = (match: TFixture) => {
    const isHome = match.home === club?.code;
    const [homeGoals, awayGoals] = match.score.ft;
    const didWin = (isHome && homeGoals > awayGoals) || (!isHome && awayGoals > homeGoals);

    if (homeGoals === awayGoals) return 'D';
    return didWin ? 'W' : 'L';
  };

  return (
    <PageWrapper>
      <BackArrowContainer>
        <BackArrow onClick={() => navigate(-1)} />
      </BackArrowContainer>
      <Header>{club?.name || 'Not Found'}</Header>
      <StatsCard>
        <Stat>
          <strong>Matches:</strong> {club?.matchesPlayed}
        </Stat>
        <Stat>
          <strong>Wins:</strong> {club?.wins}
        </Stat>
        <Stat>
          <strong>Draws:</strong> {club?.draws}
        </Stat>
        <Stat>
          <strong>Losses:</strong> {club?.losses}
        </Stat>
        <Stat>
          <strong>GF:</strong> {club?.goalsFor}
        </Stat>
        <Stat>
          <strong>GA:</strong> {club?.goalsAgainst}
        </Stat>
        <Stat>
          <strong>GD:</strong> {club?.goalDifference}
        </Stat>
        <Stat>
          <strong>Points:</strong> {club?.points}
        </Stat>
      </StatsCard>

      <MatchesGrid>
        {matchesSorted.map((match, idx) => (
          <MatchCard key={idx}>
            <Result $result={getResult(match)}>{getResult(match)}</Result>
            <MatchDate>{new Date(match.date).toLocaleDateString()}</MatchDate>
            <MatchCompetition>{match.competition}</MatchCompetition>
            <Divider />
            <Info>{match.home === club?.code ? 'Home' : 'Away'}</Info>
            <Teams>
              <Team $isHome>{match.home}</Team>
              <Score>
                {match.score.ft[0]} - {match.score.ft[1]}
              </Score>
              <Team>{match.away}</Team>
            </Teams>
            <Round>{match.round}</Round>
          </MatchCard>
        ))}
      </MatchesGrid>
    </PageWrapper>
  );
};
