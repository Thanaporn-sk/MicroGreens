const fs = require('fs');
const path = 'D:\\sunflower\\599950753_25574932745477272_7661034500357923347_n.jpg';

async function upload() {
    try {
        console.log('Reading file:', path);
        const buffer = fs.readFileSync(path);
        const blob = new Blob([buffer], { type: 'image/jpeg' });

        const formData = new FormData();
        formData.append('file', blob, 'test-upload-sunflower.jpg');

        console.log('Uploading to https://microgreens-app.vercel.app/api/upload...');
        const response = await fetch('https://microgreens-app.vercel.app/api/upload', {
            method: 'POST',
            body: formData,
        });

        console.log('Response Status:', response.status);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Upload Result:', result);
    } catch (error) {
        console.error('Upload Failed:', error);
    }
}

upload();
