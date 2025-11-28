import React from 'react';
import styled, { keyframes } from 'styled-components';

const rotate360 = keyframes` from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

export const Spinner = styled.div`
  animation: ${rotate360} 1s linear infinite;
  transform: translateZ(0);

  border-top: 2px solid grey;
  border-right: 2px solid grey;
  border-bottom: 2px solid grey;
  border-left: 4px solid black;
  background: transparent;
  width: 24px;
  height: 24px;
  border-radius: 50%;
`;

export const LeagueTableWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  width: 100%;
`;

export const TableTitle = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 2rem;
  text-align: center;
`;

export const SpinnerWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin: 2rem 0;
`;

export const TableScrollWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  justify-content: center;
`;

export const TableWrapper = styled.div`
  min-width: max-content;
  max-width: 800px;

  @media (min-width: 769px) {
    max-width: 800px;
    margin: 0 auto;
  }

  @media (max-width: 768px) {
    max-width: none;
  }
`;

export const Table = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  min-width: max-content;
  margin: 2rem auto;
  background: #fff;
  border: 1px solid #f1f3f4;
  border-radius: 1px;
`;

export const Row = styled.div<{ $header?: boolean }>`
  display: flex;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e0e0e0;
  width: 100%;
  cursor: ${({ $header }) => ($header ? 'default' : 'pointer')};

  --row-bg: ${({ $header }) => ($header ? '#f1f3f4' : 'white')};
  background-color: var(--row-bg);

  &:nth-child(even) {
    --row-bg: ${({ $header }) => ($header ? '#f1f3f4' : '#fafafa')};
  }

  &:hover {
    ${({ $header }) => !$header && '--row-bg: #f5f5f5;'}
  }

  font-weight: ${({ $header }) => ($header ? 600 : 400)};
`;

export const Cell = styled.div<{ $title?: boolean; $sticky?: boolean; $left?: number }>`
  flex: 0 0 auto;
  padding: 0 0.7rem;

  max-width: 250px;
  min-width: ${({ $title }) => ($title ? 250 : 50)}px;

  text-align: ${({ $title }) => ($title ? 'left' : 'center')};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  display: flex;
  align-items: center;

  ${({ $sticky, $left }) =>
    $sticky &&
    `
      position: sticky;
      left: ${$left}px;
      z-index: 3;
      background-color: var(--row-bg);
      border-right: 1px solid #e0e0e0;
    `}
`;

export const Position = styled.div`
  padding-right: 8px;
  display: flex;
  align-items: center;
`;
