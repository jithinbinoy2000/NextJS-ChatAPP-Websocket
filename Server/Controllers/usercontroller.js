const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../Schemas/userSchema');
const JWT_SECRET = "abcd";

// Register User
module.exports.registerUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hashing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user instance
    const user = new User({ username, encPassword: hashedPassword, online: false });

    // Save user
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error in registerUser:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
};

// Login User
module.exports.loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare password => hashed
    const isMatch = await bcrypt.compare(password, user.encPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Update user's online status
    user.online = true;
    await user.save();
   
   
    // Generate token
    const token = jwt.sign({username:user.username},JWT_SECRET, { expiresIn: '6h' });

    res.status(200).json({ message: 'User logged in successfully', token,username});
  } catch (error) {
    console.error('Error in loginUser:', error);
    res.status(500).json({ message: 'Error logging in user' });
  }
};
