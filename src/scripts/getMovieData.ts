import request from "sync-request";
function getMovieData(
  name: string,
  API: string | undefined,
  notfound?: boolean,
  yearParse?: string
) {
  if (API && name) {
    let year: string | null = null;
    let searchName: string = "";
    if (!notfound) {
      name = name
        .split(".")
        .slice(0, -1)
        .join(".");
      name = name.replace(/\./gi, " ");
      const yearArray: any = name.split(/[^\d]/).filter(
        (n: any): any => {
          if (n >= 1900 && n <= 2099) return n;
        }
      );
      year = yearArray[yearArray.length - 1];
      if (year) {
        const nameArray = name.split(year);
        searchName = nameArray[0];
      }
    } else {
      if (yearParse) {
        year = yearParse;
      }
      searchName = name;
    }
    let url = `http://www.omdbapi.com/?apikey=${API}&type=movie&t=${searchName}`;
    if (year) {
      url = `${url}&y=${year}`;
    }
    var res = request("GET", url);
    const result = res.getBody("utf8");
    const json = JSON.parse(result);
    if (json.Response === "False") {
      return false;
    }
    return json;
  } else {
    return false;
  }
}
export default getMovieData;
