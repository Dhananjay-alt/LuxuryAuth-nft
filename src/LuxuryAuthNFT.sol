// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title LuxuryAuthNFT
 * @dev ERC721 NFT contract for luxury product authenticity verification.
 * The contract allows the owner to whitelist verified brands that can mint NFTs.
 */
contract LuxuryAuthNFT is ERC721URIStorage, Ownable {
    uint256 public nextTokenId;

    // Mappings
    mapping(string => uint256) public productToToken;
    mapping(uint256 => string) public tokenToProduct;
    mapping(address => bool) public verifiedBrands;

    struct ProductMetadata {
        uint256 tokenId;
        address brandAddress;
        address currentOwner;
        uint256 mintTimestamp;
        string productHash;
    }

    // Metadata indexed by tokenId
    mapping(uint256 => ProductMetadata) private _productMetadata;

    // Events
    event BrandAdded(address indexed brand);
    event BrandRemoved(address indexed brand);
    event ProductMinted(
        uint256 indexed tokenId,
        address indexed to,
        address indexed brand,
        string productHash,
        uint256 timestamp
    );

    constructor() ERC721("LuxuryAuthNFT", "LUX") Ownable(msg.sender) {}

    // --------------------------- Brand Management ---------------------------

    function addBrand(address brand) external onlyOwner {
        require(brand != address(0), "Invalid brand");
        require(!verifiedBrands[brand], "Already verified");
        verifiedBrands[brand] = true;
        emit BrandAdded(brand);
    }

    function removeBrand(address brand) external onlyOwner {
        require(verifiedBrands[brand], "Not verified");
        verifiedBrands[brand] = false;
        emit BrandRemoved(brand);
    }

    function isBrandVerified(address brand) external view returns (bool) {
        return verifiedBrands[brand];
    }

    function canMint(address account) public view returns (bool) {
        return verifiedBrands[account] || account == owner();
    }

    // --------------------------- Minting ---------------------------

    function mintProduct(
        address to,
        string memory productHash,
        string memory metadataURI
    ) external {
        require(
            verifiedBrands[msg.sender] || msg.sender == owner(),
            "Not authorized: only owner or verified brand"
        );
        require(to != address(0), "Zero address");
        require(bytes(productHash).length > 0, "Empty hash");
        require(productToToken[productHash] == 0, "Already minted");

        unchecked {
            nextTokenId++;
        }
        uint256 tokenId = nextTokenId;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);

        productToToken[productHash] = tokenId;
        tokenToProduct[tokenId] = productHash;

        _productMetadata[tokenId] = ProductMetadata({
            tokenId: tokenId,
            brandAddress: msg.sender,
            currentOwner: to,
            mintTimestamp: block.timestamp,
            productHash: productHash
        });

        emit ProductMinted(tokenId, to, msg.sender, productHash, block.timestamp);
    }

    // --------------------------- View Functions ---------------------------

    function verifyProduct(string memory productHash)
        external
        view
        returns (uint256 tokenId, address brand, address currentOwner)
    {
        tokenId = productToToken[productHash];
        require(tokenId != 0, "Product not found");

        ProductMetadata memory meta = _productMetadata[tokenId];
        brand = meta.brandAddress;
        currentOwner = ownerOf(tokenId);
    }

    function getProductMetadata(string memory productHash)
        external
        view
        returns (ProductMetadata memory meta)
    {
        uint256 tokenId = productToToken[productHash];
        require(tokenId != 0, "Product not found");

        meta = _productMetadata[tokenId];
        meta.currentOwner = ownerOf(tokenId);
    }

    function getMetadataByTokenId(uint256 tokenId)
        external
        view
        returns (ProductMetadata memory meta)
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        meta = _productMetadata[tokenId];
        meta.currentOwner = ownerOf(tokenId);
    }

    function productExists(string memory productHash)
        external
        view
        returns (bool)
    {
        return productToToken[productHash] != 0;
    }

    // --------------------------- Owner Controls ---------------------------

    function ownerRescueTransfer(address from, address to, uint256 tokenId)
        external
        onlyOwner
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        _transfer(from, to, tokenId);
    }

    // --------------------------- Overrides ---------------------------

    /**
     * @dev tokenURI now neatly inherits from ERC721URIStorage without manual override conflicts.
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
}
