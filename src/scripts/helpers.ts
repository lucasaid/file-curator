export const formatSizeUnits = (bytes: number) => {
  let newBytes: string;
  if (bytes >= 1073741824) {
    newBytes = (bytes / 1073741824).toFixed(2) + " GB";
  } else if (bytes >= 1048576) {
    newBytes = (bytes / 1048576).toFixed(2) + " MB";
  } else if (bytes >= 1024) {
    newBytes = (bytes / 1024).toFixed(2) + " KB";
  } else if (bytes > 1) {
    newBytes = bytes + " bytes";
  } else if (bytes == 1) {
    newBytes = bytes + " byte";
  } else {
    newBytes = "0 bytes";
  }
  return newBytes;
};

export const compareFiles = (a: any, b: any) => {
  return b.isDir - a.isDir || a.name > b.name ? 1 : -1;
};

export const genLine = (file: any, description: string) => {
  return {
    name: file.name,
    date: file.date,
    size: file.size,
    description
  };
};
