const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());
app.use(passport.initialize());

let users = [];
let hotels = [];

passport.use(new LocalStrategy(async (username, password, done) => {
    try {
        const user = users.find(u => u.username === username);

        if (!user) {
            return done(null, false, { message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return done(null, false, { message: "Wrong password" });
        }

        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));

const isAuthenticated = passport.authenticate('local', { session: false });


app.get("/", (req, res) => {
    res.send("Welcome to Hotel API");
});

app.post("/register", async (req, res) => {
    try {
        if (users.find(u => u.username === req.body.username)) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const newUser = {
            id: users.length + 1,
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword
        };

        users.push(newUser);

        res.json({ message: "User registered successfully" });

    } catch (err) {
        res.status(500).json(err);
    }
});

app.post("/login", isAuthenticated, (req, res) => {
    res.json({ message: "Login successful" });
});

app.get("/hotels", (req, res) => {

    if (req.query.rating) {
        return res.json(hotels.filter(h => h.rating == req.query.rating));
    }

    res.json(hotels);
});

app.get("/hotels/:id", (req, res) => {
    const hotel = hotels.find(h => h.id == req.params.id);

    if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
    }

    res.json(hotel);
});

app.post("/hotels", isAuthenticated, (req, res) => {

    if (hotels.find(h => h.name === req.body.name)) {
        return res.status(400).json({ message: "Hotel already exists" });
    }

    const newHotel = {
        id: hotels.length + 1,
        name: req.body.name,
        location: req.body.location,
        rating: req.body.rating,
        pricePerNight: req.body.pricePerNight
    };

    hotels.push(newHotel);

    res.json({ message: "Hotel added", hotel: newHotel });
});

app.put("/hotels/:id", isAuthenticated, (req, res) => {
    const hotel = hotels.find(h => h.id == req.params.id);

    if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
    }

    hotel.name = req.body.name || hotel.name;
    hotel.location = req.body.location || hotel.location;
    hotel.rating = req.body.rating || hotel.rating;
    hotel.pricePerNight = req.body.pricePerNight || hotel.pricePerNight;

    res.json({ message: "Hotel updated", hotel });
});

app.delete("/hotels/:id", isAuthenticated, (req, res) => {
    const hotel = hotels.find(h => h.id == req.params.id);

    if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
    }

    hotels = hotels.filter(h => h.id != req.params.id);

    res.json({ message: "Hotel deleted" });
});

app.listen(4000, () => {
    console.log("Server running on http://localhost:4000");
});
