import React, { useState } from 'react';
import { Box, Heading } from '@chakra-ui/react';
import LocationPrompt from './LocationPrompt';
import ShowAllJams from './ShowAllJams';
import StartJam from './StartJam';
import StudioComponent from './components/StudioComponent'; // Import StudioComponent

const Home = () => {
  const [location, setLocation] = useState(null);

  const handleAddVenue = () => {
    // Implement logic to handle adding venue/studio
    alert('Add Venue functionality to be implemented.');
  };

  return (
    <Box bg="black" color="white" p={4} borderRadius="md">
      <Heading as="h1" mb={4}>FindMyJam.io</Heading>
      {!location && <LocationPrompt onLocationReceived={setLocation} />}
      {location && (
        <>
          <ShowAllJams location={location} />
          <StartJam location={location} />
          <StudioComponent onAddVenue={handleAddVenue} /> {/* Render StudioComponent */}
        </>
      )}
    </Box>
  );
};

export default Home;
