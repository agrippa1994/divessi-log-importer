import axios from "axios"

declare module "axios" {
  interface InternalAxiosRequestConfig {
    skipToken?: boolean
  }
  interface AxiosRequestConfig {
    skipToken?: boolean
  }
}

export const rpcEndpoint = "/app/a21.php"
export const ssiClient = axios.create({
  baseURL: "https://api.divessi.com",
  params: {
    ssiapp: "0815_ADR",
    lang: "en",
    version: "ADR_4.1.268-ssi",
    context: "s",
  },
})

export const ssiTokenSecureStorageKey = "ssiToken"
export const ssiCredentialsSecureStorageKey = "ssiCredentials"

export type APIErrorData = {
  status: number
  authenticated: false
  authenticated_message: string
  message: string
  result: string
}

export class APIError extends Error {
  constructor(public readonly error: APIErrorData) {
    super("APIError")
  }
}

export async function ssiGet<T>(
  params: Record<string, string>,
  options?: {
    endpoint?: string
    skipToken?: boolean
  }
): Promise<T> {
  if (!options?.skipToken) {
    // const loggedIn = await ctx.client.ensureQueryData(ssiLoggedIn());
    // if (!loggedIn) throw new Error('Not logged in');
  }

  const { data } = await ssiClient.get<APIErrorData | T>(
    options?.endpoint ?? rpcEndpoint,
    {
      params,
      skipToken: options?.skipToken,
    }
  )

  if (
    "authenticated" in (data as object) &&
    (data as APIErrorData).authenticated === false
  ) {
    throw new APIError(data as APIErrorData)
  }

  return data as unknown as T
}

export async function ssiPost<T>(
  params: Record<string, string>,
  body: object
): Promise<T> {
  const encoded = `json_data=${encodeURIComponent(JSON.stringify(body))}`

  console.log("INPUT", encoded)
  const { data } = await ssiClient.post<APIErrorData | T>(
    rpcEndpoint,
    encoded,
    {
      params,
      skipToken: false,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  )

  return data as unknown as T
}
