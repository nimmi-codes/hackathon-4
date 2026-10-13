const router = require('express').Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { signToken, auth } = require('../middleware/auth');

const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role });

router.post('/signup', async (req, res) => {
  const { name, email, password, staffCode } = req.body;
  if (!name?.trim() || !/^\S+@\S+\.\S+$/.test(email || '') || (password || '').length < 6) {
    return res.status(400).json({ message: 'Invalid input' });
  }
  if (await User.findOne({ email: email.toLowerCase() })) {
    return res.status(409).json({ message: 'Email already used' });
  }
  const role = staffCode && staffCode === process.env.ADMIN_PASSWORD ? 'admin' : 'customer';
  const user = await User.create({ name, email, password: await bcrypt.hash(password, 10), role });
  res.status(201).json({ token: signToken(user), user: publicUser(user) });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: (email || '').toLowerCase() });
  if (!user || !(await bcrypt.compare(password || '', user.password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  res.json({ token: signToken(user), user: publicUser(user) });
});

router.get('/me', auth, (req, res) => res.json({ user: publicUser(req.user) }));

module.exports = router;
