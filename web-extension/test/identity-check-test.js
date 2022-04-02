import { expect } from "chai";

import DomainName from "../lib/net/domain-name.js";
import { WebsiteIdentityCheck } from "../lib/steps.js";

describe("WebsiteIdentityCheck", function () {
  describe("#run()", function () {
    context("if we’re on a good domain", function () {
      let identityCheck;

      this.beforeEach(function () {
        identityCheck = new WebsiteIdentityCheck({
          getDomainName: () =>
            Promise.resolve(new DomainName("www.spk-aschaffenburg.de")),
        }).run();
      });

      describe("#didEnterSuccessState", function () {
        it("is a promise", async function () {
          expect(identityCheck).to.have.property("didEnterSuccessState");
          expect(identityCheck.didEnterSuccessState).to.be.a("Promise");
        });

        it("is eventually fulfilled", async function () {
          expect(await identityCheck.didEnterSuccessState).to.be.an("object");
        });

        describe("result", function () {
          it("is correct", async function () {
            expect(await identityCheck.didEnterSuccessState).to.include({
              title: "Identität der Website",
              value: "ok",
              details: "spk-aschaffenburg.de",
            });
          });
        });
      });
    });

    context("if we’re on a bad domain", function () {
      let identityCheck;

      this.beforeEach(function () {
        identityCheck = new WebsiteIdentityCheck({
          getDomainName: () =>
            Promise.resolve(
              new DomainName("spk-aschaffenburg.de.badbank.example.com")
            ),
        }).run();
      });

      describe("#didEnterFailureState", function () {
        it("is a promise", async function () {
          expect(identityCheck).to.have.property("didEnterFailureState");
          expect(identityCheck.didEnterFailureState).to.be.a("Promise");
        });

        it("is eventually fulfilled", async function () {
          expect(await identityCheck.didEnterFailureState).to.be.an("object");
        });

        describe("result", function () {
          it("is correct", async function () {
            expect(await identityCheck.didEnterFailureState).to.include({
              title: "Identität der Website",
              value: "fehlgeschlagen",
              details:
                "Die Domain „spk-aschaffenburg.de.badbank.example.com“" +
                " ist für dieses Verfahren nicht freigegeben.",
            });
          });
        });
      });
    });
  });
});
