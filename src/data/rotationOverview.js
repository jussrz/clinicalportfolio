// Static reference content for the Rotation Overview page — objectives,
// schedule, and assigned topics as handed down by the clinical rotation
// program/coordinators. Display-only, no database involved: edit these
// strings directly once the real syllabus/schedule details are provided.
export const rotationOverview = {
  generalObjectives: '[Insert general objectives of the clinical rotation here]',

  // Keys match the department slugs in src/data/departments.js
  departmentObjectives: {
    pediatrics: '[Insert Pediatrics rotation-specific objectives here]',
    'family-community-medicine': '[Insert Family & Community Medicine rotation-specific objectives here]',
    'internal-medicine': '[Insert Internal Medicine rotation-specific objectives here]',
    surgery: '[Insert Surgery rotation-specific objectives here]',
    'obstetrics-gynecology': '[Insert Obstetrics & Gynecology rotation-specific objectives here]',
  },

  schedule: '[Insert clinical rotation schedule or timeline here]',

  caseTopics: '[Insert assigned case topics per rotation cycle here]',

  learningGoals: '[Insert group learning goals here]',
}
