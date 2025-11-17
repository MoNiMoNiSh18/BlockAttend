# BlockAttend 

**Blockchain-based Attendance System** with:
- Hardhat solidity contract that stores attendance records (events).
- Node/Express backend using **local JSON files** (offline friendly) and optional push to local Hardhat node using ethers.
- React frontend (minimal) with dark theme and the basic flows: teacher registration, admin approval, teacher add student, mark attendance (backend).

## Prerequisites
- Node.js 18+ and npm
- Git (optional)-
- Port 4000 free (backend). Hardhat default RPC at 8545.

## Quick start (one-time)
Open a terminal in the project root (`/mnt/data/BlockAttend_scaffold` if downloaded here) and run:

1. Install dependencies for server and client:
   - `cd server && npm install`
   - `cd ../client && npm install`

2. Start a local Hardhat node (new terminal):
   - `npx hardhat node`
   Keep it running.

3. Deploy the contract to localhost (new terminal):
   - `npx hardhat run scripts/deploy.js --network localhost`
   Note the printed contract address.

4. Start backend:
   - `cd server && node index.js`
   Backend runs at `http://localhost:4000`

5. Start frontend:
   - `cd client && npm start`
   React app runs at `http://localhost:3000`

## Notes about offline operation
- The scaffold uses local JSON files to store users/attendance so it functions without external databases.
- `npm install` requires internet to fetch packages unless you have them cached locally. If you need a truly offline install, copy a pre-populated `node_modules` (not included here) or use an npm mirror / internal registry.

## Files of interest
- `contracts/Attendance.sol` - Solidity contract
- `scripts/deploy.js` - deployment script
- `server/index.js` - backend API and JSON storage
- `client/src` - React UI skeleton and dark theme

## Extending the scaffold
- Implement proper authentication (JWT), file attachments to IPFS, email via SMTP, and a real database (SQLite/Postgres).
- Expand frontend UI with Tailwind components and React Router for multi-page UI.
- Connect teacher/student accounts to Ethereum addresses if desired.

If you want, I can now:
1. Add more complete UI pages (admin dashboard, teacher attendance grid, student profile) in the React app.
2. Implement JWT auth and protect endpoints.
3. Add CSV/PDF generation in the server (PDF requires extra libs).
4. Provide a pre-built `node_modules` archive to make it fully offline (this is large).

Tell me which extras you'd like and I'll add them right away.


## Demo credentials (server data)
- Admin: email `admin@example.com`, password `admin123`
- When admin approves a teacher request, the teacher will receive the password they registered with.
- Students added by teacher get default password `student123`.
