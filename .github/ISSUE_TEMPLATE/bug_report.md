name: Bug report
description: Report a bug to help us improve
title: "[BUG] "
labels: [bug]
assignees: []

body:
  - type: markdown
    attributes:
      value: |
        Thanks for taking the time to fill out this bug report!

  - type: textarea
    id: description
    attributes:
      label: Description
      description: A clear and concise description of what the bug is
      placeholder: |
        The login endpoint returns 500 error when...
    validations:
      required: true

  - type: textarea
    id: reproduction
    attributes:
      label: Steps to Reproduce
      description: Steps to reproduce the behavior
      placeholder: |
        1. Send POST request to /api/login
        2. With payload: {...}
        3. See error message
    validations:
      required: true

  - type: textarea
    id: expected
    attributes:
      label: Expected Behavior
      description: A clear description of what you expected to happen
      placeholder: Should return 200 with user token
    validations:
      required: true

  - type: textarea
    id: actual
    attributes:
      label: Actual Behavior
      description: What actually happened instead
      placeholder: Returns 500 error with "SQLSTATE[..."
    validations:
      required: true

  - type: textarea
    id: environment
    attributes:
      label: Environment
      description: |
        Please provide relevant environment information
      value: |
        - Laravel version: 11
        - PHP version: 8.4
        - Database: MySQL 8.0
        - OS: Linux/Windows/Mac
      validations:
        required: true

  - type: textarea
    id: logs
    attributes:
      label: Error Logs
      description: Any relevant error logs from storage/logs/laravel.log
      render: bash
      placeholder: "[2024-12-15 10:30:45] production.ERROR: SQLSTATE[..."

  - type: checkboxes
    id: terms
    attributes:
      label: Checklist
      options:
        - label: I have checked the documentation
          required: true
        - label: I have searched for existing issues
          required: true
        - label: I have provided all relevant information
          required: true
