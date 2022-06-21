# 1. Introduction
This repository is a ready to use NEAR DApp template. It is written in Rust - for the smart contract - and React - for the frontend. It does not include a backend implementation.

This template features:
- Developing and deploying multiple smart contracts
- Styling based on [TailwindCss](https://tailwindcss.com/) and [Mui](https://mui.com/)
- Ready to use navigation
- Correct routing when re-entering the app from the near wallet
- Batch scripts for easier deployment/testing of smart contracts (yes I'm a windows user ;-)) 
- Github action for automatic pages deployment

# 2. Structure
- Root
  - contracts - all smart contracts are devloped in this directory
    - main - sample main contract
  - dapp - React DApp
    - src - app implementation
      - components - react components
    - public - static content

# 3. Getting Started
Before building anything make the following changes to the files:
- In all files
  - Replace "cryptosketches.testnet" with your testnet master account
  - Optional: Replace "main" with your main contract name - if you do, rename the directory contracts/main too
  - Replace "Title of Your App" with your dApp title
- Optional: Replace dapp/public/favicon.ico|logo192.png|logo512.png with a logo for your app

After the first successfull github build go to the github repository Settings/Pages/Source and choose gh-pages branch.