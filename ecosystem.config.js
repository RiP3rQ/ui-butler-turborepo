module.exports = {
  apps: [
    {
      name: "nest-microservices-deployment",
      script: "start:backend",
    },
  ],

  deploy: {
    production: {
      key: "uibutler.pem",
      user: "uibutler",
      host: "20.215.32.98",
      ref: "origin/main",
      // VVV ---- FOR PRIVATE REPOS ---- VVV
      repo: `https://${process.env.GITHUB_USERNAME}:${process.env.GITHUB_TOKEN}@github.com/RiP3rQ/ui-butler-turborepo.git`,
      // VVV ---- FOR PUBLIC REPOS ---- VVV
      // repo: "https://github.com/RiP3rQ/ui-butler-turborepo.git",
      path: "/home/uibutler",
      // Remove the pre-setup GitHub check as it's causing issues
      "post-setup": "echo 'Post-setup complete'",
      // Modified pre-deploy to ensure it runs correctly
      "pre-deploy": "git pull",
      "pre-deploy-local": "echo 'Starting deployment process'",
      // Modified post-deploy to be more robust
      // post-deploy script runs in a non-interactive shell and doesn't have access to the same PATH and environment variables as your interactive shell. You need to source your .bashrc or .bash_profile to ensure that the PATH and environment variables are set correctly.
      "post-deploy":
        `export TURBO_TOKEN=${process.env.TURBO_TOKEN} && ` +
        `export TURBO_TEAM=${process.env.TURBO_TEAM} && ` +
        "export NODE_ENV=production && " +
        "export HUSKY=0 && " +
        "export CI=1 && " +
        "source ~/.profile && " +
        "source ~/.bashrc && " +
        "source ~/.nvm/nvm.sh && " +
        "export NVM_DIR=$HOME/.nvm && " +
        "[ -s $NVM_DIR/nvm.sh ] && . $NVM_DIR/nvm.sh && " +
        "npm install -g pnpm && " +
        "export NODE_OPTIONS='--max_old_space_size=2048' && " +
        "cd /home/uibutler/current && " +
        "pnpm install && " +
        "pnpm run build:backend && " +
        "pm2 reload ecosystem.config.js --env production",
      // Fixed ssh_options format
      ssh_options: ["ForwardAgent=yes"],
      // Add these recommended options
      keep_releases: 3,
      delete_on_rollback: false,
    },
  },
};
