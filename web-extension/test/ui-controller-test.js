import { expect } from "chai";

import DomainName from "../lib/net/domain-name.js";

import {
  FrontendVersionCheck,
  TlsCertificateCheck,
  WebsiteIdentityCheck,
  TanChallengeCheck,
} from "../lib/steps.js";

import UiController from "../lib/ui-controller.js";

describe("UiController", function () {
  describe("#run()", function () {
    let steps;

    beforeEach("object under test", function () {
      steps = new UiController({
        upstreamIdentityProvider: {
          getDomainName: () => new DomainName("spk-aschaffenburg.de"),
        },
      }).run();
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

        it("is the correct step", function () {
          expect(step).to.be.an.instanceof(FrontendVersionCheck);
        });

        describe("#didEnterSuccessState", function () {
          it("is a promise", async function () {
            expect(step).to.have.property("didEnterSuccessState");
            expect(step.didEnterSuccessState).to.be.a("Promise");
          });

          it("is eventually fulfilled", async function () {
            expect(await step.didEnterSuccessState).to.be.an("object");
          });

          describe("result", function () {
            it("has the correct frontend version", async function () {
              expect(await step.didEnterSuccessState).to.include({
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

        it("is the correct step", function () {
          expect(step).to.be.an.instanceof(TlsCertificateCheck);
        });

        describe("#didEnterSuccessState", function () {
          it("is a promise", async function () {
            expect(step).to.have.property("didEnterSuccessState");
            expect(step.didEnterSuccessState).to.be.a("Promise");
          });

          it("is eventually fulfilled", async function () {
            expect(await step.didEnterSuccessState).to.be.an("object");
          });

          describe("result", function () {
            it("has a valid TLS certificate", async function () {
              expect(await step.didEnterSuccessState).to.include({
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

        it("is the correct step", function () {
          expect(step).to.be.an.instanceof(WebsiteIdentityCheck);
        });

        describe("#didEnterSuccessState", function () {
          it("is a promise", async function () {
            expect(step).to.have.property("didEnterSuccessState");
            expect(step.didEnterSuccessState).to.be.a("Promise");
          });

          it("is eventually fulfilled", async function () {
            expect(await step.didEnterSuccessState).to.be.an("object");
          });

          describe("result", function () {
            it("has an identity we trust", async function () {
              expect(await step.didEnterSuccessState).to.include({
                title: "Identität der Website",
                value: "ok",
                details: "spk-aschaffenburg.de",
              });
            });
          });
        });
      });

      describe("check for TAN challenge", function () {
        let step;

        beforeEach(async function () {
          await steps.next();
          await steps.next();
          await steps.next();
          ({ value: step } = await steps.next());
        });

        it("is the correct step", function () {
          expect(step).to.be.an.instanceof(TanChallengeCheck);
        });

        describe("#didEnterFailureState", function () {
          it("is a promise", async function () {
            expect(step).to.have.property("didEnterFailureState");
            expect(step.didEnterFailureState).to.be.a("Promise");
          });

          it("is eventually fulfilled", async function () {
            expect(await step.didEnterFailureState).to.be.an("object");
          });

          describe("result", function () {
            specify("the page isn’t asking us for a TAN", async function () {
              expect(await step.didEnterFailureState).to.include({
                title: "Seite fordert TAN für eine Zahlung",
                value: "fehlgeschlagen",
                details:
                  "Ihr Browser fordert gerade keine TAN für eine Zahlung." +
                  "Veranlassen Sie eine Zahlung, die eine TAN erfordert.",
              });
            });
          });
        });
      });

      it("has no more steps", async function () {
        for (let stepIndex = 0; stepIndex < 4; stepIndex++) {
          await steps.next();
        }
        expect((await steps.next()).done).to.be.true;
      });
    });
  });
});
