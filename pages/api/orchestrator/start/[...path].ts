import type { NextApiRequest, NextApiResponse } from "next";
import { match } from "ts-pattern";
import { db, stateToEventMap } from "../../../../db";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(req.method, req.query);
  match(req)
    .with(
      { method: "POST", query: { path: ["actions", "VALIDATION_SETUP"] } },
      () => {
        res.status(200).json({ ok: true });
      }
    )
    .otherwise(() => {
      res.status(404).json({ ok: false });
    });
}
