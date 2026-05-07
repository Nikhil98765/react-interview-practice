
import React, { useState } from 'react'
import { useWebSocket } from '../hooks/useWebSocket'

export const ChatUsingHook = () => {

  const [input, setInput] = useState('');
  
  const { messages, isConnected, disconnect, sendMessage } = useWebSocket("wss://echo.websocket.org");

  return (
    <div>
      <span style={{ color: isConnected ? "green" : "red" }}>
        {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
      </span>

      <div>
        {
          messages.map((message, i) => <p key={i}>{message.text}</p>)
        }
      </div>

      <input
        type="text"
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            sendMessage({ text: input });
            setInput("");
          } 
        }}
        value={input}
        placeholder='Enter a message...'
        disabled={!isConnected}
      />
      <button
        onClick={() => { sendMessage({text: input}); setInput('') }}
        disabled={!isConnected || !input}
      >
        Send
      </button>
    </div>
  );
}
