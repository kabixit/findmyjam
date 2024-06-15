import React, { useState, useEffect } from 'react';
import { Box, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app, db } from './firebaseConfig';
import Onboarding from './OnBoarding'; // Adjust the import path based on your actual file structure
import Musician from './MusicianDashboard';
import VenueOwner from './VenueOwnerDashboard';

const HomePage = () => {
  const [userRole, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth(app);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userQuery = query(collection(db, 'users'), where('email', '==', user.email));
          const querySnapshot = await getDocs(userQuery);

          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            setRole(userData.role || ''); // Initialize role from existing data
          } else {
            setError('User document not found.');
          }
        } catch (error) {
          setError('Error fetching user document: ' + error.message);
          console.error('Error fetching user document:', error);
        } finally {
          setLoading(false);
        }
      } else {
        navigate('/login'); // Redirect to login if user is not authenticated
      }
    });

    return () => unsubscribe(); // Cleanup function for unsubscribe
  }, [navigate]);

  if (loading) {
    return (
      <Box p={8} textAlign="center">
        <Text>Loading...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={8} textAlign="center">
        <Text color="red.500">{error}</Text>
      </Box>
    );
  }

  if (userRole === 'user') {
    return <Onboarding />;
  } else if (userRole === 'musician') {
    return <Musician />;
  } else if (userRole === 'venueOwner') {
    return <VenueOwner />;
  } else {
    return (
      <Box p={8} textAlign="center">
        <Text>Unknown user role.</Text>
      </Box>
    );
  }
};

export default HomePage;
