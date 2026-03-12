const fs = require("fs");
const csv = require("csv-parser");
const mongoose = require("mongoose");

require("dotenv").config({ path: "./server/.env" });
const Donor = require("./models/Donor");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });

const donors = [];
let skipped = 0;

fs.createReadStream(__dirname + "/members.csv")
  .pipe(
    csv({
      mapHeaders: ({ header }) => header.trim()
    })
  )
  .on("data", (row) => {
    const donor = {
      name: String(row["NAME"] || "").trim(),
      place: String(row["PLACE"] || "").trim(),
      phone: String(row["PHONE NUMBER"] || "").replace(/\s+/g, "").trim(),
      whatsapp: String(row["WhatsApp NUMBER"] || "").replace(/\s+/g, "").trim(),
      bloodGroup: String(row["Blood Group"] || "").trim(),
      available: true
    };

    if (!donor.name || !donor.bloodGroup || !donor.phone || !donor.whatsapp) {
      skipped++;
      return;
    }

    donors.push(donor);
  })
  .on("end", async () => {
    try {
      if (donors.length === 0) {
        console.log("No valid donors found.");
        console.log("Skipped rows:", skipped);
        process.exit();
      }

      await Donor.insertMany(donors, { ordered: false });
      console.log("Club members imported successfully");
      console.log("Total donors imported:", donors.length);
      console.log("Skipped rows:", skipped);
      process.exit();
    } catch (error) {
      console.error("Import error:", error.message);
      console.log("Valid donors prepared:", donors.length);
      console.log("Skipped rows:", skipped);
      process.exit(1);
    }
  })
  .on("error", (error) => {
    console.error("CSV read error:", error.message);
    process.exit(1);
  });