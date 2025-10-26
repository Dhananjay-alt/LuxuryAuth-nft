'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

export default function MyNFTsPage() {
  const [connected, setConnected] = useState(false)
  const [account, setAccount] = useState('')
  const [nfts, setNfts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x..."
  
  const CONTRACT_ABI = [
    "function balanceOf(address owner) external view returns (uint256)",
    "function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)",
    "function tokenURI(uint256 tokenId) external view returns (string memory)",
    "function productToToken(string memory) external view returns (uint256)"
  ]

  useEffect(() => {
    checkWalletConnection()
  }, [])

  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_accounts' 
        })
        if (accounts.length > 0) {
          setAccount(accounts[0])
          setConnected(true)
          await fetchNFTs(accounts[0])
        }
      } catch (error) {
        console.error('Error checking connection:', error)
      }
    }
  }

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask')
      return
    }

    try {
      setLoading(true)
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      })
      if (accounts.length > 0) {
        setAccount(accounts[0])
        setConnected(true)
        await fetchNFTs(accounts[0])
      }
    } catch (error) {
      setError('Failed to connect wallet')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const fetchNFTs = async (address) => {
    try {
      setLoading(true)
      setError('')
      
      const provider = new ethers.BrowserProvider(window.ethereum)
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)
      
      const balance = await contract.balanceOf(address)
      const tokenIds = []
      
      for (let i = 0; i < balance; i++) {
        const tokenId = await contract.tokenOfOwnerByIndex(address, i)
        tokenIds.push(tokenId.toString())
      }

      const nftsData = await Promise.all(
        tokenIds.map(async (tokenId) => {
          try {
            const tokenURI = await contract.tokenURI(tokenId)
            const metadataUrl = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/')
            const response = await fetch(metadataUrl)
            const metadata = await response.json()
            return {
              tokenId,
              metadata,
              etherscanUrl: `https://sepolia.etherscan.io/nft/${CONTRACT_ADDRESS}/${tokenId}`
            }
          } catch (e) {
            return {
              tokenId,
              metadata: null,
              etherscanUrl: `https://sepolia.etherscan.io/nft/${CONTRACT_ADDRESS}/${tokenId}`
            }
          }
        })
      )

      setNfts(nftsData)
    } catch (error) {
      console.error('Error fetching NFTs:', error)
      setError('Failed to fetch your NFTs')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-3 gradient-text">
            My Authentic Products
          </h1>
          <p className="text-gray-300 text-lg">
            View NFTs you own from verified brands
          </p>
        </div>

        {/* Connection Section */}
        {!connected ? (
          <div className="glass p-8 text-center mb-8">
            <div className="text-4xl mb-4">🔐</div>
            <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
            <p className="text-gray-300 mb-6">Connect to view your authentic product NFTs</p>
            <button
              onClick={connectWallet}
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 
                       text-white font-bold py-4 px-8 rounded-lg btn-glow disabled:opacity-50"
            >
              {loading ? 'Connecting...' : '🦊 Connect MetaMask'}
            </button>
          </div>
        ) : (
          <>
            {/* Account Info */}
            <div className="glass p-6 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-2">Connected Account</p>
                  <p className="text-white font-mono">{account.slice(0, 6)}...{account.slice(-4)}</p>
                </div>
                <button
                  onClick={() => setConnected(false)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Disconnect
                </button>
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="glass p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-gray-300">Loading your NFTs...</p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="glass border-red-500/50 p-6 mb-8">
                <p className="text-red-300">{error}</p>
              </div>
            )}

            {/* NFT Grid */}
            {!loading && nfts.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nfts.map((nft) => (
                  <div key={nft.tokenId} className="glass p-6 card-hover">
                    {nft.metadata?.image && (
                      <img 
                        src={nft.metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/')}
                        alt={nft.metadata?.name}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                    )}
                    <h3 className="text-lg font-bold text-white mb-2">
                      {nft.metadata?.name || `Product #${nft.tokenId}`}
                    </h3>
                    {nft.metadata?.description && (
                      <p className="text-gray-300 text-sm mb-4">{nft.metadata.description}</p>
                    )}
                    <div className="space-y-2 text-xs text-gray-400 mb-4">
                      <p><strong>Token ID:</strong> {nft.tokenId}</p>
                    </div>
                    <a
                      href={nft.etherscanUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 text-sm inline-flex items-center gap-1"
                    >
                      View on Etherscan →
                    </a>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && nfts.length === 0 && (
              <div className="glass p-12 text-center">
                <div className="text-4xl mb-4">📭</div>
                <h3 className="text-xl font-bold text-white mb-2">No NFTs Found</h3>
                <p className="text-gray-300">
                  You don't own any authentic product NFTs yet. 
                  Purchase from a verified brand to receive one!
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
