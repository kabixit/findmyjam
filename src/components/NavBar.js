import React, { useState, useEffect } from 'react';
import { Box, Flex, Button, Spacer } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { app } from '../firebaseConfig'; // Ensure you import your firebase configuration

const NavBar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });

    return () => unsubscribe();
  }, [auth]);

  const handleLoginLogout = async () => {
    if (isLoggedIn) {
      try {
        await signOut(auth);
        setIsLoggedIn(false);
      } catch (error) {
        console.error('Error logging out:', error);
      }
    } else {
      navigate('/login');
    }
  };

  return (
    <Box
      borderBottom="2px dashed #eeee"
      padding="4px 8px"
      position="sticky"
      top="0"
      width="100%"
      zIndex="1000"
      backgroundColor="#000"
    >
      <Flex align="center" justifyContent="space-between" paddingY={2}>
        <Box fontSize="2xl" fontWeight="bold" color="white" onClick={() => navigate('/')}>
          FindMyJam
        </Box>
        <Spacer />
        <Box display={{ base: 'none', md: 'flex' }} alignItems="center">
          <Button
            onClick={handleLoginLogout}
            backgroundColor="white"
            color="black"
            marginLeft="8px"
          >
            {isLoggedIn ? 'Logout' : 'Login'}
          </Button>
        </Box>
      </Flex>
    </Box>
  );
};

export default NavBar;
