import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Stack,
  Radio,
  RadioGroup,
  useToast,
  Checkbox,
  Text,
  Grid,
  Heading,
} from '@chakra-ui/react';
import { db } from './firebaseConfig';
import { collection, addDoc, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const StartJam = ({ currentLocation }) => {
  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date());
  const [venueType, setVenueType] = useState('public');
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [genre, setGenre] = useState('');
  const [requiredInstruments, setRequiredInstruments] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchVenues = async () => {
      const venuesQuery = query(collection(db, 'venues'), where('status', '==', 'open'));
      const querySnapshot = await getDocs(venuesQuery);
      const venuesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVenues(venuesData);
      setLoading(false);
    };

    fetchVenues();
  }, []);

  const handleCreateSession = async (e) => {
    e.preventDefault();
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      toast({
        title: 'Authentication required.',
        description: 'Please log in to create a jam session.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists() || userDoc.data().role !== 'jammer') {
      toast({
        title: 'Permission denied.',
        description: 'You do not have the required permissions to create a jam session.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const sessionData = {
      name,
      date,
      location: venueType === 'public' ? currentLocation : selectedVenue.location,
      genre,
      requiredInstruments,
      venueType,
      createdBy: user.uid,
    };

    await addDoc(collection(db, 'jamSessions'), sessionData);
    toast({
      title: 'Jam session created!',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });

    setName('');
    setDate(new Date());
    setVenueType('public');
    setSelectedVenue(null);
    setGenre('');
    setRequiredInstruments([]);
  };

  const handleCheckboxChange = (instrument) => {
    const isChecked = requiredInstruments.includes(instrument);
    if (isChecked) {
      setRequiredInstruments(requiredInstruments.filter(item => item !== instrument));
    } else {
      setRequiredInstruments([...requiredInstruments, instrument]);
    }
  };

  return (
    <Box bg="black" color="white" p={8} borderRadius="md">
      <Heading mb={6} color="white">Start a Jam</Heading>
      <form onSubmit={handleCreateSession}>
        <Stack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Jam Name</FormLabel>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter Jam Name"
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Date and Time</FormLabel>
            <DatePicker
              selected={date}
              onChange={(date) => setDate(date)}
              showTimeSelect
              dateFormat="Pp"
              className="react-datepicker__input-container"
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Venue Type</FormLabel>
            <RadioGroup onChange={setVenueType} value={venueType}>
              <Stack direction="row">
                <Radio value="public">Public Venue</Radio>
                <Radio value="studio">Studio</Radio>
              </Stack>
            </RadioGroup>
          </FormControl>
          {venueType === 'studio' && (
            <FormControl isRequired>
              <FormLabel>Choose a Studio</FormLabel>
              <Grid templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }} gap={4}>
                {venues.map((venue) => (
                  <Box
                    key={venue.id}
                    p={4}
                    borderRadius="md"
                    bg={selectedVenue && selectedVenue.id === venue.id ? 'green.600' : 'gray.700'}
                    onClick={() => setSelectedVenue(venue)}
                    cursor="pointer"
                  >
                    <Text><strong>Name:</strong> {venue.studioName}</Text>
                    <Text><strong>Location:</strong> {venue.location}</Text>
                    <Text><strong>Availability:</strong> {venue.status}</Text>
                    <Text><strong>Price per hour:</strong> ${venue.price}</Text>
                    <Text><strong>Instruments:</strong> {venue.instruments}</Text>
                  </Box>
                ))}
              </Grid>
            </FormControl>
          )}
          <FormControl isRequired>
            <FormLabel>Genre</FormLabel>
            <Input
              type="text"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="Enter Genre"
            />
          </FormControl>
          <FormControl>
            <FormLabel>Required Instruments</FormLabel>
            <Stack spacing={2}>
              {['Guitar', 'Bass', 'Drums', 'Piano/keyboards', 'Vocals/Beatbox'].map((instrument) => (
                <Checkbox
                  key={instrument}
                  colorScheme="blue"
                  isChecked={requiredInstruments.includes(instrument)}
                  onChange={() => handleCheckboxChange(instrument)}
                >
                  {instrument}
                </Checkbox>
              ))}
            </Stack>
          </FormControl>
          <Button type="submit" color="black" bg="white" disabled={venueType === 'studio' && !selectedVenue}>
            Start Jam
          </Button>
        </Stack>
      </form>
    </Box>
  );
};

export default StartJam;
