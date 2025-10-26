'use client';

import { useState, useEffect } from 'react';
import {
  connectWallet,
  checkNetwork,
  switchToSepolia,
  checkBrandVerification,
  checkProductExists,
  mintProduct,
  CONTRACT_ADDRESS
} from '../luxuryAuthNFT';

export default function MintPage() {
  const [walletAddress, setWalletAddress] = useState('');
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const [canMint, setCanMint] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(false);
  
  const [productName, setProductName] = useState('');
  const [productHash, setProductHash] = useState('');
  const [imageURL, setImageURL] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  
  const [isMinting, setIsMinting] = useState(false);
  const [mintStatus, setMintStatus] = useState({ type: '', message: '' });
  const [lastMintedTokenId, setLastMintedTokenId] = useState(null);
  const [lastTxHash, setLastTxHash] = useState('');
  
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({ 
            method: 'eth_accounts' 
          });
          
          if (accounts.length > 0) {
            const { provider: newProvider, signer: newSigner, address } = await connectWallet();
            setWalletAddress(address);
            setProvider(newProvider);
            setSigner(newSigner);
            setRecipientAddress(address);
            
            await checkNetwork(newProvider);
            await checkBrandStatus(newProvider, address);
          }
        } catch (error) {
          console.error('Error checking connection:', error);
        }
      }
    };
    
    checkConnection();
  }, []);
  
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      const handleAccountsChanged = async (accounts) => {
        if (accounts.length === 0) {
          handleDisconnect();
        } else {
          const { provider: newProvider, signer: newSigner, address } = await connectWallet();
          setWalletAddress(address);
          setProvider(newProvider);
          setSigner(newSigner);
          setRecipientAddress(address);
          await checkBrandStatus(newProvider, address);
        }
      };
      
      const handleChainChanged = () => {
        window.location.reload();
      };
      
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      
      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, []);
  
  const handleConnect = async () => {
    setIsConnecting(true);
    setMintStatus({ type: '', message: '' });
    
    try {
      const { provider: newProvider, signer: newSigner, address } = await connectWallet();
      
      try {
        await checkNetwork(newProvider);
      } catch (error) {
        await switchToSepolia();
        const { provider: refreshedProvider, signer: refreshedSigner } = await connectWallet();
        setProvider(refreshedProvider);
        setSigner(refreshedSigner);
        setWalletAddress(address);
        setRecipientAddress(address);
        await checkBrandStatus(refreshedProvider, address);
        setIsConnecting(false);
        return;
      }
      
      setProvider(newProvider);
      setSigner(newSigner);
      setWalletAddress(address);
      setRecipientAddress(address);
      
      await checkBrandStatus(newProvider, address);
      
    } catch (error) {
      console.error('Connection error:', error);
      setMintStatus({ 
        type: 'error', 
        message: error.message || 'Failed to connect wallet' 
      });
    } finally {
      setIsConnecting(false);
    }
  };
  
  const handleDisconnect = () => {
    setWalletAddress('');
    setProvider(null);
    setSigner(null);
    setCanMint(false);
    setIsVerified(false);
    setIsOwner(false);
    setMintStatus({ type: '', message: '' });
  };
  
  const checkBrandStatus = async (providerInstance, address) => {
    setCheckingVerification(true);
    try {
      const status = await checkBrandVerification(providerInstance, address);
      setIsVerified(status.isVerified);
      setIsOwner(status.isOwner);
      setCanMint(status.canMint);
      
      if (!status.canMint) {
        setMintStatus({
          type: 'warning',
          message: '🚫 Not Authorized: Your address is not registered as a verified brand. Contact the contract owner.'
        });
      } else if (status.isOwner) {
        setMintStatus({
          type: 'success',
          message: '👑 You are the contract owner - Full minting privileges'
        });
      } else if (status.isVerified) {
        setMintStatus({
          type: 'success',
          message: '✅ Verified Brand - You can mint NFTs'
        });
      }
    } catch (error) {
      console.error('Error checking brand status:', error);
      setMintStatus({
        type: 'error',
        message: 'Failed to verify brand status'
      });
    } finally {
      setCheckingVerification(false);
    }
  };
  
  const handleMint = async (e) => {
    e.preventDefault();
    
    if (!signer) {
      setMintStatus({ type: 'error', message: 'Please connect your wallet first' });
      return;
    }
    
    if (!canMint) {
      setMintStatus({ type: 'error', message: 'You are not authorized to mint NFTs' });
      return;
    }

    // Validate recipient address
    if (!recipientAddress || !/^0x[a-fA-F0-9]{40}$/.test(recipientAddress)) {
      setMintStatus({ type: 'error', message: 'Invalid recipient address format' });
      return;
    }
    
    setIsMinting(true);
    setMintStatus({ type: 'info', message: 'Checking product hash...' });
    
    try {
      const exists = await checkProductExists(provider, productHash);
      if (exists) {
        setMintStatus({ 
          type: 'error', 
          message: 'This product hash has already been minted' 
        });
        setIsMinting(false);
        return;
      }
      
      setMintStatus({ type: 'info', message: 'Preparing to mint... Please confirm the transaction in MetaMask' });
      
      const result = await mintProduct(
        signer,
        recipientAddress,
        productHash,
        imageURL
      );
      
      setLastMintedTokenId(result.tokenId);
      setLastTxHash(result.transactionHash);
      setMintStatus({
        type: 'success',
        message: `🎉 NFT Minted Successfully! Token ID: ${result.tokenId} transferred to ${recipientAddress.slice(0, 6)}...${recipientAddress.slice(-4)}`
      });
      
      setProductName('');
      setProductHash('');
      setImageURL('');
      
    } catch (error) {
      console.error('Minting error:', error);
      setMintStatus({
        type: 'error',
        message: error.message || 'Failed to mint NFT'
      });
    } finally {
      setIsMinting(false);
    }
  };
  
  const getStatusIcon = (type) => {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'warning': return '⚠';
      case 'info': return 'ℹ';
      default: return '';
    }
  };

  const generateProductHash = () => {
    // Generate a hash based on product name and timestamp
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const hashInput = `${productName}-${timestamp}-${randomStr}`;
    const hash = Buffer.from(hashInput).toString('hex');
    setProductHash('0x' + hash);
    setMintStatus({
      type: 'success',
      message: '✓ Product hash generated'
    });
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
            🔐 Admin Mint Dashboard
          </h1>
          <p className="text-gray-300 text-lg">
            Mint authenticated product NFTs on Sepolia Testnet
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Admin-only access for verified brands
          </p>
        </div>
        
        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
          
          {/* Wallet Connection Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
                <span className="text-3xl">👛</span>
                Wallet Connection
              </h2>
              {walletAddress && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-400 font-medium">Connected</span>
                </div>
              )}
            </div>
            
            {!walletAddress ? (
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
              >
                {isConnecting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connecting...
                  </span>
                ) : (
                  '🦊 Connect MetaMask'
                )}
              </button>
            ) : (
              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400 font-medium">Your Address</span>
                    <button
                      onClick={handleDisconnect}
                      className="text-sm text-red-400 hover:text-red-300 transition-colors"
                    >
                      Disconnect
                    </button>
                  </div>
                  <p className="text-white font-mono text-sm break-all bg-black/20 p-2 rounded">
                    {walletAddress}
                  </p>
                </div>
                
                {checkingVerification ? (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                    <p className="text-blue-300 text-sm flex items-center">
                      <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Checking brand verification status...
                    </p>
                  </div>
                ) : (
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                      <span className="text-lg">🎫</span>
                      Authorization Status
                    </h3>
                    <div className="space-y-2">
                      {isOwner && (
                        <div className="flex items-center text-sm text-green-400 bg-green-500/10 p-2 rounded">
                          <span className="mr-2 text-lg">👑</span>
                          <span className="font-medium">Contract Owner - Full Access</span>
                        </div>
                      )}
                      {isVerified && !isOwner && (
                        <div className="flex items-center text-sm text-green-400 bg-green-500/10 p-2 rounded">
                          <span className="mr-2 text-lg">✓</span>
                          <span className="font-medium">Verified Brand</span>
                        </div>
                      )}
                      {!canMint && (
                        <div className="flex items-center text-sm text-red-400 bg-red-500/10 p-2 rounded">
                          <span className="mr-2 text-lg">✕</span>
                          <span className="font-medium">Not Authorized - Minting Disabled</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Access Control Alert - Show if not verified */}
          {walletAddress && !canMint && (
            <div className="mb-8 bg-gradient-to-r from-red-500/20 to-red-500/10 rounded-xl p-4 border border-red-500/30">
              <h3 className="text-sm font-semibold text-red-300 mb-2 flex items-center gap-2">
                <span className="text-lg">🚫</span>
                Access Restricted
              </h3>
              <p className="text-red-200 text-sm">
                This page is restricted to verified brands only. Your wallet address is not currently registered as a verified brand. 
                Please contact the contract owner to request access.
              </p>
            </div>
          )}
          
          {/* Contract Info */}
          <div className="mb-8 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-500/20">
            <h3 className="text-sm font-semibold text-purple-300 mb-2 flex items-center gap-2">
              <span className="text-lg">📄</span>
              Contract Address
            </h3>
            <p className="text-white font-mono text-xs break-all bg-black/30 p-2 rounded mb-2">
              {CONTRACT_ADDRESS}
            </p>
            <a
              href={`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 text-xs inline-flex items-center gap-1 transition-colors"
            >
              View on Etherscan
              <span>→</span>
            </a>
          </div>
          
          {/* Mint Form - Only show if verified brand */}
          {walletAddress && canMint && (
            <form onSubmit={handleMint} className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
                  <span className="text-3xl">🏷️</span>
                  Product Details
                </h2>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="e.g., Luxury Handbag Model XYZ-2024"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Product Hash *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={productHash}
                        onChange={(e) => setProductHash(e.target.value)}
                        placeholder="Unique product identifier or hash"
                        required
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm transition-all"
                      />
                      <button
                        type="button"
                        onClick={generateProductHash}
                        disabled={!productName}
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white px-4 py-3 rounded-xl transition-all font-medium"
                      >
                        Generate
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      💡 Click "Generate" to auto-create a unique hash, or enter your own serial number hash
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Image URL (IPFS URI) *
                    </label>
                    <input
                      type="url"
                      value={imageURL}
                      onChange={(e) => setImageURL(e.target.value)}
                      placeholder="ipfs://... or https://gateway.pinata.cloud/ipfs/..."
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                    <p className="text-xs text-gray-400 mt-2">
                      📸 IPFS URI or gateway URL for the product image
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Customer Wallet Address *
                    </label>
                    <input
                      type="text"
                      value={recipientAddress}
                      onChange={(e) => setRecipientAddress(e.target.value)}
                      placeholder="0x... (customer receives the NFT)"
                      required
                      pattern="^0x[a-fA-F0-9]{40}$"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm transition-all"
                    />
                    <p className="text-xs text-gray-400 mt-2">
                      👤 This customer will receive the NFT. Defaults to your address if left empty.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Status Message */}
              {mintStatus.message && (
                <div className={`rounded-xl p-4 ${
                  mintStatus.type === 'success' ? 'bg-green-500/10 border border-green-500/30' :
                  mintStatus.type === 'error' ? 'bg-red-500/10 border border-red-500/30' :
                  mintStatus.type === 'warning' ? 'bg-yellow-500/10 border border-yellow-500/30' :
                  'bg-blue-500/10 border border-blue-500/30'
                }`}>
                  <div className="flex items-start">
                    <span className={`text-2xl mr-3 ${
                      mintStatus.type === 'success' ? 'text-green-400' :
                      mintStatus.type === 'error' ? 'text-red-400' :
                      mintStatus.type === 'warning' ? 'text-yellow-400' :
                      'text-blue-400'
                    }`}>
                      {getStatusIcon(mintStatus.type)}
                    </span>
                    <div className="flex-1">
                      <p className={`text-sm break-words ${
                        mintStatus.type === 'success' ? 'text-green-300' :
                        mintStatus.type === 'error' ? 'text-red-300' :
                        mintStatus.type === 'warning' ? 'text-yellow-300' :
                        'text-blue-300'
                      }`}>
                        {mintStatus.message}
                      </p>
                      {lastMintedTokenId && mintStatus.type === 'success' && lastTxHash && (
                        <div className="mt-3 space-y-2">
                          <a
                            href={`https://sepolia.etherscan.io/tx/${lastTxHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-purple-400 hover:text-purple-300 inline-flex items-center gap-1 transition-colors"
                          >
                            View Transaction on Etherscan
                            <span>→</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={!walletAddress || !canMint || isMinting}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-5 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-xl text-lg"
              >
                {isMinting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Minting NFT...
                  </span>
                ) : (
                  '✨ Mint & Transfer NFT to Customer'
                )}
              </button>
            </form>
          )}

          {/* Placeholder when not connected */}
          {!walletAddress && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔒</div>
              <p className="text-gray-400 mb-6">
                Connect your wallet to access the admin minting dashboard
              </p>
            </div>
          )}
        </div>
        
        {/* Footer Info */}
        <div className="text-center mt-8 space-y-3">
          <p className="text-gray-400 text-sm">
            💡 Make sure you have Sepolia ETH in your wallet before minting
          </p>
          <a
            href="https://sepoliafaucet.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300 text-sm inline-flex items-center gap-1 transition-colors"
          >
            Get Sepolia ETH from faucet
            <span>→</span>
          </a>
        </div>
      </div>
    </div>
  );
}
