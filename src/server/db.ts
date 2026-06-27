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

// 1. Mongoose Schemas (Required by the Prompt)
const UserSchema = new mongoose.Schema({
  shopName: { type: String, required: true, unique: true },
  ownerName: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  location: { type: String, required: true },
  password: { type: String, required: true }
});

const MedicineSchema = new mongoose.Schema({
  pharmacyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  medicineName: { type: String, required: true, index: true },
  category: { type: String },
  status: { type: String, enum: ['Available', 'Out_of_Stock'], default: 'Available' },
  reportCount: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
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

// 2.5 Seeding Demo Data for Presentation
export async function seedDemoData() {
  try {
    // Check if we already have users
    let hasUsers = false;
    if (isConnected) {
      const count = await (UserModel as any).countDocuments();
      hasUsers = count > 0;
    } else {
      const users = readUsersLocal();
      hasUsers = users.length > 0;
    }

    if (hasUsers) {
      console.log("Database already contains data. Skipping demo seed.");
      return;
    }

    console.log("Database is empty. Seeding demo pharmacies and medicines for presentation...");

    // Password hash for 'password123'
    const hashedPassword = await bcrypt.hash("password123", 10);

    // Define 3 Pharmacies
    const demoPharmacies = [
      {
        shopName: "Sewa Pharmacy",
        ownerName: "Hari Sharma",
        phone: "9851012345",
        location: "New Road, Kathmandu",
        password: hashedPassword
      },
      {
        shopName: "Pathibhara Pharma",
        ownerName: "Sita Dahal",
        phone: "9841234567",
        location: "Mahendrapath, Dharan",
        password: hashedPassword
      },
      {
        shopName: "Annapurna Medical Hall",
        ownerName: "Kiran Gurung",
        phone: "9801234567",
        location: "Chipledhunga, Pokhara",
        password: hashedPassword
      }
    ];

    const createdPharmacies: any[] = [];

    if (isConnected) {
      for (const p of demoPharmacies) {
        const u = new (UserModel as any)(p);
        await u.save();
        createdPharmacies.push(u.toObject());
      }
    } else {
      const users = readUsersLocal();
      for (const p of demoPharmacies) {
        const newUser = {
          _id: `user_demo_${p.phone}`,
          ...p
        };
        users.push(newUser);
        createdPharmacies.push(newUser);
      }
      writeUsersLocal(users);
    }

    // Define Medicines for each pharmacy
    const p1 = createdPharmacies[0]; // Sewa Pharmacy
    const p2 = createdPharmacies[1]; // Pathibhara Pharma
    const p3 = createdPharmacies[2]; // Annapurna Medical Hall

    const demoMedicines = [
      // Sewa Pharmacy medicines
      {
        pharmacyId: p1._id,
        medicineName: "Paracetamol 500mg",
        category: "Analgesic",
        status: "Available",
        reportCount: 0
      },
      {
        pharmacyId: p1._id,
        medicineName: "Amoxicillin 250mg",
        category: "Antibiotic",
        status: "Available",
        reportCount: 4 // Note: >= 3 reports triggers red alert!
      },
      {
        pharmacyId: p1._id,
        medicineName: "Cetirizine 10mg",
        category: "Antihistamine",
        status: "Out_of_Stock",
        reportCount: 1
      },
      {
        pharmacyId: p1._id,
        medicineName: "Amlodipine 5mg",
        category: "Cardiovascular",
        status: "Available",
        reportCount: 0
      },

      // Pathibhara Pharma medicines
      {
        pharmacyId: p2._id,
        medicineName: "Flexon Tablet",
        category: "Painkiller",
        status: "Available",
        reportCount: 0
      },
      {
        pharmacyId: p2._id,
        medicineName: "Pantoprazole 40mg",
        category: "Gastrointestinal",
        status: "Available",
        reportCount: 0
      },
      {
        pharmacyId: p2._id,
        medicineName: "Metformin 500mg",
        category: "Antidiabetic",
        status: "Out_of_Stock",
        reportCount: 0
      },

      // Annapurna Medical Hall medicines
      {
        pharmacyId: p3._id,
        medicineName: "Paracetamol 500mg",
        category: "Analgesic",
        status: "Out_of_Stock",
        reportCount: 0
      },
      {
        pharmacyId: p3._id,
        medicineName: "Ibuprofen 400mg",
        category: "Analgesic",
        status: "Available",
        reportCount: 0
      },
      {
        pharmacyId: p3._id,
        medicineName: "Azithromycin 500mg",
        category: "Antibiotic",
        status: "Available",
        reportCount: 0
      }
    ];

    if (isConnected) {
      for (const m of demoMedicines) {
        const pId = mongoose.Types.ObjectId.isValid(m.pharmacyId)
          ? new mongoose.Types.ObjectId(m.pharmacyId)
          : new mongoose.Types.ObjectId();
        const med = new (MedicineModel as any)({
          ...m,
          pharmacyId: pId,
          lastUpdated: new Date()
        });
        await med.save();
      }
    } else {
      const meds = readMedicinesLocal();
      for (const m of demoMedicines) {
        const newMed = {
          _id: `med_demo_${m.pharmacyId}_${m.medicineName.replace(/\s+/g, "_")}`,
          ...m,
          lastUpdated: new Date().toISOString()
        };
        meds.push(newMed);
      }
      writeMedicinesLocal(meds);
    }

    console.log("Demo seed completed successfully.");
  } catch (err) {
    console.error("Seeding failed:", err);
  }
}

// 3. Unified DB Access Methods (MongoDB with File Fallback)
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
    if (isConnected) {
      const user = new (UserModel as any)(userData);
      await user.save();
      return user.toObject();
    } else {
      const users = readUsersLocal();
      const newUser = {
        _id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        ...userData
      };
      users.push(newUser);
      writeUsersLocal(users);
      return newUser;
    }
  },

  // --- MEDICINE OPERATIONS ---
  async searchMedicines(query: string) {
    const regex = new RegExp(query, "i");
    if (isConnected) {
      // Find matching medicines and populate owner details
      const meds = await (MedicineModel as any).find({
        $or: [
          { medicineName: { $regex: regex } },
          { category: { $regex: regex } }
        ]
      }).populate('pharmacyId', 'shopName phone location').lean();
      
      return (meds as any[]).map((m: any) => ({
        _id: m._id.toString(),
        medicineName: m.medicineName,
        category: m.category,
        status: m.status,
        reportCount: m.reportCount,
        lastUpdated: m.lastUpdated,
        pharmacy: m.pharmacyId ? {
          shopName: m.pharmacyId.shopName,
          phone: m.pharmacyId.phone,
          location: m.pharmacyId.location
        } : null
      }));
    } else {
      const meds = readMedicinesLocal();
      const users = readUsersLocal();
      
      const filtered = meds.filter(m => 
        (m.medicineName && m.medicineName.match(regex)) || 
        (m.category && m.category.match(regex))
      );

      return filtered.map(m => {
        const p = users.find(u => u._id === m.pharmacyId);
        return {
          _id: m._id,
          medicineName: m.medicineName,
          category: m.category,
          status: m.status,
          reportCount: m.reportCount,
          lastUpdated: m.lastUpdated,
          pharmacy: p ? {
            shopName: p.shopName,
            phone: p.phone,
            location: p.location
          } : null
        };
      });
    }
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
      // First find it to verify ownership
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
  }
};
