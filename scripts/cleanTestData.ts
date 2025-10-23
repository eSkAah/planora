#!/usr/bin/env ts-node
/**
 * Manual cleanup script for E2E test data
 * Run with: npx tsx scripts/cleanTestData.ts
 */

import { PrismaClient } from '../src/generated/prisma';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

// Supabase setup for deleting auth users
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function cleanTestData() {
  console.log('\n🧹 Starting manual E2E test data cleanup...\n');

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

    // Find all test companies
    const testCompanies = await prisma.company.findMany({
      where: {
        OR: testCompanyPatterns.map(pattern => ({
          name: { contains: pattern },
        })),
      },
      include: {
        users: true,
      },
    });

    if (testCompanies.length === 0) {
      console.log('✓ No test companies found. Database is clean!\n');
      return;
    }

    console.log(`📊 Found ${testCompanies.length} test companies:\n`);
    testCompanies.forEach((company, index) => {
      console.log(`   ${index + 1}. ${company.name} (ID: ${company.id})`);
      console.log(`      - Users: ${company.users.length}`);
    });

    console.log('\n⚠️  This will DELETE all test data. Continue? (y/n)');

    // For automated cleanup, we'll proceed automatically
    // In a real script, you might want to prompt for confirmation
    const shouldContinue =
      process.env.AUTO_CONFIRM === 'true' || process.argv.includes('--yes');

    if (!shouldContinue && process.stdin.isTTY) {
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      const answer = await new Promise<string>(resolve => {
        readline.question('', (ans: string) => {
          readline.close();
          resolve(ans);
        });
      });

      if (answer.toLowerCase() !== 'y') {
        console.log('\n❌ Cleanup cancelled.\n');
        return;
      }
    }

    const companyIds = testCompanies.map(c => c.id);
    const userAuthIds = testCompanies.flatMap(c =>
      c.users.map(u => u.id).filter(Boolean)
    );

    console.log(`\n🔍 Total users to delete from Auth: ${userAuthIds.length}`);
    console.log('\n🗑️  Deleting data from database...\n');

    // Delete in order respecting foreign key constraints
    // 0. Delete legacy shifts table if it exists (using raw SQL)
    let shiftsDeleted = 0;
    try {
      shiftsDeleted = await prisma.$executeRaw`
        DELETE FROM shifts WHERE company_id = ANY(${companyIds}::uuid[])
      `;
      console.log(`   ✓ Deleted ${shiftsDeleted} legacy shifts`);
    } catch (error: any) {
      // Table might not exist, that's OK
      if (!error.message?.includes('relation "shifts" does not exist')) {
        console.log(`   ⚠️  Warning deleting shifts: ${error.message}`);
      }
    }

    // 1. Schedule assignments
    const assignmentsDeleted = await prisma.scheduleAssignment.deleteMany({
      where: { companyId: { in: companyIds } },
    });
    console.log(
      `   ✓ Deleted ${assignmentsDeleted.count} schedule assignments`
    );

    // 2. Schedules
    const schedulesDeleted = await prisma.schedule.deleteMany({
      where: { companyId: { in: companyIds } },
    });
    console.log(`   ✓ Deleted ${schedulesDeleted.count} schedules`);

    // 3. Shift templates
    const shiftTemplatesDeleted = await prisma.shiftTemplate.deleteMany({
      where: { companyId: { in: companyIds } },
    });
    console.log(`   ✓ Deleted ${shiftTemplatesDeleted.count} shift templates`);

    // 4. Contracts
    const contractsDeleted = await prisma.contract.deleteMany({
      where: { companyId: { in: companyIds } },
    });
    console.log(`   ✓ Deleted ${contractsDeleted.count} contracts`);

    // 5. Employees
    const employeesDeleted = await prisma.employee.deleteMany({
      where: { companyId: { in: companyIds } },
    });
    console.log(`   ✓ Deleted ${employeesDeleted.count} employees`);

    // 6. Users from database
    const usersDeleted = await prisma.user.deleteMany({
      where: { companyId: { in: companyIds } },
    });
    console.log(`   ✓ Deleted ${usersDeleted.count} users from database`);

    // 7. Companies
    const companiesDeleted = await prisma.company.deleteMany({
      where: { id: { in: companyIds } },
    });
    console.log(`   ✓ Deleted ${companiesDeleted.count} companies`);

    // Delete auth users from Supabase
    let authUsersDeleted = 0;
    if (supabaseUrl && supabaseServiceRoleKey && userAuthIds.length > 0) {
      console.log('\n🔐 Deleting auth users from Supabase...\n');
      const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
      for (const userId of userAuthIds) {
        try {
          const { error } = await supabase.auth.admin.deleteUser(userId);
          if (!error) {
            authUsersDeleted++;
          } else if (
            error.message.includes('not found') ||
            error.message.includes('User not found')
          ) {
            // User already deleted, that's fine
            authUsersDeleted++;
          } else {
            console.error(
              `   ⚠️  Failed to delete auth user ${userId}:`,
              error.message
            );
          }
        } catch (err: any) {
          // Ignore errors for users that don't exist
          if (
            err?.message?.includes('not found') ||
            err?.message?.includes('User not found')
          ) {
            authUsersDeleted++;
          } else {
            console.error(
              `   ⚠️  Error deleting auth user ${userId}:`,
              err?.message || err
            );
          }
        }
      }
      console.log(
        `   ✓ Deleted ${authUsersDeleted}/${userAuthIds.length} auth users`
      );
    } else {
      console.log('\n⚠️  Skipping Supabase Auth cleanup (missing credentials)');
    }

    console.log('\n✅ Cleanup completed successfully!\n');
    console.log('📈 Summary:');
    console.log(`   - Companies: ${companiesDeleted.count}`);
    console.log(`   - Users (database): ${usersDeleted.count}`);
    console.log(`   - Users (auth): ${authUsersDeleted}`);
    console.log(`   - Employees: ${employeesDeleted.count}`);
    console.log(`   - Contracts: ${contractsDeleted.count}`);
    console.log(`   - Schedules: ${schedulesDeleted.count}`);
    console.log(`   - Schedule Assignments: ${assignmentsDeleted.count}`);
    console.log(`   - Shift Templates: ${shiftTemplatesDeleted.count}`);
    console.log(`   - Legacy Shifts: ${shiftsDeleted}\n`);
  } catch (error) {
    console.error('\n❌ Error during cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanTestData()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
