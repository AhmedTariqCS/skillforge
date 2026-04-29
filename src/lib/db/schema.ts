import {
  pgTable,
  text,
  timestamp,
  jsonb,
  integer,
  uuid,
  index,
  vector,
} from "drizzle-orm/pg-core";

export const sources = pgTable("sources", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: text("type").notNull(), // slack, notion, drive, github, etc.
  name: text("name").notNull(),
  config: jsonb("config").default({}),
  status: text("status").notNull().default("active"),
  documentCount: integer("document_count").notNull().default(0),
  lastSyncedAt: timestamp("last_synced_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const documents = pgTable(
  "documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sourceId: uuid("source_id")
      .notNull()
      .references(() => sources.id, { onDelete: "cascade" }),
    externalId: text("external_id").notNull(),
    kind: text("kind").notNull(),
    title: text("title").notNull(),
    url: text("url").notNull(),
    author: text("author").notNull(),
    authorRole: text("author_role"),
    channel: text("channel"),
    body: text("body").notNull(),
    metadata: jsonb("metadata").default({}),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
    ingestedAt: timestamp("ingested_at").notNull().defaultNow(),
  },
  (t) => [
    index("documents_source_idx").on(t.sourceId),
    index("documents_kind_idx").on(t.kind),
  ]
);

export const facts = pgTable(
  "facts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    type: text("type").notNull(),
    topic: text("topic").notNull(),
    statement: text("statement").notNull(),
    evidence: jsonb("evidence").notNull().$type<
      Array<{ docId: string; quote: string; confidence: number }>
    >(),
    embedding: vector("embedding", { dimensions: 1536 }),
    supersededBy: uuid("superseded_by"),
    conflictsWith: jsonb("conflicts_with").$type<string[]>(),
    validFrom: timestamp("valid_from"),
    validUntil: timestamp("valid_until"),
    confidence: integer("confidence").notNull().default(80),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("facts_topic_idx").on(t.topic),
    index("facts_type_idx").on(t.type),
    index("facts_embedding_idx").using("hnsw", t.embedding.op("vector_cosine_ops")),
  ]
);

export const skills = pgTable("skills", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  topic: text("topic").notNull(),
  body: text("body").notNull(),
  resourceFiles: jsonb("resource_files").$type<
    Array<{ path: string; content: string }>
  >(),
  factIds: jsonb("fact_ids").notNull().$type<string[]>(),
  version: integer("version").notNull().default(1),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const agentRuns = pgTable("agent_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  scenario: text("scenario"),
  prompt: text("prompt").notNull(),
  withBrainResponse: text("with_brain_response"),
  withoutBrainResponse: text("without_brain_response"),
  citedFactIds: jsonb("cited_fact_ids").$type<string[]>(),
  skillsUsed: jsonb("skills_used").$type<string[]>(),
  latencyMs: integer("latency_ms"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const waitlist = pgTable("waitlist", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  company: text("company"),
  role: text("role"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const activityEvents = pgTable(
  "activity_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventType: text("event_type").notNull(),
    metadata: jsonb("metadata").default({}),
    occurredAt: timestamp("occurred_at").notNull().defaultNow(),
  },
  (t) => [
    index("activity_events_type_idx").on(t.eventType),
    index("activity_events_at_idx").on(t.occurredAt),
  ]
);
