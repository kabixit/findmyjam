import React, { useState } from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';
import LocationPrompt from './LocationPrompt';
import ShowAllJams from './ShowAllJams';
import StartJam from './StartJam';
import StudioComponent from './components/StudioComponent'; // Import StudioComponent

const Home = () => {
  const [location, setLocation] = useState(null);



  return (
    <Box bg="black" color="white" p={4} borderRadius="md">
      <Text 
        mt={5}
        mb={2} 
        color="white" 
        fontSize="4xl"  // Adjust the font size as needed
        textAlign="center" // Centers the text horizontally
      >
        Find My Jam
      </Text>
      <Text 
        mb={2} 
        color="white" 
        fontSize="2xl"  // Adjust the font size as needed
        textAlign="center" // Centers the text horizontally
      >
        "Your Music, Your Vibe, Your Jam"
      </Text>
      {!location && <LocationPrompt onLocationReceived={setLocation} />}
      {location && (
        <>
          <ShowAllJams location={location} />
          <StartJam location={location} />
          {/* <StudioComponent onAddVenue={handleAddVenue} />  */}
        </>
      )}
    </Box>
  );
};

export default Home;
