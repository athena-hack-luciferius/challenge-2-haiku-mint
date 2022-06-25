import React from 'react';
import { Button, Typography } from '@mui/material';

export default function SignIn({signIn, version}) {
  return (
    <>
      <div className="my-4">
        <Typography variant="h4" component="h1" gutterBottom>
          Haiku World - {version}
        </Typography>

        <Typography variant="body1" component="p" className='mt-4 mb-2'>
          This app allows you to mint haikus as NFTs. This in turn enables you to sell them on the
          open market. It also verifies you as the definitive creator of the haiku.
        </Typography>

        <Typography variant="body1" component="p" className='my-2'>
          Additionally you have the posibility to use the GPT-3 text AI to get prompts for the haiku.
          You can then either directly mint the prompt as a haiku or use it as inspiration.
          In order to use the app you need to sign in with your NEAR wallet.
        </Typography>
        
        <Button vaiant="outlined" size='large' onClick={signIn}>Log in</Button>
      </div>
      
    </>
  );
}
