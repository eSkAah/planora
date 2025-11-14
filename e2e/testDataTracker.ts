import * as fs from 'fs';
import * as path from 'path';

/**
 * Test Data Tracker
 * Keeps track of all IDs created during E2E tests for precise cleanup
 */

const TRACKER_FILE = path.join(__dirname, '../playwright/.test-data.json');

export interface TestDataIds {
  companyIds: string[];
  userIds: string[];
  employeeIds: string[];
  contractIds: string[];
  scheduleIds: string[];
  scheduleAssignmentIds: string[];
  shiftTemplateIds: string[];
}

class TestDataTracker {
  private data: TestDataIds;

  constructor() {
    this.data = this.load();
  }

  private load(): TestDataIds {
    try {
      if (fs.existsSync(TRACKER_FILE)) {
        const content = fs.readFileSync(TRACKER_FILE, 'utf-8');
        return JSON.parse(content);
      }
    } catch (error) {
      console.warn('Failed to load test data tracker:', error);
    }

    return {
      companyIds: [],
      userIds: [],
      employeeIds: [],
      contractIds: [],
      scheduleIds: [],
      scheduleAssignmentIds: [],
      shiftTemplateIds: [],
    };
  }

  private save() {
    try {
      const dir = path.dirname(TRACKER_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(TRACKER_FILE, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error('Failed to save test data tracker:', error);
    }
  }

  // Add IDs
  addCompany(id: string) {
    if (!this.data.companyIds.includes(id)) {
      this.data.companyIds.push(id);
      this.save();
    }
  }

  addUser(id: string) {
    if (!this.data.userIds.includes(id)) {
      this.data.userIds.push(id);
      this.save();
    }
  }

  addEmployee(id: string) {
    if (!this.data.employeeIds.includes(id)) {
      this.data.employeeIds.push(id);
      this.save();
    }
  }

  addContract(id: string) {
    if (!this.data.contractIds.includes(id)) {
      this.data.contractIds.push(id);
      this.save();
    }
  }

  addSchedule(id: string) {
    if (!this.data.scheduleIds.includes(id)) {
      this.data.scheduleIds.push(id);
      this.save();
    }
  }

  addScheduleAssignment(id: string) {
    if (!this.data.scheduleAssignmentIds.includes(id)) {
      this.data.scheduleAssignmentIds.push(id);
      this.save();
    }
  }

  addShiftTemplate(id: string) {
    if (!this.data.shiftTemplateIds.includes(id)) {
      this.data.shiftTemplateIds.push(id);
      this.save();
    }
  }

  // Get all data
  getData(): TestDataIds {
    return { ...this.data };
  }

  // Clear all
  clear() {
    this.data = {
      companyIds: [],
      userIds: [],
      employeeIds: [],
      contractIds: [],
      scheduleIds: [],
      scheduleAssignmentIds: [],
      shiftTemplateIds: [],
    };
    this.save();
  }

  // Get stats
  getStats() {
    return {
      companies: this.data.companyIds.length,
      users: this.data.userIds.length,
      employees: this.data.employeeIds.length,
      contracts: this.data.contractIds.length,
      schedules: this.data.scheduleIds.length,
      scheduleAssignments: this.data.scheduleAssignmentIds.length,
      shiftTemplates: this.data.shiftTemplateIds.length,
      total:
        this.data.companyIds.length +
        this.data.userIds.length +
        this.data.employeeIds.length +
        this.data.contractIds.length +
        this.data.scheduleIds.length +
        this.data.scheduleAssignmentIds.length +
        this.data.shiftTemplateIds.length,
    };
  }
}

export const testDataTracker = new TestDataTracker();
