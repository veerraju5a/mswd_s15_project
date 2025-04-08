const express=require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const User=require('./models/User');
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt=require("jsonwebtoken");
const authMiddleware = require("./middleware/auth");
const authorizeRole = require("./middleware/authorizeRole");

const app=express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = "veerraju123";

const mongoURI = process.env.mongoURI;
mongoose.connect(mongoURI).then(() => {
    console.log("Connected to MongoDB Atlas successfully");
}).catch((error) => {
    console.log("MongoDB Atlas connection error:", error);
});

app.get('/', (req, res)=>{
    res.send("<h1>Welcome to Express </h1>");
});

app.post('/users', async (req, res)=>{
    try{
        const {name, email, phone, password, confirmpassword, role}=req.body;
        console.log(name, email, phone, password, confirmpassword, role);
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser=new User({name, email, phone, password: hashedPassword, confirmpassword, role});
        console.log("test1");
        const existingUser = await User.findOne({ email });
        console.log("test2", existingUser);
        if (existingUser) {
            console.log("test3");
            return res.status(400).json({ message: "Email already exists" });
           
        }
        
        await newUser.save();
        console.log("test4");
        res.status(201).json({message:"user created successfully"});
        console.log("test5");
    }catch(error){
        res.status(401).json({ error: error.message });
    }  
});
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(email, password);
        const user = await User.findOne({ email });
        console.log("test1")
        if (!user) {
            console.log("test2")
            return res.status(400).json({ message: "Invalid email or password" });
        }
        console.log("test3")
        const isMatch = await bcrypt.compare(password, user.password);
        console.log("test4")
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        const token=jwt.sign({id: user.id, email: user.email, role: user.role}, JWT_SECRET, 
            {expiresIn: "1h"},);
        console.log("test5")
        res.status(200).json({ message: "Login successful", token });
        console.log("test6")
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/profile", authMiddleware, async (req, res) => {
    const user = await User.findById(req.user.id).select("-password");
    res.json({ user });
  });

  app.get("/admin", authMiddleware, authorizeRole("admin"), (req, res) => {
    res.json({ message: "Welcome admin!" });
  });
  
  app.get("/user-dashboard", authMiddleware, authorizeRole("user", "admin"), (req, res) => {
    res.json({ message: "Welcome user!" });
  });

app.get('/getusers', async (req, res) => {
    try {
        const users = await User.find(); // Fetch all users
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/updateuser/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const {name, email, phone, password, confirmpassword, role}  = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {name, email, phone, password, confirmpassword, role},
            { new: true, runValidators: true } // Returns the updated document
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User updated successfully", user: updatedUser });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

//  **Delete (DELETE) - Delete a User by ID**
app.delete('/deleteuser/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// **Update (PUT) - Update a User by Name**
app.put('/users/name/:name', async (req, res) => {
    try {
        const userName = req.params.name;
        const { name, email, age } = req.body;

        const updatedUser = await User.findOneAndUpdate(
            { name: userName }, // Find by name
            { name, email, age },
            { new: true, runValidators: true } // Return updated document
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User updated successfully", user: updatedUser });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

//  **Delete (DELETE) - Delete a User by Name**
app.delete('/users/name/:name', async (req, res) => {
    try {
        const userName = req.params.name;
        const deletedUser = await User.findOneAndDelete({ name: userName });

        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT=3000;

app.listen(PORT, ()=>{
    console.log(`Express server is running on port no ${PORT}`);
})