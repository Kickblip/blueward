import assert from "node:assert/strict"
import { test } from "node:test"
import { startSessionRenewal } from "../../lib/spacetime/session-renewal"

const flush = () => new Promise<void>((resolve) => setImmediate(resolve))

test("a failed renewal retries in 15 seconds, then returns to five minutes", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] })
  let calls = 0
  let errors = 0
  const renewal = startSessionRenewal(
    async () => {
      if (++calls === 2) throw new Error("Temporary outage")
    },
    () => errors++
  )
  t.after(() => renewal.stop())
  await flush()
  assert.equal(calls, 1)
  t.mock.timers.tick(300_000)
  await flush()
  assert.equal(errors, 1)
  t.mock.timers.tick(14_999)
  assert.equal(calls, 2)
  t.mock.timers.tick(1)
  await flush()
  assert.equal(calls, 3)
  t.mock.timers.tick(299_999)
  assert.equal(calls, 3)
  t.mock.timers.tick(1)
  await flush()
  assert.equal(calls, 4)
})

test("visibility renewals do not overlap requests or survive unmount", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] })
  let reject!: (error: Error) => void
  const request = new Promise<void>((_, fail) => {
    reject = fail
  })
  const authorize = t.mock.fn(() => request)
  const onError = t.mock.fn()
  const renewal = startSessionRenewal(authorize, onError)
  await renewal.renew()
  assert.equal(authorize.mock.callCount(), 1)
  renewal.stop()
  reject(new Error("Request completed after unmount"))
  await flush()
  t.mock.timers.tick(600_000)
  assert.equal(authorize.mock.callCount(), 1)
  assert.equal(onError.mock.callCount(), 0)
})
