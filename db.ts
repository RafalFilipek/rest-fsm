interface OrchestratorState {
  id: string;
  state: "start" | "done";
  msisdn?: string;
}

export const stateToEventMap: Record<OrchestratorState["state"], string[]> = {
  start: ["VALIDATION_SETUP", "VALIDATION_CHECK"],
  done: ["RESTART"],
};

function checkIfCanExecuteEventInState(
  state: OrchestratorState["state"],
  action: string
): boolean {
  return stateToEventMap[state].includes(action);
}

export const db: Map<string, OrchestratorState> = new Map();
