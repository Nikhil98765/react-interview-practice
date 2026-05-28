import React, { useEffect, useRef, useState } from 'react';

export const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const wsRef = useRef(null);

  useEffect(() => {
    const ws = new WebSocket('wss://echo.websocket.org');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('🚀 Connected!');
    };

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      console.log('🚀 ~ Chat ~ data:', data);
      setMessages((prev) => [...prev, data]);
    };

    ws.onerror = (e) => console.error('❌ Error: ', e);
    ws.onclose = () => console.log('🚀 Disconnected!');

    return () => ws.close();
  }, []);

  const sendMessages = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ text: input }));
      setInput('');
    }
  };

  return (
    <div>
      <div>
        {messages.map((msg, i) => (
          <p key={i}>{msg.text}</p>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button onClick={sendMessages}>Send</button>
    </div>
  );
};
