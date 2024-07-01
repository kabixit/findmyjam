import React from 'react';
import { Box, Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const StudioComponent = () => {
  const navigate = useNavigate();

  const handleAddVenue = () => {
    navigate('/AddStudio'); // Navigate to '/add-studio' route
  };

  return (
    <Box bg="black" color="white" p={4} borderRadius="md" mt={4}>
      <h2>Are You a Venue Owner / Studio Owner?</h2>
      <Button onClick={handleAddVenue} mt={2}>Add Venue</Button>
    </Box>
  );
};

export default StudioComponent;
