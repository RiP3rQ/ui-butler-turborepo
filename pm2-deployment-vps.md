# Connect to vps

ssh -i {location_to_key} {name_of_vps_user}@{vps_address}

# Update the vps

sudo apt-get update

# Install nvm [node]

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.2/install.sh | bash

source ~/.bashrc

# Install node

nvm install --lts

# Install pnpm

curl -fsSL https://get.pnpm.io/install.sh | sh - [LATEST_VERSION]
curl -fsSL https://get.pnpm.io/install.sh | env PNPM_VERSION=10.2.1 sh - [SPECIFIC_VERSION]

# Install pm2 via pnpm

pnpm install pm2 -g

# Install nginx

sudo apt-get install -y nginx

# Restart nginx

sudo systemctl restart nginx

# Edit nginx config

sudo nano /etc/nginx/sites-available/api.uibutler.site

# Create a symlink to tell Nginx for available sites

sudo ln -s /etc/nginx/sites-available/api.uibutler.site /etc/nginx/sites-enabled/

# Unlink the default site

sudo unlink /etc/nginx/sites-enabled/default

# Restart nginx

sudo systemctl restart nginx

# Config you ssh config file

[PATH ON WINDOWS -> "C:\Users\{YOUR_USERNAME}\.ssh\config"]
Host [VPS_ADDRESS]
HostName [VPS_ADDRESS]
ForwardAgent yes
PreferredAuthentications publickey
IdentityFile [LOCATION_TO_KEY -> key.pem]

## Possibly can add when running Linux or Mac

Host github.com
HostName github.com
User git
IdentityFile ~/.ssh/id_rsa
ForwardAgent yes

### If you want to update repo's files by ssh instead of https

# If deploying a private repository, before running the pm2 command, you need to authenticate with the repository

export GITHUB_USERNAME=[YOUR_GITHUB_USERNAME]
export GITHUB_TOKEN=[YOUR_GITHUB_PRIVATE_TOKEN]
pm2 deploy production setup

# When running week VPS, run this command to activate swap memory

## SSH into your VPS and run the following commands

sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make swap permanent

sudo echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
