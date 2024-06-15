import React, { useState, useEffect } from 'react';
import { Box, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { doc, getDocs, query, where, collection, updateDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app, db } from './firebaseConfig';
import Onboarding from './OnBoarding'; // Adjust the import path based on your actual file structure
import Musician from './MusicianDashboard';
import VenueOwner from './VenueOwnerDashboard';

const HomePage = () => {
  const [userRole, setRole] = useState('');
  const [error, setError] = useState(null);

  const [loading, setLoading] = useState(true);
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

  return (
    <div>
      {userRole === 'user' && <Onboarding />}
      {userRole !== 'user' && (
        <Box p={8} textAlign="center">
          <Text>Welcome to your Dashboard!</Text>
          {/* Render different dashboards based on user roles */}
          {userRole === 'musician' && <Musician/>}
          {userRole === 'venueOwner' && <VenueOwner/>}
        </Box>
      )}
    </div>
  );
};

export default HomePage;
