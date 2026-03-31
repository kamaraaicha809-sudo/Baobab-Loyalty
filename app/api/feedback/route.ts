import { NextRequest, NextResponse } from "next/server";

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = "app14J1xxcQ9aoV0e";
const AIRTABLE_TABLE_NAME = "Feedbacks";

export async function POST(req: NextRequest) {
  if (!AIRTABLE_API_KEY) {
    return NextResponse.json({ ok: false, error: "Airtable not configured" }, { status: 500 });
  }

  const body = await req.json();
  const { utilisateur, page, feedback } = body;

  if (!feedback || typeof feedback !== "string" || feedback.trim().length === 0) {
    return NextResponse.json({ ok: false, error: "Feedback is required" }, { status: 400 });
  }

  const res = await fetch(
    `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: {
          Utilisateur: utilisateur || "",
          Date: new Date().toISOString(),
          Page: page || "/",
          Feedback: feedback.trim(),
          Source: "widget",
          Statut: "nouveau",
        },
      }),
    }
  );

  if (!res.ok) {
    return NextResponse.json({ ok: false, error: "Failed to save feedback" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
