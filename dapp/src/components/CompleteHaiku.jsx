import { React, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { CardActionArea } from '@mui/material';
import Grid from '@mui/material/Grid';
import GeneratePromptForm from './GeneratePromptForm';
import FillForm from './FillForm';

const CompleteHaiku = ({currentUser, contract, backendCall, setMessage, setIsLoadingModal}) => {
    const { id } = useParams();
    const [loaded, setLoaded] = useState(false);
    const [haiku, setHaiku] = useState(null);
    const [prompts, setPrompts] = useState(null);
    let navigate = useNavigate();

    useEffect(() => {
        async function fetchData() {
          const token = await contract.nft_token({token_id: `${id}`});
          console.log(token);
          setHaiku(token);
        }
        
        fetchData();
    }, [contract, currentUser, id]);

    useEffect(() => {
        if(!haiku || haiku.owner_id !== currentUser.accountId){
            return;
        }

        async function fetchData() {
          const prompts = await backendCall({id}, 'get-ai-prompt');
          console.log(prompts);
          setPrompts(prompts);
          setLoaded(true);
        }
        
        fetchData();
    }, [haiku, backendCall, currentUser, id]);

    const onGeneratePrompt = async (e) => {
        e.preventDefault();
        setIsLoadingModal(true);
        const { topic, adjective } = e.target.elements;
        const message = {id: id};
        if(topic.value){
            message.topic = topic.value;
        }
        if(adjective.value){
            message.adjective = adjective.value;
        }
        const prompts = await backendCall(message, 'generate-ai-prompt');
        console.log(prompts);
        setPrompts(prompts);
        setIsLoadingModal(false);
    }

    function setNativeValue(element, value) {
        const valueSetter = Object.getOwnPropertyDescriptor(element, 'value').set;
        const prototype = Object.getPrototypeOf(element);
        const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;
      
        if (valueSetter && valueSetter !== prototypeValueSetter) {
          prototypeValueSetter.call(element, value);
        } else {
          valueSetter.call(element, value);
        }
    }

    const fillForm = (prompt) => {
        const lines = prompt.split(" / ");

        let line = document.getElementById('line1');
        setNativeValue(line, lines[0]);
        line.dispatchEvent(new Event('input', { bubbles: true }));

        line = document.getElementById('line2');
        setNativeValue(line, lines[1]);
        line.dispatchEvent(new Event('input', { bubbles: true }));

        line = document.getElementById('line3');
        setNativeValue(line, lines[2]);
        line.dispatchEvent(new Event('input', { bubbles: true }));
    }

    const onFill = async (e) => {
        e.preventDefault();
        setIsLoadingModal(true);
        const { title_prompt, line1, line2, line3 } = e.target.elements;
        const haiku = `${line1.value} / ${line2.value} / ${line3.value}`;
        const title = title_prompt.value;
        const message = {
            haiku,
            title,
            id
        };
        const token = await backendCall(message, 'set-haiku');
        if(token){
            setIsLoadingModal(false);
            navigate('..', { replace: true });
            setMessage('Successfully updated the haiku.');
        }
        else{
            setIsLoadingModal(false);
            setMessage('Generating the haiku image failed.');
        }
    }

    if(!loaded){
    return <>
                <Typography variant="h4" component="h1" gutterBottom>
                    Uncompleted Haiku #{id}
                </Typography>
                <Typography variant="h4" component="h1" gutterBottom>
                Loading...
                </Typography>
            </>
    }

    if(!haiku){
        return <>
                    <Typography variant="h4" component="h1" gutterBottom>
                        There is no haiku #{id}
                    </Typography>
                </>
    }

    if(haiku.owner_id !== currentUser.accountId){
        return <>
                    <Typography variant="h4" component="h1" gutterBottom>
                        You don't own the haiku NFT #{id}
                    </Typography>
                </>
    }

    if(prompts){
        return  <>        
                    <Box className="my-4">
                        <Typography variant="h4" component="h1" gutterBottom>
                            Uncompleted Haiku #{id}
                        </Typography>
                        <p>
                            Choose one of the prompts below to take over the value into the form.
                        </p>
                        {prompts.length > 0
                            ? 
                            <Grid container spacing={2}>
                            {prompts.map(prompt => 
                                <Grid item xs={4}>
                                    <Card>
                                        <CardActionArea onClick={_ => fillForm(prompt)}>
                                            <CardContent>
                                                <Typography gutterBottom variant="h5" component="div">
                                                    AI Prompt
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" dangerouslySetInnerHTML={{__html: `${prompt.replace(/ \/ /g, '<br/>')}`}}/>
                                            </CardContent>
                                        </CardActionArea>
                                    </Card>                          
                                </Grid>)
                            }
                            </Grid>
                            : <p>
                                Something went wrong. There are no prompts available.
                            </p>}
                        <FillForm onFill={onFill} />
                    </Box>
                </>
    }

    return  <>
                <GeneratePromptForm onGeneratePrompt={onGeneratePrompt} id={id} />
            </>
}

export default CompleteHaiku;