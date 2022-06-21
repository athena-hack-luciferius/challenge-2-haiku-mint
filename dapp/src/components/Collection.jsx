import React, { useState, useEffect } from 'react';
import MintForm from './MintForm.jsx';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import CardActionArea from '@mui/material/CardActionArea';
import { useNavigate } from "react-router-dom";

const Collection = ({currentUser, contract, onMint}) => {
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
    return <>
              <Typography variant="h4" component="h1" gutterBottom>
                {currentUser.accountId}'s Collection
              </Typography>
              <Typography variant="h4" component="h1" gutterBottom>
                Loading...
              </Typography>
          </>
  }
  
   return <>
            <Typography variant="h4" component="h1" gutterBottom>
              {currentUser.accountId}'s Collection
            </Typography>
              
            {nfts.length > 0
            ? 
            <Grid container spacing={2}>
              {nfts.map(nft => 
                <Grid item xs={4}>
                  {nft.metadata.title === 'Empty'
                  ?
                  <Card>
                    <CardActionArea onClick={_ => navigate(`./${nft.token_id}`)}>
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
            <div className="my-4">
              <MintForm onMint={onMint}/>
            </div>
          </>
}

export default Collection;