import type { SynthesizedSkill, ValidationIssue, ValidationResult } from "./types";

// Stage 6: spec validation against Anthropic's Agent Skills format.
// Authoritative source:
//   https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview
// We enforce every rule that's machine-checkable. Rules that require human
// judgment (e.g., "is this concise enough?") are flagged as warnings.

const NAME_REGEX = /^[a-z0-9-]+$/;
const NAME_MAX = 64;
const DESC_MAX = 1024;
const RESERVED_WORDS = ["anthropic", "claude"];

export function validate(skill: SynthesizedSkill): ValidationResult {
  const issues: ValidationIssue[] = [];

  // ---- name rules ----
  if (!skill.name || skill.name.length === 0) {
    issues.push({
      severity: "error",
      rule: "name.required",
      message: "Skill name is empty.",
    });
  } else {
    if (skill.name.length > NAME_MAX) {
      issues.push({
        severity: "error",
        rule: "name.length",
        message: `Skill name is ${skill.name.length} chars; max is ${NAME_MAX}.`,
      });
    }
    if (!NAME_REGEX.test(skill.name)) {
      issues.push({
        severity: "error",
        rule: "name.format",
        message:
          "Skill name must contain only lowercase letters, numbers, and hyphens.",
      });
    }
    for (const word of RESERVED_WORDS) {
      if (skill.name.toLowerCase().includes(word)) {
        issues.push({
          severity: "error",
          rule: "name.reserved",
          message: `Skill name cannot contain reserved word "${word}".`,
        });
      }
    }
    if (/<[^>]+>/.test(skill.name)) {
      issues.push({
        severity: "error",
        rule: "name.xml",
        message: "Skill name cannot contain XML tags.",
      });
    }
    // Soft: gerund form preferred
    if (
      !skill.name.startsWith("handling-") &&
      !skill.name.startsWith("approving-") &&
      !skill.name.startsWith("responding-") &&
      !skill.name.startsWith("running-") &&
      !skill.name.startsWith("processing-") &&
      !skill.name.startsWith("scoring-") &&
      !skill.name.startsWith("buying-") &&
      !skill.name.startsWith("writing-") &&
      !skill.name.startsWith("reviewing-") &&
      !skill.name.startsWith("managing-") &&
      !skill.name.endsWith("-ing")
    ) {
      issues.push({
        severity: "warning",
        rule: "name.gerund",
        message: "Anthropic recommends gerund-form names (e.g., handling-X, approving-Y).",
      });
    }
  }

  // ---- description rules ----
  if (!skill.description || skill.description.trim().length === 0) {
    issues.push({
      severity: "error",
      rule: "description.required",
      message: "Description is empty.",
    });
  } else {
    if (skill.description.length > DESC_MAX) {
      issues.push({
        severity: "error",
        rule: "description.length",
        message: `Description is ${skill.description.length} chars; max is ${DESC_MAX}.`,
      });
    }
    if (/<[^>]+>/.test(skill.description)) {
      issues.push({
        severity: "error",
        rule: "description.xml",
        message: "Description cannot contain XML tags.",
      });
    }
    // Third-person check (heuristic): flag first-person and second-person
    if (/\bI\b|\bmy\b|\bme\b|\bwe\b|\bour\b|\bus\b/i.test(skill.description)) {
      issues.push({
        severity: "warning",
        rule: "description.person",
        message:
          "Description should be in third person; first/second person detected.",
      });
    }
    // "When to use" check: should mention a trigger context
    if (
      !/\bwhen\b|\buse when\b|\bif\b|\bduring\b/i.test(skill.description)
    ) {
      issues.push({
        severity: "warning",
        rule: "description.when",
        message:
          "Description should describe BOTH what the skill does and when to use it.",
      });
    }
  }

  // ---- body rules ----
  const lines = skill.body.split("\n");
  if (lines.length > 500) {
    issues.push({
      severity: "warning",
      rule: "body.length",
      message: `Body is ${lines.length} lines; Anthropic recommends ≤500 for optimal performance.`,
    });
  }
  // Time-sensitive language
  const timeSensitive =
    /\b(currently|as of today|next week|tomorrow|yesterday|last week|this week|recently)\b/i;
  if (timeSensitive.test(skill.body)) {
    issues.push({
      severity: "warning",
      rule: "body.time-sensitive",
      message:
        "Body contains time-sensitive phrasing; will become outdated. Use 'current' or version markers instead.",
    });
  }
  // Windows-style paths
  if (/\\\\[A-Za-z]/.test(skill.body)) {
    issues.push({
      severity: "warning",
      rule: "body.path-style",
      message: "Body contains Windows-style paths; use forward slashes.",
    });
  }
  // XML in body
  if (/<\/?(?:tool_use|tool_result|invoke|parameter)[> ]/.test(skill.body)) {
    issues.push({
      severity: "error",
      rule: "body.xml-tool-tags",
      message: "Body contains tool-use XML tags that Claude will misinterpret.",
    });
  }

  return {
    valid: issues.every((i) => i.severity !== "error"),
    issues,
  };
}

// Pretty-print a validation result for CLI / log output.
export function formatValidation(v: ValidationResult): string {
  if (v.issues.length === 0) {
    return "✓ All checks passed.";
  }
  const lines = v.issues.map((i) => {
    const symbol =
      i.severity === "error" ? "✖" : i.severity === "warning" ? "⚠" : "•";
    return `${symbol} [${i.rule}] ${i.message}`;
  });
  return lines.join("\n");
}
