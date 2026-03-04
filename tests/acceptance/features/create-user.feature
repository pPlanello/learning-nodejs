Feature: Create user

  Scenario: Create user with valid payload
    Given I have a valid create user payload
    When I submit the create user request
    Then the response status should be 201
    And the response should contain a generated user id

  Scenario: Create user with duplicate email
    Given an existing user with email "duplicate.user@example.com"
    And I have a create user payload with email "duplicate.user@example.com"
    When I submit the create user request
    Then the response status should be 409

  Scenario: Create user with missing fields
    Given I have an invalid create user payload with missing required fields
    When I submit the create user request
    Then the response status should be 400

  Scenario: Create user with weak password
    Given I have a create user payload with weak password
    When I submit the create user request
    Then the response status should be 400
