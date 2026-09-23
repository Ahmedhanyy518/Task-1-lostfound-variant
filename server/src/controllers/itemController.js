import Joi from 'joi';
import { Item } from '../models/Item.js';

const CATEGORIES = ['electronics', 'clothing', 'documents', 'accessories', 'other'];
const STATUSES = ['lost', 'found', 'claimed'];

// Full schema for create — title is required, everything else has defaults.
const createSchema = Joi.object({
  title: Joi.string().trim().min(1).required(),
  description: Joi.string().trim().allow('', null),
  category: Joi.string().valid(...CATEGORIES),
  status: Joi.string().valid(...STATUSES),
  location: Joi.string().trim().allow('', null),
  reportedBy: Joi.string().hex().length(24) // Mongo ObjectId as a 24-char hex string
});

// Update schema — same shape but nothing is required; you can PATCH any subset.
const updateSchema = Joi.object({
  title: Joi.string().trim().min(1),
  description: Joi.string().trim().allow('', null),
  category: Joi.string().valid(...CATEGORIES),
  status: Joi.string().valid(...STATUSES),
  location: Joi.string().trim().allow('', null),
  reportedBy: Joi.string().hex().length(24)
}).min(1); // require at least one field on a PATCH, otherwise it's a no-op request

// GET /api/items
export async function getAllItems(req, res, next) {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.category) filter.category = req.query.category;

    const items = await Item.find(filter).populate('reportedBy', 'name email');
    res.json(items);
  } catch (err) {
    next(err);
  }
}

// GET /api/items/:id
export async function getItem(req, res, next) {
  try {
    const item = await Item.findById(req.params.id).populate('reportedBy', 'name email');
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
}

// POST /api/items
export async function createItem(req, res, next) {
  try {
    const { error, value } = createSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const item = await Item.create(value);
    res.status(201).json(item);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'This item was already reported at this location' });
    }
    next(err);
  }
}

// PATCH /api/items/:id
export async function updateItem(req, res, next) {
  try {
    const { error, value } = updateSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const item = await Item.findByIdAndUpdate(req.params.id, value, {
      new: true,
      runValidators: true
    });
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'This item was already reported at this location' });
    }
    next(err);
  }
}

// DELETE /api/items/:id
export async function deleteItem(req, res, next) {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}