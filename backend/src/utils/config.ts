import { z } from 'zod';
import type { GameConfig } from '@white-game/shared';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  CORS_ORIGIN: z.string().default('*'),
  SESSION_SECRET: z.string().default('dev-secret-change-in-production'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
});

const env = envSchema.parse(process.env);

export const config = {
  env: env.NODE_ENV,
  port: env.PORT,
  cors: {
    origin: env.CORS_ORIGIN,
    credentials: true,
  },
  session: {
    secret: env.SESSION_SECRET,
  },
  logging: {
    level: env.LOG_LEVEL,
  },
};

export const gameConfig: GameConfig = {
  minPlayers: 3,
  maxPlayers: 10,
  turnDuration: 30, // seconds
  votingDuration: 60, // seconds
  defaultRounds: 5,
};