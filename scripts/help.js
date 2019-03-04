const columnify = require("columnify");
const help = () => {
  console.log("***** FILE CURATOR *****");
  console.log("");
  console.log(
    "File curator genertates a file-listing.txt file that will index and catalogue all files in the current directory, allowing you to have a master file that displays relevant information for each file. Sub-directories are also included."
  );
  console.log("");
  console.log("Usage: file-curator [options] [arguments]");
  console.log("");
  data = [
    {
      option: "-n [filename]",
      description: "Use custom named text file."
    },
    {
      option: "-f",
      description: "Force re-write for all files."
    },
    {
      option: "-u",
      description:
        "If there is description currently assigned to the file, skip asking to overwrite and use current."
    },
    {
      option: "-e",
      description: "Generates empty comment and just generates file list."
    },
    {
      option: "-a",
      description: "Sync with apple finder."
    },
    {
      option: "-d",
      description:
        "Calculate directory file size, can be slow depending on how big the directory is."
    },
    {
      option: "-help",
      description: "Brings up this help text."
    }
  ];
  var columns = columnify(data, {
    columnSplitter: "   ",
    config: {
      description: { maxWidth: 50 }
    }
  });
  console.log(columns);
};

module.exports = help;
