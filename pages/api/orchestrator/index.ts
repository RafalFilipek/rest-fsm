import type { NextApiRequest, NextApiResponse } from "next";
import { db, stateToEventMap } from "../../../db";
import { randomBytes } from "crypto";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const id = randomBytes(20).toString("hex");

    const orchestrator = { id, state: "start" } as const;

    db.set(id, { id, state: "start" });

    return res.status(200).json({
      ...orchestrator,
      events: stateToEventMap[orchestrator?.state],
    });
  }
}
