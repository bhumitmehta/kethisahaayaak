const { collection, doc, setDoc,getDocuments } = require( "firebase/firestore"); 
const express = require("express");
const bodyParser = require("body-parser");
const { auth, db } = require("./firebase");
const axios = require("axios");
const cors = require('cors')
const app = express();
app.use(bodyParser.json());
app.use(cors({
  origin: 'http://localhost:3000',  // Replace with your frontend URL if needed
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],  // Allowed methods
  credentials: true,  // Allow cookies if needed
}));
// Middleware to verify JWT token
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(403).send({ message: "No token provided" });
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).send({ message: "Unauthorized" });
  }
};

// User Signup Route
app.post("/users/signup", async (req, res) => {
  const { first_name, last_name, email, password, pin_code, phone_number } = req.body;
  console.log(req.body.phoneNumber)
  try {
    const userRecord = await auth.createUser({
      email,
      password,
      phoneNumber: phone_number,
      displayName: `${first_name} ${last_name}`,
    });

    await db.collection("users").doc(userRecord.uid).set({
      first_name,
      last_name,
      email,
      pin_code,
      phone_number,
      uid: userRecord.uid
    });

    res.status(201).send({ message: "User created successfully", uid: userRecord.uid });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

// Email/Password Login Route
app.post("/users/login/email", async (req, res) => {
  const { email, password } = req.body;
  console.log("login");
  console.log(req.body);

  try {
    // Step 1: Authenticate user with Firebase Authentication
    const user = await auth.getUserByEmail(email);
    const customToken = await auth.createCustomToken(user.uid);

    // Step 2: Fetch additional user data from Firestore (or your database)
    const userDoc = await db.collection("users").doc(user.uid).get();

    if (!userDoc.exists) {
      return res.status(404).send({ message: "User data not found in users collection" });
    }

    const userData = userDoc.data();
    console.log(userData)
    // Step 3: Return both the custom token and user data
    res.status(200).send({
      message: "Login successful",
      token: customToken,
      uid: user.uid,
      first_name: userData.first_name,
      last_name: userData.last_name,
      pin_code: userData.pin_code,
      address: userData.address,
      email: user.email, // You can also use userData.email if stored separately
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(400).send({ message: "Invalid email or password" });
  }
});


// OTP Login Route
app.post("/users/login/otp", async (req, res) => {
  const { phone_number } = req.body;
  try {
    const user = await auth.getUserByPhoneNumber(phone_number);
    const customToken = await auth.createCustomToken(user.uid);
    res.status(200).send({ message: "OTP verified, login successful", token: customToken });
  } catch (error) {
    res.status(400).send({ message: "Invalid OTP or phone number" });
  }
});

// Password Reset Route
app.post("/api/auth/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const link = await auth.generatePasswordResetLink(email);
    res.status(200).send({ message: "Password reset email sent", link });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

// Dispute Submission Route
app.post("/enquiry/partner-dispute", async (req, res) => {
  const { partner_id, email, name, phone_number, description, topic, equipment_id } = req.body;
  try {
    await db.collection("disputes").add({
      partner_id,
      email,
      name,
      phone_number,
      description,
      topic,
      equipment_id,
      created_at: new Date()
    });
    res.status(201).send({ message: "Dispute submitted successfully" });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

// Cancellation Request Route
app.post("/enquiry/cancel-form", async (req, res) => {
  const { booking_id, cancel_reason, description } = req.body;
  try {
    await db.collection("cancellations").add({
      booking_id,
      cancel_reason,
      description,
      created_at: new Date()
    });
    res.status(201).send({ message: "Cancellation request submitted" });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

// Booking Routes
const bookingRef = db.collection("bookings");

// Get bookings for a user
app.get("/api/booking/", verifyToken, async (req, res) => {
  try {
    const snapshot = await bookingRef.where("userId", "==", req.user.uid).get();
    const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching bookings", error });
  }
});

// Get booking requests for the owner
app.get("/api/booking/request/", verifyToken, async (req, res) => {
  try {
    const snapshot = await bookingRef.where("ownerId", "==", req.user.uid).get();
    const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching booking requests", error });
  }
});

// Create a booking
app.post("/api/booking/create/", verifyToken, async (req, res) => {
  const { equipment, start_date, end_date, start_time, end_time } = req.body;
  try {
    const newBooking = {
      userId: req.user.uid,
      equipment,
      start_date,
      end_date,
      start_time,
      end_time,
      status: "pending",
      createdAt: new Date(),
    };
    const bookingDoc = await bookingRef.add(newBooking);
    res.status(201).json({ id: bookingDoc.id, ...newBooking });
  } catch (error) {
    res.status(500).json({ message: "Error creating booking", error });
  }
});

app.get("/api/equipment", async (req, res) => {
  try {
    const equipmentList = await db.getDocuments(db, "equipment"); // Call the function with the collection name
    res.status(200).json({ message: "Equipment list fetched", data: equipmentList });
  } catch (error) {
    console.error("Failed to fetch equipment list:", error);
    res.status(500).send({ message: "Failed to fetch equipment list", error: error.message });
  }
});


// Get booking details by ID
app.get("/api/booking/detail/:id/", verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const doc = await bookingRef.doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ message: "Error fetching booking details", error });
  }
});

// Update booking status
app.patch("/api/booking/update/:id/", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const bookingDoc = await bookingRef.doc(id).get();
    if (!bookingDoc.exists) {
      return res.status(404).json({ message: "Booking not found" });
    }
    await bookingRef.doc(id).update({ status });
    res.status(200).json({ message: "Booking updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating booking", error });
  }
});




// Middleware to log incoming requests
app.use((req, res, next) => {
  console.log("---- Incoming Request ----");
  console.log("Method:", req.method);         // HTTP method (GET, POST, etc.)
  console.log("URL:", req.url);               // Request URL
  console.log("Headers:", req.headers);       // Request headers
  console.log("Body:", req.body);             // Request body (for POST/PUT requests)
  console.log("--------------------------");
  next();  // Pass the request to the next middleware or route handler
});


// Start the server (remove the duplicate)
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
