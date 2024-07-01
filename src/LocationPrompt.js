import React, { useEffect, useState } from 'react';
import { Box } from '@chakra-ui/react';

const LocationPrompt = ({ onLocationReceived }) => {
  const [location, setLocation] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          onLocationReceived({ latitude, longitude });
        },
        (error) => {
          console.error('Error getting location', error);
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  }, [onLocationReceived]);

  return (
    <Box bg="black" color="white" p={4} borderRadius="md">
      {location ? <div>Location received: {location.latitude}, {location.longitude}</div> : <div>Getting location...</div>}
    </Box>
  );
};

export default LocationPrompt;
