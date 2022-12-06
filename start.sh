#!/bin/bash

cd /home/agenciaboz/api

screen -X -S api kill
screen -X -S api-http kill

screen -m -d -S api yarn start
screen -m -d -S api-http yarn dev