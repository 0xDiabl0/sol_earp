# Early Adopter Rewards Protocol (EAR)

EAR protocol is a decentralized application platform that aims to potentially change the way early-adopters have been rewarded uptil now. Our goal is simple - to allow developers and entrepreneurs to easily and reliably create an income stream for their early users. 

# What we do

Through EAR protocol, developers promise some regular income stream for their early adopters.
Early users get to use these products but also collect their recurring revenue via EAR.
The protocol allows this trustless contract between business/developer and early user through smart-contracts.

# Use-cases

Some of the use-case that could become prominent :
- EAR can be a new acquisition channel for established brands when they launch new products. Eg. Nike when launching new line of shoes could attract crypto community through EAR
- EAR can be a funding mechanism where new businesses get bootstrapped by early users. Users are the best investors - made true by EAR
- EAR can be a great bridge between the real world and Web3. Local stores can allocate some % of their ad spends (to Goog/FB) to EAR rewards. A hyper local app could let users know of such offers in their locality.
- EAR allows free-lance developers to easily get engagement+momentum. Normally developers are not great at business. EAR attracts users for them.When products are launched with EAR, the trustless smart contracts attract early adopters who can spur growth for new services.

# Team

We are a bunch of seasoned software professionals who have worked with large organisations like Google. In the past, we used to run a funded SaaS startup - Moxiter. 
Idea of rewarding ealy-adopters have been brewing in our heads since then. With blockchain, we can finally do it.

# Product

Current version only runs on localnet and has some hard-coded addresses, which you should replace inorder to run. 
In this proof-of-concept, We have been able to achieve following
- Businesses list their product (with reward pool and early adopter limits)
- We showcase all listings on our dApp
- User can connect their wallet and purchase the listed products.
- Buyer address is put on-chain to be used later
- The amount collected from user is split and transferred across Business account address, Reward pool address, EAR Treasury address
- The Reward pool is regularly disbursed to early adopters (stored on chain)

# What comes next

We have some grand plans for this protocol

- Make the product workable on devnet and finally launch on Mainnet (a lot of work will go towards it)
- Support multiple rules for reward disbursal (at the moment, only disburses when pre-decided number of buyers is reached)
- Reach out to interested developers and digital good/service providers to launch with us.

# How to use

You would need Node, React, Rust, Solana CLI and Anchor framework to get this going. Some browser-based Solana wallet is also required.
After everything is installed, need to start 3 services
- $ cd sear
- $ solana-test-validator
- $ node /sear/apis/index.js
- $ yarn 
- $ yarn start



# Quickstart

```bash

yarn

```

```bash

yarn start

```

To run the local data server, follow these steps

```bash

cd sol_earp/apis

```
```bash

node index.js

```

# Environment Setup
1. Install Rust from https://rustup.rs/
2. Install Solana v1.6.7 or later from https://docs.solana.com/cli/install-solana-cli-tools#use-solanas-install-tool
3. Install Node
4. Install NPM, Yarn
5. Install Anchor framework

# Build Smart Contract (compiled for BPF)
Run the following from the program/ subdirectory:

```bash
$ anchor build
$ anchor deploy
```
After the smart contarct has compiled, deploy it on the chain. 

# Directory structure

## anchorapp

Solana program template in Anchor(Rust)

## src/actions

Setup here actions that will interact with Solana programs using sendTransaction function

## src/contexts

React context objects that are used propagate state of accounts across the application

## src/hooks

Generic react hooks to interact with token program:
* useUserBalance - query for balance of any user token by mint, returns:
    - balance
    - balanceLamports
    - balanceInUSD
* useUserTotalBalance - aggregates user balance across all token accounts and returns value in USD
    - balanceInUSD
* useAccountByMint
* useTokenName
* useUserAccounts

## src/views

* home - main page for your app
* faucet - airdrops SOL on Testnet and Devnet
