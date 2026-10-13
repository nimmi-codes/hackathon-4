const router = require('express').Router();
const Claim = require('../models/Claim');
const Item = require('../models/Item');
const { auth, adminOnly } = require('../middleware/auth');

router.use(auth);

router.post('/', async (req, res) => {
  const { itemId, proof, contact } = req.body;
  if (!proof?.trim() || !contact?.trim()) return res.status(400).json({ message: 'Invalid input' });
  const item = await Item.findById(itemId).catch(() => null);
  if (!item || item.type !== 'found' || item.status !== 'Approved') {
    return res.status(404).json({ message: 'Item not available for claims' });
  }
  if (await Claim.findOne({ item: item._id, claimant: req.user._id, status: { $ne: 'Returned' } })) {
    return res.status(409).json({ message: 'You already claimed this item' });
  }
  res.status(201).json(await Claim.create({ item: item._id, claimant: req.user._id, proof, contact }));
});

router.get('/mine', async (req, res) =>
  res.json(await Claim.find({ claimant: req.user._id }).populate('item', 'name category').sort('-createdAt'))
);

router.get('/', adminOnly, async (req, res) =>
  res.json(
    await Claim.find().populate('item', 'name category location').populate('claimant', 'name email').sort('-createdAt')
  )
);

router.put('/:id', adminOnly, async (req, res) => {
  if (!['Pending', 'Verified', 'Returned'].includes(req.body.status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  const claim = await Claim.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true }).catch(() => null);
  if (!claim) return res.status(404).json({ message: 'Claim not found' });
  if (claim.status === 'Returned') await Item.findByIdAndUpdate(claim.item, { status: 'Returned' });
  res.json(claim);
});

router.delete('/:id', async (req, res) => {
  const claim = await Claim.findById(req.params.id).catch(() => null);
  if (!claim) return res.status(404).json({ message: 'Claim not found' });
  const isAdmin = req.user.role === 'admin';
  if (!isAdmin && !(claim.claimant.equals(req.user._id) && claim.status === 'Pending')) {
    return res.status(403).json({ message: 'Only your own pending claims can be deleted' });
  }
  await claim.deleteOne();
  res.json({ message: 'Claim deleted' });
});

module.exports = router;
