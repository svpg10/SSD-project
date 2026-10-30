"""Bounded synchronous calculations at a killable OS-process boundary."""

import asyncio
import multiprocessing as mp
import time
from cvd_studio.domain.errors import ScienceError


def worker(connection, request):
    try:
        from cvd_studio.services.simulation import simulate

        connection.send(("ok", simulate(request)))
    except ScienceError as exc:
        connection.send(("science", (exc.code, exc.message, exc.path)))
    except Exception:
        connection.send(("internal", None))
    finally:
        connection.close()


def execute(request, timeout=5, target=worker):
    ctx = mp.get_context("spawn")
    parent, child = ctx.Pipe(duplex=False)
    process = ctx.Process(target=target, args=(child, request), daemon=True)
    started = time.monotonic()
    try:
        process.start()
        child.close()
        if not parent.poll(max(0, timeout - (time.monotonic() - started))):
            raise ScienceError(
                "CALCULATION_TIMEOUT", "Calculation deadline exceeded. Reduce workload and retry."
            )
        try:
            status, payload = parent.recv()
        except EOFError:
            raise ScienceError("WORKER_FAILURE", "Calculation worker stopped unexpectedly.") from None
        if status == "science":
            raise ScienceError(*payload)
        if status != "ok":
            raise ScienceError("INTERNAL_ERROR", "Calculation could not be completed.")
        return payload
    finally:
        if process.pid:
            if process.is_alive():
                process.terminate()
            process.join(timeout=1)
            if process.is_alive():
                process.kill()
                process.join()
            process.close()
        child.close()
        parent.close()


class BoundedExecutor:
    def __init__(self, active=4, queued=16):
        self.semaphore = asyncio.Semaphore(active)
        self.limit = active + queued
        self.inflight = 0

    async def run(self, request):
        if self.inflight >= self.limit:
            raise ScienceError("SATURATED", "Calculation capacity is full; retry shortly.")
        self.inflight += 1
        try:
            async with self.semaphore:
                # Shield keeps capacity reserved until the killable calculation actually ends,
                # even if the HTTP client disconnects.
                task = asyncio.create_task(asyncio.to_thread(execute, request))
                try:
                    return await asyncio.shield(task)
                except asyncio.CancelledError:
                    await task
                    raise
        finally:
            self.inflight -= 1
