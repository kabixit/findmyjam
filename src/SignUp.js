import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { app, db } from './firebaseConfig';
import { Box, Text, Input, Stack, Button, Link, Image } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Function to handle the sign-up process
  const handleSignUp = async (e) => {
    e.preventDefault();
    const auth = getAuth(app);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('User signed up:', user);

      // Add additional user details to Firestore database
      const usersRef = collection(db, 'users');
      const newUserRef = await addDoc(usersRef, {
        name: name,
        email: email,
        role: 'user', // Default role for regular sign-up
      });
      console.log('New user added to Firestore with ID:', newUserRef.id);
      navigate('/dashboard');
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

      navigate('/dashboard');
    } catch (error) {
      setError(error.message);
      console.error('Google sign-in error:', error.message);
    }
  };

  // Function to navigate back to login page
  const navigateToLogin = () => {
    navigate('/'); // Assuming '/' is your login page route
  };

  return (
    <div className="screen" style={{ backgroundColor: '#000', color: '#fff', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Box p={8} borderRadius="8px" border="1px solid #fff" textAlign="center">
        <Text fontSize="2xl" fontWeight="bold" mb={4}>Sign Up</Text>
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
            />
            <Button
              marginTop="10px"
              type="submit"
              color="black"
              size="md"
              borderRadius="10px"
              bg="white"
              fontFamily="'Black Han Sans', sans-serif"
              _hover={{ filter: 'brightness(200%)' }}
              transition="filter 0.3s ease-in-out"
            >
              Sign Up
            </Button>
            <Button
              marginTop="10px"
              variant="solid"
              bg="rgba(217, 217, 217, 0.1)"
              color="white"
              leftIcon={<Image src="Google.png" alt="Google Icon" />}
              onClick={handleGoogleSignUp}
              borderRadius="15px"
              _hover={{ bgGradient: 'linear(to-r, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.4))', filter: 'brightness(85%)', opacity: 0.9, transition: 'filter 0.4s ease, opacity 0.4s ease' }}
            >
              Sign Up with Google
            </Button>
          </Stack>
        </form>
        {error && <Text color="red.500" mt={2}>{error}</Text>}
        <Box marginTop="20px">
          <Link onClick={navigateToLogin} color="white" fontWeight="bold" mt={4} cursor="pointer">
            Already have an account? Login
          </Link>
        </Box>
      </Box>
    </div>
  );
};

export default SignUp;
