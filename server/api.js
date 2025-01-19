var express = require('express');
var app = express();
var cors = require('cors');
var multer = require('multer');
var path = require('path');
require('dotenv').config();

// Configure CORS with specific options
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            'http://127.0.0.1:5500',
            'http://127.0.0.1:10000',
            'https://room-search-and-management.onrender.com',
            'https://roomify-backend-8uxc.onrender.com'
        ];
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Enable pre-flight requests for all routes
app.options('*', cors(corsOptions));

// Parse JSON and URL-encoded bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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

// Serve static files with proper MIME types for src directory
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

// Serve index.html for root route and any other routes (for SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

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

// Get rooms by user ID
app.get("/get-rooms/:UserId", async (req, res) => {
    try {
        const db = await connectDB();
        const rooms = await db.collection("rooms").find({ UserId: parseInt(req.params.UserId) }).toArray();
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
        const room = await db.collection("rooms").findOne({ RoomId: parseInt(req.params.RoomId) });
        res.json(room);  // Sending the appointment data as JSON response
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
            { RoomId: parseInt(req.params.RoomId) },
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
        await db.collection("rooms").deleteOne({ RoomId: parseInt(req.params.RoomId) });
        console.log('Room deleted..');
        res.send(`Room id : ${req.params.RoomId} deleted`);
    } catch (err) {
        console.error('Error:', err);
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

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});