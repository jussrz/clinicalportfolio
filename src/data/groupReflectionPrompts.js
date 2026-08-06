// Group Reflections' prompt set, one row per department in group_reflections
// (see supabase/schema.sql). Shared between the editor (GroupReflections)
// and showcase (showcase/GroupReflections) pages, same pattern as
// REFLECTION_PROMPTS in DepartmentReflectionCard.jsx.
export const GROUP_REFLECTION_PROMPTS = [
  ['meaningful_experience', 'What was our most meaningful clinical learning experience?'],
  ['patients_caregivers', 'What did we learn about working with patients and caregivers?'],
  ['healthcare_team', 'What did we learn about working with the healthcare team?'],
  ['workflows', 'What did we learn about hospital or community health workflows?'],
  ['clinical_reasoning', 'What clinical reasoning skills improved in our group?'],
  ['challenges', 'What challenged us as a group?'],
  ['task_management', 'How did we manage group tasks and responsibilities?'],
  ['improvements', 'What should we improve before clerkship?'],
]
