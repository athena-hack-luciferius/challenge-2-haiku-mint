import React from 'react';
import { Outlet, Link } from 'react-router-dom'
import { push as Menu } from 'react-burger-menu';
import { IconButton, Typography, Link as MuiLink, Tooltip, Box } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import BrokenImageIcon from '@mui/icons-material/BrokenImage';
import Popup from './components/Popup';
import './burger-menu.css';
import Modal from '@mui/material/Modal';
import PacmanLoader from 'react-spinners/PacmanLoader';

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

const Layout = ({currentUser, signIn, signOut, clearMessage, message, isLoadingModal}) => {
  return (
    <>
      <div id="App">        
          <Menu pageWrapId={ "page-wrapper" } outerContainerId={ "App" } push>
            <Link className="menu-item" to="/">
              Dashboard
            </Link>

            <Link className="menu-item" to="/haikus">
              Your Haikus
            </Link>
          </Menu>
          <main id="page-wrapper" className='flex flex-col justify-between h-full p-5'>
            <Outlet/>
            <Copyright/>
          </main>
          { currentUser
            ? <Tooltip title={'Log out ' + currentUser.accountId + '.'} arrow>
                <IconButton onClick={signOut} size="large" className='absolute top-0 right-0 m-2'>
                  <AccountBalanceWalletIcon fontSize="large" color='primary' />
                </IconButton>
              </Tooltip>
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