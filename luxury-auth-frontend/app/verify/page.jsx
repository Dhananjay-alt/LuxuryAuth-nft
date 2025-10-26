'use client'

import { useState } from 'react'
import { ethers } from 'ethers'

export default function VerifyPage() {
  const [productHash, setProductHash] = useState('')
  const [verificationResult, setVerificationResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x..."
  const SEPOLIA_RPC_URL = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/"

  const CONTRACT_ABI = [
    "function productToToken(string memory) external view returns (uint256)",
    "function tokenToProduct(uint256) external view returns (string memory)",
    "function ownerOf(uint256) external view returns (address)",
    "function tokenURI(uint256) external view returns (string memory)"
  ]

  const verifyProduct = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setVerificationResult(null)

    try {
      if (!productHash.trim()) {
        setError('Please enter a product hash')
        setLoading(false)
        return
      }

      // Connect to Ethereum without wallet
      const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL)
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)

      // Check if product exists
      const tokenId = await contract.productToToken(productHash)

      if (tokenId === 0n) {
        setVerificationResult({
          status: 'fake',
          message: 'This product hash is not found in our system',
          tokenId: null,
          owner: null,
          productHash: productHash
        })
        setLoading(false)
        return
      }

      // Get owner information
      const owner = await contract.ownerOf(tokenId)
      const tokenURI = await contract.tokenURI(tokenId)

      // Try to fetch metadata from IPFS
      let metadata = null
      try {
        const response = await fetch(tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/'))
        metadata = await response.json()
      } catch (e) {
        console.log('Could not fetch metadata from IPFS')
      }

      setVerificationResult({
        status: 'authentic',
        message: 'This product is AUTHENTIC ✅',
        tokenId: tokenId.toString(),
        owner: owner,
        productHash: productHash,
        metadata: metadata
      })
    } catch (error) {
      console.error('Verification error:', error)
      setError('Error verifying product. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-3 gradient-text">
            Verify Product Authenticity
          </h1>
          <p className="text-gray-300 text-lg">
            Enter a product hash to verify if it's authentic
          </p>
        </div>

        {/* Main Card */}
        <div className="glass p-8 mb-8">
          <form onSubmit={verifyProduct} className="space-y-6">
            <div>
              <label className="block text-gray-300 text-sm font-bold mb-3">
                Product Hash *
              </label>
              <input
                type="text"
                value={productHash}
                onChange={(e) => setProductHash(e.target.value)}
                placeholder="Enter the product hash (e.g., 0x...)"
                className="w-full p-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-400 mt-2">
                You can find the product hash on the product certificate or NFT metadata
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 
                       text-white font-bold py-4 px-6 rounded-lg btn-glow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Verifying...
                </div>
              ) : (
                '🔍 Verify Product'
              )}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="glass border-red-500/50 p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="text-2xl">❌</div>
              <div>
                <h3 className="text-red-400 font-bold">Error</h3>
                <p className="text-gray-300 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Verification Result - Authentic */}
        {verificationResult && verificationResult.status === 'authentic' && (
          <div className="glass border-green-500/50 p-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-3xl font-bold text-green-400 mb-2">
                Product Verified!
              </h2>
              <p className="text-gray-300">
                This product is authentic and registered on the blockchain
              </p>
            </div>

            <div className="bg-black/20 rounded-lg p-6 space-y-4">
              <div className="border-b border-white/10 pb-4">
                <p className="text-gray-400 text-sm mb-1">Token ID</p>
                <p className="text-white font-mono text-lg">#{verificationResult.tokenId}</p>
              </div>

              <div className="border-b border-white/10 pb-4">
                <p className="text-gray-400 text-sm mb-1">Owner Address</p>
                <p className="text-white font-mono text-sm break-all">
                  {verificationResult.owner}
                </p>
              </div>

              <div className="border-b border-white/10 pb-4">
                <p className="text-gray-400 text-sm mb-1">Product Hash</p>
                <p className="text-white font-mono text-sm break-all">
                  {verificationResult.productHash}
                </p>
              </div>

              {verificationResult.metadata && (
                <>
                  {verificationResult.metadata.name && (
                    <div className="border-b border-white/10 pb-4">
                      <p className="text-gray-400 text-sm mb-1">Product Name</p>
                      <p className="text-white">{verificationResult.metadata.name}</p>
                    </div>
                  )}

                  {verificationResult.metadata.description && (
                    <div className="border-b border-white/10 pb-4">
                      <p className="text-gray-400 text-sm mb-1">Description</p>
                      <p className="text-white text-sm">{verificationResult.metadata.description}</p>
                    </div>
                  )}

                  {verificationResult.metadata.image && (
                    <div>
                      <p className="text-gray-400 text-sm mb-3">Product Image</p>
                      <img 
                        src={verificationResult.metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/')}
                        alt="Product"
                        className="w-full h-48 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            <a
              href={`https://sepolia.etherscan.io/nft/${CONTRACT_ADDRESS}/${verificationResult.tokenId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center mt-6 text-purple-400 hover:text-purple-300 text-sm"
            >
              View NFT on Etherscan →
            </a>
          </div>
        )}

        {/* Verification Result - Fake */}
        {verificationResult && verificationResult.status === 'fake' && (
          <div className="glass border-red-500/50 p-8">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-3xl font-bold text-red-400 mb-2">
                Product Not Found
              </h2>
              <p className="text-gray-300 mb-6">
                This product hash is not registered in our authentication system.
                It may be counterfeit.
              </p>
              <div className="bg-black/20 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Hash Searched</p>
                <p className="text-white font-mono text-sm break-all">
                  {verificationResult.productHash}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="glass p-6 mt-8">
          <h3 className="text-lg font-bold text-white mb-4">ℹ️ How It Works</h3>
          <div className="space-y-3 text-gray-300 text-sm">
            <p>• Every authentic luxury product minted through our system receives a unique NFT</p>
            <p>• The product hash is permanently recorded on the Ethereum blockchain</p>
            <p>• You can verify any product anytime, anywhere using just the product hash</p>
            <p>• Verification is free and doesn't require a wallet connection</p>
            <p>• If a product is not found, it's likely counterfeit</p>
          </div>
        </div>
      </div>
    </div>
  )
}
