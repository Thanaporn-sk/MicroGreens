'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { logActivity } from './activity';
import { getSupabaseClient } from '@/app/lib/supabase';

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn('credentials', formData);
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                default:
                    return 'Something went wrong.';
            }
        }
        throw error;
    }
}


export type State = {
    errors?: {
        name?: string[];
        unit?: string[];
    };
    message?: string | null;
};

export async function createMaterial(prevState: State, formData: FormData) {
    const name = formData.get('name') as string;
    const unit = formData.get('unit') as string;
    const description = formData.get('description') as string;
    const images = formData.getAll('images') as File[];

    if (!name || !unit) {
        return {
            message: 'Name and Unit are required',
        };
    }

    const existing = await prisma.material.findFirst({
        where: { name: { equals: name, mode: 'insensitive' } }
    });

    if (existing) {
        return {
            message: 'Material name already exists.',
        };
    }

    // Handle Image Uploads
    const imageUrls: string[] = [];
    if (images && images.length > 0) {
        try {
            for (const file of images) {
                if (file.size > 0 && file.name !== 'undefined') {
                    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
                    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '');
                    const filename = `${uniqueSuffix}-${cleanFileName}`;

                    const buffer = await file.arrayBuffer();
                    const { error: uploadError } = await getSupabaseClient().storage
                        .from('imageStorage')
                        .upload(filename, buffer, {
                            contentType: file.type,
                            upsert: false
                        });

                    if (uploadError) {
                        console.error('Supabase upload error:', uploadError);
                        continue;
                    }

                    const { data: { publicUrl } } = getSupabaseClient().storage
                        .from('imageStorage')
                        .getPublicUrl(filename);

                    imageUrls.push(publicUrl);
                }
            }
        } catch (e) {
            console.error('Error saving uploaded images during creation', e);
        }
    }

    await prisma.material.create({
        data: {
            name,
            unit,
            // @ts-ignore
            description,
            stock: {
                create: {
                    quantity: 0,
                }
            },
            images: {
                create: imageUrls.map(url => ({ url }))
            }
        },
    });

    revalidatePath('/inventory');
    redirect('/inventory');
}

export async function createPurchase(formData: FormData) {
    const materialId = parseInt(formData.get('materialId') as string);
    const quantity = parseFloat(formData.get('quantity') as string);
    const cost = parseFloat(formData.get('cost') as string);
    const dateStr = formData.get('date') as string;
    const date = new Date(dateStr);

    if (!materialId || isNaN(quantity) || isNaN(cost)) {
        throw new Error('Invalid input');
    }

    await prisma.$transaction([
        prisma.purchase.create({
            data: {
                materialId,
                quantity,
                cost,
                date,
            }
        }),
        prisma.stock.update({
            where: { materialId },
            data: { quantity: { increment: quantity } }
        })
    ]);

    await logActivity('Create Purchase', `Purchased ${quantity} of Material ID ${materialId} for ${cost}`);

    revalidatePath('/purchases');
    revalidatePath('/inventory');
    redirect('/purchases');
}

export async function createPlantingLot(formData: FormData) {
    const lotCode = formData.get('lotCode') as string;
    const cropType = formData.get('cropType') as string;
    const seedMaterialId = parseInt(formData.get('seedMaterialId') as string);
    const seedAmount = parseFloat(formData.get('seedAmount') as string);
    const trayCount = parseInt(formData.get('trayCount') as string);
    const plantingDate = new Date(formData.get('plantingDate') as string);
    const expectedHarvestDateStr = formData.get('expectedHarvestDate') as string;
    const expectedHarvestDate = expectedHarvestDateStr ? new Date(expectedHarvestDateStr) : null;
    const notes = formData.get('notes') as string;

    if (!lotCode || !cropType || isNaN(seedAmount)) {
        throw new Error('Missing required fields');
    }

    await prisma.plantingLot.create({
        data: {
            lotCode,
            cropType,
            seedUsed: seedAmount,
            trayCount,
            plantingDate,
            expectedHarvestDate,
            notes,
        }
    });

    await logActivity('Start Planting', `Started Lot ${lotCode} (${cropType}) - Note: Stock deduction manual`);

    revalidatePath('/lots');
    revalidatePath('/inventory');
    redirect('/lots');
}

export async function createHarvest(formData: FormData) {
    const lotId = parseInt(formData.get('lotId') as string);
    const productMaterialId = parseInt(formData.get('productMaterialId') as string);
    const weight = parseFloat(formData.get('weight') as string);
    const bagCount = parseInt(formData.get('bagCount') as string);
    const trayCount = parseInt(formData.get('trayCount') as string) || 0;
    const harvestDate = new Date(formData.get('harvestDate') as string);

    // Fetch Lot to check total trays
    const lot = await prisma.plantingLot.findUnique({
        where: { id: lotId },
        include: { harvests: true }
    });

    if (!lot) throw new Error("Lot not found");

    // Calculate new total harvested trays
    const previousHarvestedTrays = lot.harvests.reduce((sum, h) => sum + (h.trayCount || 0), 0);
    const totalHarvestedTrays = previousHarvestedTrays + trayCount;

    // Determine Status
    // If total harvested >= lot.trayCount, then COMPLETED.
    // Else if harvested > 0, then HARVESTING.
    let newStatus = 'HARVESTING';
    if (totalHarvestedTrays >= lot.trayCount) {
        newStatus = 'COMPLETED';
    }

    await prisma.$transaction([
        prisma.harvest.create({
            data: {
                lotId,
                weight,
                bagCount,
                trayCount,
                harvestDate,
                materialId: productMaterialId,
            }
        }),
        prisma.plantingLot.update({
            where: { id: lotId },
            data: { status: newStatus }
        }),
        prisma.stock.update({
            where: { materialId: productMaterialId },
            data: { quantity: { increment: weight } }
        })
    ]);

    await logActivity('Harvest', `Harvested Lot ID ${lotId}: ${weight}g (${trayCount} trays) - Status: ${newStatus}`);

    revalidatePath(`/lots`);
    revalidatePath('/inventory');
    redirect('/lots');
}

export async function createCustomer(formData: FormData) {
    const name = formData.get('name') as string;
    const contact = formData.get('contact') as string;
    const address = formData.get('address') as string;

    if (!name) {
        throw new Error('Name is required');
    }

    await prisma.customer.create({
        data: {
            name,
            contact,
            address,
        },
    });

    await logActivity('Create Customer', `Added customer ${name}`);

    revalidatePath('/customers');
    revalidatePath('/sales/new');
    redirect('/customers');
}

export async function createSale(prevState: State | any, formData: FormData) {
    const customerId = parseInt(formData.get('customerId') as string);
    const materialId = parseInt(formData.get('materialId') as string);
    const weight = parseFloat(formData.get('weight') as string);
    const price = parseFloat(formData.get('price') as string);
    const saleDate = new Date(formData.get('saleDate') as string);

    if (!customerId || !materialId || isNaN(weight) || isNaN(price)) {
        return { message: 'Missing required fields' };
    }

    const material = await prisma.material.findUnique({
        where: { id: materialId },
        include: { stock: true }
    });

    if (!material) {
        return { message: "Material not found" };
    }

    if (!material.stock || material.stock.quantity < weight) {
        return {
            message: `Insufficient stock. Available: ${material.stock?.quantity ?? 0} ${material.unit}, Requested: ${weight} ${material.unit}`
        };
    }

    await prisma.$transaction([
        prisma.sale.create({
            data: {
                customerId,
                productName: material.name,
                weight,
                price,
                saleDate,
            }
        }),
        prisma.stock.update({
            where: { materialId },
            data: { quantity: { decrement: weight } }
        })
    ]);

    await logActivity('New Sale', `Sold ${weight}g of ${material.name} for ${price}`);

    revalidatePath('/sales');
    revalidatePath('/inventory');
    revalidatePath('/customers');
    redirect('/sales');
}

// --- Materials CRUD ---

export async function deleteMaterial(id: number) {
    console.log(`[ACTION] deleteMaterial called for ID: ${id}`);
    try {
        const inUse = await prisma.material.findUnique({
            where: { id },
            include: {
                purchases: { select: { id: true }, take: 1 },
                harvests: { select: { id: true }, take: 1 },
                adjustments: { select: { id: true }, take: 1 },
            }
        });

        if (inUse?.purchases.length && inUse.purchases.length > 0) {
            console.error(`[ACTION] Delete blocked: Used in Purchases`);
            throw new Error("Cannot delete material with existing purchases.");
        }
        if (inUse?.harvests.length && inUse.harvests.length > 0) {
            console.error(`[ACTION] Delete blocked: Used in Harvests`);
            throw new Error("Cannot delete material with existing harvests.");
        }
        // Allow deleting adjustments (cascade)

        console.log(`[ACTION] Proceeding to delete material ID: ${id}`);
        await prisma.$transaction([
            prisma.stockAdjustment.deleteMany({ where: { materialId: id } }),
            prisma.stock.delete({ where: { materialId: id } }),
            prisma.material.delete({ where: { id } })
        ]);
        console.log(`[ACTION] Successfully deleted material ID: ${id}`);

        revalidatePath('/inventory');
    } catch (err) {
        console.error("Failed to delete material:", err);
        throw new Error("Failed to delete material: " + (err as Error).message);
    }
}

export async function updateMaterial(id: number, formData: FormData) {
    const name = formData.get('name') as string;
    const unit = formData.get('unit') as string;
    const description = formData.get('description') as string;
    const images = formData.getAll('images') as File[];
    const deletedImageIdsStr = formData.get('deletedImageIds') as string;

    const existing = await prisma.material.findFirst({
        where: {
            name: { equals: name, mode: 'insensitive' },
            NOT: { id }
        }
    });

    if (existing) {
        throw new Error('Material name already exists.');
    }

    // Handle Image Uploads
    const imageUrls: string[] = [];
    if (images && images.length > 0) {
        try {
            for (const file of images) {
                if (file.size > 0) {
                    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
                    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '');
                    const filename = `${uniqueSuffix}-${cleanFileName}`;

                    const buffer = await file.arrayBuffer();
                    const { error: uploadError } = await getSupabaseClient().storage
                        .from('imageStorage')
                        .upload(filename, buffer, {
                            contentType: file.type,
                            upsert: false
                        });

                    if (uploadError) {
                        console.error('Supabase upload error:', uploadError);
                        continue;
                    }

                    const { data: { publicUrl } } = getSupabaseClient().storage
                        .from('imageStorage')
                        .getPublicUrl(filename);

                    imageUrls.push(publicUrl);
                }
            }
        } catch (e) {
            console.error('Error saving uploaded images during update', e);
        }
    }

    // Handle Image Deletion
    if (deletedImageIdsStr) {
        try {
            const idsToDelete = JSON.parse(deletedImageIdsStr) as number[];
            if (idsToDelete.length > 0) {
                await prisma.materialImage.deleteMany({
                    where: {
                        id: { in: idsToDelete },
                        materialId: id // Ensure we only delete images belonging to this material
                    }
                });
            }
        } catch (e) {
            console.error("Failed to parse deletedImageIds or delete images", e);
        }
    }

    await prisma.material.update({
        where: { id },
        data: {
            name,
            unit,
            description,
            images: {
                create: imageUrls.map(url => ({ url }))
            }
        }
    });

    revalidatePath('/inventory');
    redirect('/inventory');
}

// --- Customers CRUD ---

export async function adjustStock(materialId: number, adjustment: number, reason: string) {
    if (isNaN(adjustment) || adjustment === 0) {
        throw new Error("Invalid adjustment amount");
    }

    try {
        const stock = await prisma.stock.findUnique({ where: { materialId } });
        if (!stock) throw new Error("Stock record not found for this material");

        await prisma.$transaction([
            prisma.stock.update({
                where: { materialId },
                data: { quantity: { increment: adjustment } }
            }),
            prisma.stockAdjustment.create({
                data: {
                    materialId,
                    quantity: adjustment,
                    reason
                }
            })
        ]);

        const material = await prisma.material.findUnique({ where: { id: materialId } });
        const actionType = adjustment > 0 ? "Manual Add" : "Manual Deduct";
        await logActivity(actionType, `Adjusted ${material?.name}: ${adjustment > 0 ? '+' : ''}${adjustment} ${material?.unit} (${reason})`);

        revalidatePath('/inventory');
    } catch (error) {
        console.error("Failed to adjust stock:", error);
        throw new Error("Failed to adjust stock");
    }
}

export async function deleteCustomer(id: number) {
    try {
        const count = await prisma.sale.count({ where: { customerId: id } });
        if (count > 0) {
            throw new Error("Cannot delete customer with existing sales history.");
        }

        await prisma.customer.delete({ where: { id } });
        revalidatePath('/customers');
    } catch (err) {
        console.error(err);
        throw new Error("Failed to delete customer");
    }
}

export async function updateCustomer(id: number, formData: FormData) {
    const name = formData.get('name') as string;
    const contact = formData.get('contact') as string;
    const address = formData.get('address') as string;

    await prisma.customer.update({
        where: { id },
        data: { name, contact, address }
    });

    revalidatePath('/customers');
    redirect('/customers');
}

// --- Purchases CRUD ---

export async function deletePurchase(id: number) {
    try {
        const purchase = await prisma.purchase.findUnique({ where: { id } });
        if (!purchase) throw new Error("Purchase not found");

        await prisma.$transaction([
            prisma.stock.update({
                where: { materialId: purchase.materialId },
                data: { quantity: { decrement: purchase.quantity } } // Revert: remove added stock
            }),
            prisma.purchase.delete({ where: { id } })
        ]);

        revalidatePath('/purchases');
        revalidatePath('/inventory');
    } catch (err) {
        console.error(err);
        throw new Error("Failed to delete purchase");
    }
}

export async function updatePurchase(id: number, formData: FormData) {
    const quantity = parseFloat(formData.get('quantity') as string);
    const cost = parseFloat(formData.get('cost') as string);
    const dateStr = formData.get('date') as string;
    const date = new Date(dateStr);

    const oldPurchase = await prisma.purchase.findUnique({ where: { id } });
    if (!oldPurchase) throw new Error("Purchase not found");

    const quantityDiff = quantity - oldPurchase.quantity;

    await prisma.$transaction([
        prisma.purchase.update({
            where: { id },
            data: { quantity, cost, date }
        }),
        prisma.stock.update({
            where: { materialId: oldPurchase.materialId },
            data: { quantity: { increment: quantityDiff } }
        })
    ]);

    revalidatePath('/purchases');
    revalidatePath('/inventory');
    redirect('/purchases');
}

// --- Sales CRUD ---

export async function deleteSale(id: number) {
    try {
        const sale = await prisma.sale.findUnique({ where: { id } });
        if (!sale) throw new Error("Sale not found");

        // Attempt re-stock if we can match material name
        const maxMatchMaterial = await prisma.material.findFirst({ where: { name: sale.productName } });

        if (maxMatchMaterial) {
            await prisma.$transaction([
                prisma.stock.update({
                    where: { materialId: maxMatchMaterial.id },
                    data: { quantity: { increment: sale.weight } } // Revert: add back sold stock
                }),
                prisma.sale.delete({ where: { id } })
            ]);
        } else {
            await prisma.sale.delete({ where: { id } });
        }

        revalidatePath('/sales');
        revalidatePath('/inventory');
        revalidatePath('/customers');
    } catch (err) {
        console.error(err);
        throw new Error("Failed to delete sale");
    }
}

export async function updateSale(id: number, formData: FormData) {
    const weight = parseFloat(formData.get('weight') as string);
    const price = parseFloat(formData.get('price') as string);
    const saleDate = new Date(formData.get('saleDate') as string);

    const oldSale = await prisma.sale.findUnique({ where: { id } });
    if (!oldSale) throw new Error("Sale not found");

    const weightDiff = weight - oldSale.weight;

    const maxMatchMaterial = await prisma.material.findFirst({ where: { name: oldSale.productName } });

    if (maxMatchMaterial) {
        await prisma.$transaction([
            prisma.sale.update({
                where: { id },
                data: { weight, price, saleDate }
            }),
            prisma.stock.update({
                where: { materialId: maxMatchMaterial.id },
                data: { quantity: { decrement: weightDiff } }
            })
        ]);
    } else {
        await prisma.sale.update({
            where: { id },
            data: { weight, price, saleDate }
        });
    }

    revalidatePath('/sales');
    revalidatePath('/inventory');
    revalidatePath('/customers');
    redirect('/sales');
}

// --- Operations CRUD (Lots/Harvests) ---

export async function deletePlantingLot(id: number) {
    const hasHarvests = await prisma.harvest.count({ where: { lotId: id } });
    if (hasHarvests > 0) {
        throw new Error("Cannot delete planting lot with existing harvests. Delete harvests first.");
    }

    // Note: Does not revert seed stock as seedMaterialId is not stored in PlantingLot
    await prisma.plantingLot.delete({ where: { id } });
    revalidatePath('/lots');
}

export async function updatePlantingLot(id: number, formData: FormData) {
    const lotCode = formData.get('lotCode') as string;
    const cropType = formData.get('cropType') as string;
    // We do NOT update seedMaterialId or seedUsed or trayCount easily because of stock implications.
    // For now, we allow updating the basic info. 
    // If they want to update trayCount, we assume it's a correction and valid, but we log it.

    // const seedMaterialId = parseInt(formData.get('seedMaterialId') as string); // Not allowing change of seed material to avoid complex stock revert logic for now.
    // const seedAmount = parseFloat(formData.get('seedAmount') as string); // Same for usage.

    const trayCount = parseInt(formData.get('trayCount') as string);
    const plantingDate = new Date(formData.get('plantingDate') as string);
    const expectedHarvestDateStr = formData.get('expectedHarvestDate') as string;
    const expectedHarvestDate = expectedHarvestDateStr ? new Date(expectedHarvestDateStr) : null;
    const notes = formData.get('notes') as string;

    const status = formData.get('status') as string;

    if (!lotCode || !cropType) {
        throw new Error('Missing required fields');
    }

    const seedUsed = parseFloat(formData.get('seedUsed') as string) || 0;
    const mediumUsed = formData.get('mediumUsed') as string || '';

    const oldLot = await prisma.plantingLot.findUnique({ where: { id } });
    if (!oldLot) throw new Error("Lot not found");

    await prisma.plantingLot.update({
        where: { id },
        data: {
            lotCode,
            cropType,
            seedUsed,
            trayCount,
            mediumUsed,
            notes,
            expectedHarvestDate: expectedHarvestDate ? new Date(expectedHarvestDate) : null,
            plantingDate: plantingDate ? new Date(plantingDate) : undefined,
            status,
        },
    });

    await logActivity('Update Lot', `Updated Lot ${lotCode} (ID: ${id})`);

    revalidatePath('/lots');
    revalidatePath(`/lots/${id}`);
    redirect('/lots');
}

export async function addLotEvent(lotId: number, formData: FormData) {
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const dateStr = formData.get('date') as string;
    const date = dateStr ? new Date(dateStr) : new Date();

    if (!title) throw new Error("Title is required");

    await prisma.lotEvent.create({
        data: {
            lotId,
            title,
            description,
            date
        }
    });

    revalidatePath(`/lots/${lotId}`);
}

export async function addLotImage(lotId: number, formData: FormData) {
    const image = formData.get('image') as File;
    const caption = formData.get('caption') as string;
    const eventIdStr = formData.get('eventId') as string;
    const eventId = eventIdStr ? parseInt(eventIdStr) : null;

    if (!image || image.size === 0) throw new Error("Image is required");

    try {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const cleanFileName = image.name.replace(/[^a-zA-Z0-9.-]/g, '');
        const filename = `${uniqueSuffix}-${cleanFileName}`;

        const buffer = await image.arrayBuffer();
        const { error: uploadError } = await getSupabaseClient().storage
            .from('imageStorage')
            .upload(filename, buffer, {
                contentType: image.type,
                upsert: false
            });

        if (uploadError) {
            console.error('Supabase upload error:', uploadError);
            throw new Error('Upload to Supabase failed');
        }

        const { data: { publicUrl: url } } = getSupabaseClient().storage
            .from('imageStorage')
            .getPublicUrl(filename);

        await prisma.lotImage.create({
            data: {
                lotId,
                eventId,
                url,
                caption
            }
        });
    } catch (e) {
        console.error('Error saving uploaded image', e);
        throw new Error('Failed to save image');
    }

    revalidatePath(`/lots/${lotId}`);
}

export async function editHarvest(id: number, formData: FormData) {
    const productMaterialId = parseInt(formData.get('productMaterialId') as string);
    const weight = parseFloat(formData.get('weight') as string);
    const trayCount = parseInt(formData.get('trayCount') as string);
    const bagCount = formData.get('bagCount') ? parseInt(formData.get('bagCount') as string) : 0;
    const harvestDate = new Date(formData.get('harvestDate') as string);

    const oldHarvest = await prisma.harvest.findUnique({ where: { id } });
    if (!oldHarvest) throw new Error("Harvest not found");

    await prisma.$transaction(async (tx) => {
        // 1. Revert old stock change if material existed
        if (oldHarvest.materialId) {
            await tx.stock.update({
                where: { materialId: oldHarvest.materialId },
                data: { quantity: { decrement: oldHarvest.weight } }
            });
        }

        // 2. Update Harvest
        await tx.harvest.update({
            where: { id },
            data: {
                materialId: productMaterialId,
                weight,
                trayCount,
                bagCount,
                harvestDate
            }
        });

        // 3. Apply new stock change
        await tx.stock.upsert({
            where: { materialId: productMaterialId },
            update: { quantity: { increment: weight } },
            create: { materialId: productMaterialId, quantity: weight }
        });
    });

    revalidatePath('/lots');
    revalidatePath('/inventory');
    redirect(`/lots/${oldHarvest.lotId}`);
}

export async function deleteHarvest(id: number) {
    const harvest = await prisma.harvest.findUnique({ where: { id } });
    if (!harvest) throw new Error("Harvest not found");

    await prisma.$transaction(async (tx) => {
        if (harvest.materialId) {
            await tx.stock.update({
                where: { materialId: harvest.materialId },
                data: { quantity: { decrement: harvest.weight } } // Revert: remove added stock
            });
        }
        await tx.harvest.delete({ where: { id } });

        // Check if there are any remaining harvests for this lot
        const remainingHarvests = await tx.harvest.count({ where: { lotId: harvest.lotId } });
        if (remainingHarvests === 0) {
            await tx.plantingLot.update({
                where: { id: harvest.lotId },
                data: { status: 'PLANTED' } // Revert status to PLANTED (Growing)
            });
        }
    });

    revalidatePath('/lots');
    revalidatePath('/inventory');
}
