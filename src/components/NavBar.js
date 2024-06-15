import React, { useState } from 'react';
import { Box, Flex, Button, Link, Image, keyframes } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import { Link as ScrollLink } from 'react-scroll';

const NavBarLink = ({ to, children, onClick }) => (
  <ScrollLink to={to} smooth={true} duration={500}>
    <Link
      color="white"
      fontWeight="bold"
      mr={20}
      _hover={{ color: '#00BAE2', transition: 'color 0.3s ease' }}
      onClick={onClick}
    >
      {children}
    </Link>
  </ScrollLink>
);

const slideDown = keyframes`
  from { transform: translateY(-10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const NavBar = () => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const handleMenuToggle = () => setShowMenu(!showMenu);
  const closeMenu = () => setShowMenu(false);

  return (
    <Box
      borderBottom="2px dashed #eeee"
      padding="4px 8px"
      position="sticky"
      top="0"
      width="100%"
      zIndex="1000"
      backgroundColor="#000"
    >
      <Flex align="center" justifyContent="space-between" paddingY={2}>
        <Link ml={2} _hover={{ textDecoration: 'none' }} onClick={() => navigate('/')}>
          <Image src="saas_logo_navbar.png" aspectRatio="auto" width={40} />
        </Link>
        <Flex align="center" display={['flex', 'flex', 'none', 'none']} ml="auto">
          <Button onClick={() => navigate('/Contact')} color="black" marginRight={4}>
            hire us
          </Button>
          <Button onClick={handleMenuToggle} color="black" marginRight={2}>
            {showMenu ? <CloseIcon /> : <HamburgerIcon />}
          </Button>
        </Flex>
        <Flex align="center" justifyContent="center" flexGrow={1} display={['none', 'none', 'flex', 'flex']}>
          <NavBarLink to="home" onClick={closeMenu}>
            home
          </NavBarLink>
          <NavBarLink to="about" onClick={closeMenu}>
            about
          </NavBarLink>
          <NavBarLink to="services" onClick={closeMenu}>
            services
          </NavBarLink>
          <NavBarLink to="contact" onClick={closeMenu}>
            contact
          </NavBarLink>
        </Flex>
        <Button onClick={() => navigate('/Contact')} color="black" marginRight={4} display={['none', 'none', 'flex', 'flex']}>
          hire us
        </Button>
      </Flex>
      {showMenu && (
        <Flex
          direction="column"
          alignItems="center"
          position="absolute"
          top="calc(100% + 5px)"
          right={0}
          backgroundColor="rgba(255, 255, 255, 0.04)"
          padding={8}
          borderRadius={12}
          boxShadow="0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.05)"
          zIndex={1000}
          minWidth={120}
          backdropFilter="blur(4px)"
          animation={`${slideDown} 0.3s ease`}
        >
          <NavBarLink to="home" onClick={closeMenu}>
            home
          </NavBarLink>
          <NavBarLink to="about" onClick={closeMenu}>
            about
          </NavBarLink>
          <NavBarLink to="services" onClick={closeMenu}>
            services
          </NavBarLink>
          <NavBarLink to="contact" onClick={closeMenu}>
            contact
          </NavBarLink>
        </Flex>
      )}
    </Box>
  );
};

export default NavBar;
