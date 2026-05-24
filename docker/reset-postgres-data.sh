#!/bin/sh
cd /pg || exit 1
mkdir -p data-corrupt-backup
cd data || exit 1
for f in * .[!.]* ..?*
do
  if [ "$f" != "." ] && [ "$f" != ".." ] && [ -e "$f" ] ; then
    mv "$f" ../data-corrupt-backup/
  fi
done
