import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  const domain = req.query.domain;

  if (!domain) {
    return res.status(400).json({
      error: "Missing domain"
    });
  }

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const prompts = [
      "best tools for small businesses",
      "top software platforms",
      "best SaaS platforms",
      "top SEO tools",
      "recommended business tools"
    ];

    const competitors = [
      "semrush.com",
      "ahrefs.com",
      "moz.com"
    ];

    let results = [];

    for (let prompt of prompts) {
      const completion =
        await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: `List ${prompt}`
            }
          ]
        });

      const text =
        completion.choices[0]
          .message.content
          .toLowerCase();

      const youAppear =
        text.includes(domain.toLowerCase());

      let competitorHits = [];

      for (let comp of competitors) {
        if (text.includes(comp)) {
          competitorHits.push(comp);
        }
      }

      results.push({
        prompt,
        youAppear,
        competitors: competitorHits
      });
    }

    const visibility = Math.round(
      (results.filter(r => r.youAppear).length /
        prompts.length) * 100
    );

    const gaps = results
      .filter(r =>
        !r.youAppear &&
        r.competitors.length > 0
      )
      .map(r => ({
        ...r,
        priority:
          r.competitors.length >= 2
            ? "High"
            : "Medium",
        opportunityScore:
          r.competitors.length * 20
      }));

    await supabase
      .from("scans")
      .insert([
        {
          domain,
          visibility
        }
      ]);

    return res.status(200).json({
      llm: {
        visibility
      },
      competitors,
      gaps
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Analysis failed"
    });
  }
}
