import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { hotel, discount, answers } = body as {
    hotel: string;
    discount: number;
    answers: Record<string, string | number>;
  };

  if (!hotel || !answers) {
    return NextResponse.json({ ok: false, error: "Missing fields" }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ ok: true });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { error } = await supabase.from("survey_responses").insert({
    hotel_name: hotel,
    discount: Number(discount) || 0,
    answers,
  });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
