import React, { useState, useEffect } from 'react';
import { Box, Text, Stack, Button, Heading, Divider, Flex, Input, Textarea } from '@chakra-ui/react';
import { collection, doc, getDocs, query, where, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app, db } from './firebaseConfig';

const MusicianDashboard = () => {
  const [jamSessions, setJamSessions] = useState([]);
  const [venues, setVenues] = useState([]);
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
  const [selectedVenue, setSelectedVenue] = useState(null);

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const venuesQuery = query(collection(db, 'venues'));
        const querySnapshot = await getDocs(venuesQuery);
        const venuesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setVenues(venuesData);
      } catch (error) {
        setError('Error fetching venues: ' + error.message);
        console.error('Error fetching venues:', error);
      }
    };

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

    fetchVenues();
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
        venueId: selectedVenue.id,
        hostId: currentUser.uid,
      };

      const sessionRef = await addDoc(collection(db, 'jamSessions'), sessionData);
      console.log('Jam session created successfully:', sessionRef.id);

      setNewSessionForm({
        time: '',
        location: '',
        genre: '',
        requiredInstruments: '',
        skillLevel: '',
        inviteFriends: '',
      });
      setSelectedVenue(null);

    } catch (error) {
      setError('Failed to create jam session: ' + error.message);
      console.error('Error creating jam session:', error);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setNewSessionForm({ ...newSessionForm, [name]: value });
  };

  const handleSelectVenue = (venue) => {
    setSelectedVenue(venue);
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
      <Box bg="black" p={4} mb={4} borderRadius="md">
       
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
            <Stack spacing={2}>
              <Text fontWeight="bold">Select Venue:</Text>
              {venues.length === 0 ? (
                <Text>No venues found.</Text>
              ) : (
                venues.map(venue => (
                  <Box key={venue.id} bg="black" p={4} boxShadow="md" borderRadius="md">
                    <Text><strong>Name:</strong> {venue.name}</Text>
                    <Text><strong>Location:</strong> {venue.location}</Text>
                    <Text><strong>Availability:</strong> {venue.availability}</Text>
                    <Text><strong>Price per hour:</strong> ${venue.price}</Text>
                    <Button colorScheme="blue" onClick={() => handleSelectVenue(venue)}>Select Venue</Button>
                  </Box>
                ))
              )}
            </Stack>
            {selectedVenue && (
              <>
                <Text mt={4} fontWeight="bold">Selected Venue:</Text>
                <Box bg="black" p={4} boxShadow="md" borderRadius="md">
                  <Text><strong>Name:</strong> {selectedVenue.name}</Text>
                  <Text><strong>Location:</strong> {selectedVenue.location}</Text>
                  <Text><strong>Availability:</strong> {selectedVenue.availability}</Text>
                  <Text><strong>Price per hour:</strong> ${selectedVenue.price}</Text>
                </Box>
              </>
            )}
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
            <Button type="submit" colorScheme="blue" disabled={!selectedVenue}>Create Session</Button>
          </Stack>
        </form>
        {error && <Text color="red.500" mt={2}>{error}</Text>}
      </Box>

      {/* List of Jam Sessions */}
      <Box bg="black">
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
