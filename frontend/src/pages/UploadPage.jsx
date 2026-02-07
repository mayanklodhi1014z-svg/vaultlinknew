import React, { useState } from 'react';
import { uploadContent } from '../services/api';
import TextUpload from '../components/TextUpload';
import FileUpload from '../components/FileUpload';
import ExpirySelector from '../components/ExpirySelector';
import { copyToClipboard } from '../utils/helpers';

const UploadPage = () => {
  const [uploadType, setUploadType] = useState('text');
  const [textContent, setTextContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [expiryDate, setExpiryDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setShareUrl('');
  
  // Validation
  if (uploadType === 'text' && !textContent.trim()) {
    setError('Please enter some text content');
    return;
  }
  
  if (uploadType === 'file' && !selectedFile) {
    setError('Please select a file to upload');
    return;
  }

  setLoading(true);

  try {
    const formData = new FormData();
    formData.append('type', uploadType);
    
    if (uploadType === 'text') {
      formData.append('content', textContent);
    } else {
      formData.append('file', selectedFile);
    }
    
if (expiryDate) {
  const localDate = new Date(expiryDate);
  
  // Get the timezone offset and adjust
  const timezoneOffset = localDate.getTimezoneOffset() * 60000; // offset in milliseconds
  const adjustedDate = new Date(localDate.getTime() - timezoneOffset);
  const isoDate = adjustedDate.toISOString();
  
  console.log('Expiry Date Selected (local):', expiryDate);
  console.log('Adjusted for timezone:', adjustedDate);
  console.log('ISO Format:', isoDate);
  console.log('Current Time:', new Date().toISOString());
  
  formData.append('expiryDate', isoDate);
}

    const response = await uploadContent(formData);
    // ... rest of the code
      
      if (response.success) {
        setShareUrl(response.shareUrl);
        // Reset form
        setTextContent('');
        setSelectedFile(null);
        setExpiryDate('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    const success = await copyToClipboard(shareUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNewUpload = () => {
    setShareUrl('');
    setError('');
    setCopied(false);
  };

  if (shareUrl) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800">
                Upload Successful!
              </h2>
              
              <p className="text-gray-600">
                Your content has been uploaded. Share the link below:
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg break-all">
                <p className="text-sm font-mono text-primary-600">{shareUrl}</p>
              </div>
              
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleCopyLink}
                  className={`px-6 py-3 rounded-lg font-medium transition ${
                    copied
                      ? 'bg-green-500 text-white'
                      : 'bg-primary-500 text-white hover:bg-primary-600'
                  }`}
                >
                  {copied ? '✓ Copied!' : 'Copy Link'}
                </button>
                
                <button
                  onClick={handleNewUpload}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
                >
                  New Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">VaultLink</h1>
          <p className="text-gray-600">Share text and files securely with generated links</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Upload Type Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Upload Type
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setUploadType('text')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${
                    uploadType === 'text'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📝 Text
                </button>
                <button
                  type="button"
                  onClick={() => setUploadType('file')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${
                    uploadType === 'file'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📁 File
                </button>
              </div>
            </div>

            {/* Content Upload */}
            {uploadType === 'text' ? (
              <TextUpload textContent={textContent} setTextContent={setTextContent} />
            ) : (
              <FileUpload selectedFile={selectedFile} setSelectedFile={setSelectedFile} />
            )}

            {/* Expiry Selector */}
            <ExpirySelector expiryDate={expiryDate} setExpiryDate={setExpiryDate} />

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Uploading...
                </span>
              ) : (
                'Generate Share Link'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
