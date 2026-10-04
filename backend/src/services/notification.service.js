const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createNotification({ userId, type, title, message }) {
  return await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
    }
  });
}

module.exports = {
  createNotification
};
