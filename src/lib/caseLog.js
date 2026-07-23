export function roleLabel(row) {
  if (!row.student_role) return ''
  return row.student_role_detail ? `${row.student_role} (${row.student_role_detail})` : row.student_role
}
