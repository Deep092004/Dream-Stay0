const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");

const Listing = require("../models/listing.js");
const { isloggedIn, isOwner, validateListing } = require("../middleware.js");

const listingController = require("../constrollers/listings.js");

const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// ===================== INDEX + CREATE =====================
router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isloggedIn,
    upload.single("image"),        // ✅ FIXED (matches form)
    wrapAsync(listingController.createlisting)
  );

// ===================== NEW =====================
router.get("/new", isloggedIn, listingController.renderNewForm);

// ===================== SHOW + UPDATE + DELETE =====================
router.route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isloggedIn,
    isOwner,
    upload.single("listing[image]"),        // ✅ FIXED
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(
    isloggedIn,
    isOwner,
    wrapAsync(listingController.destroylisting)
  );

// ===================== EDIT =====================
router.get(
  "/:id/edit",
  isloggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

module.exports = router;
