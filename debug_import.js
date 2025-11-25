const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:3000/api';
const TEST_USER = {
    username: 'test_debug_user_' + Date.now(),
    email: 'test_debug_' + Date.now() + '@example.com',
    password: 'password123'
};

const CSV_CONTENT = `date,title,amount,identificador
2023-10-26,Supermercado,150.50,ID12345
2023-10-27,Uber,25.90,ID67890
2023-10-28,Salario,5000.00,ID54321
`;

const CSV_FILE_PATH = path.join(__dirname, 'test_debug_bank_statement.csv');

async function runVerification() {
    try {
        console.log('1. Registering test user...');
        let token;

        const registerRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(TEST_USER)
        });

        if (registerRes.ok) {
            const data = await registerRes.json();
            token = data.token;
            console.log('User registered.');
        } else {
            console.log('Registration failed, trying login...');
            // Assuming user might exist from previous runs
            const loginRes = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: TEST_USER.email,
                    password: TEST_USER.password
                })
            });

            if (loginRes.ok) {
                const data = await loginRes.json();
                token = data.token;
                console.log('User logged in.');
            } else {
                const text = await loginRes.text();
                throw new Error(`Login failed: ${loginRes.status} ${text}`);
            }
        }

        console.log('2. Creating sample CSV file...');
        fs.writeFileSync(CSV_FILE_PATH, CSV_CONTENT);

        console.log('3. Uploading CSV to /import-bank-statement...');
        const fileContent = fs.readFileSync(CSV_FILE_PATH);
        const boundary = '--------------------------' + Date.now().toString(16);

        let body = `--${boundary}\r\n`;
        body += `Content-Disposition: form-data; name="file"; filename="test_debug_bank_statement.csv"\r\n`;
        body += `Content-Type: text/csv\r\n\r\n`;

        const header = Buffer.from(body, 'utf-8');
        const footer = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf-8');
        const payload = Buffer.concat([header, fileContent, footer]);

        const uploadRes = await fetch(`${API_URL}/transactions/import-bank-statement`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                'Content-Length': payload.length
            },
            body: payload
        });

        console.log('Upload status:', uploadRes.status);
        const result = await uploadRes.json();
        console.log('Response:', JSON.stringify(result, null, 2));

    } catch (error) {
        console.error('Verification failed:', error);
    } finally {
        if (fs.existsSync(CSV_FILE_PATH)) {
            fs.unlinkSync(CSV_FILE_PATH);
        }
    }
}

runVerification();
