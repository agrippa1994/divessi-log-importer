import { createServerFn } from "@tanstack/react-start"
import z from "zod"
import { rpcEndpoint, ssiClient } from "./integrations/ssi/api"
import type {
  Authenticated,
  AuthenticationError,
} from "./integrations/ssi/login"
import { useAppSession } from "./session.server"

export const isLoggedIn = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await useAppSession()
    return session.data
  }
)

export const logout = createServerFn({ method: "POST" }).handler(async () => {
  const session = await useAppSession()
  await session.clear()
  return true
})

export const login = createServerFn({ method: "POST" })
  .validator(
    z.object({
      email: z.email(),
      password: z.string().min(1),
    })
  )
  .handler(async (ctx) => {
    console.log("Perform login for", ctx.data.email)
    try {
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

      console.log("Received", result)

      const session = await useAppSession()
      if (result.data.authenticated) {
        await session.update({ ssiToken: result.data.token })
        return true
      }
    } catch (e) {
      console.log("Error", e)
    }

    return false
  })
