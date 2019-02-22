# File Curator

A Node script that generates a list of files in the current directory and stores it in a text file with added descriptions with each file.

Example Output: [file-listing.txt](https://github.com/lucasaid/file-curator/blob/master/test-directory/file-listing.txt)

## USAGE

Run `file-curator` in current directory you wish to catalogue and you will be prompted to enter details.

## OPTIONS

`-n [filename]`: Use custom named text file. default is `file-listing.txt`  
`-f`: Force re-write for all files.  
`-u`: If there is description currently assigned to the file, skip asking to overwrite and use current.  
`-u`: Generates empty comment and just generates file list.  
`-a`: Sync with apple finder.  
`-d`: Calculate directory file size, can be slow depending on how big the directory is.
`-help`: Brings up help text.

#### Mac Users Note:

If on a Mac OS, the script will attempt to grab and set any comments attached to the file using finder if the `-a` flag is set.
