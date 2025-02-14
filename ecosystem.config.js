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
      repo: "git@github.com:RiP3rQ/ui-butler-turborepo.git",
      path: "/home/uibutler",
      "pre-setup": "ssh -T git@github.com",
      "post-setup":
        "echo 'commands or a script path to be run on the host after cloning the repo'",
      "pre-deploy": "pm2 startOrRestart ecosystem.json --env production",
      "pre-deploy-local": "echo 'This is a local executed command'",
      "post-deploy":
        "source ~/.nvm/nvm.sh && pnpm install && pnpm run build:backend && pm2 reload ecosystem.config.js --env production",
      ssh_options: "ForwardAgent=yes",
    },
  },
};
