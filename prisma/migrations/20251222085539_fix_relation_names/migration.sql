-- AlterTable
ALTER TABLE "LotImage" ADD COLUMN     "eventId" INTEGER;

-- AddForeignKey
ALTER TABLE "LotImage" ADD CONSTRAINT "LotImage_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "LotEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
