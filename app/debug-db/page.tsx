export const dynamic = 'force-dynamic';

export default function DebugDBPage() {
    const dbUrl = process.env.DATABASE_URL || 'NOT_SET';

    // Safety mask
    let maskedUrl = dbUrl;
    try {
        const url = new URL(dbUrl);
        url.password = '******';
        maskedUrl = url.toString();
    } catch (e) {
        maskedUrl = 'Invalid URL format';
    }

    return (
        <div className="p-8 font-mono">
            <h1 className="text-xl font-bold mb-4">Database Connection Debug</h1>
            <div className="bg-gray-100 p-4 rounded border">
                <p className="mb-2"><strong>DATABASE_URL:</strong></p>
                <code className="break-all">{maskedUrl}</code>
            </div>

            <div className="mt-8 text-sm text-gray-500">
                <p>Check if the "Host" (part after @) matches your expectation.</p>
                <p>Expected Prod Host: <code>aws-1-ap-south-1.pooler.supabase.com</code></p>
            </div>
        </div>
    );
}
