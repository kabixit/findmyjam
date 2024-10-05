import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, sendEmailVerification } from 'firebase/auth';
import { app, db } from './firebaseConfig';
import { Box, Image, Text, Input, Stack, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

const VenueOwnerRegister = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    const auth = getAuth(app);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Send email verification
      await sendEmailVerification(user);
      alert('A verification email has been sent. Please verify your email before logging in.');

      const usersRef = collection(db, 'users');
      await addDoc(usersRef, {
        name: name,
        email: email,
        role: 'venueOwner',
      });

      // Redirect to verification page
      navigate('/verify-email');
    } catch (error) {
      setError(error.message);
      console.error('Sign-up error:', error.message);
    }
  };

  // Function to handle Google sign-in
  const handleGoogleSignUp = async () => {
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log('User signed up with Google:', user);

      // Check if user already exists in Firestore database
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', user.email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // Add the user to Firestore database if they don't exist
        const newUserRef = await addDoc(usersRef, {
          name: user.displayName,
          email: user.email,
          role: 'user', // Default role for Google sign-in
        });
        console.log('New user added to Firestore with ID:', newUserRef.id);
      } else {
        console.log('User already exists in Firestore');
      }

      navigate('/AddStudio');
    } catch (error) {
      setError(error.message);
      console.error('Google sign-in error:', error.message);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent bg="black" color="white">
        <ModalHeader>Register</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form onSubmit={handleSignUp}>
            <Stack spacing={4}>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                variant="filled"
                color="white"
                border="1px dashed #fff"
                _focus={{ borderColor: '#eee' }}
                bg="rgba(0, 0, 0, 0.9)"
                _hover={{ bgGradient: 'linear(to-r, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.4))' }}
                borderRadius="15px"
              />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                variant="filled"
                color="white"
                border="1px dashed #fff"
                _focus={{ borderColor: '#eee' }}
                bg="rgba(0, 0, 0, 0.9)"
                _hover={{ bgGradient: 'linear(to-r, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.4))' }}
                borderRadius="15px"
                required
              />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                variant="filled"
                color="white"
                border="1px dashed #fff"
                _focus={{ borderColor: '#eee' }}
                bg="rgba(0, 0, 0, 0.9)"
                _hover={{ bgGradient: 'linear(to-r, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.4))' }}
                borderRadius="15px"
                required
              />
              <Button
                type="submit"
                color="black"
                size="md"
                borderRadius="10px"
                bg="white"
                _hover={{ filter: 'brightness(200%)' }}
                transition="filter 0.3s ease-in-out"
              >
                Register
              </Button>
              <Button
                variant="solid"
                bg="rgba(217, 217, 217, 0.1)"
                color="white"
                leftIcon={<Image src="Google.png" alt="Google Icon" />}
                onClick={handleGoogleSignUp}
                borderRadius="15px"
                _hover={{ bgGradient: 'linear(to-r, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.4))', filter: 'brightness(85%)', opacity: 0.9, transition: 'filter 0.4s ease, opacity 0.4s ease' }}
              >
                Sign in with Google
              </Button>
            </Stack>
          </form>
          {error && <Text color="red.500" mt={2}>{error}</Text>}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default VenueOwnerRegister;
