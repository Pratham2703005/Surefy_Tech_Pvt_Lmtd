import express from 'express';
import { body } from 'express-validator';
import {
  createEvent,
  getEventById,
  registerUserForEvent,
  cancelRegistration,
  getUpcomingEvents,
  getEventStats,
} from '../controllers/eventController.js';

const router = express.Router();

// Validation middleware
const createEventValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('dateTime')
    .notEmpty()
    .withMessage('DateTime is required')
    .isISO8601()
    .withMessage('DateTime must be a valid ISO 8601 date string'),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Location must be between 3 and 200 characters'),
  body('capacity')
    .notEmpty()
    .withMessage('Capacity is required')
    .isInt({ min: 1, max: 1000 })
    .withMessage('Capacity must be an integer between 1 and 1000'),
];

const registerValidation = [
  body('userId')
    .optional()
    .isUUID()
    .withMessage('UserId must be a valid UUID'),
  body('userName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('User name must be between 2 and 100 characters'),
  body('userEmail')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
];

// Routes
router.post('/events', createEventValidation, createEvent);
router.get('/events/upcoming', getUpcomingEvents);
router.get('/events/:id', getEventById);
router.get('/events/:id/stats', getEventStats);
router.post('/events/:id/register', registerValidation, registerUserForEvent);
router.delete('/events/:id/register/:userId', cancelRegistration);

export default router;
