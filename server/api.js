var express = require('express');
var app = express();
var cors = require('cors');
var multer = require('multer');
var path = require('path');

var mongoClient = require("mongodb").MongoClient;
var conString = "mongodb://127.0.0.1:27017";
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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
    origin: "http://127.0.0.1:5500",
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
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
        image: req.file ? req.file.path : null,
        UserId: parseInt(req.body.UserId)
    };
    mongoClient.connect(conString).then(clientObj => {
        clientObj.db("roomDb").collection("rooms").insertOne(room).then(() => {
            console.log('Room Added..');
            res.json(room);  // Sending the added appointment as JSON response
        });
    });
})
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
        RoomId: parseInt(req.body.RoomId),
        Description: req.body.Description,
        Price: parseInt(req.body.Price),
        Bedrooms: parseInt(req.body.Bedrooms),
        Furnished: req.body.Furnished === 'true',
        Bathrooms: parseInt(req.body.Bathrooms),
        Parking: req.body.Parking === 'true',
        BachelorsAllowed: req.body.BachelorsAllowed === 'true',
        PropertyType: req.body.PropertyType,
        image: req.file ? req.file.path : null,
        UserId: parseInt(req.body.UserId)
    };
    mongoClient.connect(conString).then(clientObj => {
        var db = clientObj.db("roomDb");
        db.collection("rooms").updateOne(
            { RoomId: parseInt(req.params.RoomId) },
            { $set: room }
        ).then(() => {
            console.log('Room Updated..');
            res.send(room);
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

    let filter = {};

    // Apply price filter if provided
    if (price) {
        filter.Price = { $lte: parseInt(price) };
    }

    // Handle bedrooms filter
    if (bedrooms) {
        if (bedrooms === '4') {
            filter.Bedrooms = { $gte: 4 };  // For 4+ Bedrooms (greater than or equal to 4)
        } else {
            filter.Bedrooms = { $lte: parseInt(bedrooms) };  // For specific number of Bedrooms (less than or equal to selected value)
        }
    }

    // Handle bathrooms filter
    if (bathrooms) {
        if (bathrooms === '4') {
            filter.Bathrooms = { $gte: 4 };  // For 4+ Bathrooms (greater than or equal to 4)
        } else {
            filter.Bathrooms = { $lte: parseInt(bathrooms) };  // For specific number of Bathrooms (less than or equal to selected value)
        }
    }

    // Property type filter
    if (propertyType) {
        filter.PropertyType = propertyType;
    }

    // Handle bachelorsAllowed filter (true/false)
    if (bachelorsAllowed !== undefined) {
        filter.BachelorsAllowed = bachelorsAllowed === 'true';
    }

    // Handle furnished filter (true/false)
    if (furnished !== undefined) {
        filter.Furnished = furnished === 'true';
    }

    // Handle parking filter (true/false)
    if (parking !== undefined) {
        filter.Parking = parking === 'true';
    }

    // Connect to MongoDB and fetch the filtered rooms
    mongoClient.connect(conString).then(clientObj => {
        var db = clientObj.db("roomDb");

        // Fetch the rooms based on the constructed filter
        db.collection("rooms").find(filter).toArray().then(rooms => {
            res.json(rooms);
            console.log('Filtered rooms:', rooms);
        }).catch(err => {
            res.status(500).send("Error fetching rooms: " + err.message);
        });
    }).catch(err => {
        res.status(500).send("Database connection error: " + err.message);
    });
});

app.listen(5000)
console.log("Server is running at http://127.0.0.1:5000")