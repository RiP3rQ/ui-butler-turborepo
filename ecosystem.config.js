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
      host: "uibulter",
      ref: "origin/main",
      repo: "https://github.com/RiP3rQ/ui-butler-turborepo.git",
      path: "/home/uibutler",
      "pre-deploy-local": "",
      "post-deploy":
        "source ~/.nvm/nvm.sh && npm install -g pnpm@10.2.1 && pnpm install && pnpm run build:backend && pm2 reload ecosystem.config.js --env production",
      "pre-setup": "",
      ssh_options: "ForwardAgent=yes",
    },
  },
};
