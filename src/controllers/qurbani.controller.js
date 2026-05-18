const db = require("../models");
const crypto = require("crypto");
const mongoose = require("mongoose");

const getNextId = async (model) => {
  const lastRecord = await model.findOne().sort({ id: -1 });
  return lastRecord && typeof lastRecord.id === "number" ? lastRecord.id + 1 : 1001;
};

const findBookingByIdOrUuid = async (id) => {
  const query = {};
  if (!isNaN(id)) {
    query.id = Number(id);
  } else if (mongoose.Types.ObjectId.isValid(id)) {
    query._id = id;
  } else {
    return null;
  }
  return await db.qurbani_booking.findOne(query);
};

/**
 * LIST QURBANI BOOKINGS
 */
exports.listBookings = async (req, res) => {
  try {
    const bookings = await db.qurbani_booking.find().sort({ created_at: -1 }).lean();
    for (let booking of bookings) {
      booking.shares = await db.qurbani_share.find({ booking_id: booking._id }).lean();
    }
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * LIST DYNAMIC SHARE CODES
 */
exports.listShareCodes = async (req, res) => {
  try {
    const items = await db.item_location_master.find({ status: 1 }).sort({ item_name: 1 }).lean();

    const shareCodes = [];
    for (let item of items) {
      const price = item.itemprice || 0;

      shareCodes.push({
        id: item.id,
        code: item.item_code,
        name: item.item_name,
        price: price,
        display: `${item.item_name} - Rs ${price}`
      });
    }

    res.status(200).json({ success: true, data: shareCodes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.listDepartments = async (req, res) => {
  try {
    const list = await db.item_department.find({
      $or: [{ company_id: 26 }, { organisation_id: 26 }]
    }, "id itemdeptname").sort({ itemdeptname: 1 }).lean();

    const results = list.map(d => ({
      id: d.id,
      dept_name: d.itemdeptname
    }));

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCompany = async (req, res) => {
  try {
    const company = await db.company.findOne({ id: 26 }).lean();
    if (company) {
      res.status(200).json({
        success: true,
        data: {
          id: company.id,
          company_name: company.compdesc || "Charity Organisation",
          email: "info@charity.org",
          phone: "000000000",
          address: "Central Head Office",
          city: "Main",
          country: "India"
        }
      });
    } else {
      res.status(200).json({
        success: true,
        data: { company_name: 'Charity Organisation', address: '', phone: '', email: '' }
      });
    }
  } catch (error) {
    res.status(200).json({ 
      success: true, 
      data: { company_name: 'Charity Organisation', address: '', phone: '', email: '' } 
    });
  }
};

/**
 * GET AVAILABLE BOOKING YEARS
 */
exports.getAvailableYears = async (req, res) => {
  try {
    const bookings = await db.qurbani_booking.find({}, "booking_date").lean();
    const yearsSet = new Set();
    bookings.forEach(b => {
      if (b.booking_date) {
        yearsSet.add(new Date(b.booking_date).getFullYear());
      }
    });

    const years = Array.from(yearsSet).sort((a, b) => b - a);
    if (years.length === 0) {
      years.push(new Date().getFullYear());
    }

    res.status(200).json({ success: true, data: years });
  } catch (error) {
    console.error("Error fetching available years:", error);
    res.status(200).json({ success: true, data: [new Date().getFullYear()] });
  }
};

/**
 * CREATE QURBANI BOOKING
 */
exports.createBooking = async (req, res) => {
  try {
    const { 
      customer_name, customer_phone, customer_email, 
      total_shares, share_code, total_amount, 
      payment_mode, shares, vendor_name, qurbani_date,
      is_approved_by_admin
    } = req.body;
    
    const nextId = await getNextId(db.qurbani_booking);
    const booking = await db.qurbani_booking.create({
      id: nextId,
      uuid: crypto.randomUUID(),
      customer_name, customer_phone, customer_email,
      total_shares, share_code, total_amount, payment_mode,
      vendor_name, qurbani_date,
      is_approved_by_admin: is_approved_by_admin !== undefined ? Number(is_approved_by_admin) : 0,
      status: "Confirmed", company_id: 26, location_id: 30
    });

    const shareData = shares.map((s, index) => ({
      booking_id: booking._id,
      share_reg_no: s.share_reg_no || `REG/${new Date().getFullYear()}/${Math.floor(Math.random()*10000)}/${index+1}`,
      beneficiary_name: s.beneficiary_name,
      beneficiary_mobile: s.beneficiary_mobile,
      objective: s.objective || "Qurbani",
      amount: s.amount
    }));

    for (let share of shareData) {
      const nextShareId = await getNextId(db.qurbani_share);
      await db.qurbani_share.create({ ...share, id: nextShareId });
    }

    res.status(201).json({ success: true, message: "Booking Created", data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * UPDATE QURBANI BOOKING
 */
exports.updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      customer_name, customer_phone, customer_email, 
      total_shares, share_code, total_amount, 
      payment_mode, shares, qurbani_date 
    } = req.body;

    const booking = await findBookingByIdOrUuid(id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    booking.set({
      customer_name, customer_phone, customer_email,
      total_shares, share_code, total_amount, payment_mode,
      qurbani_date
    });
    await booking.save();

    // Delete old shares and recreate
    await db.qurbani_share.deleteMany({ booking_id: booking._id });

    const shareData = shares.map((s, index) => ({
      booking_id: booking._id,
      share_reg_no: s.share_reg_no || `REG/${new Date().getFullYear()}/${Math.floor(Math.random()*10000)}/${index+1}`,
      beneficiary_name: s.beneficiary_name,
      beneficiary_mobile: s.beneficiary_mobile,
      objective: s.objective || "Qurbani",
      amount: s.amount
    }));

    for (let share of shareData) {
      const nextShareId = await getNextId(db.qurbani_share);
      await db.qurbani_share.create({ ...share, id: nextShareId });
    }

    res.status(200).json({ success: true, message: "Booking Updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * DELETE QURBANI BOOKING
 */
exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await findBookingByIdOrUuid(id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    await db.qurbani_share.deleteMany({ booking_id: booking._id });
    await booking.deleteOne();
    
    res.status(200).json({ success: true, message: "Booking Deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * APPROVE QURBANI BOOKING (Admin-only)
 */
exports.approveBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await findBookingByIdOrUuid(id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    booking.is_approved_by_admin = 1;
    await booking.save();

    res.status(200).json({ success: true, message: "Booking Approved successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET QURBANI COLLECTION SUMMARY
 */
exports.getCollectionSummary = async (req, res) => {
  try {
    const bookings = await db.qurbani_booking.find().lean();
    
    const summary = {};
    let totalAmount = 0;
    let totalShares = 0;
    
    bookings.forEach(b => {
      const code = b.share_code || "Unknown";
      if (!summary[code]) {
        summary[code] = { share_code: code, shares: 0, amount: 0, bookings: 0 };
      }
      summary[code].shares += b.total_shares || 0;
      summary[code].amount += b.total_amount || 0;
      summary[code].bookings += 1;
      
      totalAmount += b.total_amount || 0;
      totalShares += b.total_shares || 0;
    });
    
    const summaryList = Object.values(summary);
    
    res.status(200).json({
      success: true,
      data: {
        summary: summaryList,
        totalAmount,
        totalShares,
        totalBookings: bookings.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET QURBANI COMPARISON SUMMARY
 */
exports.getComparisonSummary = async (req, res) => {
  try {
    const bookings = await db.qurbani_booking.find().lean();
    
    const dayBreakdown = {};
    const yearBreakdown = {};
    
    bookings.forEach(b => {
      const day = b.qurbani_date || "Day 1";
      if (!dayBreakdown[day]) {
        dayBreakdown[day] = { day, shares: 0, amount: 0, bookings: 0 };
      }
      dayBreakdown[day].shares += b.total_shares || 0;
      dayBreakdown[day].amount += b.total_amount || 0;
      dayBreakdown[day].bookings += 1;
      
      if (b.booking_date) {
        const year = new Date(b.booking_date).getFullYear();
        if (!yearBreakdown[year]) {
          yearBreakdown[year] = { year, shares: 0, amount: 0, bookings: 0 };
        }
        yearBreakdown[year].shares += b.total_shares || 0;
        yearBreakdown[year].amount += b.total_amount || 0;
        yearBreakdown[year].bookings += 1;
      }
    });
    
    res.status(200).json({
      success: true,
      data: {
        days: Object.values(dayBreakdown),
        years: Object.values(yearBreakdown)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
