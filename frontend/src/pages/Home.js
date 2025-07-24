import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pollsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Notification from '../components/Notification';

const Home = () => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const data = await pollsAPI.getAllPolls();
      setPolls(data);
    } catch (error) {
      setNotification({
        message: error.message,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePoll = async (pollId) => {
    if (window.confirm('Are you sure you want to delete this poll?')) {
      try {
        await pollsAPI.deletePoll(pollId);
        setNotification({
          message: 'Poll deleted successfully!',
          type: 'success'
        });
        fetchPolls(); // Refresh the list
      } catch (error) {
        setNotification({
          message: error.message,
          type: 'error'
        });
      }
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading polls..." />;
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">
          Welcome to <span className="text-blue-600">VotingApp</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Create polls, gather opinions, and see real-time results
        </p>
        <Link
          to="/create"
          className="btn-primary text-lg px-8 py-3 inline-block"
        >
          Create New Poll
        </Link>
      </div>

      {/* Polls Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-semibold text-gray-800">Active Polls</h2>
          <button
            onClick={fetchPolls}
            className="btn-secondary"
          >
            Refresh
          </button>
        </div>

        {polls.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🗳️</div>
            <h3 className="text-2xl font-medium text-gray-600 mb-2">No polls available</h3>
            <p className="text-gray-500 mb-6">Be the first to create a poll and start collecting votes!</p>
            <Link to="/create" className="btn-primary">
              Create First Poll
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {polls.map((poll) => (
              <div key={poll.id} className="poll-card">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {poll.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {poll.description}
                </p>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">
                    {poll.options.length} options • Created: {new Date(poll.created_at).toLocaleDateString()}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {poll.options.slice(0, 3).map((option, index) => (
                      <span
                        key={index}
                        className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                      >
                        {option.title}
                      </span>
                    ))}
                    {poll.options.length > 3 && (
                      <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                        +{poll.options.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Link
                    to={`/vote/${poll.id}`}
                    className="flex-1 btn-primary text-center text-sm py-2"
                  >
                    Vote
                  </Link>
                  <Link
                    to={`/results/${poll.id}`}
                    className="flex-1 btn-secondary text-center text-sm py-2"
                  >
                    Results
                  </Link>
                  <button
                    onClick={() => handleDeletePoll(poll.id)}
                    className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition-colors"
                    title="Delete Poll"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats Section */}
      <div className="bg-white rounded-xl shadow-lg p-8 mt-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Platform Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {polls.length}
            </div>
            <div className="text-gray-600">Active Polls</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {polls.reduce((total, poll) => total + poll.options.reduce((sum, option) => sum + option.votes, 0), 0)}
            </div>
            <div className="text-gray-600">Total Votes</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {polls.reduce((total, poll) => total + poll.options.length, 0)}
            </div>
            <div className="text-gray-600">Poll Options</div>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default Home;