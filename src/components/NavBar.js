import React, { useState } from 'react';
import { Box, Flex, Button, Link, IconButton, useDisclosure, Spacer } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';

const NavBar = () => {
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginLogout = () => setIsLoggedIn(!isLoggedIn);

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
          <Button as={Link} to="/" variant="ghost" onClick={onClose} color="white">
            Home
          </Button>
          <Button as={Link} to="/create-jam" variant="ghost" onClick={onClose} color="white">
            Create Jam
          </Button>
          <Button as={Link} to="/join-jam" variant="ghost" onClick={onClose} color="white">
            Join Jam
          </Button>
          <Button as={Link} to="/book-venue" variant="ghost" onClick={onClose} color="white">
            Book Venue
          </Button>
          <Button
            onClick={handleLoginLogout}
            backgroundColor="white"
            color="black"
            marginLeft="8px"
          >
            {isLoggedIn ? 'Logout' : 'Login'}
          </Button>
        </Box>
        <IconButton
          aria-label="Toggle menu"
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          display={{ base: 'flex', md: 'none' }}
          onClick={isOpen ? onClose : onOpen}
          color="white"
        />
      </Flex>
      {isOpen && (
        <Flex
          direction="column"
          alignItems="center"
          display={{ md: 'none' }}
          backgroundColor="#000"
          padding={4}
        >
          <Button as={Link} to="/" variant="ghost" width="100%" onClick={onClose} color="white">
            Home
          </Button>
          <Button as={Link} to="/create-jam" variant="ghost" width="100%" onClick={onClose} color="white">
            Create Jam
          </Button>
          <Button as={Link} to="/join-jam" variant="ghost" width="100%" onClick={onClose} color="white">
            Join Jam
          </Button>
          <Button as={Link} to="/book-venue" variant="ghost" width="100%" onClick={onClose} color="white">
            Book Venue
          </Button>
          <Button
            onClick={handleLoginLogout}
            backgroundColor="white"
            color="black"
            width="100%"
            marginTop="8px"
          >
            {isLoggedIn ? 'Logout' : 'Login'}
          </Button>
        </Flex>
      )}
    </Box>
  );
};

export default NavBar;
