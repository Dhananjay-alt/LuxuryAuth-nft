// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/LuxuryAuthNFT.sol";

contract DeployLuxuryAuthNFT is Script {
    function run() external returns (LuxuryAuthNFT) {
        // Get the deployer's private key from environment variable
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy the contract
        LuxuryAuthNFT luxuryAuthNFT = new LuxuryAuthNFT();
        
        // Log deployment information
        console.log("LuxuryAuthNFT deployed to:", address(luxuryAuthNFT));
        console.log("Contract owner:", luxuryAuthNFT.owner());
        console.log("Deployer address:", vm.addr(deployerPrivateKey));
        
        // Stop broadcasting
        vm.stopBroadcast();
        
        return luxuryAuthNFT;
    }
}