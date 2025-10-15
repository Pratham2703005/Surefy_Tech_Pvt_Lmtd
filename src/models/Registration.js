import prisma from '../db/prisma.js';

class Registration {
  static async create(userId, eventId) {
    return await prisma.registration.create({
      data: {
        userId,
        eventId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            dateTime: true,
            location: true,
          },
        },
      },
    });
  }

  static async findByUserAndEvent(userId, eventId) {
    return await prisma.registration.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
    });
  }

  static async delete(userId, eventId) {
    return await prisma.registration.delete({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
    });
  }

  static async countByEvent(eventId) {
    return await prisma.registration.count({
      where: { eventId },
    });
  }
}

export default Registration;
