# After the deployment is done, setup restarting cron job for the server

# Connect to the server using shh

ssh -i {location_to_key} {name_of_vps_user}@{vps_address}

# Generate a restart script

nano restart.sh

## Copy content of uibutler_cronitor.sh into restart.sh

# Add execution permission to the script

chmod +x restart.sh

# Add a cron job to restart the server

crontab -e

## Add this line to the end of the file

0 23 \* \* _ /path/to/restart.sh [For example: 0 23 _ \* \* /home/uibutler/restart.sh]

# Restart the cron service

sudo service cron restart

# Check if the cron job is added

crontab -l

# Install cronitor

curl https://cronitor.io/install-linux?sudo=1 -H "API-KEY: [YOUR_API_KEY]" | sh

# Run cronitor discover to add monitoring of the cron job with logs

cronitor discover

# Exit the server
