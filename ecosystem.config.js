module.exports = {
  apps: [{
    name: 'frontend',
    script: './node_modules/react-scripts/scripts/start.js',
    interpreter: 'node',
    env: {
      HOST: '0.0.0.0',
      PORT: 5757
    }
  }]
};