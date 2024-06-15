import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { app, db } from './firebaseConfig';
import { Box, Text, Input, Stack, Button, Image, Link } from '@chakra-ui/react';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const Login = () => {
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
      navigate('/dashboard');
    } catch (error) {
      setError(error.message);
      console.error('Login error:', error.message);
    }
  };

  // Function to navigate to SignUp page
  const navigateToSignUp = () => {
    navigate('/SignUp'); // Assuming '/SignUp' is your signup page route
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
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', user.email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // Add the user to Firestore database if they don't exist
        const newUserRef = await addDoc(usersRef, {
          email: user.email,
          displayName: user.displayName,
          role: 'user', // Default role for Google sign-in
        });
        console.log('New user added to Firestore with ID:', newUserRef.id);
      } else {
        console.log('User already exists in Firestore');
      }

      // Redirect user to dashboard or appropriate page
      navigate('/home');
    } catch (error) {
      setError(error.message);
      console.error('Google sign-in error:', error.message);
    }
  };
  return (
    <div className="screen" style={{ backgroundColor: '#000', color: '#fff', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Box p={8} borderRadius="8px" border="1px solid #fff" textAlign="center">
        <Text fontSize="2xl" fontWeight="bold" mb={4}>Login</Text>
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
              Login
            </Button>
            <Button
              marginTop="10px"
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
        <Box marginTop="20px">
        <Link  onClick={navigateToSignUp} color="white" fontWeight="bold" mt={4} cursor="pointer">
          Don't have an account? Sign Up
        </Link>
        </Box>
      </Box>
    </div>
  );
};

export default Login;
