import { expect } from "chai";

import DomainName from "../lib/net/domain-name.js";
import { sleep } from "../lib/time.js";

import {
  FrontendVersionCheck,
  IncognitoCheck,
  WebsiteIdentityCheck,
  TanChallengeCheck,
} from "../lib/steps.js";

import UiController from "../lib/ui-controller.js";

describe("UiController", function () {
  describe("#run()", function () {
    context("we’re on a good website", function () {
      let steps;

      beforeEach("object under test", function () {
        steps = new UiController({
          siteIdentityProvider: {
            hasDomainName: () => true,
            getDomainName: () => new DomainName("spk-aschaffenburg.de"),
            isIncognito: () => false,
          },
          tanChallengeProvider: {
            detectTanMechanism: () => null,
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

        describe("check Incognito mode", function () {
          let step;

          beforeEach(async function () {
            await steps.next(); // skip
            ({ value: step } = await steps.next());
          });

          it("is the correct step", function () {
            expect(step).to.be.an.instanceof(IncognitoCheck);
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
              it("says the browser is in standard mode", async function () {
                expect(await step.didEnterSuccessState).to.include({
                  title: "Browsermodus",
                  value: "Standard",
                });
              });
            });
          });
        });

        describe("check website identity", function () {
          let step;

          beforeEach(async function () {
            await steps.next(); // skip
            await steps.next(); // skip
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
                  details: "Die Domain „spk-aschaffenburg.de“ ist in Ordnung.",
                });
              });
            });
          });
        });

        describe("check for TAN challenge", function () {
          let step;

          beforeEach(async function () {
            for (let stepIndex = 0; stepIndex < 3; stepIndex++) {
              await steps.next(); // skip
            }
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
                  title: "Seite verlangt eine TAN",
                  value: "nein",
                  details:
                    "Diese Seite fordert gerade keine TAN für eine Zahlung. " +
                    "Veranlasse eine Zahlung, die eine TAN verlangt.",
                });
              });
            });
          });
        });

        it("has no more steps", async function () {
          for (let stepIndex = 0; stepIndex < 4; stepIndex++) {
            await steps.next(); // skip
          }
          expect((await steps.next()).done).to.be.true;
        });
      });
    });

    context("we’re on a bad website", function () {
      let steps;

      beforeEach("object under test", function () {
        steps = new UiController({
          siteIdentityProvider: {
            hasDomainName: () => true,
            getDomainName: () => new DomainName("badbank.example.com"),
            isIncognito: () => false,
          },
          tanChallengeProvider: {
            detectTanMechanism: () => null,
          },
        }).run();
      });

      specify("#next", function () {
        expect(steps.next).to.be.a("function");
      });

      describe("steps", function () {
        describe("check website identity", function () {
          let step;

          beforeEach(async function () {
            await steps.next(); // skip
            await steps.next(); // skip
            ({ value: step } = await steps.next());
          });

          it("is the correct step", function () {
            expect(step).to.be.an.instanceof(WebsiteIdentityCheck);
          });

          describe("#didEnterSuccessState", function () {
            it("is a promise", async function () {
              expect(step).to.have.property("didEnterFailureState");
              expect(step.didEnterFailureState).to.be.a("Promise");
            });

            it("is eventually fulfilled", async function () {
              expect(await step.didEnterFailureState).to.be.an("object");
            });

            describe("result", function () {
              it("has an unknown identity", async function () {
                expect(await step.didEnterFailureState).to.include({
                  title: "Identität der Website",
                  value: "Seite nicht freigegeben",
                  details:
                    "Tante Jacky kennt die Seite „badbank.example.com“" +
                    " nicht. Gehe auf eine andere Webseite und probiere" +
                    " es nochmal.",
                });
              });
            });
          });
        });

        context("we’re requesting more steps", function () {
          it("stops yielding", async function () {
            for (let stepIndex = 0; stepIndex < 3; stepIndex++) {
              await steps.next(); // skip
            }

            await Promise.race([
              steps.next().then(({ value: step, done }) => {
                if (done) {
                  return Promise.resolve();
                }
                expect.fail(
                  `Expected generator to finish but it yielded: ${step}`
                );
              }),
              sleep(50),
            ]);
          });
        });
      });
    });
  });
});
