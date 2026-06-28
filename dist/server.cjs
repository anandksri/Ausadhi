var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path2 = __toESM(require("path"), 1);
var import_cors = __toESM(require("cors"), 1);
var import_bcryptjs2 = __toESM(require("bcryptjs"), 1);
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
var import_multer = __toESM(require("multer"), 1);
var XLSX = __toESM(require("xlsx"), 1);
var import_vite = require("vite");

// src/server/db.ts
var import_mongoose = __toESM(require("mongoose"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var import_bcryptjs = __toESM(require("bcryptjs"), 1);
var MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
var isConnected = false;
async function connectDB() {
  if (!MONGO_URI) {
    console.log("MONGO_URI not provided. Running in high-performance local JSON-file fallback mode.");
    isConnected = false;
    await seedDemoData();
    return false;
  }
  try {
    await import_mongoose.default.connect(MONGO_URI);
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
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}
var UserSchema = new import_mongoose.default.Schema({
  shopName: { type: String, required: true, unique: true },
  ownerName: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  location: { type: String, required: true },
  password: { type: String, required: true },
  lat: { type: Number, default: 27.7172 },
  lng: { type: Number, default: 85.324 },
  pharmacyLocation: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], default: [85.324, 27.7172] }
    // [lng, lat]
  },
  isActive: { type: Boolean, default: true },
  isAdmin: { type: Boolean, default: false }
});
UserSchema.index({ pharmacyLocation: "2dsphere" });
var MedicineSchema = new import_mongoose.default.Schema({
  pharmacyId: { type: import_mongoose.default.Schema.Types.ObjectId, ref: "User", required: true },
  medicineName: { type: String, required: true, index: true },
  category: { type: String },
  status: { type: String, enum: ["Available", "Out_of_Stock"], default: "Available" },
  reportCount: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
  isFlagged: { type: Boolean, default: false }
});
var UserModel = import_mongoose.default.models.User || import_mongoose.default.model("User", UserSchema);
var MedicineModel = import_mongoose.default.models.Medicine || import_mongoose.default.model("Medicine", MedicineSchema);
var DATA_DIR = import_path.default.join(process.cwd(), "data");
var USERS_FILE = import_path.default.join(DATA_DIR, "users.json");
var MEDICINES_FILE = import_path.default.join(DATA_DIR, "medicines.json");
function ensureDataFiles() {
  if (!import_fs.default.existsSync(DATA_DIR)) {
    import_fs.default.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!import_fs.default.existsSync(USERS_FILE)) {
    import_fs.default.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
  }
  if (!import_fs.default.existsSync(MEDICINES_FILE)) {
    import_fs.default.writeFileSync(MEDICINES_FILE, JSON.stringify([], null, 2));
  }
}
function readUsersLocal() {
  ensureDataFiles();
  try {
    return JSON.parse(import_fs.default.readFileSync(USERS_FILE, "utf-8"));
  } catch (e) {
    return [];
  }
}
function writeUsersLocal(users) {
  ensureDataFiles();
  import_fs.default.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}
function readMedicinesLocal() {
  ensureDataFiles();
  try {
    return JSON.parse(import_fs.default.readFileSync(MEDICINES_FILE, "utf-8"));
  } catch (e) {
    return [];
  }
}
function writeMedicinesLocal(medicines) {
  ensureDataFiles();
  import_fs.default.writeFileSync(MEDICINES_FILE, JSON.stringify(medicines, null, 2));
}
async function seedDemoData() {
  try {
    const adminPasswordHash = await import_bcryptjs.default.hash("Admin@2026", 10);
    const demoPasswordHash = await import_bcryptjs.default.hash("password123", 10);
    if (isConnected) {
      const adminExists = await UserModel.findOne({ phone: "admin@ausadhi.com" });
      if (!adminExists) {
        await UserModel.create({
          shopName: "Ausadhi System Administration",
          ownerName: "Super Admin",
          phone: "admin@ausadhi.com",
          location: "Kathmandu Central Office",
          password: adminPasswordHash,
          lat: 27.7172,
          lng: 85.324,
          pharmacyLocation: { type: "Point", coordinates: [85.324, 27.7172] },
          isActive: true,
          isAdmin: true
        });
      }
      const count = await UserModel.countDocuments({ isAdmin: false });
      if (count > 0) return;
      console.log("Seeding demo pharmacies and medicines...");
      const demoUsers = [
        {
          shopName: "Sanjivani Pharmacy",
          ownerName: "Hari Sharma",
          phone: "9851012345",
          location: "New Road, Kathmandu",
          password: demoPasswordHash,
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
          lat: 28.2096,
          lng: 83.9576,
          pharmacyLocation: { type: "Point", coordinates: [83.9576, 28.2096] },
          isActive: true,
          isAdmin: false
        }
      ];
      const createdUsers = await UserModel.insertMany(demoUsers);
      const demoMedicines = [
        { pharmacyId: createdUsers[0]._id, medicineName: "Paracetamol 500mg", category: "Analgesic", status: "Available" },
        { pharmacyId: createdUsers[0]._id, medicineName: "Amoxicillin 250mg", category: "Antibiotic", status: "Available" },
        { pharmacyId: createdUsers[0]._id, medicineName: "Cetirizine 10mg", category: "Antihistamine", status: "Out_of_Stock" },
        { pharmacyId: createdUsers[1]._id, medicineName: "Paracetamol 500mg", category: "Analgesic", status: "Available" },
        { pharmacyId: createdUsers[1]._id, medicineName: "Metformin 500mg", category: "Antidiabetic", status: "Available" },
        { pharmacyId: createdUsers[2]._id, medicineName: "Pantoprazole 40mg", category: "Antacid", status: "Available" }
      ];
      await MedicineModel.insertMany(demoMedicines);
      console.log("Demo seed completed successfully.");
    } else {
      let users = readUsersLocal();
      let admin = users.find((u) => u.phone === "admin@ausadhi.com");
      if (!admin) {
        admin = {
          _id: "admin_user_001",
          shopName: "Ausadhi System Administration",
          ownerName: "Super Admin",
          phone: "admin@ausadhi.com",
          location: "Kathmandu Central Office",
          password: adminPasswordHash,
          lat: 27.7172,
          lng: 85.324,
          isActive: true,
          isAdmin: true
        };
        users.push(admin);
        writeUsersLocal(users);
      }
      if (users.filter((u) => !u.isAdmin).length > 0) return;
      const p1Id = "user_demo_1";
      const p2Id = "user_demo_2";
      const p3Id = "user_demo_3";
      const demoUsers = [
        { _id: p1Id, shopName: "Sanjivani Pharmacy", ownerName: "Hari Sharma", phone: "9851012345", location: "New Road, Kathmandu", password: demoPasswordHash, lat: 27.7033, lng: 85.3115, isActive: true, isAdmin: false },
        { _id: p2Id, shopName: "Alka Pharmacy", ownerName: "Sita Dahal", phone: "9841234567", location: "Jawalakhel, Lalitpur", password: demoPasswordHash, lat: 27.6744, lng: 85.3123, isActive: true, isAdmin: false },
        { _id: p3Id, shopName: "City Care Pharmacy", ownerName: "Kiran Gurung", phone: "9801234567", location: "Lakeside, Pokhara", password: demoPasswordHash, lat: 28.2096, lng: 83.9576, isActive: true, isAdmin: false }
      ];
      users = [...users, ...demoUsers];
      writeUsersLocal(users);
      const demoMeds = [
        { _id: "med_1", pharmacyId: p1Id, medicineName: "Paracetamol 500mg", category: "Analgesic", status: "Available", reportCount: 0, lastUpdated: (/* @__PURE__ */ new Date()).toISOString() },
        { _id: "med_2", pharmacyId: p1Id, medicineName: "Amoxicillin 250mg", category: "Antibiotic", status: "Available", reportCount: 0, lastUpdated: (/* @__PURE__ */ new Date()).toISOString() },
        { _id: "med_3", pharmacyId: p1Id, medicineName: "Cetirizine 10mg", category: "Antihistamine", status: "Out_of_Stock", reportCount: 0, lastUpdated: (/* @__PURE__ */ new Date()).toISOString() },
        { _id: "med_4", pharmacyId: p2Id, medicineName: "Paracetamol 500mg", category: "Analgesic", status: "Available", reportCount: 0, lastUpdated: (/* @__PURE__ */ new Date()).toISOString() },
        { _id: "med_5", pharmacyId: p2Id, medicineName: "Metformin 500mg", category: "Antidiabetic", status: "Available", reportCount: 0, lastUpdated: (/* @__PURE__ */ new Date()).toISOString() },
        { _id: "med_6", pharmacyId: p3Id, medicineName: "Pantoprazole 40mg", category: "Antacid", status: "Available", reportCount: 0, lastUpdated: (/* @__PURE__ */ new Date()).toISOString() }
      ];
      writeMedicinesLocal(demoMeds);
      console.log("Demo seed completed successfully.");
    }
  } catch (err) {
    console.error("Seeding error:", err);
  }
}
var db = {
  // --- USER OPERATIONS ---
  async findUserByPhone(phone) {
    if (isConnected) {
      return await UserModel.findOne({ phone }).lean();
    } else {
      const users = readUsersLocal();
      return users.find((u) => u.phone === phone) || null;
    }
  },
  async findUserByShopName(shopName) {
    if (isConnected) {
      return await UserModel.findOne({ shopName }).lean();
    } else {
      const users = readUsersLocal();
      return users.find((u) => u.shopName.toLowerCase() === shopName.toLowerCase()) || null;
    }
  },
  async findUserById(id) {
    if (isConnected) {
      if (!import_mongoose.default.Types.ObjectId.isValid(id)) return null;
      return await UserModel.findById(id).lean();
    } else {
      const users = readUsersLocal();
      return users.find((u) => u._id === id) || null;
    }
  },
  async createUser(userData) {
    const lat = userData.lat || 27.7172;
    const lng = userData.lng || 85.324;
    if (isConnected) {
      const user = new UserModel({
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
  async searchMedicines(query, filters) {
    const regex = new RegExp(query, "i");
    let mapped = [];
    if (isConnected) {
      const dbQuery = {
        $or: [
          { medicineName: { $regex: regex } },
          { category: { $regex: regex } }
        ]
      };
      if (filters?.statusFilter && filters.statusFilter !== "all") {
        dbQuery.status = filters.statusFilter;
      }
      if (filters?.timeFilter && filters.timeFilter !== "any") {
        const now = /* @__PURE__ */ new Date();
        if (filters.timeFilter === "24h") {
          dbQuery.lastUpdated = { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1e3) };
        } else if (filters.timeFilter === "7d") {
          dbQuery.lastUpdated = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1e3) };
        } else if (filters.timeFilter === "30d") {
          dbQuery.lastUpdated = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1e3) };
        }
      }
      const meds = await MedicineModel.find(dbQuery).populate("pharmacyId", "shopName phone location lat lng isActive").lean();
      mapped = meds.filter((m) => m.pharmacyId && m.pharmacyId.isActive !== false).map((m) => {
        let distanceKm = void 0;
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
      mapped = meds.filter((m) => {
        const matchesQuery = m.medicineName && m.medicineName.match(regex) || m.category && m.category.match(regex);
        if (!matchesQuery) return false;
        const pharmacy = users.find((u) => u._id === m.pharmacyId);
        if (!pharmacy || pharmacy.isActive === false) return false;
        if (filters?.statusFilter && filters.statusFilter !== "all" && m.status !== filters.statusFilter) {
          return false;
        }
        if (filters?.timeFilter && filters.timeFilter !== "any") {
          const medDate = new Date(m.lastUpdated).getTime();
          const now = Date.now();
          if (filters.timeFilter === "24h" && now - medDate > 24 * 60 * 60 * 1e3) return false;
          if (filters.timeFilter === "7d" && now - medDate > 7 * 24 * 60 * 60 * 1e3) return false;
          if (filters.timeFilter === "30d" && now - medDate > 30 * 24 * 60 * 60 * 1e3) return false;
        }
        return true;
      }).map((m) => {
        const pharmacy = users.find((u) => u._id === m.pharmacyId);
        let distanceKm = void 0;
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
  async findMedicinesByPharmacyId(pharmacyId) {
    if (isConnected) {
      return await MedicineModel.find({ pharmacyId }).lean();
    } else {
      const meds = readMedicinesLocal();
      return meds.filter((m) => m.pharmacyId === pharmacyId);
    }
  },
  async createMedicine(medicineData) {
    if (isConnected) {
      const pId = import_mongoose.default.Types.ObjectId.isValid(medicineData.pharmacyId) ? new import_mongoose.default.Types.ObjectId(medicineData.pharmacyId) : new import_mongoose.default.Types.ObjectId();
      const med = new MedicineModel({
        pharmacyId: pId,
        medicineName: medicineData.medicineName,
        category: medicineData.category,
        status: "Available",
        reportCount: 0,
        lastUpdated: /* @__PURE__ */ new Date()
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
        status: "Available",
        reportCount: 0,
        lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
      };
      meds.push(newMed);
      writeMedicinesLocal(meds);
      return newMed;
    }
  },
  async createMedicinesBulk(medicines) {
    if (isConnected) {
      const docs = medicines.map((m) => {
        const pId = import_mongoose.default.Types.ObjectId.isValid(m.pharmacyId) ? new import_mongoose.default.Types.ObjectId(m.pharmacyId) : new import_mongoose.default.Types.ObjectId();
        return {
          pharmacyId: pId,
          medicineName: m.medicineName,
          category: m.category || "General",
          status: "Available",
          reportCount: 0,
          lastUpdated: /* @__PURE__ */ new Date()
        };
      });
      const result = await MedicineModel.insertMany(docs);
      return result.length;
    } else {
      const meds = readMedicinesLocal();
      const added = [];
      medicines.forEach((m) => {
        const newMed = {
          _id: `med_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          pharmacyId: m.pharmacyId,
          medicineName: m.medicineName,
          category: m.category || "General",
          status: "Available",
          reportCount: 0,
          lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
        };
        meds.push(newMed);
        added.push(newMed);
      });
      writeMedicinesLocal(meds);
      return added.length;
    }
  },
  async updateMedicineStatus(id, status, pharmacyId) {
    if (isConnected) {
      if (!import_mongoose.default.Types.ObjectId.isValid(id)) return null;
      const med = await MedicineModel.findById(id);
      if (!med) return null;
      if (med.pharmacyId.toString() !== pharmacyId) {
        throw new Error("FORBIDDEN");
      }
      med.status = status;
      med.lastUpdated = /* @__PURE__ */ new Date();
      await med.save();
      return med.toObject();
    } else {
      const meds = readMedicinesLocal();
      const index = meds.findIndex((m) => m._id === id);
      if (index === -1) return null;
      if (meds[index].pharmacyId !== pharmacyId) {
        throw new Error("FORBIDDEN");
      }
      meds[index].status = status;
      meds[index].lastUpdated = (/* @__PURE__ */ new Date()).toISOString();
      writeMedicinesLocal(meds);
      return meds[index];
    }
  },
  async incrementMedicineReport(id) {
    if (isConnected) {
      if (!import_mongoose.default.Types.ObjectId.isValid(id)) return null;
      const med = await MedicineModel.findByIdAndUpdate(
        id,
        { $inc: { reportCount: 1 } },
        { new: true }
      );
      if (!med) return null;
      return typeof med.toObject === "function" ? med.toObject() : med;
    } else {
      const meds = readMedicinesLocal();
      const index = meds.findIndex((m) => m._id === id);
      if (index === -1) return null;
      meds[index].reportCount = (meds[index].reportCount || 0) + 1;
      writeMedicinesLocal(meds);
      return meds[index];
    }
  },
  // --- ADMIN OPERATIONS ---
  async getAdminStats() {
    if (isConnected) {
      const totalPharmacies = await UserModel.countDocuments({ isAdmin: false });
      const totalMedicines = await MedicineModel.countDocuments();
      const availableMedicines = await MedicineModel.countDocuments({ status: "Available" });
      const outOfStockMedicines = await MedicineModel.countDocuments({ status: "Out_of_Stock" });
      const reports = await MedicineModel.aggregate([
        { $group: { _id: null, total: { $sum: "$reportCount" } } }
      ]);
      const totalReports = reports.length > 0 ? reports[0].total : 0;
      return { totalPharmacies, totalMedicines, availableMedicines, outOfStockMedicines, totalReports };
    } else {
      const users = readUsersLocal();
      const meds = readMedicinesLocal();
      const totalPharmacies = users.filter((u) => !u.isAdmin).length;
      const totalMedicines = meds.length;
      const availableMedicines = meds.filter((m) => m.status === "Available").length;
      const outOfStockMedicines = meds.filter((m) => m.status === "Out_of_Stock").length;
      const totalReports = meds.reduce((acc, m) => acc + (m.reportCount || 0), 0);
      return { totalPharmacies, totalMedicines, availableMedicines, outOfStockMedicines, totalReports };
    }
  },
  async getAllUsers() {
    if (isConnected) {
      return await UserModel.find({ isAdmin: false }).select("-password").lean();
    } else {
      const users = readUsersLocal();
      return users.filter((u) => !u.isAdmin).map(({ password, ...rest }) => rest);
    }
  },
  async toggleUserActiveStatus(id) {
    if (isConnected) {
      if (!import_mongoose.default.Types.ObjectId.isValid(id)) return null;
      const user = await UserModel.findById(id);
      if (!user) return null;
      user.isActive = user.isActive === false ? true : false;
      await user.save();
      return user.toObject();
    } else {
      const users = readUsersLocal();
      const index = users.findIndex((u) => u._id === id);
      if (index === -1) return null;
      users[index].isActive = users[index].isActive === false ? true : false;
      writeUsersLocal(users);
      return users[index];
    }
  },
  async deleteUser(id) {
    if (isConnected) {
      if (!import_mongoose.default.Types.ObjectId.isValid(id)) return false;
      await UserModel.findByIdAndDelete(id);
      await MedicineModel.deleteMany({ pharmacyId: id });
      return true;
    } else {
      let users = readUsersLocal();
      users = users.filter((u) => u._id !== id);
      writeUsersLocal(users);
      let meds = readMedicinesLocal();
      meds = meds.filter((m) => m.pharmacyId !== id);
      writeMedicinesLocal(meds);
      return true;
    }
  },
  async getAllMedicinesAdmin() {
    if (isConnected) {
      const meds = await MedicineModel.find().populate("pharmacyId", "shopName location phone").lean();
      return meds.map((m) => ({
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
      return meds.map((m) => {
        const p = users.find((u) => u._id === m.pharmacyId);
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
  async toggleMedicineFlag(id) {
    if (isConnected) {
      if (!import_mongoose.default.Types.ObjectId.isValid(id)) return null;
      const med = await MedicineModel.findById(id);
      if (!med) return null;
      med.isFlagged = !med.isFlagged;
      await med.save();
      return med.toObject();
    } else {
      const meds = readMedicinesLocal();
      const index = meds.findIndex((m) => m._id === id);
      if (index === -1) return null;
      meds[index].isFlagged = !meds[index].isFlagged;
      writeMedicinesLocal(meds);
      return meds[index];
    }
  },
  async deleteMedicine(id) {
    if (isConnected) {
      if (!import_mongoose.default.Types.ObjectId.isValid(id)) return false;
      await MedicineModel.findByIdAndDelete(id);
      return true;
    } else {
      let meds = readMedicinesLocal();
      meds = meds.filter((m) => m._id !== id);
      writeMedicinesLocal(meds);
      return true;
    }
  },
  async updateAdminPassword(adminId, newPasswordHash) {
    if (isConnected) {
      await UserModel.findByIdAndUpdate(adminId, { password: newPasswordHash });
      return true;
    } else {
      const users = readUsersLocal();
      const index = users.findIndex((u) => u._id === adminId || u.phone === "admin@ausadhi.com");
      if (index !== -1) {
        users[index].password = newPasswordHash;
        writeUsersLocal(users);
      }
      return true;
    }
  }
};

// server.ts
var app = (0, import_express.default)();
var PORT = 3e3;
var JWT_SECRET = process.env.JWT_SECRET || "ausadhi_secret_key_nepal_2026";
app.use((0, import_cors.default)());
app.use(import_express.default.json());
app.use(import_express.default.urlencoded({ extended: true }));
var upload = (0, import_multer.default)({
  storage: import_multer.default.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
  // 5MB limit
});
async function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Access token required. Please log in." });
  }
  try {
    const decoded = import_jsonwebtoken.default.verify(token, JWT_SECRET);
    req.user = decoded;
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
app.post("/api/auth/register", async (req, res) => {
  try {
    const { shopName, ownerName, phone, location, password } = req.body;
    if (!shopName || !ownerName || !phone || !location || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }
    const existingShop = await db.findUserByShopName(shopName);
    if (existingShop) {
      return res.status(400).json({ error: "A pharmacy with this shop name is already registered." });
    }
    const existingPhone = await db.findUserByPhone(phone);
    if (existingPhone) {
      return res.status(400).json({ error: "This phone number is already registered." });
    }
    const hashedPassword = await import_bcryptjs2.default.hash(password, 10);
    const newUser = await db.createUser({
      shopName,
      ownerName,
      phone,
      location,
      password: hashedPassword
    });
    const token = import_jsonwebtoken.default.sign(
      { userId: newUser._id, shopName: newUser.shopName },
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
        location: newUser.location
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Server error during registration." });
  }
});
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
    const isPasswordValid = await import_bcryptjs2.default.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid phone number or password." });
    }
    const token = import_jsonwebtoken.default.sign(
      { userId: user._id, shopName: user.shopName },
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
        location: user.location
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error during login." });
  }
});
app.get("/api/medicines/search", async (req, res) => {
  try {
    const query = req.query.q || "";
    const lat = req.query.lat ? parseFloat(req.query.lat) : void 0;
    const lng = req.query.lng ? parseFloat(req.query.lng) : void 0;
    const timeFilter = req.query.timeFilter;
    const statusFilter = req.query.statusFilter;
    const results = await db.searchMedicines(query, { lat, lng, timeFilter, statusFilter });
    res.json({ results });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Server error during search." });
  }
});
app.post("/api/medicines", authenticateToken, async (req, res) => {
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
  } catch (error) {
    console.error("Add medicine error:", error);
    res.status(500).json({ error: "Server error while adding medicine." });
  }
});
app.post("/api/medicines/bulk-upload", authenticateToken, upload.single("file"), async (req, res) => {
  try {
    const pharmacyId = req.user?.userId;
    if (!pharmacyId) {
      return res.status(401).json({ error: "Unauthorized access." });
    }
    if (!req.file) {
      return res.status(400).json({ error: "Please upload an Excel or CSV file." });
    }
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet);
    if (!rows || rows.length === 0) {
      return res.status(400).json({ error: "The uploaded file is empty or formatted incorrectly." });
    }
    const validMedicines = [];
    let skippedCount = 0;
    for (const row of rows) {
      const keys = Object.keys(row);
      const medicineNameKey = keys.find((k) => k.toLowerCase().replace(/\s+/g, "") === "medicinename");
      const categoryKey = keys.find((k) => k.toLowerCase().replace(/\s+/g, "") === "category");
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
    const addedCount = await db.createMedicinesBulk(validMedicines);
    res.json({
      message: `Successfully processed file.`,
      addedCount,
      skippedCount,
      warningMessage: skippedCount > 0 ? `${skippedCount} rows skipped due to missing medicine names.` : void 0
    });
  } catch (error) {
    console.error("Bulk upload error:", error);
    res.status(500).json({ error: "Server error while processing bulk upload." });
  }
});
app.put("/api/medicines/:id/status", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const pharmacyId = req.user?.userId;
    if (!pharmacyId) {
      return res.status(401).json({ error: "Unauthorized access." });
    }
    if (!status || !["Available", "Out_of_Stock"].includes(status)) {
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
    } catch (err) {
      if (err.message === "FORBIDDEN") {
        return res.status(403).json({ error: "Forbidden. You can only manage stock for your own pharmacy." });
      }
      throw err;
    }
  } catch (error) {
    console.error("Status update error:", error);
    res.status(500).json({ error: "Server error while updating status." });
  }
});
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
  } catch (error) {
    console.error("Report error:", error);
    res.status(500).json({ error: "Server error while reporting mismatch." });
  }
});
app.get("/api/medicines/my-inventory", authenticateToken, async (req, res) => {
  try {
    const pharmacyId = req.user?.userId;
    if (!pharmacyId) {
      return res.status(401).json({ error: "Unauthorized." });
    }
    const results = await db.findMedicinesByPharmacyId(pharmacyId);
    res.json({ results });
  } catch (error) {
    console.error("Get inventory error:", error);
    res.status(500).json({ error: "Server error while fetching inventory." });
  }
});
async function authenticateAdminToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Access token required. Please log in as admin." });
  }
  try {
    const decoded = import_jsonwebtoken.default.verify(token, JWT_SECRET);
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
    const isPasswordValid = await import_bcryptjs2.default.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid email or password." });
    }
    const token = import_jsonwebtoken.default.sign(
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
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ error: "Server error during admin login." });
  }
});
app.get("/api/admin/stats", authenticateAdminToken, async (req, res) => {
  try {
    const stats = await db.getAdminStats();
    res.json({ stats });
  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({ error: "Server error fetching admin stats." });
  }
});
app.get("/api/admin/pharmacies", authenticateAdminToken, async (req, res) => {
  try {
    const pharmacies = await db.getAllUsers();
    res.json({ pharmacies });
  } catch (error) {
    console.error("Admin pharmacies error:", error);
    res.status(500).json({ error: "Server error fetching pharmacies." });
  }
});
app.put("/api/admin/pharmacies/:id/toggle-status", authenticateAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await db.toggleUserActiveStatus(id);
    if (!updated) {
      return res.status(404).json({ error: "Pharmacy user not found." });
    }
    res.json({ message: "Pharmacy status toggled successfully.", user: updated });
  } catch (error) {
    console.error("Admin toggle user status error:", error);
    res.status(500).json({ error: "Server error toggling user status." });
  }
});
app.delete("/api/admin/pharmacies/:id", authenticateAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const success = await db.deleteUser(id);
    if (!success) {
      return res.status(404).json({ error: "Pharmacy user not found." });
    }
    res.json({ message: "Pharmacy and its medicine inventory deleted successfully." });
  } catch (error) {
    console.error("Admin delete pharmacy error:", error);
    res.status(500).json({ error: "Server error deleting pharmacy." });
  }
});
app.get("/api/admin/medicines", authenticateAdminToken, async (req, res) => {
  try {
    const medicines = await db.getAllMedicinesAdmin();
    res.json({ medicines });
  } catch (error) {
    console.error("Admin medicines error:", error);
    res.status(500).json({ error: "Server error fetching medicines." });
  }
});
app.put("/api/admin/medicines/:id/flag", authenticateAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await db.toggleMedicineFlag(id);
    if (!updated) {
      return res.status(404).json({ error: "Medicine listing not found." });
    }
    res.json({ message: "Medicine review flag toggled.", medicine: updated });
  } catch (error) {
    console.error("Admin toggle flag error:", error);
    res.status(500).json({ error: "Server error toggling review flag." });
  }
});
app.delete("/api/admin/medicines/:id", authenticateAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const success = await db.deleteMedicine(id);
    if (!success) {
      return res.status(404).json({ error: "Medicine not found." });
    }
    res.json({ message: "Medicine listing deleted successfully." });
  } catch (error) {
    console.error("Admin delete medicine error:", error);
    res.status(500).json({ error: "Server error deleting medicine." });
  }
});
app.put("/api/admin/change-password", authenticateAdminToken, async (req, res) => {
  try {
    const { newPassword } = req.body;
    const adminId = req.user?.userId;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long." });
    }
    if (!adminId) {
      return res.status(401).json({ error: "Unauthorized access." });
    }
    const hashedPassword = await import_bcryptjs2.default.hash(newPassword, 10);
    const success = await db.updateAdminPassword(adminId, hashedPassword);
    if (!success) {
      return res.status(500).json({ error: "Failed to update admin password." });
    }
    res.json({ message: "Admin password updated successfully." });
  } catch (error) {
    console.error("Admin change password error:", error);
    res.status(500).json({ error: "Server error changing admin password." });
  }
});
app.use("/api", (err, req, res, next) => {
  console.error("API Route Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "An unexpected server error occurred.",
    stack: process.env.NODE_ENV !== "production" ? err.stack : void 0
  });
});
async function start() {
  await connectDB();
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path2.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path2.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Ausadhi Tracker Backend] listening on http://0.0.0.0:${PORT}`);
  });
}
start();
//# sourceMappingURL=server.cjs.map
