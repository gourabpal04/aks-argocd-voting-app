import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pollsAPI } from '../services/api';
import Notification from '../components/Notification';

const CreatePoll = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    options: [
      { title: '', description: '' },
      { title: '', description: '' }
    ]
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOptionChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((option, i) => 
        i === index ? { ...option, [field]: value } : option
      )
    }));
  };

  const addOption = () => {
    if (formData.options.length < 10) {
      setFormData(prev => ({
        ...prev,
        options: [...prev.options, { title: '', description: '' }]
      }));
    }
  };

  const removeOption = (index) => {
    if (formData.options.length > 2) {
      setFormData(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      setNotification({
        message: 'Poll title is required',
        type: 'error'
      });
      return;
    }

    if (!formData.description.trim()) {
      setNotification({
        message: 'Poll description is required',
        type: 'error'
      });
      return;
    }

    const validOptions = formData.options.filter(option => option.title.trim());
    if (validOptions.length < 2) {
      setNotification({
        message: 'At least 2 options are required',
        type: 'error'
      });
      return;
    }

    try {
      setLoading(true);
      const pollData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        options: validOptions.map(option => ({
          title: option.title.trim(),
          description: option.description.trim() || ''
        }))
      };

      const createdPoll = await pollsAPI.createPoll(pollData);
      
      setNotification({
        message: 'Poll created successfully!',
        type: 'success'
      });

      setTimeout(() => {
        navigate(`/vote/${createdPoll.id}`);
      }, 1500);

    } catch (error) {
      setNotification({
        message: error.message,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Create New Poll</h1>
        <p className="text-gray-600 mb-8">Create a poll and start collecting votes from your audience</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Poll Title */}
          <div>
            <label className="form-label">
              Poll Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="form-input"
              placeholder="What's your poll about?"
              maxLength={200}
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.title.length}/200 characters
            </p>
          </div>

          {/* Poll Description */}
          <div>
            <label className="form-label">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="form-input h-24 resize-none"
              placeholder="Provide more details about your poll..."
              maxLength={500}
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.description.length}/500 characters
            </p>
          </div>

          {/* Poll Options */}
          <div>
            <label className="form-label">
              Poll Options * (minimum 2 required)
            </label>
            <div className="space-y-4">
              {formData.options.map((option, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-700">Option {index + 1}</h4>
                    {formData.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={option.title}
                      onChange={(e) => handleOptionChange(index, 'title', e.target.value)}
                      className="form-input"
                      placeholder={`Option ${index + 1} title`}
                      maxLength={100}
                      required
                    />
                    <input
                      type="text"
                      value={option.description}
                      onChange={(e) => handleOptionChange(index, 'description', e.target.value)}
                      className="form-input"
                      placeholder={`Option ${index + 1} description (optional)`}
                      maxLength={200}
                    />
                  </div>
                </div>
              ))}
            </div>

            {formData.options.length < 10 && (
              <button
                type="button"
                onClick={addOption}
                className="mt-4 w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
              >
                + Add Another Option
              </button>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex space-x-4 pt-6">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner mr-2"></div>
                  Creating...
                </>
              ) : (
                'Create Poll'
              )}
            </button>
          </div>
        </form>
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

export default CreatePoll;