import { ethers } from 'ethers';

// Replace with your deployed contract address on Sepolia
export const CONTRACT_ADDRESS = "0x4513736493A24cccB3c7Ff0AadFd7b16faf6087f";

// LuxuryAuthNFT ABI
export const CONTRACT_ABI = [
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "verifiedBrands",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "string", "name": "productHash", "type": "string" },
      { "internalType": "string", "name": "tokenURI", "type": "string" }
    ],
    "name": "mintProduct",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "string", "name": "productHash", "type": "string" }],
    "name": "verifyProduct",
    "outputs": [
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" },
      { "internalType": "address", "name": "brand", "type": "address" },
      { "internalType": "address", "name": "currentOwner", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "string", "name": "productHash", "type": "string" }],
    "name": "productExists",
    "outputs": [{ "internalType": "bool", "name": "exists", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "nextTokenId",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "to", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "brand", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "productHash", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "ProductMinted",
    "type": "event"
  }
];

export const getContract = (signer) => {
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
};

export const getContractReadOnly = (provider) => {
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
};

export const connectWallet = async () => {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask is not installed');
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send('eth_requestAccounts', []);
    const signer = await provider.getSigner();
    const address = accounts[0];
    
    return { provider, signer, address };
  } catch (error) {
    console.error('Error connecting wallet:', error);
    throw error;
  }
};

export const checkNetwork = async (provider) => {
  const network = await provider.getNetwork();
  const chainId = Number(network.chainId);
  
  if (chainId !== 11155111) {
    throw new Error('Please switch to Sepolia testnet');
  }
  
  return true;
};

export const switchToSepolia = async () => {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0xaa36a7' }],
    });
  } catch (error) {
    if (error.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0xaa36a7',
          chainName: 'Sepolia Testnet',
          nativeCurrency: {
            name: 'Sepolia ETH',
            symbol: 'ETH',
            decimals: 18
          },
          rpcUrls: ['https://rpc.sepolia.org'],
          blockExplorerUrls: ['https://sepolia.etherscan.io']
        }]
      });
    } else {
      throw error;
    }
  }
};

export const checkBrandVerification = async (provider, address) => {
  const contract = getContractReadOnly(provider);
  
  try {
    const isVerified = await contract.verifiedBrands(address);
    const owner = await contract.owner();
    
    return {
      isVerified,
      isOwner: address.toLowerCase() === owner.toLowerCase(),
      canMint: isVerified || address.toLowerCase() === owner.toLowerCase()
    };
  } catch (error) {
    console.error('Error checking brand verification:', error);
    throw error;
  }
};

export const checkProductExists = async (provider, productHash) => {
  const contract = getContractReadOnly(provider);
  
  try {
    return await contract.productExists(productHash);
  } catch (error) {
    console.error('Error checking product existence:', error);
    throw error;
  }
};

export const mintProduct = async (signer, toAddress, productHash, tokenURI) => {
  const contract = getContract(signer);
  
  try {
    const tx = await contract.mintProduct(toAddress, productHash, tokenURI);
    console.log('Transaction sent:', tx.hash);
    
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt);
    
    const event = receipt.logs.find(log => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed?.name === 'ProductMinted';
      } catch {
        return false;
      }
    });
    
    let tokenId = null;
    if (event) {
      const parsed = contract.interface.parseLog(event);
      tokenId = parsed.args.tokenId.toString();
    }
    
    return {
      success: true,
      transactionHash: receipt.hash,
      tokenId,
      blockNumber: receipt.blockNumber
    };
  } catch (error) {
    console.error('Error minting product:', error);
    
    let errorMessage = 'Failed to mint NFT';
    if (error.reason) {
      errorMessage = error.reason;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
};

export const verifyProduct = async (provider, productHash) => {
  const contract = getContractReadOnly(provider);
  
  try {
    const [tokenId, brand, currentOwner] = await contract.verifyProduct(productHash);
    
    return {
      tokenId: tokenId.toString(),
      brand,
      currentOwner
    };
  } catch (error) {
    console.error('Error verifying product:', error);
    throw error;
  }
};

export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};


export const createMetadata = (productName, productHash, imageURL) => {
  // Automatically convert ipfs:// URIs into gateway links
  const formattedImage = imageURL.startsWith("ipfs://")
    ? imageURL.replace("ipfs://", "https://ipfs.io/ipfs/")
    : imageURL;

  return {
    name: productName,
    description: `Luxury Authentication NFT for ${productName}`,
    image: formattedImage,
    attributes: [
      { trait_type: "Product Hash", value: productHash },
      { trait_type: "Authentication Status", value: "Verified" },
      { trait_type: "Minted On", value: new Date().toISOString() }
    ]
  };
};
