// delete-users-batch.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Edit this list with the emails you want to delete
const emailsToDelete = [
  'maninder.birhe@gmail.com',
  'maninder.test@gmail.com',
  // Add more emails here
];

async function deleteUsers() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🗑️ BATCH USER DELETION');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📧 Total emails to process: ${emailsToDelete.length}\n`);

  let deleted = 0;
  let notFound = 0;
  let errors = 0;

  for (const email of emailsToDelete) {
    console.log(`Processing: ${email}`);

    try {
      const user = await prisma.user.findUnique({
        where: { email },
        include: { portal: true }
      });

      if (!user) {
        console.log(`   ❌ User not found\n`);
        notFound++;
        continue;
      }

      console.log(`   ✅ Found: ${user.name || 'No name'}`);

      if (user.portal) {
        await prisma.link.deleteMany({ where: { portalId: user.portal.id } });
        await prisma.product.deleteMany({ where: { portalId: user.portal.id } });
        await prisma.portal.delete({ where: { id: user.portal.id } });
        console.log(`   ✅ Deleted portal data`);
      }

      await prisma.user.delete({ where: { email } });
      console.log(`   ✅ Deleted user\n`);
      deleted++;

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}\n`);
      errors++;
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Successfully deleted: ${deleted}`);
  console.log(`❌ Not found: ${notFound}`);
  console.log(`⚠️ Errors: ${errors}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  await prisma.$disconnect();
}

// Confirm before deletion
console.log('\n⚠️ WARNING: You are about to delete the following users:');
emailsToDelete.forEach(email => console.log(`   - ${email}`));
console.log('');

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Type "yes" to confirm deletion: ', async (answer) => {
  if (answer.toLowerCase() === 'yes') {
    await deleteUsers();
  } else {
    console.log('Deletion cancelled.');
    await prisma.$disconnect();
  }
  rl.close();
});