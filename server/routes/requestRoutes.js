const express = require("express");
const router = express.Router();
const Request = require("../models/Request");
const Donor = require("../models/Donor");

// Add blood request and return matching donors
router.post("/add", async (req, res) => {
  try {
    const {
      patientName,
      bloodGroup,
      hospital,
      place,
      requesterName,
      phone,
      whatsapp,
      urgency,
    } = req.body;

    if (
      !patientName ||
      !bloodGroup ||
      !hospital ||
      !place ||
      !requesterName ||
      !phone ||
      !whatsapp
    ) {
      return res.status(400).json({
        message: "All required fields must be filled",
      });
    }

    const newRequest = new Request({
      patientName,
      bloodGroup,
      hospital,
      place,
      requesterName,
      phone,
      whatsapp,
      urgency,
    });

    await newRequest.save();

    const donors = await Donor.find({
      bloodGroup,
      available: true,
    }).sort({ createdAt: -1 });

    const matchingDonors = donors.map((donor) => {
      const text =
        `Hello, this is from NATIONAL ARTS & SPORTS CLUB Blood Support System.\n\n` +
        `Emergency blood required.\n` +
        `Patient: ${patientName}\n` +
        `Blood Group: ${bloodGroup}\n` +
        `Hospital: ${hospital}\n` +
        `Place: ${place}\n` +
        `Requester: ${requesterName}\n` +
        `Phone: ${phone}\n` +
        `WhatsApp: ${whatsapp}\n` +
        `Urgency: ${urgency || "Normal"}\n\n` +
        `Please reply if you are available to donate.`;

      return {
        _id: donor._id,
        name: donor.name,
        bloodGroup: donor.bloodGroup,
        place: donor.place,
        phone: donor.phone,
        whatsapp: donor.whatsapp,
        whatsappLink: `https://wa.me/91${donor.whatsapp}?text=${encodeURIComponent(text)}`,
      };
    });

    res.status(201).json({
      message: "Blood request created successfully",
      request: newRequest,
      matchingDonors,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create blood request",
      error: error.message,
    });
  }
});

// Get all requests
router.get("/", async (req, res) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch requests",
      error: error.message,
    });
  }
});

// Get donors by blood group
router.get("/match/:bloodGroup", async (req, res) => {
  try {
    const donors = await Donor.find({
      bloodGroup: req.params.bloodGroup,
      available: true,
    }).sort({ createdAt: -1 });

    const donorsWithLinks = donors.map((donor) => {
      const text =
        `Hello, this is from NATIONAL ARTS & SPORTS CLUB Blood Support System.\n\n` +
        `Emergency blood required for blood group ${req.params.bloodGroup}.\n` +
        `Please reply if you are available to donate.`;

      return {
        ...donor.toObject(),
        whatsappLink: `https://wa.me/91${donor.whatsapp}?text=${encodeURIComponent(text)}`,
      };
    });

    res.status(200).json(donorsWithLinks);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch matching donors",
      error: error.message,
    });
  }
});

// Emergency broadcast route
router.post("/broadcast", async (req, res) => {
  try {
    const {
      patientName,
      bloodGroup,
      hospital,
      place,
      requesterName,
      phone,
      whatsapp,
      urgency,
    } = req.body;

    if (!bloodGroup) {
      return res.status(400).json({
        message: "Blood group is required for broadcast",
      });
    }

    const donors = await Donor.find({
      bloodGroup,
      available: true,
    }).sort({ createdAt: -1 });

    const text =
      `🚨 EMERGENCY BLOOD REQUEST 🚨\n\n` +
      `Patient: ${patientName || "Not provided"}\n` +
      `Blood Group: ${bloodGroup}\n` +
      `Hospital: ${hospital || "Not provided"}\n` +
      `Place: ${place || "Not provided"}\n` +
      `Requester: ${requesterName || "Not provided"}\n` +
      `Phone: ${phone || "Not provided"}\n` +
      `WhatsApp: ${whatsapp || "Not provided"}\n` +
      `Urgency: ${urgency || "Normal"}\n\n` +
      `Please reply if you are available to donate.\n` +
      `NATIONAL ARTS & SPORTS CLUB Blood Support System`;

    const donorLinks = donors.map((donor) => ({
      _id: donor._id,
      name: donor.name,
      bloodGroup: donor.bloodGroup,
      place: donor.place,
      phone: donor.phone,
      whatsapp: donor.whatsapp,
      whatsappLink: `https://wa.me/91${donor.whatsapp}?text=${encodeURIComponent(text)}`,
    }));

    res.status(200).json({
      message: "Broadcast donors fetched successfully",
      donors: donorLinks,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create broadcast",
      error: error.message,
    });
  }
});

// Update request status
router.put("/status/:id", async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        message: "Status is required",
      });
    }

    const updatedRequest = await Request.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    res.status(200).json({
      message: "Request status updated",
      request: updatedRequest,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update request status",
      error: error.message,
    });
  }
});

module.exports = router;