export const mockProperties = [
  {
    propertyId: 1,
    owner: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    ownerName: "Ranjit Das",
    location: "House No. 12, GS Road, Guwahati, Assam, India 781005",
    isRegistered: true,
    registrationDate: "2024-01-15T10:30:00Z",
    transactionHash: "0x8a7d35cc6634c0532925a3b844bc9e7fe6064d8f9c0e7e2f89e8e7a9c2e1a9b",
    blockNumber: 15234567,
    area: "232 sq m",
    price: "₹45,00,000",
    type: "Residential"
  },
  {
    propertyId: 2,
    owner: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    ownerName: "Ananya Sharma",
    location: "Plot 45, Fancy Bazar, Guwahati, Assam, India 781001",
    isRegistered: true,
    registrationDate: "2024-02-20T14:45:00Z",
    transactionHash: "0x4b3d82f97e5c1b2a4d6f8e9c3b7a5f4e2d1c9b8a7f6e5d4c3b2a1f9e8d7c",
    blockNumber: 15289432,
    area: "298 sq m",
    price: "₹68,00,000",
    type: "Commercial"
  },
  {
    propertyId: 3,
    owner: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    ownerName: "Sourav Gogoi",
    location: "Industrial Zone, Amingaon, Guwahati, Assam, India 781031",
    isRegistered: true,
    registrationDate: "2024-03-10T09:15:00Z",
    transactionHash: "0x1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0e1d2c3b4a5f6e7d8c9b0",
    blockNumber: 15334219,
    area: "465 sq m",
    price: "₹1,20,00,000",
    type: "Industrial"
  },
  {
    propertyId: 4,
    owner: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    ownerName: "Priyanka Baruah",
    location: "Lane 7, Zoo Road, Guwahati, Assam, India 781024",
    isRegistered: true,
    registrationDate: "2024-04-05T16:20:00Z",
    transactionHash: "0x9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0",
    blockNumber: 15378654,
    area: "167 sq m",
    price: "₹32,00,000",
    type: "Residential"
  },
  {
    propertyId: 5,
    owner: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    ownerName: "Bikram Nath",
    location: "Main Road, Dibrugarh Town, Assam, India 786001",
    isRegistered: true,
    registrationDate: "2024-05-12T11:30:00Z",
    transactionHash: "0x7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e",
    blockNumber: 15423891,
    area: "381 sq m",
    price: "₹89,00,000",
    type: "Commercial"
  }
];

export const mockTransactions = [
  {
    id: 1,
    propertyId: 2,
    from: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    to: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    fromName: "Ananya Sharma",
    toName: "Ranjit Das",
    transactionHash: "0x5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7",
    timestamp: "2024-06-15T14:25:00Z",
    blockNumber: 15512345,
    status: "confirmed",
    gasUsed: "84523",
    gasPrice: "22 Gwei"
  },
  {
    id: 2,
    propertyId: 1,
    from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    to: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    fromName: "Ranjit Das",
    toName: "Sourav Gogoi",
    transactionHash: "0x3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6",
    timestamp: "2024-07-20T10:15:00Z",
    blockNumber: 15589234,
    status: "confirmed",
    gasUsed: "91245",
    gasPrice: "28 Gwei"
  }
];

export const mockUser = {
  address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  name: "Demo Admin (Assam)",
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
