import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const data = await request.formData();
        const file: File | null = data.get('file') as unknown as File;

        if (!file) {
            return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
        }

        // Validate file type (optional but good practice)
        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ success: false, message: 'Invalid file type' }, { status: 400 });
        }

        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '');
        const filename = `${uniqueSuffix}-${cleanFileName}`;

        // Upload to Supabase Storage
        const buffer = await file.arrayBuffer();
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('images') // Ensure this bucket exists in Supabase
            .upload(filename, buffer, {
                contentType: file.type,
                upsert: false
            });

        if (uploadError) {
            console.error('Supabase upload error:', uploadError);
            return NextResponse.json({ success: false, message: 'Upload failed' }, { status: 500 });
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(filename);

        console.log(`Uploaded to Supabase: ${publicUrl}`);
        return NextResponse.json({ success: true, url: publicUrl });

    } catch (e) {
        console.error('Unexpected error during upload:', e);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
