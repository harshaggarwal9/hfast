import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const roleOptions = [
  { label: 'Students', value: 'student' },
  { label: 'Parents', value: 'parent' },
  { label: 'Teachers', value: 'teacher' }
];

export default function CreateNotification() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleCheckbox = (role) => {
    setTargets(prev =>
      prev.includes(role)
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const resetForm = () => {
    setTitle('');
    setMessage('');
    setTargets([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !message || targets.length === 0) {
      toast.error('Please fill all fields and select at least one target role');
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        '/api/notification/create',
        { title, message, targetRoles: targets },
        { withCredentials: true }
      );
      toast.success('Notification sent!');
      resetForm();
    } catch (err) {
      console.error(err);
      toast.error('Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl w-full mx-auto p-4 sm:p-6 bg-base-100 shadow-lg rounded-2xl">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center sm:text-left">
        Create Notification
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="label">
            <span className="label-text">Title</span>
          </label>
          <input
            type="text"
            placeholder="Notification title"
            className="input input-bordered w-full"
            value={title}
            onChange={e => setTitle(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Message */}
        <div>
          <label className="label">
            <span className="label-text">Message</span>
          </label>
          <textarea
            placeholder="Notification message"
            className="textarea textarea-bordered w-full"
            rows={4}
            value={message}
            onChange={e => setMessage(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Role Selection */}
        <div>
          <span className="label-text font-medium">Send To:</span>
          <div className="flex flex-wrap gap-4 mt-2">
            {roleOptions.map(opt => (
              <label key={opt.value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={targets.includes(opt.value)}
                  onChange={() => handleCheckbox(opt.value)}
                  disabled={loading}
                />
                <span className="text-sm">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className={`btn btn-primary w-full mt-4 ${loading ? 'loading' : ''}`}
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send Notification'}
        </button>
      </form>
    </div>
  );
}
