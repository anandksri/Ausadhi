import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

// Define MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
let isConnected = false;

export async function connectDB() {
  if (!MONGO_URI) {
    console.log("MONGO_URI not provided. Running in high-performance local JSON-file fallback mode.");
    isConnected = false;
    await seedDemoData();
    return false;
  }
  try {
    await mongoose.connect(MONGO_URI);
    isConnected = true;
    console.log("Successfully connected to MongoDB.");
    await seedDemoData();
    return true;
  } catch (error) {
    console.error("MongoDB connection failed. Falling back to local JSON-file mode.", error);
    isConnected = false;
    await seedDemoData();
    return false;
  }
}

// Helper to calculate Haversine Distance between two lat/lng coordinates in km
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// 1. Mongoose Schemas
const UserSchema = new mongoose.Schema({
  shopName: { type: String, required: true, unique: true },
  ownerName: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  location: { type: String, required: true },
  password: { type: String, required: true },
  panNumber: { type: String, required: true, unique: true },
  lat: { type: Number, default: 27.7172 },
  lng: { type: Number, default: 85.3240 },
  pharmacyLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [85.3240, 27.7172] } // [lng, lat]
  },
  isActive: { type: Boolean, default: true },
  isAdmin: { type: Boolean, default: false }
});
UserSchema.index({ pharmacyLocation: '2dsphere' });

const MedicineSchema = new mongoose.Schema({
  pharmacyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  medicineName: { type: String, required: true, index: true },
  category: { type: String },
  status: { type: String, enum: ['Available', 'Out_of_Stock'], default: 'Available' },
  reportCount: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
  isFlagged: { type: Boolean, default: false }
});

export const UserModel = (mongoose.models.User || mongoose.model("User", UserSchema)) as any;
export const MedicineModel = (mongoose.models.Medicine || mongoose.model("Medicine", MedicineSchema)) as any;

// 2. Local File Fallback Engine
const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const MEDICINES_FILE = path.join(DATA_DIR, "medicines.json");

function ensureDataFiles() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(MEDICINES_FILE)) {
    fs.writeFileSync(MEDICINES_FILE, JSON.stringify([], null, 2));
  }
}

function readUsersLocal(): any[] {
  ensureDataFiles();
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
  } catch (e) {
    return [];
  }
}

function writeUsersLocal(users: any[]) {
  ensureDataFiles();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function readMedicinesLocal(): any[] {
  ensureDataFiles();
  try {
    return JSON.parse(fs.readFileSync(MEDICINES_FILE, "utf-8"));
  } catch (e) {
    return [];
  }
}

function writeMedicinesLocal(medicines: any[]) {
  ensureDataFiles();
  fs.writeFileSync(MEDICINES_FILE, JSON.stringify(medicines, null, 2));
}

// 2.5 Seeding Demo Data for Presentation & Admin Account
export async function seedDemoData() {
  try {
    const adminPasswordHash = await bcrypt.hash("Admin@2026", 10);
    const demoPasswordHash = await bcrypt.hash("password123", 10);

    if (isConnected) {
      // Ensure Admin Account
      const adminExists = await (UserModel as any).findOne({ phone: "admin@ausadhi.com" });
      if (!adminExists) {
        await (UserModel as any).create({
          shopName: "Ausadhi System Administration",
          ownerName: "Super Admin",
          phone: "admin@ausadhi.com",
          location: "Kathmandu Central Office",
          password: adminPasswordHash,
          panNumber: "0000000000",
          lat: 27.7172,
          lng: 85.3240,
          pharmacyLocation: { type: "Point", coordinates: [85.3240, 27.7172] },
          isActive: true,
          isAdmin: true
        });
      } else if (!adminExists.panNumber) {
        await (UserModel as any).updateOne({ _id: adminExists._id }, { $set: { panNumber: "0000000000" } });
      }

      const count = await (UserModel as any).countDocuments({ isAdmin: false });
      if (count > 0) return;

      console.log("Seeding demo pharmacies and medicines...");
      const demoUsers = [
        {
          shopName: "Sanjivani Pharmacy",
          ownerName: "Hari Sharma",
          phone: "9851012345",
          location: "New Road, Kathmandu",
          password: demoPasswordHash,
          panNumber: "1111111111",
          lat: 27.7033,
          lng: 85.3115,
          pharmacyLocation: { type: "Point", coordinates: [85.3115, 27.7033] },
          isActive: true,
          isAdmin: false
        },
        {
          shopName: "Alka Pharmacy",
          ownerName: "Sita Dahal",
          phone: "9841234567",
          location: "Jawalakhel, Lalitpur",
          password: demoPasswordHash,
          panNumber: "2222222222",
          lat: 27.6744,
          lng: 85.3123,
          pharmacyLocation: { type: "Point", coordinates: [85.3123, 27.6744] },
          isActive: true,
          isAdmin: false
        },
        {
          shopName: "City Care Pharmacy",
          ownerName: "Kiran Gurung",
          phone: "9801234567",
          location: "Lakeside, Pokhara",
          password: demoPasswordHash,
          panNumber: "3333333333",
          lat: 28.2096,
          lng: 83.9576,
          pharmacyLocation: { type: "Point", coordinates: [83.9576, 28.2096] },
          isActive: true,
          isAdmin: false
        }
      ];

      const createdUsers = await (UserModel as any).insertMany(demoUsers);

      const demoMedicines = [
        { pharmacyId: createdUsers[0]._id, medicineName: "Paracetamol 500mg", category: "Analgesic", status: "Available" },
        { pharmacyId: createdUsers[0]._id, medicineName: "Amoxicillin 250mg", category: "Antibiotic", status: "Available" },
        { pharmacyId: createdUsers[0]._id, medicineName: "Cetirizine 10mg", category: "Antihistamine", status: "Out_of_Stock" },
        { pharmacyId: createdUsers[1]._id, medicineName: "Paracetamol 500mg", category: "Analgesic", status: "Available" },
        { pharmacyId: createdUsers[1]._id, medicineName: "Metformin 500mg", category: "Antidiabetic", status: "Available" },
        { pharmacyId: createdUsers[2]._id, medicineName: "Pantoprazole 40mg", category: "Antacid", status: "Available" }
      ];

      await (MedicineModel as any).insertMany(demoMedicines);
      console.log("Demo seed completed successfully.");
    } else {
      let users = readUsersLocal();
      let admin = users.find(u => u.phone === "admin@ausadhi.com");
      if (!admin) {
        admin = {
          _id: "admin_user_001",
          shopName: "Ausadhi System Administration",
          ownerName: "Super Admin",
          phone: "admin@ausadhi.com",
          location: "Kathmandu Central Office",
          password: adminPasswordHash,
          panNumber: "0000000000",
          lat: 27.7172,
          lng: 85.3240,
          isActive: true,
          isAdmin: true
        };
        users.push(admin);
        writeUsersLocal(users);
      } else if (!admin.panNumber) {
        admin.panNumber = "0000000000";
        writeUsersLocal(users);
      }

      if (users.filter(u => !u.isAdmin).length > 0) return;

      const p1Id = "user_demo_1";
      const p2Id = "user_demo_2";
      const p3Id = "user_demo_3";

      const demoUsers = [
        { _id: p1Id, shopName: "Sanjivani Pharmacy", ownerName: "Hari Sharma", phone: "9851012345", location: "New Road, Kathmandu", password: demoPasswordHash, panNumber: "1111111111", lat: 27.7033, lng: 85.3115, isActive: true, isAdmin: false },
        { _id: p2Id, shopName: "Alka Pharmacy", ownerName: "Sita Dahal", phone: "9841234567", location: "Jawalakhel, Lalitpur", password: demoPasswordHash, panNumber: "2222222222", lat: 27.6744, lng: 85.3123, isActive: true, isAdmin: false },
        { _id: p3Id, shopName: "City Care Pharmacy", ownerName: "Kiran Gurung", phone: "9801234567", location: "Lakeside, Pokhara", password: demoPasswordHash, panNumber: "3333333333", lat: 28.2096, lng: 83.9576, isActive: true, isAdmin: false }
      ];

      users = [...users, ...demoUsers];
      writeUsersLocal(users);

      const demoMeds = [
        { _id: "med_1", pharmacyId: p1Id, medicineName: "Paracetamol 500mg", category: "Analgesic", status: "Available", reportCount: 0, lastUpdated: new Date().toISOString() },
        { _id: "med_2", pharmacyId: p1Id, medicineName: "Amoxicillin 250mg", category: "Antibiotic", status: "Available", reportCount: 0, lastUpdated: new Date().toISOString() },
        { _id: "med_3", pharmacyId: p1Id, medicineName: "Cetirizine 10mg", category: "Antihistamine", status: "Out_of_Stock", reportCount: 0, lastUpdated: new Date().toISOString() },
        { _id: "med_4", pharmacyId: p2Id, medicineName: "Paracetamol 500mg", category: "Analgesic", status: "Available", reportCount: 0, lastUpdated: new Date().toISOString() },
        { _id: "med_5", pharmacyId: p2Id, medicineName: "Metformin 500mg", category: "Antidiabetic", status: "Available", reportCount: 0, lastUpdated: new Date().toISOString() },
        { _id: "med_6", pharmacyId: p3Id, medicineName: "Pantoprazole 40mg", category: "Antacid", status: "Available", reportCount: 0, lastUpdated: new Date().toISOString() }
      ];

      writeMedicinesLocal(demoMeds);
      console.log("Demo seed completed successfully.");
    }
  } catch (err) {
    console.error("Seeding error:", err);
  }
}

// 3. Unified DB Access Methods
export const db = {
  // --- USER OPERATIONS ---
  async findUserByPhone(phone: string) {
    if (isConnected) {
      return await (UserModel as any).findOne({ phone }).lean();
    } else {
      const users = readUsersLocal();
      return users.find(u => u.phone === phone) || null;
    }
  },

  async findUserByPan(panNumber: string) {
    if (isConnected) {
      return await (UserModel as any).findOne({ panNumber }).lean();
    } else {
      const users = readUsersLocal();
      return users.find(u => u.panNumber === panNumber) || null;
    }
  },

  async findUserByShopName(shopName: string) {
    if (isConnected) {
      return await (UserModel as any).findOne({ shopName }).lean();
    } else {
      const users = readUsersLocal();
      return users.find(u => u.shopName.toLowerCase() === shopName.toLowerCase()) || null;
    }
  },

  async findUserById(id: string) {
    if (isConnected) {
      if (!mongoose.Types.ObjectId.isValid(id)) return null;
      return await (UserModel as any).findById(id).lean();
    } else {
      const users = readUsersLocal();
      return users.find(u => u._id === id) || null;
    }
  },

  async createUser(userData: any) {
    const lat = userData.lat || 27.7172;
    const lng = userData.lng || 85.3240;
    if (isConnected) {
      const user = new (UserModel as any)({
        ...userData,
        lat,
        lng,
        pharmacyLocation: { type: "Point", coordinates: [lng, lat] },
        isActive: true,
        isAdmin: false
      });
      await user.save();
      return user.toObject();
    } else {
      const users = readUsersLocal();
      const newUser = {
        _id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        ...userData,
        lat,
        lng,
        isActive: true,
        isAdmin: false
      };
      users.push(newUser);
      writeUsersLocal(users);
      return newUser;
    }
  },

  // --- MEDICINE SEARCH & FILTERS ---
  async searchMedicines(query: string, filters?: { lat?: number; lng?: number; timeFilter?: string; statusFilter?: string }) {
    const regex = new RegExp(query, "i");
    let mapped: any[] = [];

    if (isConnected) {
      const dbQuery: any = {
        $or: [
          { medicineName: { $regex: regex } },
          { category: { $regex: regex } }
        ]
      };

      if (filters?.statusFilter && filters.statusFilter !== "all") {
        dbQuery.status = filters.statusFilter;
      }

      if (filters?.timeFilter && filters.timeFilter !== "any") {
        const now = new Date();
        if (filters.timeFilter === "24h") {
          dbQuery.lastUpdated = { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) };
        } else if (filters.timeFilter === "7d") {
          dbQuery.lastUpdated = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
        } else if (filters.timeFilter === "30d") {
          dbQuery.lastUpdated = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
        }
      }

      const meds = await (MedicineModel as any).find(dbQuery).populate('pharmacyId', 'shopName phone location lat lng isActive').lean();

      mapped = (meds as any[])
        .filter((m: any) => m.pharmacyId && m.pharmacyId.isActive !== false)
        .map((m: any) => {
          let distanceKm: number | undefined = undefined;
          if (filters?.lat && filters?.lng && m.pharmacyId?.lat && m.pharmacyId?.lng) {
            distanceKm = calculateDistanceKm(filters.lat, filters.lng, m.pharmacyId.lat, m.pharmacyId.lng);
          }
          return {
            _id: m._id.toString(),
            pharmacyId: m.pharmacyId._id.toString(),
            medicineName: m.medicineName,
            category: m.category,
            status: m.status,
            reportCount: m.reportCount,
            lastUpdated: m.lastUpdated,
            isFlagged: m.isFlagged || false,
            distanceKm,
            pharmacy: {
              shopName: m.pharmacyId.shopName,
              phone: m.pharmacyId.phone,
              location: m.pharmacyId.location,
              lat: m.pharmacyId.lat,
              lng: m.pharmacyId.lng
            }
          };
        });
    } else {
      const meds = readMedicinesLocal();
      const users = readUsersLocal();

      mapped = meds
        .filter(m => {
          const matchesQuery = (m.medicineName && m.medicineName.match(regex)) || (m.category && m.category.match(regex));
          if (!matchesQuery) return false;

          const pharmacy = users.find(u => u._id === m.pharmacyId);
          if (!pharmacy || pharmacy.isActive === false) return false;

          if (filters?.statusFilter && filters.statusFilter !== "all" && m.status !== filters.statusFilter) {
            return false;
          }

          if (filters?.timeFilter && filters.timeFilter !== "any") {
            const medDate = new Date(m.lastUpdated).getTime();
            const now = Date.now();
            if (filters.timeFilter === "24h" && now - medDate > 24 * 60 * 60 * 1000) return false;
            if (filters.timeFilter === "7d" && now - medDate > 7 * 24 * 60 * 60 * 1000) return false;
            if (filters.timeFilter === "30d" && now - medDate > 30 * 24 * 60 * 60 * 1000) return false;
          }

          return true;
        })
        .map(m => {
          const pharmacy = users.find(u => u._id === m.pharmacyId);
          let distanceKm: number | undefined = undefined;
          if (filters?.lat && filters?.lng && pharmacy?.lat && pharmacy?.lng) {
            distanceKm = calculateDistanceKm(filters.lat, filters.lng, pharmacy.lat, pharmacy.lng);
          }
          return {
            _id: m._id,
            pharmacyId: m.pharmacyId,
            medicineName: m.medicineName,
            category: m.category,
            status: m.status,
            reportCount: m.reportCount,
            lastUpdated: m.lastUpdated,
            isFlagged: m.isFlagged || false,
            distanceKm,
            pharmacy: pharmacy ? {
              shopName: pharmacy.shopName,
              phone: pharmacy.phone,
              location: pharmacy.location,
              lat: pharmacy.lat,
              lng: pharmacy.lng
            } : null
          };
        });
    }

    if (filters?.lat && filters?.lng) {
      mapped.sort((a, b) => (a.distanceKm ?? 999999) - (b.distanceKm ?? 999999));
    }

    return mapped;
  },

  async findMedicinesByPharmacyId(pharmacyId: string) {
    if (isConnected) {
      return await (MedicineModel as any).find({ pharmacyId }).lean();
    } else {
      const meds = readMedicinesLocal();
      return meds.filter(m => m.pharmacyId === pharmacyId);
    }
  },

  async createMedicine(medicineData: { pharmacyId: string; medicineName: string; category?: string }) {
    if (isConnected) {
      const pId = mongoose.Types.ObjectId.isValid(medicineData.pharmacyId)
        ? new mongoose.Types.ObjectId(medicineData.pharmacyId)
        : new mongoose.Types.ObjectId();
      const med = new (MedicineModel as any)({
        pharmacyId: pId,
        medicineName: medicineData.medicineName,
        category: medicineData.category,
        status: 'Available',
        reportCount: 0,
        lastUpdated: new Date()
      });
      await med.save();
      return med.toObject();
    } else {
      const meds = readMedicinesLocal();
      const newMed = {
        _id: `med_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        pharmacyId: medicineData.pharmacyId,
        medicineName: medicineData.medicineName,
        category: medicineData.category || "General",
        status: 'Available',
        reportCount: 0,
        lastUpdated: new Date().toISOString()
      };
      meds.push(newMed);
      writeMedicinesLocal(meds);
      return newMed;
    }
  },

  async createMedicinesBulk(medicines: { pharmacyId: string; medicineName: string; category?: string }[]) {
    if (isConnected) {
      const docs = medicines.map(m => {
        const pId = mongoose.Types.ObjectId.isValid(m.pharmacyId)
          ? new mongoose.Types.ObjectId(m.pharmacyId)
          : new mongoose.Types.ObjectId();
        return {
          pharmacyId: pId,
          medicineName: m.medicineName,
          category: m.category || "General",
          status: 'Available',
          reportCount: 0,
          lastUpdated: new Date()
        };
      });
      const result = await (MedicineModel as any).insertMany(docs as any[]);
      return result.length;
    } else {
      const meds = readMedicinesLocal();
      const added: any[] = [];
      medicines.forEach(m => {
        const newMed = {
          _id: `med_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          pharmacyId: m.pharmacyId,
          medicineName: m.medicineName,
          category: m.category || "General",
          status: 'Available',
          reportCount: 0,
          lastUpdated: new Date().toISOString()
        };
        meds.push(newMed);
        added.push(newMed);
      });
      writeMedicinesLocal(meds);
      return added.length;
    }
  },

  async updateMedicineStatus(id: string, status: string, pharmacyId: string) {
    if (isConnected) {
      if (!mongoose.Types.ObjectId.isValid(id)) return null;
      const med = await (MedicineModel as any).findById(id);
      if (!med) return null;
      if (med.pharmacyId.toString() !== pharmacyId) {
        throw new Error("FORBIDDEN");
      }
      med.status = status;
      med.lastUpdated = new Date();
      await med.save();
      return med.toObject();
    } else {
      const meds = readMedicinesLocal();
      const index = meds.findIndex(m => m._id === id);
      if (index === -1) return null;
      if (meds[index].pharmacyId !== pharmacyId) {
        throw new Error("FORBIDDEN");
      }
      meds[index].status = status;
      meds[index].lastUpdated = new Date().toISOString();
      writeMedicinesLocal(meds);
      return meds[index];
    }
  },

  async incrementMedicineReport(id: string) {
    if (isConnected) {
      if (!mongoose.Types.ObjectId.isValid(id)) return null;
      const med: any = await (MedicineModel as any).findByIdAndUpdate(
        id,
        { $inc: { reportCount: 1 } },
        { new: true }
      );
      if (!med) return null;
      return typeof med.toObject === "function" ? med.toObject() : med;
    } else {
      const meds = readMedicinesLocal();
      const index = meds.findIndex(m => m._id === id);
      if (index === -1) return null;
      meds[index].reportCount = (meds[index].reportCount || 0) + 1;
      writeMedicinesLocal(meds);
      return meds[index];
    }
  },

  // --- ADMIN OPERATIONS ---
  async getAdminStats() {
    if (isConnected) {
      const totalPharmacies = await (UserModel as any).countDocuments({ isAdmin: false });
      const totalMedicines = await (MedicineModel as any).countDocuments();
      const availableMedicines = await (MedicineModel as any).countDocuments({ status: 'Available' });
      const outOfStockMedicines = await (MedicineModel as any).countDocuments({ status: 'Out_of_Stock' });
      const reports = await (MedicineModel as any).aggregate([
        { $group: { _id: null, total: { $sum: "$reportCount" } } }
      ]);
      const totalReports = reports.length > 0 ? reports[0].total : 0;

      return { totalPharmacies, totalMedicines, availableMedicines, outOfStockMedicines, totalReports };
    } else {
      const users = readUsersLocal();
      const meds = readMedicinesLocal();
      const totalPharmacies = users.filter(u => !u.isAdmin).length;
      const totalMedicines = meds.length;
      const availableMedicines = meds.filter(m => m.status === 'Available').length;
      const outOfStockMedicines = meds.filter(m => m.status === 'Out_of_Stock').length;
      const totalReports = meds.reduce((acc, m) => acc + (m.reportCount || 0), 0);

      return { totalPharmacies, totalMedicines, availableMedicines, outOfStockMedicines, totalReports };
    }
  },

  async getAllUsers() {
    if (isConnected) {
      return await (UserModel as any).find({ isAdmin: false }).select('-password').lean();
    } else {
      const users = readUsersLocal();
      return users.filter(u => !u.isAdmin).map(({ password, ...rest }) => rest);
    }
  },

  async toggleUserActiveStatus(id: string) {
    if (isConnected) {
      if (!mongoose.Types.ObjectId.isValid(id)) return null;
      const user = await (UserModel as any).findById(id);
      if (!user) return null;
      user.isActive = user.isActive === false ? true : false;
      await user.save();
      return user.toObject();
    } else {
      const users = readUsersLocal();
      const index = users.findIndex(u => u._id === id);
      if (index === -1) return null;
      users[index].isActive = users[index].isActive === false ? true : false;
      writeUsersLocal(users);
      return users[index];
    }
  },

  async deleteUser(id: string) {
    if (isConnected) {
      if (!mongoose.Types.ObjectId.isValid(id)) return false;
      await (UserModel as any).findByIdAndDelete(id);
      await (MedicineModel as any).deleteMany({ pharmacyId: id });
      return true;
    } else {
      let users = readUsersLocal();
      users = users.filter(u => u._id !== id);
      writeUsersLocal(users);

      let meds = readMedicinesLocal();
      meds = meds.filter(m => m.pharmacyId !== id);
      writeMedicinesLocal(meds);
      return true;
    }
  },

  async getAllMedicinesAdmin() {
    if (isConnected) {
      const meds = await (MedicineModel as any).find().populate('pharmacyId', 'shopName location phone').lean();
      return (meds as any[]).map((m: any) => ({
        _id: m._id.toString(),
        medicineName: m.medicineName,
        category: m.category,
        status: m.status,
        reportCount: m.reportCount,
        lastUpdated: m.lastUpdated,
        isFlagged: m.isFlagged || false,
        pharmacy: m.pharmacyId ? {
          shopName: m.pharmacyId.shopName,
          phone: m.pharmacyId.phone,
          location: m.pharmacyId.location
        } : null
      }));
    } else {
      const meds = readMedicinesLocal();
      const users = readUsersLocal();
      return meds.map(m => {
        const p = users.find(u => u._id === m.pharmacyId);
        return {
          _id: m._id,
          medicineName: m.medicineName,
          category: m.category,
          status: m.status,
          reportCount: m.reportCount,
          lastUpdated: m.lastUpdated,
          isFlagged: m.isFlagged || false,
          pharmacy: p ? { shopName: p.shopName, phone: p.phone, location: p.location } : null
        };
      });
    }
  },

  async toggleMedicineFlag(id: string) {
    if (isConnected) {
      if (!mongoose.Types.ObjectId.isValid(id)) return null;
      const med = await (MedicineModel as any).findById(id);
      if (!med) return null;
      med.isFlagged = !med.isFlagged;
      await med.save();
      return med.toObject();
    } else {
      const meds = readMedicinesLocal();
      const index = meds.findIndex(m => m._id === id);
      if (index === -1) return null;
      meds[index].isFlagged = !meds[index].isFlagged;
      writeMedicinesLocal(meds);
      return meds[index];
    }
  },

  async deleteMedicine(id: string) {
    if (isConnected) {
      if (!mongoose.Types.ObjectId.isValid(id)) return false;
      await (MedicineModel as any).findByIdAndDelete(id);
      return true;
    } else {
      let meds = readMedicinesLocal();
      meds = meds.filter(m => m._id !== id);
      writeMedicinesLocal(meds);
      return true;
    }
  },

  async updateAdminPassword(adminId: string, newPasswordHash: string) {
    if (isConnected) {
      await (UserModel as any).findByIdAndUpdate(adminId, { password: newPasswordHash });
      return true;
    } else {
      const users = readUsersLocal();
      const index = users.findIndex(u => u._id === adminId || u.phone === "admin@ausadhi.com");
      if (index !== -1) {
        users[index].password = newPasswordHash;
        writeUsersLocal(users);
      }
      return true;
    }
  }
};
