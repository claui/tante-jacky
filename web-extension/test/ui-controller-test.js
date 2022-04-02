import chai from "chai";
import chaiAsPromised from "chai-as-promised";

import UiController from "../lib/ui-controller.js";

const { expect } = chai;
chai.use(chaiAsPromised);

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
      describe("checkFrontendVersion", function () {
        let step;

        beforeEach(async function () {
          ({ value: step } = await steps.next());
        });

        describe.only("#didEnterSuccessState", function () {
          it("is a promise", async function () {
            expect(step).to.have.property("didEnterSuccessState");
            expect(step.didEnterSuccessState).to.be.a("Promise");
          });

          it("is eventually fulfilled", async function () {
            return expect(step.didEnterSuccessState).to.eventually.be.an(
              "object"
            );
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
    });

    specify("step #2", async function () {
      await steps.next();
      expect(await steps.next()).to.have.property("value", 77);
    });

    specify("step #3", async function () {
      await steps.next();
      await steps.next();
      expect((await steps.next()).done).to.be.true;
    });
  });
});
