#!/usr/bin/env ts-node
/**
 * Verification script to check if test data cleanup was successful
 * Run with: npx tsx scripts/verifyCleanup.ts
 */

import { PrismaClient } from '../src/generated/prisma';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function verifyCleanup() {
  console.log('\n🔍 Verifying E2E test data cleanup...\n');

  try {
    // Test company name patterns
    const testCompanyPatterns = [
      'Test',
      'E2E',
      'Workflow',
      'Dashboard',
      'Planning',
      'Leaves',
      'Schedule',
      'Form',
      'Empty',
      'AI',
      'Company ', // Matches "Company 1234567890"
    ];

    // Find remaining test companies
    const remainingCompanies = await prisma.company.findMany({
      where: {
        OR: testCompanyPatterns.map(pattern => ({
          name: { contains: pattern },
        })),
      },
      include: {
        users: true,
        employees: true,
        contracts: true,
        schedules: true,
        shiftTemplates: true,
        scheduleAssignments: true,
      },
    });

    if (remainingCompanies.length === 0) {
      console.log('✅ SUCCESS: Database is clean! No test data found.\n');
      return;
    }

    console.log(
      `⚠️  WARNING: Found ${remainingCompanies.length} test companies remaining:\n`
    );

    for (const company of remainingCompanies) {
      console.log(`❌ Company: ${company.name} (ID: ${company.id})`);
      console.log(`   - Users: ${company.users.length}`);
      console.log(`   - Employees: ${company.employees.length}`);
      console.log(`   - Contracts: ${company.contracts.length}`);
      console.log(`   - Schedules: ${company.schedules.length}`);
      console.log(
        `   - Schedule Assignments: ${company.scheduleAssignments.length}`
      );
      console.log(`   - Shift Templates: ${company.shiftTemplates.length}\n`);
    }

    console.log('💡 Run cleanup script to remove remaining test data:');
    console.log('   npm run test:e2e:clean\n');
  } catch (error) {
    console.error('❌ Error during verification:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the verification
verifyCleanup()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
