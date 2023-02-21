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

const saveContracts = (contractAddress, mainContract, files) => {
  if (!fs.existsSync("contracts")) {
    fs.mkdirSync("contracts");
  }
  if (!fs.existsSync(`contracts/${contractAddress}`)) {
    fs.mkdirSync(`contracts/${contractAddress}`);
  }
  if (!fs.existsSync(`contracts/${contractAddress}/dependencies`)) {
    fs.mkdirSync(`contracts/${contractAddress}/dependencies`);
  }
  for (const filename of Object.keys(files)) {
    let savePath = `contracts/${contractAddress}/dependencies/${filename}`;
    console.log(mainContract, filename);
    if (mainContract.includes(filename)) {
      savePath = `contracts/${contractAddress}/${filename}`;
    }
    fs.writeFileSync(savePath, files[filename].content);
  }
};

const main = async () => {
  try {
    const contractAddress = process.argv[2];
    const { gistId, mainContract } = await getContractInfo(contractAddress);
    const files = await retrieveGistFiles(gistId);
    saveContracts(contractAddress, mainContract, files);
  } catch (error) {
    console.log(error);
    console.error(
      `Cooking failed: are you sure ${process.argv[2]} is the correct address?`
    );
  }
};

main();
