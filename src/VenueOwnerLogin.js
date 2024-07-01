import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { app } from './firebaseConfig';
import { Box, Text, Input, Stack, Button, Image, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const VenueOwnerLogin = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Function to handle the login process
  const handleLogin = async (e) => {
    e.preventDefault();
    const auth = getAuth(app);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('User logged in:', user);
      onClose(); // Close the modal after successful login
      navigate('/AddStudio'); // Redirect to add studio page after login
    } catch (error) {
      setError(error.message);
      console.error('Login error:', error.message);
    }
  };

  // Function to handle Google sign-in
  const handleGoogleLogin = async () => {
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log('User signed in with Google:', user);

      // Check if user already exists in Firestore database
      // This part can be added if needed similar to previous examples

      onClose(); // Close the modal after successful sign-in
      navigate('/AddStudio'); // Redirect to add studio page after Google sign-in
    } catch (error) {
      setError(error.message);
      console.error('Google sign-in error:', error.message);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent bg="black" color="white">
        <ModalHeader>Login</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form onSubmit={handleLogin}>
            <Stack spacing={4}>
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
                Login
              </Button>
              <Button
                variant="solid"
                bg="rgba(217, 217, 217, 0.1)"
                color="white"
                leftIcon={<Image src="Google.png" alt="Google Icon" />}
                onClick={handleGoogleLogin}
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

export default VenueOwnerLogin;
