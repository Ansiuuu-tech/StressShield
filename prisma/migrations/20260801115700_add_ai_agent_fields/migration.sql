-- AlterTable
ALTER TABLE "ChatMessage" ADD COLUMN     "detectedEmotion" TEXT,
ADD COLUMN     "stressLevel" INTEGER,
ADD COLUMN     "suggestedAction" TEXT;

-- AlterTable
ALTER TABLE "Journal" ADD COLUMN     "emotionalExhaustionLevel" TEXT,
ADD COLUMN     "permaPillar" TEXT;

-- AlterTable
ALTER TABLE "MoodEntry" ADD COLUMN     "aiDetectedMood" TEXT,
ADD COLUMN     "aiInsight" TEXT,
ADD COLUMN     "primaryTrigger" TEXT,
ADD COLUMN     "recommendedAction" TEXT;
