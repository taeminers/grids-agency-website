// Retry reads only. Writes are reconciled by their caller, never by this helper.
export async function retryRead<T>(read: () => Promise<T>, sleep: (ms: number) => Promise<void>): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try { return await read(); }
    catch (error) {
      const status = error && typeof error === "object" && "status" in error ? Number(error.status) : undefined;
      const transient = status === 408 || status === 429 || (status !== undefined && status >= 500 && status <= 599) ||
        (status === undefined && error instanceof Error && /network|timed out|fetch failed/i.test(error.message));
      if (!transient || attempt >= 2) throw error;
      await sleep(1000 * 2 ** attempt);
    }
  }
}
