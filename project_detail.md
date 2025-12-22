# Microgreens App - Project Details

## Overview

The Microgreens App is a production management system designed for a microgreens business. It helps manage the entire lifecycle of microgreens production, from seed inventory to planting, harvesting, and sales. It is built as a modern web application using Next.js.

## Technology Stack

-   **Framework**: Next.js 16 (App Router)
-   **Language**: TypeScript
-   **Database**: PostgreSQL
-   **ORM**: Prisma
-   **Authentication**: NextAuth.js (v5 beta)
-   **Styling**: Tailwind CSS
-   **State Management**: TanStack Query (React Query)
-   **Validation**: Zod
-   **Icons**: Lucide React
-   **Deployment**: Vercel

## Key Features

1.  **Dashboard**: Central hub for monitoring business activities (located in `app/(dashboard)`).
2.  **Inventory Management**:
    -   Track raw materials (seeds, soil, trays).
    -   Manage stock levels and adjustments.
    -   Record purchases of materials.
3.  **Production Tracking**:
    -   **Planting Lots**: track specific batches of crops from planting to harvest.
    -   **Harvests**: Record yields (weight, tray count, bag count) linked to planting lots.
    -   Status tracking (Planted, Harvesting, Completed).
4.  **Sales & Customers**:
    -   Manage customer database.
    -   Record sales transactions.
5.  **User Management**:
    -   Role-based access control (ADMIN, STAFF, VIEWER).
6.  **Audit Logging**:
    -   Activity logs for tracking user actions.

## Detailed Functions (Server Actions)

The application implements the following core functions via server actions (located in `app/lib/actions.ts`):

### Authentication
-   `authenticate`: Sign in users using credentials.

### Inventory (Materials & Stock)
-   `createMaterial`: Define a new raw material with name and unit.
-   `updateMaterial`: Rename or update unit of a material.
-   `deleteMaterial`: Remove a material (checks for existing usage in Purchases/Harvests).
-   `adjustStock`: Manually increment or decrement stock with a reason (e.g., "Spillage", "Inventory Count").

### Purchases
-   `createPurchase`: Record a new purchase (auto-increments stock).
-   `updatePurchase`: Updates purchase details (auto-adjusts stock difference).
-   `deletePurchase`: Removes a purchase record (reverts/decrements stock).

### Production (Planting Lots)
-   `createPlantingLot`: Start a new production batch (Lot Code, Crop Type, Seed Usage, Trays).
-   `updatePlantingLot`: Update lot metadata and status.
-   `deletePlantingLot`: Remove a lot (only if no harvests exist).

### Harvests
-   `createHarvest`: Record harvest yield (Weight, Trays, Bags) for a lot.
    -   Auto-updates Lot Status to 'HARVESTING' or 'COMPLETED'.
    -   Auto-increments stock of the harvested product.
-   `deleteHarvest`: Remove a harvest record (reverts/decrements product stock).

### Sales
-   `createSale`: Record a sale to a customer.
    -   Checks for sufficient stock.
    -   Auto-decrements stock.
-   `updateSale`: Update sale details (auto-adjusts stock difference).
-   `deleteSale`: Remove a sale record (reverts/increments stock).

### Customers
-   `createCustomer`: Add a new client.
-   `updateCustomer`: Edit contact details.
-   `deleteCustomer`: Remove a client (only if no sales history).

### Data Access (History)
Located in `app/lib/history-actions.ts`:
-   `getItemHistory`: Aggregates a comprehensive history for a specific material (Purchases, Adjustments, Harvests, Sales).
-   `getProductSalesHistory`: Retrieves sales history for a specific product.
-   `getCustomerHistory`: Retrieves transaction history for a specific customer.

## Data Model (Prisma Schema)

The application uses the following key models:

-   `User`: System users with roles.
-   `Material`: Raw materials definition.
-   `Stock`: Current inventory levels.
-   `Purchase`: Material procurement records.
-   `PlantingLot`: Production batches.
-   `Harvest`: Harvest records linked to lots.
-   `Sale`: Sales records linked to customers.
-   `Customer`: Client information.
-   `StockAdjustment`: Manual inventory corrections.
-   `ActivityLog`: System audit trail.

## Application Structure

-   `app/`: Main application code (Next.js App Router).
    -   `(dashboard)/`: Protected application routes.
    -   `api/`: API routes (Auth).
    -   `auth/`: Authentication logic.
    -   `lib/`: Shared utilities & Server Actions.
-   `prisma/`: Database schema and seed scripts.
-   `scripts/`: Utility scripts.
    -   `deploy-prod.js`: Manual deployment helper for production DB migrations.
    -   `check-status.js`: Database connection and status monitoring.
    -   `set-dev-env.js`: Environment configuration helper.
