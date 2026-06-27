# Ausadhi

**Medicine Availability Tracker for Nepal**

*A hyper-local platform that enables citizens to discover medicine availability in nearby pharmacies while helping pharmacy owners manage their inventory digitally.*

---

## Table of Contents

- Overview
- Problem Statement
- Solution
- Features
- System Architecture
- Technology Stack
- Project Structure
- Installation
- Configuration
- Running the Application
- API Reference
- Database Design
- Security
- Roadmap
- Contributing
- License
- Team

---

## Overview

Ausadhi is a full-stack web application developed to solve one of Nepal's most common healthcare challenges—locating medicines quickly.

Instead of visiting multiple pharmacies, users can search for medicines online and instantly discover pharmacies where the medicine is currently available. Pharmacy owners receive a dedicated dashboard for maintaining inventory, updating stock status, and managing reports submitted by the community.

The project is designed around three principles:

- Fast medicine discovery
- Reliable inventory information
- Simple inventory management for pharmacies

---

## Problem Statement

Patients frequently experience delays in obtaining prescribed medicines due to the absence of a centralized inventory system.

Current challenges include:

- No visibility into medicine availability across pharmacies
- Time lost visiting multiple stores
- Difficulty locating emergency medicines
- No digital platform for local pharmacy inventories
- Manual communication between patients and pharmacies

---

## Solution

Ausadhi provides a centralized platform connecting pharmacies and the public.

Users can search medicines and immediately view pharmacies where the medicine is available.

Pharmacy owners manage their inventories through a secure dashboard, while community-driven reporting helps maintain data accuracy.

---

## Features

### Public Portal

- Medicine Search
- Nearby Pharmacy Discovery
- Availability Status
- Pharmacy Contact Information
- Community Mismatch Reporting
- No Authentication Required

### Pharmacy Dashboard

- Secure Authentication
- Inventory Management
- Bulk Excel/CSV Upload
- Stock Availability Updates
- Report Monitoring
- Medicine Management

---

## System Architecture

```text
                Users
                  │
                  │
          React + Vite Client
                  │
         REST API (Express.js)
                  │
        JWT Authentication Layer
                  │
        MongoDB Database Server
                  │
        Pharmacy Inventory Data
```

---

## Technology Stack

### Frontend

| Technology | Purpose |
|------------|----------|
| React | User Interface |
| Vite | Build Tool |
| React Router DOM | Routing |
| Axios | HTTP Client |
| CSS3 | Styling |

### Backend

| Technology | Purpose |
|------------|----------|
| Node.js | JavaScript Runtime |
| Express.js | REST API |
| MongoDB | Database |
| Mongoose | ODM |
| JWT | Authentication |
| Bcrypt | Password Hashing |
| Multer | File Upload |
| SheetJS | Excel Processing |

---

## Project Structure

```text
ausadhi/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── server/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
├── README.md
├── package.json
└── .env.example
```

---

## Installation

### Clone the Repository

```bash
git clone https://github.com/anandksri/ausadhi.git

cd ausadhi
```

### Install Backend Dependencies

```bash
cd server

npm install
```

### Install Frontend Dependencies

```bash
cd ../client

npm install
```

---

## Configuration

Create a `.env` file inside the `server` directory.

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secure_jwt_secret
```

---

## Running the Application

### Start Backend

```bash
cd server

npm run dev
```

Backend runs at:

```
http://localhost:5000
```

### Start Frontend

```bash
cd client

npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

## REST API

### Authentication

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/register` | Register a Pharmacy |
| POST | `/api/auth/login` | Authenticate Pharmacy Owner |

### Medicines

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/medicines/search?q=` | Search Medicines |
| POST | `/api/medicines` | Add Medicine |
| POST | `/api/medicines/bulk-upload` | Upload Inventory |
| PUT | `/api/medicines/:id/status` | Update Availability |
| POST | `/api/medicines/:id/report` | Report Incorrect Stock |

---

## Database Schema

### User

```javascript
{
    shopName: String,
    ownerName: String,
    phone: String,
    location: String,
    password: String
}
```

### Medicine

```javascript
{
    pharmacyId: ObjectId,
    medicineName: String,
    category: String,
    status: "Available" | "Out_of_Stock",
    reportCount: Number,
    lastUpdated: Date
}
```

---

## Security

- JWT-based Authentication
- Password Hashing using Bcrypt
- Protected API Routes
- Ownership Verification
- Secure Environment Variables
- Community-driven Stock Verification
- Optional Rate Limiting

---

## Future Roadmap

- GPS-based Pharmacy Discovery
- Prescription Upload
- AI-powered Medicine Recommendations
- Mobile Application
- Push Notifications
- Real-time Inventory Synchronization
- Pharmacy Verification
- Analytics Dashboard

---

## Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a feature branch.

```bash
git checkout -b feature/new-feature
```

3. Commit your changes.

```bash
git commit -m "Add new feature"
```

4. Push to GitHub.

```bash
git push origin feature/new-feature
```

5. Open a Pull Request.

---

## License

This project is licensed under the MIT License.

---

## Team

**Team 403 Forbidden**

Developed during the Cosmos Hackathon 2026.

---

## Contact

GitHub

```
https://github.com/anandksri
```

Email

```
anandkeshari0711@gmail.com
```