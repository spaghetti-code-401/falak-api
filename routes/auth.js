const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');

// REGISTER
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // hashing password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // creating user
    const newUser = await new User({
      username,
      email,
      password: hashedPassword
    });

    // saving user
    const user = await newUser.save();
    res.status(201).json(user);
  } catch (e) {
    res.status(500).json({
      error: e,
      msg: 'username or email already signed up'
    });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    !user && res.status(404).send('user not found');

    const validPassword = await bcrypt.compare(password, user.password);
    !validPassword && res.status(400).json('wrong password');

    res.status(200).json(user);
  } catch (e) {
    res.status(500).json(e);
  }
});

module.exports = router;
