const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    const connString = process.env.MONGODB_URI || "mongodb://localhost:27017/charity";
    console.log(`Connecting to MongoDB at: ${connString}...`);
    
    await mongoose.connect(connString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("SUCCESS: MongoDB database connected successfully.");
  } catch (error) {
    console.error("FATAL Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
