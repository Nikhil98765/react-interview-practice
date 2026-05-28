import { useCallback, useEffect, useRef, useState } from 'react';

export const useWebSocket = (url) => {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  const wsRef = useRef(null);
  const shouldReconnect = useRef(true);
  const reconnectCount = useRef(0);
  const reconnectTimer = useRef(null);
  const MAX_RECONNECTS = 5;

  const connect = useCallback(() => {
    if (wsRef.current) wsRef.current.close();

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      reconnectCount.current = 0;
    };

    ws.onmessage = (e) => {
      let message;
      try {
        message = JSON.parse(e.data);
      } catch {
        message = e.data;
      }
      console.log('🚀 ~ useWebSocket ~ message:', message);
      setMessages((prev) => [...prev, message]);
    };

    ws.onclose = () => {
      setIsConnected(false);
      if (shouldReconnect.current && reconnectCount.current < MAX_RECONNECTS) {
        reconnectCount.current++;
        reconnectTimer.current = setTimeout(connect, 3000);
      }
    };

    ws.onerror = (e) => console.error('WebSocket error: ', e);
  }, [url]);

  useEffect(() => {
    shouldReconnect.current = true;
    connect();

    return () => {
      shouldReconnect.current = false;
      clearTimeout(reconnectTimer.current);
      wsRef.current.close();
    };
  }, [connect]);

  const sendMessage = useCallback((data) => {
    console.log('🚀 ~ useWebSocket ~ data:', data);
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        typeof data === 'string' ? data : JSON.stringify(data),
      );
    } else {
      console.warn('Websocket not connected, message not sent!');
    }
  }, []);

  const disconnect = useCallback(() => {
    shouldReconnect.current = false;
    wsRef.current.close();
  }, []);

  return { messages, sendMessage, disconnect, isConnected };
};
