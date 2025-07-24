from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid

class VoteOption(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    votes: int = 0

class Poll(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    options: List[VoteOption]
    created_at: datetime = Field(default_factory=datetime.utcnow)
    active: bool = True

class Vote(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    poll_id: str
    option_id: str
    voter_ip: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class VoteRequest(BaseModel):
    poll_id: str
    option_id: str

class PollCreate(BaseModel):
    title: str
    description: str
    options: List[dict]  # [{title: str, description: str}]