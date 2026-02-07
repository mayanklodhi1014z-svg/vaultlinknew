import React from 'react';

const ExpirySelector = ({ expiryDate, setExpiryDate }) => {
  const handleQuickSelect = (minutes) => {
    const date = new Date();
    date.setMinutes(date.getMinutes() + minutes);
    setExpiryDate(date.toISOString().slice(0, 16));
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Expiry Date & Time (Optional)
      </label>
      
      <div className="flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => handleQuickSelect(10)}
          className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded-md transition"
        >
          10 min
        </button>
        <button
          type="button"
          onClick={() => handleQuickSelect(30)}
          className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded-md transition"
        >
          30 min
        </button>
        <button
          type="button"
          onClick={() => handleQuickSelect(60)}
          className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded-md transition"
        >
          1 hour
        </button>
        <button
          type="button"
          onClick={() => handleQuickSelect(1440)}
          className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded-md transition"
        >
          1 day
        </button>
      </div>

      <input
        type="datetime-local"
        value={expiryDate}
        onChange={(e) => setExpiryDate(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        min={new Date().toISOString().slice(0, 16)}
      />
      
      <p className="text-xs text-gray-500">
        Default: 10 minutes from now if not specified
      </p>
    </div>
  );
};

export default ExpirySelector;
