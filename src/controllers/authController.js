const jwt = require("jsonwebtoken")
const User = require('../models/User')

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
};

exports.register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const userExists = await User.findOne({ email })
        if (userExists)
            return res.status(400).json({message: "Email is already in use" })

        const user = await User.create({name, email, password})

        res.status(201).json({
            token: generateToken(user._id),
            user: {id: user._id, name: user.name, email: user.email},
        });
        console.log("Senha criptografada", user.password)
    } catch (error) {
        res.status(500).json({message: "Error to register", error: error.message})
    };
};

exports.login = async (req, res) => {
    const {email, password} = req.body

    try {
        const user = await User.findOne({email})
        if(!user) return res.status(400).json({message: "User not found"})
        
        const isMatch = await user.comparePassword(password)
        if(!isMatch)
            return res.status(401).json({message: "Invalid email or password"})
        
        res.json({
            token: generateToken(user._id),
            user: {id: user._id, name: user.name, email: user.email},
        });
    } catch (error) {
        res.status(500).json({message: "Error to login"})
    }
}

