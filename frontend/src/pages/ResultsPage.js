import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { pollsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Notification from '../components/Notification';

const ResultsPage = () => {
  const { pollId } = useParams();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchResults();
    
    // Auto-refresh results every 10 seconds
    const interval = setInterval(fetchResults, 10000);
    return () => clearInterval(interval);
  }, [pollId]);

  const fetchResults = async () => {
    try {
      if (!loading) setLoading(false); // Only show loading on initial load
      const data = await pollsAPI.getPollResults(pollId);
      setResults(data);
    } catch (error) {
      setNotification({
        message: error.message,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const getWinningOption = () => {
    if (!results || !results.options.length) return null;
    return results.options.reduce((winner, option) => 
      option.votes > winner.votes ? option : winner
    );
  };

  const formatPercentage = (percentage) => {
    return percentage === 0 ? '0%' : `${percentage}%`;
  };

  if (loading) {
    return <LoadingSpinner text="Loading results..." />;
  }

  if (!results) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">❌</div>
        <h2 className="text-2xl font-medium text-gray-600 mb-2">Results not available</h2>
        <p className="text-gray-500 mb-6">Unable to load results for this poll.</p>
        <Link to="/" className="btn-primary">
          Back to Home
        </Link>
      </div>
    );
  }

  const winningOption = getWinningOption();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        {/* Results Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-gray-800">{results.title}</h1>
            <div className="flex space-x-2">
              <button
                onClick={fetchResults}
                className="btn-secondary text-sm"
                title="Refresh Results"
              >
                🔄 Refresh
              </button>
              <Link
                to={`/vote/${pollId}`}
                className="btn-primary text-sm"
              >
                Vote
              </Link>
            </div>
          </div>
          <p className="text-gray-600 text-lg mb-4">{results.description}</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {results.total_votes}
            </div>
            <div className="text-sm text-blue-800">Total Votes</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {results.options.length}
            </div>
            <div className="text-sm text-green-800">Options</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {winningOption ? formatPercentage(winningOption.percentage) : '0%'}
            </div>
            <div className="text-sm text-purple-800">Leading Option</div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Results:</h2>
          
          {results.total_votes === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="text-4xl mb-4">🗳️</div>
              <h3 className="text-xl font-medium text-gray-600 mb-2">No votes yet</h3>
              <p className="text-gray-500 mb-4">Be the first to vote and see the results!</p>
              <Link to={`/vote/${pollId}`} className="btn-primary">
                Cast Your Vote
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {results.options
                .sort((a, b) => b.votes - a.votes)
                .map((option, index) => (
                <div key={option.id} className="result-item">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <h3 className="font-semibold text-gray-800 mr-2">
                          {option.title}
                        </h3>
                        {index === 0 && results.total_votes > 0 && (
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                            🏆 Leading
                          </span>
                        )}
                      </div>
                      {option.description && (
                        <p className="text-sm text-gray-600 mb-2">{option.description}</p>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <div className="font-bold text-lg text-gray-800">
                        {option.votes}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatPercentage(option.percentage)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="progress-bar"
                      style={{ width: `${option.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-4">
          <Link to="/" className="btn-secondary">
            Back to Home
          </Link>
          <Link to={`/vote/${pollId}`} className="btn-primary">
            Vote on This Poll
          </Link>
        </div>

        {/* Auto-refresh Notice */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Results are automatically updated every 10 seconds
          </p>
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

export default ResultsPage;