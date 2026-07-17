import { File, Paths } from "expo-file-system"
import { unzipSync } from "fflate"

export async function loadOrFetchCachedZip<T>(
  url: string,
  zipCacheFileName: string,
  jsonDocFileName: string
): Promise<T> {
  const jsonFile = new File(Paths.document, jsonDocFileName)

  if (!jsonFile.exists) {
    const zipFile = new File(Paths.cache, zipCacheFileName)

    await File.downloadFileAsync(url, zipFile, { idempotent: true })

    const extracted = unzipSync(await zipFile.bytes())

    const jsonFileName = Object.keys(extracted).find((f) => f.endsWith(".json"))
    if (!jsonFileName)
      throw new Error(`No JSON file found in ${zipCacheFileName}`)

    jsonFile.write(new TextDecoder().decode(extracted[jsonFileName]))
    zipFile.delete()
  }

  return JSON.parse(await jsonFile.text()) as T
}
