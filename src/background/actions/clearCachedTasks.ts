import type { CachedTasks, State } from "../../common/state";

export function clearCachedTasks() {
  const emptyState: CachedTasks = {
    tasks: [],
    taskFetchFailureReason: null,
    tasksLastCompletedFetchTimestamp: null,
    tasksLastInitiatedFetchTimestamp: null,
  };

  return browser.storage.local.set<Partial<State>>(emptyState);
}
