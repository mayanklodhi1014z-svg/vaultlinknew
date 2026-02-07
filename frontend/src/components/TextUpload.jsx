import React from 'react';

const TextUpload = ({ textContent, setTextContent }) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Enter Text Content
      </label>
      <textarea
        value={textContent}
        onChange={(e) => setTextContent(e.target.value)}
        placeholder="Paste or type your text here..."
        rows={10}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none font-mono text-sm"
        maxLength={50000}
      />
      <p className="text-xs text-gray-500">
        {textContent.length} / 50,000 characters
      </p>
    </div>
  );
};

export default TextUpload;
