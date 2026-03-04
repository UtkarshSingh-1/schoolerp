const bcrypt = require('bcrypt');
const pass = 'Admin@123';

async function run() {
    const hash = await bcrypt.hash(pass, 10);
    console.log(`NEW_HASH:${hash}`);
    const match = await bcrypt.compare(pass, hash);
    console.log(`MATCH:${match}`);
}
run();
