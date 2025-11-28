import asyncio
import random
from typing import Optional
from fastapi import HTTPException, Query, Request, APIRouter, WebSocket
from fastapi.logger import logger
from starlette.websockets import WebSocketState
from datetime import date, timedelta

from models import Club


CLUBS_ROUTER = APIRouter(prefix="/clubs", tags=["clubs"])


@CLUBS_ROUTER.get("/", response_model=list[Club])
def get_clubs(
    request: Request,
    code: Optional[list[str]] = Query(default=None),
    name: Optional[list[str]] = Query(default=None),
) -> list[Club]:
    return [
        Club.parse_obj(club)
        for club in request.app.clubs
        if (not code or club["code"] in code) and (not name or club["name"] in name)
    ]


@CLUBS_ROUTER.get("/{code:str}", response_model=Club)
def get_club_by_code(code: str, request: Request) -> Club:
    club = None

    for _club in request.app.clubs:
        if _club["code"] == code:
            club = _club
            break

    if club is None:
        raise HTTPException(status_code=404, detail="Club not found.")

    return Club.parse_obj(club)


MATCHES_ROUTER = APIRouter(prefix="/matches", tags=["matches"])


@MATCHES_ROUTER.websocket("/ws")
async def matches_websocket(
    websocket: WebSocket,
) -> None:
    delay = random.uniform(1, 3)
    logger.info(f"Accepting connection in {delay:0.1f}s...")
    await asyncio.sleep(delay)
    await websocket.app.message_generator.add_connection(websocket)
    await websocket.accept()
    while True:
        try:
            if websocket.client_state == WebSocketState.CONNECTED:
                data = await websocket.receive_text()
                logger.debug(f"Websocket message recieved : {data}")
                if data == "restart":
                    _date = (
                        date.fromisoformat(
                            websocket.app.message_generator.matches[0].date
                        )
                        - timedelta(days=2)
                    ).isoformat()
                    websocket.app.message_generator.current_date = _date
        except Exception as error:
            logger.error(error)
            await websocket.app.message_generator.remove_connection(websocket)
            break
