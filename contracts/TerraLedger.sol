// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title TerraLedger
 * @dev A smart contract for a decentralized land registry.
 */
contract TerraLedger is AccessControl {

    bytes32 public constant AUTHORITY_ROLE = keccak256("AUTHORITY_ROLE");
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");

    struct Property {
        uint256 propertyId;
        address owner;
        string location;
        string area;
        string propertyType;
        bool isRegistered;
    }

    mapping(uint256 => Property) public properties;
    uint256 public nextPropertyId = 1;


    event PropertyRegistered(
        uint256 indexed propertyId,
        address indexed owner,
        string location,
        string area,
        string propertyType
    );

    event OwnershipTransferred(
        uint256 indexed propertyId,
        address indexed oldOwner,
        address indexed newOwner
    );

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(AUTHORITY_ROLE, msg.sender);
        _grantRole(REGISTRAR_ROLE, msg.sender);
    }

    function addRegistrar(address account) external onlyRole(AUTHORITY_ROLE) {
        grantRole(REGISTRAR_ROLE, account);
    }

    function removeRegistrar(address account) external onlyRole(AUTHORITY_ROLE) {
        revokeRole(REGISTRAR_ROLE, account);
    }

    function registerProperty(
        address _propertyOwner, 
        string memory _location, 
        string memory _area, 
        string memory _propertyType
    ) external onlyRole(REGISTRAR_ROLE) {
        uint256 newPropertyId = nextPropertyId;
        properties[newPropertyId] = Property(
            newPropertyId,
            _propertyOwner,
            _location,
            _area,
            _propertyType,
            true
        );

        emit PropertyRegistered(
            newPropertyId,
            _propertyOwner,
            _location,
            _area,
            _propertyType
        );

        nextPropertyId++;
    }

    
    /**
     * @dev Allows the current owner of a property to transfer it to a new owner.
     * @param _propertyId The ID of the property to transfer.
     * @param _newOwner The address of the new owner.
     */
    function transferOwnership(uint256 _propertyId, address _newOwner) external {
        // Step 1: Create a reference to the property in storage.
        Property storage property = properties[_propertyId];

        // Step 2: Perform security checks.
        require(property.isRegistered, "Property does not exist.");
        require(msg.sender == property.owner, "You are not the owner of this property.");

        address oldOwner = property.owner;

        // Step 3: Update the owner.
        property.owner = _newOwner;

        emit OwnershipTransferred(_propertyId, oldOwner, _newOwner);
    }
    
}