<p align="center">
<br />
<a href="https://www.cookbook.dev">
  <img src="https://raw.githubusercontent.com/Breakthrough-Labs/btlcontracts/master/logo.svg" width="150" alt=""  />
</a>
<br />
</p>
<h1 align="center">Cookbook.dev</h1>
<p align="center">
<a href="https://www.npmjs.com/package/cookbookdev"><img src="https://img.shields.io/npm/v/cookbookdev?color=red&logo=npm" alt="npm version"/></a>
<a href="https://discord.gg/WzsfPcfHrk"><img alt="Join our Discord!" src="https://img.shields.io/discord/999863895634231316?color=7289da&label=discord&logo=discord&style=flat"/></a>
<br />
<a href="https://twitter.com/cookbook_dev"><img src="https://img.shields.io/twitter/follow/cookbook_dev" alt="npm version"/></a>

</p>
<br />

# Find any smart contract, build your project faster

The cookbookdev CLI lets you install any Cookbook contract directly into your personal workflow. In seconds, you can have a contract or library - and all of its dependencies - ready to deploy or edit in your favorite development environment.

- hardhat
- truffle
- brownie
- forge
- and everything else

### Install

You can use npx with `cookbookdev`, but it's more convenient to install it locally

```
$ npm install -g cookbookdev
```

### Quick Use

Find a contract at https://www.cookbook.dev, then download it with

```
$ cookbookdev install {address}
```

## Commands

`cookbookdev install {address}` or `cookbookdev i {address}`: install any contract you find on https://www.cookbook.dev

## Examples

- `cookbookdev i simple-token`
- `cookbookdev install simple-token`
- `npx cookbookdev i simple-token`
- `npx cookbookdev install simple-token`
- `npx cookbookdev install Azuki-ERC721A-NFT-Sale`
