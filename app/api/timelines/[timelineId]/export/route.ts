import { exportTimelinePdf } from "../../../../dashboard/timeline/_actions/exportTimelinePdf";
import { getServerClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// pdf-lib plus one photo per event: a long timeline can take a while on a cold function.
export const maxDuration = 60;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ timelineId: string }> }
) {
  try {
    const { timelineId } = await params;

    if (!timelineId || !UUID_RE.test(timelineId)) {
      return new Response("Missing timeline id", { status: 400 });
    }

    // The PDF is built with the caller's own session, so RLS decides which timeline they may
    // read. Say so plainly when nobody is signed in instead of a "not found" 500.
    const supabase = await getServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response("Please sign in to export this timeline", { status: 401 });
    }

    const url = new URL(req.url);
    const isPreview = url.searchParams.get("preview") === "true";

    const { bytes, filename } = await exportTimelinePdf({
      timelineId,
    });

    return new Response(Buffer.from(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": isPreview
          ? "inline"
          : `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    console.error("[TIMELINE_PDF_EXPORT]", err);
    // "Timeline not found" is also what RLS answers for a timeline outside the caller's family.
    const notFound = /not found/i.test(String((err as Error | null)?.message ?? ""));
    return new Response(
      notFound ? "Timeline not found" : "Failed to export timeline",
      { status: notFound ? 404 : 500 }
    );
  }
}
