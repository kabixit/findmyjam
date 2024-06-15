import React, { useState, useEffect } from 'react';
import { Box, Text, Stack, Input, Button, Center, Grid } from '@chakra-ui/react';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app, db } from './firebaseConfig';

const VenueOwnerDashboard = () => {
  const [venues, setVenues] = useState([]);
  const [newVenue, setNewVenue] = useState({
    name: '',
    location: '',
    price: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Define fetchVenues function outside of useEffect
  const fetchVenues = async (userId) => {
    try {
      const venuesQuery = query(collection(db, 'venues'), where('ownerId', '==', userId));
      const querySnapshot = await getDocs(venuesQuery);
      const venuesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVenues(venuesData);
      setLoading(false); // Move setLoading(false) here after setting venuesData
    } catch (error) {
      setError('Error fetching venues: ' + error.message);
      console.error('Error fetching venues:', error);
      setLoading(false); // Ensure setLoading(false) is also called on error
    }
  };

  useEffect(() => {
    const auth = getAuth(app);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        await fetchVenues(user.email); // Pass user email to fetchVenues
      } else {
        setCurrentUser(null);
        setVenues([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleCreateVenue = async (event) => {
    event.preventDefault();
    setError(null);

    if (!currentUser) {
      setError('User not authenticated.');
      return;
    }

    try {
      // Fetch venues to calculate newVenueId based on current venues count
      const venuesQuery = query(collection(db, 'venues'));
      const querySnapshot = await getDocs(venuesQuery);
      const venuesCount = querySnapshot.size;
      const newVenueId = venuesCount + 1;

      const venueData = {
        ...newVenue,
        ownerId: currentUser.email,
        price: parseFloat(newVenue.price),
        availability: 'open',
        venueId: newVenueId,
      };

      await addDoc(collection(db, 'venues'), venueData);
      console.log('Venue created successfully');

      // Clear form after successful submission
      setNewVenue({
        name: '',
        location: '',
        price: '',
      });

      // Fetch venues again to update the list
      await fetchVenues(currentUser.email); // Refetch venues for the current user
    } catch (error) {
      setError('Failed to create venue: ' + error.message);
      console.error('Error creating venue:', error);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setNewVenue({ ...newVenue, [name]: value });
  };

  if (loading) {
    return (
      <Center>
        <Box p={8} textAlign="center">
          <Text>Loading...</Text>
        </Box>
      </Center>
    );
  }

  return (
    <Center>
      <Box p={8}>

        {/* Create Venue Form */}
        <Box bg="#000" width="100%" maxWidth="600px" mb={4} borderRadius="md">
          <Text fontSize="2xl" mb={4} color="#fff">Add your Venue</Text>
          <form onSubmit={handleCreateVenue}>
            <Stack spacing={4}>
              <Input
                type="text"
                name="name"
                value={newVenue.name}
                onChange={handleChange}
                placeholder="Name"
                required
              />
              <Input
                type="text"
                name="location"
                value={newVenue.location}
                onChange={handleChange}
                placeholder="Location"
                required
              />
              <Input
                type="number"
                name="price"
                value={newVenue.price}
                onChange={handleChange}
                placeholder="Price per hour ($)"
                required
              />
              <Button type="submit" bg="#eee" color="#000" width="100%">Add Venue</Button>
            </Stack>
          </form>
          {error && <Text color="red.500" mt={2}>{error}</Text>}
        </Box>

        {/* List of Venues */}
        <Box>
          <Text fontSize="2xl" mb={4} color="#000">Your Venues</Text>
          <Grid templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(4, 1fr)' }} gap={6}>
            {venues.length === 0 ? (
              <Text>No venues found.</Text>
            ) : (
              venues.map(venue => (
                <Box key={venue.id} bg="black" p={4} width="300px" color="white" border="1px dashed #fff"
                  _focus={{ borderColor: '#eee' }} borderRadius="md">
                  <Text fontWeight="bold" mb={2}>{venue.name}</Text>
                  <Text mb={2}><strong>Location:</strong> {venue.location}</Text>
                  <Text mb={2}><strong>Availability:</strong> {venue.availability}</Text>
                  <Text mb={2}><strong>Price per hour:</strong> ${venue.price}</Text>
                  <Button color="black" bg="white">Edit Venue</Button>
                </Box>
              ))
            )}
          </Grid>
        </Box>
      </Box>
    </Center>
  );
};

export default VenueOwnerDashboard;
