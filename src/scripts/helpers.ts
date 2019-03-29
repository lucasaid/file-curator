export interface fileObj {
  name: string;
  path: string;
  size: string;
  date: string;
  isDir: boolean;
}
export interface fileLine {
  name: string;
  date: string;
  size: string;
  description: string;
  year?: string;
  rating?: string;
}

export interface commentData {
  fileComment: string;
  overWrite: boolean;
}

export interface currentFiles {
  [key: string]: string;
}

export const formatSizeUnits = (bytes: number): string => {
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

export const compareFiles = (a: fileObj, b: fileObj): number => {
  return (b.isDir ? 1 : 0) - (a.isDir ? 1 : 0) || a.name > b.name ? 1 : -1;
};
export const genMovie = (
  file: fileObj,
  description: string,
  movieData: any
): any => {
  let rating = movieData.rating;
  let year = movieData.year;
  if (movieData.Ratings) {
    rating = movieData.Ratings.filter(
      (rating: any) => rating.Source === "Rotten Tomatoes"
    )[0].Value;
    year = movieData.Year;
  }
  return {
    name: file.name,
    date: file.date,
    size: file.size,
    description,
    year,
    rating
  };
};
export const genLine = (file: fileObj, description: string): fileLine => {
  return {
    name: file.name,
    date: file.date,
    size: file.size,
    description
  };
};
export const styleText = (text: string, color: string): string => {
  const colors: any = {
    green: "\x1b[32m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    white: "\x1b[37m",
    underline: "\x1b[4m",
    white_underline: "\x1b[4m\x1b[37m"
  };

  return `${colors[color]}${text}\x1b[0m`;
};
