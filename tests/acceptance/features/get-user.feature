Feature: Get user

  Scenario: Retrieve existing user by id
    Given an existing user in the system
    When I request the user by the stored id
    Then the response status should be 200
    And the response should contain the requested user id
    And the response should not contain password fields

  Scenario: Retrieve user with invalid id format
    Given I request user id "invalid-user-id"
    When I submit the get user request
    Then the response status should be 400

  Scenario: Retrieve non-existent user
    Given I request user id "11111111-1111-4111-8111-111111111111"
    When I submit the get user request
    Then the response status should be 404

  Scenario: Retrieve deleted user
    Given a deleted user in the system
    When I request the user by the stored id
    Then the response status should be 404
