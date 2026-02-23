export interface GetAllUsersQuery {
  page?: number
  limit?: number
  status?: 'active' | 'suspended' | 'pending_verification'
  sortBy?: 'name' | 'email' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
  createdAtFrom?: string
  createdAtTo?: string
}
