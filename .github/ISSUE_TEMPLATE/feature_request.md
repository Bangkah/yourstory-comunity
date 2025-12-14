name: Feature request
description: Suggest an idea for this project
title: "[FEATURE] "
labels: [enhancement]
assignees: []

body:
  - type: markdown
    attributes:
      value: |
        Thanks for your interest in improving Your Story Community!

  - type: textarea
    id: problem
    attributes:
      label: Problem Statement
      description: Is your feature request related to a problem? Describe it
      placeholder: "Currently, users cannot upload images because..."
    validations:
      required: true

  - type: textarea
    id: solution
    attributes:
      label: Proposed Solution
      description: Describe the solution you'd like
      placeholder: "Add image upload functionality to stories with..."
    validations:
      required: true

  - type: textarea
    id: alternatives
    attributes:
      label: Alternative Solutions
      description: Describe any alternative solutions or features you've considered
      placeholder: "An alternative would be to use external CDN..."

  - type: textarea
    id: additional
    attributes:
      label: Additional Context
      description: Add any other context or screenshots about the feature request
      placeholder: "This is similar to the feature in [similar-project]..."

  - type: checkboxes
    id: terms
    attributes:
      label: Checklist
      options:
        - label: I have searched for existing feature requests
          required: true
        - label: This feature aligns with the project roadmap
          required: true
