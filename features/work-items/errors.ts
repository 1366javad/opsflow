export class WorkItemError extends Error {
  constructor(message: string, public readonly status: 400 | 404) {
    super(message);
    this.name = "WorkItemError";
  }
}
