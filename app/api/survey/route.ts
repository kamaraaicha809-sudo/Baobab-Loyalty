import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/libs/supabase/admin";
import { checkRateLimit, getClientIp } from "@/libs/rate-limit";

const surveySchema = z.object({
  hotel: z.string().min(1).max(200),
  discount: z.coerce.number().min(0).max(100).optional(),
  answers: z.record(z.string(), z.union([z.string().max(1000), z.number()])),
});

export async function POST(req: NextRequest) {
  const json = await req.json();
  const parsed = surveySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Requête invalide" }, { status: 400 });
  }
  const { hotel, discount, answers } = parsed.data;

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ ok: true });
  }

  const ip = getClientIp(req);
  const allowed = await checkRateLimit(supabase, `survey:${ip}`, 10, 600);
  if (!allowed) {
    return NextResponse.json({ ok: false, error: "Trop de requêtes. Réessayez plus tard." }, { status: 429 });
  }

  const { error } = await supabase.from("survey_responses").insert({
    hotel_name: hotel,
    discount: discount ?? 0,
    answers,
  });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
