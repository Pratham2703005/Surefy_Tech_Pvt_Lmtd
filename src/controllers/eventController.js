import { validationResult } from 'express-validator';
import Event from '../models/Event.js';
import User from '../models/User.js';
import Registration from '../models/Registration.js';

export const createEvent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, dateTime, location, capacity } = req.body;

    // Validate capacity
    if (capacity > 1000) {
      return res.status(400).json({ 
        error: 'Capacity cannot exceed 1000' 
      });
    }

    const event = await Event.create({
      title,
      dateTime,
      location,
      capacity,
    });

    return res.status(201).json({
      message: 'Event created successfully',
      event,
    });
  } catch (error) {
    console.error('Error creating event:', error);
    return res.status(500).json({ 
      error: 'Failed to create event',
      details: error.message 
    });
  }
};

export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Format the response with registered users
    const registeredUsers = event.registrations.map(reg => reg.user);

    return res.status(200).json({
      id: event.id,
      title: event.title,
      dateTime: event.dateTime,
      location: event.location,
      capacity: event.capacity,
      registeredUsers,
      totalRegistrations: registeredUsers.length,
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch event',
      details: error.message 
    });
  }
};

export const registerUserForEvent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id: eventId } = req.params;
    const { userId, userName, userEmail } = req.body;

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if event is in the past
    if (new Date(event.dateTime) < new Date()) {
      return res.status(400).json({ 
        error: 'Cannot register for past events' 
      });
    }

    // Create or find user
    let user;
    if (userId) {
      user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
    } else if (userName && userEmail) {
      // Check if user exists by email
      user = await User.findByEmail(userEmail);
      if (!user) {
        // Create new user
        user = await User.create({ name: userName, email: userEmail });
      }
    } else {
      return res.status(400).json({ 
        error: 'Either userId or both userName and userEmail are required' 
      });
    }

    // Check for duplicate registration
    const existingRegistration = await Registration.findByUserAndEvent(
      user.id,
      eventId
    );

    if (existingRegistration) {
      return res.status(400).json({ 
        error: 'User is already registered for this event' 
      });
    }

    // Check if event is full
    const currentRegistrations = await Registration.countByEvent(eventId);
    if (currentRegistrations >= event.capacity) {
      return res.status(400).json({ 
        error: 'Event is at full capacity' 
      });
    }

    // Create registration
    const registration = await Registration.create(user.id, eventId);

    return res.status(201).json({
      message: 'Successfully registered for event',
      registration,
    });
  } catch (error) {
    console.error('Error registering for event:', error);
    
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return res.status(400).json({ 
        error: 'User is already registered for this event' 
      });
    }

    return res.status(500).json({ 
      error: 'Failed to register for event',
      details: error.message 
    });
  }
};

export const cancelRegistration = async (req, res) => {
  try {
    const { id: eventId, userId } = req.params;

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if registration exists
    const registration = await Registration.findByUserAndEvent(userId, eventId);
    if (!registration) {
      return res.status(404).json({ 
        error: 'Registration not found. User is not registered for this event' 
      });
    }

    // Delete registration
    await Registration.delete(userId, eventId);

    return res.status(200).json({
      message: 'Registration cancelled successfully',
    });
  } catch (error) {
    console.error('Error cancelling registration:', error);
    
    // Handle record not found
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        error: 'Registration not found' 
      });
    }

    return res.status(500).json({ 
      error: 'Failed to cancel registration',
      details: error.message 
    });
  }
};

export const getUpcomingEvents = async (req, res) => {
  try {
    const events = await Event.findUpcoming();

    const formattedEvents = events.map(event => ({
      id: event.id,
      title: event.title,
      dateTime: event.dateTime,
      location: event.location,
      capacity: event.capacity,
      registrations: event._count.registrations,
      availableSpots: event.capacity - event._count.registrations,
    }));

    return res.status(200).json({
      count: formattedEvents.length,
      events: formattedEvents,
    });
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch upcoming events',
      details: error.message 
    });
  }
};

export const getEventStats = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const totalRegistrations = event.registrations.length;
    const remainingCapacity = event.capacity - totalRegistrations;
    const percentageUsed = ((totalRegistrations / event.capacity) * 100).toFixed(2);

    return res.status(200).json({
      eventId: event.id,
      eventTitle: event.title,
      capacity: event.capacity,
      totalRegistrations,
      remainingCapacity,
      percentageUsed: parseFloat(percentageUsed),
      isFull: remainingCapacity === 0,
    });
  } catch (error) {
    console.error('Error fetching event stats:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch event statistics',
      details: error.message 
    });
  }
};
