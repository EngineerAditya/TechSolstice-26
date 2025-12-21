'use client';

import { useState, FormEvent } from 'react';

// Define the structure of the chatbot's reply based on your backend
interface ChatbotReply {
  shortAnswer: string;
  detailedAnswer: string;
  success: boolean;
}

interface ApiResponse {
  reply: ChatbotReply;
}

export default function Chat() {
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ user: string; bot: ChatbotReply }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userInput.trim() || isLoading) return;

    setIsLoading(true);
    const message = userInput;
    setUserInput('');

    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data: ApiResponse = await response.json();
      
      setChatHistory(prev => [...prev, { user: message, bot: data.reply }]);

    } catch (error) {
      console.error('Failed to fetch chatbot reply:', error);
      // Optionally, display an error message in the chat
      const errorReply: ChatbotReply = {
        shortAnswer: "Connection Error",
        detailedAnswer: "Sorry, I couldn't connect to the server. Please try again later.",
        success: false,
      };
      setChatHistory(prev => [...prev, { user: message, bot: errorReply }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1>Chat with SolsticeBot</h1>
      <div className="chat-window" style={{ height: '400px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px' }}>
        {chatHistory.map((chat, index) => (
          <div key={index}>
            <p><strong>You:</strong> {chat.user}</p>
            <p><strong>Bot:</strong> {chat.bot.shortAnswer}</p>
            <p>{chat.bot.detailedAnswer}</p>
            <hr />
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Ask me anything..."
          disabled={isLoading}
          style={{ width: '80%', padding: '10px' }}
        />
        <button type="submit" disabled={isLoading} style={{ width: '19%', padding: '10px' }}>
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}