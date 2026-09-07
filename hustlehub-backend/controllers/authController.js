
const UserModel = require('../models/userModel');

// POST /api/auth/register
exports.register = (req, res) => {
  const { name, email, password } = req.body;

  // Edge Case 1: Missing required fields
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields: name, email, and password.',
    });
  }

  // Edge Case 2: Duplicate email registration
  const existingUser = UserModel.findByEmail(email);
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: 'User with this email already exists.',
    });
  }

  // Create new user
  const newUser = UserModel.create({ name, email, password });

  return res.status(201).json({
    success: true,
    message: 'User registered successfully.',
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    },
  });
};

// POST /api/auth/login
exports.login = (req, res) => {
  const { email, password } = req.body;

  // Edge Case 1: Missing login fields
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide both email and password.',
    });
  }

  // Find user by email
  const user = UserModel.findByEmail(email);

  // Edge Case 2: User not found or incorrect password
  if (!user || user.password !== password) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password.',
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Login successful.',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });

// controllers/authController.js
const users = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// POST /register
exports.registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please provide all required fields (name, email, password).' });
    }

    // users is now correctly recognized as an array
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists.' });
    }

    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = {
            id: users.length + 1,
            name,
            email,
            password: hashedPassword,
            role: role || 'Client' 
        };

        users.push(newUser); // Push to the in-memory array

        res.status(201).json({
            message: 'User registered successfully.',
            user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error during password hashing.' });
    }
};

// POST /login
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password.' });
    }

    try {
        const user = users.find(u => u.email === email);
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const payload = {
            id: user.id,
            role: user.role
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({
            message: 'Login successful.',
            token: token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error during token generation.' });
    }
}}

/*Disclosure of AI Usage in the Assessment: 
- Section which generative AI was used: POE Part 1
- Name of AI tool used: Gemini AI 
- Purpose/Intention behind use: I used Gemini AI as a support tool to help fix coding errors, assist with building the API. 
- Date in which generative AI was used: 1 September 2025 
- Link to the generative AI: https://gemini.google.com/app/27518195c9725d45
*/