import React from 'react';
import styled from 'styled-components';

export const DotContainer = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Dot = styled.div<{ $connected: boolean }>`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: ${({ $connected }: { $connected: boolean }) => ($connected ? 'green' : 'red')};
  box-shadow: 0 0 10px
    ${({ $connected }: { $connected: boolean }) =>
      $connected ? 'rgba(0, 255, 0, 0.6)' : 'rgba(255, 0, 0, 0.6)'};
`;
