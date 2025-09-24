# TerraLedger: A Blockchain-Based Land Registry

This project is a decentralized application (DApp) that creates a transparent and tamper-proof system for recording and transferring land ownership. It leverages the power of the Ethereum blockchain to overcome the challenges of traditional, paper-based land registry systems.

This project is built using the **Hardhat 3** development environment, with **Mocha** for testing and **Ethers.js** for blockchain interactions.

## Project Overview 🔎

The goal of TerraLedger is to provide a secure and immutable ledger for land titles. By representing each land parcel as a unique token on the blockchain, we can ensure that ownership records are auditable, cannot be fraudulently altered, and can be transferred securely between parties.

### Technology Stack

  * **Smart Contracts:** Solidity
  * **Development Environment:** Hardhat
  * **Frontend:** React
  * **Blockchain Interaction:** Ethers.js
  * **Testing:** Mocha & Chai

-----

## Getting Started 🚀

### Prerequisites

  * [Node.js](https://nodejs.org/) (v18 or later)
  * [MetaMask](https://metamask.io/) browser extension

### Installation and Setup

1.  **Clone the repository:**

    ```shell
    git clone https://github.com/your-username/TerraLedger.git
    cd TerraLedger
    ```

2.  **Install backend dependencies:**

    ```shell
    npm install
    ```

3.  **Install frontend dependencies:**

    ```shell
    cd client
    npm install
    ```

-----

## Usage 🛠️

### Running Tests

To ensure the smart contract is working correctly, run the automated tests:

```shell
npx hardhat test
```

### Running a Local Development Node

For development, you can run a local blockchain node on your machine. This allows you to deploy and test your contract without spending real money.

```shell
npx hardhat node
```

Keep this terminal running. It will provide you with several test accounts, each funded with 10000 ETH for development purposes.

### Deploying to the Local Node

In a **new terminal**, deploy the `TerraLedger` contract to your local Hardhat node:

```shell
npx hardhat ignition deploy ignition/modules/TerraLedgerModule.ts --network localhost
```

*Note: We will create the `TerraLedgerModule.ts` file in a later step.*

### Running the Frontend

To start the user interface, navigate to the `client` directory and run the development server:

```shell
cd client
npm run dev
```

Open your browser to `http://localhost:5173` (or the address provided in the terminal) to interact with the application.

### Deploying to a Public Testnet (Sepolia)

1.  **Set your private key:** To deploy to a live network, you need an account with funds. Set your Sepolia testnet account's private key as an environment variable. You can do this by creating a `.env` file in the project root:

    ```
    SEPOLIA_PRIVATE_KEY="YOUR_SEPOLIA_PRIVATE_KEY"
    ```

2.  **Deploy the contract:**

    ```shell
    npx hardhat ignition deploy ignition/modules/TerraLedgerModule.ts --network sepolia
    ```