const { expect } = require("chai");
const hre = require("hardhat");

describe("TerraLedger Gas Report", function () {
  let contract, admin, registrar, citizen, buyer;

  before(async function () {
    [admin, registrar, citizen, buyer] = await hre.ethers.getSigners();
    const Factory = await hre.ethers.getContractFactory("TerraLedger");
    contract = await Factory.deploy();
    await contract.waitForDeployment();

    // Grant registrar role
    await contract.addRegistrar(registrar.address);
  });

  it("registerProperty() gas", async function () {
    const tx = await contract.connect(registrar).registerProperty(
      citizen.address,
      "123 Testnet Ave, Block-7, Sector-12, New Delhi",
      "15847",
      "Residential",
      "bafkreifex123abc456def789ghi012jkl345mno678pqr901stu234vwx567yz"
    );
    const receipt = await tx.wait();
    console.log("    registerProperty() gasUsed:", receipt.gasUsed.toString());
  });

  it("requestTransfer() gas", async function () {
    const tx = await contract.connect(citizen).requestTransfer(1, buyer.address);
    const receipt = await tx.wait();
    console.log("    requestTransfer() gasUsed:", receipt.gasUsed.toString());
  });

  it("approveTransfer() gas", async function () {
    const tx = await contract.connect(registrar).approveTransfer(1);
    const receipt = await tx.wait();
    console.log("    approveTransfer() gasUsed:", receipt.gasUsed.toString());
  });

  it("updatePropertyDocument() gas", async function () {
    const tx = await contract.connect(registrar).updatePropertyDocument(
      1,
      "bafkreinewcorrecteddocumenthash123456789abcdef0123456789abcdef01"
    );
    const receipt = await tx.wait();
    console.log("    updatePropertyDocument() gasUsed:", receipt.gasUsed.toString());
  });
});
