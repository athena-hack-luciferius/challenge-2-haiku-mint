import React from 'react';
import { Typography, Button, Tooltip, TextField, Box } from '@mui/material';

export default function FillForm({ onFill }) {
  return (
    <Box component="form" onSubmit={onFill} className="items-center align-middle flex flex-col">
        <Typography variant="h4" component="h1" gutterBottom>Fill the haiku details</Typography>
        <Typography variant="body1" component="p" className='my-2'>Fill all haiku details. Click on one of the prompts to take over the haiku lines.</Typography>
        <TextField id="title_prompt" label="Title of the haiku" variant="outlined" className="my-4 self-center"
                   autoFocus required sx={{ minWidth: '400px' }}/>
        <Typography variant="body1" component="p" className='my-2'>Haiku:</Typography>
        <TextField id="line1" label="Line 1" variant="outlined" className="my-2 self-center" sx={{ minWidth: '400px' }} required/>
        <TextField id="line2" label="Line 2" variant="outlined" className="my-2 self-center" sx={{ minWidth: '400px' }} required/>
        <TextField id="line3" label="Line 3" variant="outlined" className="my-2 self-center" sx={{ minWidth: '400px' }} required/>
        <Tooltip title="Changes the NFT to a full haiku NFT." arrow className='mx-4'>
            <Button size='large' className="self-center" variant="outlined"
                    type="submit">
                Submit
            </Button>
        </Tooltip>
    </Box>
  );
}