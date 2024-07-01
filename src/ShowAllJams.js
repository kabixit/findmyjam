import React, { useEffect, useState } from 'react';
import { db } from './firebaseConfig';
import { collection, getDocs, getDoc, orderBy, query, doc, updateDoc } from 'firebase/firestore';
import { Box, Button, ListItem, UnorderedList } from '@chakra-ui/react';

const ShowAllJams = ({ currentLocation }) => {
  const [jams, setJams] = useState([]);

  useEffect(() => {
    const fetchJams = async () => {
      const jamsCollection = query(collection(db, 'jamSessions'), orderBy('date'));
      const jamsSnapshot = await getDocs(jamsCollection);
      setJams(jamsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    fetchJams();
  }, []);

  const joinJam = async (jamId) => {
    try {
      const jamRef = doc(db, 'jamSessions', jamId);
      const jamDoc = await getDoc(jamRef);

      if (!jamDoc.exists()) {
        console.error('Jam session does not exist');
        return;
      }

      const updatedParticipants = [...jamDoc.data().participants, /* Add your user ID or any identifier */];

      await updateDoc(jamRef, {
        participants: updatedParticipants,
      });

      alert('Joined the jam session!');
    } catch (error) {
      console.error('Error joining jam session', error);
      // Handle error as needed
    }
  };

  return (
    <Box bg="black" color="white" p={4} borderRadius="md">
      <h2>All Jams</h2>
      <UnorderedList>
        {jams.map(jam => (
          <ListItem key={jam.id} mb={2}>
            {jam.name} - {new Date(jam.date.seconds * 1000).toLocaleString()}
            <Button onClick={() => joinJam(jam.id)} ml={4}>Join</Button>
          </ListItem>
        ))}
      </UnorderedList>
    </Box>
  );
};

export default ShowAllJams;
