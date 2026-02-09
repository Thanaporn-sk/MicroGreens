
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function getRowsPerPage(): Promise<number> {
    const session = await auth();
    if (!session?.user?.email) return 25;

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { rowsPerPage: true }
    });

    return (user as any)?.rowsPerPage || 25;
}
