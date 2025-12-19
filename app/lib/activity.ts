import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function logActivity(action: string, detail: string) {
    try {
        const session = await auth();
        const userId = session?.user?.email || 'System'; // Schema uses String for userId?
        // Schema: userId String?
        // Let's check schema again. Yes: userId String?

        await prisma.activityLog.create({
            data: {
                userId,
                action,
                detail
            }
        });
    } catch (error) {
        console.error('Failed to log activity:', error);
        // Don't throw, we don't want to break the main action if logging fails
    }
}
