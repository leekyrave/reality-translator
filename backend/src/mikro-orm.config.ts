import 'dotenv/config';
import { defineConfig } from '@mikro-orm/postgresql';

export default defineConfig({
  entities: ['./dist/libs/orm/entities'],
  entitiesTs: ['./src/libs/orm/entities'],
  dbName: process.env.POSTGRES_DB,
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  migrations: {
    path: './dist/libs/orm/migrations',
    pathTs: './src/libs/orm/migrations',
  },
});
