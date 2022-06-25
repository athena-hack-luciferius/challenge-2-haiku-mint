import React from 'react';
import { Typography, Button, Tooltip, TextField, Box, Paper } from '@mui/material';

export default function GeneratePromptForm({ onGeneratePrompt, id }) {
  return (
    <Box component="form" onSubmit={onGeneratePrompt} className="items-center align-middle flex flex-col">
      <Typography variant="h4" component="h1" gutterBottom>Uncompleted Haiku #{id}</Typography>
      <Typography variant="body1" component="p" className='my-2'>
          Here you set the parameter for the AI prompts. Once they are generated you can complete the haiku.
          None of the fields below are required. The more unique the prompts are the more unique the haiku will be.
          Each NFT will let you generate a prompt only once.
      </Typography>
      <Paper className="items-center align-middle flex flex-col p-5" sx={{ width: '70%' }}>
        <TextField id="topic" label="The topic the haiku is about - think of it as a theme (sunset, flowers, colors...)" variant="outlined" className="my-4 self-center w-full"
                  autoFocus/>
        <TextField id="adjective" label="An adjective for the haiku. Can be used to determine the mood (sad, funny, mechanloic, ...)" variant="outlined" className="my-4 self-center w-full"/>
        <Tooltip title="Generates the prompt." arrow className='mx-4'>
            <Button size='large' className="self-center" variant="outlined"
                    type="submit">
                Generate!
            </Button>
        </Tooltip>
      </Paper>
    </Box>
  );
}