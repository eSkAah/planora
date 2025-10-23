import { PrismaClient } from '../src/generated/prisma';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Global teardown script for E2E tests
 * Cleans up ALL test data created during test runs
 */
async function globalTeardown() {
  console.log('\n🧹 Starting E2E test cleanup...');

  const prisma = new PrismaClient();

  try {
    // Get all test companies (those created during E2E tests)
    // We identify them by common naming patterns used in tests
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
      'Company ', // Pattern like "Company 1234567890"
    ];

    // Find all test companies with their users
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
      console.log('✓ No test data found to clean up');
      return;
    }

    console.log(`📊 Found ${testCompanies.length} test companies to delete:`);
    testCompanies.forEach((company, index) => {
      console.log(
        `   ${index + 1}. ${company.name} (ID: ${company.id}) - ${company.users.length} users`
      );
    });

    const companyIds = testCompanies.map(c => c.id);
    const userAuthIds = testCompanies.flatMap(c => c.users.map(u => u.id));

    console.log(`\n🔍 Total users to delete from Auth: ${userAuthIds.length}`);

    // Delete all related data in the correct order (respecting foreign keys)
    console.log('\n🗑️  Deleting test data from database...');

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
    try {
      const shiftsResult = await prisma.$executeRaw`
        DELETE FROM shifts WHERE company_id = ANY(${companyIds}::uuid[])
      `;
      deletionCounts.shifts = shiftsResult;
      console.log(`   ✓ Deleted ${shiftsResult} legacy shifts`);
    } catch (error: any) {
      // Table might not exist, that's OK
      if (!error.message?.includes('relation "shifts" does not exist')) {
        console.log(`   ⚠️  Warning deleting shifts: ${error.message}`);
      }
    }

    // 1. Delete schedule assignments (references schedules, employees, shift templates)
    const assignmentsDeleted = await prisma.scheduleAssignment.deleteMany({
      where: { companyId: { in: companyIds } },
    });
    deletionCounts.scheduleAssignments = assignmentsDeleted.count;
    console.log(
      `   ✓ Deleted ${assignmentsDeleted.count} schedule assignments`
    );

    // 2. Delete schedules
    const schedulesDeleted = await prisma.schedule.deleteMany({
      where: { companyId: { in: companyIds } },
    });
    deletionCounts.schedules = schedulesDeleted.count;
    console.log(`   ✓ Deleted ${schedulesDeleted.count} schedules`);

    // 3. Delete shift templates
    const shiftTemplatesDeleted = await prisma.shiftTemplate.deleteMany({
      where: { companyId: { in: companyIds } },
    });
    deletionCounts.shiftTemplates = shiftTemplatesDeleted.count;
    console.log(`   ✓ Deleted ${shiftTemplatesDeleted.count} shift templates`);

    // 4. Delete contracts
    const contractsDeleted = await prisma.contract.deleteMany({
      where: { companyId: { in: companyIds } },
    });
    deletionCounts.contracts = contractsDeleted.count;
    console.log(`   ✓ Deleted ${contractsDeleted.count} contracts`);

    // 5. Delete employees (must be before users since userId can be null)
    const employeesDeleted = await prisma.employee.deleteMany({
      where: { companyId: { in: companyIds } },
    });
    deletionCounts.employees = employeesDeleted.count;
    console.log(`   ✓ Deleted ${employeesDeleted.count} employees`);

    // 6. Delete users from public.users table
    const usersDeleted = await prisma.user.deleteMany({
      where: { companyId: { in: companyIds } },
    });
    deletionCounts.users = usersDeleted.count;
    console.log(`   ✓ Deleted ${usersDeleted.count} users from database`);

    // 7. Delete companies
    const companiesDeleted = await prisma.company.deleteMany({
      where: { id: { in: companyIds } },
    });
    deletionCounts.companies = companiesDeleted.count;
    console.log(`   ✓ Deleted ${companiesDeleted.count} companies`);

    // 8. Delete auth users from Supabase Auth (auth.users)
    if (SUPABASE_URL && SERVICE_ROLE_KEY && userAuthIds.length > 0) {
      console.log('\n🔐 Deleting auth users from Supabase Auth...');
      const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

      for (const userId of userAuthIds) {
        try {
          const { error } = await supabase.auth.admin.deleteUser(userId);
          if (!error) {
            deletionCounts.authUsers++;
          } else if (
            error.message.includes('not found') ||
            error.message.includes('User not found')
          ) {
            // User already deleted or never existed in auth, that's OK
            deletionCounts.authUsers++;
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
        `   ✓ Deleted ${deletionCounts.authUsers}/${userAuthIds.length} auth users`
      );
    } else {
      console.log('\n⚠️  Skipping Supabase Auth cleanup (missing credentials)');
    }

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
