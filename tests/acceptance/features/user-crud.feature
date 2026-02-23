Feature: User CRUD operations

  @us1
  Scenario: Create user with valid payload
    Given I have a valid create user payload
    When I submit the create user request
    Then the response status should be 201
    And the response should contain a generated user id

  @us1
  Scenario: Create user with duplicate email
    Given an existing user with email "duplicate.user@example.com"
    And I have a create user payload with email "duplicate.user@example.com"
    When I submit the create user request
    Then the response status should be 409

  @us1
  Scenario: Create user with missing fields
    Given I have an invalid create user payload with missing required fields
    When I submit the create user request
    Then the response status should be 400

  @us1
  Scenario: Create user with weak password
    Given I have a create user payload with weak password
    When I submit the create user request
    Then the response status should be 400

  @us2
  Scenario: Retrieve existing user by id
    Given an existing user in the system
    When I request the user by the stored id
    Then the response status should be 200
    And the response should contain the requested user id
    And the response should not contain password fields

  @us2
  Scenario: Retrieve user with invalid id format
    Given I request user id "invalid-user-id"
    When I submit the get user request
    Then the response status should be 400

  @us2
  Scenario: Retrieve non-existent user
    Given I request user id "11111111-1111-4111-8111-111111111111"
    When I submit the get user request
    Then the response status should be 404

  @us2
  Scenario: Retrieve deleted user
    Given a deleted user in the system
    When I request the user by the stored id
    Then the response status should be 404

  @us3
  Scenario: List users with default pagination
    Given I have 3 active users in the system
    When I request the users list with query ""
    Then the response status should be 200
    And the pagination metadata should be page 1 limit 10 total 3 totalPages 1
    And the users list should contain 3 items

  @us3
  Scenario: List users with explicit pagination
    Given I have 5 active users in the system
    When I request the users list with query "?page=2&limit=2"
    Then the response status should be 200
    And the pagination metadata should be page 2 limit 2 total 5 totalPages 3
    And the users list should contain 2 items

  @us3
  Scenario: List users filtered by status
    Given I have users with mixed statuses
    When I request the users list with query "?status=suspended"
    Then the response status should be 200
    And the users list should contain 1 items
    And all listed users should have status "suspended"

  @us3
  Scenario: List users excluding soft-deleted users
    Given I have users where one is soft deleted
    When I request the users list with query ""
    Then the response status should be 200
    And the users list should contain 1 items

  @us4
  Scenario: Update user name successfully
    Given an existing user to update
    And I have an update payload with name "Updated Name"
    When I submit the update user request
    Then the response status should be 200
    And the response should contain updated name "Updated Name"
    And the response updatedAt should be changed

  @us4
  Scenario: Update user email with duplicate email
    Given an existing user to update
    And another existing user with email "duplicate.update@example.com"
    And I have an update payload with email "duplicate.update@example.com"
    When I submit the update user request
    Then the response status should be 409

  @us4
  Scenario: Update non-existent user
    Given I request user id "22222222-2222-4222-8222-222222222222"
    And I have an update payload with name "Does Not Matter"
    When I submit the update user request
    Then the response status should be 404

  @us4
  Scenario: Update user status with partial payload
    Given an existing user to update
    And I have an update payload with status "suspended"
    When I submit the update user request
    Then the response status should be 200
    And the response should contain updated status "suspended"

  @us5
  Scenario: Delete existing user
    Given an existing user to delete
    When I submit the delete user request
    Then the response status should be 204
    When I request the user by the stored id
    Then the response status should be 404

  @us5
  Scenario: Delete non-existent user
    Given I request user id "33333333-3333-4333-8333-333333333333"
    When I submit the delete user request
    Then the response status should be 404

  @us5
  Scenario: Delete user with invalid id format
    Given I request user id "invalid-delete-user-id"
    When I submit the delete user request
    Then the response status should be 400

  @us5
  Scenario: Delete already deleted user
    Given an already deleted user
    When I submit the delete user request
    Then the response status should be 404
