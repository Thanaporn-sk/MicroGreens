const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Simulate what happens when FormData.getAll('images') is called
function testFormDataBehavior() {
    console.log('Testing FormData behavior with files...\n');

    const formData = new FormData();

    // Test 1: No files
    console.log('Test 1: No files added');
    const noFiles = formData.getAll('images');
    console.log('Result:', noFiles);
    console.log('Length:', noFiles.length);
    console.log('');

    // Test 2: With a file
    console.log('Test 2: With a real file');
    const testFilePath = path.join(__dirname, 'test-image-upload.js');
    if (fs.existsSync(testFilePath)) {
        formData.append('images', fs.createReadStream(testFilePath));
        const withFiles = formData.getAll('images');
        console.log('Result:', withFiles);
        console.log('');
    }

    // Test 3: Check instanceof
    console.log('Test 3: Checking File instance');
    const mockFile = { size: 100, name: 'test.jpg' };
    console.log('mockFile instanceof File:', mockFile instanceof File);
    console.log('typeof mockFile:', typeof mockFile);
    console.log('');
}

testFormDataBehavior();
