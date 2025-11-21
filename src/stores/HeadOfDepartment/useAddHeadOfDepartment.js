import { useAddUser } from '../global/useAddUser'

export function useAddHead(overrides = {}) {
  return useAddUser('head_of_department', { ...overrides })
}