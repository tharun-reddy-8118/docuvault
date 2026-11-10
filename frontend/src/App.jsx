import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import theme from './theme';
import Sidebar from './components/Sidebar';
import Console from './pages/Console';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

export default function App() {
  const [status, setStatus] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (err) {
      console.error('Failed to load status:', err);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleFileUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    setUploadMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setUploadMessage({
          type: 'success',
          text: `Document ${data.filename} indexed (${data.vector_count} total vectors).`
        });
        fetchStatus();
        return data;
      } else {
        setUploadMessage({
          type: 'error',
          text: data.detail || 'Upload failed.'
        });
        return null;
      }
    } catch (err) {
      setUploadMessage({
        type: 'error',
        text: `Upload error: ${err.message}`
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#f8fafc' }}>
          {/* SaaS Navigation Sidebar (No upload here!) */}
          <Sidebar
            status={status}
            onRefreshStatus={fetchStatus}
          />

          {/* Main SaaS Workspace */}
          <Box component="main" sx={{ flex: 1, height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Routes>
              <Route
                path="/"
                element={
                  <Console
                    status={status}
                    onRefreshStatus={fetchStatus}
                    onFileUpload={handleFileUpload}
                    uploading={uploading}
                    uploadMessage={uploadMessage}
                  />
                }
              />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}
