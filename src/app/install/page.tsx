import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Terminal, GitBranch, Package } from "lucide-react";
import { CodeBlock } from "@/components/code-block";

export const metadata = {
  title: "Install — Skillforge CLI",
  description:
    "Install the open-source Skillforge CLI. Compile any text into a Claude Agent Skill in seconds.",
};

export default function InstallPage() {
  return (
    <>
      <Header variant="app" />
      <main className="mx-auto max-w-4xl px-6 pt-12 pb-24 flex-1 w-full">
        <Badge
          variant="default"
          className="mb-3 inline-flex items-center gap-1.5"
        >
          <Terminal className="size-3" /> CLI
        </Badge>
        <h1 className="text-3xl md:text-5xl font-semibold tracking-tight mb-3 leading-tight">
          Install the compiler.
        </h1>
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-12 max-w-2xl">
          The Skillforge CLI is open-source (MIT). Run the same extraction
          pipeline you saw in the demo on any text — Slack thread, Notion
          page, post-mortem — directly from your terminal.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <Card
            icon={<Package className="size-5" />}
            title="Run instantly"
            detail="No install. Just run."
          >
            <CodeBlock
              language="bash"
              code={`npx @ahmedtariq/skillforge extract slack-thread.txt`}
            />
          </Card>
          <Card
            icon={<Terminal className="size-5" />}
            title="Install globally"
            detail="If you'll use it daily."
          >
            <CodeBlock
              language="bash"
              code={`npm install -g @ahmedtariq/skillforge
skillforge extract slack-thread.txt`}
            />
          </Card>
        </div>

        <Section title="Prerequisites">
          <p className="mb-3">
            You need an Anthropic API key. Get one at{" "}
            <a
              href="https://console.anthropic.com"
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              console.anthropic.com
            </a>
            . A typical extraction costs about <span className="font-mono">$0.12</span>.
          </p>
          <CodeBlock
            language="bash"
            code={`export ANTHROPIC_API_KEY=sk-ant-...`}
          />
        </Section>

        <Section title="Common workflows">
          <Subhead>Extract a single file → SKILL.md to stdout</Subhead>
          <CodeBlock
            language="bash"
            code={`skillforge extract path/to/notion-doc.md`}
          />

          <Subhead>Write directly to your Claude Code skills folder</Subhead>
          <CodeBlock
            language="bash"
            code={`skillforge extract slack-thread.txt -d ~/.claude/skills
# Creates ~/.claude/skills/<skill-name>/SKILL.md`}
          />

          <Subhead>Batch a directory</Subhead>
          <CodeBlock
            language="bash"
            code={`skillforge batch ./company-docs -o ./skills --ext .md,.txt`}
          />
          <p className="text-sm text-muted-foreground">
            Walks the input directory, extracts a skill from each file,
            writes them all to <span className="font-mono">./skills/&lt;name&gt;/SKILL.md</span>.
          </p>

          <Subhead>Pipe from stdin</Subhead>
          <CodeBlock
            language="bash"
            code={`pbpaste | skillforge extract -
# Or:
cat slack-export.txt | skillforge extract - --hint "A Slack thread"`}
          />

          <Subhead>Inspect before paying for it</Subhead>
          <CodeBlock
            language="bash"
            code={`skillforge describe my-doc.md
# ✦ Input report:
#   Chars:    1,820
#   Words:    312
#   Est cost: ~$0.13
#   Hint:     An incident post-mortem`}
          />
        </Section>

        <Section title="Programmatic API">
          <p>
            Same extraction pipeline, programmatic access:
          </p>
          <CodeBlock
            language="typescript"
            code={`import { forge } from "skillforge";

const result = await forge(text, {
  apiKey: process.env.ANTHROPIC_API_KEY,
  hint: "A Slack thread about pricing exceptions",
  onProgress: (event) => {
    if (event.type === "fact") {
      console.log(\`extracted: \${event.fact.statement}\`);
    }
  },
});

console.log(result.skill.name);
console.log(result.skill.body);`}
          />
        </Section>

        <Section title="What you get back">
          <p>
            A real <span className="font-mono">SKILL.md</span> in Claude&apos;s
            Agent Skills format — gerund-form name, third-person description,
            ≤500-line body, hard rules called out, examples included. Drop it
            into <span className="font-mono">~/.claude/skills/&lt;name&gt;/</span>{" "}
            and Claude Code uses it automatically. Or upload via the{" "}
            <a
              href="https://docs.claude.com/en/build-with-claude/skills-guide"
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              Skills API
            </a>{" "}
            (beta).
          </p>
          <p className="mt-3">
            See{" "}
            <Link
              href="/skills"
              className="text-primary hover:underline"
            >
              the skill library
            </Link>{" "}
            for examples of what real outputs look like, or{" "}
            <Link
              href="/research"
              className="text-primary hover:underline"
            >
              the extraction-quality benchmarks
            </Link>{" "}
            for how the compiler scores on a 4-axis rubric.
          </p>
        </Section>

        <div className="rounded-xl border border-primary/30 bg-primary/5 p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Hosted product</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto leading-relaxed">
            The CLI is the open-source compiler. The hosted Skillforge
            connects directly to Slack, Notion, Drive, GitHub, Intercom, and
            Linear; runs the compiler continuously across all your sources;
            tracks supersession and conflicts across versions; and provides
            review workflows for cross-functional ownership.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild>
              <Link href="/#waitlist">
                Get hosted access <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <a
                href="https://github.com/ahmedtariqcs/skillforge"
                target="_blank"
                rel="noreferrer"
              >
                <GitBranch className="size-4" /> View on GitHub
              </a>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-12">
      <h2 className="text-xl md:text-2xl font-semibold tracking-tight mb-4">
        {title}
      </h2>
      <div className="space-y-4 text-base text-foreground/90 leading-relaxed">
        {children}
      </div>
    </section>
  );
}

function Subhead({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm font-semibold text-foreground mt-6 mb-2">
      {children}
    </p>
  );
}

function Card({
  icon,
  title,
  detail,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  detail: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="size-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold leading-none">{title}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{detail}</p>
        </div>
      </div>
      {children}
    </div>
  );
}
