import asyncio
import random
from datetime import date, timedelta
from math import floor
from typing import List, Dict

from fastapi import FastAPI, WebSocket
from fastapi.logger import logger
from starlette.websockets import WebSocketState

from models import Match, Club

DAY_DURATION = 0.1
DISCONNECT_RATE = 0.00
CODE_ERROR_RATE = 0.01
CHAMPIONS_LEAGUE_RATE = 0.05


class MessageGenerator:
    websockets: List[WebSocket]
    matches: List[Match]
    clubs: Dict[str, Club]

    current_date: str

    def __init__(self, app: FastAPI) -> None:
        # Parse matches/clubs from app
        self.matches = [Match.parse_obj(match) for match in app.matches]
        # Keyed by club name (to match your existing JSON shape)
        self.clubs = {club["name"]: club for club in app.clubs}
        self.websockets = []

        # Start from the first match date
        self.current_date = self.matches[0].date

    # -------------------------------------------------------------------------
    # Connection management
    # -------------------------------------------------------------------------
    async def add_connection(self, websocket: WebSocket) -> None:
        logger.info("Adding websocket connection")
        self.websockets.append(websocket)

    async def remove_connection(self, websocket: WebSocket) -> None:
        if websocket in self.websockets:
            if websocket.client_state != WebSocketState.DISCONNECTED:
                try:
                    logger.info("Closing websocket ...")
                    await websocket.close()
                except Exception as error:
                    logger.warning(f"Error while closing websocket: {error}")
            try:
                self.websockets.remove(websocket)
            except ValueError:
                # Already removed
                pass

    # -------------------------------------------------------------------------
    # Helper: broadcast safely to all clients
    # -------------------------------------------------------------------------
    async def _broadcast(self, payload) -> None:
        """
        Safely send a payload to all connected websockets.

        - Skips sockets that are not CONNECTED
        - Removes sockets that error on send
        - Never raises to the main loop
        """
        if not self.websockets:
            return

        # Work on a shallow copy so we can modify self.websockets while iterating
        for ws in list(self.websockets):
            if ws.client_state not in (WebSocketState.CONNECTING, WebSocketState.CONNECTED):
                # Dead / closing socket -> clean it up
                await self.remove_connection(ws)
                continue

            try:
                await ws.send_json(payload)
            except Exception as error:
                logger.warning(f"Error sending to websocket, removing it: {error}")
                await self.remove_connection(ws)

    # -------------------------------------------------------------------------
    # Main loop
    # -------------------------------------------------------------------------
    async def start(self) -> None:
        """
        Main message generation loop.

        This loop **never breaks** permanently on WebSocket errors. It:
        - Cleans up dead connections
        - Broadcasts daily fixtures
        - Handles end-of-season notifications
        - Advances the simulated date
        """
        logger.info("MessageGenerator loop starting")

        while True:
            try:
                # Clean up dead websockets & random disconnects
                await self._prune_websockets()

                # If no clients connected, wait and try again without advancing the season
                if not self.websockets:
                    await asyncio.sleep(1)
                    continue

                # Get today's matches
                matches = [
                    dict(match)
                    for match in self.matches
                    if match.date == self.current_date
                ]

                # Randomly add in champions league matches
                if random.random() < CHAMPIONS_LEAGUE_RATE:
                    matches.append(
                        {
                            "round": "Group Stages",
                            "competition": "Champions League",
                            "date": self.current_date,
                            "home": list(self.clubs.values())[
                                floor(random.random() * len(self.clubs.values()))
                            ]["name"],
                            "away": ["Barcelona", "FC Bayern Munich", "Dubrava"][
                                floor(3 * random.random())
                            ],
                            "score": {
                                "ft": [
                                    floor(10 * random.random()),
                                    floor(10 * random.random()),
                                ]
                            },
                        }
                    )

                # Normalize home/away to codes and optionally introduce code errors
                for match in matches:
                    # Map club names to codes
                    if match["home"] in self.clubs:
                        match["home"] = self.clubs[match["home"]]["code"]
                    if match["away"] in self.clubs:
                        match["away"] = self.clubs[match["away"]]["code"]

                    # Randomly lowercase team codes (simulated data errors)
                    if random.random() < CODE_ERROR_RATE:
                        match["home"] = match["home"].lower()
                    if random.random() < CODE_ERROR_RATE:
                        match["away"] = match["away"].lower()

                # Broadcast today's matches if any
                if matches:
                    payload = matches if len(matches) > 1 else matches[0]
                    await self._broadcast(payload)

                # Wait for the next "day"
                await asyncio.sleep(DAY_DURATION)

                # Advance the date
                self.current_date = (
                    date.fromisoformat(self.current_date) + timedelta(days=1)
                ).isoformat()

                # Handle end of season
                if self.current_date > self.matches[-1].date:
                    # Notify all clients that the season is finished
                    await self._broadcast({"type": "season_finished"})

                    # Close all existing connections cleanly
                    for ws in list(self.websockets):
                        await self.remove_connection(ws)

                    # Rewind the date to just before the season starts
                    self.current_date = (
                        date.fromisoformat(self.matches[0].date) - timedelta(days=2)
                    ).isoformat()

            except Exception as error:
                # Log and keep going instead of breaking the loop forever
                logger.error(f"Unexpected error in MessageGenerator loop: {error}")
                # Small backoff to avoid tight error loops
                await asyncio.sleep(0.5)

    # -------------------------------------------------------------------------
    # Helper: prune dead or randomly-disconnected websockets
    # -------------------------------------------------------------------------
    async def _prune_websockets(self) -> None:
        """
        Remove websockets that are no longer connected, or randomly disconnect some
        according to DISCONNECT_RATE.
        """
        if not self.websockets:
            return

        for ws in list(self.websockets):
            # Remove dead websockets
            if ws.client_state not in (WebSocketState.CONNECTING, WebSocketState.CONNECTED):
                await self.remove_connection(ws)
                continue

            # Randomly close some websockets (if DISCONNECT_RATE > 0)
            if random.random() < DISCONNECT_RATE:
                logger.info("Randomly disconnecting a websocket (DISCONNECT_RATE hit)")
                await self.remove_connection(ws)
