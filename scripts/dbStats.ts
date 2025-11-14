#!/usr/bin/env ts-node
/**
 * Database statistics script
 * Shows current state of the database with counts
 * Run with: npx tsx scripts/dbStats.ts
 */

import { PrismaClient } from '../src/generated/prisma';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function showDatabaseStats() {
  console.log('\n📊 Database Statistics\n');

  try {
    // Get counts of all tables
    const [
      companiesCount,
      usersCount,
      employeesCount,
      contractsCount,
      schedulesCount,
      assignmentsCount,
      shiftTemplatesCount,
    ] = await Promise.all([
      prisma.company.count(),
      prisma.user.count(),
      prisma.employee.count(),
      prisma.contract.count(),
      prisma.schedule.count(),
      prisma.scheduleAssignment.count(),
      prisma.shiftTemplate.count(),
    ]);

    // Get test companies count
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

    const testCompaniesCount = await prisma.company.count({
      where: {
        OR: testCompanyPatterns.map(pattern => ({
          name: { contains: pattern },
        })),
      },
    });

    console.log('📈 Total Records:');
    console.log(`   Companies: ${companiesCount}`);
    console.log(`   Users: ${usersCount}`);
    console.log(`   Employees: ${employeesCount}`);
    console.log(`   Contracts: ${contractsCount}`);
    console.log(`   Schedules: ${schedulesCount}`);
    console.log(`   Schedule Assignments: ${assignmentsCount}`);
    console.log(`   Shift Templates: ${shiftTemplatesCount}`);

    console.log('\n🧪 Test Data:');
    console.log(`   Test Companies: ${testCompaniesCount}`);

    if (testCompaniesCount > 0) {
      console.log('\n⚠️  Warning: Test data detected!');
      console.log('💡 Run: npm run test:e2e:clean\n');
    } else {
      console.log('   ✅ No test data found\n');
    }
  } catch (error) {
    console.error('❌ Error fetching database stats:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the stats
showDatabaseStats()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
