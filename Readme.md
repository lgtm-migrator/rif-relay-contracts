# RIF Relay Contracts

This project is part of the RIF Relay ecosystem. It contains all the smart contracts that the system uses.

## Table of Contents

- [**Installation**](#installation)
  - [**Pre-requisites**](#pre-requisites)
  - [**Dependencies**](#dependencies)
- [**Smart Contracts**](#smart-contracts)
  - [**Deployment**](#deployment)
  - [**Addresses**](#addresses)
- [**System usage**](#system-usage)
  - [**Allowing tokens**](#allowing-tokens)
  - [**TestToken Minting**](#testtoken-minting)
- [**Library usage**](#library-usage)
  - [**As a dependency**](#as-a-dependency)
  - [**Development**](#development)
    - [**Adding new files**](#adding-new-files)
    - [**Contract addresses**](#contract-addresses)
    - [**Husky and linters**](#husky-and-linters)
    - [**Generating a new distributable version**](#generating-a-new-distributable-version)
      - [**For GitHub**](#for-github) 
      - [**For NPM**](#for-npm)
      - [**For direct use (no publishing)**](#for-direct-use-no-publishing)

## Installation

### Pre-requisites

- An RSKJ Node running locally
- Node version 12.18

### Dependencies

Install all dependencies by running `npm install`.

The project is ready to be used at this point.

## Smart Contracts

### Deployment

The contracts can be deployed in the following way:

1. Configure the `truffle.js` file on the root of the project to set your network 
2. Run `npx truffle migrate --network <NETWORK_NAME>` 

This will start the migration on `<NETWORK_NAME>`; at the end of it you should see a summary with all the contract addresses.

#### Create a Multisig account

The repo includes a script that can be run to create a multisig account.

Pre-requirements: [Safe contracts v1.2.0](https://github.com/gnosis/safe-contracts/tree/v1.2.0) deployed within the network.
Please check that the Safe addresses defined at `scripts/utils.js#69-78` reflect the addresses of the deployed Safe contracts.

```bash
npx truffle --network regtest exec tasks/create-safe.js --owners="<0xaddr_1>,<0xaddr_2>,..."
```

Parameters:
- `owners`: a comma-separated list of addresses (e.g.: `"0x7986b3DF570230288501EEa3D890bd66948C9B79,0x0a3aA774752ec2042c46548456c094A76C7F3a79,0xCF7CDBbB5F7BA79d3ffe74A0bBA13FC0295F6036,0x39B12C05E8503356E3a7DF0B7B33efA4c054C409"`); if not specified, the script uses the first 4 accounts retrieved from `web3.eth.getAccounts` (useful for local development only).

#### Collector Deployment

To deploy a collector, we need to run the script `deploy-collector.js`; it receives two parameters:
- `collectorConfig`: used to specify the collector owner and the partners configuration (addresses and shares). If not specified, the file `deploy-collector.input.json` will be used. Please have a look at `deploy-collector.input.sample.json` for a sample file.
- `outputFile`: used to log the main information of the collector deployment. If not specified, the file `revenue-sharing-addresses.json` will be used. 

E.g.:
```bash
npx truffle --network <network_name> exec tasks/deploy-collector.js --collectorConfig="<collector_configuration.json>" --outputFile="output.json"
```

#### Change partner shares

Pre-requirements:
- the collector we want to change must be deployed. See the [related section](#collector-deployment) to deploy a collector;
- there must be no shares to be distributed among the partners otherwise the transaction will fail; please be sure that the current balance is less than or equal to the number of partners;
- only the owner can execute this transaction.

The `change-partner-shares.js` is a utility script that can be run to change the partner shares of a collector already deployed. It receives the following parameters:
- `collectorAddress`: mandatory, it's the address of the collector we want to change
- `partnerConfig`: optional, it includes the new partner shares we want to set; if not specified we use `partner-shares.json` as default value; check the `partner-shares.sample.json` to verify the format.
- `txGas`: optional, it's the gas limit used for the transaction. If the transaction fails, we may probably need to specify an higher value; default value is `150000`;

Usage:
```bash
npx truffle --network <network_name> exec tasks/change-partner-shares.js --partnerConfig="<file_including_partners_config.json>" --collectorAddress="<collector_address>" --txGas="<gas_limit>"
```
Example:
```bash
npx truffle --network testnet exec tasks/change-partner-shares.js --partnerConfig="partner-shares.json" --collectorAddress="0x9b91c655AaE10E6cd0a941Aa90A6e7aa97FB02F4" --txGas="200000"
```

### Addresses

Each time the smart contracts are deployed, the `contract-addresses.json` file is updated. This file contains all contracts addresses for the network they were selected to be deployed on. 

This change can be committed so that this repository is updated with the new version of the file; addresses for Testnet and Mainnet should be kept up to date.

This file also is being exported on the distributable version to provide the consumers a way to know the contract addresses on Testnet and Mainnet when we begin to release the project as a Node.js dependency.

## System usage 

### Allowing tokens

Once the smart contracts are deployed, tokens must be individually allowed to be able to work with the RIF Relay system. There are some helpful commands for this:

1. To allow a specific token, run `npm run allowTokens <TOKEN_ADDRESSES> <NETWORK_NAME>` where:
    - `<TOKEN_ADDRESSES>` is a comma-separated list of the token addresses to be allowed on the available verifiers
    - `<NETWORK_NAME>` is an optional parameter for the network name, taken from the `truffle.js` file (default value is `regtest`) **important! This should be the same network name as the one used to deploy the contracts** 
2. To query allowed tokens run `npm run allowedTokens <NETWORK_NAME>`. This will display them on the console.

### TestToken Minting

Once the smart contracts are deployed, [TestToken](./contracts/test/tokens/TestToken.sol)s can be minted and transferred by using the related script:
```bash
npx truffle exec --network <network_name> tasks/mint.js --tokenReceiver <0xabc123> --amount <amount_in_wei>
```
Parameters:
- `tokenReceiver`: the address of the account the token will be transferred to (default value - `(await web3.eth.getAccounts())[0]`)
- `amount`: the amount of tokens that will be minted and transferred (default value - `web3.utils.toWei('1', 'ether');`).

#### Warning message
Truffle doesn’t support additional arguments natively when running `truffle exec` command, so the user can ignore the warning shown when the command is executed.

```bash
Warning: possible unsupported (undocumented in help) command line option(s): --tokenReceiver,--amount
```

For further info about `truffle exec`, please have a look at its [official documentation](https://www.trufflesuite.com/docs/truffle/reference/truffle-commands#exec).

### Withdraw

To call the `withdraw` method available on the Collector contract, the repo provides the script `/tasks/withdraw.js`. It allows the user to call the `withdraw` whether the contract owner is a Multisig account or an EOA.

```bash
npx truffle --network regtest exec tasks/withdraw.js --safeAddress='<0xsafe_address>' --safeOwners='<0xsafe_owner1,0xsafe_owner2>' --collectorAddress='<0xcollector_address>' --tokenAddress='<0xtoken_address>' --partners='<0xpartner1,0xpartner2>' 
```

Parameters:
* `safeAddress`: Address of the Safe account set as owner of the Collector. It must be used only when then collector owner is a multisig account;
* `safeOwners`: Comma-separated list of addresses that are the owners of the Safe account
* `collectorAddress`: Address of the Collector deployed; if not specified, the `collectorContract` field of the `revenue-sharing-addresses.json` file is used.
* `tokenAddress`: Address of the ERC-20 token used by the Collector; if not specified, the `collectorToken` field of the `revenue-sharing-addresses.json` file is used.
* `partners`: Comma-separated list of addresses to which the Collector distributes the token.

## Library usage

### As a dependency

You can install this project like any other dependency through: 

```bash
npm i --save @rsksmart/rif-relay-contracts
```

which will provide you with a way to use the contracts and interfaces, e.g.:

```javascript
import {RelayHub, IForwarder} from '@rsksmart/rif-relay-contracts';

const relayHubContractAbi = RelayHub.abi;
const iForwarderAbi = IForwarder.abi;
```

### Development

#### Adding new files

New solidity files can be added inside the contracts folder at the root of this repository, but note that:

1. If your new file is not meant to be used outside this repository (internal contract or contract that will not be manually instantiated) then you don’t need to worry about anything else than just making solidity compile using `npm run compile` and making the linter work running `npm run lint:sol`.  
2. If your file is a contract that needs to be manually instantiated or referenced from outside this project, you’ll also need to run `npm run compile` and `npm run lint:sol`. If everything goes well, go to the `index.ts` file at the root of this project and add those new contracts/interfaces to the import/export declarations:
```typescript
const SomeContract = require('./build/contracts/SomeContract.json');

export {
   ...,
   SomeContract
};
```

### Contract addresses

During development, the smart contract addresses config file can be expected to be updated each time a migration is executed. 

To automatically use these new addresses each time a change is made, use the `npm link` mechanism (https://docs.npmjs.com/cli/v8/commands/npm-link).

#### Husky and linters

We use Husky to check linters and code style for every commit. If commiting changes fails on lint or prettier checks you can use these commands to check and fix the errors before trying again:

* `npm run lint:ts`: to check linter bugs for typescript
* `npm run lint:ts:fix`: to fix linter bugs for typescript
* `npm run lint:sol`: to see bugs on solidity
* `npm run prettier`: to check code style errors
* `npm run prettier:fix`: to fix code style errors
   
#### Generating a new distributable version

1. Run the `npm run dist` command to generate the `dist` folder with the distributable version inside.
2. Bump the version on the `package.json` file (not strictly needed).
3. Commit and push any changes, including the version bump.

##### For GitHub

1. Create a new tag with the new version (from `package.json`) and github actions will update npm 

##### For NPM

1. Run `npm login` to login to your account on npm registry.
2. Run `npm publish` to generate the distributable version for NodeJS.

##### For direct use (no publishing)

No extra steps are needed beyond generating the `dist` folder and merging it to `master`.
