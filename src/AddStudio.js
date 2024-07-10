import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app, db, storage } from './firebaseConfig';
import { Box, Text, Button, useDisclosure, Input, Textarea, FormControl, FormLabel, Checkbox, Stack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import VenueOwnerLogin from './VenueOwnerLogin';
import VenueOwnerRegister from './VenueOwnerRegister';

const AddStudio = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isVenueOwner, setIsVenueOwner] = useState(false);
  const { isOpen: isLoginOpen, onOpen: onLoginOpen, onClose: onLoginClose } = useDisclosure();
  const { isOpen: isRegisterOpen, onOpen: onRegisterOpen, onClose: onRegisterClose } = useDisclosure();
  const navigate = useNavigate();

  // State for studio fields
  const [studioName, setStudioName] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [instruments, setInstruments] = useState([]);
  const [media, setMedia] = useState('');
  const [description, setDescription] = useState('');

  // State for instrument checkboxes
  const [instrumentCheckboxes, setInstrumentCheckboxes] = useState({
    guitar: false,
    drums: false,
    piano: false,
    violin: false,
    saxophone: false
    // Add more instruments as needed
  });

  // Function to check authentication status and user role
  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        setLoading(true);

        // Check user role in Firestore
        try {
          const q = query(collection(db, 'users'), where('email', '==', user.email));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            if (userData.role === 'venueOwner') {
              setIsVenueOwner(true);
            } else {
              console.warn('User is not authorized as a venue owner');
             // Redirect to home or another appropriate page
            }
          } else {
            console.warn('No such document!');
            navigate('/'); // Redirect to home or another appropriate page
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Function to handle adding a studio
  const handleAddStudio = async () => {
    console.log('Adding studio...');

    // Get the number of documents in the 'venues' collection
    const venuesCollection = collection(db, 'venues');
    const venuesSnapshot = await getDocs(venuesCollection);
    const venueCount = venuesSnapshot.size;

    // Generate a new studioId
    const newStudioId = (venueCount + 1).toString().padStart(3, '0');

    // Prepare studio data
    const studioData = {
      studioId: newStudioId,
      studioName,
      location,
      price,
      instruments: Object.keys(instrumentCheckboxes).filter(key => instrumentCheckboxes[key]),
      media,
      description,
      ownerId: user.email, // Assuming user is authenticated and has a UID
      createdAt: new Date(),
      status: 'open' // Default status set directly here
    };

    try {
      const docRef = await addDoc(venuesCollection, studioData);
      console.log('Studio added with ID:', docRef.id);
      // Redirect or show success message
      navigate('/dashboard'); // Redirect to dashboard or another appropriate page
    } catch (error) {
      console.error('Error adding studio:', error);
      // Handle error
    }
  };

  // Function to handle instrument checkbox changes
  const handleInstrumentChange = (instrument) => {
    setInstrumentCheckboxes(prevState => ({
      ...prevState,
      [instrument]: !prevState[instrument]
    }));
  };

  // Function to handle image upload (unchanged)
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const storageRef = ref(storage, `images/${file.name}`);
    try {
      await uploadBytes(storageRef, file);
      const imageUrl = await getDownloadURL(storageRef);
      setMedia(imageUrl);
      console.log('Image uploaded successfully:', imageUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  // Check if user is authenticated and show appropriate modals or forms
  if (loading) {
    return (
      <Box p={8} textAlign="center">
        <Text>Loading...</Text>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box p={8} textAlign="center">
        <Text mt={50} fontSize={28} mb={5}>You haven't Logged in yet!</Text>
        <Button onClick={onLoginOpen} variant="solid" color="black" bg="white" size="lg" mr={4}>
          Login
        </Button>
        <Button onClick={onRegisterOpen} variant="outline" color="black" bg="white" size="lg">
          Register
        </Button>
        <VenueOwnerLogin isOpen={isLoginOpen} onClose={onLoginClose} />
        <VenueOwnerRegister isOpen={isRegisterOpen} onClose={onRegisterClose} />
      </Box>
    );
  }

  if (!isVenueOwner) {
    return (
      <Box p={8} textAlign="center">
        <Text>You are not authorized to add a studio.</Text>
      </Box>
    );
  }

  // If user is authenticated and authorized as venue owner, show the add studio form
  return (
    <Box p={8}>
      <Text fontSize="2xl" fontWeight="bold" mb={4}>Add Your Studio</Text>
      <FormControl mb={4}>
        <FormLabel>Studio Name</FormLabel>
        <Input type="text" value={studioName} onChange={(e) => setStudioName(e.target.value)} />
      </FormControl>
      <FormControl mb={4}>
        <FormLabel>Location (Google Maps Link)</FormLabel>
        <Input type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
      </FormControl>
      <FormControl mb={4}>
        <FormLabel>Price(s)</FormLabel>
        <Input type="text" value={price} onChange={(e) => setPrice(e.target.value)} />
      </FormControl>
      <FormControl mb={4}>
        <FormLabel>Instruments</FormLabel>
        <Stack direction="column">
          {Object.keys(instrumentCheckboxes).map((instrument, index) => (
            <Checkbox
              key={index}
              isChecked={instrumentCheckboxes[instrument]}
              onChange={() => handleInstrumentChange(instrument)}
            >
              {instrument}
            </Checkbox>
          ))}
        </Stack>
      </FormControl>
      <FormControl mb={4}>
        <FormLabel>Media (Image)</FormLabel>
        <Input type="file" onChange={handleImageUpload} />
      </FormControl>
      <FormControl mb={4}>
        <FormLabel>Description</FormLabel>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      </FormControl>
      <Button onClick={handleAddStudio} colorScheme="blue" size="lg">
        Add Studio
      </Button>
    </Box>
  );
};

export default AddStudio;
