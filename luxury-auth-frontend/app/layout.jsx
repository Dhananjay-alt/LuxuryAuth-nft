import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Luxury Auth NFT",
  description: "Authenticate luxury products with blockchain technology",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Navigation Bar */}
        <nav className="bg-black/90 backdrop-blur-lg border-b border-gray-800 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <div className="flex-shrink-0">
                <a href="/" className="flex items-center">
                  <h1 className="text-2xl font-bold text-white">
                    Luxury<span className="text-purple-400">Auth</span>
                  </h1>
                </a>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:block">
                <div className="flex items-center space-x-4">
                  <a
                    href="/"
                    className="text-gray-300 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  >
                    Home
                  </a>
                  <a
                    href="/mint"
                    className="text-gray-300 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  >
                    Mint NFT
                  </a>
                  <a
                    href="/my-nfts"
                    className="text-gray-300 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  >
                    My NFTs
                  </a>
                  <a
                    href="/verify"
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg shadow-purple-500/25"
                  >
                    Verify Product
                  </a>
                </div>
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <button
                  type="button"
                  className="text-gray-300 hover:text-white focus:outline-none"
                  id="mobile-menu-button"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu (Hidden by default) */}
          <div className="md:hidden hidden" id="mobile-menu">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-black/95 border-t border-gray-800">
              <a
                href="/"
                className="text-gray-300 hover:text-white block px-3 py-2 rounded-lg text-base font-medium"
              >
                Home
              </a>
              <a
                href="/mint"
                className="text-gray-300 hover:text-white block px-3 py-2 rounded-lg text-base font-medium"
              >
                Mint NFT
              </a>
              <a
                href="/my-nfts"
                className="text-gray-300 hover:text-white block px-3 py-2 rounded-lg text-base font-medium"
              >
                My NFTs
              </a>
              <a
                href="/verify"
                className="text-gray-300 hover:text-white block px-3 py-2 rounded-lg text-base font-medium"
              >
                Verify Product
              </a>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="min-h-screen">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-black border-t border-gray-800">
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8 text-gray-400">
              {/* About Section */}
              <div>
                <h3 className="text-white font-semibold mb-3">About LuxuryAuth</h3>
                <p className="text-sm">
                  Blockchain-based authentication system for luxury products.
                  Secure, transparent, and immutable.
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="text-white font-semibold mb-3">Quick Links</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="/mint" className="hover:text-white transition-colors">
                      Mint NFT
                    </a>
                  </li>
                  <li>
                    <a href="/verify" className="hover:text-white transition-colors">
                      Verify Product
                    </a>
                  </li>
                  <li>
                    <a href="/my-nfts" className="hover:text-white transition-colors">
                      My Collection
                    </a>
                  </li>
                </ul>
              </div>

              {/* Contract Info */}
              <div>
                <h3 className="text-white font-semibold mb-3">Network</h3>
                <div className="text-sm space-y-1">
                  <p>Ethereum Sepolia Testnet</p>
                  <p className="text-xs text-gray-500">Built for ETHGlobal 2025</p>
                </div>
              </div>
            </div>

            {/* Copyright */}
            <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
              <p>&copy; 2025 LuxuryAuth NFT. Built with Foundry + Next.js + Ethers.js</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
