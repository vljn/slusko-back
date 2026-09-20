/// <reference types="node" />
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with test data...');

  // Create categories
  const popCategory = await prisma.category.create({
    data: {
      name: 'Pop',
      slug: 'pop',
    },
  });

  const rockCategory = await prisma.category.create({
    data: {
      name: 'Rock',
      slug: 'rock',
    },
  });

  const jazzCategory = await prisma.category.create({
    data: {
      name: 'Jazz',
      slug: 'jazz',
    },
  });

  // Create songs
  const song1 = await prisma.song.create({
    data: {
      spotifyId: 'spotify:track:123',
    },
  });

  const song2 = await prisma.song.create({
    data: {
      spotifyId: 'spotify:track:456',
    },
  });

  const song3 = await prisma.song.create({
    data: {
      spotifyId: 'spotify:track:789',
    },
  });

  // Create users
  const hashedPassword1 = await bcrypt.hash('password123', 10);
  const hashedPassword2 = await bcrypt.hash('password456', 10);

  const user1 = await prisma.user.create({
    data: {
      username: 'musiclover',
      email: 'musiclover@example.com',
      password: hashedPassword1,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      username: 'songmaster',
      email: 'songmaster@example.com',
      password: hashedPassword2,
    },
  });

  // Create challenges
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const challenge1 = await prisma.challenge.create({
    data: {
      startDate: today,
      endDate: tomorrow,
      categoryId: popCategory.id,
      songId: song1.id,
    },
  });

  const challenge2 = await prisma.challenge.create({
    data: {
      startDate: today,
      endDate: tomorrow,
      categoryId: rockCategory.id,
      songId: song2.id,
    },
  });

  const challenge3 = await prisma.challenge.create({
    data: {
      startDate: today,
      endDate: tomorrow,
      categoryId: jazzCategory.id,
      songId: song3.id,
    },
  });

  console.log('✅ Seeding complete!');
  console.log('\n📊 Created:');
  console.log(`   - 3 categories (Pop, Rock, Jazz)`);
  console.log(`   - 3 songs`);
  console.log(`   - 2 users`);
  console.log(`   - 3 challenges`);
  console.log('\n👥 Test users:');
  console.log(`   Email: musiclover@example.com / Password: password123`);
  console.log(`   Email: songmaster@example.com / Password: password456`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
  