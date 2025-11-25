const fs = require('fs');
const path = require('path');

const API_URL = 'http://127.0.0.1:3000/api';
const TEST_USER = {
    username: 'test_import_user_' + Date.now(),
    email: 'test_import_' + Date.now() + '@example.com',
    password: 'password123'
};

const CSV_CONTENT = `date,title,amount,identificador
2023-10-26,Supermercado,150.50,ID12345
2023-10-27,Uber,25.90,ID67890
2023-10-28,Salario,5000.00,ID54321
`;

const CSV_FILE_PATH = path.join(__dirname, 'test_bank_statement.csv');

async function runVerification() {
    try {
        console.log('Node version:', process.version);
        console.log('File defined:', typeof File !== 'undefined');
        console.log('FormData defined:', typeof FormData !== 'undefined');
        console.log('fetch defined:', typeof fetch !== 'undefined');

        console.log('1. Registering test user...');
        let token;

        try {
            const registerRes = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(TEST_USER)
            });

            console.log('Register status:', registerRes.status);
            if (registerRes.ok) {
                const data = await registerRes.json();
                token = data.token;
                console.log('User registered.');
            } else {
                const text = await registerRes.text();
                console.log('Registration failed:', text);

                console.log('Trying login...');
                const loginRes = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: TEST_USER.email,
                        password: TEST_USER.password
                    })
                });

                console.log('Login status:', loginRes.status);
                if (loginRes.ok) {
                    const data = await loginRes.json();
                    token = data.token;
                    console.log('User logged in.');
                } else {
                    const text = await loginRes.text();
                    throw new Error(`Login failed: ${loginRes.status} ${text}`);
                }
            }
        } catch (e) {
            console.error('Auth error:', e);
            throw e;
        }

        if (!token) {
            // Try login one more time if register didn't return token
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
            } else {
                throw new Error('Could not get token');
            }
        }

        console.log('2. Creating sample CSV file...');
        fs.writeFileSync(CSV_FILE_PATH, CSV_CONTENT);
        console.log('CSV file created.');

        console.log('3. Uploading CSV to /import-bank-statement...');

        const fileContent = fs.readFileSync(CSV_FILE_PATH);
        const file = new File([fileContent], 'test_bank_statement.csv', { type: 'text/csv' });

        const formData = new FormData();
        formData.append('file', file);

        const uploadRes = await fetch(`${API_URL}/transactions/import-bank-statement`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        console.log('Upload status:', uploadRes.status);
        const result = await uploadRes.json();
        console.log('Upload response:', JSON.stringify(result, null, 2));

        if (uploadRes.status === 201) {
            console.log('SUCCESS: Bank statement imported successfully.');
        } else {
            console.error('FAILURE: Unexpected status code', uploadRes.status);
        }

    } catch (error) {
        console.error('Verification failed:', error);
    } finally {
        if (fs.existsSync(CSV_FILE_PATH)) {
            fs.unlinkSync(CSV_FILE_PATH);
            console.log('Cleanup: CSV file deleted.');
        }
    }
}

runVerification();
