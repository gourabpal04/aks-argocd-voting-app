from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from .routes import polls

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Voting App API",
    description="3-Tier Microservice Voting Application Backend",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(polls.router)

# Database configuration
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "voting_app")

@app.on_event("startup")
async def startup_event():
    """Initialize database connection on startup"""
    try:
        client = AsyncIOMotorClient(MONGO_URL)
        # Test connection
        await client.admin.command('ping')
        print(f"Connected to MongoDB at {MONGO_URL}")
        
        # Create indexes for better performance
        database = client[DATABASE_NAME]
        polls_collection = database.polls
        votes_collection = database.votes
        
        # Create index on poll_id and voter_ip for votes collection
        await votes_collection.create_index([("poll_id", 1), ("voter_ip", 1)], unique=True)
        await polls_collection.create_index([("id", 1)], unique=True)
        
        print("Database indexes created successfully")
        
    except Exception as e:
        print(f"Failed to connect to MongoDB: {e}")
        raise

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "voting-app-api",
        "version": "1.0.0"
    }

@app.get("/api/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to the Voting App API",
        "docs": "/docs",
        "health": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)