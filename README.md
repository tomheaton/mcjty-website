# McJty Website

The McJty Website. Maker of RFTools, McJtyLib, Deep Resonance, and Gear Swapper.

<div align="center">
    <img src="./www/static/img/logo.png" alt="McJty Website">
</div>

## Setup

Make sure you have the correct Node.js version installed (v20). This can be made easy by using [nvm](https://github.com/nvm-sh/nvm) (or on Windows [nvm-windows](https://github.com/coreybutler/nvm-windows)).

To set the correct node version:

```shell
nvm use
```

Ensure you have [pnpm](https://pnpm.io/) installed:

```shell
npm install -g pnpm
```

To install dependencies:

```shell
pnpm install
```

## Formatting

To format all files in the project:

```shell
pnpm format
```

## Running Commands

All commands for the sub projects are available in the root package.json. To run a command in a sub project, use the following syntax:

```shell
pnpm www <command>
# or
pnpm redirector <command>
```
