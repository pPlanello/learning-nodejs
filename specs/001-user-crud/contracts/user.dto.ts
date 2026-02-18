/**
 * Data Transfer Objects (DTOs) for User CRUD API
 *
 * DTOs define the shape of data crossing the infrastructure boundary.
 * These are technology-agnostic contracts that Express controllers use.
 *
 * Note: These are example TypeScript interfaces.
 * Implementation will use class-validator decorators for runtime validation.
 */

// ============================================================================
// INPUT DTOs (Client → API)
// ============================================================================

/**
 * Request DTO for creating a new user
 *
 * Validation Rules (enforced at infrastructure layer):
 * - name: required, 1-255 characters
 * - email: required, valid RFC 5322 format, 5-254 characters, globally unique
 * - password: required, min 8 chars, must contain uppercase, lowercase, digit, special char
 */
export interface CreateUserRequest {
  name: string
  email: string
  password: string
}

/**
 * Request DTO for updating an existing user
 *
 * All fields optional; only provided fields are updated.
 *
 * Validation Rules:
 * - name: if provided, 1-255 characters
 * - email: if provided, valid RFC 5322 format, 5-254 characters, globally unique
 * - status: if provided, one of: 'active', 'suspended', 'pending_verification'
 */
export interface UpdateUserRequest {
  name?: string
  email?: string
  status?: 'active' | 'suspended' | 'pending_verification'
}

/**
 * Query parameters for GetAllUsers endpoint
 *
 * Supports pagination, filtering, and sorting.
 */
export interface GetAllUsersQuery {
  page?: number // default 1, minimum 1
  limit?: number // default 10, minimum 1, maximum 100
  status?: 'active' | 'suspended' | 'pending_verification' // optional status filter
  sortBy?: 'name' | 'email' | 'createdAt' | 'updatedAt' // default 'createdAt'
  sortOrder?: 'asc' | 'desc' // default 'desc'
}

// ============================================================================
// OUTPUT DTOs (API → Client)
// ============================================================================

/**
 * Response DTO for a user
 *
 * Used in responses for Create, Get, Update operations.
 * Never includes password or password_hash.
 * Timestamps in ISO 8601 format.
 */
export interface UserResponse {
  id: string // UUID
  name: string
  email: string
  status: 'active' | 'suspended' | 'pending_verification'
  createdAt: string // ISO 8601 datetime
  updatedAt: string // ISO 8601 datetime
  deletedAt: string | null // ISO 8601 datetime or null if not deleted
}

/**
 * Response DTO for GetAllUsers endpoint
 *
 * Contains array of users with pagination metadata.
 */
export interface GetAllUsersResponse {
  data: UserResponse[]
  total: number // Total count of users (excluding deleted)
  page: number // Current page number
  limit: number // Users per page
  totalPages: number // Calculated total pages
}

/**
 * Error response DTO
 *
 * Returned by error handler middleware for all error scenarios.
 * Never includes stack traces or internal implementation details.
 */
export interface ErrorResponse {
  error: string // Error type/code (e.g., 'UserNotFound', 'DuplicateEmail')
  message: string // Human-readable error message
  statusCode: number // HTTP status code (200-599)
  timestamp: string // ISO 8601 datetime when error occurred
  traceId: string // Request trace ID for debugging/logging correlation
}

// ============================================================================
// HTTP Status Code Mapping Reference
// ============================================================================

/**
 * Standard HTTP status codes used by User CRUD API
 *
 * Success Codes:
 * - 200 OK: GET, PATCH successful operations
 * - 201 Created: POST successful creation
 * - 204 No Content: DELETE successful (no body)
 *
 * Client Error Codes:
 * - 400 Bad Request: Invalid input (format, validation rules)
 *   Examples: invalidEmail, weakPassword, missingRequiredField
 * - 409 Conflict: Resource constraint violation
 *   Example: duplicateEmail
 * - 404 Not Found: User doesn't exist or is deleted
 *   Example: userNotFound
 *
 * Server Error Codes:
 * - 500 Internal Server Error: Unexpected server error
 *   Includes traceId for investigation
 *
 * Notes:
 * - All errors return ErrorResponse with statusCode, error, message, timestamp, traceId
 * - No 401/403 for MVP (no authentication required)
 * - DELETE returns 204 with no body, not ErrorResponse
 */

// ============================================================================
// Domain Exception to HTTP Status Code Mapping
// ============================================================================

/**
 * Mapping table for how domain exceptions are converted to HTTP responses
 *
 * Exception Type                → HTTP Status → Error Code         → Message Pattern
 * ─────────────────────────────────────────────────────────────────────────────
 * InvalidEmailFormatException   → 400         → InvalidEmailFormat → "Email format invalid: {email}"
 * WeakPasswordException         → 400         → WeakPassword       → "Password must be at least 8 characters..."
 * InvalidUserIdException        → 400         → InvalidUserId      → "Invalid user ID format: {id}"
 * DuplicateEmailException       → 409         → DuplicateEmail     → "User with email {email} already exists"
 * UserNotFoundException         → 404         → UserNotFound       → "User with ID {id} not found"
 * InvalidUserStatusException    → 400         → InvalidStatus      → "Invalid user status: {status}"
 *
 * Implementation: Global error handler middleware catches domain exceptions
 * and maps to appropriate HTTP response.
 */

// ============================================================================
// Usage Example (in Express Controller)
// ============================================================================

/**
 * Example Express controller using these DTOs:
 *
 * @Post('/users')
 * @HttpCode(201)
 * async createUser(
 *   @Body() createUserDto: CreateUserRequest,
 *   @Inject(CreateUserUseCase) createUserUseCase: CreateUserUseCase,
 *   @Inject(Pino) logger: Logger,
 * ): Promise<UserResponse> {
 *   // Input validation happens via class-validator decorators on DTO
 *   // Infrastructure layer converts request JSON to DTO → validated
 *
 *   const user = await createUserUseCase.execute(createUserDto)
 *   // Domain layer creates User aggregate, returns Promise<User>
 *   // Use case may throw: InvalidEmailFormatException, DuplicateEmailException, WeakPasswordException
 *
 *   const response: UserResponse = {
 *     id: user.id.toString(),
 *     name: user.name,
 *     email: user.email.toString(),
 *     status: user.status.toString(),
 *     createdAt: user.createdAt.toISOString(),
 *     updatedAt: user.updatedAt.toISOString(),
 *     deletedAt: user.deletedAt?.toISOString() ?? null,
 *   };
 *
 *   return response;
 * }
 *
 * // Global error handler catches exceptions:
 * @UseFilters(new DomainExceptionFilter()) // Catches domain exceptions
 * catches UserNotFoundException → 404 NotFound
 * catches DuplicateEmailException → 409 Conflict
 * catches InvalidEmailFormatException → 400 BadRequest
 * etc.
 */
