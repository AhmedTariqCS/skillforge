type FactType = "policy" | "procedure" | "decision" | "constraint" | "person" | "system";
interface Fact {
    type: FactType;
    topic: string;
    statement: string;
    confidence: number;
}
interface ExtractionResult {
    topic: string;
    facts: Fact[];
}
interface Skill {
    name: string;
    description: string;
    body: string;
    raw: string;
}
interface ForgeResult {
    topic: string;
    facts: Fact[];
    skill: Skill;
    usage: {
        inputTokens: number;
        outputTokens: number;
    };
}
interface ForgeOptions {
    apiKey?: string;
    hint?: string;
    extractModel?: string;
    synthesisModel?: string;
    onProgress?: (event: ProgressEvent) => void;
}
type ProgressEvent = {
    type: "stage";
    stage: "extracting" | "synthesizing" | "done";
} | {
    type: "fact";
    fact: Fact;
    index: number;
} | {
    type: "skill_delta";
    text: string;
};
declare function extractFacts(text: string, opts?: ForgeOptions): Promise<ExtractionResult & {
    inputTokens: number;
    outputTokens: number;
}>;
declare function synthesizeSkill(topic: string, facts: Fact[], source: string, opts?: ForgeOptions): Promise<Skill & {
    inputTokens: number;
    outputTokens: number;
}>;
declare function forge(text: string, opts?: ForgeOptions): Promise<ForgeResult>;
declare function formatSkillMarkdown(skill: Skill): string;
declare const VERSION = "0.1.0";

export { type ExtractionResult, type Fact, type FactType, type ForgeOptions, type ForgeResult, type ProgressEvent, type Skill, VERSION, extractFacts, forge, formatSkillMarkdown, synthesizeSkill };
