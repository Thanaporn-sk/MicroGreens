import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function TestConnectionPage() {
    let status = 'Testing...';
    let detail = '';
    let isError = false;

    try {
        // Attempt a simple query
        const count = await prisma.user.count();
        status = '✅ Connection Successful';
        detail = `User count: ${count}`;
    } catch (e: any) {
        status = '❌ Connection Failed';
        isError = true;
        detail = e.message || JSON.stringify(e);
        console.error('DB Connection Test Error:', e);
    }

    return (
        <div className="p-8 font-mono">
            <h1 className="text-xl font-bold mb-4">Database Connection Test</h1>

            <div className={`p-4 rounded border ${isError ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                <h2 className={`font-bold ${isError ? 'text-red-700' : 'text-green-700'}`}>{status}</h2>
                <pre className="mt-2 whitespace-pre-wrap break-all text-sm p-2 bg-white rounded border">
                    {detail}
                </pre>
            </div>

            <div className="mt-4 text-sm text-gray-500">
                <p>Environment: {process.env.NODE_ENV}</p>
            </div>
        </div>
    );
}
