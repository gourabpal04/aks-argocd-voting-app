// MongoDB initialization script for voting app
// This script runs when the MongoDB container starts for the first time

print("Starting voting app database initialization...");

// Switch to voting_app database
db = db.getSiblingDB('voting_app');

// Create collections
db.createCollection('polls');
db.createCollection('votes');

// Create indexes for better performance
db.polls.createIndex({ "id": 1 }, { unique: true });
db.polls.createIndex({ "active": 1 });
db.polls.createIndex({ "created_at": 1 });

db.votes.createIndex({ "poll_id": 1, "voter_ip": 1 }, { unique: true });
db.votes.createIndex({ "poll_id": 1 });
db.votes.createIndex({ "timestamp": 1 });

// Insert sample poll for testing
const samplePoll = {
  id: "sample-poll-001",
  title: "What's your favorite programming language?",
  description: "Vote for your preferred programming language for backend development",
  options: [
    {
      id: "option-001",
      title: "Python",
      description: "Great for data science and web development",
      votes: 0
    },
    {
      id: "option-002", 
      title: "JavaScript",
      description: "Full-stack development with Node.js",
      votes: 0
    },
    {
      id: "option-003",
      title: "Java",
      description: "Enterprise-grade applications",
      votes: 0
    },
    {
      id: "option-004",
      title: "Go",
      description: "Fast and efficient for microservices",
      votes: 0
    }
  ],
  created_at: new Date(),
  active: true
};

try {
  db.polls.insertOne(samplePoll);
  print("Sample poll inserted successfully");
} catch (error) {
  print("Error inserting sample poll: " + error);
}

// Create user for application access (if needed)
db.createUser({
  user: "voting_app_user",
  pwd: "voting_app_password",
  roles: [
    { role: "readWrite", db: "voting_app" }
  ]
});

print("Database initialization completed successfully!");
print("Collections created: polls, votes");
print("Indexes created for performance optimization");
print("Sample poll inserted for testing");