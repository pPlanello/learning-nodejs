import { type User } from '@Domain/user/user.entity'

export interface UserResponseDTO {
  id: string
  name: string
  email: string
  status: 'active' | 'suspended' | 'pending_verification'
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface GetAllUsersResponseDTO {
  data: UserResponseDTO[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export const mapUserToDTO = (user: User): UserResponseDTO => ({
  id: user.id.toString(),
  name: user.name,
  email: user.email.toString(),
  status: user.status,
  createdAt: user.createdAt.toISOString(),
  updatedAt: user.updatedAt.toISOString(),
  deletedAt: user.deletedAt?.toISOString() ?? null,
})
