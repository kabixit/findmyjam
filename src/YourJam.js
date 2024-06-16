import React, { useState, useEffect } from 'react';
import { Box, Text, Stack, Heading } from '@chakra-ui/react';
import { collection, getDocs, query, where, getDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app, db } from './firebaseConfig';

const YourJam = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const auth = getAuth(app);
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setError('User not authenticated.');
      setLoading(false);
      return;
    }

    const fetchJamSessions = async () => {
      try {
        // Query jamMembers collection to find sessions where the current user is a member
        const jamMembersQuery = query(collection(db, 'jamMembers'), where('userEmail', '==', currentUser.email));
        const jamMembersSnapshot = await getDocs(jamMembersQuery);

        // Array to hold promises fetching session details from jamSessions and venues
        const sessionPromises = jamMembersSnapshot.docs.map(async (docSnapshot) => {
          const sessionData = docSnapshot.data();
          const sessionId = sessionData.sessionId;

          // Fetch session details from jamSessions collection
          const sessionRef = doc(db, 'jamSessions', sessionId);
          const sessionDoc = await getDoc(sessionRef);

          if (sessionDoc.exists()) {
            const sessionDetails = {
              id: sessionDoc.id,
              ...sessionDoc.data(),
              joinedAt: sessionData.joinedAt.toDate(), // Convert to JavaScript Date object
            };

            // Query the venues collection to find the venue based on venueId
            const venueQuery = query(collection(db, 'venues'), where('venueId', '==', sessionDetails.venueId));
            const venueSnapshot = await getDocs(venueQuery);

            if (!venueSnapshot.empty) {
              const venueData = venueSnapshot.docs[0].data(); // Assuming venueId is unique, take the first result
              return {
                ...sessionDetails,
                venueName: venueData.name,
                venueLocation: venueData.location
              };
            } else {
              console.error('Venue details not found for venueId:', sessionDetails.venueId);
              return {
                ...sessionDetails,
                venueName: 'Unknown',
                venueLocation: 'Unknown'
              };
            }
          } else {
            console.error('Session details not found for sessionId:', sessionId);
            return null;
          }
        });

        // Wait for all session details to be fetched
        const resolvedSessions = await Promise.all(sessionPromises);

        // Filter out null values (sessions not found)
        const filteredSessions = resolvedSessions.filter(session => session !== null);

        setSessions(filteredSessions);
        setLoading(false);
      } catch (error) {
        setError('Error fetching your jam sessions: ' + error.message);
        console.error('Error fetching your jam sessions:', error);
        setLoading(false);
      }
    };

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
    <Box p={8}>
      {/* List of Your Jam Sessions */}
      <Box bg="black">
        <Text size="xxl" mb={2} color="white">The Jams you are part of</Text>
        {sessions.length === 0 ? (
          <Text color="white">You haven't joined any jam sessions yet.</Text>
        ) : (
          <Stack spacing={4}>
            {sessions.map(session => (
              <Box key={session.id} bg="black" p={4} boxShadow="md" width="400px" borderRadius="md" border="2px dashed #fff">
                <Text><strong>Time:</strong> {session.time}</Text>
                <Text><strong>Location:</strong> {session.venueLocation}</Text>
                <Text><strong>Venue:</strong> {session.venueName}</Text>
                <Text><strong>Genre:</strong> {session.genre}</Text>
                <Text><strong>Joined At:</strong> {session.joinedAt.toLocaleString()}</Text>
              </Box>
            ))}
          </Stack>
        )}
        {error && <Text color="red.500" mt={2}>{error}</Text>}
      </Box>
    </Box>
  );
};

export default YourJam;
