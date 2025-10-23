/**
 * Test Script for AI Schedule Generation
 *
 * Run with: npx tsx scripts/test-ai-generation.ts
 */

import { generateScheduleWithAI } from '../src/lib/ai/schedule-generator';
import type {
  EmployeeData,
  GenerateScheduleInput,
  LegalConstraints,
  ShiftTemplate,
} from '../src/lib/ai/schedule-generator';

// Test data
const employees: EmployeeData[] = [
  {
    id: 'emp-1',
    firstName: 'Marie',
    lastName: 'Dubois',
    email: 'marie.dubois@test.com',
    contractType: 'full_time',
    hoursPerWeek: 35,
    position: 'Serveur',
    department: 'Salle',
    availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    preferredShiftTypes: ['morning', 'afternoon'],
  },
  {
    id: 'emp-2',
    firstName: 'Jean',
    lastName: 'Martin',
    email: 'jean.martin@test.com',
    contractType: 'full_time',
    hoursPerWeek: 35,
    position: 'Serveur',
    department: 'Salle',
    availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    preferredShiftTypes: ['afternoon', 'evening'],
  },
  {
    id: 'emp-3',
    firstName: 'Sophie',
    lastName: 'Bernard',
    email: 'sophie.bernard@test.com',
    contractType: 'part_time',
    hoursPerWeek: 20,
    position: 'Cuisinier',
    department: 'Cuisine',
    availableDays: ['wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    preferredShiftTypes: ['morning', 'afternoon'],
  },
];

const shiftTemplates: ShiftTemplate[] = [
  {
    id: 'shift-1',
    name: 'Service Matin',
    startTime: '08:00',
    endTime: '14:00',
    breakDurationMinutes: 30,
    type: 'morning',
    requiredPosition: 'Serveur',
    isWeekendShift: false,
  },
  {
    id: 'shift-2',
    name: 'Service Midi',
    startTime: '11:00',
    endTime: '15:00',
    breakDurationMinutes: 30,
    type: 'afternoon',
    requiredPosition: 'Serveur',
    isWeekendShift: false,
  },
  {
    id: 'shift-3',
    name: 'Service Soir',
    startTime: '17:00',
    endTime: '23:00',
    breakDurationMinutes: 30,
    type: 'evening',
    requiredPosition: 'Serveur',
    isWeekendShift: false,
  },
  {
    id: 'shift-4',
    name: 'Cuisine Matin',
    startTime: '07:00',
    endTime: '13:00',
    breakDurationMinutes: 30,
    type: 'morning',
    requiredPosition: 'Cuisinier',
    isWeekendShift: false,
  },
];

const legalConstraints: LegalConstraints = {
  country: 'FR',
  maxHoursPerWeek: 35,
  minRestHoursDaily: 11,
  minRestHoursWeekly: 35,
  maxConsecutiveDays: 6,
  maxOvertimeHoursPerWeek: 48,
};

const input: GenerateScheduleInput = {
  startDate: '2025-11-01',
  endDate: '2025-11-07', // 1 week test
  employees,
  shiftTemplates,
  legalConstraints,
  constraints: {
    includeWeekends: true,
    minRestHoursBetweenShifts: 11,
    maxConsecutiveDays: 6,
    respectAvailability: true,
    respectSkills: true,
  },
  optimizationGoals: [
    'maximize_coverage',
    'respect_preferences',
    'balance_workload',
    'minimize_overtime',
  ],
};

async function testAIGeneration() {
  console.log('🧪 Starting AI Schedule Generation Test...\n');
  console.log('📋 Test Configuration:');
  console.log(`  - Period: ${input.startDate} → ${input.endDate}`);
  console.log(`  - Employees: ${employees.length}`);
  console.log(`  - Shift Templates: ${shiftTemplates.length}`);
  console.log(`  - Country: ${legalConstraints.country} (${legalConstraints.maxHoursPerWeek}h/week)\n`);

  try {
    const startTime = Date.now();
    const result = await generateScheduleWithAI(input);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n✅ AI Generation Successful!\n');
    console.log('📊 Statistics:');
    console.log(`  - Total Hours: ${result.statistics.totalHours}h`);
    console.log(`  - Overtime Hours: ${result.statistics.overtimeHours}h`);
    console.log(`  - Coverage Score: ${result.statistics.coverageScore}%`);
    console.log(`  - Compliance Score: ${result.statistics.complianceScore}%`);
    console.log(`  - Generation Time: ${duration}s\n`);

    console.log('👥 Employee Hours:');
    Object.entries(result.statistics.employeeHours).forEach(([empId, hours]) => {
      const emp = employees.find(e => e.id === empId);
      console.log(`  - ${emp?.firstName} ${emp?.lastName}: ${hours}h/${emp?.hoursPerWeek}h`);
    });

    console.log(`\n📅 Assignments Generated: ${result.assignments.length}`);

    if (result.warnings && result.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      result.warnings.forEach(w => console.log(`  - ${w}`));
    }

    if (result.reasoning) {
      console.log('\n💡 AI Reasoning:');
      console.log(`  ${result.reasoning}`);
    }

    console.log('\n✨ Test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test Failed:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

testAIGeneration();
