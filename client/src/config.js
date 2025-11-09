import { ethers } from "ethers";
import Attendance from "./contracts/Attendance.json"; 

export const attendanceAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
export const attendanceABI = Attendance.abi;

export const BACKEND_URL = "http://localhost:4000";

export async function getContract() {
  try {
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const signer = await provider.getSigner(0);
    const contract = new ethers.Contract(attendanceAddress, attendanceABI, signer);
    return contract;
  } catch (err) {
    console.error("❌ Blockchain not connected:", err);
    return null;
  }
}
