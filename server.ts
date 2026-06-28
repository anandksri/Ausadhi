import express from "express";
import path from "path";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import * as XLSX from "xlsx";
import { createServer as createViteServer } from "vite";
import { connectDB, db } from "./src/server/db.ts";

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "ausadhi_secret_key_nepal_2026";

// Enable CORS and parsing of JSON/URL-encoded bodies
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer memory storage for parsing uploaded Excel files
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Authentication Middleware
interface AuthRequest extends express.Request {
  user?: {
    userId: string;
    shopName: string;
  };
}

async function authenticateToken(req: AuthRequest, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required. Please log in." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; shopName: string };
    req.user = decoded;

    // Safe translation: if MongoDB is active but user has a legacy non-ObjectId ID,
    // find their new MongoDB user document and dynamically swap the ID.
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(decoded.userId);
    const isMongo = await connectDB();
    if (isMongo && !isValidObjectId && decoded.shopName) {
      const realUser = await db.findUserByShopName(decoded.shopName);
      if (realUser && realUser._id) {
        req.user.userId = realUser._id.toString();
      }
    }

    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token." });
  }
}

// ==========================================
// API ROUTES
// ==========================================

// 1. POST /api/auth/register - Owner Signup
app.post("/api/auth/register", async (req, res) => {
  try {
    const { shopName, ownerName, phone, location, password, panNumber } = req.body;

    if (!shopName || !ownerName || !phone || !location || !password || !panNumber) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Validate PAN Number format (10-15 alphanumeric characters)
    const panRegex = /^[a-zA-Z0-9]{10,15}$/;
    if (!panRegex.test(panNumber)) {
      return res.status(400).json({ error: "PAN Number must be 10-15 alphanumeric characters." });
    }

    // Check if shopName, phone or panNumber already exists
    const existingShop = await db.findUserByShopName(shopName);
    if (existingShop) {
      return res.status(400).json({ error: "A pharmacy with this shop name is already registered." });
    }

    const existingPhone = await db.findUserByPhone(phone);
    if (existingPhone) {
      return res.status(400).json({ error: "This phone number is already registered." });
    }

    const existingPan = await db.findUserByPan(panNumber);
    if (existingPan) {
      return res.status(400).json({ error: "This PAN Number is already registered." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await db.createUser({
      shopName,
      ownerName,
      phone,
      location,
      password: hashedPassword,
      panNumber
    });

    // Generate JWT
    const token = jwt.sign(
      { userId: newUser._id, shopName: newUser.shopName, panNumber: newUser.panNumber },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Registration successful!",
      token,
      user: {
        id: newUser._id,
        shopName: newUser.shopName,
        ownerName: newUser.ownerName,
        phone: newUser.phone,
        location: newUser.location,
        panNumber: newUser.panNumber
      }
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Server error during registration." });
  }
});

// 2. POST /api/auth/login - Owner Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ error: "Phone number and password are required." });
    }

    const user = await db.findUserByPhone(phone);
    if (!user) {
      return res.status(400).json({ error: "Invalid phone number or password." });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid phone number or password." });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, shopName: user.shopName, panNumber: user.panNumber },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        shopName: user.shopName,
        ownerName: user.ownerName,
        phone: user.phone,
        location: user.location,
        panNumber: user.panNumber
      }
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error during login." });
  }
});

// 3. GET /api/medicines/search?q={query} - Public Search (No Auth Required)
app.get("/api/medicines/search", async (req, res) => {
  try {
    const query = (req.query.q as string) || "";
    const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
    const lng = req.query.lng ? parseFloat(req.query.lng as string) : undefined;
    const timeFilter = req.query.timeFilter as string | undefined;
    const statusFilter = req.query.statusFilter as string | undefined;

    const results = await db.searchMedicines(query, { lat, lng, timeFilter, statusFilter });
    res.json({ results });
  } catch (error: any) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Server error during search." });
  }
});

// 4. POST /api/medicines - Owner adds a single medicine
app.post("/api/medicines", authenticateToken as any, async (req: AuthRequest, res) => {
  try {
    const { medicineName, category } = req.body;
    const pharmacyId = req.user?.userId;

    if (!medicineName) {
      return res.status(400).json({ error: "Medicine name is required." });
    }

    if (!pharmacyId) {
      return res.status(401).json({ error: "Unauthorized access." });
    }

    const newMedicine = await db.createMedicine({
      pharmacyId,
      medicineName,
      category: category || "General"
    });

    res.status(201).json({
      message: "Medicine added successfully!",
      medicine: newMedicine
    });
  } catch (error: any) {
    console.error("Add medicine error:", error);
    res.status(500).json({ error: "Server error while adding medicine." });
  }
});

// 5. POST /api/medicines/bulk-upload - Owner bulk-upload Excel/CSV
app.post("/api/medicines/bulk-upload", authenticateToken as any, upload.single("file"), async (req: AuthRequest, res) => {
  try {
    const pharmacyId = req.user?.userId;
    if (!pharmacyId) {
      return res.status(401).json({ error: "Unauthorized access." });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Please upload an Excel or CSV file." });
    }

    // Read the Excel workbook from buffer
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Parse to JSON rows
    const rows = XLSX.utils.sheet_to_json<any>(worksheet);

    if (!rows || rows.length === 0) {
      return res.status(400).json({ error: "The uploaded file is empty or formatted incorrectly." });
    }

    const validMedicines: { pharmacyId: string; medicineName: string; category?: string }[] = [];
    let skippedCount = 0;

    for (const row of rows) {
      // Support common column name casings (case-insensitive keys)
      const keys = Object.keys(row);
      const medicineNameKey = keys.find(k => k.toLowerCase().replace(/\s+/g, "") === "medicinename");
      const categoryKey = keys.find(k => k.toLowerCase().replace(/\s+/g, "") === "category");

      const medicineName = medicineNameKey ? String(row[medicineNameKey]).trim() : "";
      const category = categoryKey ? String(row[categoryKey]).trim() : "General";

      if (!medicineName) {
        skippedCount++;
        continue;
      }

      validMedicines.push({
        pharmacyId,
        medicineName,
        category: category || "General"
      });
    }

    if (validMedicines.length === 0) {
      return res.status(400).json({
        error: "No valid rows found to import.",
        skippedCount
      });
    }

    // Bulk insert
    const addedCount = await db.createMedicinesBulk(validMedicines);

    res.json({
      message: `Successfully processed file.`,
      addedCount,
      skippedCount,
      warningMessage: skippedCount > 0 ? `${skippedCount} rows skipped due to missing medicine names.` : undefined
    });
  } catch (error: any) {
    console.error("Bulk upload error:", error);
    res.status(500).json({ error: "Server error while processing bulk upload." });
  }
});

// 6. PUT /api/medicines/:id/status - Owner toggles status (Available/OOS)
app.put("/api/medicines/:id/status", authenticateToken as any, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'Available' or 'Out_of_Stock'
    const pharmacyId = req.user?.userId;

    if (!pharmacyId) {
      return res.status(401).json({ error: "Unauthorized access." });
    }

    if (!status || !['Available', 'Out_of_Stock'].includes(status)) {
      return res.status(400).json({ error: "Invalid status. Must be 'Available' or 'Out_of_Stock'." });
    }

    try {
      const updatedMed = await db.updateMedicineStatus(id, status, pharmacyId);
      if (!updatedMed) {
        return res.status(404).json({ error: "Medicine not found." });
      }
      res.json({
        message: "Medicine status updated successfully!",
        medicine: updatedMed
      });
    } catch (err: any) {
      if (err.message === "FORBIDDEN") {
        return res.status(403).json({ error: "Forbidden. You can only manage stock for your own pharmacy." });
      }
      throw err;
    }
  } catch (error: any) {
    console.error("Status update error:", error);
    res.status(500).json({ error: "Server error while updating status." });
  }
});

// 7. POST /api/medicines/:id/report - Public reports mismatch
app.post("/api/medicines/:id/report", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedMed = await db.incrementMedicineReport(id);

    if (!updatedMed) {
      return res.status(404).json({ error: "Medicine not found." });
    }

    res.json({
      message: "Report submitted successfully! Thank you for verification.",
      medicine: {
        id: updatedMed._id,
        reportCount: updatedMed.reportCount
      }
    });
  } catch (error: any) {
    console.error("Report error:", error);
    res.status(500).json({ error: "Server error while reporting mismatch." });
  }
});

// Additional helpful API: GET /api/medicines/my-inventory - Owner reads their own medicine stock
app.get("/api/medicines/my-inventory", authenticateToken as any, async (req: AuthRequest, res) => {
  try {
    const pharmacyId = req.user?.userId;
    if (!pharmacyId) {
      return res.status(401).json({ error: "Unauthorized." });
    }
    const results = await db.findMedicinesByPharmacyId(pharmacyId);
    res.json({ results });
  } catch (error: any) {
    console.error("Get inventory error:", error);
    res.status(500).json({ error: "Server error while fetching inventory." });
  }
});

// ==========================================
// ADMIN MIDDLEWARE & ROUTES
// ==========================================

async function authenticateAdminToken(req: AuthRequest, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required. Please log in as admin." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; shopName: string };
    req.user = decoded;

    const user = await db.findUserById(decoded.userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: "Access denied. Admin rights required." });
    }
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token." });
  }
}

// POST /api/admin/login
app.post("/api/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = await db.findUserByPhone(email);
    if (!user || !user.isAdmin) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    const token = jwt.sign(
      { userId: user._id, shopName: user.shopName, isAdmin: true },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Admin login successful!",
      token,
      user: {
        id: user._id,
        shopName: user.shopName,
        ownerName: user.ownerName,
        phone: user.phone,
        location: user.location,
        isAdmin: true
      }
    });
  } catch (error: any) {
    console.error("Admin login error:", error);
    res.status(500).json({ error: "Server error during admin login." });
  }
});

// GET /api/admin/stats
app.get("/api/admin/stats", authenticateAdminToken as any, async (req, res) => {
  try {
    const stats = await db.getAdminStats();
    res.json({ stats });
  } catch (error: any) {
    console.error("Admin stats error:", error);
    res.status(500).json({ error: "Server error fetching admin stats." });
  }
});

// GET /api/admin/pharmacies
app.get("/api/admin/pharmacies", authenticateAdminToken as any, async (req, res) => {
  try {
    const pharmacies = await db.getAllUsers();
    res.json({ pharmacies });
  } catch (error: any) {
    console.error("Admin pharmacies error:", error);
    res.status(500).json({ error: "Server error fetching pharmacies." });
  }
});

// PUT /api/admin/pharmacies/:id/toggle-status
app.put("/api/admin/pharmacies/:id/toggle-status", authenticateAdminToken as any, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await db.toggleUserActiveStatus(id);
    if (!updated) {
      return res.status(404).json({ error: "Pharmacy user not found." });
    }
    res.json({ message: "Pharmacy status toggled successfully.", user: updated });
  } catch (error: any) {
    console.error("Admin toggle user status error:", error);
    res.status(500).json({ error: "Server error toggling user status." });
  }
});

// DELETE /api/admin/pharmacies/:id
app.delete("/api/admin/pharmacies/:id", authenticateAdminToken as any, async (req, res) => {
  try {
    const { id } = req.params;
    const success = await db.deleteUser(id);
    if (!success) {
      return res.status(404).json({ error: "Pharmacy user not found." });
    }
    res.json({ message: "Pharmacy and its medicine inventory deleted successfully." });
  } catch (error: any) {
    console.error("Admin delete pharmacy error:", error);
    res.status(500).json({ error: "Server error deleting pharmacy." });
  }
});

// GET /api/admin/medicines
app.get("/api/admin/medicines", authenticateAdminToken as any, async (req, res) => {
  try {
    const medicines = await db.getAllMedicinesAdmin();
    res.json({ medicines });
  } catch (error: any) {
    console.error("Admin medicines error:", error);
    res.status(500).json({ error: "Server error fetching medicines." });
  }
});

// PUT /api/admin/medicines/:id/flag
app.put("/api/admin/medicines/:id/flag", authenticateAdminToken as any, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await db.toggleMedicineFlag(id);
    if (!updated) {
      return res.status(404).json({ error: "Medicine listing not found." });
    }
    res.json({ message: "Medicine review flag toggled.", medicine: updated });
  } catch (error: any) {
    console.error("Admin toggle flag error:", error);
    res.status(500).json({ error: "Server error toggling review flag." });
  }
});

// DELETE /api/admin/medicines/:id
app.delete("/api/admin/medicines/:id", authenticateAdminToken as any, async (req, res) => {
  try {
    const { id } = req.params;
    const success = await db.deleteMedicine(id);
    if (!success) {
      return res.status(404).json({ error: "Medicine not found." });
    }
    res.json({ message: "Medicine listing deleted successfully." });
  } catch (error: any) {
    console.error("Admin delete medicine error:", error);
    res.status(500).json({ error: "Server error deleting medicine." });
  }
});

// PUT /api/admin/change-password
app.put("/api/admin/change-password", authenticateAdminToken as any, async (req: AuthRequest, res) => {
  try {
    const { newPassword } = req.body;
    const adminId = req.user?.userId;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long." });
    }

    if (!adminId) {
      return res.status(401).json({ error: "Unauthorized access." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const success = await db.updateAdminPassword(adminId, hashedPassword);
    
    if (!success) {
      return res.status(500).json({ error: "Failed to update admin password." });
    }

    res.json({ message: "Admin password updated successfully." });
  } catch (error: any) {
    console.error("Admin change password error:", error);
    res.status(500).json({ error: "Server error changing admin password." });
  }
});

// Global API error handling middleware to ensure errors in API routes are returned as JSON
app.use("/api", (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("API Route Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "An unexpected server error occurred.",
    stack: process.env.NODE_ENV !== "production" ? err.stack : undefined
  });
});

// ==========================================
// VITE OR STATIC ASSETS SERVING MIDDLEWARE
// ==========================================

async function start() {
  // Connect to database (will automatically fallback to JSON database if URI not found/configured)
  await connectDB();

  if (process.env.NODE_ENV !== "production") {
    // Development Mode: Mount Vite in middleware mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production Mode: Serve built static files
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Ausadhi Tracker Backend] listening on http://0.0.0.0:${PORT}`);
  });
}

start();
