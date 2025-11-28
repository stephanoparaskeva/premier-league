from pydantic import BaseModel
from typing import Optional


class Club(BaseModel):
    name: str
    code: str
    country: str


class Match(BaseModel):
    round: str
    competition: str = "Premier League"
    date: str
    home: str
    away: str
    score: Optional[dict[str, tuple[int, int]]]
