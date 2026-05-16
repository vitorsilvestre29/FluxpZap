-- Fix triggerType default: 'all' causes bots to activate on every message
ALTER TABLE "TypebotFlow" ALTER COLUMN "triggerType" SET DEFAULT 'keyword';
