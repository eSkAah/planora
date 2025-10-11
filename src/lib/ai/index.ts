/**
 * AI Module - Exports
 */

export { getOpenAIModel, isOpenAIConfigured, openai } from './client';
export {
  generateScheduleWithAI,
  type EmployeeData,
  type GenerateScheduleInput,
  type GenerateScheduleOutput,
  type LegalConstraints,
  type OptimizationGoals,
  type ScheduleAssignment,
  type ShiftTemplate,
} from './schedule-generator';
