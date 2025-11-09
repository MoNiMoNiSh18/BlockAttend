const hre = require("hardhat");

async function main() {
  const Attendance = await hre.ethers.getContractFactory("Attendance");
  const attendance = await Attendance.deploy();
  await attendance.waitForDeployment();

  console.log("Attendance contract deployed to:", await attendance.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
