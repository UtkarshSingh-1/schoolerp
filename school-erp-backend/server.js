require('dotenv').config();
const app = require('./src/app');
const { ensureSchema } = require('./src/startup/ensureSchema');

const PORT = process.env.PORT || 5000;

async function start() {
  await ensureSchema();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start().catch((error) => {
  console.error('Startup failed:', error);
  process.exit(1);
});
