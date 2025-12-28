export const mockProperties = [
  {
    propertyId: 1,
    owner: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    ownerName: "John Anderson",
    location: "123 Blockchain Avenue, Crypto City, CA 90210",
    isRegistered: true,
    registrationDate: "2024-01-15T10:30:00Z",
    transactionHash: "0x742d35cc6634c0532925a3b844bc9e7fe6064d8f9c0e7e2f89e8e7a9c2e1b3f4",
    blockNumber: 15234567,
    area: "2,500 sq ft",
    price: "$450,000",
    type: "Residential"
  },
  {
    propertyId: 2,
    owner: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    ownerName: "Sarah Mitchell",
    location: "456 Decentralized Street, Web3 District, NY 10001",
    isRegistered: true,
    registrationDate: "2024-02-20T14:45:00Z",
    transactionHash: "0x8a3d82f97e5c1b2a4d6f8e9c3b7a5f4e2d1c9b8a7f6e5d4c3b2a1f9e8d7c6b5a",
    blockNumber: 15289432,
    area: "3,200 sq ft",
    price: "$680,000",
    type: "Commercial"
  },
  {
    propertyId: 3,
    owner: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    ownerName: "Michael Chen",
    location: "789 Smart Contract Road, DeFi Valley, TX 75001",
    isRegistered: true,
    registrationDate: "2024-03-10T09:15:00Z",
    transactionHash: "0x1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0e1d2c3b4a5f6e7d8c9b0a1f2e",
    blockNumber: 15334219,
    area: "5,000 sq ft",
    price: "$1,200,000",
    type: "Industrial"
  },
  {
    propertyId: 4,
    owner: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    ownerName: "Emily Rodriguez",
    location: "321 NFT Plaza, Metaverse Heights, FL 33101",
    isRegistered: true,
    registrationDate: "2024-04-05T16:20:00Z",
    transactionHash: "0x9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d",
    blockNumber: 15378654,
    area: "1,800 sq ft",
    price: "$320,000",
    type: "Residential"
  },
  {
    propertyId: 5,
    owner: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    ownerName: "David Park",
    location: "555 Token Lane, Ethereum Estate, WA 98101",
    isRegistered: true,
    registrationDate: "2024-05-12T11:30:00Z",
    transactionHash: "0x7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b",
    blockNumber: 15423891,
    area: "4,100 sq ft",
    price: "$890,000",
    type: "Commercial"
  }
];

export const mockTransactions = [
  {
    id: 1,
    propertyId: 2,
    from: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    to: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    fromName: "Sarah Mitchell",
    toName: "John Anderson",
    transactionHash: "0x5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c",
    timestamp: "2024-06-15T14:25:00Z",
    blockNumber: 15512345,
    status: "confirmed",
    gasUsed: "84523",
    gasPrice: "25 Gwei"
  },
  {
    id: 2,
    propertyId: 1,
    from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    to: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    fromName: "John Anderson",
    toName: "Michael Chen",
    transactionHash: "0x3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a",
    timestamp: "2024-07-20T10:15:00Z",
    blockNumber: 15589234,
    status: "confirmed",
    gasUsed: "91245",
    gasPrice: "30 Gwei"
  }
];

export const mockUser = {
  address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  name: "Demo User",
  isAdmin: true,
  balance: "10.5 ETH",
  network: "Ethereum Mainnet"
};

export const generateMockTransaction = () => {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
};

export const generateBlockNumber = () => {
  return Math.floor(15000000 + Math.random() * 1000000);
};
