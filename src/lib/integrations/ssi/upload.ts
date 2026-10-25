import type { DiveLog, DivessiClient } from "divessi-client"
import { assertSsiAuthenticated } from "./api"
import { decodeSsiDivelog } from "./responses"

// SSI returns "YYYY-MM-DD HH:MM", the payload uses "YYYY-MM-DD+HH:MM:SS.mmm".
function startMinute(datetime: string) {
  return datetime.replace(/[+T]/, " ").slice(0, 16)
}

async function findStoredDive(client: DivessiClient, start: string) {
  const { data: divelog } = await client.get_divelog(undefined, {
    decode: decodeSsiDivelog,
  })
  return divelog.logbook_details.filter(
    (log) =>
      log.odin_user_log_deleted === 0 &&
      startMinute(log.odin_user_log_datetime) === start
  )
}

export async function uploadSsiDive(client: DivessiClient, dive: DiveLog) {
  // DiveLog is sparse; imports need a datetime for duplicate and read-back checks.
  if (
    typeof dive.odin_user_log_datetime !== "string" ||
    dive.odin_user_log_datetime.trim().length === 0
  ) {
    throw new Error("Dive start datetime is required")
  }
  const start = startMinute(dive.odin_user_log_datetime)

  // Don't store the same dive twice (e.g. on a retried import).
  if ((await findStoredDive(client, start)).length > 0) {
    return { skipped: true }
  }

  await client.save_divelog(
    { json_data: dive },
    {
      decode: (data) => {
        assertSsiAuthenticated(data)
        return data
      },
    }
  )

  // SSI can report success while dropping a dive, so read the logbook back.
  const stored = await findStoredDive(client, start)
  if (stored.length === 0) {
    console.error("save_divelog did not store dive")
    throw new Error(`Dive #${dive.odin_user_log_nr} was not stored by SSI`)
  }
  if (stored.length > 1) {
    console.warn(
      `save_divelog stored dive #${dive.odin_user_log_nr} ${stored.length} times`
    )
  }
  return { skipped: false }
}
