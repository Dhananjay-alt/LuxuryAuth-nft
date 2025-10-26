'use client'

import { useState } from 'react'
import { ethers } from 'ethers'

export default function AdminPage() {
  const [brandAddress, setBrandAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [connectedWallet, setConnectedWallet] = useState('')

  const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
  
  // Complete Contract ABI
  const CONTRACT_ABI = [
    {
      "inputs": [{"internalType": "address", "name": "brand", "type": "address"}],
      "name": "addBrand",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "address", "name": "", "type": "address"}],
      "name": "verifiedBrands",
      "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "outputs": [{"internalType": "address", "name": "", "type": "address"}],
      "name": "owner",
      "outputs": [{"internalType": "address", "name": "", "type": "address"}],
      "stateMutability": "view",
      "type": "function"
    }
  ]

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        setMessage('❌ MetaMask not found')
        return
      }

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      setConnectedWallet(address)
      setMessage(`✅ Connected: ${address.slice(0, 6)}...${address.slice(-4)}`)
    } catch (error) {
      setMessage(`❌ Connection failed: ${error.message}`)
    }
  }

  const addBrand = async () => {
    if (!brandAddress) {
      setMessage('❌ Enter an address')
      return
    }

    if (!ethers.isAddress(brandAddress)) {
      setMessage('❌ Invalid address format')
      return
    }

    if (!connectedWallet) {
      setMessage('❌ Connect wallet first')
      return
    }

    try {
      setLoading(true)
      setMessage('⏳ Processing...')

      if (!window.ethereum) {
        setMessage('❌ MetaMask not found')
        return
      }

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      
      console.log('Contract Address:', CONTRACT_ADDRESS)
      console.log('Brand Address:', brandAddress)
      
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
      
      console.log('Contract instance created')
      console.log('Calling addBrand...')

      const tx = await contract.addBrand(brandAddress)
      console.log('Transaction sent:', tx.hash)
      
      setMessage('⏳ Waiting for confirmation...')
      const receipt = await tx.wait()
      
      console.log('Transaction confirmed:', receipt)
      setMessage(`✅ Brand added successfully!\nTx: ${receipt.hash}`)
      setBrandAddress('')
    } catch (error) {
      console.error('Full error:', error)
      setMessage(`❌ Error: ${error.message || error}`)
    } finally {
      setLoading(false)
    }
  }

  const checkBrand = async () => {
    if (!brandAddress) {
      setMessage('❌ Enter an address')
      return
    }

    if (!ethers.isAddress(brandAddress)) {
      setMessage('❌ Invalid address format')
      return
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)
      
      const isVerified = await contract.verifiedBrands(brandAddress)
      setMessage(isVerified ? `✅ VERIFIED: ${brandAddress.slice(0, 6)}...` : `❌ NOT VERIFIED: ${brandAddress.slice(0, 6)}...`)
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2">🔐 Admin Panel</h1>
        <p className="text-gray-300 mb-8">Add verified brands to your contract</p>

        <div className="glass p-8 space-y-6">
          {/* Contract Info */}
          <div className="bg-black/30 rounded-lg p-4 border border-white/10 mb-6">
            <p className="text-gray-400 text-xs mb-2">Contract Address:</p>
            <p className="text-white font-mono text-xs break-all">{CONTRACT_ADDRESS || 'NOT SET'}</p>
          </div>

          {/* Connect Button */}
          <button
            onClick={connectWallet}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 
                     text-white font-bold py-4 px-6 rounded-lg transition-all"
          >
            🦊 Connect MetaMask
          </button>

          {/* Connected Status */}
          {connectedWallet && (
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
              <p className="text-green-300 font-mono text-sm break-all">{connectedWallet}</p>
            </div>
          )}

          {/* Input Field */}
          <div>
            <label className="block text-gray-300 font-bold mb-3">Brand Address to Add</label>
            <input
              type="text"
              value={brandAddress}
              onChange={(e) => setBrandAddress(e.target.value)}
              placeholder="0x..."
              className="w-full p-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 font-mono text-sm mb-4"
            />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={addBrand}
              disabled={loading || !brandAddress || !connectedWallet}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 
                       text-white font-bold py-3 px-4 rounded-lg disabled:opacity-50 transition-all"
            >
              {loading ? '⏳' : '✅'} Add Brand
            </button>

            <button
              onClick={checkBrand}
              disabled={!brandAddress}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 
                       text-white font-bold py-3 px-4 rounded-lg disabled:opacity-50 transition-all"
            >
              🔍 Check Status
            </button>
          </div>

          {/* Message */}
          {message && (
            <div className="p-4 rounded-lg bg-white/10 border border-white/20">
              <p className="text-white text-sm break-all whitespace-pre-wrap">{message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
