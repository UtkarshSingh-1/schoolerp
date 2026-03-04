const bcrypt = require('bcrypt');
const pass = 'Admin@123';
const hash = '$2b$10$SVPi2TH5SuyJSNyJ/xoXZO9ejL2xNpYDDcoPUcuS8cfY/PFIpqYGW';

async function run() {
    const isMatch = await bcrypt.compare(pass, hash);
    console.log(`Original Hash: ${hash}`);
    console.log(`Password: ${pass}`);
    console.log(`Match: ${isMatch}`);

    if (!isMatch) {
        const newHash = await bcrypt.hash(pass, 10);
        console.log(`NEW HASH: ${newHash}`);
    }
}
run();
