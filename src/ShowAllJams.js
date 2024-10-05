import React, { useEffect, useState } from 'react';
import { db } from './firebaseConfig';
import { collection, getDocs, getDoc, orderBy, query, doc, addDoc, where, setDoc } from 'firebase/firestore';
import { Box, Button, Heading, List, ListItem, Text, VStack, HStack, useToast } from '@chakra-ui/react';
import { CheckIcon} from '@chakra-ui/icons';
import { getAuth } from 'firebase/auth';
import JammerLogin from './JammerLogin'; // Assuming JammerLogin component file path
import JammerRegister from './JammerRegister'; // Assuming JammerRegister component file path

const ShowAllJams = ({ currentLocation }) => {
  const [jams, setJams] = useState([]);
  const [joinedJamIds, setJoinedJamIds] = useState([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const toast = useToast();
  const auth = getAuth();


  const openLocationInNewTab = (url) => {
    // Check if the URL is valid and prepend 'http://' if necessary
    if (url) {
      window.open(url, '_blank');
    } else {
      toast({
        title: 'Invalid Location',
        description: 'The location URL is not valid.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  

  useEffect(() => {
    const fetchJams = async () => {
      const jamsCollection = query(collection(db, 'jamSessions'), orderBy('date'));
      const jamsSnapshot = await getDocs(jamsCollection);
      setJams(jamsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    const fetchJoinedJams = async () => {
      const user = auth.currentUser;
      if (user) {
        const jamMembersRef = collection(db, 'jamMembers');
        const joinedJamsQuery = query(jamMembersRef, where('userId', '==', user.email));
        const joinedJamsSnapshot = await getDocs(joinedJamsQuery);
        setJoinedJamIds(joinedJamsSnapshot.docs.map(doc => doc.data().jamId));
      }
    };

    fetchJams();
    fetchJoinedJams();
  }, [auth]);

  const joinJam = async (jamId) => {
    try {
      const user = auth.currentUser;

      if (!user) {
        setShowLoginModal(true);
        return;
      }

      // Check if the user has already joined this jam session
      const jamMembersRef = collection(db, 'jamMembers');
      const querySnapshot = await getDocs(query(jamMembersRef, where('jamId', '==', jamId), where('userId', '==', user.email)));

      if (!querySnapshot.empty) {
        toast({
          title: 'Already Joined',
          description: 'You have already joined this jam session.',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Add user to jamMembers collection
      await addDoc(jamMembersRef, {
        jamId: jamId,
        userId: user.email,
      });

      // Update membersCount in jamSessions collection
      const jamSessionRef = doc(db, 'jamSessions', jamId);
      const jamSessionDoc = await getDoc(jamSessionRef);

      if (!jamSessionDoc.exists()) {
        console.error('Jam session document does not exist.');
        return;
      }

      const currentMembersCount = jamSessionDoc.data().membersCount || 0;
      await setDoc(jamSessionRef, { membersCount: currentMembersCount + 1 }, { merge: true });

      setJoinedJamIds(prev => [...prev, jamId]);

      toast({
        title: 'Joined the jam session!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error joining jam session', error);
      toast({
        title: 'Error joining jam session',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box bg="black" color="white" p={6} borderRadius="md" boxShadow="xl">
      <Text 
        mb={2} 
        color="white" 
        fontSize="3xl"  // Adjust the font size as needed
        textAlign="center" // Centers the text horizontally
      >
        All Jams
      </Text>
      <List spacing={4}>
        {jams.map(jam => (
          <ListItem key={jam.id} bg="black" p={4} borderRadius="md" boxShadow="md" border="1px dashed #fff">
            <HStack justify="space-between">
              <VStack align="start">
                <Text fontSize="xl" fontWeight="bold">{jam.name}</Text>
                <Text>{new Date(jam.date.seconds * 1000).toLocaleString()}</Text>
                <Text>{jam.description}</Text>
                <Text><strong>Genre:</strong> {jam.genre}</Text>
                <Text><strong>Location:</strong> {jam.location}</Text>
                <Text><strong>Required Instruments:</strong> {jam.requiredInstruments.join(', ')}</Text>
                <Text><strong>Jammers Joined:</strong> {jam.membersCount}</Text>
                <HStack align="start">
                {joinedJamIds.includes(jam.id) ? (
                  <Button color="black" bg="gray" isDisabled>
                    Already Joined
                  </Button>
                ) : (
                  <Button
                    color="black"
                    bg="white"
                    onClick={() => joinJam(jam.id)}
                    rightIcon={<CheckIcon />}
                    isDisabled={auth.currentUser?.email === jam.createdBy}
                  >
                    Join
                  </Button>
                )}
                <Button
                  color="black"
                  bg="white"
                  onClick={() => openLocationInNewTab(jam.location)}
                >
                  Location
                </Button>
                </HStack>
              </VStack>
            </HStack>
          </ListItem>
        ))}
      </List>

      {/* Modal for JammerLogin or JammerRegister */}
      {showLoginModal && (
        <JammerLogin
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onRegisterClick={() => {
            setShowLoginModal(false);
            setShowRegisterModal(true);
          }}
        />
      )}
      {showRegisterModal && (
        <JammerRegister
          isOpen={showRegisterModal}
          onClose={() => setShowRegisterModal(false)}
          onLoginClick={() => {
            setShowRegisterModal(false);
            setShowLoginModal(true);
          }}
        />
      )}
    </Box>
  );
};

export default ShowAllJams;
