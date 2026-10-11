const express = require("express");

const {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
} = require("../controllers/leadController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// CREATE
router.post("/", createLead);

// GET ALL
router.get("/",protect, getLeads);

// GET ONE
router.get("/:id",protect, getLeadById);

// UPDATE
router.put("/:id",protect, updateLead);

// DELETE
router.delete("/:id",protect, deleteLead);

module.exports = router;