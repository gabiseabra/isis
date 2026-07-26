/// <reference types="cypress" />

import type { RealMouseMoveOptions } from "cypress-real-events/commands/mouseMove";
import { fireCdpCommand } from "cypress-real-events/fireCdpCommand";
import { getCypressElementCoordinates } from "cypress-real-events/getCypressElementCoordinates";
import { getModifiers } from "cypress-real-events/getModifiers";

const fps = 60;

type LinearMouseMoveOptions = RealMouseMoveOptions & {
  duration?: number;
};

declare global {
  namespace Cypress {
    interface Chainable {
      linearMouseMove(
        x: number,
        y: number,
        options?: LinearMouseMoveOptions,
      ): Chainable<JQuery<HTMLElement>>;
    }
  }
}

Cypress.Commands.add(
  "linearMouseMove",
  { prevSubject: "element" },
  (
    subject,
    x,
    y,
    { duration = 100, position = "center", scrollBehavior, ...options } = {},
  ) => {
    const steps = Math.max(1, Math.round(duration / (1000 / fps)));
    const start = getCypressElementCoordinates(
      subject,
      position,
      scrollBehavior,
    );
    const modifiers = getModifiers(options);

    for (let step = 1; step <= steps; step++) {
      cy.then(() =>
        fireCdpCommand("Input.dispatchMouseEvent", {
          button: "left",
          buttons: 1,
          modifiers,
          pointerType: "mouse",
          type: "mouseMoved",
          x: start.x + ((x * step) / steps) * start.frameScale,
          y: start.y + ((y * step) / steps) * start.frameScale,
        }),
      );

      if (step < steps) cy.wait(duration / steps);
    }

    return cy.wrap(subject);
  },
);

export {};
