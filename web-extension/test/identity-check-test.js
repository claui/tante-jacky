import { expect } from "chai";

import DomainName from "../lib/net/domain-name.js";
import { WebsiteIdentityCheck } from "../lib/steps.js";

describe("WebsiteIdentityCheck", function () {
  describe("#run()", function () {
    context("if we’re on a good domain", function () {
      let identityCheck;

      this.beforeEach(function () {
        identityCheck = new WebsiteIdentityCheck({
          hasDomainName: () => true,
          getDomainName: () =>
            Promise.resolve(new DomainName("www.spk-aschaffenburg.de")),
          isIncognito: () => false,
        }).start();
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
              details: "Die Domain „spk-aschaffenburg.de“ ist in Ordnung.",
            });
          });
        });
      });
    });

    context("if we’re on a bad domain", function () {
      let identityCheck;

      this.beforeEach(function () {
        identityCheck = new WebsiteIdentityCheck({
          hasDomainName: () => true,
          getDomainName: () =>
            Promise.resolve(
              new DomainName("spk-aschaffenburg.de.badbank.example.com")
            ),
          isIncognito: () => false,
        }).start();
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
              value: "Seite nicht freigegeben",
              details:
                "Tante Jacky kennt die Seite „spk-aschaffenburg.de" +
                ".badbank.example.com“ nicht. Gehe auf eine andere" +
                " Webseite und probiere es nochmal.",
            });
          });
        });
      });
    });
  });
});
