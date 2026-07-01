import express, { Express, Router, RequestHandler } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { env } from './config/env.config';
import { logger } from './config/logger.config';
import { globalExceptionFilter } from './common/filters/global-exception.filter';
import { DemografiaRepository } from './modules/demografia/repositories/demografia.repository';
import { DemografiaService } from './modules/demografia/services/demografia.service';
import { DemografiaController } from './modules/demografia/controllers/demografia.controller';

const app: Express = express();

// ── Global middlewares ────────────────────────────────────────────────────────

// Restrict CORS to CORS_ORIGIN (comma-separated) when set; otherwise allow any.
const corsOrigin = env.CORS_ORIGIN
  ? env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : '*';
app.use(cors({ origin: corsOrigin }));
app.use(express.json({ limit: '1mb' }));

// Protects the ingestion endpoint. Active only when INGEST_API_KEY is set;
// otherwise the endpoint stays open (a startup warning is logged).
const requireApiKey: RequestHandler = (req, res, next) => {
  if (!env.INGEST_API_KEY) return next();
  if (req.header('x-api-key') === env.INGEST_API_KEY) return next();
  res.status(401).json({ success: false, message: 'Unauthorized' });
};

// HTTP request logger
app.use((req, _res, next) => {
  logger.http(`${req.method} ${req.originalUrl}`);
  next();
});

// ── Dependency injection (Prisma 7 driver-adapter wiring) ────────────────────

const dbUrl = new URL(env.DATABASE_URL);

const adapter = new PrismaMariaDb({
  host: dbUrl.hostname,
  port: Number(dbUrl.port) || 3306,
  user: dbUrl.username,
  password: decodeURIComponent(dbUrl.password),
  database: dbUrl.pathname.substring(1),
  connectionLimit: 5,
});

const prisma = new PrismaClient({ adapter });
const demografiaRepository = new DemografiaRepository(prisma);
const demografiaService = new DemografiaService(demografiaRepository);
const demografiaController = new DemografiaController(demografiaService);

// ── Routes ───────────────────────────────────────────────────────────────────

const demografiaRouter = Router();

// n8n pipeline pushes cleaned data here
demografiaRouter.post('/', requireApiKey, demografiaController.receiveFromN8n);

// Next.js frontend reads the latest snapshot here
demografiaRouter.get('/latest', demografiaController.getLatest);

app.use('/api/demografia', demografiaRouter);
// Alias used by the n8n pipeline node ("Entregar payload (HTTP POST)")
app.use('/api/mapa-demografico', demografiaRouter);

// Health probe for container orchestrators / uptime monitors
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// ── Global exception filter (must be last) ────────────────────────────────────
app.use(globalExceptionFilter);

export { app, prisma };
