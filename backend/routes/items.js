const router = require('express').Router();
const Item = require('../models/Item');
const Claim = require('../models/Claim');
const { auth, adminOnly } = require('../middleware/auth');

router.use(auth);

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const FIELDS = ['type', 'name', 'category', 'description', 'location', 'date', 'contact', 'imageUrl'];
const pick = (body) => Object.fromEntries(FIELDS.filter((k) => body[k] !== undefined).map((k) => [k, body[k]]));
const valid = (d) => d.type && d.name?.trim() && d.category && d.location?.trim() && d.date && !isNaN(new Date(d.date));

// Browse approved found items (search by keyword, category, location, date)
router.get('/found', async (req, res) => {
  const { q, category, location, date } = req.query;
  const filter = { type: 'found', status: 'Approved' };
  if (q) {
    const re = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ name: re }, { description: re }];
  }
  if (category) filter.category = category;
  if (location) filter.location = new RegExp(escapeRegex(location), 'i');
  if (date) {
    const start = new Date(date);
    if (!isNaN(start)) filter.date = { $gte: start, $lt: new Date(start.getTime() + 86400000) };
  }
  res.json(await Item.find(filter).sort('-date'));
});

router.get('/mine', async (req, res) => res.json(await Item.find({ reporter: req.user._id }).sort('-createdAt')));

// Staff: every item
router.get('/', adminOnly, async (req, res) => {
  const filter = req.query.type ? { type: req.query.type } : {};
  res.json(await Item.find(filter).populate('reporter', 'name email').sort('-createdAt'));
});

router.get('/:id', async (req, res) => {
  const item = await Item.findById(req.params.id).catch(() => null);
  if (!item) return res.status(404).json({ message: 'Item not found' });
  const own = item.reporter?.equals(req.user._id);
  if (item.status !== 'Approved' && !own && req.user.role !== 'admin') {
    return res.status(404).json({ message: 'Item not found' });
  }
  res.json(item);
});

router.post('/', async (req, res) => {
  const data = pick(req.body);
  if (!valid(data)) return res.status(400).json({ message: 'Invalid input' });
  const isAdmin = req.user.role === 'admin';
  const status = isAdmin && ['Pending', 'Approved', 'Rejected', 'Returned'].includes(req.body.status) ? req.body.status : isAdmin ? 'Approved' : 'Pending';
  res.status(201).json(await Item.create({ ...data, status, reporter: req.user._id }));
});

router.put('/:id', adminOnly, async (req, res) => {
  const data = pick(req.body);
  if (req.body.status) data.status = req.body.status;
  const item = await Item.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true }).catch(() => null);
  if (!item) return res.status(404).json({ message: 'Item not found' });
  res.json(item);
});

router.delete('/:id', async (req, res) => {
  const item = await Item.findById(req.params.id).catch(() => null);
  if (!item) return res.status(404).json({ message: 'Item not found' });
  const isAdmin = req.user.role === 'admin';
  if (!isAdmin && !(item.reporter?.equals(req.user._id) && item.status === 'Pending')) {
    return res.status(403).json({ message: 'Only your own pending reports can be deleted' });
  }
  await Claim.deleteMany({ item: item._id });
  await item.deleteOne();
  res.json({ message: 'Item deleted' });
});

module.exports = router;
