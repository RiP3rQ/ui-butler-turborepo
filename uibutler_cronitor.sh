#!/bin/bash
# Find the full path to pm2 using 'which pm2' when logged in as the same user
PM2_PATH="/home/uibutler/.nvm/versions/node/v22.14.0/bin/pm2"  # This path may vary on your system

echo "Starting the daily restart of the uibutler backend microservices --- $(date)"
echo "Going to project location"
cd /home/uibutler/app
echo "Reload the uibutler backend microservices"
$PM2_PATH reload backend
echo "Waiting for 15 seconds"
sleep 15
echo "Validating the uibutler backend microservices"
$PM2_PATH list
echo "Displaying 300 lines of the uibutler backend microservices logs"
$PM2_PATH logs backend --lines 300 --nostream
echo "Ending the daily restart of the uibutler backend microservices --- $(date)"