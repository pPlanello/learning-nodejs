Feature: List users

  Scenario: List users with default pagination
    Given I have 3 active users in the system
    When I request the users list with query ""
    Then the response status should be 200
    And the pagination metadata should be page 1 limit 10 total 3 totalPages 1
    And the users list should contain 3 items

  Scenario: List users with explicit pagination
    Given I have 5 active users in the system
    When I request the users list with query "?page=2&limit=2"
    Then the response status should be 200
    And the pagination metadata should be page 2 limit 2 total 5 totalPages 3
    And the users list should contain 2 items

  Scenario: List users filtered by status
    Given I have users with mixed statuses
    When I request the users list with query "?status=suspended"
    Then the response status should be 200
    And the users list should contain 1 items
    And all listed users should have status "suspended"

  Scenario: List users excluding soft-deleted users
    Given I have users where one is soft deleted
    When I request the users list with query ""
    Then the response status should be 200
    And the users list should contain 1 items
