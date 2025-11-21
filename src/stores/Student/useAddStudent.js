import { useAddUser } from '../global/useAddUser'

export function useAddStudent(overrides = {}) {
  return useAddUser('student', { ...overrides })
}
