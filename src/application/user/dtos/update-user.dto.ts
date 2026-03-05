export interface UpdateUserRequest {
  name?: string
  email?: string
  status?: 'active' | 'suspended' | 'pending_verification'
}
