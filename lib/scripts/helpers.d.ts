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
export declare const formatSizeUnits: (bytes: number) => string;
export declare const compareFiles: (a: fileObj, b: fileObj) => number;
export declare const genMovie: (file: fileObj, description: string, movieData: any) => any;
export declare const genLine: (file: fileObj, description: string) => fileLine;
export declare const styleText: (text: string, color: string) => string;
