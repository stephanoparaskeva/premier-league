import asyncio
import os
import json
import logging
from fastapi import FastAPI
from fastapi.logger import logger
from fastapi.middleware.cors import CORSMiddleware

from routes import CLUBS_ROUTER, MATCHES_ROUTER
from middleware import RandomFailureMiddleware
from message_generator import MessageGenerator

uvicorn_logger = logging.getLogger("uvicorn")
logger.handlers = uvicorn_logger.handlers
logger.setLevel(logging.INFO)

app = FastAPI()

with open(f"{os.getcwd()}/clubs.json", "r") as stream:
    app.clubs = json.load(stream)
with open(f"{os.getcwd()}/matches.json", "r") as stream:
    app.matches = json.load(stream)

app.add_middleware(RandomFailureMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(CLUBS_ROUTER)
app.include_router(MATCHES_ROUTER)

app.message_generator = MessageGenerator(app)


@app.on_event("startup")
async def startup() -> None:
    asyncio.create_task(app.message_generator.start())
