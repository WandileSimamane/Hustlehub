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
};