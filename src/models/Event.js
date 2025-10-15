import prisma from '../db/prisma.js';

class Event {
  static async create(data) {
    return await prisma.event.create({
      data: {
        title: data.title,
        dateTime: new Date(data.dateTime),
        location: data.location,
        capacity: data.capacity,
      },
    });
  }

  static async findById(id) {
    return await prisma.event.findUnique({
      where: { id },
      include: {
        registrations: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  static async findUpcoming() {
    const now = new Date();
    return await prisma.event.findMany({
      where: {
        dateTime: {
          gt: now,
        },
      },
      orderBy: [
        { dateTime: 'asc' },
        { location: 'asc' },
      ],
      include: {
        _count: {
          select: { registrations: true },
        },
      },
    });
  }

  static async findAll() {
    return await prisma.event.findMany({
      include: {
        _count: {
          select: { registrations: true },
        },
      },
    });
  }

  static async delete(id) {
    return await prisma.event.delete({
      where: { id },
    });
  }

  static async getRegistrationCount(eventId) {
    return await prisma.registration.count({
      where: { eventId },
    });
  }
}

export default Event;
