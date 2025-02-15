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

# Install pm2

npm install pm2 -g

# Install nginx

sudo apt-get install -y nginx

# Restart nginx

sudo systemctl restart nginx

# Edit nginx config

sudo nano /etc/nginx/sites-available/api.uibutler.site

# Type this into file ->

server {
listen 80;
server_name your_domain www.your_domain [OR AT THE BEGINNING URL OF THE VPS];

    location / {
        proxy_pass http://120.0.0.1:3333/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

}
[ctrl + s] -> save
[ctrl + x] -> exit

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

(Needed only for private repositories)
(LINUX)export GITHUB_USERNAME=[YOUR_GITHUB_USERNAME] or (WINDOWS)$env:GITHUB_USERNAME=[YOUR_GITHUB_USERNAME]
(LINUX)export GITHUB_TOKEN=[YOUR_GITHUB_PRIVATE_TOKEN]  or (WINDOWS)$env:GITHUB_TOKEN=[YOUR_GITHUB_PRIVATE_TOKEN]

# If you want to utilize turbo remote caching for faster deployment, you need to set up the following environment variables

(Setup LOCAL system environment variables for turbo remote caching for faster deployment)
(LINUX)export TURBO_TOKEN=[YOUR_VERCEL_TOKEN] or (
WINDOWS)$env:TURBO_ENV=[YOUR_VERCEL_TOKEN] (from https://vercel.com/account/settings/tokens)
(LINUX)export TURBO_TEAM=[YOUR_VERCEL_TEAM]  or (WINDOWS)$env:TURBO_TEAM=[YOUR_VERCEL_TEAM] (everything after
vercel.com/[YOUR_VERCEL_TEAM])

### ALL THIS ENVIRONMENT VARIABLES ARE NEEDED TO BE USED IN THE 'ecosystem.congif.js' FILE

# Deploy the setup production setup script to the vps

pm2 deploy production setup

# When running week VPS, run this command to activate swap memory

## SSH into your VPS and run the following commands

sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Makes swap permanent

sudo echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Deploy the setup production script to the vps

pm2 deploy production
