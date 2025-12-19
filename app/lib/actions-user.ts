'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { logActivity } from './activity';

export async function createUser(formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const role = formData.get('role') as string;

    if (!name || !email || !password || !role) {
        throw new Error('All fields are required');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
            },
        });
        await logActivity('Create User', `Created user ${email} (${role})`);
        revalidatePath('/users');
        redirect('/users');
    } catch (error) {
        console.error('Failed to create user:', error);
        throw new Error('Failed to create user. Email might already exist.');
    }
}

export async function updateUser(id: string, formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const role = formData.get('role') as string;
    // Password update is handled separately for security/UX

    try {
        await prisma.user.update({
            where: { id },
            data: { name, email, role },
        });
        await logActivity('Update User', `Updated user ${email}`);
        revalidatePath('/users');
        redirect('/users');
    } catch (error) {
        console.error('Failed to update user:', error);
        throw new Error('Failed to update user.');
    }
}

export async function deleteUser(id: string) {
    try {
        // Prevent deleting the only admin or self if needed (logic can be added)
        // For now, basic delete
        await prisma.user.delete({ where: { id } });
        await logActivity('Delete User', `Deleted user ID ${id}`);
        revalidatePath('/users');
    } catch (error) {
        console.error('Failed to delete user:', error);
        throw new Error('Failed to delete user.');
    }
}

export async function updateUserPassword(id: string, formData: FormData) {
    const password = formData.get('password') as string;

    if (!password || password.length < 6) {
        throw new Error('Password must be at least 6 characters');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        await prisma.user.update({
            where: { id },
            data: { password: hashedPassword },
        });
        await logActivity('Change Password', `Changed password for user ID ${id}`);
        revalidatePath('/users');
        redirect('/users');
    } catch (error) {
        console.error('Failed to update password:', error);
        throw new Error('Failed to update password');
    }
}
