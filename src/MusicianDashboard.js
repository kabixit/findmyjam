import React, { useState, useEffect } from 'react';
import { Box, Text, Stack, Button, Heading, Input, Grid, Checkbox } from '@chakra-ui/react';
import { collection, getDocs, query, where, addDoc, updateDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app, db } from './firebaseConfig';

const MusicianDashboard = () => {
  const [jamSessions, setJamSessions] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newSessionForm, setNewSessionForm] = useState({
    time: '',
    genre: '',
    requiredInstruments: [],
  });
  const [selectedVenue, setSelectedVenue] = useState(null);

  const fetchVenues = async () => {
    try {
      const venuesQuery = query(collection(db, 'venues'), where('availability', '==', 'open'));
      const querySnapshot = await getDocs(venuesQuery);
      const venuesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVenues(venuesData);
    } catch (error) {
      setError('Error fetching venues: ' + error.message);
      console.error('Error fetching venues:', error);
    } finally {
      setLoading(false);
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

    if (!selectedVenue) {
      setError('Please select a venue.');
      return;
    }

    try {
      // Fetch venue details to get venueId
      const venuesQuery = query(collection(db, 'venues'), where('name', '==', selectedVenue.name));
      const querySnapshot = await getDocs(venuesQuery);
      const venueDoc = querySnapshot.docs[0]; // Assuming there's only one venue with a unique name
      const venueData = venueDoc.data();

      const sessionData = {
        ...newSessionForm,
        venueId: venueData.venueId,
        hostId: currentUser.email, // Use email as hostId
        membersCount: 1, // Initialize membersCount to 1
      };

      const sessionRef = await addDoc(collection(db, 'jamSessions'), sessionData);
      console.log('Jam session created successfully:', sessionRef.id);

      // Update venue availability to 'booked'
      const venueRef = doc(db, 'venues', venueDoc.id);
      await updateDoc(venueRef, { availability: 'booked' });

      setNewSessionForm({
        time: '',
        genre: '',
        requiredInstruments: [],
      });
      setSelectedVenue(null);

      // Refetch the jam sessions to update the list
      fetchJamSessions();

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
    if (selectedVenue && selectedVenue.id === venue.id) {
      setSelectedVenue(null); // Deselect venue if already selected
    } else {
      setSelectedVenue(venue); // Select venue
    }
  };

  const handleCheckboxChange = (instrument) => {
    const isChecked = newSessionForm.requiredInstruments.includes(instrument);
    if (isChecked) {
      // Remove instrument from the array if already checked
      const updatedInstruments = newSessionForm.requiredInstruments.filter(item => item !== instrument);
      setNewSessionForm({ ...newSessionForm, requiredInstruments: updatedInstruments });
    } else {
      // Add instrument to the array if not checked
      const updatedInstruments = [...newSessionForm.requiredInstruments, instrument];
      setNewSessionForm({ ...newSessionForm, requiredInstruments: updatedInstruments });
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
            <Grid templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(4, 1fr)' }} gap={4}>
              {venues.map(venue => (
                <Box key={venue.id} bg="black" p={4} boxShadow="md" borderRadius="md">
                  <Text color="white"><strong>Name:</strong> {venue.name}</Text>
                  <Text color="white"><strong>Location:</strong> {venue.location}</Text>
                  <Text color="white"><strong>Availability:</strong> {venue.availability}</Text>
                  <Text color="white"><strong>Price per hour:</strong> ${venue.price}</Text>
                  <Button colorScheme={selectedVenue && selectedVenue.id === venue.id ? "red" : "green"} onClick={() => handleSelectVenue(venue)}>
                    {selectedVenue && selectedVenue.id === venue.id ? "Unselect Venue" : "Select Venue"}
                  </Button>
                </Box>
              ))}
            </Grid>
            {selectedVenue && (
              <>
                <Text mt={4} fontWeight="bold">Selected Venue:</Text>
                <Box bg="black" p={4} boxShadow="md" borderRadius="md">
                  <Text color="white"><strong>Name:</strong> {selectedVenue.name}</Text>
                  <Text color="white"><strong>Location:</strong> {selectedVenue.location}</Text>
                  <Text color="white"><strong>Availability:</strong> {selectedVenue.availability}</Text>
                  <Text color="white"><strong>Price per hour:</strong> ${selectedVenue.price}</Text>
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
            <Stack spacing={2}>
              <Text fontWeight="bold" color="white">Required Instruments:</Text>
              <Checkbox
                colorScheme="blue"
                isChecked={newSessionForm.requiredInstruments.includes('Guitar')}
                onChange={() => handleCheckboxChange('Guitar')}
              >
                Guitar
              </Checkbox>
              <Checkbox
                colorScheme="blue"
                isChecked={newSessionForm.requiredInstruments.includes('Bass')}
                onChange={() => handleCheckboxChange('Bass')}
              >
                Bass
              </Checkbox>
              <Checkbox
                colorScheme="blue"
                isChecked={newSessionForm.requiredInstruments.includes('Drums')}
                onChange={() => handleCheckboxChange('Drums')}
              >
                Drums
              </Checkbox>
              <Checkbox
                colorScheme="blue"
                isChecked={newSessionForm.requiredInstruments.includes('Piano/keyboards')}
                onChange={() => handleCheckboxChange('Piano/keyboards')}
              >
                Piano/keyboards
              </Checkbox>
              <Checkbox
                colorScheme="blue"
                isChecked={newSessionForm.requiredInstruments.includes('Vocals/Beatbox')}
                onChange={() => handleCheckboxChange('Vocals/Beatbox')}
              >
                Vocals/Beatbox
              </Checkbox>
            </Stack>
            <Button type="submit" color="black" bg="white" disabled={!selectedVenue}>Create Session</Button>
          </Stack>
        </form>
        {error && <Text color="red.500" mt={2}>{error}</Text>}
      </Box>

      {/* List of Jam Sessions */}
      <Box bg="black">
        <Heading as="h2" size="md" mb={2} color="white">Your Jam Sessions</Heading>
        {jamSessions.length === 0 ? (
          <Text color="white">No jam sessions found.</Text>
        ) : (
          <Stack spacing={4}>
            {jamSessions.map(session => (
              <Box key={session.id} bg="black" p={4} boxShadow="md" borderRadius="md">
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
      </Box>
    </Box>
  );
};

export default MusicianDashboard;
