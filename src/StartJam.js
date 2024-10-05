import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Radio,
  RadioGroup,
  useToast,
  Checkbox,
  Text,
  Grid,
  Heading,
  Stack,
} from '@chakra-ui/react';
import { db } from './firebaseConfig';
import { collection, addDoc, getDocs, query, where, doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import JammerLogin from './JammerLogin'; // Assuming JammerLogin component file path
import JammerRegister from './JammerRegister'; // Assuming JammerRegister component file path

const StartJam = ({ currentLocation }) => {
  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date());
  const [venueType, setVenueType] = useState('public');
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [genre, setGenre] = useState('');
  const [requiredInstruments, setRequiredInstruments] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [description, setDescription] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false); // State to manage register modal
  const [toastMessage, setToastMessage] = useState('');
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
      setShowLoginModal(true);
      return;
    }

    try {
      // Query Firestore for user document based on email
      const usersQuery = query(collection(db, 'users'), where('email', '==', user.email));
      const querySnapshot = await getDocs(usersQuery);

      if (querySnapshot.empty) {
        console.warn('No matching documents.');
        return;
      }

      // Assuming there is only one document per user email, so we take the first one
      const userDoc = querySnapshot.docs[0];

      // Check if user has the 'jammer' role
      if (userDoc.data().role !== 'jammer') {
        toast({
          title: 'Permission denied.',
          description: 'You do not have the required permissions to create a jam session.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Fetch current count of jam sessions to calculate next jamId
      const jamSessionsRef = collection(db, 'jamSessions');
      const jamSessionsSnapshot = await getDocs(jamSessionsRef);
      const jamId = jamSessionsSnapshot.size + 1; // Calculate new jamId

      // Continue with creating the jam session using user data if permissions are correct
      const sessionData = {
        jamId,
        name,
        date,
        location: venueType === 'public' ? currentLocation : selectedVenue.location,
        genre,
        requiredInstruments,
        venueType,
        studioId: venueType === 'studio' ? selectedVenue.studioId : null,
        createdBy: user.email,
        description,
        membersCount: 1,
        createdAt: new Date(),
      };

      await addDoc(collection(db, 'jamSessions'), sessionData);
      toast({
        title: 'Jam session created!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Update the status of selected venue to 'closed' in venues collection
      if (venueType === 'studio' && selectedVenue) {
        const venueDocRef = doc(db, 'venues', selectedVenue.id);
        await setDoc(venueDocRef, { ...selectedVenue, status: 'closed' }, { merge: true });
      }

      // Reset form fields after successful creation
      setName('');
      setDate(new Date());
      setVenueType('public');
      setSelectedVenue(null);
      setGenre('');
      setRequiredInstruments([]);
      setDescription('');
    } catch (error) {
      console.error('Error creating session:', error);
      toast({
        title: 'Error creating session.',
        description: 'An error occurred while creating the jam session. Please try again later.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
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
      <Text 
        mb={2} 
        color="white" 
        fontSize="3xl"  // Adjust the font size as needed
        textAlign="center" // Centers the text horizontally
      >
        Start a Jam
      </Text>
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
            <FormLabel color="white">Date and Time</FormLabel>
            <DatePicker
              selected={date}
              onChange={(date) => setDate(date)}
              showTimeSelect
              dateFormat="Pp"
              className="react-datepicker__input-container"
              // Inline styling for input container
              customInput={
                <input
                  style={{
                    backgroundColor: '#0000',
                    borderRadius: '8px',
                    border: '1px solid #ccc',
                    padding: '10px',
                    fontSize: '16px',
                    width: '100%',
                  }}
                />
              }
              // Inline style for the calendar popup
              popperClassName="react-datepicker-popper"
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
                    <Text><strong>Instruments:</strong> {venue.instruments.join(', ')}</Text>
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
              {['Guitar', 'Bass', 'Drums', 'keyboards', 'Vocals/Beatbox'].map((instrument) => (
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
          <FormControl>
            <FormLabel>Description</FormLabel>
            <Input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter Description"
            />
          </FormControl>
          <Button type="submit" color="black" bg="white" disabled={venueType === 'studio' && !selectedVenue}>
            Start Jam
          </Button>
        </Stack>
      </form>

      {/* Modal for JammerLogin or JammerRegister */}
      {showLoginModal && (
        <JammerLogin
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onRegisterClick={() => {
            setShowLoginModal(false);
            setShowRegisterModal(true);
          }}
        />
      )}
      {showRegisterModal && (
        <JammerRegister
          isOpen={showRegisterModal}
          onClose={() => setShowRegisterModal(false)}
          onLoginClick={() => {
            setShowRegisterModal(false);
            setShowLoginModal(true);
          }}
        />
      )}
    </Box>
  );
};

export default StartJam;
