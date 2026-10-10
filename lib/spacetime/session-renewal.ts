export function startSessionRenewal(
  authorize: () => Promise<void>,
  onError: () => void
) {
  let stopped = false
  let renewing = false
  let timer: ReturnType<typeof setTimeout>

  async function renew() {
    if (stopped || renewing) return
    clearTimeout(timer)
    renewing = true
    let delay = 5 * 60 * 1000
    try {
      await authorize()
    } catch {
      delay = 15_000
      if (!stopped) onError()
    } finally {
      renewing = false
      if (!stopped) timer = setTimeout(() => void renew(), delay)
    }
  }

  void renew()
  return {
    renew,
    stop() {
      stopped = true
      clearTimeout(timer)
    },
  }
}
