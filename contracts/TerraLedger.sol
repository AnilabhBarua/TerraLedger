// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TerraLedger
 * @dev A smart contract for a decentralized land registry.
 */
contract TerraLedger {

    struct Property {
        uint256 propertyId;
        address owner;
        string location;
        bool isRegistered;
    }

    mapping(uint256 => Property) public properties;
    uint256 public nextPropertyId = 1;

    // NEW CODE STARTS HERE
    address public owner; // The address of the contract deployer (the authority)

    /**
     * @dev The constructor is a special function that runs only once when the contract is deployed.
     * It sets the deployer of the contract as the owner.
     */
    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Allows the contract owner to register a new property.
     * @param _propertyOwner The address of the person who owns the land.
     * @param _location A string describing the property's location.
     */
    function registerProperty(address _propertyOwner, string memory _location) external {
        // Security Check: Ensure only the contract owner can call this function.
        require(msg.sender == owner, "Only the contract owner can register new properties");

        // Step 1: Get the new property's unique ID from our counter.
        uint256 newPropertyId = nextPropertyId;

        // Step 2: Create and store the new Property struct in our mapping.
        properties[newPropertyId] = Property(
            newPropertyId,
            _propertyOwner,
            _location,
            true
        );

        // Step 3: Increment the counter for the next property.
        nextPropertyId++;
    }
    
}