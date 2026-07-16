import { createServerFn } from "@tanstack/react-start"
import { useSession } from "@tanstack/react-start/server"
import z from "zod"
import { env } from "./env"
import { rpcEndpoint, ssiClient, ssiPost } from "./integrations/ssi/api"
import type {
  Authenticated,
  AuthenticationError,
} from "./integrations/ssi/login"

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
    },
  })
}

export const isLoggedIn = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await useAppSession()
    return session.data
  }
)

export const login = createServerFn({ method: "POST" })
  .validator(
    z.object({
      email: z.email(),
      password: z.string().min(1),
    })
  )
  .handler(async (ctx) => {
    const result = await ssiClient.get<Authenticated | AuthenticationError>(
      rpcEndpoint,
      {
        params: {
          what: "authenticate",
          l: ctx.data.email,
          p: ctx.data.password,
        },
      }
    )

    const session = await useAppSession()
    if (result.data.authenticated) {
      await session.update({ ssiToken: result.data.token })
      return true
    }

    return false
  })
