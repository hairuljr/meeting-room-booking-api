import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting database seeding...');

    // Create admin user
    const adminPassword = await bcrypt.hash('Admin123!', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@radio.cloud' },
        update: {},
        create: {
            email: 'admin@radio.cloud',
            password: adminPassword,
            name: 'Admin User',
            role: UserRole.ADMIN,
        },
    });
    console.log('Created admin user:', admin.email);

    // Create regular user for testing
    const userPassword = await bcrypt.hash('User123!', 10);
    const user = await prisma.user.upsert({
        where: { email: 'user@radio.cloud' },
        update: {},
        create: {
            email: 'user@radio.cloud',
            password: userPassword,
            name: 'Regular User',
            role: UserRole.USER,
        },
    });
    console.log('Created regular user:', user.email);

    // Create sample rooms
    const rooms = [
        {
            name: 'Meeting Room A',
            capacity: 10,
            location: 'Floor 1',
            description: 'Small meeting room with projector and whiteboard',
        },
        {
            name: 'Meeting Room B',
            capacity: 20,
            location: 'Floor 2',
            description: 'Medium meeting room with video conferencing facilities',
        },
        {
            name: 'Conference Hall',
            capacity: 50,
            location: 'Floor 3',
            description: 'Large conference hall with stage and sound system',
        },
        {
            name: 'Board Room',
            capacity: 15,
            location: 'Floor 4',
            description: 'Executive board room with premium furniture',
        },
        {
            name: 'Training Room',
            capacity: 30,
            location: 'Floor 2',
            description: 'Training room with computers and projector',
        },
    ];

    for (const room of rooms) {
        const createdRoom = await prisma.room.upsert({
            where: { name: room.name },
            update: {},
            create: room,
        });
        console.log('Created room:', createdRoom.name);
    }

    console.log('Database seeding completed!');
    console.log('\nTest credentials:');
    console.log('Admin: admin@radio.cloud / Admin123!');
    console.log('User: user@radio.cloud / User123!');
}

main()
    .catch((e) => {
        console.error('Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
