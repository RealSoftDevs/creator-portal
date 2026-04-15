const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteUser() {
  //const email = 'maninder.birhe@gmail.com'; // Change this to the user's email
  const email = 'dr.charuwagle@gmail.com'; // Change this to the user's email

  try {
    // First delete the user's portal and related data
    const user = await prisma.user.findUnique({
      where: { email: email },
      include: { portal: true }
    });
    
    if (user) {
      // Delete links and products first
      if (user.portal) {
        await prisma.link.deleteMany({ where: { portalId: user.portal.id } });
        await prisma.product.deleteMany({ where: { portalId: user.portal.id } });
        await prisma.portal.delete({ where: { id: user.portal.id } });
      }
      
      // Then delete the user
      await prisma.user.delete({ where: { email: email } });
      console.log(`✅ User ${email} deleted successfully`);
    } else {
      console.log(`❌ User ${email} not found`);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteUser();