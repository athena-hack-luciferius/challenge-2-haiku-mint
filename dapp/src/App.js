import React, { useState, useEffect } from 'react';
import NotFound from './components/404.jsx';
import Dashboard from './components/Dashboard.jsx';
import SignIn from './components/SignIn.jsx';
import CompleteHaiku from './components/CompleteHaiku.jsx';
import Layout from './layout';
import Big from 'big.js';
import { Route, Routes } from 'react-router-dom'
var version = require('../package.json').version;

const BOATLOAD_OF_GAS = Big(3).times(10 ** 14).toFixed();

const App = ({ contract, currentUser, config, wallet, provider, lastTransaction, error, signer }) => {
  const [message, setMessage] = useState('');
  const [isLoadingModal, setIsLoadingModal] = useState('');

  useEffect(() => {
      if (error){
        setMessage(decodeURI(error));
        window.history.pushState({}, "", window.location.origin + window.location.pathname + window.location.hash);
      }
      else if (lastTransaction && currentUser) {          
        getState(lastTransaction, currentUser.accountId);
        window.history.pushState({}, "", window.location.origin + window.location.pathname + window.location.hash);
      }

      async function getState(txHash, accountId) {
        const result = await provider.txStatus(txHash, accountId);
        const receiver = result.transaction.receiver_id;
        const method = result.transaction.actions[0].FunctionCall.method_name;
        let message;

        if(receiver === contract.contractId && method === "haiku_mint"){
          if(result.status.SuccessValue){
            const token = JSON.parse(Buffer.from(result.status.SuccessValue, 'base64').toString())
            message = `Successfully minted the haiku #${token.token_id} '${token.metadata.title}'.`
          }
        }
        else if(receiver === contract.contractId && method === "empty_haiku_mint"){
          if(result.status.SuccessValue){
            const token = JSON.parse(Buffer.from(result.status.SuccessValue, 'base64').toString())
            message = `Successfully minted the empty haiku #${token.token_id}. Now you can get your personal AI generated haiku <a class="menu-item" href="#/haikus/${token.token_id}">here</a>.`
          }
        }
        if(!message){
          //some default fallback
          message = "The transaction was successfull";
        }
        if(message){
          setMessage(message);
        }
      }
  }, [lastTransaction, error, currentUser, provider, contract.contractId]);

  const backendCall = async (message, method) => {
    var ObjectToArray = function(json)
    {
      var str = JSON.stringify(json, null, 0);
      var ret = new Uint8Array(str.length);
      for (var i = 0; i < str.length; i++) {
        ret[i] = str.charCodeAt(i);
      }
      return ret
    };

    message = ObjectToArray(message);
    const signature = await signer.signMessage(message, currentUser.accountId, config.networkId);
    signature.signature = Array.from(signature.signature);
    signature.publicKey.data = Array.from(signature.publicKey.data);
    const messageArray = Array.from(message)

    try{
      const requestOptions = {
          method: 'POST',
          mode: 'cors',
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({
            message: messageArray,
            signature: signature,
            accountId: currentUser.accountId
          })
      };
      const response = await fetch(config.backendUrl+method, requestOptions);
      if(response.ok) {
        const responseJson = await response.json();
        console.log(responseJson);
        return responseJson;
      }
      else {
        console.error(`Response shows no success: ${await response.text()}`);
      }
    }
    catch (err){
      console.error(err);
    }
  }

  const onMint = async (e) => {
    e.preventDefault();
    const { title_prompt, line1, line2, line3 } = e.target.elements;
    const emptyHaiku = e.nativeEvent.submitter.value === 'empty';
    setIsLoadingModal(true);

    if(emptyHaiku){
      const attached = Big(2).times(10 ** 24).toFixed()
      await contract.empty_haiku_mint(
        {},
        BOATLOAD_OF_GAS,
        attached
      );
    } else {
      if(!title_prompt.value ||
        !line1.value ||
        !line2.value ||
        !line3.value) {
          setMessage('You need to fill all fields to mint the haiku directly.')
          return;
      }
      const haiku = `${line1.value} / ${line2.value} / ${line3.value}`;
      const title = title_prompt.value;
      const media = await backendCall({haiku, title}, 'generate-haiku-media');
      if(media){
        const attached = Big(1).times(10 ** 24).toFixed()
        const mintParams = {
          haiku,
          media: media.media,
          title
        };
        console.log(`Minting NFT with ${JSON.stringify(mintParams)}`)
        await contract.haiku_mint(
          mintParams,
          BOATLOAD_OF_GAS,
          attached
        );
      }
    }
  }
  
  const signIn = () => {
    wallet.requestSignIn(
      {contractId: contract.contractId, //contract requesting access 
       methodNames: []}, //used methods
      'NEAR Challenge #8 - DAO Dashboard', //optional name
      null, //optional URL to redirect to if the sign in was successful
      null //optional URL to redirect to if the sign in was NOT successful
    );
  };

  const signOut = () => {
    wallet.signOut();
    window.location.reload(false);
  };

  const clearMessage = () => {
    setMessage('');
  };

  //cleanup styles Login/Logout Button Popup close button, Copyright at bottom, Buttons filled
  //add github build script

  if(!currentUser){
    return (
      <Routes>
        <Route path="/" element={<Layout currentUser={currentUser} signIn={signIn} signOut={signOut} clearMessage={clearMessage} message={message} isLoadingModal={isLoadingModal}/>}>
          <Route index element={<SignIn signIn={signIn} version={version} />}/>
          <Route path="*" element={<SignIn signIn={signIn} version={version} />}/>
        </Route>
      </Routes>
    );
  }
  
  return (
    <Routes>
      <Route path="/" element={<Layout currentUser={currentUser} signIn={signIn} signOut={signOut} clearMessage={clearMessage} message={message} isLoadingModal={isLoadingModal} onMint={onMint}/>}>
        <Route index element={<Dashboard currentUser={currentUser} contract={contract} version={version}/>}/>
        <Route path="haikus/:id" element={<CompleteHaiku currentUser={currentUser} contract={contract} backendCall={backendCall} setMessage={setMessage} setIsLoadingModal={setIsLoadingModal}/>}/>
        <Route path="*" element={<NotFound/>}/>
      </Route>
    </Routes>
  );
}

export default App;
