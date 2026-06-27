# Ausadhi 🇳🇵
> **A Hyper-Local Medicine Availability & Stock Verification Tracker for Nepal.**

Ausadhi is a full-stack, hyper-local web utility that enables the public in Nepal to search for medicines, and local pharmacy owners to manage their real-time inventory and stock status.

---

## 🚀 Key Features

1. **Dual-Role Interaction**:
   - **Public (Guest)**: Easily search for medicines by name/category. Results display the selling pharmacy's name, precise address/town, phone link, current stock status (Green for Available / Red for Out of Stock), and a mismatch report button.
   - **Pharmacy Owners (JWT-Authenticated)**: Secured dashboard to add/update stock statuses and process excel imports.

2. **The "Neighbor Sabotage" Shield (Anti-Spam Mismatch Control)**:
   - Competitors and guests cannot directly change a medicine's status.
   - Public users can click **"Report Mismatch"**. This increments a `reportCount` counter on the database.
   - If **3 or more reports** are registered for a single item, a prominent **⚠️ RED ALERT** is displayed on the owner's dashboard, prompting them to verify the stock. The status stays intact until the verified owner chooses to manually toggle it.

3. **Dynamic SheetJS Bulk Upload**:
   - Includes a **📥 Download Template** button which uses SheetJS client-side to generate and download an Excel spreadsheet structure (`medicineName`, `category`).
   - Owners fill the sheet and click **📤 Import Stock** to bulk-upload their inventory. The backend parses the spreadsheet and inserts the rows in a single batch, with automatic skipping of invalid empty rows.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React (Vite), Tailwind CSS v4, Lucide Icons, Framer Motion, SheetJS (`xlsx`)
- **Backend**: Node.js, Express, Multer, JWT authentication, BcryptJS password hashing, SheetJS
- **Database**: Mongoose / MongoDB with a robust **automatic local JSON-file storage fallback**.
  > *Note*: If `MONGO_URI` is not configured, the app will save data into local file-system files (`data/users.json` and `data/medicines.json`) so the application is instantly functional in any environment!

---

## ⚙️ Setup and Installation

### 1. Configure Environment variables
Create a `.env` file at the root or specify them in your deployment environment:
```env
# MongoDB Connection (Optional - fallbacks to local files if omitted)
MONGO_URI="your_mongodb_connection_string"

# Token security signing key
JWT_SECRET="your_secure_random_string"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
Runs both the Express server and Vite builder:
```bash
npm run dev
```

### 4. Build and Start Production Server
```bash
npm run build
npm start
```
