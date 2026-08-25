import { NextRequest, NextResponse } from "next/server";
import { getDashboardData } from "@/lib/dashboard";
import { sendDigestEmail } from "@/lib/email";
import { STATUS_LABEL } from "@/lib/constants";
import { format } from "date-fns";

function renderDigestHtml({
  upcomingDeadlines,
  staleApplications,
}: Awaited<ReturnType<typeof getDashboardData>>) {
  const deadlineRows = upcomingDeadlines
    .map(
      (a) =>
        `<li><strong>${a.school}</strong> — ${a.program} (${STATUS_LABEL[a.status]}) due ${
          a.deadline ? format(a.deadline, "PPP") : ""
        }</li>`
    )
    .join("");

  const staleRows = staleApplications
    .map((a) => `<li><strong>${a.school}</strong> — ${a.program} (${STATUS_LABEL[a.status]})</li>`)
    .join("");

  return `
    <h2>Upcoming deadlines (next 30 days)</h2>
    <ul>${deadlineRows || "<li>None.</li>"}</ul>
    <h2>Stale applications (no activity in 30+ days)</h2>
    <ul>${staleRows || "<li>None.</li>"}</ul>
  `;
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const data = await getDashboardData();

  if (data.upcomingDeadlines.length === 0 && data.staleApplications.length === 0) {
    return NextResponse.json({ sent: false, reason: "nothing to report" });
  }

  await sendDigestEmail({
    subject: `Grad App Tracker: ${data.upcomingDeadlines.length} deadline(s), ${data.staleApplications.length} stale`,
    html: renderDigestHtml(data),
  });

  return NextResponse.json({ sent: true });
}
