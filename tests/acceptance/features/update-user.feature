Feature: Update user

  Scenario: Update user name successfully
    Given an existing user to update
    And I have an update payload with name "Updated Name"
    When I submit the update user request
    Then the response status should be 200
    And the response should contain updated name "Updated Name"
    And the response updatedAt should be changed

  Scenario: Update user email with duplicate email
    Given an existing user to update
    And another existing user with email "duplicate.update@example.com"
    And I have an update payload with email "duplicate.update@example.com"
    When I submit the update user request
    Then the response status should be 409

  Scenario: Update non-existent user
    Given I request user id "22222222-2222-4222-8222-222222222222"
    And I have an update payload with name "Does Not Matter"
    When I submit the update user request
    Then the response status should be 404

  Scenario: Update user status with partial payload
    Given an existing user to update
    And I have an update payload with status "suspended"
    When I submit the update user request
    Then the response status should be 200
    And the response should contain updated status "suspended"
