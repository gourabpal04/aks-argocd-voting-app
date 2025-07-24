import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { pollsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Notification from '../components/Notification';

const VotePage = () => {
  const { pollId } = useParams();
  const navigate = useNavigate();
  const [poll, setPoll] = useState(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchPoll();
  }, [pollId]);

  const fetchPoll = async () => {
    try {
      setLoading(true);
      const data = await pollsAPI.getPoll(pollId);
      setPoll(data);
    } catch (error) {
      setNotification({
        message: error.message,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!selectedOption) {
      setNotification({
        message: 'Please select an option to vote',
        type: 'warning'
      });
      return;
    }

    try {
      setVoting(true);
      await pollsAPI.castVote({
        poll_id: pollId,
        option_id: selectedOption
      });

      setNotification({
        message: 'Vote cast successfully!',
        type: 'success'
      });

      setTimeout(() => {
        navigate(`/results/${pollId}`);
      }, 1500);

    } catch (error) {
      setNotification({
        message: error.message,
        type: 'error'
      });
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading poll..." />;
  }

  if (!poll) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">❌</div>
        <h2 className="text-2xl font-medium text-gray-600 mb-2">Poll not found</h2>
        <p className="text-gray-500 mb-6">The poll you're looking for doesn't exist or has been deleted.</p>
        <Link to="/" className="btn-primary">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        {/* Poll Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-gray-800">{poll.title}</h1>
            <Link
              to={`/results/${pollId}`}
              className="btn-secondary text-sm"
            >
              View Results
            </Link>
          </div>
          <p className="text-gray-600 text-lg mb-4">{poll.description}</p>
          <div className="flex items-center text-sm text-gray-500">
            <span>Created: {new Date(poll.created_at).toLocaleDateString()}</span>
            <span className="mx-2">•</span>
            <span>{poll.options.length} options</span>
            <span className="mx-2">•</span>
            <span>
              {poll.options.reduce((total, option) => total + option.votes, 0)} total votes
            </span>
          </div>
        </div>

        {/* Voting Options */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Choose your option:</h2>
          <div className="space-y-4">
            {poll.options.map((option) => (
              <div
                key={option.id}
                className={`vote-option ${selectedOption === option.id ? 'selected' : ''}`}
                onClick={() => setSelectedOption(option.id)}
              >
                <div className="flex items-start">
                  <input
                    type="radio"
                    name="poll-option"
                    value={option.id}
                    checked={selectedOption === option.id}
                    onChange={() => setSelectedOption(option.id)}
                    className="mt-1 mr-4 w-4 h-4 text-blue-600"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800 mb-1">{option.title}</h3>
                    {option.description && (
                      <p className="text-gray-600 text-sm">{option.description}</p>
                    )}
                    <div className="mt-2 flex items-center text-xs text-gray-500">
                      <span>{option.votes} votes</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vote Actions */}
        <div className="flex space-x-4">
          <Link
            to="/"
            className="flex-1 btn-secondary text-center"
          >
            Back to Polls
          </Link>
          <button
            onClick={handleVote}
            disabled={!selectedOption || voting}
            className="flex-1 btn-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {voting ? (
              <>
                <div className="spinner mr-2"></div>
                Casting Vote...
              </>
            ) : (
              'Cast Your Vote'
            )}
          </button>
        </div>

        {/* Voting Guidelines */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Voting Guidelines:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• You can only vote once per poll</li>
            <li>• Your vote is anonymous and secure</li>
            <li>• Results are updated in real-time</li>
            <li>• You can view results after voting</li>
          </ul>
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

export default VotePage;