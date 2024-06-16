import React, { useState, useEffect } from 'react';
import { Box, Text, Stack } from '@chakra-ui/react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app, db } from './firebaseConfig';

const HostedJams = () => {
  const [jamSessions, setJamSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchJamSessions = async () => {
    const auth = getAuth(app);
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setError('User not authenticated.');
      return;
    }

    try {
      const sessionsQuery = query(collection(db, 'jamSessions'), where('hostId', '==', currentUser.email));
      const querySnapshot = await getDocs(sessionsQuery);
      const sessionsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setJamSessions(sessionsData);
    } catch (error) {
      setError('Error fetching jam sessions: ' + error.message);
      console.error('Error fetching jam sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJamSessions();
  }, []);

  if (loading) {
    return (
      <Box p={8} textAlign="center">
        <Text>Loading...</Text>
      </Box>
    );
  }

  return (
    <Box bg="black">
      <Text size="xxl" mb={2} color="white">Jams you Host</Text>
      {jamSessions.length === 0 ? (
        <Text color="white">No jam sessions found.</Text>
      ) : (
        <Stack spacing={4}>
          {jamSessions.map(session => (
            <Box key={session.id} bg="black" p={4} boxShadow="md" borderRadius="md" border="2px dashed #fff">
              <Text><strong>Time:</strong> {session.time}</Text>
              <Text><strong>Location:</strong> {session.location}</Text>
              <Text><strong>Genre:</strong> {session.genre}</Text>
              <Text>
                <strong>Required Instruments:</strong>{' '}
                {session.requiredInstruments.length === 1
                  ? session.requiredInstruments[0]
                  : session.requiredInstruments.join(', ')}
              </Text>
              <Text><strong>Jammers:</strong> {session.membersCount}</Text>
            </Box>
          ))}
        </Stack>
      )}
      {error && <Text color="red.500" mt={2}>{error}</Text>}
    </Box>
  );
};

export default HostedJams;
