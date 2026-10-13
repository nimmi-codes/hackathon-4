const router = require('express').Router();
const Category = require('../models/Category');
const { auth, adminOnly } = require('../middleware/auth');

router.use(auth);

router.get('/', async (req, res) => res.json(await Category.find().sort('name')));

router.post('/', adminOnly, async (req, res) => {
  const name = (req.body.name || '').trim();
  if (!name) return res.status(400).json({ message: 'Invalid input' });
  if (await Category.findOne({ name })) return res.status(409).json({ message: 'Category already exists' });
  res.status(201).json(await Category.create({ name }));
});

router.put('/:id', adminOnly, async (req, res) => {
  const name = (req.body.name || '').trim();
  if (!name) return res.status(400).json({ message: 'Invalid input' });
  const cat = await Category.findByIdAndUpdate(req.params.id, { name }, { new: true });
  if (!cat) return res.status(404).json({ message: 'Not found' });
  res.json(cat);
});

router.delete('/:id', adminOnly, async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ message: 'Category deleted' });
});

module.exports = router;
