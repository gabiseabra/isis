import { Default, type ResizableStoryProps } from "./Resizable.stories";

describe("Resizable", () => {
  beforeEach(() => {
    cy.clearAllSessionStorage();
  });

  it("resizes horizontally from the right handle", () => {
    cy.mount(
      Default.render({
        defaultHeight: 160,
        defaultWidth: 320,
        positions: ["right"],
      }),
    );

    cy.get('[data-side="right"]')
      .realMouseDown({ position: "center" })
      .linearMouseMove(80, 0, { position: "center" })
      .realMouseUp();

    cy.get("#Default").should(([$element]) => {
      const size = $element.getBoundingClientRect();

      expect(size.width).to.be.closeTo(400, 1);
      expect(size.height).to.be.closeTo(160, 1);
    });
  });

  it("resizes vertically from the bottom handle", () => {
    cy.mount(
      Default.render({
        defaultHeight: 160,
        defaultWidth: 320,
        positions: ["bottom"],
      }),
    );

    cy.get('[data-side="bottom"]')
      .realMouseDown({ position: "center" })
      .linearMouseMove(0, 50, { position: "center" })
      .realMouseUp();

    cy.get("#Default").should(([$element]) => {
      const size = $element.getBoundingClientRect();

      expect(size.width).to.be.closeTo(320, 1);
      expect(size.height).to.be.closeTo(210, 1);
    });
  });

  it("marks itself as resizing during pointer drag", () => {
    cy.mount(
      Default.render({
        defaultHeight: 160,
        defaultWidth: 320,
        positions: ["right"],
      }),
    );

    cy.get('[data-side="right"]').realMouseDown({
      button: "left",
      position: "center",
    });
    cy.get("#Default").should("have.attr", "data-resizing");

    cy.get('[data-side="right"]').realMouseUp();
    cy.get("#Default").should("not.have.attr", "data-resizing");
  });

  it("clamps horizontal resizing to min and max width", () => {
    const props: ResizableStoryProps = {
      defaultHeight: 234,
      defaultWidth: 420,
      maxWidth: 460,
      minWidth: 350,
      positions: ["right"],
    };

    cy.mount(Default.render(props));

    cy.get('[data-side="right"]')
      .realMouseDown({ position: "center" })
      .linearMouseMove(80, 0, { position: "center" })
      .realMouseUp();

    cy.get("#Default").should(([$element]) => {
      expect($element.getBoundingClientRect().width).to.be.closeTo(460, 1);
    });

    cy.clearAllSessionStorage();
    cy.mount(Default.render(props));

    cy.get('[data-side="right"]')
      .realMouseDown({ position: "center" })
      .linearMouseMove(-100, 0, { position: "center" })
      .realMouseUp();

    cy.get("#Default").should(([$element]) => {
      expect($element.getBoundingClientRect().width).to.be.closeTo(350, 1);
    });
  });

  it("preserves aspect ratio when resizing from a corner", () => {
    cy.mount(
      Default.render({
        aspectRatio: 2,
        defaultHeight: 160,
        defaultWidth: 320,
        positions: ["bottom-right"],
      }),
    );

    cy.get('[data-side="bottom-right"]')
      .realMouseDown({ position: "center" })
      .linearMouseMove(80, 10, { position: "center" })
      .realMouseUp();

    cy.get("#Default").should(([$element]) => {
      const size = $element.getBoundingClientRect();

      expect(size.width).to.be.closeTo(400, 1);
      expect(size.height).to.be.closeTo(200, 1);
    });
  });
});
