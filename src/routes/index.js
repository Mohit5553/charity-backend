const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const itemController = require("../controllers/item.controller");
const charityController = require("../controllers/charity.controller");
const companyController = require("../controllers/company.controller");
const authController = require("../controllers/auth.controller");
const userController = require("../controllers/user.controller");
const customerController = require("../controllers/customer.controller");
const qurbaniController = require("../controllers/qurbani.controller");
const qurbanidateController = require("../controllers/qurbanidate.controller");
const departmentController = require("../controllers/department.controller");
const db = require("../models");
const bcrypt = require("bcrypt");

// Admin Auth Middleware
const JWT_SECRET = "charity_erp_secret_key";
const adminOnly = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token provided.' });
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded.role?.toLowerCase().includes('admin')) {
      return res.status(403).json({ success: false, message: 'Admin access required.' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

// Auth
router.post("/auth/login", authController.login);

// Setup
router.get("/setup", async (req, res) => {
  try {
    const [adminRole] = await db.role_master.findOrCreate({ where: { role_name: "Admin" } });
    await db.role_master.findOrCreate({ where: { role_name: "Vendor" } });
    const hashedPassword = await bcrypt.hash("admin123", 8);
    await db.user_master.findOrCreate({
      where: { email: "admin@charity.com" },
      defaults: { firstname: "System", lastname: "Admin", password: hashedPassword, role_id: adminRole.role_id, status: 1 }
    });
    res.json({ success: true, message: "Setup complete" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Items (View: Public, Create/Update/Delete: Admin Only)
router.get("/charity-items", itemController.getCharityItemList);
router.post("/charity-items", adminOnly, itemController.createItem);
router.put("/charity-items/:id", adminOnly, itemController.updateItem);
router.delete("/charity-items/:id", adminOnly, itemController.deleteItem);

// Charity Data
router.get("/charity-data", charityController.list);

// User/Vendor Management (FULL CRUD)
router.get("/users/vendors", userController.listVendors);
router.post("/users/vendors", userController.createVendor);
router.put("/users/vendors/:id", userController.updateVendor);
router.delete("/users/vendors/:id", userController.deleteVendor);

// Customer Management
router.get("/customers", customerController.listCustomers);
router.post("/customers", customerController.createCustomer);
router.put("/customers/:id", customerController.updateCustomer);
router.delete("/customers/:id", customerController.deleteCustomer);

// Qurbani Booking Management
router.get("/bookings", qurbaniController.listBookings);
router.get("/bookings/years", qurbaniController.getAvailableYears);
router.get("/bookings/collection-summary", qurbaniController.getCollectionSummary);
router.get("/bookings/comparison-summary", qurbaniController.getComparisonSummary);
router.post("/bookings", qurbaniController.createBooking);
router.put("/bookings/:id", qurbaniController.updateBooking);
router.delete("/bookings/:id", qurbaniController.deleteBooking);
router.post("/bookings/:id/approve", adminOnly, qurbaniController.approveBooking);
router.get("/share-codes", qurbaniController.listShareCodes);
router.get("/departments", qurbaniController.listDepartments);
router.get("/company", qurbaniController.getCompany);

// Qurbani Date Master CRUD routes (Create/Update/Delete gated by adminOnly)
router.get("/qurbani-dates", qurbanidateController.list);
router.post("/qurbani-dates", adminOnly, qurbanidateController.create);
router.put("/qurbani-dates/:id", adminOnly, qurbanidateController.update);
router.delete("/qurbani-dates/:id", adminOnly, qurbanidateController.delete);

// Department Master CRUD routes (Create/Update/Delete gated by adminOnly)
router.get("/departments-master", departmentController.list);
router.post("/departments-master", adminOnly, departmentController.create);
router.put("/departments-master/:id", adminOnly, departmentController.update);
router.delete("/departments-master/:id", adminOnly, departmentController.delete);

// Temporary Migration Route (MongoDB Clean Placeholder)
router.get("/migrate-qurbani", async (req, res) => {
  try {
    res.json({ success: true, message: "MongoDB Collections are active. SQL migration skipped." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Ported ERP & Ecommerce Routes
router.use("/", require("./ported.routes"));

module.exports = router;
