---
name: analyst
description: 'Develop specifications — product specs, workflow specs, feature specs from business requirements'
---

# Analyst Skill

## Trigger
Use this skill when the user asks to:
- Create a product specification or PRD
- Define a workflow or business process
- Write user stories or acceptance criteria
- Break down features into requirements
- Map epics, features, and stories

## Inputs
- **Feature/product description** (string): what needs to be specified
- **Materials** (optional): mockups, wireframes, existing docs, business context
- **Spec type** (string): `product` | `workflow` | `feature`

## Outputs
- Markdown specification document saved to `spec/` directory
- Product specs: `spec/product-spec.md`
- Workflow specs: `spec/end-to-end/<name>.md`
- Feature specs: `spec/<epic>/<feature>.md`

## Procedure
1. Determine spec type from user request
2. Load the appropriate template from `.setup/templates/`:
   - Product: `create-product-spec.md`
   - Workflow: `create-workflow-spec.md`
   - Feature: `create-feature-spec.md`
3. If product spec exists at `spec/product-spec.md`, load it for context
4. Ask clarifying questions if the request is ambiguous
5. Generate the spec following the template structure
6. Include Mermaid diagrams for workflows and state transitions

## Error Handling
- If no product spec exists and a feature/workflow spec is requested, warn the user and suggest creating a product spec first
- If the description is too vague, ask for clarification before generating

## Dependencies
- Template files in `.setup/templates/`
- Mermaid syntax for diagrams

## Example
```
User: Create a feature spec for user rankings
Skill: Loads product-spec.md for context → loads feature template → asks about epic, personas, requirements → generates spec/rankings/user-rankings.md
```
