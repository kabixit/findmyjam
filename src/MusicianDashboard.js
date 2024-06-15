import React, { useState, useEffect } from 'react';
import { Box, Text, Stack, Button, Heading, Divider, Flex, Input, Textarea } from '@chakra-ui/react';
import { collection, doc, getDocs, query, where, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app, db } from './firebaseConfig';

const MusicianDashboard = () => {
  const [jamSessions, setJamSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newSessionForm, setNewSessionForm] = useState({
    time: '',
    location: '',
    genre: '',
    requiredInstruments: '',
    skillLevel: '',
    inviteFriends: '',
  });


  useEffect(() => {
    const fetchJamSessions = async () => {
      const auth = getAuth(app);
      const currentUser = auth.currentUser;

      if (!currentUser) {
        setError('User not authenticated.');
        return;
      }

      try {
        const sessionsQuery = query(collection(db, 'jamSessions'), where('hostId', '==', currentUser.uid));
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

    fetchJamSessions();
  }, []);

  const handleCreateSession = async (event) => {
    event.preventDefault();
    setError(null);

    const auth = getAuth(app);
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setError('User not authenticated.');
      return;
    }

    try {
      const sessionData = {
        ...newSessionForm,
        hostId: currentUser.uid,
      };

      const sessionRef = await addDoc(collection(db, 'jamSessions'), sessionData);
      console.log('Jam session created successfully:', sessionRef.id);

      // Redirect to session details or dashboard
    } catch (error) {
      setError('Failed to create jam session: ' + error.message);
      console.error('Error creating jam session:', error);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setNewSessionForm({ ...newSessionForm, [name]: value });
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
      <Heading as="h1" size="xl" mb={4}>Musician Dashboard</Heading>

      {/* Create Jam Session Form */}
      <Box bg="gray.100" p={4} mb={4} borderRadius="md">
        <Heading as="h2" size="md" mb={2}>Create a Jam Session</Heading>
        <form onSubmit={handleCreateSession}>
          <Stack spacing={4}>
            <Input
              type="datetime-local"
              name="time"
              value={newSessionForm.time}
              onChange={handleChange}
              placeholder="Time"
              required
            />
            <Input
              type="text"
              name="location"
              value={newSessionForm.location}
              onChange={handleChange}
              placeholder="Location"
              required
            />
            <Input
              type="text"
              name="genre"
              value={newSessionForm.genre}
              onChange={handleChange}
              placeholder="Genre"
              required
            />
            <Input
              type="text"
              name="requiredInstruments"
              value={newSessionForm.requiredInstruments}
              onChange={handleChange}
              placeholder="Required Instruments"
              required
            />
            <Input
              type="text"
              name="skillLevel"
              value={newSessionForm.skillLevel}
              onChange={handleChange}
              placeholder="Skill Level"
              required
            />
            <Textarea
              name="inviteFriends"
              value={newSessionForm.inviteFriends}
              onChange={handleChange}
              placeholder="Invite Friends"
              rows={2}
            />
            <Button type="submit" colorScheme="blue">Create Session</Button>
          </Stack>
        </form>
        {error && <Text color="red.500" mt={2}>{error}</Text>}
      </Box>

      {/* List of Jam Sessions */}
      <Box>
        <Heading as="h2" size="md" mb={2}>Your Jam Sessions</Heading>
        {jamSessions.length === 0 ? (
          <Text>No jam sessions found.</Text>
        ) : (
          <Stack spacing={4}>
            {jamSessions.map(session => (
              <Box key={session.id} bg="white" p={4} boxShadow="md" borderRadius="md">
                <Text><strong>Time:</strong> {session.time}</Text>
                <Text><strong>Location:</strong> {session.location}</Text>
                <Text><strong>Genre:</strong> {session.genre}</Text>
                <Text><strong>Required Instruments:</strong> {session.requiredInstruments}</Text>
                <Text><strong>Skill Level:</strong> {session.skillLevel}</Text>
                <Text><strong>Invite Friends:</strong> {session.inviteFriends}</Text>
                <Button colorScheme="blue">Edit Session</Button>
              </Box>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default MusicianDashboard;
