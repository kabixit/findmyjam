import React, { useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input } from '@chakra-ui/react';
import { db } from './firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

const StartJam = ({ currentLocation }) => {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, 'jamSessions'), {
      name,
      date: new Date(date),
      location: currentLocation,
    });
    alert('Jam session created!');
    setName('');
    setDate('');
  };

  return (
    <Box bg="black" color="white" p={4} borderRadius="md">
      <form onSubmit={handleSubmit}>
        <FormControl mb={4}>
          <FormLabel>Jam Name</FormLabel>
          <Input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jam Name" required />
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>Date</FormLabel>
          <Input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} required />
        </FormControl>
        <Button type="submit">Start Jam</Button>
      </form>
    </Box>
  );
};

export default StartJam;
