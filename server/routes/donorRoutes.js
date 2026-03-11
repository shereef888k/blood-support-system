const express = require("express");
const router = express.Router();
const Donor = require("../models/Donor");

// Add donor
router.post("/add", async (req, res) => {
  try {
    const { name, bloodGroup, phone, place, whatsapp, available } = req.body;

    if (!name || !bloodGroup || !phone || !place || !whatsapp) {
      return res.status(400).json({
        message: "All required fields must be filled",
      });
    }

    const donor = new Donor({
      name,
      bloodGroup,
      phone,
      place,
      whatsapp,
      available,
    });

    await donor.save();

    res.status(201).json({
      message: "Donor added successfully",
      donor,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add donor",
      error: error.message,
    });
  }
});

// Get all donors
router.get("/", async (req, res) => {
  try {
    const donors = await Donor.find().sort({ createdAt: -1 });
    res.status(200).json(donors);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch donors",
      error: error.message,
    });
  }
});

// Get donors by blood group
router.get("/blood/:bloodGroup", async (req, res) => {
  try {
    const donors = await Donor.find({
      bloodGroup: req.params.bloodGroup,
      available: true,
    }).sort({ createdAt: -1 });

    res.status(200).json(donors);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch matching donors",
      error: error.message,
    });
  }
});

// Delete donor
router.delete("/:id", async (req, res) => {
  try {
    await Donor.findByIdAndDelete(req.params.id);
    res.status(200).json({
      message: "Donor deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete donor",
      error: error.message,
    });
  }
});

// Update donor availability
router.put("/availability/:id", async (req, res) => {
  try {
    const { available } = req.body;

    const donor = await Donor.findByIdAndUpdate(
      req.params.id,
      { available },
      { new: true }
    );

    res.status(200).json({
      message: "Donor availability updated",
      donor,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update donor availability",
      error: error.message,
    });
  }
});

module.exports = router;