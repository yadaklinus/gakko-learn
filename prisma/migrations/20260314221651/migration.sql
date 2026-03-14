/*
  Warnings:

  - A unique constraint covering the columns `[studentId,tutorId]` on the table `Review` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_studentId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_bookingId_fkey";

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "isGroup" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "studentId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Review" ALTER COLUMN "bookingId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "_GroupBookings" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_GroupBookings_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_GroupBookings_B_index" ON "_GroupBookings"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Review_studentId_tutorId_key" ON "Review"("studentId", "tutorId");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupBookings" ADD CONSTRAINT "_GroupBookings_A_fkey" FOREIGN KEY ("A") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupBookings" ADD CONSTRAINT "_GroupBookings_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
