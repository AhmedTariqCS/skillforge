import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { ConnectorsClient } from "@/components/connectors-client";
import { Plug } from "lucide-react";

export const metadata = {
  title: "Connectors — Skillforge",
  description:
    "Try the Skillforge pipeline against real Slack exports or public GitHub repos.",
};

export default function ConnectorsPage() {
  return (
    <>
      <Header variant="app" />
      <main className="mx-auto max-w-6xl px-6 pt-12 pb-20 flex-1 w-full">
        <Badge
          variant="default"
          className="mb-3 inline-flex items-center gap-1.5"
        >
          <Plug className="size-3" /> connectors
        </Badge>
        <h1 className="text-3xl md:text-5xl font-semibold tracking-tight mb-3 leading-tight">
          Run the pipeline on real data.
        </h1>
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-12 max-w-3xl">
          Paste a Slack export or point at a public GitHub repo. We&apos;ll
          surface threads / issues that look like decisions, then run the
          full multi-stage pipeline against the ones you pick. No fake
          Northwind data this time. Real noise.
        </p>

        <ConnectorsClient />
      </main>
      <Footer />
    </>
  );
}
