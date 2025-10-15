import prisma from '../db/prisma.js';

class User {
  static async create(data) {
    return await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
      },
    });
  }

  static async findByEmail(email) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  static async findById(id) {
    return await prisma.user.findUnique({
      where: { id },
    });
  }

  static async findAll() {
    return await prisma.user.findMany();
  }

  static async delete(id) {
    return await prisma.user.delete({
      where: { id },
    });
  }
}

export default User;
