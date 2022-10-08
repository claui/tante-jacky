## Maintenance

### yarn install

tante-jacky has zero runtime dependencies.

To install the current development dependencies as specified in
`package.json` and `yarn.lock`, run: `yarn install`

### yarn clean-install

If the Yarn version has changed and you run `yarn install`, Yarn
will try to upgrade itself. That causes changes to several files,
such as the `LICENSE` files I have placed into several
subdirectories.

Anytime that happens, run the `yarn clean-install` script, a wrapper
around `yarn install` which cleans up afterwards.

Note that the `yarn clean-install` script may fail and tell you to
run `yarn install` instead. I haven’t figured out why it does that.
If that happens, run `yarn install` followed by `yarn clean-install`.

### yarn outdated

To see a list of outdated packages, run: `yarn outdated`

### yarn upgrade-lockfile

This runs `yarn up -R '**' && yarn clean-install` behind the scenes
in order to upgrade all resolutions in the lockfile as far as
possible, but leaves your `package.json` as is.

### yarn upgrade-packages

The built-in `yarn up` command can be a bit cumbersome to use if you
want to upgrade all dependencies in one go.

Running the `yarn upgrade-packages` script will upgrade all relevant
dependencies. That includes the `@yarnpkg` scopes but excludes Yarn
itself (see the `yarn upgrade-yarn-itself` section).

### yarn upgrade-yarn-itself

To upgrade Yarn PnP to the latest available version, run the
`yarn upgrade-yarn-itself` script.

Note that the script will only print manual instructions. That’s
because Yarn makes changes to `package.json`, and that doesn’t play
well with Yarn PnP in scripts.

### yarn upgrade-all

To also upgrade Yarn itself, run `yarn upgrade-all`.

## Handling vulnerable transitive dependencies

tante-jacky has zero runtime dependencies.

It does has development-time dependencies, though. People are
frequently discovering vulnerabilities in those packages.
Therefore, I have to apply patches in order to protect both my own
development environment and the build machine that you are using to
package the extension.

I have force-upgraded a vulnerable transitive dependency using a
shell command:
<!--
I have force-upgraded vulnerable transitive dependencies using shell commands. The dependencies need to be upgraded in the given order.
-->

### Vulnerability in update-notifier, dependency of web-ext v7.1.0

Manually bump `web-ext`’s dependency `update-notifier` to v6.0.2
in order to bump the transitive dependency `got` to v11.8.5:

```shell
yarn set resolution --save update-notifier@npm:5.1.0 6.0.2
```

(Remove this section once an upgrade to `web-ext` is available
that depends on update-notifier v6.0.2 or higher.)

## License

This repository contains source code vendored from different parties.
Therefore, multiple sets of license terms apply to different parts of this repository.

The following table shows which terms apply to which directory trees:

| Directory tree | License | Terms |
|---|---|---|
| `web-extension/.yarn/releases` | BSD-2-Clause | [LICENSE](./.yarn/releases/LICENSE) |
| `web-extension/vendor/addons-linter-5.0.0` | MPL-2.0 | [LICENSE](./vendor/addons-linter-5.0.0/LICENSE) |
| `web-extension` (this program) | GPL-3.0-or-later | [LICENSE](./LICENSE)<br>with License header below |

You will find a dedicated `LICENSE` file in each of those directories.

Each `LICENSE` file applies to the whole directory subtree of the directory where the `LICENSE` file itself is located, but not to any subdirectory which contains a `LICENSE` file on its own.

## License header for web-extension (this program)

Copyright (c) 2022 Claudia Pellegrino

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see https://www.gnu.org/licenses/.
