#!/bin/bash

filepth="$1"

comment=`/usr/bin/osascript << EOT
set filepath to POSIX file "$filepth"
set the_File to filepath as alias
tell application "Finder" to set TheComment to comment of the_File
return TheComment
EOT`

printf "%s" "$comment"