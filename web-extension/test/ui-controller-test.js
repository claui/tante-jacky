import chai from "chai";

import UiController from "../lib/ui-controller.js";

const { expect } = chai;

describe("UiController", function () {
  describe("#run()", function () {
    let steps;

    beforeEach("object under test", function () {
      steps = new UiController().run();
    });

    specify("#next", function () {
      expect(steps.next).to.be.a("function");
    });

    describe("steps", function () {
      describe("check frontend version", function () {
        let step;

        beforeEach(async function () {
          ({ value: step } = await steps.next());
        });

        describe("#didEnterSuccessState", function () {
          it("is a promise", async function () {
            expect(step).to.have.property("didEnterSuccessState");
            expect(step.didEnterSuccessState).to.be.a("Promise");
          });

          it("is eventually fulfilled", async function () {
            expect(await step.didEnterSuccessState).to.be.an("object")
          });

          describe("result", function () {
            let widget;

            this.beforeEach(async function () {
              widget = await step.didEnterSuccessState;
            });

            it("has the correct frontend version", function () {
              expect(widget).to.include({
                title: "Frontend-Version",
                value: "0.1.0",
              });
            });
          });
        });
      });

      describe("check TLS certificate", function () {
        let step;

        beforeEach(async function () {
          await steps.next();
          ({ value: step } = await steps.next());
        });

        describe("#didEnterSuccessState", function () {
          it("is a promise", async function () {
            expect(step).to.have.property("didEnterSuccessState");
            expect(step.didEnterSuccessState).to.be.a("Promise");
          });

          it("is eventually fulfilled", async function () {
            expect(await step.didEnterSuccessState).to.be.an("object")
          });

          describe("result", function () {
            let widget;

            this.beforeEach(async function () {
              widget = await step.didEnterSuccessState;
            });

            it("has a valid TLS certificate", function () {
              expect(widget).to.include({
                title: "TLS-Zertifikat der Website",
                value: "ok",
              });
            });
          });
        });
      });

      describe("check website identity", function () {
        let step;

        beforeEach(async function () {
          await steps.next();
          await steps.next();
          ({ value: step } = await steps.next());
        });

        describe("#didEnterSuccessState", function () {
          it("is a promise", async function () {
            expect(step).to.have.property("didEnterSuccessState");
            expect(step.didEnterSuccessState).to.be.a("Promise");
          });

          it("is eventually fulfilled", async function () {
            expect(await step.didEnterSuccessState).to.be.an("object")
          });

          describe("result", function () {
            let widget;

            this.beforeEach(async function () {
              widget = await step.didEnterSuccessState;
            });

            it("has an identity we trust", function () {
              expect(widget).to.include({
                title: "Identität der Website",
                value: "ok",
                details: "spk-aschaffenburg.de",
              });
            });
          });
        });
      });

      it("has no more steps", async function () {
        await steps.next();
        await steps.next();
        await steps.next();
        expect((await steps.next()).done).to.be.true;
      });
    });
  });
});
