import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
  );

  const { data, error } =
    await supabase
      .from("scans")
      .select("*")
      .order("created_at", {
        ascending: false
      })
      .limit(10);

  if (error) {
    return res.status(500).json({
      error
    });
  }

  return res.status(200).json(data);
}
