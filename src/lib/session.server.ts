import { useSession } from "@tanstack/react-start/server"
import { env } from "./env"

type SessionData = {
  ssiToken: string
}

export function useAppSession() {
  return useSession<SessionData>({
    name: "app-session",
    password: env.SESSION_SECRET ?? "secret",
    cookie: {
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      httpOnly: true,
      maxAge: 34560000, // 400 days, the maximum cookie age modern browsers (e.g. Chrome) will honor
    },
  })
}

export async function getSSIToken() {
  // biome-ignore lint/correctness/useHookAtTopLevel: TanStack API
  const session = await useAppSession()

  if (!session.data.ssiToken) {
    throw new Error("Unauthorized")
  }

  return session.data.ssiToken
}
