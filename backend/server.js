const express = require("express");
const bodyParser = require("body-parser");
const { auth, db } = require("./firebase");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

// Example route for user registration
app.post("/users/signup", async (req, res) => {
  const { first_name, last_name, email, password, pin_code, phone_number } = req.body;
  try {
    // Create a new user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      phoneNumber: phone_number,
      displayName: `${first_name} ${last_name}`,
    });

    // Store additional user info in Firestore (optional)
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

// Example route for login with email and password
app.post("/users/login/email", async (req, res) => {
  const { email, password } = req.body;
  try {
    // Sign in the user with Firebase Auth
    const user = await auth.getUserByEmail(email);

    // Verify password (you can use Firebase Admin SDK or send verification from the client)
    const customToken = await auth.createCustomToken(user.uid);

    res.status(200).send({ message: "Login successful", token: customToken });
  } catch (error) {
    res.status(400).send({ message: "Invalid email or password" });
  }
});

// Example route for OTP login (simulate OTP handling)
app.post("/users/login/otp", async (req, res) => {
  const { phone_number } = req.body;
  try {
    // Generate a custom token for the user (after verifying OTP)
    const user = await auth.getUserByPhoneNumber(phone_number);
    const customToken = await auth.createCustomToken(user.uid);

    res.status(200).send({ message: "OTP verified, login successful", token: customToken });
  } catch (error) {
    res.status(400).send({ message: "Invalid OTP or phone number" });
  }
});

// Verify OTP
app.post("/users/signup/verify-otp", async (req, res) => {
  const { phone_number, otp } = req.body;

  // Simulate OTP verification
  if (otp === "123456") {
    try {
      const user = await auth.getUserByPhoneNumber(phone_number);
      const customToken = await auth.createCustomToken(user.uid);

      res.status(200).send({ message: "OTP verified", token: customToken });
    } catch (error) {
      res.status(400).send({ message: "User not found" });
    }
  } else {
    res.status(400).send({ message: "Invalid OTP" });
  }
});

// Logout the user
app.get("/api/auth/logout", (req, res) => {
  // Clear the token from the frontend (logout logic is handled on the frontend)
  res.status(200).send({ message: "Logout successful" });
});

// Handle password reset request
app.post("/api/auth/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const link = await auth.generatePasswordResetLink(email);
    res.status(200).send({ message: "Password reset email sent", link });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

// Handle dispute submission
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

// Handle cancellation request
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

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Storage the and create Equipment

const verifyToken = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(403).send({ message: 'No token provided' });
    }
  
    try {
      const decodedToken = await auth.verifyIdToken(token);
      req.user = decodedToken;
      next();
    } catch (error) {
      return res.status(401).send({ message: 'Unauthorized' });
    }
  };
  
  // Booking collection reference
  const bookingRef = db.collection('bookings');
  
  // Step 2: Define Routes
  
  // Get all bookings for a user
  app.get('/api/booking/', verifyToken, async (req, res) => {
    try {
      const snapshot = await bookingRef.where('userId', '==', req.user.uid).get();
      const bookings = [];
      snapshot.forEach(doc => bookings.push({ id: doc.id, ...doc.data() }));
      res.status(200).json(bookings);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching bookings', error });
    }
  });
  
  // Get all booking requests for the owner
  app.get('/api/booking/request/', verifyToken, async (req, res) => {
    try {
      const snapshot = await bookingRef.where('ownerId', '==', req.user.uid).get();
      const bookings = [];
      snapshot.forEach(doc => bookings.push({ id: doc.id, ...doc.data() }));
      res.status(200).json(bookings);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching booking requests', error });
    }
  });
  
  // Create a booking
  app.post('/api/booking/create/', verifyToken, async (req, res) => {
    const { equipment, start_date, end_date, start_time, end_time } = req.body;
  
    try {
      const newBooking = {
        userId: req.user.uid,
        equipment,
        start_date,
        end_date,
        start_time,
        end_time,
        status: 'pending', // default status
        createdAt: new Date().toISOString(),
      };
  
      const bookingDoc = await bookingRef.add(newBooking);
      res.status(201).json({ id: bookingDoc.id, ...newBooking });
    } catch (error) {
      res.status(500).json({ message: 'Error creating booking', error });
    }
  });
  
  // Get booking details by ID
  app.get('/api/booking/detail/:id/', verifyToken, async (req, res) => {
    const { id } = req.params;
  
    try {
      const doc = await bookingRef.doc(id).get();
      if (!doc.exists) {
        return res.status(404).json({ message: 'Booking not found' });
      }
  
      res.status(200).json({ id: doc.id, ...doc.data() });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching booking details', error });
    }
  });
  
  // Update booking status
  app.patch('/api/booking/update/:id/', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
  
    try {
      const bookingDoc = await bookingRef.doc(id).get();
      if (!bookingDoc.exists) {
        return res.status(404).json({ message: 'Booking not found' });
      }
  
      await bookingRef.doc(id).update({ status });
      res.status(200).json({ message: 'Booking updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error updating booking', error });
    }
  });
  
  // Start the server
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });