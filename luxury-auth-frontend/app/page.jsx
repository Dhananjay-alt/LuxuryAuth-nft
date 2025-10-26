export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-6xl md:text-7xl font-bold mb-6">
            <span className="gradient-text">
              Luxury Product
            </span>
            <br />
            <span className="text-white">Authentication</span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Secure your luxury products with blockchain technology. 
            Mint NFTs for authenticity verification that's transparent, 
            immutable, and globally accessible.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/mint"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 
                       text-white font-bold py-4 px-8 rounded-lg btn-glow text-lg"
            >
              🚀 Start Minting
            </a>
            <a
              href="/verify"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-lg border border-white/20 
                       text-white font-bold py-4 px-8 rounded-lg btn-glow text-lg"
            >
              🔍 Verify Product
            </a>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          {/* Feature 1 */}
          <div className="glass p-8 card-hover">
            <div className="text-4xl mb-4">🔐</div>
            <h3 className="text-2xl font-bold text-white mb-3">
              Secure & Immutable
            </h3>
            <p className="text-gray-300">
              Product authenticity is permanently recorded on the Ethereum blockchain,
              ensuring tamper-proof verification.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="glass p-8 card-hover">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="text-2xl font-bold text-white mb-3">
              NFT Certificates
            </h3>
            <p className="text-gray-300">
              Each luxury product receives a unique NFT that serves as a 
              digital certificate of authenticity.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="glass p-8 card-hover">
            <div className="text-4xl mb-4">🌍</div>
            <h3 className="text-2xl font-bold text-white mb-3">
              Public Verification
            </h3>
            <p className="text-gray-300">
              Anyone can verify a product's authenticity instantly using 
              just the product hash - no login required.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-20">
          <h2 className="text-4xl font-bold text-center text-white mb-12">
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                1
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">
                Brand Registration
              </h4>
              <p className="text-gray-400 text-sm">
                Verified brands register with the platform
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                2
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">
                Mint NFT
              </h4>
              <p className="text-gray-400 text-sm">
                Brand mints NFT for each product
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                3
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">
                Transfer to Customer
              </h4>
              <p className="text-gray-400 text-sm">
                Customer receives NFT with purchase
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-violet-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                4
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">
                Verify Anytime
              </h4>
              <p className="text-gray-400 text-sm">
                Anyone can verify authenticity on-chain
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="glass p-12 mt-20">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold gradient-text mb-2">100%</div>
              <div className="text-gray-300">Secure & Transparent</div>
            </div>
            <div>
              <div className="text-5xl font-bold gradient-text mb-2">⚡</div>
              <div className="text-gray-300">Instant Verification</div>
            </div>
            <div>
              <div className="text-5xl font-bold gradient-text mb-2">♾️</div>
              <div className="text-gray-300">Permanent Records</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
