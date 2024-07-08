import React from 'react';
import {
  Box,
  Button,
  Text,
  VStack,
  useDisclosure,
} from '@chakra-ui/react';
import JammerRegister from './JammerRegister';
import VenueOwnerRegister from './VenueOwnerRegister';

const SignUp = () => {
  const { isOpen: isJammerOpen, onOpen: onJammerOpen, onClose: onJammerClose } = useDisclosure();
  const { isOpen: isVenueOwnerOpen, onOpen: onVenueOwnerOpen, onClose: onVenueOwnerClose } = useDisclosure();

  return (
    <div className="screen" style={{ backgroundColor: '#000', color: '#fff', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Box p={8} borderRadius="8px" border="1px solid #fff" textAlign="center">
        <Text fontSize="2xl" fontWeight="bold" mb={4}>Sign Up</Text>
        <VStack spacing={6}>
          <Button
            onClick={onJammerOpen}
            variant="outline"
            color="black"
            bg="white"
            size="lg"
            borderRadius="10px"
            _hover={{ filter: 'brightness(200%)' }}
            transition="filter 0.3s ease-in-out"
          >
            Jammer
          </Button>
          <Button
            onClick={onVenueOwnerOpen}
            variant="outline"
            color="black"
            bg="white"
            size="lg"
            borderRadius="10px"
            _hover={{ filter: 'brightness(200%)' }}
            transition="filter 0.3s ease-in-out"
          >
            Studio Owner
          </Button>
        </VStack>
      </Box>
        <JammerRegister isOpen={isJammerOpen} onClose={onJammerClose} />
        <VenueOwnerRegister isOpen={isVenueOwnerOpen} onClose={onVenueOwnerClose} />
    </div>
  );
};

export default SignUp;
