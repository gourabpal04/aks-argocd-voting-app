from fastapi import APIRouter, HTTPException, Request, Depends
from typing import List
import os
from motor.motor_asyncio import AsyncIOMotorClient
from ..models.vote import Poll, VoteRequest, PollCreate, Vote, VoteOption
from datetime import datetime
import uuid

router = APIRouter()

# Database connection
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "voting_app")

client = AsyncIOMotorClient(MONGO_URL)
database = client[DATABASE_NAME]
polls_collection = database.polls
votes_collection = database.votes

@router.post("/api/polls", response_model=Poll)
async def create_poll(poll_data: PollCreate):
    """Create a new poll"""
    try:
        # Create vote options with IDs
        options = []
        for option_data in poll_data.options:
            option = VoteOption(
                title=option_data["title"],
                description=option_data.get("description", ""),
                votes=0
            )
            options.append(option.dict())
        
        # Create poll
        poll = Poll(
            title=poll_data.title,
            description=poll_data.description,
            options=options
        )
        
        # Insert into database
        poll_dict = poll.dict()
        result = await polls_collection.insert_one(poll_dict)
        
        if result.inserted_id:
            return poll
        else:
            raise HTTPException(status_code=500, detail="Failed to create poll")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating poll: {str(e)}")

@router.get("/api/polls", response_model=List[Poll])
async def get_all_polls():
    """Get all active polls"""
    try:
        polls = []
        async for poll in polls_collection.find({"active": True}):
            # Remove MongoDB _id field
            poll.pop("_id", None)
            polls.append(Poll(**poll))
        return polls
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching polls: {str(e)}")

@router.get("/api/polls/{poll_id}", response_model=Poll)
async def get_poll(poll_id: str):
    """Get a specific poll by ID"""
    try:
        poll = await polls_collection.find_one({"id": poll_id, "active": True})
        if poll:
            poll.pop("_id", None)
            return Poll(**poll)
        else:
            raise HTTPException(status_code=404, detail="Poll not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching poll: {str(e)}")

@router.post("/api/votes")
async def cast_vote(vote_request: VoteRequest, request: Request):
    """Cast a vote for a poll option"""
    try:
        # Get voter IP
        voter_ip = request.client.host
        
        # Check if poll exists and is active
        poll = await polls_collection.find_one({"id": vote_request.poll_id, "active": True})
        if not poll:
            raise HTTPException(status_code=404, detail="Poll not found or inactive")
        
        # Check if voter has already voted for this poll
        existing_vote = await votes_collection.find_one({
            "poll_id": vote_request.poll_id,
            "voter_ip": voter_ip
        })
        if existing_vote:
            raise HTTPException(status_code=400, detail="You have already voted for this poll")
        
        # Verify option exists
        option_exists = any(option["id"] == vote_request.option_id for option in poll["options"])
        if not option_exists:
            raise HTTPException(status_code=400, detail="Invalid option selected")
        
        # Create vote record
        vote = Vote(
            poll_id=vote_request.poll_id,
            option_id=vote_request.option_id,
            voter_ip=voter_ip
        )
        
        # Insert vote
        await votes_collection.insert_one(vote.dict())
        
        # Update vote count for the option
        await polls_collection.update_one(
            {"id": vote_request.poll_id, "options.id": vote_request.option_id},
            {"$inc": {"options.$.votes": 1}}
        )
        
        return {"message": "Vote cast successfully", "vote_id": vote.id}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error casting vote: {str(e)}")

@router.get("/api/polls/{poll_id}/results")
async def get_poll_results(poll_id: str):
    """Get results for a specific poll"""
    try:
        poll = await polls_collection.find_one({"id": poll_id})
        if not poll:
            raise HTTPException(status_code=404, detail="Poll not found")
        
        # Calculate total votes
        total_votes = sum(option["votes"] for option in poll["options"])
        
        # Prepare results
        results = {
            "poll_id": poll_id,
            "title": poll["title"],
            "description": poll["description"],
            "total_votes": total_votes,
            "options": []
        }
        
        for option in poll["options"]:
            percentage = (option["votes"] / total_votes * 100) if total_votes > 0 else 0
            results["options"].append({
                "id": option["id"],
                "title": option["title"],
                "description": option["description"],
                "votes": option["votes"],
                "percentage": round(percentage, 2)
            })
        
        return results
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting results: {str(e)}")

@router.delete("/api/polls/{poll_id}")
async def delete_poll(poll_id: str):
    """Deactivate a poll (soft delete)"""
    try:
        result = await polls_collection.update_one(
            {"id": poll_id},
            {"$set": {"active": False}}
        )
        
        if result.matched_count:
            return {"message": "Poll deactivated successfully"}
        else:
            raise HTTPException(status_code=404, detail="Poll not found")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deactivating poll: {str(e)}")