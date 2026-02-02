const express = require("express")
const listingRoute = express.Router()
const { listingSchema } = require("../joischema.js");
const wrapAsync = require("../utils/wrapAsync.js")
const passport = require("passport");
const { isLoggedIn, isOwner } = require("../middleware.js")
const listingController = require("../controllers/listings.js")
const multer = require("multer")
const { storage } = require("../cloudConfig.js")
const upload = multer({ storage })

const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message);
        throw new ExpressError(400, errMsg)
    } else {
        next();
    }
}

listingRoute.route("/")
    .get(wrapAsync(listingController.indexRoute))
    .post(isLoggedIn, validateListing, upload.single('listing[image]'), wrapAsync(listingController.saveListing));


//New Route
listingRoute.get("/new", isLoggedIn, listingController.newForm)

listingRoute.route("/:id").get(wrapAsync(listingController.showListing)).put(isLoggedIn, isOwner, upload.single('listing[image]'), validateListing, wrapAsync(listingController.updateListing))

//Edit route
listingRoute.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.editForm))

//delete route
listingRoute.delete("/:id/delete", isLoggedIn, isOwner, wrapAsync(listingController.destroy));

module.exports = listingRoute;