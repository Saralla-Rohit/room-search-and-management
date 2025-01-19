var express = require('express');
var app = express();
var cors = require('cors');
var multer = require('multer');
var path = require('path');
require('dotenv').config();

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
            dbClient = await mongoClient.connect(conString);
            db = dbClient.db("serviceHunt");
            console.log("Successfully connected to MongoDB database: serviceHunt");
        }
        return db;
    } catch (err) {
        console.error("Failed to connect to MongoDB:", err);
        throw err;
    }
}
// Serve static files
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/public', express.static(path.join(__dirname, '..', 'public')));
app.use('/images', express.static(path.join(__dirname, '..', 'public', 'images')));
app.use('/node_modules', express.static(path.join(__dirname, '..', 'node_modules')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve static files with proper MIME types
app.use('/src', express.static(path.join(__dirname, '..', 'src'), {
    setHeaders: (res, path) => {
        if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        } else if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
    }
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Store images in 'uploads' directory
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Use timestamp to avoid filename conflicts
    }
});
var upload = multer({ storage: storage });

app.use(cors({
    origin: ["http://127.0.0.1:5500", "https://room-search-and-management.onrender.com"],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.get("/", (req, res) => {
    res.send("Home")
})
app.get("/users", (req, res) => {
    mongoClient.connect(conString).then(clientObj => {
        var db = clientObj.db("roomDb")
        db.collection("users").find({}).toArray().then(user => {
            res.json(user)
            console.log(user)
        })
    })
})
app.post("/register-user", (req, res) => {
    var user = {
        UserId: parseInt(req.body.UserId),
        UserName: req.body.UserName,
        Email: req.body.Email,
        Password: req.body.Password,
        Mobile: req.body.Mobile
    }
    mongoClient.connect(conString).then(clientObj => {
        var db = clientObj.db("roomDb")
        db.collection("users").insertOne(user).then(() => {
            console.log("User Registered")
            res.json(user)

        })
    })
})

app.post("/add-room", upload.single('image'), (req, res) => {
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

    mongoClient.connect(conString).then(clientObj => {
        clientObj.db("roomDb").collection("rooms").insertOne(room).then(() => {
            console.log('Room Added Successfully');
            res.json({ success: true, room });
        }).catch(err => {
            console.error('Error adding room:', err);
            res.status(500).json({ success: false, error: err.message });
        });
    }).catch(err => {
        console.error('Database connection error:', err);
        res.status(500).json({ success: false, error: err.message });
    });
});

app.get("/get-rooms/:UserId", (req, res) => {
    mongoClient.connect(conString).then(clientObj => {
        var db = clientObj.db("roomDb");
        db.collection("rooms").find({ UserId: parseInt(req.params.UserId) }).toArray().then(room => {
            res.json(room)
            console.log(room)
        })
    })
})
app.get("/get-room/:RoomId", (req, res) => {
    mongoClient.connect(conString).then(clientObj => {
        var db = clientObj.db("roomDb");
        db.collection("rooms").findOne({ RoomId: parseInt(req.params.RoomId) }).then(room => {
            res.json(room);  // Sending the appointment data as JSON response
        });
    });
});

app.put("/edit-room/:RoomId", upload.single('image'), (req, res) => {
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
    mongoClient.connect(conString).then(clientObj => {
        var db = clientObj.db("roomDb");
        db.collection("rooms").updateOne(
            { RoomId: parseInt(req.params.RoomId) },
            { $set: room }
        ).then(() => {
            console.log('Room Updated..');
            res.json({ message: 'Room Updated Successfully' });
        });
    });
});

app.delete("/delete-room/:RoomId", (req, res) => {
    mongoClient.connect(conString).then(clientObj => {
        var db = clientObj.db("roomDb");
        db.collection("rooms").deleteOne({ RoomId: parseInt(req.params.RoomId) }).then(() => {
            console.log('Room deleted..');
            res.send(`Room id : ${req.params.RoomId} deleted`);
        });
    });
});

app.get("/get-filtered-rooms", (req, res) => {
    const { price, bedrooms, bathrooms, propertyType, bachelorsAllowed, furnished, parking } = req.query;
    console.log('Received filter parameters:', req.query);

    let filter = {};

    // Apply price filter if provided
    if (price && !isNaN(price)) {
        const priceValue = parseInt(price);
        filter.Price = { $lt: priceValue };  // Strictly less than the specified price
    }

    // Handle bedrooms filter
    if (bedrooms && bedrooms !== '') {
        if (bedrooms === '4') {
            filter.Bedrooms = { $gte: 4 };  // 4 or more bedrooms
        } else {
            filter.Bedrooms = parseInt(bedrooms);  // Exact number of bedrooms
        }
    }

    // Handle bathrooms filter
    if (bathrooms && bathrooms !== '') {
        if (bathrooms === '4') {
            filter.Bathrooms = { $gte: 4 };  // 4 or more bathrooms
        } else {
            filter.Bathrooms = parseInt(bathrooms);  // Exact number of bathrooms
        }
    }

    // Property type filter (case-insensitive)
    if (propertyType && propertyType !== '') {
        filter.PropertyType = new RegExp('^' + propertyType + '$', 'i');
    }

    // Handle boolean filters
    if (bachelorsAllowed && bachelorsAllowed !== '') {
        filter.BachelorsAllowed = bachelorsAllowed === 'true';
    }

    if (furnished && furnished !== '') {
        filter.Furnished = furnished === 'true';
    }

    if (parking && parking !== '') {
        filter.Parking = parking === 'true';
    }

    console.log('Applied filters:', filter);

    // Connect to MongoDB and fetch the filtered rooms
    mongoClient.connect(conString).then(clientObj => {
        var db = clientObj.db("roomDb");

        // Fetch the rooms based on the constructed filter
        db.collection("rooms").find(filter).toArray().then(rooms => {
            console.log(`Found ${rooms.length} rooms matching the criteria`);
            res.json(rooms);
        }).catch(err => {
            console.error('Error fetching rooms:', err);
            res.status(500).json({
                error: "Error fetching rooms",
                details: err.message
            });
        });
    }).catch(err => {
        console.error('Database connection error:', err);
        res.status(500).json({
            error: "Database connection error",
            details: err.message
        });
    });
});

app.listen(5000)
console.log("Server is running at http://127.0.0.1:5000")