# 💎 LuxuryAuthNFT – Luxury Product Authentication via NFTs

### ✅ Verifiable Brand Authentication · 🎟 NFT Ownership Certificates · 🌐 Blockchain Transparency

---

## 🚀 Overview

**LuxuryAuthNFT** is a decentralized luxury authentication platform built on **Ethereum NFTs**,  
turning every genuine product into a **digital certificate of authenticity**.

Each product — a **watch, bag, or sneaker** — is linked to a unique NFT, ensuring  
**proof of authenticity, verified ownership, and transparency on the blockchain.**

✨ **Key Highlights**
- 🔐 Only verified brands or the contract owner can mint NFTs  
- 📜 Blockchain acts as a tamper-proof ledger  
- 👛 Customers can verify products by scanning or entering a product hash  
- 💅 Beautiful, modern frontend powered by **Next.js 16 + TailwindCSS**

---

## 🧱 Architecture

| Layer | Technology |
|-------|-------------|
| 🧠 Smart Contract | Solidity (OpenZeppelin ERC-721, ERC721URIStorage, Ownable) |
| 🔧 Dev Tools | Foundry + Forge |
| 💻 Frontend | Next.js 16 (App Router + Ethers v6) |
| 🎨 Styling | TailwindCSS |
| 🗂 Storage | IPFS via Pinata / NFT.Storage |
| ⛓ Network | Sepolia Testnet |

---

## ⚙️ Core Features

### 🧑‍💼 Admin Portal (`/admin`)
- Manage verified brand wallets  
- Add / remove brands  
- View verification status  

### 🪙 Mint NFTs (`/mint`)
- Input: Customer Address · Product Hash · Metadata URI  
- Access: Only verified brands or owner  

### 🔍 Verification Portal (`/verify`)
- Anyone can check authenticity by entering a product hash  
- Displays Token ID, Brand, Owner, and Metadata  

### 💼 My NFTs (`/my-nfts`)
- Displays all NFTs owned by the connected wallet  

---

## 📦 Installation

### 🧰 Prerequisites
- Node.js 18+  
- Foundry (`curl -L foundry.paradigm.xyz | bash`)  
- MetaMask with Sepolia ETH  
- Infura / Alchemy RPC endpoint  

### 🪜 Setup
```bash
git clone https://github.com/<your-username>/luxury-auth-nft.git
cd luxury-auth-nft/luxury-auth-frontend
npm install
```

### 🧾 Create `.env.local`
```
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourDeployedContract
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
```

### 🚀 Run (Recommended: Webpack mode)
```bash
npm run dev -- --webpack
```

App runs on 👉 [http://localhost:3000](http://localhost:3000)

---

## 🧩 Smart Contract

**File:** `src/LuxuryAuthNFT.sol`

```solidity
contract LuxuryAuthNFT is ERC721URIStorage, Ownable {
    function addBrand(address brand) external onlyOwner;
    function removeBrand(address brand) external onlyOwner;
    function mintProduct(address to, string memory productHash, string memory tokenURI) external;
    function verifyProduct(string memory productHash)
        external view returns(uint256 tokenId, address brand, address currentOwner);
}
```

**Deploy via Foundry:**
```bash
forge script script/DeployLuxuryAuthNFT.s.sol --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY --broadcast --verify
```

---

## 🖼 NFT Metadata Example

```json
{
  "name": "Luxury Bag Model A",
  "description": "Authentic Luxury Product verified by LuxuryAuthNFT",
  "image": "https://ipfs.io/ipfs/bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi/example.png",
  "attributes": [
    { "trait_type": "Product Hash", "value": "0xabc..." },
    { "trait_type": "Verification", "value": "Authentic" },
    { "trait_type": "Minted On", "value": "2025-10-26" }
  ]
}
```

---

## 🔁 Verification Flow

1. ✅ Verified brand mints NFT → emits `ProductMinted(tokenId, to, brand, hash)`  
2. 🧾 Customer receives product QR code with hash  
3. 🔍 `/verify` executes:
   ```js
   const [tokenId, brand, owner] = await contract.verifyProduct(productHash);
   ```
4. 🖼 Fetch metadata from tokenURI and display details  
5. ⚠️ If not found → “Not Verified / Counterfeit” message  

---

## 🧠 Troubleshooting Guide

| Issue | Quick Fix |
|-------|------------|
| 🖼 Image not showing | Use HTTPS IPFS gateway (`https://ipfs.io/ipfs/...`) and pin files |
| ⚠️ INVALID_ARGUMENT | Ensure contract address is a quoted string in `.env` or frontend config |
| 💥 Turbopack errors | Run with Webpack → `npm run dev -- --webpack` |
| 🧩 ABI mismatch | Update ABI in `luxuryAuthNFT.js` after redeploy |

---

## 💡 Future Enhancements

- 🧰 Automated IPFS upload integration (Pinata SDK)  
- 🔳 Auto-generate QR codes for minted NFTs  
- 🏢 Multi-brand role dashboard  
- ☁️ Deploy frontend to Vercel  
- 🌐 Add Polygon / BNB multi-chain support  

---

## 👨‍💻 Contributors

| Name | Role |
|------|------|
| **Dhananjay Hire** | Full Stack Web3 Developer · Lead Engineer |
| **ChatGPT‑Assist** | Architecture & Documentation Support |

---

## 🪙 License
**MIT License** © 2025 Dhananjay Hire  
See [`LICENSE`](LICENSE) for more details.  

---

### 🏁 Summary
**LuxuryAuthNFT** creates a trust layer for luxury brands by coupling each physical item with a verifiable NFT certificate — enhancing authenticity, ownership tracking, and customer trust across the global luxury ecosystem.
