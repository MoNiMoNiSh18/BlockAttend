# 🚀 BlockAttend – Blockchain Based Attendance System

A secure and tamper-proof attendance management system built using **Blockchain + Full Stack Web Development** to ensure data integrity and transparency in academic environments.

## 📌 Problem Statement

Traditional attendance systems allow manual editing or manipulation of records. This reduces trust and makes auditing difficult.

## ✅ Solution

BlockAttend stores attendance logs on a **local blockchain (Ethereum/Hardhat)**, making records:

* Immutable
* Transparent
* Verifiable
* Tamper-resistant

Each attendance entry is cryptographically secured using smart contracts.

---

## 🛠️ Tech Stack

* **Frontend:** React (Dark UI)
* **Backend:** Node.js, Express
* **Blockchain:** Solidity, Hardhat, Ethers.js
* **Storage:** Local JSON (offline-friendly)
* **Tools:** Git, GitHub

---

## ✨ Key Features

* Teacher registration & admin approval
* Student management
* Attendance marking
* Smart contract event logging
* Immutable blockchain records
* Offline-friendly backend storage
* Local Ethereum node integration

---

## 🏗️ Architecture

React UI → Express API → Smart Contract → Hardhat Local Blockchain

---

## 🚀 Quick Start

### Install dependencies

cd server && npm install
cd client && npm install

### Run blockchain node

npx hardhat node

### Deploy contract

npx hardhat run scripts/deploy.js --network localhost

### Start backend

cd server && node index.js

### Start frontend

cd client && npm start

---

## 📂 Important Files

* contracts/Attendance.sol – Smart contract
* server/index.js – Backend APIs
* scripts/deploy.js – Contract deployment
* client/src – React frontend

---

## 🔮 Future Improvements

* JWT authentication
* Database integration (PostgreSQL/SQLite)
* IPFS for document storage
* Ethereum wallet linking
* Production deployment

---

## 👨‍💻 Author

Monish V
LinkedIn: (add link here)
