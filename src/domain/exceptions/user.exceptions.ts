export class UserNotFoundException extends Error {
  constructor(userId: string) {
    super(`User with ID ${userId} not found`)
    this.name = 'UserNotFoundException'
  }
}

export class DuplicateEmailException extends Error {
  constructor(email: string) {
    super(`User with email ${email} already exists`)
    this.name = 'DuplicateEmailException'
  }
}

export class InvalidUserIdException extends Error {
  constructor(userId: string) {
    super(`Invalid user ID format: ${userId}`)
    this.name = 'InvalidUserIdException'
  }
}

export class InvalidUserStatusException extends Error {
  constructor(status: string) {
    super(`Invalid user status: ${status}`)
    this.name = 'InvalidUserStatusException'
  }
}
