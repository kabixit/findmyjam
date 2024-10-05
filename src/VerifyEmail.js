import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Box, Spinner, Text, Button } from '@chakra-ui/react';

const VerifyEmail = () => {
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Reload user to get the latest data
        await user.reload();

        // Check if email is verified
        if (user.emailVerified) {
          setIsVerified(true);
          setIsLoading(false);
          // Redirect to home page after a short delay
          setTimeout(() => {
            navigate('/');
          }, 2000);
        } else {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    });

    // Cleanup the subscription
    return () => unsubscribe();
  }, [auth, navigate]);

  const handleResendVerification = async () => {
    const user = auth.currentUser;
    if (user && !user.emailVerified) {
      await user.sendEmailVerification();
      alert('Verification email has been resent. Please check your inbox.');
    }
  };

  return (
    <Box textAlign="center" mt="100px">
      {isLoading ? (
        <Spinner size="xl" color="blue.500" />
      ) : isVerified ? (
        <Text fontSize="2xl" color="green.500">Your email has been verified! Redirecting to home page...</Text>
      ) : (
        <>
          <Text fontSize="2xl" color="red.500">Your email is not verified yet.</Text>
          <Button colorScheme="blue" mt={4} onClick={handleResendVerification}>
            Resend Verification Email
          </Button>
        </>
      )}
    </Box>
  );
};

export default VerifyEmail;
