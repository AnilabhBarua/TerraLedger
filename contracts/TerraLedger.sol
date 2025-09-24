// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TerraLedger
 * @dev A smart contract for a decentralized land registry.
 */
contract TerraLedger {

    // A structure to hold all the essential details of a property.
    struct Property {
        uint256 propertyId;
        address owner;
        string location;
        bool isRegistered;
    }

    // NEW CODE STARTS HERE
    // A mapping to store all properties using their unique ID. This acts as our on-chain database.
    mapping(uint256 => Property) public properties;

    // A counter to ensure each new property gets a unique ID.
    uint256 public nextPropertyId = 1;
    // NEW CODE ENDS HERE

}