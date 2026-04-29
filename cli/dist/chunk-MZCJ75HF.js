import f from"@anthropic-ai/sdk";var p=`You are Skillforge's fact extraction engine. You read raw company knowledge \u2014 Slack threads, Notion docs, post-mortems, policy documents, support tickets \u2014 and extract structured, executable facts that an AI agent could use to make correct decisions.

You output ONLY valid JSON, no prose, no markdown fences. The JSON must be parseable.

Rules:
1. Each fact is self-contained and quotable. An agent reading just this fact must understand what to do.
2. "constraint" type is for hard rules: "do not X", "never Y", "always Z". These are the most valuable facts because they encode learned-the-hard-way wisdom.
3. "decision" type is for resolved precedents: "we approved X for Y reason".
4. "policy" type is for stated rules in current force.
5. "procedure" type is for sequential steps to follow.
6. "person" type is for who-owns-what knowledge.
7. Skip facts that are generic to all companies. Focus on what's specific to THIS text.
8. Confidence reflects how clearly the source supports the fact (0.0\u20131.0).
9. Topic is a short slug ("refunds", "incident-response", "hiring", etc.).
10. Output between 3 and 10 facts. Quality over quantity.`;function u(e,t){return`${t?`Context hint: ${t}

`:""}TEXT:
"""
${e}
"""

Extract structured facts. Output JSON in EXACTLY this shape, with no prose before or after:

{
  "topic": "<overall topic slug>",
  "facts": [
    {
      "type": "policy" | "procedure" | "decision" | "constraint" | "person" | "system",
      "topic": "<topic slug>",
      "statement": "<1-2 sentences>",
      "confidence": <number 0-1>
    }
  ]
}`}var d=`You are Skillforge's skill compiler. You take structured facts and produce a SKILL.md file in Claude's Agent Skills format.

You follow Anthropic's published Agent Skills best practices:

1. **YAML frontmatter** with required fields:
   - name: lowercase-hyphens, max 64 chars, gerund form when natural ("handling-X", "approving-Y", "responding-to-Z")
   - description: max 1024 chars, written in THIRD PERSON, includes both what the skill does AND when to use it
   - No "anthropic" or "claude" in the name. No XML tags anywhere.

2. **Body** under 500 lines:
   - Concise \u2014 assume the agent is intelligent.
   - Use tables for matrices.
   - Hard rules called out with "Do NOT" / "Never" language.
   - Examples that are concrete and tied to the source facts.
   - No time-sensitive phrases ("currently", "as of today") \u2014 use "current" or version markers instead.
   - Use forward slashes in paths.
   - Consistent terminology.

3. **Tone:** confident, instructional, third person to the agent.

You output ONLY the SKILL.md content. Start with --- (the YAML frontmatter delimiter). No commentary. No markdown code fences around the whole output.`;function g(e,t,s){return`Topic: ${e}

Facts (extracted from a real source document):
${JSON.stringify(t,null,2)}

Original source (for reference quotes only \u2014 do not paste verbatim):
"""
${s.slice(0,4e3)}${s.length>4e3?`
...(truncated)`:""}
"""

Synthesize a SKILL.md for this topic. The skill should let an AI agent execute the implied workflow correctly without re-reading the source.`}var h="claude-haiku-4-5-20251001",y="claude-opus-4-7";function m(e){let t=e??process.env.ANTHROPIC_API_KEY;if(!t)throw new Error("ANTHROPIC_API_KEY is not set. Pass it via the --api-key flag, the ANTHROPIC_API_KEY environment variable, or the apiKey option.");return new f({apiKey:t})}async function k(e,t={}){let n=await m(t.apiKey).messages.create({model:t.extractModel??h,max_tokens:1500,system:p,messages:[{role:"user",content:u(e,t.hint)}]}),r=n.content.filter(a=>a.type==="text").map(a=>a.text).join("");return{...w(r),inputTokens:n.usage.input_tokens,outputTokens:n.usage.output_tokens}}function w(e){let t=e.trim();t=t.replace(/^```(?:json)?\s*/i,"").replace(/```\s*$/i,"");let s=t.indexOf("{"),n=t.lastIndexOf("}");if(s===-1||n===-1)throw new Error("Extraction response did not contain JSON.");t=t.slice(s,n+1);let r;try{r=JSON.parse(t)}catch(i){throw new Error(`Extraction returned malformed JSON: ${i.message}`)}return{topic:r.topic??"general",facts:r.facts??[]}}async function x(e,t,s,n={}){let i=m(n.apiKey).messages.stream({model:n.synthesisModel??y,max_tokens:2500,system:d,messages:[{role:"user",content:g(e,t,s)}]}),a="",c=0,l=0;for await(let o of i)o.type==="content_block_delta"&&o.delta.type==="text_delta"?(a+=o.delta.text,n.onProgress?.({type:"skill_delta",text:o.delta.text})):o.type==="message_start"?c=o.message.usage.input_tokens:o.type==="message_delta"&&o.usage&&(l=o.usage.output_tokens);return{...T(a),inputTokens:c,outputTokens:l}}function T(e){let t=e.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/),s={name:"untitled-skill",description:"Skill synthesis did not produce valid frontmatter.",body:e.trim(),raw:e.trim()};if(!t)return s;let n=t[1],r=t[2].trim(),i=n.match(/^name:\s*(.+?)\s*$/m),a=n.match(/description:\s*((?:.|\n  )+?)(?:\n[a-z_]+:|\n*$)/),c=(i?.[1]??"untitled-skill").trim().replace(/^["']|["']$/g,""),l=(a?.[1]??"Auto-generated skill.").trim().replace(/^["']|["']$/g,"").replace(/\n  /g," ");return{name:c,description:l,body:r,raw:e.trim()}}async function O(e,t={}){if(e.trim().length<80)throw new Error("Input is too short \u2014 paste at least a paragraph.");if(e.length>1e5)throw new Error("Input is too long \u2014 keep under 100,000 characters.");t.onProgress?.({type:"stage",stage:"extracting"});let s=await k(e,t);for(let r=0;r<s.facts.length;r++)t.onProgress?.({type:"fact",fact:s.facts[r],index:r});t.onProgress?.({type:"stage",stage:"synthesizing"});let n=await x(s.topic,s.facts,e,t);return t.onProgress?.({type:"stage",stage:"done"}),{topic:s.topic,facts:s.facts,skill:{name:n.name,description:n.description,body:n.body,raw:n.raw},usage:{inputTokens:s.inputTokens+n.inputTokens,outputTokens:s.outputTokens+n.outputTokens}}}function A(e){return`---
name: ${e.name}
description: ${e.description}
---

${e.body}
`}var N="0.1.0";export{k as a,x as b,O as c,A as d,N as e};
