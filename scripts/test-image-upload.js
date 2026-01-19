const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testImageUpload() {
    console.log('Testing image upload simulation...');

    // Check if we can create a LotImage
    try {
        const testImage = await prisma.lotImage.create({
            data: {
                lotId: 21,
                eventId: null,
                url: 'https://test.com/test.jpg',
                caption: 'Test image'
            }
        });
        console.log('✓ Successfully created test image:', testImage.id);

        // Clean up
        await prisma.lotImage.delete({
            where: { id: testImage.id }
        });
        console.log('✓ Cleaned up test image');
    } catch (e) {
        console.error('✗ Failed to create image:', e.message);
    }
}

testImageUpload()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
