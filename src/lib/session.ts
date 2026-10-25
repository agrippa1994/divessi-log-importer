import { createServerFn } from "@tanstack/react-start"
import z from "zod"
import { createSsiClient } from "./integrations/ssi/api"
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
    const session = await useAppSession()

    try {
      const result = await createSsiClient().login({
        l: ctx.data.email,
        p: ctx.data.password,
      })

      if (result.data.authenticated && result.data.token) {
        await session.update({ ssiToken: result.data.token })
        return true
      }
    } catch (e) {
      console.log("Error", e)
    }

    return false
  })
