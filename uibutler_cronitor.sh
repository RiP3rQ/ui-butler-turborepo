#!/bin/bash
echo "Starting the daily restart of the uibutler backend microservices --- $(date)"
echo "Stopping the uibutler backend microservices"
pm2 stock backend
echo "Waiting for 10 seconds"
sleep 10
echo "Starting the uibutler backend microservices using pm2"
pm2 start 'pnpm run start:backend' --name backend
echo "Waiting for 15 seconds"
sleep 15
echo "Validating the uibutler backend microservices"
pm2 list
echo "Displaying 300 lines of the uibutler backend microservices logs"
pm2 logs backend --lines 300
echo "Ending the daily restart of the uibutler backend microservices --- $(date)"
