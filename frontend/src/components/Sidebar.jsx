import React from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import StorageIcon from '@mui/icons-material/Storage';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import MemoryOutlinedIcon from '@mui/icons-material/MemoryOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';

export default function Sidebar({ status, onRefreshStatus }) {
  const location = useLocation();

  const navItems = [
    { label: 'Chat & Search', path: '/', icon: <ChatOutlinedIcon sx={{ fontSize: 18 }} /> },
    { label: 'Privacy Policy', path: '/privacy', icon: <ShieldOutlinedIcon sx={{ fontSize: 18 }} /> },
    { label: 'Terms & Conditions', path: '/terms', icon: <GavelOutlinedIcon sx={{ fontSize: 18 }} /> },
  ];

  return (
    <Box
      component="aside"
      sx={{
        width: 260,
        height: '100vh',
        flexShrink: 0,
        borderRight: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        zIndex: 10
      }}
    >
      {/* SaaS Workspace Header */}
      <Box sx={{ p: 2.25, borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 1.25 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: '6px',
            backgroundColor: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            flexShrink: 0
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="20" height="20" fill="none">
            <path d="M16 6L26 11.77V20.23L16 26L6 20.23V11.77L16 6Z" stroke="#ffffff" strokeWidth="2.2" strokeLinejoin="round"/>
            <circle cx="16" cy="16" r="3.5" fill="#ffffff"/>
            <path d="M16 6V13M26 20.23L20 17.5M6 20.23L12 17.5" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.2, letterSpacing: '-0.01em' }}>
            DocuVault
          </Typography>
          <Typography variant="caption" sx={{ color: '#059669', fontWeight: 600, fontSize: '0.68rem', display: 'block' }}>
            Enterprise Knowledge OS
          </Typography>
        </Box>
      </Box>

      {/* Main SaaS Navigation */}
      <Box sx={{ px: 1.5, py: 2 }}>
        <Typography variant="caption" sx={{ px: 1, pb: 0.75, display: 'block', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.65rem' }}>
          Platform
        </Typography>
        <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  component={RouterLink}
                  to={item.path}
                  sx={{
                    borderRadius: 1.5,
                    py: 0.85,
                    px: 1.25,
                    backgroundColor: active ? '#ecfdf5' : 'transparent',
                    color: active ? '#047857' : '#475569',
                    border: '1px solid',
                    borderColor: active ? '#a7f3d0' : 'transparent',
                    fontWeight: active ? 600 : 500,
                    '&:hover': {
                      backgroundColor: active ? '#ecfdf5' : '#f8fafc',
                      color: active ? '#047857' : '#0f172a',
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 26, color: active ? '#10b981' : '#64748b' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: active ? 600 : 500 }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      <Divider sx={{ borderColor: '#f1f5f9' }} />

      {/* Indexed Documents Section */}
      <Box sx={{ p: 2, flex: 1, overflowY: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.25 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.65rem' }}>
            Vault Documents ({status?.available_files?.length || 0})
          </Typography>
          <IconButton size="small" onClick={onRefreshStatus} title="Refresh documents" sx={{ p: 0.5, color: '#94a3b8' }}>
            <RefreshIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          {status?.available_files && status.available_files.length > 0 ? (
            status.available_files.map((file, idx) => (
              <Box
                key={idx}
                sx={{
                  py: 0.85,
                  px: 1,
                  border: '1px solid #f1f5f9',
                  backgroundColor: '#f8fafc',
                  borderRadius: 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  '&:hover': {
                    borderColor: '#e2e8f0',
                    backgroundColor: '#ffffff'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
                  <InsertDriveFileOutlinedIcon sx={{ fontSize: 15, color: '#10b981', flexShrink: 0 }} />
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.72rem', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {file.name}
                  </Typography>
                </Box>
                <Chip
                  label={`${file.size_bytes} B`}
                  size="small"
                  sx={{ height: 18, fontSize: '0.6rem', backgroundColor: '#ffffff', color: '#64748b', border: '1px solid #e2e8f0' }}
                />
              </Box>
            ))
          ) : (
            <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.72rem' }}>
              No documents indexed.
            </Typography>
          )}
        </Box>
      </Box>

      {/* Bottom SaaS Telemetry Card */}
      <Box sx={{ p: 2, borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748b', display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.72rem' }}>
            <MemoryOutlinedIcon sx={{ fontSize: 14, color: '#10b981' }} />
            ChromaDB
          </Typography>
          <Chip
            label={`${status?.vector_count || 0} vectors`}
            size="small"
            sx={{ height: 18, fontSize: '0.65rem', backgroundColor: '#ecfdf5', color: '#047857', borderColor: '#a7f3d0', fontWeight: 600 }}
          />
        </Box>
        <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontSize: '0.68rem', fontFamily: 'monospace' }}>
          Ollama qwen3:4b-instruct
        </Typography>
        <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', fontSize: '0.65rem' }}>
          Transport: FastMCP stdio
        </Typography>
      </Box>
    </Box>
  );
}
