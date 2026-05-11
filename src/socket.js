import { io } from 'socket.io-client';

// Use local backend URL for development, fallback to production
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5002";

const socket = io(API_URL, {
  transports: ["polling", "websocket"],
  withCredentials: true,
  timeout: 20000,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

// Connection status tracking
let connectionStatus = 'disconnected';
let reconnectAttempts = 0;

// Enhanced connection event listeners
socket.on('connect', () => {
    console.log('Socket connected successfully:', socket.id);
    connectionStatus = 'connected';
    reconnectAttempts = 0;
    
    // Rejoin any existing rooms after reconnection
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user._id) {
        socket.emit('user-reconnected', { userId: user._id });
    }
});

socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
    connectionStatus = 'disconnected';
    
    // If server initiated disconnect, don't reconnect
    if (reason === 'io server disconnect') {
        socket.connect();
    }
});

socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
    connectionStatus = 'error';
    reconnectAttempts++;
    
    // Implement exponential backoff for reconnection
    if (reconnectAttempts > 5) {
        console.warn('Multiple reconnection attempts, switching to polling');
        socket.io.opts.transports = ['polling'];
    }
});

socket.on('reconnect', (attemptNumber) => {
    console.log('Socket reconnected after', attemptNumber, 'attempts');
    connectionStatus = 'connected';
    reconnectAttempts = 0;
    
    // Reset to websocket after successful reconnection
    socket.io.opts.transports = ['websocket', 'polling'];
});

socket.on('reconnect_error', (error) => {
    console.error('Socket reconnection error:', error);
    connectionStatus = 'reconnecting';
});

socket.on('reconnect_failed', () => {
    console.error('Socket reconnection failed after all attempts');
    connectionStatus = 'failed';
});

// Enhanced error handling for specific events
socket.onAny((eventName, ...args) => {
    if (eventName.startsWith('error')) {
        console.error('Socket error event:', eventName, args);
    }
});

// Connection status utility
export const getConnectionStatus = () => connectionStatus;

export const isConnected = () => socket.connected && connectionStatus === 'connected';

// Manual reconnection utility
export const forceReconnect = () => {
    console.log('Forcing socket reconnection...');
    socket.disconnect();
    setTimeout(() => socket.connect(), 1000);
};

// Room management utilities
export const joinRoom = (roomId) => {
    if (isConnected()) {
        socket.emit('join-ride-room', roomId);
        console.log('Joined room:', roomId);
    } else {
        console.warn('Cannot join room, socket not connected');
    }
};

export const leaveRoom = (roomId) => {
    if (isConnected()) {
        socket.emit('leave-ride-room', roomId);
        console.log('Left room:', roomId);
    }
};
export { socket };