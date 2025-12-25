import { exportTimelinePdf } from "../../../../dashboard/timeline/_actions/exportTimelinePdf";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ timelineId: string }> }
) {
  try {
    const { timelineId } = await params;

    if (!timelineId) {
      return new Response("Missing timeline id", { status: 400 });
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
      },
    });
  } catch (err: any) {
    console.error("[TIMELINE_PDF_EXPORT]", err);
    return new Response(
      err?.message || "Failed to export timeline",
      { status: 500 }
    );
  }
}
