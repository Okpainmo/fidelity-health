/**
 * Gives an existing account admin rights (there's deliberately no API for this).
 *
 *   bun run admin:make person@example.com
 *
 * The person signs up normally first; after this they'll see "Admin dashboard"
 * in their account menu (log out and back in to refresh it).
 */
import { prisma } from '../lib/prisma.js';

const email = process.argv[2]?.trim().toLowerCase();

if (!email) {
  console.error('Usage: bun run admin:make <email>');
  process.exit(1);
}

const user = await prisma.user.findFirst({ where: { email: { equals: email, mode: 'insensitive' } } });

if (!user) {
  console.error(`No account found for ${email}. Sign up first, then run this again.`);
  process.exit(1);
}

await prisma.user.update({ where: { id: user.id }, data: { isAdmin: true, isActive: true } });
console.log(`${user.email} is now an admin.`);
await prisma.$disconnect();
