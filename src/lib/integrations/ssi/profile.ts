/** biome-ignore-all lint/suspicious/noExplicitAny: no interface data */
import { queryOptions } from "@tanstack/react-query"
import { createServerFn } from "@tanstack/react-start"
import { useAppSession } from "@/lib/session.server"
import { ssiGet } from "./api"

export interface Profile {
  authenticated_message: string
  user_id: string
  user_leader_nr: null
  user_facility_id: string
  user_forename: string
  user_lastname: string
  user_language: string
  user_country_long: string
  user_country: string
  user_street: string
  user_street_2: string
  user_state: string
  user_zip: string
  user_city: string
  user_email: string
  user_birthday: Date
  user_units: string
  user_last_login: Date
  user_login_counter: string
  user_mobile_c: string
  user_phone_c: string
  user_gender: string
  user_no_dives: string
  user_diving_since: string
  user_no_freedives: string
  user_mobile: string
  user_tel: string
  user_image: string
  user_image_timestamp: number
  user_app_user: boolean
  user_app_last_login: Date
  user_profile_text: string
  user_profile_link: string
  can_start_course_server: boolean
  can_create_edit_offical_sites: boolean
  privacy_required: boolean
  privacy_info: Date
  privacy_settings_required: boolean
  privacy_settings: PrivacySettings
  documents: Documents
  can_test_webview: boolean
  user_app_settings: string
}

export interface Documents {
  overview: Overview
  details: Details
  url: string
}

export interface Details {
  missing: Missing[]
  pending: any[]
  valid: any[]
  optional: any[]
}

export interface Missing {
  category: string
  sport: string
  center: null
  expireDate: Date
  daysValid: number
  info: string
}

export interface Overview {
  missing: number
  pending: number
  valid: number
  optional: number
}

export interface PrivacySettings {
  privacy: number[]
  marketing_consent: number[]
  divelogchallenge_consent: number[]
  ccards: number[]
  use_record_data: number[]
  dv_settings: number[]
  address: number[]
  allergies: number[]
  buddy_finder: number[]
  emergency: number[]
  equipmentlist: number[]
  logbook: number[]
  sizingtable: number[]
  hide_certs_in_diver_verification: number[]
  hide_recent_certs_online: number[]
}

export const getSsiProfile = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await useAppSession()
    return ssiGet<Profile>({
      what: "get_user_data",
      token: session.data.ssiToken!,
    })
  }
)

export function ssiProfileOptions() {
  return queryOptions({
    queryKey: ["ssi", "profile"],
    queryFn: (ctx) => getSsiProfile({ signal: ctx.signal }),
  })
}
