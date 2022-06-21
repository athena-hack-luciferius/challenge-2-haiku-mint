import React from 'react';
import { Typography, Button, Tooltip, TextField, Box } from '@mui/material';

export default function MintForm({ onMint }) {
  return (
    <Box component="form" onSubmit={onMint} className="items-center align-middle flex flex-col">
        <Typography variant="h4" component="h1" gutterBottom>Mint a new haiku below</Typography>
        <Typography variant="body1" component="p" className='my-2'>Either create an empty haiku to receive AI prompts or mint own haiku directly.</Typography>
        <TextField id="title_prompt" label="Title of the haiku" variant="outlined" className="my-4 self-center"
                   autoFocus sx={{ minWidth: '400px' }}/>
        <Typography variant="body1" component="p" className='my-2'>Haiku:</Typography>
        <TextField id="line1" label="Line 1" variant="outlined" sx={{ minWidth: '400px' }} className="my-2 self-center"/>
        <TextField id="line2" label="Line 2" variant="outlined" sx={{ minWidth: '400px' }} className="my-2 self-center"/>
        <TextField id="line3" label="Line 3" variant="outlined" sx={{ minWidth: '400px' }} className="my-2 self-center"/>
        <div className='flex flex-row justify-center my-4 self-center'>
            <Tooltip title="Mints the provided haiku." arrow className='mx-4'>
                <Button size='large' className="self-center" variant="outlined"
                        type="submit">
                    Mint Haiku!
                </Button>
            </Tooltip>
            <Tooltip title="Mints an empty haiku, ignoring the inputs above." arrow className='mx-4'>
                <Button size='large' className="self-center" variant="outlined" value="empty"
                        type="submit">
                    Mint an Empty Haiku!
                </Button>
            </Tooltip>
        </div>
    </Box>
  );
}