**Priya Shah** [Friday 4:18 PM]
Heads up everyone — I'm calling a deploy freeze starting Monday 9am PT through Tuesday EOD. Reason: the account billing migration finishes Sunday night and I want a clean window to verify before anyone ships anything else.

**Marcus Chen** [Friday 4:22 PM]
Does this include the staging deploys our QA team needs? They're testing the new export feature.

**Priya Shah**
Staging is fine. Freeze applies only to production. Hotfixes still allowed but must be PRed and approved by me or @Ravi before merging — no ship-then-tell.

**Ravi Patel** [Friday 4:31 PM]
+1, and a reminder — feature flags do count as "deploys" if you're toggling on something untested in prod. Don't flip flags on net-new features during the freeze. Risk-mitigation flips are fine.

**Priya Shah**
Yep good catch Ravi. Default rule for any prod change during the freeze: stop and ask first. We'd rather be slow Monday than firefighting Wednesday.

**Marcus Chen** [Friday 4:33 PM]
Got it. I'll let the team know in standup. When does the freeze lift exactly?

**Priya Shah**
Tuesday 5pm PT after the migration verification report lands. I'll post in this channel when it lifts. If you don't see a lift announcement, assume frozen.
