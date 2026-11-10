import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  IconButton,
  Alert
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import StorageIcon from '@mui/icons-material/Storage';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import AddIcon from '@mui/icons-material/Add';

export default function Console({ status, onRefreshStatus, onFileUpload, uploading, uploadMessage }) {
  const [messages, setMessages] = useState([
    {
      role: 'agent',
      content: 'System ready. The knowledge base is connected with your active document collections. You can ask questions about company policies, product specifications, or upload new documents.',
      latency_ms: null,
      tool_calls: []
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => 'session-' + Math.random().toString(36).substring(2, 9));
  const [isDragging, setIsDragging] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (e, customText) => {
    if (e) e.preventDefault();
    const queryText = (customText || input).trim();
    if (!queryText || loading) return;

    const userMessage = { role: 'user', content: queryText };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: queryText, session_id: sessionId })
      });

      if (!res.ok) {
        throw new Error(`API returned HTTP ${res.status}`);
      }

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: 'agent',
          content: data.answer,
          tool_calls: data.tool_calls || [],
          latency_ms: data.latency_ms
        }
      ]);
      if (onRefreshStatus) onRefreshStatus();
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'agent',
          content: `Error executing query: ${err.message}`,
          tool_calls: [],
          latency_ms: null,
          isError: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const result = await onFileUpload(file);
    if (result && result.success) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'agent',
          content: `Document indexed: ${result.filename}. You can now ask questions about this file.`,
          latency_ms: null,
          tool_calls: [{
            name: 'upload_document',
            query: result.path,
            status: result.message
          }]
        }
      ]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const result = await onFileUpload(e.dataTransfer.files[0]);
      if (result && result.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'agent',
            content: `Document indexed: ${result.filename}. You can now ask questions about this file.`,
            latency_ms: null,
            tool_calls: [{
              name: 'upload_document',
              query: result.path,
              status: result.message
            }]
          }
        ]);
      }
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'agent',
        content: 'Conversation history reset. Knowledge base remains active and connected. Enter a query below.',
        latency_ms: null,
        tool_calls: []
      }
    ]);
  };

  const suggestedQueries = [
    'Who is the lead architect of Project Falcon?',
    'What is the starting price of the Acme Titan Server?',
    'What are the working hours and Focus Fridays policy?'
  ];

  return (
    <Box
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100%',
        backgroundColor: '#f8fafc',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Hidden File Input Triggered by Top Button or Paperclip */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".txt,.md,.pdf"
        onChange={handleFileSelect}
      />

      {/* Drag Overlay Alert */}
      {isDragging && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 50,
            backgroundColor: 'rgba(236, 253, 245, 0.92)',
            border: '2px dashed #10b981',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1
          }}
        >
          <AttachFileIcon sx={{ fontSize: 48, color: '#10b981' }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#065f46' }}>
            Drop file to index into Knowledge Vault
          </Typography>
          <Typography variant="caption" sx={{ color: '#047857' }}>
            Accepts Plain Text, Markdown, and PDF
          </Typography>
        </Box>
      )}

      {/* Top SaaS App Header */}
      <Box
        sx={{
          px: 3.5,
          py: 2,
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0f172a', lineHeight: 1.2 }}>
              DocuVault Intelligence Console
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              Autonomous reasoning over indexed documents via Model Context Protocol.
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Chip
            icon={<CheckCircleIcon sx={{ fontSize: '14px !important', color: '#10b981' }} />}
            label="System Operational"
            size="small"
            sx={{ backgroundColor: '#ecfdf5', color: '#065f46', borderColor: '#a7f3d0', fontWeight: 500 }}
          />
          <Chip
            icon={<StorageIcon sx={{ fontSize: '14px !important', color: '#10b981' }} />}
            label={`${status?.vector_count || 0} Vectors`}
            size="small"
            sx={{ backgroundColor: '#ffffff', color: '#0f172a', borderColor: '#e2e8f0', fontWeight: 500 }}
          />

          {/* Upload Button in Top Bar (SaaS Standard) */}
          <Button
            size="small"
            variant="contained"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            startIcon={uploading ? <CircularProgress size={14} sx={{ color: '#ffffff' }} /> : <AddIcon sx={{ fontSize: 16 }} />}
            sx={{
              backgroundColor: '#10b981',
              color: '#ffffff',
              '&:hover': { backgroundColor: '#059669' }
            }}
          >
            {uploading ? 'Indexing...' : 'Upload File'}
          </Button>

          <Button
            size="small"
            variant="outlined"
            onClick={clearChat}
            startIcon={<ClearAllIcon sx={{ fontSize: 16 }} />}
            sx={{ color: '#64748b', borderColor: '#e2e8f0' }}
          >
            Reset
          </Button>
        </Box>
      </Box>

      {/* Upload Toast Banner (if any) */}
      {uploadMessage && (
        <Box sx={{ px: 3.5, pt: 1.5 }}>
          <Alert
            severity={uploadMessage.type === 'success' ? 'success' : 'error'}
            variant="outlined"
            sx={{
              py: 0.5,
              fontSize: '0.8rem',
              backgroundColor: uploadMessage.type === 'success' ? '#ecfdf5' : '#fef2f2',
              borderColor: uploadMessage.type === 'success' ? '#a7f3d0' : '#fecaca',
              color: uploadMessage.type === 'success' ? '#065f46' : '#991b1b',
            }}
          >
            {uploadMessage.text}
          </Alert>
        </Box>
      )}

      {/* Main Conversation Stream */}
      <Box
        sx={{
          flex: 1,
          p: { xs: 2, sm: 3.5 },
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5,
          backgroundColor: '#f8fafc',
        }}
      >
        {messages.map((msg, index) => (
          <Box
            key={index}
            sx={{
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: msg.role === 'user' ? '70%' : '80%',
              display: 'flex',
              flexDirection: 'column',
              gap: 0.75,
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 1.5,
                backgroundColor: msg.role === 'user' ? '#ecfdf5' : '#ffffff',
                border: '1px solid',
                borderColor: msg.role === 'user' ? '#a7f3d0' : msg.isError ? '#fecaca' : '#e2e8f0',
                color: msg.role === 'user' ? '#065f46' : '#0f172a',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
              }}
            >
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontSize: '0.875rem', lineHeight: 1.65 }}>
                {msg.content}
              </Typography>

              {/* Tool Invocations & Context Chunks */}
              {msg.tool_calls && msg.tool_calls.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  {msg.tool_calls.map((tool, tIdx) => (
                    <Accordion
                      key={tIdx}
                      elevation={0}
                      sx={{
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px !important',
                        '&:before': { display: 'none' },
                        mb: 1
                      }}
                    >
                      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: 16, color: '#64748b' }} />} sx={{ minHeight: 36, py: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={`Tool: ${tool.name}`}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.7rem',
                              fontFamily: 'monospace',
                              backgroundColor: '#ecfdf5',
                              color: '#047857',
                              borderColor: '#a7f3d0'
                            }}
                          />
                          {tool.query && (
                            <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#64748b', fontSize: '0.75rem' }}>
                              "{tool.query}"
                            </Typography>
                          )}
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails sx={{ pt: 0, pb: 1.5, px: 1.5, borderTop: '1px solid #e2e8f0' }}>
                        {tool.chunks && tool.chunks.length > 0 ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                            <Typography variant="caption" sx={{ color: '#065f46', fontWeight: 600 }}>
                              Grounded from ChromaDB Context Chunks ({tool.chunks.length}):
                            </Typography>
                            {tool.chunks.map((chunk, cIdx) => (
                              <Box
                                key={cIdx}
                                sx={{
                                  p: 1.5,
                                  backgroundColor: '#ffffff',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: 1,
                                  fontFamily: 'monospace',
                                  fontSize: '0.75rem',
                                  whiteSpace: 'pre-wrap',
                                  color: '#334155'
                                }}
                              >
                                {chunk}
                              </Box>
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="caption" sx={{ color: '#64748b' }}>
                            Status: {tool.status || 'Execution confirmed.'}
                          </Typography>
                        )}
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              )}
            </Paper>

            {/* Latency and Role Stamp */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 0.5 }}>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem', textTransform: 'capitalize' }}>
                {msg.role}
              </Typography>
              {msg.latency_ms !== null && msg.latency_ms !== undefined && (
                <Typography variant="caption" sx={{ color: '#10b981', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: 0.5, fontFamily: 'monospace' }}>
                  <SpeedOutlinedIcon sx={{ fontSize: 13 }} />
                  {msg.latency_ms} ms
                </Typography>
              )}
            </Box>
          </Box>
        ))}

        {loading && (
          <Box
            sx={{
              alignSelf: 'flex-start',
              p: 2,
              borderRadius: 1.5,
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
            }}
          >
            <CircularProgress size={16} sx={{ color: '#10b981' }} />
            <Typography variant="caption" sx={{ color: '#64748b', fontFamily: 'monospace' }}>
              Agent retrieving context and formulating grounded answer...
            </Typography>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* Suggested Queries Bar */}
      <Box sx={{ px: 3.5, py: 1.25, backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', flexShrink: 0 }}>
        <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
          Suggestions:
        </Typography>
        {suggestedQueries.map((q, idx) => (
          <Chip
            key={idx}
            label={q}
            size="small"
            onClick={() => handleSend(null, q)}
            sx={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              color: '#334155',
              cursor: 'pointer',
              fontSize: '0.72rem',
              '&:hover': {
                backgroundColor: '#ecfdf5',
                borderColor: '#a7f3d0',
                color: '#065f46'
              }
            }}
          />
        ))}
      </Box>

      {/* Bottom SaaS Chat Composer with Attach File Icon */}
      <Box
        component="form"
        onSubmit={handleSend}
        sx={{
          p: 2.5,
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
          display: 'flex',
          gap: 1.25,
          alignItems: 'center',
          flexShrink: 0
        }}
      >
        {/* Paperclip Upload Button directly in Composer */}
        <IconButton
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          title="Upload or attach document (.txt, .md, .pdf)"
          sx={{
            color: '#64748b',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 1.5,
            '&:hover': { color: '#10b981', borderColor: '#a7f3d0', backgroundColor: '#ecfdf5' }
          }}
        >
          {uploading ? <CircularProgress size={18} sx={{ color: '#10b981' }} /> : <AttachFileIcon sx={{ fontSize: 20 }} />}
        </IconButton>

        <TextField
          fullWidth
          size="small"
          placeholder="Ask a question about internal documents, Project Falcon, policies, or server specs..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          autoComplete="off"
          inputProps={{ style: { fontSize: '0.875rem', color: '#0f172a' } }}
        />

        <Button
          type="submit"
          variant="contained"
          disabled={loading || !input.trim()}
          sx={{
            minWidth: 95,
            height: 40,
            backgroundColor: '#10b981',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#059669',
            }
          }}
          endIcon={<SendIcon sx={{ fontSize: 16 }} />}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
}
