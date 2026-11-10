import React from 'react';
import { Container, Box, Typography, Paper, Divider } from '@mui/material';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';

export default function Privacy() {
  return (
    <Box sx={{ flex: 1, height: '100vh', overflowY: 'auto', p: { xs: 3, sm: 6 }, backgroundColor: '#f8fafc' }}>
      <Container maxWidth="md">
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: '#10b981' }}>
          <ShieldOutlinedIcon sx={{ fontSize: 18 }} />
          <Typography variant="caption" sx={{ fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
            Data Governance & Privacy
          </Typography>
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 600, letterSpacing: '-0.02em', mb: 1, color: '#0f172a' }}>
          Privacy Policy
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b' }}>
          Effective Date: November 9, 2026. Version 1.0.
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4.5 },
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 1.5,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, fontSize: '0.875rem', color: '#475569', lineHeight: 1.7 }}>
          <Box>
            <Typography variant="subtitle1" sx={{ color: '#0f172a', fontWeight: 600, mb: 1 }}>
              1. Local-First Processing Architecture
            </Typography>
            <Typography variant="body2" sx={{ color: '#475569' }}>
              DocuVault operates strictly under a local-first paradigm. Document ingestion, semantic chunking, and SQLite-backed Chroma vector store operations are executed entirely on your host environment. Your internal documents, uploaded files, and policy manuals are stored locally in the chroma_db directory and are never uploaded to a centralized application server.
            </Typography>
          </Box>

          <Divider sx={{ borderColor: '#e2e8f0' }} />

          <Box>
            <Typography variant="subtitle1" sx={{ color: '#0f172a', fontWeight: 600, mb: 1 }}>
              2. Vector Embeddings and External Network Boundaries
            </Typography>
            <Typography variant="body2" sx={{ color: '#475569' }}>
              When vector embeddings are created, text chunks are sent to the Google Generative AI Embeddings API (models/gemini-embedding-001) over TLS 1.3 encryption solely for computing 3072-dimensional vector representations. In accordance with Google Developer API service terms, customer data sent through paid or standard developer endpoints is not retained to train foundation models.
            </Typography>
          </Box>

          <Divider sx={{ borderColor: '#e2e8f0' }} />

          <Box>
            <Typography variant="subtitle1" sx={{ color: '#0f172a', fontWeight: 600, mb: 1 }}>
              3. Language Model Inference Data Flow
            </Typography>
            <Typography variant="body2" sx={{ color: '#475569' }}>
              When the engine is configured to execute via Ollama (qwen3:4b-instruct), all language model inference runs 100 percent locally on your machine via the local loopback interface (http://127.0.0.1:11434). In this operating mode, zero user prompts, zero conversation history, and zero retrieved context chunks leave your local device during the inference phase.
            </Typography>
          </Box>

          <Divider sx={{ borderColor: '#e2e8f0' }} />

          <Box>
            <Typography variant="subtitle1" sx={{ color: '#0f172a', fontWeight: 600, mb: 1 }}>
              4. Zero Telemetry and Zero Analytics
            </Typography>
            <Typography variant="body2" sx={{ color: '#475569' }}>
              This platform does not implement third-party analytics trackers, advertising identifiers, tracking pixels, or telemetry collectors. Standard web server logs are retained only within local process memory for active session debugging and loopback API communication.
            </Typography>
          </Box>

          <Divider sx={{ borderColor: '#e2e8f0' }} />

          <Box>
            <Typography variant="subtitle1" sx={{ color: '#0f172a', fontWeight: 600, mb: 1 }}>
              5. Session Memory and Data Deletion
            </Typography>
            <Typography variant="body2" sx={{ color: '#475569' }}>
              Conversational multi-turn memory is held in volatile memory through LangGraph MemorySaver. Conversation turns are cleared when the server is restarted or when the conversation is reset. To delete all indexed vector records, delete the local chroma_db folder on your storage drive.
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
    </Box>
  );
}
