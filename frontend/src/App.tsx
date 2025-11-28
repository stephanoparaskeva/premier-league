import React, { useEffect, useRef, useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import { Routes, Route } from 'react-router';
import './styles.scss';
import LeagueTable from './Components/LeagueTable';
import Club from './Components/Club';
import { ToastContainer, toast } from 'react-toastify';
import { Dot, DotContainer } from './App.styles';
import { retry } from './utilities/retry';

const errorToast = (msg: string) =>
  toast(msg, { position: 'bottom-center', type: 'error', toastId: 'retry-toast' });

const BACKEND_BASE_URL = `http://localhost:65000`;
const WS_URL = `ws://localhost:65000/matches/ws`;
const DEBOUNCE_MS = 200;
const COMPETITION = 'Premier League';
const COUNTRY = 'England';

type THome = number;
type TAway = number;

type TScore = [THome, TAway];

type TClub = {
  name: string;
  code: string;
  country: string;
};

export type TFixture = {
  away: string;
  competition: string;
  date: string;
  home: string;
  round: string;
  score: { ft: TScore };
};

type TTeamStatsAccumulator = {
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
};

type TTeamStats = {
  history: TFixture[];
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
};

export type TClubData = TTeamStats & TClub;

export type TClubsData = Array<TClubData>;

export const App = () => {
  const [clubs, setClubs] = useState<TClub[]>([]);
  const [fixtures, setFixtures] = useState<TFixture[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [connected, setConnected] = useState(false);
  const bufferRef = useRef<TFixture[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const ws = useRef<WebSocket>(null);

  const premierLeagueFixtures = fixtures.filter(fixture => fixture.competition === COMPETITION);

  const englishClubs = clubs.filter(club => club.country === COUNTRY);

  const teamMap = englishClubs.reduce((acc, club) => ({ ...acc, [club.code]: [] }), {});

  const hydratedTeamMap = premierLeagueFixtures.reduce(
    (acc: Record<string, TFixture[]>, fixture: TFixture) => {
      const { home, away } = fixture;

      return {
        ...acc,
        ...(acc[home] && { [home]: [...acc[home], fixture] }),
        ...(acc[away] && { [away]: [...acc[away], fixture] }),
      };
    },
    { ...teamMap }
  );

  const accumulateFixtureStats =
    (teamCode: string) =>
    (stats: TTeamStatsAccumulator, fixture: TFixture): TTeamStatsAccumulator => {
      const teamIsHome = fixture.home === teamCode;
      const [homeScore, awayScore] = fixture.score.ft;

      const goalsFor = teamIsHome ? homeScore : awayScore;
      const goalsAgainst = teamIsHome ? awayScore : homeScore;

      const draw = homeScore === awayScore ? 1 : 0;

      const win =
        (teamIsHome && homeScore > awayScore) || (!teamIsHome && awayScore > homeScore) ? 1 : 0;
      const loss =
        (teamIsHome && homeScore < awayScore) || (!teamIsHome && awayScore < homeScore) ? 1 : 0;

      return {
        wins: stats.wins + win,
        draws: stats.draws + draw,
        losses: stats.losses + loss,
        goalsFor: stats.goalsFor + goalsFor,
        goalsAgainst: stats.goalsAgainst + goalsAgainst,
      };
    };

  const computeTeamStats = (teamCode: string, history: TFixture[]): TTeamStats => {
    const base: TTeamStatsAccumulator = {
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
    };

    const stats = history.reduce(accumulateFixtureStats(teamCode), base);

    const matchesPlayed = history.length;
    const goalDifference = stats.goalsFor - stats.goalsAgainst;
    const points = stats.wins * 3 + stats.draws;

    return {
      history,
      points,
      matchesPlayed,
      goalDifference,
      ...stats,
    };
  };

  const teamStatsArray = Object.entries(hydratedTeamMap).map(([teamCode, history]) => [
    teamCode,
    computeTeamStats(teamCode, history),
  ]);

  const teamStatsMap = Object.fromEntries(teamStatsArray);

  const clubsWithData = englishClubs.map(club => ({ ...club, ...teamStatsMap[club.code] }));

  const sortedClubsWithData = [...clubsWithData].sort(
    (a, b) => b.points - a.points || b.goalDifference - a.goalDifference
  );

  const getAndSetClubs = async () => {
    try {
      const response = await retry<AxiosResponse<TClub[]>>({
        apiCall: () => axios<TClub[]>(`${BACKEND_BASE_URL}/clubs`),
        retries: 10,
        onRetry: () => errorToast('Failed to fetch clubs, Retrying...'),
      });
      setClubs(response.data);
      setLoading(false);
    } catch {
      errorToast('Failed to fetch clubs after multiple attempts.');
    }
  };

  const onMessage = (event: MessageEvent) => {
    try {
      const message = JSON.parse(event.data);
      const normalizedMsg = Array.isArray(message) ? message : [message];
      const sanitisedMsg = normalizedMsg.map(fixture => ({
        ...fixture,
        home: fixture.home.toUpperCase(),
        away: fixture.away.toUpperCase(),
      }));

      bufferRef.current = [...bufferRef.current, ...sanitisedMsg];

      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        const flushed = [...bufferRef.current];
        setFixtures(prev => [...prev, ...flushed]);
        bufferRef.current = [];
      }, DEBOUNCE_MS);
    } catch (error) {
      console.error('Error parsing message', error);
    }
  };

  const onOpen = () => setConnected(true);
  const onClose = () => setConnected(false);

  useEffect(() => {
    getAndSetClubs();
  }, []);

  useEffect(() => {
    ws.current = new WebSocket(WS_URL);
    ws.current.onmessage = onMessage;
    ws.current.onopen = onOpen;
    ws.current.onclose = onClose;

    return () => {
      ws.current?.close();
    };
  }, []);

  return (
    <>
      <DotContainer>
        <Dot $connected={connected} />
      </DotContainer>

      <Routes>
        <Route
          path='/'
          element={<LeagueTable sortedClubsWithData={sortedClubsWithData} loading={loading} />}
        />
        <Route
          path='/club/:clubCode'
          element={<Club sortedClubsWithData={sortedClubsWithData} />}
        />
      </Routes>

      <ToastContainer />
    </>
  );
};
