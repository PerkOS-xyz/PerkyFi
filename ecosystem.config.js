// PM2 Ecosystem Configuration for PerkyFi

module.exports = {
  apps: [
    {
      name: 'perkyfi-app',
      cwd: '/root/perkyfi/app',
      script: 'node',
      args: '.next/standalone/server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        
        // x402 (USDC on Base)
        X402_FACILITATOR_URL: 'https://stack.perkos.xyz/x402',
        X402_RECIPIENT_ADDRESS: process.env.X402_RECIPIENT_ADDRESS || '0x...',
        X402_PRICE_USDC: '0.10',
      },
    },
    {
      name: 'perkyfi-agent',
      cwd: '/root/perkyfi/agent',
      script: 'openclaw',
      args: 'gateway start',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        OPENCLAW_CONFIG_PATH: '/root/perkyfi/agent/config/openclaw.json',
        OPENCLAW_STATE_DIR: '/root/perkyfi/agent',
        OPENCLAW_WORKSPACE: '/root/perkyfi/agent/workspace',
      },
    },
  ],
};
