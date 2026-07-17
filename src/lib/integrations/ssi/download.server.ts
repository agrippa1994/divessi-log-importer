import { access, mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { unzipSync } from "fflate"
import type { SsiDataSource } from "./sources"

async function exists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

/**
 * Downloads and extracts a single SSI data source's ZIP into `dataDir`,
 * skipping the download if the target JSON file already exists.
 */
export async function ensureSsiDataSource(
  dataDir: string,
  source: SsiDataSource
): Promise<void> {
  const target = join(dataDir, source.jsonFileName)

  if (await exists(target)) return

  await mkdir(dataDir, { recursive: true })

  const res = await fetch(source.url)
  if (!res.ok)
    throw new Error(`Failed to download ${source.url}: ${res.status}`)

  const extracted = unzipSync(new Uint8Array(await res.arrayBuffer()))

  const jsonEntry = Object.keys(extracted).find((f) => f.endsWith(".json"))
  if (!jsonEntry) throw new Error(`No JSON file found in ${source.zipFileName}`)

  await writeFile(target, extracted[jsonEntry])
}
