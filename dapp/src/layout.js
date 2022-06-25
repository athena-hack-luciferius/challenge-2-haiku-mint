import React, { useState } from 'react';
import { Outlet } from 'react-router-dom'
import { IconButton, Typography, Link as MuiLink, Tooltip, Box, Button } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import BrokenImageIcon from '@mui/icons-material/BrokenImage';
import Popup from './components/Popup';
import './burger-menu.css';
import Modal from '@mui/material/Modal';
import PacmanLoader from 'react-spinners/PacmanLoader';
import MintForm from './components/MintForm';

function Copyright() {
  return (
    <Typography variant="body1" color="text.secondary" align="center">
      {'Copyright © '}
      <MuiLink color="inherit" href="https://github.com">
        Your Website
      </MuiLink>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
};

const Layout = ({currentUser, signIn, signOut, clearMessage, message, isLoadingModal, onMint}) => {
  const [isMinting, setIsMinting] = useState(false);

  return (
    <>
      <div class="bg-image"/>
      <div id="App">
          <main id="page-wrapper" className='flex flex-col justify-between h-full'>
            <Outlet/>
            <Copyright/>
          </main>
          { currentUser
            ? <Box className='absolute top-0 right-0 m-2 flex flex-row'>
                <Button onClick={_ => setIsMinting(true)} size="large">
                  Mint Haiku
                </Button>
                <Tooltip title={'Log out ' + currentUser.accountId + '.'} arrow className="my-2 mx-4">
                  <IconButton onClick={signOut} size="large">
                    <AccountBalanceWalletIcon fontSize="large" color='primary' />
                  </IconButton>
                </Tooltip>
              </Box>
            : <Tooltip title='Log in using NEAR wallet.' arrow>
                <IconButton onClick={signIn} size="large" className='absolute top-0 right-0 m-2'>
                  <BrokenImageIcon fontSize="large" color='primary' />
                </IconButton>
              </Tooltip>
          }        
          {message && <Popup
            content={<>
              <Typography variant="h6" component="p" className='my-2'>Information</Typography>
              <div dangerouslySetInnerHTML={{__html: `${message}`}}/>
            </>}
            handleClose={clearMessage}
          />}

          {isMinting && 
            <Popup handleClose={_ => setIsMinting(false)}
                   content={<MintForm onMint={onMint}/>}/>}

          <Modal open={isLoadingModal}>
            <Box sx={modalStyle} className="flex flex-col">
              <PacmanLoader size={40} margin={2} color='#36D7B7' className="my-4"/>
            </Box>
          </Modal>
      </div>
    </>
  );
};

export default Layout;