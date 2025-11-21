import { useAddUser } from '../global/useAddUser'

export function useAddTeacher(overrides = {}) {
  return useAddUser('teacher', { ...overrides })
}
