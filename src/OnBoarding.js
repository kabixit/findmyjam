import React, { useState, useEffect } from 'react';
import { Box, Text, Stack, Button, Radio, RadioGroup } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { doc, getDocs, query, where, collection, updateDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app, db } from '../firebaseConfig';

const Onboarding = () => {
  const [role, setRole] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth(app);

    // Subscribe to authentication state changes
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
        }
      } else {
        setError('User not authenticated.');
      }
    });

    return () => unsubscribe(); // Cleanup function to unsubscribe from auth state changes
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!role) {
      setError('Please select a role.');
      return;
    }
    setError(null);

    const auth = getAuth(app);
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setError('User not authenticated.');
      return;
    }

    try {
      const userQuery = query(collection(db, 'users'), where('email', '==', currentUser.email));
      const querySnapshot = await getDocs(userQuery);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0]; // Assuming there is only one document matching the email
        const userRef = doc(db, 'users', userDoc.id);
        await updateDoc(userRef, { role: role });
        console.log('User document updated successfully with role:', role);
      } else {
        setError('User document does not exist.');
      }

      // Navigate to dashboard or next step after onboarding
      navigate('/');
    } catch (error) {
      setError('Failed to update user document: ' + error.message);
      console.error('Error updating user document:', error);
    }
  };

  const handleRoleChange = (value) => {
    setRole(value);
  };

  return (
    <div className="screen" style={{ backgroundColor: '#000', color: '#fff', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Box p={8} borderRadius="8px" border="1px solid #fff" textAlign="center" width="400px">
        <Text fontSize="2xl" fontWeight="bold" mb={4}>Welcome! Let's get started.</Text>
        <form onSubmit={handleSubmit}>
          <Stack spacing={4}>
            <RadioGroup value={role} onChange={handleRoleChange}>
              <Stack direction="row">
                <Radio value="musician">Musician</Radio>
                <Radio value="venueOwner">Venue Owner</Radio>
              </Stack>
            </RadioGroup>
            <Button
              type="submit"
              color="black"
              size="md"
              borderRadius="10px"
              bg="white"
              fontFamily="'Black Han Sans', sans-serif"
              _hover={{ filter: 'brightness(200%)' }}
              transition="filter 0.3s ease-in-out"
            >
              Continue
            </Button>
          </Stack>
        </form>
        {error && <Text color="red.500" mt={2}>{error}</Text>}
      </Box>
    </div>
  );
};

export default Onboarding;
