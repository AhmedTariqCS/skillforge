export type SourceType = "slack" | "notion" | "drive" | "github" | "intercom" | "linear" | "email";

export type DocumentKind =
  | "policy"
  | "runbook"
  | "decision"
  | "thread"
  | "ticket"
  | "post-mortem"
  | "spec"
  | "wiki";

export interface SourceDoc {
  id: string;
  source: SourceType;
  kind: DocumentKind;
  title: string;
  url: string;
  author: string;
  authorRole?: string;
  channel?: string; // for Slack
  createdAt: string; // ISO
  updatedAt: string; // ISO
  body: string; // markdown
  participants?: string[]; // for threads
  tags?: string[];
}

export type FactType =
  | "policy"
  | "procedure"
  | "decision"
  | "constraint"
  | "person"
  | "system"
  | "deprecated";

export interface ExtractedFact {
  id: string;
  type: FactType;
  statement: string; // 1-3 sentence canonical statement
  topic: string; // e.g. "refunds", "pricing-exceptions"
  evidence: Array<{
    docId: string;
    quote: string;
    confidence: number;
  }>;
  supersededBy?: string;
  conflictsWith?: string[];
  validFrom?: string;
  validUntil?: string;
}

export interface AgentSkill {
  name: string; // matches Claude Agent Skills naming: lowercase-hyphens, max 64 chars
  description: string; // max 1024 chars, third person, includes when to use
  topic: string;
  body: string; // markdown SKILL.md body
  factIds: string[]; // facts that built this skill
  resourceFiles?: Array<{
    path: string; // e.g. "reference/pricing-table.md"
    content: string;
  }>;
  lastUpdatedAt: string;
}

export interface DemoScenario {
  id: string;
  title: string;
  persona: string;
  prompt: string;
  relevantSkills: string[]; // skill names
  expectedFacts: string[]; // fact ids the brain should retrieve
}

export interface AgentRun {
  id: string;
  scenario: string;
  prompt: string;
  withBrain: {
    response: string;
    citedFacts: string[];
    skillsUsed: string[];
    latencyMs: number;
  };
  withoutBrain: {
    response: string;
    latencyMs: number;
  };
  createdAt: string;
}
