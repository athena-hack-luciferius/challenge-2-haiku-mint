import React from 'react';
import MintForm from './MintForm';

const Mint = ({onMint}) => {
   return <>
            <div className="my-4">
              <MintForm onMint={onMint}/>
            </div>
          </>
}

export default Mint;