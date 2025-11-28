import React from 'react';
import { NavLink } from 'react-router';
import {
  Cell,
  LeagueTableWrapper,
  Position,
  Row,
  Spinner,
  SpinnerWrapper,
  Table,
  TableScrollWrapper,
  TableTitle,
  TableWrapper,
} from './LeagueTable.styles';
import { TClubsData } from '../../App';

export const LeagueTable = ({
  sortedClubsWithData,
  loading,
}: {
  sortedClubsWithData: TClubsData;
  loading: boolean;
}) => {
  const cleanName = (name: string) => name.replace(/\b(AFC|FC)\b/gi, '').trim();

  return (
    <LeagueTableWrapper>
      <TableTitle>Premier League</TableTitle>
      {loading || !sortedClubsWithData.length ? (
        <SpinnerWrapper>
          <Spinner />
        </SpinnerWrapper>
      ) : (
        <TableScrollWrapper>
          <TableWrapper>
            <Table>
              <Row $header>
                <Cell $sticky $left={0} $title>
                  Club
                </Cell>
                <Cell>MP</Cell>
                <Cell>W</Cell>
                <Cell>D</Cell>
                <Cell>L</Cell>
                <Cell>GF</Cell>
                <Cell>GA</Cell>
                <Cell>GD</Cell>
                <Cell>Pt</Cell>
              </Row>

              {sortedClubsWithData.map((club, index) => (
                <NavLink
                  style={{ textDecoration: 'none', color: 'inherit' }}
                  key={club.code}
                  to={`/club/${club.code}`}
                  state={{ club }}>
                  <Row key={club.code}>
                    <Cell $sticky $left={0} $title>
                      <Position>{index + 1}</Position>
                      {cleanName(club.name)}
                    </Cell>
                    <Cell>{club.matchesPlayed}</Cell>
                    <Cell>{club.wins}</Cell>
                    <Cell>{club.draws}</Cell>
                    <Cell>{club.losses}</Cell>
                    <Cell>{club.goalsFor}</Cell>
                    <Cell>{club.goalsAgainst}</Cell>
                    <Cell>{club.goalDifference}</Cell>
                    <Cell>{club.points}</Cell>
                  </Row>
                </NavLink>
              ))}
            </Table>
          </TableWrapper>
        </TableScrollWrapper>
      )}
    </LeagueTableWrapper>
  );
};
