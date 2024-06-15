import React from 'react';
import { Box, Heading, Text, Button, VStack } from '@chakra-ui/react';

const Home = () => {
  return (
    <Box
      minH="80vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      p={4}
    >
      <VStack spacing={8} align="center">
        <Heading as="h1" size="2xl" textAlign="center">
          Find My Jam
        </Heading>
        <Text fontSize="xl" fontWeight="medium" textAlign="center">
        Connect with musicians and find the perfect spot to jam together.
        </Text>
        
        <VStack spacing={4}>
            <Button as={Link} to="/CreateJam" bg="white" size="lg">
              Create a Jam Session
            </Button>
            <Button as={Link} to="/JoinJam" bg="white" size="lg">
              Join a Jam Session
            </Button>
            <Button as={Link} to="/BookVenue" bg="white" size="lg">
              Book a Venue
            </Button>
          </VStack>
      </VStack>
    </Box>
  );
};

export default Home;
