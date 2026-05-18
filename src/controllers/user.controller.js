const db = require("../models");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const getNextId = async (model) => {
  const lastRecord = await model.findOne().sort({ id: -1 });
  return lastRecord && typeof lastRecord.id === "number" ? lastRecord.id + 1 : 1001;
};

/**
 * CREATE VENDOR (Refined with more ERP defaults)
 */
exports.createVendor = async (req, res) => {
  try {
    const { firstname, lastname, email, password, mobile } = req.body;
    
    if (!email || !firstname || !lastname || !mobile || !password) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const existing = await db.user_master.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    const nextId = await getNextId(db.user_master);

    // Prepare full data with all possible ERP required fields
    const userData = {
      id: nextId,
      uuid: crypto.randomUUID(),
      firstname,
      lastname,
      email,
      password, 
      mobile,
      role_id: 2, 
      status: 1,
      is_approved_by_admin: 1,
      usertype: 2,
      company_id: 26,
      location_id: 30,
      organisation_id: 1,
      login_type: "system",
      parent_id: "0",
      api_token: "",
      email_verified_at: new Date(),
      remember_token: ""
    };

    console.log("Attempting to create Mongoose user with data:", userData);

    const newUser = await db.user_master.create(userData);

    res.status(201).json({ 
      success: true, 
      message: "Vendor created successfully", 
      data: { id: newUser.id, email: newUser.email } 
    });
  } catch (error) {
    console.error("FULL DATABASE ERROR:", error);
    res.status(500).json({ 
      success: false, 
      message: "Database Error",
      detail: error.message,
      stack: error.message
    });
  }
};

/**
 * LIST VENDORS
 */
exports.listVendors = async (req, res) => {
  try {
    const vendors = await db.user_master.find(
      { role_id: 2 },
      "id firstname lastname email mobile created_at"
    ).sort({ created_at: -1 });
    res.status(200).json({ success: true, data: vendors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * UPDATE VENDOR
 */
exports.updateVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstname, lastname, email, mobile, password } = req.body;
    
    const user = await db.user_master.findOne({
      $or: [
        { id: isNaN(id) ? null : Number(id) },
        { _id: id }
      ].filter(x => x.id !== null || x._id !== null)
    });
    if (!user) return res.status(404).json({ success: false, message: "Vendor not found" });

    let updateData = { firstname, lastname, email, mobile };
    if (password) {
      updateData.password = await bcrypt.hash(password, 8);
    }

    user.set(updateData);
    await user.save();
    res.status(200).json({ success: true, message: "Vendor updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * DELETE VENDOR
 */
exports.deleteVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await db.user_master.findOne({
      $or: [
        { id: isNaN(id) ? null : Number(id) },
        { _id: id }
      ].filter(x => x.id !== null || x._id !== null)
    });
    if (!user) return res.status(404).json({ success: false, message: "Vendor not found" });

    await user.deleteOne();
    res.status(200).json({ success: true, message: "Vendor deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
