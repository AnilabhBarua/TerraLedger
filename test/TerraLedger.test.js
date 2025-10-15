const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TerraLedger", function () {
    // A helper function to deploy the contract before each test
    async function deployTerraLedgerFixture() {
        const [owner, otherAccount] = await ethers.getSigners();
        const TerraLedger = await ethers.getContractFactory("TerraLedger");
        const terraLedger = await TerraLedger.deploy();
        return { terraLedger, owner, otherAccount };
    }

    // Test Suite: Deployment
    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            const { terraLedger, owner } = await deployTerraLedgerFixture();
            expect(await terraLedger.owner()).to.equal(owner.address);
        });
    });
});