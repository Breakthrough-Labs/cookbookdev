#!/usr/bin/env node

const axios = require("axios");
const fs = require("fs");

const getGistId = async (contractAddress) => {
  const res = await axios.get(
    `https://simple-web3-api.herokuapp.com/cli/id/${contractAddress}`
  );

  return res.data;
};

const retrieveGistFiles = async (gistId) => {
  const res = await axios.get(`https://api.github.com/gists/${gistId}`);
  return res.data.files;
};

const saveContracts = (contractAddress, files) => {
  if (!fs.existsSync("cookbook")) {
    fs.mkdirSync("cookbook");
  }
  if (!fs.existsSync(`cookbook/${contractAddress}`)) {
    fs.mkdirSync(`cookbook/${contractAddress}`);
  }
  for (const filename of Object.keys(files)) {
    fs.writeFileSync(
      `cookbook/${contractAddress}/${filename}`,
      files[filename].content
    );
  }
};

const main = async () => {
  const contractAddress = process.argv[2];
  const id = await getGistId(contractAddress);
  const files = await retrieveGistFiles(id);
  saveContracts(contractAddress, files);
};

main();
