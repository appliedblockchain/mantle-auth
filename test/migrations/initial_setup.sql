CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS person CASCADE;

CREATE TABLE "person" (
  "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "name" VARCHAR NOT NULL,
  "surname" VARCHAR NOT NULL,
  "email" VARCHAR UNIQUE NOT NULL,
  "phone" VARCHAR NOT NULL,
  "password" VARCHAR,
  "deleted_at" TIMESTAMP
);


