import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
        return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure uploads directory exists
    const relativeUploadDir = `/uploads/${new Date().getFullYear()}/${new Date().getMonth() + 1}`;
    const uploadDir = join(process.cwd(), 'public', relativeUploadDir);

    try {
        await mkdir(uploadDir, { recursive: true });
    } catch (e) {
        console.error('Error creating upload directory', e);
    }

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const filename = `${uniqueSuffix}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
    const filepath = join(uploadDir, filename);

    try {
        await writeFile(filepath, buffer);
        console.log(`Saved file to ${filepath}`);
        const url = `${relativeUploadDir}/${filename}`;
        return NextResponse.json({ success: true, url });
    } catch (e) {
        console.error('Error saving file', e);
        return NextResponse.json({ success: false, message: 'Error saving file' }, { status: 500 });
    }
}
