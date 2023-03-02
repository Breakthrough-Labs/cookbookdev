#!/usr/bin/env node

const axios = require("axios");
const fs = require("fs");

const getContractInfo = async (contractAddress) => {
  const res = await axios.get(
    `https://simple-web3-api.herokuapp.com/cli/id/${contractAddress}`
  );

  return res.data;
};

const retrieveGistFiles = async (gistId) => {
  const res = await axios.get(`https://api.github.com/gists/${gistId}`);
  return res.data.files;
};

const getFilename = (path) => {
  const parts = path.split("/");
  const filename = parts[parts.length - 1];
  return filename;
};

// Updates the imports in each file to match the cookbookdev file structure.
// Gist does not allow directories, so the structure is flattened.
const updateImports = (contract, isMain) => {
  const imports = contract
    .split("\n")
    .filter((line) => line.substring(0, 6) === "import");
  for (const line of imports) {
    const path = line.substring(line.indexOf('"') + 1, line.lastIndexOf('"'));
    const filename = getFilename(path);
    contract = contract.replace(
      path,
      `${isMain ? "./dependencies/" : "./"}${filename}`
    );
  }
  return contract;
};

const saveContracts = (contractAddress, mainContract, files) => {
  if (!fs.existsSync("contracts")) {
    fs.mkdirSync("contracts");
  }

  const updatedFiles = {};
  const keys = Object.keys(files);

  for (const filename of keys) {
    const oldFile = files[filename];
    const newFile = updateImports(
      oldFile.content,
      filename === getFilename(mainContract)
    );
    updatedFiles[filename] = { content: newFile };
  }

  // Handle single file contracts
  if (keys.length === 1) {
    const savePath = `contracts/${keys[0]}`;
    fs.writeFileSync(savePath, files[keys[0]].content);
    return;
  }

  // Handle contracts with dependencies
  if (!fs.existsSync(`contracts/${contractAddress}`)) {
    fs.mkdirSync(`contracts/${contractAddress}`);
  }
  if (!fs.existsSync(`contracts/${contractAddress}/dependencies`)) {
    fs.mkdirSync(`contracts/${contractAddress}/dependencies`);
  }
  for (const filename of keys) {
    let savePath = "";
    if (filename === getFilename(mainContract)) {
      savePath = `contracts/${contractAddress}/${filename}`;
    } else {
      savePath = `contracts/${contractAddress}/dependencies/${filename}`;
    }
    fs.writeFileSync(savePath, updatedFiles[filename].content);
  }
};

const main = async () => {
  try {
    const command = process.argv[2];
    if (command !== "i" && command !== "install") {
      return console.error(
        `Cooking failed: ${command} is not recognized as a command. Try cookbookdev install`
      );
    }

    const contractAddress = process.argv[3];
    const { gistId, mainContract } = await getContractInfo(contractAddress);
    const files = await retrieveGistFiles(gistId);
    saveContracts(contractAddress, mainContract, files);
    console.log(
      `Cooking complete! ${contractAddress} has been added to \\contracts`
    );
  } catch (error) {
    console.log(error);
    console.error(
      `Cooking failed: are you sure ${process.argv[3]} is the correct address?`
    );
  }
};

main();
