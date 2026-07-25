import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let activeSocket: Socket | null = null;

    const connectSocket = async () => {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        if (!token) return;

        activeSocket = io('http://192.168.1.28:5000', {
          auth: { token },
          transports: ['websocket']
        });

        activeSocket.on('connect', () => {
          setConnected(true);
          console.log('🔌 Socket connection established successfully');
        });

        activeSocket.on('disconnect', () => {
          setConnected(false);
          console.log('🔌 Socket connection disconnected');
        });

        setSocket(activeSocket);
      } catch (error) {
        console.error('Socket client connection setup error:', error);
      }
    };

    connectSocket();

    return () => {
      if (activeSocket) {
        activeSocket.disconnect();
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within a SocketProvider');
  return context;
};
