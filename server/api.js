var express = require('express');
var app = express();
var cors = require('cors');
var multer = require('multer');
var path = require('path');
require('dotenv').config();

// CORS configuration
app.use(cors({
    origin: ['http://127.0.0.1:5500', 'http://localhost:5500', 'https://room-search-and-management-1.onrender.com'],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    credentials: true
}));

// Handle preflight requests

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
app.use('/src', express.static(path.join(__dirname, '../src')));

// Database connection
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
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});
app.get('/*.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', req.path));
});
// Configure multer for file uploads
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
var upload = multer({ storage: storage });

// API Routes (must come before static file serving)
// Filter rooms endpoint
app.get("/get-filtered-rooms", async (req, res) => {
    try {
        const db = await connectDB();
        if (!db) {
            return res.status(500).json({ error: "Database connection failed" });
        }

        const { price, bedrooms, bathrooms, propertyType, bachelorsAllowed, furnished, parking } = req.query;
        let filter = {};

        if (price) filter.Price = { $lte: parseInt(price) };
        if (bedrooms) filter.Bedrooms = { $gte: parseInt(bedrooms) };
        if (bathrooms) filter.Bathrooms = { $gte: parseInt(bathrooms) };
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

// Get filtered rooms endpoint
app.get("/get-filtered-rooms", async (req, res) => {
    try {
        const db = await connectDB();
        const query = {};

        // Build query based on filters
        if (req.query.price) {
            query.Price = { $lte: parseInt(req.query.price) };
        }
        if (req.query.bedrooms && req.query.bedrooms !== 'any') {
            query.Bedrooms = parseInt(req.query.bedrooms);
        }
        if (req.query.bathrooms && req.query.bathrooms !== 'any') {
            query.Bathrooms = parseInt(req.query.bathrooms);
        }
        if (req.query.propertyType && req.query.propertyType !== 'any') {
            query.PropertyType = req.query.propertyType;
        }
        if (req.query.bachelorsAllowed && req.query.bachelorsAllowed !== 'any') {
            query.BachelorsAllowed = req.query.bachelorsAllowed === 'true';
        }
        if (req.query.furnished && req.query.furnished !== 'any') {
            query.Furnished = req.query.furnished === 'true';
        }
        if (req.query.parking && req.query.parking !== 'any') {
            query.Parking = req.query.parking === 'true';
        }

        console.log('Filtering rooms with query:', query);
        const rooms = await db.collection("rooms").find(query).toArray();
        console.log(`Found ${rooms.length} rooms matching criteria`);
        res.json(rooms);
    } catch (err) {
        console.error('Error filtering rooms:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get rooms by user ID
app.get("/get-rooms/:UserId", async (req, res) => {
    try {
        const db = await connectDB();
        const UserId = parseInt(req.params.UserId);
        if (isNaN(UserId)) {
            return res.status(400).json({ error: "Invalid UserId format" });
        }
        const rooms = await db.collection("rooms").find({ UserId }).toArray();
        res.json(rooms);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Add room endpoint
app.post("/add-room", upload.single('image'), async (req, res) => {
    try {
        var room = {
            RoomId: parseInt(req.body.RoomId),
            Price: parseInt(req.body.Price),
            Bedrooms: parseInt(req.body.Bedrooms),
            Bathrooms: parseInt(req.body.Bathrooms),
            PropertyType: req.body.PropertyType,
            Description: req.body.Description,
            BachelorsAllowed: req.body.BachelorsAllowed === 'true',
            Furnished: req.body.Furnished === 'true',
            Parking: req.body.Parking === 'true',
            UserId: parseInt(req.body.UserId),
            image: req.file ? req.file.path : null
        };

        const db = await connectDB();
        await db.collection("rooms").insertOne(room);
        res.json({ message: "Room added successfully" });
    } catch (err) {
        console.error('Error adding room:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get room by ID
app.get("/get-room/:RoomId", async (req, res) => {
    try {
        const db = await connectDB();
        const roomId = parseInt(req.params.RoomId);
        if (isNaN(roomId)) {
            return res.status(400).json({ error: "Invalid room ID format" });
        }
        const room = await db.collection("rooms").findOne({ RoomId: roomId });
        if (!room) {
            return res.status(404).json({ error: "Room not found" });
        }
        res.json(room);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Edit room endpoint
app.put("/edit-room/:RoomId", upload.single('image'), async (req, res) => {
    try {
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

        const db = await connectDB();
        await db.collection("rooms").updateOne(
            { RoomId: req.params.RoomId },
            { $set: room }
        );
        console.log('Room Updated..');
        res.json({ message: 'Room Updated Successfully' });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Delete room endpoint
app.delete("/delete-room/:RoomId", async (req, res) => {
    try {
        const db = await connectDB();
        const roomId = parseInt(req.params.RoomId);
        
        if (isNaN(roomId)) {
            return res.status(400).json({ error: "Invalid room ID format" });
        }

        const result = await db.collection("rooms").deleteOne({ RoomId: roomId });
        
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: `No room found with ID ${roomId}` });
        }
        
        console.log(`Room ${roomId} deleted successfully`);
        res.json({ message: `Room ${roomId} deleted successfully` });
    } catch (err) {
        console.error('Error deleting room:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get users endpoint
app.get("/users", async (req, res) => {
    try {
        const db = await connectDB();
        const users = await db.collection("users").find({}).toArray();
        res.json(users);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Register user endpoint
app.post("/register-user", async (req, res) => {
    try {
        var user = {
            UserId: parseInt(req.body.UserId),
            UserName: req.body.UserName,
            Email: req.body.Email,
            Password: req.body.Password,
            Mobile: req.body.Mobile
        };

        const db = await connectDB();
        await db.collection("users").insertOne(user);
        console.log("User Registered")
        res.json(user)
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Static file serving (must come after API routes)
app.use('/src', express.static(path.join(__dirname, '..', 'src'), {
    setHeaders: (res, filepath) => {
        if (filepath.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        } else if (filepath.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        }
    }
}));

// Serve public directory as root
app.use(express.static(path.join(__dirname, '..', 'public')));

// Serve other static directories
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Catch-all route for SPA (must be last)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});