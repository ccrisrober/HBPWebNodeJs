#!/bin/bash

git add -A

git commit -m "$1"

git push origin master # push in github

git push heroku master #push in heroku

grunt	# open server in localhost :D
