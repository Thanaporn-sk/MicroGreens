-- CreateEnum
CREATE TYPE "MaterialType" AS ENUM ('ASSET', 'MATERIAL', 'SEED', 'CROP', 'PACKAGING', 'EQUIPMENT', 'OTHERS');

-- CreateEnum
CREATE TYPE "MaterialFlow" AS ENUM ('BUY', 'SELL', 'BOTH', 'NONE');

-- AlterTable
ALTER TABLE "Material" ADD COLUMN     "buy_sale" "MaterialFlow" NOT NULL DEFAULT 'BUY',
ADD COLUMN     "type" "MaterialType" NOT NULL DEFAULT 'MATERIAL';

-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "rowsPerPage" INTEGER NOT NULL DEFAULT 25;
