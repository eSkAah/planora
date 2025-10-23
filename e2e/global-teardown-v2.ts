import { PrismaClient } from '../src/generated/prisma';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { testDataTracker } from './testDataTracker';

// Load environment variables
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Global teardown script for E2E tests (V2)
 * Uses tracked IDs for precise cleanup
 */
async function globalTeardown() {
  console.log('\n🧹 Starting E2E test cleanup (Tracked IDs)...');

  const prisma = new PrismaClient();
  const trackedData = testDataTracker.getData();
  const stats = testDataTracker.getStats();

  try {
    if (stats.total === 0) {
      console.log('✓ No tracked test data found to clean up');
      return;
    }

    console.log(`📊 Found ${stats.total} tracked records:`);
    console.log(`   - Companies: ${stats.companies}`);
    console.log(`   - Users: ${stats.users}`);
    console.log(`   - Employees: ${stats.employees}`);
    console.log(`   - Contracts: ${stats.contracts}`);
    console.log(`   - Schedules: ${stats.schedules}`);
    console.log(`   - Schedule Assignments: ${stats.scheduleAssignments}`);
    console.log(`   - Shift Templates: ${stats.shiftTemplates}`);

    console.log('\n🗑️  Deleting tracked test data...');

    // Count deletions for reporting
    let deletionCounts = {
      shifts: 0,
      scheduleAssignments: 0,
      schedules: 0,
      shiftTemplates: 0,
      contracts: 0,
      employees: 0,
      users: 0,
      companies: 0,
      authUsers: 0,
    };

    // 0. Delete legacy shifts table if it exists (using raw SQL)
    if (trackedData.companyIds.length > 0) {
      try {
        const shiftsResult = await prisma.$executeRaw`
          DELETE FROM shifts WHERE company_id = ANY(${trackedData.companyIds}::uuid[])
        `;
        deletionCounts.shifts = shiftsResult;
        console.log(`   ✓ Deleted ${shiftsResult} legacy shifts`);
      } catch (error: any) {
        if (!error.message?.includes('relation "shifts" does not exist')) {
          console.log(`   ⚠️  Warning deleting shifts: ${error.message}`);
        }
      }
    }

    // 1. Delete schedule assignments
    if (trackedData.scheduleAssignmentIds.length > 0) {
      const assignmentsDeleted = await prisma.scheduleAssignment.deleteMany({
        where: { id: { in: trackedData.scheduleAssignmentIds } },
      });
      deletionCounts.scheduleAssignments = assignmentsDeleted.count;
      console.log(
        `   ✓ Deleted ${assignmentsDeleted.count} schedule assignments`
      );
    }

    // 2. Delete schedules
    if (trackedData.scheduleIds.length > 0) {
      const schedulesDeleted = await prisma.schedule.deleteMany({
        where: { id: { in: trackedData.scheduleIds } },
      });
      deletionCounts.schedules = schedulesDeleted.count;
      console.log(`   ✓ Deleted ${schedulesDeleted.count} schedules`);
    }

    // 3. Delete shift templates
    if (trackedData.shiftTemplateIds.length > 0) {
      const shiftTemplatesDeleted = await prisma.shiftTemplate.deleteMany({
        where: { id: { in: trackedData.shiftTemplateIds } },
      });
      deletionCounts.shiftTemplates = shiftTemplatesDeleted.count;
      console.log(
        `   ✓ Deleted ${shiftTemplatesDeleted.count} shift templates`
      );
    }

    // 4. Delete contracts
    if (trackedData.contractIds.length > 0) {
      const contractsDeleted = await prisma.contract.deleteMany({
        where: { id: { in: trackedData.contractIds } },
      });
      deletionCounts.contracts = contractsDeleted.count;
      console.log(`   ✓ Deleted ${contractsDeleted.count} contracts`);
    }

    // 5. Delete employees
    if (trackedData.employeeIds.length > 0) {
      const employeesDeleted = await prisma.employee.deleteMany({
        where: { id: { in: trackedData.employeeIds } },
      });
      deletionCounts.employees = employeesDeleted.count;
      console.log(`   ✓ Deleted ${employeesDeleted.count} employees`);
    }

    // 6. Delete users from public.users table
    if (trackedData.userIds.length > 0) {
      const usersDeleted = await prisma.user.deleteMany({
        where: { id: { in: trackedData.userIds } },
      });
      deletionCounts.users = usersDeleted.count;
      console.log(`   ✓ Deleted ${usersDeleted.count} users from database`);
    }

    // 7. Delete companies
    if (trackedData.companyIds.length > 0) {
      const companiesDeleted = await prisma.company.deleteMany({
        where: { id: { in: trackedData.companyIds } },
      });
      deletionCounts.companies = companiesDeleted.count;
      console.log(`   ✓ Deleted ${companiesDeleted.count} companies`);
    }

    // 8. Delete auth users from Supabase Auth (auth.users)
    if (SUPABASE_URL && SERVICE_ROLE_KEY && trackedData.userIds.length > 0) {
      console.log('\n🔐 Deleting auth users from Supabase Auth...');
      const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

      for (const userId of trackedData.userIds) {
        try {
          const { error } = await supabase.auth.admin.deleteUser(userId);
          if (!error) {
            deletionCounts.authUsers++;
          } else if (
            error.message.includes('not found') ||
            error.message.includes('User not found')
          ) {
            deletionCounts.authUsers++;
          } else {
            console.error(
              `   ⚠️  Failed to delete auth user ${userId}:`,
              error.message
            );
          }
        } catch (err: any) {
          if (
            err?.message?.includes('not found') ||
            err?.message?.includes('User not found')
          ) {
            deletionCounts.authUsers++;
          } else {
            console.error(
              `   ⚠️  Error deleting auth user ${userId}:`,
              err?.message || err
            );
          }
        }
      }
      console.log(
        `   ✓ Deleted ${deletionCounts.authUsers}/${trackedData.userIds.length} auth users`
      );
    }

    // Clear the tracker
    testDataTracker.clear();
    console.log('\n🗑️  Cleared test data tracker');

    console.log('\n✅ Cleanup completed successfully!');
    console.log('📈 Deletion summary:');
    console.log(`   - Companies: ${deletionCounts.companies}`);
    console.log(`   - Users (database): ${deletionCounts.users}`);
    console.log(`   - Users (auth): ${deletionCounts.authUsers}`);
    console.log(`   - Employees: ${deletionCounts.employees}`);
    console.log(`   - Contracts: ${deletionCounts.contracts}`);
    console.log(`   - Schedules: ${deletionCounts.schedules}`);
    console.log(
      `   - Schedule Assignments: ${deletionCounts.scheduleAssignments}`
    );
    console.log(`   - Shift Templates: ${deletionCounts.shiftTemplates}`);
    console.log(`   - Legacy Shifts: ${deletionCounts.shifts}`);
    console.log('');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

export default globalTeardown;
