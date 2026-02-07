import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UploadPage from './pages/UploadPage';
import SharePage from './pages/SharePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UploadPage />} />
        <Route path="/share/:uniqueId" element={<SharePage />} />
      </Routes>
    </Router>
  );
}

export default App;
