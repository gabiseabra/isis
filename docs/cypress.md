# Cypress Guide

## General cypress tips

- Each test should mount the component it is testing directly with props inline.
  ```tsx
  import { Component } from "./Component";

  describe("Component", () => {
    it("renders the default state", () => {
      cy.mount(<Component disabled />);

      cy.contains("Label").should("exist");
    });
  });
  ```
- Keep component tests close to the component when possible.
- Avoid helper functions, inline as much as possible in tests.
- Avoid stateful components shared in tests.

## Test Environments

### Component tests

Covers components in `@isis/ui`.

- Use storybook for component tests. Import the story object and mount its `render` result directly.
  ```tsx
  import { Default } from "./Component.stories";

  describe("Component", () => {
    it("renders the default state", () => {
      cy.mount(Default.render({ disabled: false }));

      cy.contains("Label").should("exist");
    });
  });
  ```
- Apply story props inline per test. Do not create a Cypress-only wrapper when the story already describes the state.

### E2E Tests

This is probably how I'm going to test the admin and web nodules. todo.

## Cypress callback elements

When using `.then()` or `.should()` with a Cypress subject, destructure the first DOM element in the callback.

```tsx
cy.get("#target").should(([$element]) => {
  expect($element.getBoundingClientRect().width).to.be.greaterThan(0);
});
```
