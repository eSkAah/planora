/**
 * AI-Powered Schedule Generator
 *
 * Uses OpenAI to generate optimized work schedules based on:
 * - Employee constraints (contracts, availability, skills)
 * - Legal requirements (FR/LU labor laws)
 * - Business needs (coverage, cost optimization)
 */

import 'server-only';

import { getOpenAIModel, isOpenAIConfigured, openai } from './client';

// =============================================================================
// TYPES
// =============================================================================

export interface EmployeeData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  // Contract info
  contractType: 'full_time' | 'part_time' | 'temporary' | 'internship' | 'apprenticeship';
  hoursPerWeek: number;
  // Availability (simplified for now)
  availableDays?: string[]; // ['monday', 'tuesday', ...]
  unavailableDates?: string[]; // ['2025-01-15', ...]
  // Skills/Position
  position?: string;
  department?: string;
  // Preferences
  preferredShiftTypes?: ('morning' | 'afternoon' | 'evening' | 'night')[];
}

export interface ShiftTemplate {
  id: string;
  name: string;
  startTime: string; // HH:MM format
  endTime: string;
  breakDurationMinutes: number;
  type: 'morning' | 'afternoon' | 'evening' | 'night' | 'full_day';
  requiredPosition?: string;
  isWeekendShift: boolean;
}

export interface LegalConstraints {
  country: 'FR' | 'LU';
  maxHoursPerWeek: number; // 35 for FR, 40 for LU
  minRestHoursDaily: number; // 11 hours
  minRestHoursWeekly: number; // 35 for FR, 44 for LU
  maxConsecutiveDays: number; // Usually 6
  maxOvertimeHoursPerWeek?: number;
}

export interface GenerationConstraints {
  includeWeekends: boolean;
  minRestHoursBetweenShifts: number;
  maxConsecutiveDays: number;
  respectAvailability: boolean;
  respectSkills: boolean;
}

export interface OptimizationGoals {
  maximize_coverage?: boolean;
  respect_preferences?: boolean;
  balance_workload?: boolean;
  minimize_costs?: boolean;
  minimize_overtime?: boolean;
}

export interface ScheduleAssignment {
  employeeId: string;
  shiftTemplateId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  breakDurationMinutes: number;
  notes?: string;
}

export interface GenerateScheduleInput {
  // Period
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  // Data
  employees: EmployeeData[];
  shiftTemplates: ShiftTemplate[];
  // Company settings
  legalConstraints: LegalConstraints;
  // Configuration
  constraints: GenerationConstraints;
  optimizationGoals: string[];
  // Optional
  existingAssignments?: ScheduleAssignment[]; // For regeneration
}

export interface GenerateScheduleOutput {
  assignments: ScheduleAssignment[];
  statistics: {
    totalHours: number;
    overtimeHours: number;
    coverageScore: number; // 0-100
    complianceScore: number; // 0-100
    employeeHours: Record<string, number>; // employeeId -> hours
  };
  warnings: string[];
  reasoning?: string; // AI's explanation of choices
}

// =============================================================================
// PROMPT ENGINEERING
// =============================================================================

function buildScheduleGenerationPrompt(input: GenerateScheduleInput): string {
  const { startDate, endDate, employees, shiftTemplates, legalConstraints, constraints, optimizationGoals } = input;

  return `Tu es un expert en génération de plannings de travail optimisés. Ta mission est de créer un planning pour une équipe en respectant STRICTEMENT toutes les contraintes légales et opérationnelles.

## 📅 PÉRIODE
- Début : ${startDate}
- Fin : ${endDate}
- Week-ends inclus : ${constraints.includeWeekends ? 'OUI' : 'NON'}

## 👥 EMPLOYÉS (${employees.length})
${employees.map((emp, i) => `
${i + 1}. ${emp.firstName} ${emp.lastName} (ID: ${emp.id})
   - Contrat : ${emp.contractType} (${emp.hoursPerWeek}h/semaine)
   - Poste : ${emp.position || 'Non spécifié'}
   - Département : ${emp.department || 'Non spécifié'}
   ${emp.availableDays ? `- Jours disponibles : ${emp.availableDays.join(', ')}` : ''}
   ${emp.unavailableDates ? `- Dates indisponibles : ${emp.unavailableDates.join(', ')}` : ''}
   ${emp.preferredShiftTypes ? `- Préférences : ${emp.preferredShiftTypes.join(', ')}` : ''}
`).join('')}

## 🕐 TYPES DE SHIFTS DISPONIBLES (${shiftTemplates.length})
${shiftTemplates.map((shift, i) => `
${i + 1}. ${shift.name} (ID: ${shift.id})
   - Horaires : ${shift.startTime} - ${shift.endTime}
   - Type : ${shift.type}
   - Pause : ${shift.breakDurationMinutes} min
   - Week-end : ${shift.isWeekendShift ? 'OUI' : 'NON'}
   ${shift.requiredPosition ? `- Poste requis : ${shift.requiredPosition}` : ''}
`).join('')}

## ⚖️ CONTRAINTES LÉGALES (${legalConstraints.country})
- Heures max/semaine : ${legalConstraints.maxHoursPerWeek}h
- Repos quotidien min : ${legalConstraints.minRestHoursDaily}h
- Repos hebdomadaire min : ${legalConstraints.minRestHoursWeekly}h
- Jours consécutifs max : ${legalConstraints.maxConsecutiveDays}

## 🎯 OBJECTIFS D'OPTIMISATION
${optimizationGoals.map(goal => `- ${goal.replace(/_/g, ' ')}`).join('\n')}

## 📋 CONTRAINTES OPÉRATIONNELLES
- Respect des disponibilités : ${constraints.respectAvailability ? 'OUI (STRICT)' : 'NON'}
- Respect des compétences : ${constraints.respectSkills ? 'OUI (STRICT)' : 'NON'}
- Repos min entre shifts : ${constraints.minRestHoursBetweenShifts}h
- Jours consécutifs max : ${constraints.maxConsecutiveDays}

## ⚠️ RÈGLES STRICTES À RESPECTER

1. **CONFORMITÉ LÉGALE (PRIORITÉ ABSOLUE)**
   - JAMAIS dépasser ${legalConstraints.maxHoursPerWeek}h/semaine par employé
   - TOUJOURS respecter ${legalConstraints.minRestHoursDaily}h de repos quotidien
   - TOUJOURS respecter ${legalConstraints.minRestHoursWeekly}h de repos hebdomadaire
   - JAMAIS plus de ${legalConstraints.maxConsecutiveDays} jours consécutifs

2. **DISPONIBILITÉS**
   ${constraints.respectAvailability ? '- NE PAS assigner un employé sur ses dates/jours indisponibles' : '- Respecter les disponibilités autant que possible'}

3. **COMPÉTENCES/POSTES**
   ${constraints.respectSkills ? '- NE PAS assigner un shift nécessitant un poste spécifique à un employé d\'un autre poste' : '- Respecter les postes autant que possible'}

4. **ÉQUITÉ**
   - Distribuer équitablement les heures entre employés
   - Alterner les types de shifts (matin/après-midi/soir)
   - Éviter de surcharger certains employés

5. **COUVERTURE**
   - Assurer une couverture minimale chaque jour
   - Privilégier les employés à temps plein pour la couverture continue

## 📤 FORMAT DE RÉPONSE ATTENDU

Réponds UNIQUEMENT avec un objet JSON valide (sans markdown, sans \`\`\`json) au format suivant:

{
  "assignments": [
    {
      "employeeId": "uuid-de-l-employé",
      "shiftTemplateId": "uuid-du-shift-template",
      "date": "YYYY-MM-DD",
      "startTime": "HH:MM",
      "endTime": "HH:MM",
      "breakDurationMinutes": 60,
      "notes": "Optionnel: raison de l'assignation"
    }
  ],
  "statistics": {
    "totalHours": 1400,
    "overtimeHours": 0,
    "coverageScore": 95,
    "complianceScore": 100,
    "employeeHours": {
      "employee-id-1": 35,
      "employee-id-2": 35
    }
  },
  "warnings": [
    "Optionnel: liste des warnings/compromis faits"
  ],
  "reasoning": "Explication brève de ta stratégie de génération"
}

## 🚀 GÉNÈRE MAINTENANT LE PLANNING OPTIMAL

Analyse toutes les contraintes, optimise selon les objectifs, et génère le meilleur planning possible.
Réponds UNIQUEMENT avec le JSON, rien d'autre.`;
}

// =============================================================================
// GENERATION SERVICE
// =============================================================================

/**
 * Generate an optimized schedule using OpenAI
 */
export async function generateScheduleWithAI(
  input: GenerateScheduleInput
): Promise<GenerateScheduleOutput> {
  // Check if OpenAI is configured
  if (!isOpenAIConfigured() || !openai) {
    throw new Error(
      'OpenAI is not configured. Please add OPENAI_API_KEY to your environment variables.'
    );
  }

  // Validate input
  if (input.employees.length === 0) {
    throw new Error('No employees provided for schedule generation');
  }

  if (input.shiftTemplates.length === 0) {
    throw new Error('No shift templates provided for schedule generation');
  }

  // Build prompt
  const prompt = buildScheduleGenerationPrompt(input);

  console.log('🤖 Generating schedule with AI...');
  console.log(`📅 Period: ${input.startDate} → ${input.endDate}`);
  console.log(`👥 Employees: ${input.employees.length}`);
  console.log(`🕐 Shift templates: ${input.shiftTemplates.length}`);

  try {
    // Call OpenAI
    const response = await openai.chat.completions.create({
      model: getOpenAIModel(),
      messages: [
        {
          role: 'system',
          content: 'Tu es un expert en optimisation de plannings de travail. Tu génères des plannings conformes aux lois du travail françaises et luxembourgeoises. Tu réponds UNIQUEMENT en JSON valide.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7, // Some creativity for optimization
      max_tokens: 4000, // Enough for large schedules
      response_format: { type: 'json_object' }, // Force JSON response
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Parse JSON response
    const result = JSON.parse(content) as GenerateScheduleOutput;

    console.log('✅ Schedule generated successfully');
    console.log(`📊 Total hours: ${result.statistics.totalHours}`);
    console.log(`📈 Coverage score: ${result.statistics.coverageScore}%`);
    console.log(`✅ Compliance score: ${result.statistics.complianceScore}%`);

    if (result.warnings && result.warnings.length > 0) {
      console.warn('⚠️  Warnings:', result.warnings);
    }

    // Validate result
    if (!result.assignments || !Array.isArray(result.assignments)) {
      throw new Error('Invalid response format: missing assignments array');
    }

    return result;
  } catch (error) {
    console.error('❌ Error generating schedule with AI:', error);

    if (error instanceof Error) {
      throw new Error(`AI schedule generation failed: ${error.message}`);
    }

    throw new Error('AI schedule generation failed with unknown error');
  }
}
