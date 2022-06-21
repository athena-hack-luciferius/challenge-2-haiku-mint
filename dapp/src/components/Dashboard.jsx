import React from 'react';
import { Link } from 'react-router-dom';
import { Typography } from '@mui/material';

const Dashboard = ({version}) => {
   return <>
            <div className="my-4">
              <Typography variant="h4" component="h1" gutterBottom>
                Title of Your App - {version}
              </Typography>
              <p>
                  This app was developed for the XXX hackathon.
                  Explanation of the app.
              </p>
              <p className='text-lg'>
                Head over <Link className="menu-item" to="/haikus">here</Link> to do something with the app.
              </p>
            </div>
          </>
}

export default Dashboard;