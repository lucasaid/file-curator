declare const getFileComment: (file: any, currentFileData: any, force: boolean, emptyComment: boolean, useCurrent: boolean, apple: boolean) => {
    fileComment: string;
    overWrite: boolean;
};
export default getFileComment;
