// JoinJam.js

import React, { useState, useEffect } from 'react';
import { Box, Text, Stack, Button, Heading } from '@chakra-ui/react';
import { collection, getDocs, query, where, doc, updateDoc, getDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app, db } from './firebaseConfig';

const JoinJam = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const auth = getAuth(app);
    let unsubscribeFromAuth = null;

    unsubscribeFromAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const currentUser = auth.currentUser;

          // Fetch sessions that are not hosted by the current user
          const sessionsQuery = query(collection(db, 'jamSessions'), where('hostId', '!=', currentUser.email));
          const querySnapshot = await getDocs(sessionsQuery);
          const sessionsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

          // Fetch venue details for each session
          const sessionsWithVenues = await Promise.all(
            sessionsData.map(async session => {
              try {
                const venueQuery = query(collection(db, 'venues'), where('venueId', '==', session.venueId));
                const venueQuerySnapshot = await getDocs(venueQuery);
                if (!venueQuerySnapshot.empty) {
                  const venueData = venueQuerySnapshot.docs[0].data(); // Assuming venueId is unique, take the first result
                  return { ...session, venueName: venueData.name, venueLocation: venueData.location };
                } else {
                  return { ...session, venueName: 'Unknown', venueLocation: 'Unknown' }; // Fallback if venue not found
                }
              } catch (error) {
                console.error('Error fetching venue for session:', error);
                return { ...session, venueName: 'Unknown', venueLocation: 'Unknown' }; // Handle error fetching venue
              }
            })
          );

          setSessions(sessionsWithVenues);
          setLoading(false);
        } catch (error) {
          setError('Error fetching jam sessions: ' + error.message);
          console.error('Error fetching jam sessions:', error);
          setLoading(false);
        }
      } else {
        setError('User not authenticated.');
        setLoading(false);
      }
    });

    return () => {
      if (unsubscribeFromAuth) {
        unsubscribeFromAuth();
      }
    };
  }, []);

  const handleJoinSession = async (sessionId) => {
    setError(null);

    const auth = getAuth(app);
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setError('User not authenticated.');
      return;
    }

    try {
      // Fetch the session document to get current details
      const sessionRef = doc(db, 'jamSessions', sessionId);
      const sessionDoc = await sessionRef.get();

      if (!sessionDoc.exists()) {
        setError('Session not found.');
        return;
      }

      const sessionData = sessionDoc.data();

      // Update the session to add the current user as a member
      await updateDoc(sessionRef, {
        membersCount: sessionData.membersCount + 1,
        members: [...sessionData.members, currentUser.email]
      });

      // Optionally, you might want to update the UI or navigate the user somewhere else after joining.

    } catch (error) {
      setError('Failed to join jam session: ' + error.message);
      console.error('Error joining jam session:', error);
    }
  };

  if (loading) {
    return (
      <Box p={8} textAlign="center">
        <Text>Loading...</Text>
      </Box>
    );
  }

  return (
    <Box p={8}>

      {/* List of Jam Sessions */}
      <Box bg="black">
        <Heading as="h2" size="md" mb={2} color="white">Available Jam Sessions</Heading>
        {sessions.length === 0 ? (
          <Text color="white">No available jam sessions found.</Text>
        ) : (
          <Stack spacing={4}>
            {sessions.map(session => (
              <Box key={session.id} bg="black" p={4} boxShadow="md" borderRadius="md">
                <Text><strong>Time:</strong> {session.time}</Text>
                <Text><strong>Location:</strong> {session.venueLocation}</Text>
                <Text><strong>Venue:</strong> {session.venueName}</Text>
                <Text><strong>Genre:</strong> {session.genre}</Text>
                <Text>
                  <strong>Required Instruments:</strong>{' '}
                  {session.requiredInstruments.length === 1
                    ? session.requiredInstruments[0]
                    : session.requiredInstruments.join(', ')}
                </Text>
                <Button color="black" bg="white" marginTop="10px" onClick={() => handleJoinSession(session.id)}>
                  Join Session
                </Button>
              </Box>
            ))}
          </Stack>
        )}
        {error && <Text color="red.500" mt={2}>{error}</Text>}
      </Box>
    </Box>
  );
};

export default JoinJam;
