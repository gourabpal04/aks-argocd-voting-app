#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for 3-Tier Voting Application
Tests all FastAPI endpoints and validates business logic
"""

import requests
import json
import time
import sys
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Get backend URL from environment
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'http://localhost:8001')
API_BASE_URL = f"{BACKEND_URL}/api"

class VotingAppTester:
    def __init__(self):
        self.base_url = API_BASE_URL
        self.test_results = []
        self.created_polls = []
        
    def log_test(self, test_name, success, message="", details=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        result = {
            "test": test_name,
            "status": status,
            "message": message,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        print(f"{status}: {test_name}")
        if message:
            print(f"   {message}")
        if details and not success:
            print(f"   Details: {details}")
        print()

    def test_health_check(self):
        """Test /api/health endpoint"""
        try:
            response = requests.get(f"{self.base_url}/health", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "healthy":
                    self.log_test("Health Check", True, "API is healthy and responding")
                    return True
                else:
                    self.log_test("Health Check", False, "Health check returned unexpected status", data)
                    return False
            else:
                self.log_test("Health Check", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test("Health Check", False, "Connection failed", str(e))
            return False

    def test_root_endpoint(self):
        """Test /api/ root endpoint"""
        try:
            response = requests.get(f"{self.base_url}/", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "docs" in data:
                    self.log_test("Root Endpoint", True, "Root endpoint responding correctly")
                    return True
                else:
                    self.log_test("Root Endpoint", False, "Root endpoint missing expected fields", data)
                    return False
            else:
                self.log_test("Root Endpoint", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test("Root Endpoint", False, "Connection failed", str(e))
            return False

    def test_create_poll(self):
        """Test POST /api/polls - Create new poll"""
        try:
            poll_data = {
                "title": "Favorite Programming Language",
                "description": "Vote for your favorite programming language for web development",
                "options": [
                    {"title": "Python", "description": "Great for backend development"},
                    {"title": "JavaScript", "description": "Essential for frontend"},
                    {"title": "Java", "description": "Enterprise-grade applications"},
                    {"title": "Go", "description": "Fast and efficient"}
                ]
            }
            
            response = requests.post(
                f"{self.base_url}/polls",
                json=poll_data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if "id" in data and "title" in data and "options" in data:
                    self.created_polls.append(data["id"])
                    self.log_test("Create Poll", True, f"Poll created successfully with ID: {data['id']}")
                    return data
                else:
                    self.log_test("Create Poll", False, "Poll creation response missing required fields", data)
                    return None
            else:
                self.log_test("Create Poll", False, f"HTTP {response.status_code}", response.text)
                return None
                
        except requests.exceptions.RequestException as e:
            self.log_test("Create Poll", False, "Connection failed", str(e))
            return None

    def test_get_all_polls(self):
        """Test GET /api/polls - Get all active polls"""
        try:
            response = requests.get(f"{self.base_url}/polls", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    poll_count = len(data)
                    self.log_test("Get All Polls", True, f"Retrieved {poll_count} active polls")
                    return data
                else:
                    self.log_test("Get All Polls", False, "Response is not a list", data)
                    return None
            else:
                self.log_test("Get All Polls", False, f"HTTP {response.status_code}", response.text)
                return None
                
        except requests.exceptions.RequestException as e:
            self.log_test("Get All Polls", False, "Connection failed", str(e))
            return None

    def test_get_specific_poll(self, poll_id):
        """Test GET /api/polls/{poll_id} - Get specific poll"""
        try:
            response = requests.get(f"{self.base_url}/polls/{poll_id}", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("id") == poll_id:
                    self.log_test("Get Specific Poll", True, f"Retrieved poll {poll_id} successfully")
                    return data
                else:
                    self.log_test("Get Specific Poll", False, "Poll ID mismatch", data)
                    return None
            elif response.status_code == 404:
                self.log_test("Get Specific Poll", False, "Poll not found", response.text)
                return None
            else:
                self.log_test("Get Specific Poll", False, f"HTTP {response.status_code}", response.text)
                return None
                
        except requests.exceptions.RequestException as e:
            self.log_test("Get Specific Poll", False, "Connection failed", str(e))
            return None

    def test_cast_vote(self, poll_id, option_id):
        """Test POST /api/votes - Cast a vote"""
        try:
            vote_data = {
                "poll_id": poll_id,
                "option_id": option_id
            }
            
            response = requests.post(
                f"{self.base_url}/votes",
                json=vote_data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "vote_id" in data:
                    self.log_test("Cast Vote", True, f"Vote cast successfully: {data['message']}")
                    return data
                else:
                    self.log_test("Cast Vote", False, "Vote response missing required fields", data)
                    return None
            elif response.status_code == 400:
                # This might be expected if already voted
                data = response.json()
                if "already voted" in data.get("detail", "").lower():
                    self.log_test("Duplicate Vote Prevention", True, "Correctly prevented duplicate voting")
                    return {"duplicate_prevented": True}
                else:
                    self.log_test("Cast Vote", False, f"Bad request: {data.get('detail')}")
                    return None
            else:
                self.log_test("Cast Vote", False, f"HTTP {response.status_code}", response.text)
                return None
                
        except requests.exceptions.RequestException as e:
            self.log_test("Cast Vote", False, "Connection failed", str(e))
            return None

    def test_duplicate_vote_prevention(self, poll_id, option_id):
        """Test duplicate vote prevention"""
        try:
            # Try to vote again with same IP
            vote_data = {
                "poll_id": poll_id,
                "option_id": option_id
            }
            
            response = requests.post(
                f"{self.base_url}/votes",
                json=vote_data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 400:
                data = response.json()
                if "already voted" in data.get("detail", "").lower():
                    self.log_test("Duplicate Vote Prevention", True, "Successfully prevented duplicate voting")
                    return True
                else:
                    self.log_test("Duplicate Vote Prevention", False, f"Unexpected error: {data.get('detail')}")
                    return False
            else:
                self.log_test("Duplicate Vote Prevention", False, "Should have prevented duplicate vote", response.text)
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test("Duplicate Vote Prevention", False, "Connection failed", str(e))
            return False

    def test_get_poll_results(self, poll_id):
        """Test GET /api/polls/{poll_id}/results - Get poll results"""
        try:
            response = requests.get(f"{self.base_url}/polls/{poll_id}/results", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["poll_id", "title", "total_votes", "options"]
                if all(field in data for field in required_fields):
                    total_votes = data["total_votes"]
                    options_count = len(data["options"])
                    
                    # Verify percentage calculations
                    percentage_sum = sum(option.get("percentage", 0) for option in data["options"])
                    percentage_valid = abs(percentage_sum - 100.0) < 0.1 if total_votes > 0 else percentage_sum == 0
                    
                    if percentage_valid:
                        self.log_test("Get Poll Results", True, 
                                    f"Results retrieved: {total_votes} votes, {options_count} options, percentages valid")
                        return data
                    else:
                        self.log_test("Get Poll Results", False, 
                                    f"Percentage calculation error: sum={percentage_sum}")
                        return None
                else:
                    missing_fields = [f for f in required_fields if f not in data]
                    self.log_test("Get Poll Results", False, f"Missing fields: {missing_fields}", data)
                    return None
            else:
                self.log_test("Get Poll Results", False, f"HTTP {response.status_code}", response.text)
                return None
                
        except requests.exceptions.RequestException as e:
            self.log_test("Get Poll Results", False, "Connection failed", str(e))
            return None

    def test_invalid_poll_operations(self):
        """Test error handling for invalid operations"""
        # Test getting non-existent poll
        fake_poll_id = "non-existent-poll-id"
        response = requests.get(f"{self.base_url}/polls/{fake_poll_id}")
        
        if response.status_code == 404:
            self.log_test("Invalid Poll Handling", True, "Correctly returned 404 for non-existent poll")
        else:
            self.log_test("Invalid Poll Handling", False, f"Expected 404, got {response.status_code}")

        # Test voting for non-existent poll
        vote_data = {"poll_id": fake_poll_id, "option_id": "fake-option"}
        response = requests.post(f"{self.base_url}/votes", json=vote_data)
        
        if response.status_code in [404, 400]:
            self.log_test("Invalid Vote Handling", True, "Correctly rejected vote for non-existent poll")
        else:
            self.log_test("Invalid Vote Handling", False, f"Expected 404/400, got {response.status_code}")

    def test_poll_deactivation(self, poll_id):
        """Test DELETE /api/polls/{poll_id} - Deactivate poll"""
        try:
            response = requests.delete(f"{self.base_url}/polls/{poll_id}", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "deactivated" in data.get("message", "").lower():
                    self.log_test("Poll Deactivation", True, "Poll deactivated successfully")
                    return True
                else:
                    self.log_test("Poll Deactivation", False, "Unexpected deactivation response", data)
                    return False
            elif response.status_code == 404:
                self.log_test("Poll Deactivation", False, "Poll not found for deactivation")
                return False
            else:
                self.log_test("Poll Deactivation", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test("Poll Deactivation", False, "Connection failed", str(e))
            return False

    def run_comprehensive_tests(self):
        """Run all backend tests in sequence"""
        print("=" * 60)
        print("STARTING COMPREHENSIVE BACKEND API TESTING")
        print(f"Backend URL: {self.base_url}")
        print("=" * 60)
        print()

        # 1. Health and connectivity tests
        print("🔍 TESTING BASIC CONNECTIVITY...")
        health_ok = self.test_health_check()
        root_ok = self.test_root_endpoint()
        
        if not health_ok:
            print("❌ CRITICAL: Health check failed. Backend may not be running.")
            return False

        # 2. Poll management tests
        print("📊 TESTING POLL MANAGEMENT...")
        created_poll = self.test_create_poll()
        all_polls = self.test_get_all_polls()
        
        if not created_poll:
            print("❌ CRITICAL: Cannot create polls. Skipping dependent tests.")
            return False

        poll_id = created_poll["id"]
        specific_poll = self.test_get_specific_poll(poll_id)

        # 3. Voting system tests
        print("🗳️  TESTING VOTING SYSTEM...")
        if created_poll and len(created_poll["options"]) > 0:
            option_id = created_poll["options"][0]["id"]
            
            # Test first vote
            vote_result = self.test_cast_vote(poll_id, option_id)
            
            # Test duplicate vote prevention
            if vote_result and not vote_result.get("duplicate_prevented"):
                self.test_duplicate_vote_prevention(poll_id, option_id)

        # 4. Results system tests
        print("📈 TESTING RESULTS SYSTEM...")
        results = self.test_get_poll_results(poll_id)

        # 5. Error handling tests
        print("⚠️  TESTING ERROR HANDLING...")
        self.test_invalid_poll_operations()

        # 6. Poll lifecycle tests
        print("🔄 TESTING POLL LIFECYCLE...")
        self.test_poll_deactivation(poll_id)

        # Summary
        print("=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if "✅" in r["status"]])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        print()

        # Show failed tests
        if failed_tests > 0:
            print("FAILED TESTS:")
            for result in self.test_results:
                if "❌" in result["status"]:
                    print(f"  - {result['test']}: {result['message']}")
            print()

        return failed_tests == 0

def main():
    """Main test execution"""
    print("Starting Backend API Testing...")
    print(f"Using Backend URL: {API_BASE_URL}")
    print()
    
    tester = VotingAppTester()
    success = tester.run_comprehensive_tests()
    
    if success:
        print("🎉 ALL TESTS PASSED! Backend API is working correctly.")
        sys.exit(0)
    else:
        print("💥 SOME TESTS FAILED! Check the results above.")
        sys.exit(1)

if __name__ == "__main__":
    main()