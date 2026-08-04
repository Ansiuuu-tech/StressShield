-- AlterTable
ALTER TABLE "MoodEntry"
  ADD COLUMN "sentimentScore" DOUBLE PRECISION,
  ADD COLUMN "emotionalIntensity" INTEGER,
  ADD COLUMN "predictedNextMood" TEXT,
  ADD COLUMN "trendDirection" TEXT,
  ADD COLUMN "burnoutProbability" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "AiFeedback" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "helpful" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AiFeedback_userId_messageId_key" ON "AiFeedback"("userId", "messageId");

-- CreateIndex
CREATE INDEX "AiFeedback_messageId_idx" ON "AiFeedback"("messageId");

-- AddForeignKey
ALTER TABLE "AiFeedback" ADD CONSTRAINT "AiFeedback_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "ChatMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

