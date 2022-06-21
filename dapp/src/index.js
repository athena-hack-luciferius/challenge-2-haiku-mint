import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter as Router } from "react-router-dom";
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { StyledEngineProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import getConfig from './config.js';
import * as nearAPI from 'near-api-js';
//hack
import * as buffer from "buffer";
window.Buffer = buffer.Buffer;

// Initializing contracts
async function initContracts() {
  
  const config = getConfig(process.env.NEAR_ENV || 'testnet');
  const keyStore = new nearAPI.keyStores.BrowserLocalStorageKeyStore();
  const near = await nearAPI.connect({ keyStore, ...config });
  const walletConnection = new nearAPI.WalletConnection(near);
  
  let currentUser;
  if (walletConnection.getAccountId()) {
    currentUser = {
      accountId: walletConnection.getAccountId(),
      balance: (await walletConnection.account().state()).amount,
    };
  }

  const contract = await new nearAPI.Contract(
    walletConnection.account(),
    "haiku_nft.cryptosketches.testnet",
    {
      viewMethods: ['nft_supply_for_owner', 'nft_tokens_for_owner', 'nft_token'],
      changeMethods: ['empty_haiku_mint', 'haiku_mint'],
      sender: walletConnection.getAccountId(),
    }
  );
  
  const provider = near.connection.provider;
  const signer = near.connection.signer;
  
  return { contract, currentUser, config, walletConnection, provider, signer };
}

window.nearInitPromise = initContracts().then(
  ({ contract, currentUser, config, walletConnection, provider, signer }) => {
    let urlParams = new URLSearchParams(window.location.search);
    let lastTransaction;
    if(urlParams.has('transactionHashes')){
        lastTransaction = urlParams.get('transactionHashes');
    }
    let errorMessage;
    if(urlParams.has('errorMessage')){
        errorMessage = urlParams.get('errorMessage');
    }

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(
      <React.StrictMode>
        <StyledEngineProvider injectFirst>
          <CssBaseline />
          <Router>
            <App
              contract={contract}
              currentUser={currentUser}
              config={config}
              wallet={walletConnection}
              lastTransaction={lastTransaction}
              provider={provider}
              error={errorMessage}
              signer={signer}
            />
          </Router>
        </StyledEngineProvider>
      </React.StrictMode>
    );

    // If you want to start measuring performance in your app, pass a function
    // to log results (for example: reportWebVitals(console.log))
    // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
    reportWebVitals();
  }
);
