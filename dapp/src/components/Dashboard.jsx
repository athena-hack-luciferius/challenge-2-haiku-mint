import React, { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import CardActionArea from '@mui/material/CardActionArea';
import { useNavigate } from "react-router-dom";
import { Box } from '@mui/material';

const Dashboard = ({currentUser, contract, version}) => {
    const [nfts, setNfts] = useState([]);
    const [loaded, setLoaded] = useState(false);
    let navigate = useNavigate();
  
  useEffect(() => {
      async function fetchData() {
        const count = await contract.nft_supply_for_owner({account_id: currentUser.accountId});
        const result = await contract.nft_tokens_for_owner(
        {
            account_id: currentUser.accountId,
            from_index: "0",
            limit: parseInt(count)
        });
        console.log(result);
        setNfts(result);
        setLoaded(true);
      }
      
      fetchData();
  }, [contract, currentUser]);

  if(!loaded){
    return <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                Haiku World - {version}
              </Typography>
              <Typography variant="h4" component="h1" gutterBottom>
                Loading...
              </Typography>
          </Box>
  }
  
   return <Box className='flex flex-col'>
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
            </Typography>

            <Typography variant="body1" component="p" className='mt-2'>
              Below you see your haiku collection. And in the top left corner you can mint new haikus. Have fun!
            </Typography>
              
            {nfts.length > 0
            ? 
            <Grid container spacing={2} className="my-4">
              {nfts.map(nft => 
                <Grid item xs={12} md={6}>
                  {nft.metadata.title === 'Empty'
                  ?
                  <Card>
                    <CardActionArea onClick={_ => navigate(`./haikus/${nft.token_id}`)}>
                      <CardMedia
                        component="img"
                        image={nft.metadata.media}
                        alt={nft.metadata.title}
                        height='200px'
                      />
                      <CardContent>
                        <Typography gutterBottom variant="h5" component="div">
                          {nft.metadata.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" >
                          Click to complete the haiku using AI prompts.
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                  :
                  <Card>
                    <CardMedia
                      component="img"
                      image={nft.metadata.media}
                      alt={nft.metadata.title}
                      height='200px'
                    />
                    <CardContent>
                      <Typography gutterBottom variant="h5" component="div">
                        {nft.metadata.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" dangerouslySetInnerHTML={{__html: `${nft.metadata.description.replace(/ \/ /g, '<br/>')}`}}/>
                    </CardContent>
                  </Card>}
                  
                </Grid>)
              }
            </Grid>
            : <p>
                  You do not have any NFTs in your collection. All used NFTs are filtered out in this view.
              </p>}
          </Box>
}

export default Dashboard;