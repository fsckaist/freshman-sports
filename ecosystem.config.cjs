module.exports = {
  apps: [
    {
      name: 'freshman-sports',
      script: 'build/index.js',
      node_args: "--env-file=.env",
      env: {
        PORT: 3000,
        NODE_ENV: 'production'
      }
    }
  ]
};
