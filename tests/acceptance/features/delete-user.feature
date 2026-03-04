Feature: Delete user

  Scenario: Delete existing user
    Given an existing user to delete
    When I submit the delete user request
    Then the response status should be 204
    When I request the user by the stored id
    Then the response status should be 404

  Scenario: Delete non-existent user
    Given I request user id "33333333-3333-4333-8333-333333333333"
    When I submit the delete user request
    Then the response status should be 404

  Scenario: Delete user with invalid id format
    Given I request user id "invalid-delete-user-id"
    When I submit the delete user request
    Then the response status should be 400

  Scenario: Delete already deleted user
    Given an already deleted user
    When I submit the delete user request
    Then the response status should be 404
