-- CreateTable
CREATE TABLE "rooms" (
    "code" VARCHAR(6) NOT NULL,
    "host_name" VARCHAR(30) NOT NULL,
    "players" JSONB NOT NULL DEFAULT '[]',
    "game_state" JSONB NOT NULL DEFAULT '{}',
    "status" VARCHAR(10) NOT NULL DEFAULT 'waiting',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("code")
);
