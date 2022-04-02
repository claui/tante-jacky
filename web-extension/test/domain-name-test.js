import { expect } from "chai";

import DomainName from "../lib/net/domain-name.js";

describe("DomainName", function () {
  describe("#isSubdomainOfOrEqual()", function () {
    specify("hostnames are identical", function () {
      expect(
        new DomainName("exact.example.com").isSubdomainOfOrEqual(
          new DomainName("exact.example.com")
        )
      ).to.be.true;
    });

    context("our hostname ends with otherDomainName’s hostname", function () {
      specify("but we are not a subdomain", function () {
        expect(
          new DomainName("notagoodbank.example.com").isSubdomainOfOrEqual(
            new DomainName("goodbank.example.com")
          )
        ).to.be.false;
      });

      specify("and we are actually a subdomain", function () {
        expect(
          new DomainName("www.goodbank.example.com").isSubdomainOfOrEqual(
            new DomainName("goodbank.example.com")
          )
        ).to.be.true;
      });
    });

    context("our hostname starts with otherDomainName’s hostname", function () {
      specify("but they’re not equal", function () {
        expect(
          new DomainName(
            "goodbank.example.com.badbank.example.com"
          ).isSubdomainOfOrEqual(new DomainName("goodbank.example.com"))
        ).to.be.false;
      });
    });

    specify("our hostname is the empty string", function () {
      expect(
        new DomainName("").isSubdomainOfOrEqual(
          new DomainName("goodbank.example.com")
        )
      ).to.be.false;
    });

    specify("the other hostname is the empty string", function () {
      expect(
        new DomainName("goodbank.example.com").isSubdomainOfOrEqual(
          new DomainName("")
        )
      ).to.be.false;
    });

    specify("our hostname is null", function () {
      expect(
        new DomainName(null).isSubdomainOfOrEqual(
          new DomainName("goodbank.example.com")
        )
      ).to.be.false;
    });

    specify("our hostname is undefined", function () {
      expect(
        new DomainName(undefined).isSubdomainOfOrEqual(
          new DomainName("goodbank.example.com")
        )
      ).to.be.false;
    });

    specify("the other domain name is null", function () {
      expect(
        new DomainName("goodbank.example.com").isSubdomainOfOrEqual(null)
      ).to.be.false;
    });

    specify("the other domain name is undefined", function () {
      expect(
        new DomainName("goodbank.example.com").isSubdomainOfOrEqual(undefined)
      ).to.be.false;
    });

    specify("the other hostname is null", function () {
      expect(
        new DomainName("goodbank.example.com").isSubdomainOfOrEqual(
          new DomainName(null)
        )
      ).to.be.false;
    });

    specify("the other hostname is undefined", function () {
      expect(
        new DomainName("goodbank.example.com").isSubdomainOfOrEqual(
          new DomainName(undefined)
        )
      ).to.be.false;
    });

    specify("our hostname ends with a dot", function () {
      const domainName = new DomainName("goodbank.example.com.");
      expect(domainName.isSubdomainOfOrEqual(null)).to.be.false;
      expect(domainName.isSubdomainOfOrEqual(undefined)).to.be.false;
      expect(domainName.isSubdomainOfOrEqual("")).to.be.false;
    });
  });
});
