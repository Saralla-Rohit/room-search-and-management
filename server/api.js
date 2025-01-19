var express = require('express');
var app = express();
var cors = require('cors');
var multer = require('multer');
var path = require('path');
require('dotenv').config();

// Configure CORS
app.use(cors());

// Parse JSON and URL-encoded bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/public', express.static(path.join(__dirname, '..', 'public')));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

var mongoClient = require("mongodb").MongoClient;
const conString = process.env.MONGO_URL;
if (!conString) {
    console.error("MongoDB connection string not found in environment variables!");
    process.exit(1);
}

let dbClient = null;
let db = null;

async function connectDB() {
    try {
        if (!dbClient) {
            console.log("Attempting to connect to MongoDB...");
            dbClient = await mongoClient.connect(conString);
            db = dbClient.db("roomDb");
            console.log("Successfully connected to MongoDB database: roomDb");
        }
        return db;
    } catch (err) {
        console.error("Failed to connect to MongoDB:", err);
        throw err;
    }
}

// Initialize database connection
connectDB().catch(err => {
    console.error("Initial database connection failed:", err);
    process.exit(1);
});

app.get("/get-filtered-rooms", async (req, res) => {
    try {
        const db = await connectDB();
        if (!db) {
            return res.status(500).json({ error: "Database connection failed" });
        }

        const { price, bedrooms, bathrooms, propertyType, bachelorsAllowed, furnished, parking } = req.query;
        let filter = {};

        if (price) filter.Price = { $lte: parseInt(price) };
        if (bedrooms) filter.Bedrooms = parseInt(bedrooms);
        if (bathrooms) filter.Bathrooms = parseInt(bathrooms);
        if (propertyType) filter.PropertyType = propertyType;
        if (bachelorsAllowed) filter.BachelorsAllowed = bachelorsAllowed === 'true';
        if (furnished) filter.Furnished = furnished === 'true';
        if (parking) filter.Parking = parking === 'true';

        const rooms = await db.collection("rooms").find(filter).toArray();
        res.json(rooms);
    } catch (err) {
        console.error('Filter error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get("/", (req, res) => {
    res.send("Home")
})

app.get("/users", async (req, res) => {
    try {
        const db = await connectDB();
        const users = await db.collection("users").find({}).toArray();
        res.json(users);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({
            error: "Error processing request",
            details: err.message
        });
    }
})

app.post("/register-user", async (req, res) => {
    var user = {
        UserId: parseInt(req.body.UserId),
        UserName: req.body.UserName,
        Email: req.body.Email,
        Password: req.body.Password,
        Mobile: req.body.Mobile
    }
    try {
        const db = await connectDB();
        await db.collection("users").insertOne(user);
        console.log("User Registered")
        res.json(user)
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({
            error: "Error processing request",
            details: err.message
        });
    }
})

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Store images in 'uploads' directory
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Use timestamp to avoid filename conflicts
    }
});
var upload = multer({ storage: storage });

app.post("/add-room", upload.single('image'), async (req, res) => {
    var room = {
        RoomId: parseInt(req.body.RoomId),
        Description: req.body.Description,
        Price: parseInt(req.body.Price),
        Bedrooms: parseInt(req.body.Bedrooms),
        Furnished: req.body.Furnished === 'true',
        Bathrooms: parseInt(req.body.Bathrooms),
        Parking: req.body.Parking === 'true',
        BachelorsAllowed: req.body.BachelorsAllowed === 'true',
        PropertyType: req.body.PropertyType,
        Contact: req.body.Contact,
        UserId: parseInt(req.body.UserId),
        image: req.file ? req.file.path : null,
    };

    // Log the received data for debugging
    console.log('Received room data:', req.body);
    console.log('Processed room object:', room);

    try {
        const db = await connectDB();
        await db.collection("rooms").insertOne(room);
        console.log('Room Added Successfully');
        res.json({ success: true, room });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({
            error: "Error processing request",
            details: err.message
        });
    }
});

app.get("/get-rooms/:UserId", async (req, res) => {
    try {
        const db = await connectDB();
        const rooms = await db.collection("rooms").find({ UserId: parseInt(req.params.UserId) }).toArray();
        res.json(rooms);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({
            error: "Error processing request",
            details: err.message
        });
    }
})

app.get("/get-room/:RoomId", async (req, res) => {
    try {
        const db = await connectDB();
        const room = await db.collection("rooms").findOne({ RoomId: parseInt(req.params.RoomId) });
        res.json(room);  // Sending the appointment data as JSON response
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({
            error: "Error processing request",
            details: err.message
        });
    }
});

app.put("/edit-room/:RoomId", upload.single('image'), async (req, res) => {
    var room = {
        Description: req.body.Description,
        Price: parseInt(req.body.Price),
        Bedrooms: parseInt(req.body.Bedrooms),
        Bathrooms: parseInt(req.body.Bathrooms),
        Furnished: req.body.Furnished === 'true',
        Parking: req.body.Parking === 'true',
        BachelorsAllowed: req.body.BachelorsAllowed === 'true',
        PropertyType: req.body.PropertyType || null,
        Contact: req.body.Contact || null,
        UserId: parseInt(req.body.UserId),
        image: req.file ? req.file.path : null,
    };
    try {
        const db = await connectDB();
        await db.collection("rooms").updateOne(
            { RoomId: parseInt(req.params.RoomId) },
            { $set: room }
        );
        console.log('Room Updated..');
        res.json({ message: 'Room Updated Successfully' });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({
            error: "Error processing request",
            details: err.message
        });
    }
});

app.delete("/delete-room/:RoomId", async (req, res) => {
    try {
        const db = await connectDB();
        await db.collection("rooms").deleteOne({ RoomId: parseInt(req.params.RoomId) });
        console.log('Room deleted..');
        res.send(`Room id : ${req.params.RoomId} deleted`);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({
            error: "Error processing request",
            details: err.message
        });
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});