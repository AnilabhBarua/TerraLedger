const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TerraLedger", function () {
    async function deployTerraLedgerFixture() {
        // We add 'accountTwo' here for our transfer test
        const [owner, accountOne, accountTwo] = await ethers.getSigners();
        const TerraLedger = await ethers.getContractFactory("TerraLedger");
        const terraLedger = await TerraLedger.deploy();
        return { terraLedger, owner, accountOne, accountTwo };
    }

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            const { terraLedger, owner } = await deployTerraLedgerFixture();
            expect(await terraLedger.owner()).to.equal(owner.address);
        });
    });

    describe("Property Registration", function () {
        it("Should allow the owner to register a new property", async function () {
            const { terraLedger, owner, accountOne } = await deployTerraLedgerFixture();
            // Register a property to 'accountOne'
            await terraLedger.connect(owner).registerProperty(accountOne.address, "123 Main St");
            
            const property = await terraLedger.properties(1);
            expect(property.owner).to.equal(accountOne.address);
        });

        it("Should fail if a non-owner tries to register a property", async function () {
            const { terraLedger, accountOne } = await deployTerraLedgerFixture();
            
            await expect(
                terraLedger.connect(accountOne).registerProperty(accountOne.address, "456 Side St")
            ).to.be.revertedWith("Only the contract owner can register new properties");
        });
    });

    // --- THIS IS THE NEW SECTION YOU ARE ADDING ---
    describe("Ownership Transfer", function () {
        it("Should allow the rightful owner to transfer a property", async function () {
            const { terraLedger, owner, accountOne, accountTwo } = await deployTerraLedgerFixture();
            // 1. Admin (owner) registers a property to accountOne
            await terraLedger.connect(owner).registerProperty(accountOne.address, "789 Elm St");

            // 2. accountOne (the new owner) transfers the property to accountTwo
            await terraLedger.connect(accountOne).transferOwnership(1, accountTwo.address);

            // 3. Verify the new owner is accountTwo
            const property = await terraLedger.properties(1);
            expect(property.owner).to.equal(accountTwo.address);
        });

        it("Should fail if a non-owner tries to transfer a property", async function () {
            const { terraLedger, owner, accountOne, accountTwo } = await deployTerraLedgerFixture();
            // 1. Admin (owner) registers a property to accountOne
            await terraLedger.connect(owner).registerProperty(accountOne.address, "789 Elm St");

            // 2. accountTwo (a stranger) tries to transfer the property, which should fail
            await expect(
                terraLedger.connect(accountTwo).transferOwnership(1, owner.address)
            ).to.be.revertedWith("You are not the owner of this property.");
        });

        it("Should fail when transferring a non-existent property", async function () {
            const { terraLedger, accountOne, accountTwo } = await deployTerraLedgerFixture();
            
            // Try to transfer property ID 99, which has not been registered
            await expect(
                terraLedger.connect(accountOne).transferOwnership(99, accountTwo.address)
            ).to.be.revertedWith("Property does not exist.");
        });
    });
    // --- END OF NEW SECTION ---
});