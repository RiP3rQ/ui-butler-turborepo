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
      host: "20.215.33.2",
      ref: "origin/main",
      // VVV ---- FOR PRIVATE REPOS ---- VVV
      repo: `https://${process.env.GITHUB_USERNAME}:${process.env.GITHUB_TOKEN}@github.com/RiP3rQ/ui-butler-turborepo.git`,
      // VVV ---- FOR PUBLIC REPOS ---- VVV
      // repo: "https://github.com/RiP3rQ/ui-butler-turborepo.git",
      path: "/home/uibutler",
      // Remove the pre-setup GitHub check as it's causing issues
      "post-setup": "echo 'Post-setup complete'",
      // Modified pre-deploy to ensure it runs correctly
      "pre-deploy":
        "git pull && curl -fsSL https://get.pnpm.io/install.sh | env PNPM_VERSION=10.2.1 sh -",
      "pre-deploy-local": "echo 'Starting deployment process'",
      // Modified post-deploy to be more robust
      "post-deploy":
        "source ~/.nvm/nvm.sh && export NVM_DIR=$HOME/.nvm && [ -s $NVM_DIR/nvm.sh ] && . $NVM_DIR/nvm.sh && pnpm install && pnpm run build:backend && pm2 reload ecosystem.config.js --env production",
      // Fixed ssh_options format
      ssh_options: ["ForwardAgent=yes"],
      // Add these recommended options
      keep_releases: 3,
      delete_on_rollback: false,
    },
  },
};
