import type { NextApiRequest, NextApiResponse } from "next";
import { match } from "ts-pattern";
import { createMachine, Interpreter, interpret, InterpreterFrom } from "xstate";
import { randomBytes } from "crypto";

interface State {
  id: string;
  msisdn?: string;
}

const orchestrator = createMachine({
  initial: "start",
  schema: {
    context: {} as State,
    events: {} as { type: "VALIDATION_SETUP" } | { type: "VALIDATION_CHECK" },
  },
  states: {
    start: {},
    done: {},
  },
});

const db: Record<string, State> = {};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // console.log(req);
  return match(req)
    .with({ method: "POST", url: "/api/orchestrator" }, () => {
      const id = randomBytes(20).toString("hex");

      db[id] = { id };

      res.status(200).json({
        id,
        state: "start",
        actions: ["VALIDATION_SETUP", "VALIDATION_CHECK"],
        data: db[id],
      });
    })
    .with(
      { method: "POST", url: "/api/orchestrator/actions/VALIDATION_SETUP" },
      () => {
        const { id, msisdn } = req.body;
        if (!msisdn) {
          return res.status(400).json({
            orchestratorId: id,
            message: 'Missing "msisdn" parameter',
            action: "VALIDATION_SETUP",
          });
        }
        db[id].msisdn = msisdn;

        return res.status(200).json({
          id,
          state: "start",
          actions: ["VALIDATION_SETUP", "VALIDATION_CHECK"],
          data: db[id],
        });
      }
    )
    .with(
      { method: "POST", url: "/api/orchestrator/actions/VALIDATION_CHECK" },
      () => {
        const { id, otp } = req.body;
        if (!otp) {
          return res.status(400).json({
            orchestratorId: id,
            message: 'Missing "otp" parameter',
            action: "VALIDATION_SETUP",
          });
        }
        if (otp === "123123") {
          return res.status(200).json({
            id,
            state: "done",
            actions: ["RESTART"],
            data: db[id],
          });
        }
        return res.status(401).json({
          orchestratorId: id,
          message: 'Invalid "otp" parameter',
          action: "VALIDATION_CHECK",
        });
      }
    )
    .with({ method: "POST", url: "/api/orchestrator/actions/RESTART" }, () => {
      const { id } = req.body;
      db[id] = { id };

      return res.status(200).json({
        id,
        state: "start",
        actions: ["VALIDATION_SETUP", "VALIDATION_CHECK"],
        data: db[id],
      });
    })
    .otherwise(() => {
      return res.status(404).json({ name: "not found" });
    });
}
