const mongoose = require("mongoose");
const db = require("./src/models");

const MONGODB_URI = "mongodb+srv://chatAI:bawsfL1sbUHjKTVt@cluster0.ehduwnn.mongodb.net/charity";

async function seed() {
  try {
    console.log("Connecting to MongoDB for seeding...");
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("Connected successfully!");

    // 1. Seed Qurbani Dates (5 records)
    console.log("Seeding Qurbani Dates...");
    await db.qurbani_date_master.deleteMany({});
    
    const dates = [
      { id: 1001, qurbani_date: "Eid Day 1", actual_date: "2026-06-16", description: "First day of Eid Al-Adha", status: 1 },
      { id: 1002, qurbani_date: "Eid Day 2", actual_date: "2026-06-17", description: "Second day of Eid Al-Adha", status: 1 },
      { id: 1003, qurbani_date: "Eid Day 3", actual_date: "2026-06-18", description: "Third day of Eid Al-Adha", status: 1 },
      { id: 1004, qurbani_date: "Eid Day 4", actual_date: "2026-06-19", description: "Fourth day of Eid Al-Adha", status: 1 },
      { id: 1005, qurbani_date: "Eid Day 5", actual_date: "2026-06-20", description: "Fifth day of Eid Al-Adha (Extended)", status: 1 }
    ];

    for (const dateItem of dates) {
      await db.qurbani_date_master.create(dateItem);
    }
    console.log("✅ Seeded 5 Qurbani Dates successfully!");

    // 2. Seed Departments (5 records)
    console.log("Seeding Departments...");
    await db.item_department.deleteMany({});

    const departments = [
      { id: 2001, deptcode: "DEPT-AQ", deptname: "Aqeeqah", itemdeptname: "Aqeeqah", deptdesclong: "Aqeeqah Sacrificial Department", status: 1, company_id: 26, location_id: 30 },
      { id: 2002, deptcode: "DEPT-QB", deptname: "Qurbani", itemdeptname: "Qurbani", deptdesclong: "Qurbani Sacrificial Department", status: 1, company_id: 26, location_id: 30 },
      { id: 2003, deptcode: "DEPT-SQ", deptname: "Sadqah", itemdeptname: "Sadqah", deptdesclong: "Sadqah Sacrificial Department", status: 1, company_id: 26, location_id: 30 }
    ];

    for (const deptItem of departments) {
      await db.item_department.create(deptItem);
    }
    console.log("✅ Seeded 3 Departments (Aqeeqah, Qurbani, Sadqah) successfully!");

    console.log("Database seeding completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();
