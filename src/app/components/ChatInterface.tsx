'use client';

import { useState } from 'react';
import axios from 'axios';

const ChatInterface = () => {
  const [name, setName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const createChatbot = async (apiKey: string) => {
    try {
      console.log('Creating chatbot with apiKey:', apiKey);
      const response = await axios.post('https://my-chatbot-factory.onrender.com/api/v1/chatbots/', 
        { name, prompt },
        { headers: { Authorization: `Bearer ${apiKey}` } }
      );
      console.log('Chatbot created:', response.data);
      setMessage('Chatbot created successfully!');
      setError(null);
    } catch (err: any) {
      console.error('Error creating chatbot:', err);
      console.log('Response status:', err.response?.status);
      console.log('Response data:', err.response?.data);
      setError(`Chatbot creation failed: ${err.response?.data?.message || err.message}`);
      setMessage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clerkToken = 'eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18ydlpnWU41ZENIY1B2cURYRkJzN2ZyNmlXOVMiLCJ0eXAiOiJKV1QifQ.eyJhenAiOiJodHRwOi8vbG9jYWxob3N0OjMwMDAiLCJleHAiOjE3NDQzODUxMzYsImZ2YSI6WzQyNywtMV0sImlhdCI6MTc0NDM4NTA3NiwiaXNzIjoiaHR0cHM6Ly9mcmFuay1idWxsLTQ4LmNsZXJrLmFjY291bnRzLmRldiIsIm5iZiI6MTc0NDM4NTA2Niwic2lkIjoic2Vzc18ydlpqTWRQcDJDQmZWNFVhQllvMjhzM2VOTFQiLCJzdWIiOiJ1c2VyXzJ2WmpNako3OU1KTTE2WmdjOHdTcGUwdUU4ZyJ9.KWsfQP0p1f6Yuw12IoiZMeYme58kRz6h-TjTnEorG9CIqox8hIJLh6IzxErg-Vz9HtFJd7NLlUkZWvDIfgQKK__xVbvCELIL1jm8s1gHtLzLfomjRT1POR0oi1k5Qs5IEDQw74aGYWCFg8z2i4g0ueTUSF2VvqQ6i_pWh_PZh3UFDy5dsQOsL5eVqgwLEsdwYB73VkXdW6DjnNJrzjlqknIVw6B6gNFgu8bIdR6npjgM8iag_O5Xdx0jtfLqCXpyR2SSp9kch-Sp75gmTsAHIU1x6a0ogZXVOzRIDMNKOAOxg6k63Oql2P1DFUgD68kRICs4SslKaJ0h1YgWnUH4Xw'; // Replace with dynamic token if needed
    await createChatbot(clerkToken);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Chatbot Name"
          required
        />
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Prompt"
          required
        />
        <button type="submit">Create Chatbot</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}
    </div>
  );
};

export default ChatInterface;