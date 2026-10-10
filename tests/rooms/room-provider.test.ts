import assert from "node:assert/strict"
import { mock, test } from "node:test"
import * as React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { tables } from "../../lib/spacetime/module_bindings"

const connection = { isActive: true, reducers: {} }
let state: unknown[]
let sessions: object[]
const snapshots = new Map<unknown, object[]>([
  [tables.roomInfo, [{ id: "room", ownerAuthId: "owner" }]],
  [
    tables.roomParticipants,
    [
      {
        id: "player",
        roomId: "room",
        displayName: "Player",
        roles: [],
        isOnline: true,
      },
    ],
  ],
])

// Seed hook state for server rendering; the renewal loop has its own timer tests.
mock.module("react", {
  namedExports: {
    ...React,
    useState: () => [state.shift(), () => {}],
    useRef: () => ({ current: true }),
    useEffect: () => {},
  },
})
mock.module("@clerk/nextjs", {
  namedExports: { useAuth: () => ({ isLoaded: true, userId: "owner" }) },
})
mock.module("spacetimedb/react", {
  namedExports: {
    SpacetimeDBProvider: ({ children }: { children: React.ReactNode }) =>
      children,
    useSpacetimeDB: () => ({ isActive: true, getConnection: () => connection }),
    useTable: (table: unknown) => [
      table === tables.mySession ? sessions : (snapshots.get(table) ?? []),
      true,
    ],
  },
})
mock.module(new URL("../../components/ui/button.tsx", import.meta.url).href, {
  namedExports: { Button: "button" },
})
mock.module(new URL("../../components/ui/spinner.tsx", import.meta.url).href, {
  namedExports: { Spinner: "span" },
})
mock.module(
  new URL("../../app/(no-sidebar)/room/[roomId]/actions.ts", import.meta.url)
    .href,
  {
    namedExports: {
      issueRoomTicket: async () => {
        throw new Error("Temporary outage")
      },
    },
  }
)
const { default: RoomProvider } =
  await import("../../app/(no-sidebar)/room/[roomId]/room-provider")

function render(hasSession: boolean, joined: boolean) {
  state = [true, {}, null, joined ? connection : null, "Authorization failed"]
  sessions = hasSession
    ? [{ roomId: "room", participantId: "player", identityKey: "clerk:owner" }]
    : []
  const props = {
    roomId: "room",
    viewerAuthId: "owner",
    children: "Room content",
  }
  return renderToStaticMarkup(React.createElement(RoomProvider, props))
}

test("a renewal error keeps an already authorized room visible", () => {
  assert.match(render(true, true), /Room content/)
})

test("an expired or revoked session hides the room even after joining", () => {
  const html = render(false, true)
  assert.doesNotMatch(html, /Room content/)
  assert.match(html, /Authorization failed/)
})

test("an initial authorization failure shows the reload action", () => {
  const html = render(false, false)
  assert.doesNotMatch(html, /Room content/)
  assert.match(html, /Reload room/)
})
