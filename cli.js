#!/usr/bin/env node

const axios = require("axios");
const fs = require("fs");
const prompts = require("prompts");

const getContractInfo = async (contractAddress, isPlugin) => {
  let options = isPlugin ? {
      headers: {
        "vscode-plugin": "true",
      },
    } : {}
  const res = await axios.get(
    `https://simple-web3-api.herokuapp.com/cli/id/${contractAddress}`, options
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
  let adjustedFile = contract.split("\n");
  let i = 0;
  for (const line of adjustedFile) {
    if (line.replaceAll(" ", "").substring(0, 2) === "//") {
      adjustedFile.splice(i, 1);
    }
    i++;
  }
  adjustedFile = adjustedFile.join("\n");
  const importIndexes = [
    ...adjustedFile.matchAll(new RegExp("import ", "gi")),
  ].map((a) => a.index);
  const imports = importIndexes.map((index) =>
    adjustedFile.substring(index, adjustedFile.indexOf(";", index))
  );
  for (const line of imports) {
    let path = line.substring(line.indexOf('"') + 1, line.lastIndexOf('"'));
    if (!path) {
      path = line.substring(line.indexOf("'") + 1, line.lastIndexOf("'"));
    }
    const filename = getFilename(path);
    contract = contract.replace(
      path,
      `${isMain ? "./dependencies/" : "./"}${filename}`
    );
  }
  return contract;
};

const saveContracts = async (contractAddress, mainFilename, files) => {
  if (!fs.existsSync("contracts")) {
    fs.mkdirSync("contracts");
  }

  const updatedFiles = {};
  const keys = Object.keys(files);

  for (const filename of keys) {
    const oldFile = files[filename];
    const newFile = updateImports(oldFile.content, filename === mainFilename);
    updatedFiles[filename] = { content: newFile };
  }

  // Handle single file contracts
  if (keys.length === 1) {
    const savePath = `contracts/${keys[0]}`;
    if (fs.existsSync(savePath)) {
      const response = await prompts({
        type: "confirm",
        name: "value",
        message: `${savePath} already exists. Do you want to overwrite it?`,
        initial: false,
      });
      if (!response.value) {
        return `Cooking cancelled. '${contractAddress}' was not saved.`;
      }
    }
    fs.writeFileSync(savePath, files[keys[0]].content);
    return `Cooking complete! '${contractAddress}' has been added to /contracts`;
  }

  const contractDir = `contracts/${contractAddress}`;
  // Handle contracts with dependencies
  if (!fs.existsSync(contractDir)) {
    fs.mkdirSync(contractDir);
  } else {
    const response = await prompts({
      type: "confirm",
      name: "value",
      message: `${contractDir} already exists. Do you want to overwrite it?`,
      initial: false,
    });
    if (!response.value) {
      return `Cooking cancelled. '${contractAddress}' was not saved.`;
    }
  }
  if (!fs.existsSync(`${contractDir}/dependencies`)) {
    fs.mkdirSync(`${contractDir}/dependencies`);
  }
  for (const filename of keys) {
    let savePath = "";
    if (filename === mainFilename) {
      savePath = `contracts/${contractAddress}/${filename}`;
    } else {
      savePath = `contracts/${contractAddress}/dependencies/${filename}`;
    }
    fs.writeFileSync(savePath, updatedFiles[filename].content);
  }
  return `Cooking complete! '${contractAddress}' has been added to /contracts`;
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
    const isPlugin = process.argv[4] === '-plugin';
    const { gistId, mainContract } = await getContractInfo(contractAddress, isPlugin);
    const files = await retrieveGistFiles(gistId);
    const response = await saveContracts(
      contractAddress,
      getFilename(mainContract),
      files
    );
    console.log(
      `
  ${response}
  
  Visit https://www.cookbook.dev for more contracts!
      `
    );
  } catch (error) {
    console.error(
      `
  Cooking failed: are you sure '${process.argv[3]}' is the correct address?
      `
    );
  }
};

main();
