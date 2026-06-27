# Ausadhi - Medicine Availability Tracker

"Know before you go. Find medicines near you in seconds."

Overview

Ausadhi is a hyper-local medicine availability tracker built specifically for Nepal. It connects pharmacy owners with the general public, allowing users to search for medicines and find nearby pharmacies that have them in stock.

Problem We Solve

- People waste hours visiting multiple pharmacies to find specific medicines
- No real-time visibility of medicine stock across pharmacies
- Patients with chronic conditions struggle to find their regular medications
- Pharmacy owners have no digital platform to showcase their inventory

Our Solution

- Real-time medicine search across verified pharmacies
- Pharmacy owners can easily manage their inventory
- Bulk upload via Excel for quick inventory setup
- Community-driven "Report Mismatch" system to maintain accuracy
- Anti-spam protection prevents competitors from sabotaging stock data

Key Features

For Public Users (No Login Required)

- Search Medicines - Find any medicine by name
- Nearby Pharmacies - See which pharmacies have your medicine in stock
- Status Badges - Green (Available) / Red (Out of Stock)
- Contact Info - Phone numbers and locations of pharmacies
- Report Mismatch - Alert owners if stock information is incorrect

For Pharmacy Owners (JWT Authentication)

- Dashboard - Complete inventory management
- Bulk Upload - Add hundreds of medicines via Excel/CSV
- Stock Management - Toggle medicines Available/Out of Stock instantly
- Report Tracking - See how many users reported mismatches
- Quick Add - Add single medicines on the fly

Tech Stack

Backend

- Node.js - JavaScript runtime
- Express.js - Web framework
- MongoDB - NoSQL database
- Mongoose - ODM for MongoDB
- JWT - Authentication
- Bcrypt - Password hashing
- xlsx (SheetJS) - Excel file parsing
- Multer - File upload handling

Frontend

- React.js - UI library
- Vite - Build tool
- React Router DOM - Navigation
- Axios - HTTP client
- CSS3 - Custom styling with responsive design

DevOps

- Environment Variables - Secure configuration
- CORS - Cross-origin resource sharing

Project Structure

ausadhi/
├── server/
│   ├── models/
│   │   ├── User.js           # Pharmacy owner model
│   │   └── Medicine.js       # Inventory model
│   ├── routes/
│   │   ├── auth.js           # Register/Login routes
│   │   └── medicines.js      # Medicine CRUD routes
│   ├── controllers/
│   │   ├── authController.js
│   │   └── medicineController.js
│   ├── middleware/
│   │   └── auth.js           # JWT verification
│   ├── server.js             # Entry point
│   └── .env                  # Environment variables
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   └── MedicineCard.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── .env.example
├── README.md
└── package.json

Installation and Setup

Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account (or local MongoDB)
- Git

1. Clone the Repository

git clone https://github.com/yourusername/ausadhi.git
cd ausadhi

2. Backend Setup

cd server
npm install

Create .env file in the server/ directory:

PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/ausadhi
JWT_SECRET=ausadhi_secret_key_nepal_2026

3. Frontend Setup

cd ../client
npm install

4. Run the Application

Backend (from server/ folder)

npm run dev

Server runs on: http://localhost:5000

Frontend (from client/ folder)

npm run dev

Client runs on: http://localhost:5173

Responsive Breakpoints

Device              Screen Width        Cards per Row
Small Mobile        below 480px         1
Mobile              480px - 767px       1
Tablet              768px - 1023px      2
Desktop             1024px and above    3

Database Schema

User Model (Pharmacy Owner)

{
  shopName: String, required, unique
  ownerName: String, required
  phone: String, required, unique
  location: String, required
  password: String, required, hashed
}

Medicine Model (Inventory)

{
  pharmacyId: ObjectId, ref: 'User', required
  medicineName: String, required, indexed
  category: String
  status: String, enum: ['Available', 'Out_of_Stock'], default: 'Available'
  reportCount: Number, default: 0
  lastUpdated: Date, default: Date.now
}

Security Features

- JWT Authentication - Secure owner login
- Bcrypt Password Hashing - Passwords never stored in plain text
- Route Protection - Only owners can access dashboard
- Ownership Verification - Owners can only modify their own medicines
- Rate Limiting - Prevent API abuse (optional)

Anti-Spam Logic (Neighbor Sabotage Prevention)

1. Only owners can change medicine status
2. Public users can only report mismatches
3. Report threshold: If 5+ users report mismatch, owner gets alert
4. No automatic status change - Owner must manually verify and update

API Endpoints

Authentication

Method  Endpoint                    Description
POST    /api/auth/register          Owner registration
POST    /api/auth/login             Owner login (returns JWT)

Medicines

Method  Endpoint                           Description
GET     /api/medicines/search?q={query}    Public search
POST    /api/medicines                     Add single medicine (Owner only)
POST    /api/medicines/bulk-upload         Bulk upload Excel (Owner only)
PUT     /api/medicines/:id/status          Toggle status (Owner only)
POST    /api/medicines/:id/report          Report mismatch (Public)

Color Palette

Color               Hex Code        Usage
Primary Blue        #1A5276         Headers, buttons, navbar
Secondary Teal      #148F77         "Available" badges
Danger Red          #E74C3C         "Out of Stock" badges
Background          #F0F4F8         Page background
White               #FFFFFF         Cards, modals

Dependencies

Backend

{
  "express": "^4.18.2",
  "mongoose": "^7.0.0",
  "jsonwebtoken": "^9.0.0",
  "bcryptjs": "^2.4.3",
  "cors": "^2.8.5",
  "dotenv": "^16.0.3",
  "multer": "^1.4.5",
  "xlsx": "^0.18.5"
}

Frontend

{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.8.0",
  "axios": "^1.3.0",
  "vite": "^4.1.0"
}

Contributing

1. Fork the repository
2. Create a feature branch (git checkout -b feature/amazing-feature)
3. Commit your changes (git commit -m 'Add amazing feature')
4. Push to branch (git push origin feature/amazing-feature)
5. Open a Pull Request

License

This project is open-source and available under the MIT License.

Team

Built for the Nepal Hackathon 2026

Acknowledgments

- Nepal's pharmacy owners for their valuable feedback
- Healthcare workers for understanding real-world problems
- Open-source community for amazing tools and libraries

Support

For issues, questions, or contributions:
- Email: anandkeshari0711.com
- Issues: https://github.com/anandksri/ausadhi

Made in Nepal By Team 403 Forbidden