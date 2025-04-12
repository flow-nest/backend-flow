import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Create a user
    const user = await prisma.user.create({
        data: {
            username: 'yasser',
            email: 'yasser@gmail.com',
            role: 'ADMIN',
            password: 'yasser@123',
        },
    });

    console.log('Created User:', user);

    // Fetch all users
    const users = await prisma.user.findMany();
    console.log('All Users:', users);
}

main()
    .catch((e) => {
        console.error('❌ Error during Prisma test:', e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
