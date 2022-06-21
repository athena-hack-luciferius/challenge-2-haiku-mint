import React from 'react';
import { Button, Typography } from '@mui/material';

export default function SignIn({signIn, version}) {
  return (
    <>
      <div className="my-4">
        <Typography variant="h4" component="h1" gutterBottom>
          Title of Your App - {version}
        </Typography>
        <Typography variant="body1" component="p" className='my-4'>
            This app was developed for the XXX hackathon.
            Some small intro text.
            In order to use the app you need to sign in with your NEAR wallet.
        </Typography>
        <Button vaiant="outlined" size='large' onClick={signIn}>Log in</Button>
      </div>
      
    </>
  );
}
