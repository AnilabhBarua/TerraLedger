// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TerraLedger
 * @dev A smart contract for a decentralized land registry.
 */
contract TerraLedger {

    // A structure to hold all the essential details of a property.
    struct Property {
        uint256 propertyId;      // Unique ID for the property
        address owner;           // The Ethereum address of the current owner
        string location;         // A string describing the property's location (e.g., "123 Main St, Anytown")
        bool isRegistered;       // A flag to confirm that this property officially exists in the registry
    }

}