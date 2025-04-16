'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import ChatInterface from '../components/ChatInterface';
import Sidebar from '../components/Sidebar';
import axios from 'axios';

export default function Dashboard() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/sign-in');
    } else if (userId) {
      // Fetch conversations
      axios.get('/api/conversations').then((response) => {
        setConversations(response.data);
      });
    }
  }, [isLoaded, userId, router]);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen">
      <Sidebar
        conversations={conversations}
        setSelectedConversation={setSelectedConversation}
      />
      <ChatInterface
        conversations={conversations}
        setConversations={setConversations}
      />
    </div>
  );
}