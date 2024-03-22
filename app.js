const express = require("express"); // Express module ko import kia
const mongoose = require("mongoose"); // Mongoose module ko import kia
const app = express(); // Express ka app banaya
const Listing = require("./models/listing.js"); // Listing model ko import kia
const path = require("path"); // Path module ko import kia
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust"; // MongoDB connection URL
const methodOverride = require("method-override"); // method-override module ko import kia
const ejsMate = require("ejs-mate"); // ejs-mate module ko import kia
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema } = require("./schema.js");

const { redirect } = require("express/lib/response"); // Express ke response se redirect ko import kia
const { engine } = require("express/lib/application"); // Express ke application se engine ko import kia

main()
  .then(() => {
    console.log("MongoDB se connected"); // MongoDB se successful connect hone ki message ko log kia
  })
  .catch((err) => {
    console.error("MongoDB se connect karte waqt error:", err); // MongoDB se connect karne mein agar error aata hai to usko log kia
  });

async function main() {
  await mongoose.connect(MONGO_URL); // MongoDB se connect kia
}
app.set("view engine", "ejs"); // View engine ko ejs set kia
app.set("views", path.join(__dirname, "views")); // Views ka directory path set kia
app.use(express.urlencoded({ extended: true })); // URL-encoded bodies ko parse kia
app.use(methodOverride("_method")); // method override ka istemal kia
app.engine("ejs", ejsMate); // ejs-mate engine ka istemal kia
app.use(express.static(path.join(__dirname, "/public"))); // Static files ko serve kia

app.get("/", (req, res) => {
  res.send("Hi, main root hoon"); // Root endpoint ke liye route
});

const validateListing = (req, res, next) => {
  let {error} = listingSchema.validate(req.body);
 
  if (result.error) {
    throw new ExpressError(400, result.error);
  }
};

// Naya route
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs"); // Naya listing form render kia
});

// Create route
app.post(
  "/listings",
  validateListing,
  wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save(); // Naya listing save kia
    res.redirect("/listings"); // Listings page pe redirect kiya
  })
);

// Sab listings ka route
app.get("/listings", async (req, res) => {
  const alllistings = await Listing.find({}); // Sab listings ko find kia
  res.render("listings/index.ejs", { alllistings }); // Sab listings ko render kia
});

// Listing ka route
app.get("/listings/:id", async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id); // ID ke basis pe listing find ki
  res.render("listings/show.ejs", { listing }); // Listing details ko render kia
});

// Edit ka route
app.get("/listings/:id/edit", validateListing, async (req, res) => {
  try {
    let { id } = req.params;
    id = id.trim();
    const listing = await Listing.findById(id); // Edit ke liye listing find ki
    console.log("Listing mil gayi:", listing); // Listing mil gayi ya nahi wo check kiya
    res.render("listings/edit.ejs", { listing }); // Edit form ko render kia
  } catch (error) {
    console.error("Edit ke liye listing fetch karte waqt error:", error); // Listing fetch karne mein agar error aata hai to usko log kia
    res.status(500).send("Edit ke liye listing fetch karte waqt error"); // Error response bheja
  }
});

// Update ka route
app.put(
  "/listings/:id",
  validateListing,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing }); // Listing ko update kia
    res.redirect(`/listings/${id}`); // Updated listing pe redirect kiya
  })
);

// Delete ka route
app.delete("/listings/:id", async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id); // Listing ko delete kia
  console.log(deletedListing); // Deleted listing ko log kia
  res.redirect("/listings"); // Listings page pe redirect kiya
});

const PORT = 8080; // Server ka port
app.listen(PORT, () => {
  console.log(`Server port ${PORT} pe chal raha hai`); // Server chal raha hai ki message ko log kia
});
