#!/bin/bash

filepth="$1"
updated="$2"
comment=$(mdls -r -nullMarker "" -n kMDItemFinderComment "$filepth")

printf "%s ( comment ): %s\n" "${filepth##*/}" "$comment"
printf "%s ( updated ): " "${filepth##*/}" 

/usr/bin/osascript -e "set filepath to POSIX file \"$filepth\"" \
-e "set the_File to filepath as alias" \
-e "tell application \"Finder\" to set the comment of the_File to \"$updated\""