// biome-ignore-all lint/suspicious/noExplicitAny: API
import { mutationOptions } from "@tanstack/react-query"
import { createServerFn } from "@tanstack/react-start"
import z from "zod"
import { getSSIToken } from "@/lib/session.server"
import { ssiPost } from "./api"

export const saveSsiDive = createServerFn({ method: "POST" })
  .validator(z.object({ dive: z.custom<CreateDive>() }))
  .handler(async (ctx) => {
    await ssiPost(
      { what: "save_divelog", token: await getSSIToken() },
      ctx.data.dive
    )
    return true
  })

export function ssiCreateDiveOptions() {
  return mutationOptions({
    mutationFn: async (variables: { dive: CreateDive }) => {
      return await saveSsiDive({ data: variables })
    },
    onSuccess: async (_data, _variables, _onMutateResult, context) => {
      await context.client.invalidateQueries({ queryKey: ["ssi", "dives"] })
    },
  })
}

export interface CreateDive {
  odin_user_log_id: null
  odin_user_log_datetime: string
  odin_user_log_depth_m: number
  odin_user_log_depth_ft: number
  odin_user_log_avg_depth_m: number
  odin_user_log_avg_depth_ft: number
  odin_user_log_divetime: number
  odin_user_log_nr: number
  odin_user_log_dive_type: number
  odin_user_log_rating: null
  odin_user_log_airtemp_c: null
  odin_user_log_airtemp_f: null
  odin_user_log_watertemp_c: number | null
  odin_user_log_watertemp_f: number | null
  odin_user_log_pressure_start_bar: number | null
  odin_user_log_pressure_start_psi: number | null
  odin_user_log_pressure_end_bar: number | null
  odin_user_log_pressure_end_psi: number | null
  odin_user_log_dive_sites_id: number | null
  localSiteId: null
  odin_user_log_buddy_ids: number[]
  log_linked_facility_id: null
  localBuddyIds: number[]
  odin_user_log_animal_ids: any[]
  odin_user_log_gear: any[]
  odin_user_log_user_master_id: null
  odin_user_log_leader_nr: null
  odin_user_log_comment: string | null
  odin_user_log_crdate: null
  odin_user_log_deleted: boolean
  reset_profile_divelog_number_with_deletion: null
  odin_user_log_var_divetype_id: number | null
  odin_user_log_var_water_body_id: null
  odin_user_log_var_watertype_id: number | null
  odin_user_log_var_entry_id: null
  odin_user_log_var_current_id: null
  odin_user_log_var_surface_id: null
  odin_user_log_var_weather_id: null
  odin_user_log_var_tanktype_id: number | null
  odin_user_log_vis_m: null
  odin_user_log_vis_ft: null
  odin_user_log_weight_kg: number | null
  odin_user_log_weight_lb: number | null
  odin_user_log_tank_vol_l: number | null
  odin_user_log_tank_vol_cuft: null
  odin_user_log_ean: null
  odin_user_log_ean_percent: null
  odin_user_log_var_specialdive_id: null
  odin_user_log_amv_l: number | null
  odin_user_log_amv_psi: null
  odin_user_log_frd_suit: null
  odin_user_log_frd_weight_kg: null
  odin_user_log_frd_weight_lb: null
  odin_user_log_frd_neutral_m: null
  odin_user_log_frd_neutral_ft: null
  odin_user_log_frd_divetype_id: number | null
  odin_user_log_frdwater_body_id: null
  odin_user_log_frddisc_STA: null
  odin_user_log_frddisc_STA_WU: null
  odin_user_log_frddisc_STA_MAX: null
  odin_user_log_frddisc_STA_CT: null
  odin_user_log_frddisc_STATT: null
  odin_user_log_frddisc_STATT_RP: null
  odin_user_log_frddisc_STATT_MAX: null
  odin_user_log_frddisc_WAPN: null
  odin_user_log_frddisc_WAPN_WU: null
  odin_user_log_frddisc_WAPN_RP: null
  odin_user_log_frddisc_WAPN_MAX: null
  odin_user_log_frddisc_DYN: null
  odin_user_log_frddisc_DYN_WU: null
  odin_user_log_frddisc_DYN_MAX_m: null
  odin_user_log_frddisc_DYN_MAX_ft: null
  odin_user_log_frddisc_DYNTT: null
  odin_user_log_frddisc_DYNTT_RP: null
  odin_user_log_frddisc_DYNTT_MAX_m: null
  odin_user_log_frddisc_DYNTT_MAX_ft: null
  odin_user_log_frddisc_FIM: null
  odin_user_log_frddisc_FIM_WU: null
  odin_user_log_frddisc_FIM_MAX_m: null
  odin_user_log_frddisc_FIM_MAX_ft: null
  odin_user_log_frddisc_FIM_TIME: null
  odin_user_log_frddisc_CWT: null
  odin_user_log_frddisc_CWT_WU: null
  odin_user_log_frddisc_CWT_MAX_m: null
  odin_user_log_frddisc_CWT_MAX_ft: null
  odin_user_log_frddisc_CWT_TIME: null
  odin_user_log_frddisc_CNF: null
  odin_user_log_frddisc_CNF_WU: null
  odin_user_log_frddisc_CNF_MAX_m: null
  odin_user_log_frddisc_CNF_MAX_ft: null
  odin_user_log_frddisc_CNF_TIME: null
  odin_user_log_frddisc_VWT: null
  odin_user_log_frddisc_VWT_WU: null
  odin_user_log_frddisc_VWT_MAX_m: null
  odin_user_log_frddisc_VWT_MAX_ft: null
  odin_user_log_frddisc_VWT_TIME: null
  odin_user_log_frddisc_FRC: null
  odin_user_log_frddisc_FRC_RP: null
  odin_user_log_frddisc_FRC_MAX_m: null
  odin_user_log_frddisc_FRC_MAX_ft: null
  odin_user_log_frddisc_DNF: null
  odin_user_log_frddisc_DNF_WU: null
  odin_user_log_frddisc_DNF_MAX_m: null
  odin_user_log_frddisc_DNF_MAX_ft: null
  odin_user_log_frd_NOTES: null
  odin_user_log_xr_divetype_id: null
  odin_user_log_divecenter_confirmed: null
  odin_user_log_transferDate: null
  odin_user_log_diveComputer: string | null
  odin_user_log_diveComputerData: null
  odin_user_log_depthDataset: string | null
  odin_user_log_alarmDataset: null
  timestamp: null
  odin_user_log_confirmed: null
  odin_user_log_verified: null
  odin_user_log_divecenter_confirmed_id: null
  odin_user_log_divecenter_confirmed_name: null
  odin_user_log_divecenter_confirmed_logo: null
  odin_user_log_leader_confirmed_id: null
  odin_user_log_leader_confirmed_name: null
  odin_user_log_user_confirmed_id: null
  odin_user_log_user_confirmed_name: null
  odin_user_log_xr_planned_bottom_time: null
  odin_user_log_xr_total_deco_time: null
  odin_user_log_xr_back_tanktype_id: null
  odin_user_log_xr_deco_tanktype_id: null
  odin_user_log_xr_back_vol_l: null
  odin_user_log_xr_deco1_vol_l: null
  odin_user_log_xr_deco2_vol_l: null
  odin_user_log_xr_deco3_vol_l: null
  odin_user_log_xr_back_ean: null
  odin_user_log_xr_back_tmx: null
  odin_user_log_xr_deco1_ean: null
  odin_user_log_xr_deco1_tmx: null
  odin_user_log_xr_deco2_ean: null
  odin_user_log_xr_deco2_tmx: null
  odin_user_log_xr_deco3_ean_o2: null
  odin_user_log_xr_back_start_bar: null
  odin_user_log_xr_back_end_bar: null
  odin_user_log_xr_deco1_start_bar: null
  odin_user_log_xr_deco1_end_bar: null
  odin_user_log_xr_deco2_start_bar: null
  odin_user_log_xr_deco2_end_bar: null
  odin_user_log_xr_deco3_start_bar: null
  odin_user_log_xr_deco3_end_bar: null
  odin_user_log_xr_sac_bottom_l: null
  odin_user_log_xr_sac_deco_l: null
  odin_user_log_frddisc: null
  odin_user_log_xr_back: null
  odin_user_log_xr_deco1: null
  odin_user_log_xr_deco2: null
  odin_user_log_xr_deco3: null
  odin_user_log_xr_deco1_tanktype_id: null
  odin_user_log_xr_deco2_tanktype_id: null
  odin_user_log_xr_deco3_tanktype_id: null
  odin_user_log_xr_planned_depth: null
  odin_user_log_xr_planned_deco_time: null
  odin_user_log_xr_back_o2: null
  odin_user_log_xr_back_he: null
  odin_user_log_xr_deco1_o2: null
  odin_user_log_xr_deco1_he: null
  odin_user_log_xr_deco2_o2: null
  odin_user_log_xr_deco2_he: null
  odin_user_log_xr_deco3_o2: null
  odin_user_log_scr_unit_id: null
  odin_user_log_scr_total_deco_time: null
  odin_user_log_scr_sac_bailout_l: null
  odin_user_log_scr_sac_deco_l: null
  odin_user_log_scr_bottom_tanktype_id: null
  odin_user_log_scr_bottom_tank_vol_l: null
  odin_user_log_scr_bottom_o2: null
  odin_user_log_scr_bottom_setpoint: null
  odin_user_log_scr_bottom_start_bar: null
  odin_user_log_scr_bottom_end_bar: null
  odin_user_log_scr_deco: null
  odin_user_log_scr_deco_tanktype_id: null
  odin_user_log_scr_deco_tank_vol_l: null
  odin_user_log_scr_deco_o2: null
  odin_user_log_scr_deco_setpoint: null
  odin_user_log_scr_deco_start_bar: null
  odin_user_log_scr_deco_end_bar: null
  odin_user_log_si_before: null | number
  odin_user_log_watertemp_max_c: number | null
  odin_user_log_watertemp_max_f: number | null
  odin_user_log_gf_set: null
  odin_user_log_gf_set_1: null
  odin_user_log_gf_set_2: null
  odin_user_log_gf_end: null
  odin_user_log_cns_start: null
  odin_user_log_cns_end: null
  odin_user_log_otu_start: null
  odin_user_log_otu_end: null
  odin_user_log_tempDataset: string | null
  odin_user_log_gfnowDataset: null | string
  odin_user_log_gfSurfDataset: null | string
  odin_user_log_deepestDecoDataset: null
  odin_user_log_tankPressureDataset: string | null
  odin_user_log_freeDiveSessionCharts: null
  odin_user_log_divecomputer_dive_ref: string | null
  odin_user_log_divecomputer_ref: string | null
  odin_user_log_divecomputer_imported: boolean
  needsUpload: boolean
  odin_user_log_ccr_unit_id: null
  odin_user_log_ccr_total_deco_time: null
  odin_user_log_ccr_sac_bailout_l: null
  odin_user_log_ccr_sac_deco_l: null
  odin_user_log_ccr_bailout01: null
  odin_user_log_ccr_bailout01_tanktype_id: null
  odin_user_log_ccr_bailout01_tank_vol_l: null
  odin_user_log_ccr_bailout01_o2: null
  odin_user_log_ccr_bailout01_he: null
  odin_user_log_ccr_bailout01_start_bar: null
  odin_user_log_ccr_bailout01_end_bar: null
  odin_user_log_ccr_bailout02: null
  odin_user_log_ccr_bailout02_tanktype_id: null
  odin_user_log_ccr_bailout02_tank_vol_l: null
  odin_user_log_ccr_bailout02_o2: null
  odin_user_log_ccr_bailout02_he: null
  odin_user_log_ccr_bailout02_start_bar: null
  odin_user_log_ccr_bailout02_end_bar: null
  odin_user_log_ccr_bailout03: null
  odin_user_log_ccr_bailout03_tanktype_id: null
  odin_user_log_ccr_bailout03_tank_vol_l: null
  odin_user_log_ccr_bailout03_o2: null
  odin_user_log_ccr_bailout03_he: null
  odin_user_log_ccr_bailout03_start_bar: null
  odin_user_log_ccr_bailout03_end_bar: null
  odin_user_log_ccr_diluent_gas: null
  odin_user_log_ccr_diluent_tanktype_id: null
  odin_user_log_ccr_diluent_tank_vol_l: null
  odin_user_log_ccr_diluent_o2: null
  odin_user_log_ccr_diluent_he: null
  odin_user_log_ccr_diluent_start_bar: null
  odin_user_log_ccr_diluent_end_bar: null
  odin_user_log_deco_dive: null
  odin_user_log_deco_time: null
  odin_user_log_deco_gas: null
  odin_user_log_deco_gas_tanktype_id: null
  odin_user_log_deco_gas_tank_vol_l: null
  odin_user_log_deco_gas_o2: null
  odin_user_log_deco_gas_start_bar: null
  odin_user_log_deco_gas_end_bar: null
  odin_user_log_alarm_fast_ascent: null
  odin_user_log_alarm_deco_stop: null
  odin_user_log_alarm_deco_violation: null
  needsVerificationUpload: null
  needsUnverifyUpload: null
  odin_user_log_deco_gas_tank_vol_cuft: null
  odin_user_log_deco_gas_start_psi: null
  odin_user_log_deco_gas_end_psi: null
  odin_user_log_xr_back_vol_cuft: null
  odin_user_log_xr_back_start_psi: null
  odin_user_log_xr_back_end_psi: null
  odin_user_log_xr_deco1_vol_cuft: null
  odin_user_log_xr_deco1_start_psi: null
  odin_user_log_xr_deco1_end_psi: null
  odin_user_log_xr_deco2_vol_cuft: null
  odin_user_log_xr_deco2_start_psi: null
  odin_user_log_xr_deco2_end_psi: null
  odin_user_log_xr_deco3_vol_cuft: null
  odin_user_log_xr_deco3_start_psi: null
  odin_user_log_xr_deco3_end_psi: null
  odin_user_log_xr_sac_bottom_psi: null
  odin_user_log_xr_sac_deco_psi: null
  odin_user_log_xr_deco3_he: null
  odin_user_log_scr_sac_bailout_psi: null
  odin_user_log_scr_sac_deco_psi: null
  odin_user_log_scr_bottom_tank_vol_cuft: null
  odin_user_log_scr_bottom_start_psi: null
  odin_user_log_scr_bottom_end_psi: null
  odin_user_log_scr_deco_tank_vol_cuft: null
  odin_user_log_scr_deco_start_psi: null
  odin_user_log_scr_deco_end_psi: null
  odin_user_log_ccr_sac_bailout_psi: null
  odin_user_log_ccr_sac_deco_psi: null
  odin_user_log_ccr_bottom_tank_vol_cuft: null
  odin_user_log_ccr_o2_start_psi: null
  odin_user_log_ccr_o2_end_psi: null
  odin_user_log_ccr_diluent_tank_vol_cuft: null
  odin_user_log_ccr_diluent_start_psi: null
  odin_user_log_ccr_diluent_end_psi: null
  odin_user_log_ccr_bailout01_tank_vol_cuft: null
  odin_user_log_ccr_bailout01_start_psi: null
  odin_user_log_ccr_bailout01_end_psi: null
  odin_user_log_ccr_bailout02_tank_vol_cuft: null
  odin_user_log_ccr_bailout02_start_psi: null
  odin_user_log_ccr_bailout02_end_psi: null
  odin_user_log_ccr_bailout03_tank_vol_cuft: null
  odin_user_log_ccr_bailout03_start_psi: null
  odin_user_log_ccr_bailout03_end_psi: null
  odin_user_log_ccr_o2_tanktype_id: null
  odin_user_log_ccr_o2_tank_vol_l: null
  odin_user_log_ccr_o2_tank_vol_cuft: null
  odin_user_log_ccr_o2_start_bar: null
  odin_user_log_ccr_o2_end_bar: null
  log_linked_brevet_rule_id: null
  uploadError: null
  odin_user_log_gearconfiguration_id: number | null
  log_extended_data_cleanup_weight_kg: null
  log_extended_data_cleanup_weight_lb: null
  odin_user_log_divecomputer_serial_nr: string | null
  odin_user_log_divecomputer_ble_id: null
  odin_user_log_divecomputer_id: null
  odin_user_log_divecomputer_name: string | null
  odin_user_log_divecomputer_manufacturer: string | null
  odin_user_log_divecomputer_firmware: string | null
  odin_user_log_divecomputer_raw_data_header: null
  odin_user_log_divecomputer_raw_data_details: null
  odin_user_log_scr_start_time: null
  odin_user_log_scr_end_time: null
  odin_user_log_scr_oc: null
  odin_user_log_diveSamples: null | string
  odin_user_log_housing_local_dive_media: null
  odin_user_log_apple_watch: number
  odin_user_log_apple_watch_log_id: null
  odin_user_log_apple_watch_id: null
  odin_user_log_pressureDataset: null
  odin_user_log_heartRateMin: null
  odin_user_log_heartRateMax: null
  odin_user_log_heartRateAvg: null
  odin_user_log_heartRateDataset: null
  odin_user_log_batteryLevelDataset: null
  odin_user_log_batteryLevelStart: null
  odin_user_log_batteryLevelEnd: null
  odin_user_log_accelerationDataset: null
  odin_user_log_gyroDataset: null
  odin_user_log_pos_start_latitude: number | null
  odin_user_log_pos_start_longitude: number | null
  odin_user_log_pos_end_latitude: null
  odin_user_log_pos_end_longitude: null
  odin_user_log_dive_on_own_risk: number
  odin_user_log_dive_on_own_risk_os_app: null
  odin_user_log_locationDataset: null
  odin_user_log_apple_watch_app_version: null
  odin_user_log_apple_watch_os_version: null
  odin_user_log_divecomputer_max_sensor_depth: null
  odin_user_log_divecomputer_bottomtimer: null
  odin_user_log_divecomputer_productname: null
  odin_user_log_date: string
  odin_user_log_entry_time: string
}

/**
 * Bitmask flags for the `mf` (mode/phase flags) field.
 * Encodes which phase of the dive the computer considers the diver to be in.
 *
 * Lifecycle: DIVE → DIVE|AT_DEPTH → DIVE|SAFETY_STOP → DIVE → DIVE|SURFACED
 */
export enum DivePhaseFlag {
  /** Bit 27 — Always on from first to last sample. Base "dive active" flag. */
  DIVE = 0x08000000,
  /** Bit 16 — Turns on at ~8.5m on descent, off at ~6m on ascent (replaced by SAFETY_STOP). */
  AT_DEPTH = 0x00010000,
  /** Bit 17 — Turns on at ~6m on ascent. Active for exactly 3 minutes. Off at ~4.5m when stop completes. */
  SAFETY_STOP = 0x00020000,
  /** Bit 26 — Turns on at ≤1.0m depth. Toggles off if diver bobs back below threshold. */
  SURFACED = 0x04000000,
}

/**
 * Bitmask flags for the `a` (alarm) field.
 * Multiple alarm bits can be active simultaneously (e.g. 6 = ASCENT_ADVISORY | ASCENT_WARNING).
 */
export enum AlarmFlag {
  /** No alarm active. */
  NONE = 0x000000,
  /** Bit 1 — Moderate ascent rate advisory (~5+ m/min shallow, ~10+ m/min deep). */
  ASCENT_ADVISORY = 0x000002,
  /**
   * Bit 2 — Fast ascent rate warning (~6+ m/min shallow, ~12+ m/min deep).
   * Typically appears combined with ASCENT_ADVISORY as value 6 (0x000006).
   */
  ASCENT_WARNING = 0x000004,
  /** Bit 18 — NDL warning. Fires when NDL drops to critically low values (observed at NDL=2). */
  NDL_WARNING = 0x040000,
}

/**
 * A single dive sample recorded by the Suunto dive computer at 5-second intervals.
 * Each sample is a snapshot of the dive computer's state at that moment in time.
 */
export interface DiveSample {
  /** Sample number (1-based sequential index). */
  n: number

  /** Time in milliseconds since dive start. Fixed 5000ms (5s) intervals. */
  t: number

  /** Depth in meters. 0.0 at surface. */
  d: number

  /** Ascent/descent speed in m/min. Negative = descending, positive = ascending. */
  s: number

  /** Water temperature in °C at current depth. */
  te: number

  /**
   * No-Decompression Limit in minutes.
   * Capped at 99 (≥99 min remaining). 0 = deco obligation exceeded.
   */
  ndl: number

  /**
   * GF Surf — Gradient Factor at Surface (%).
   * Theoretical GF if the diver surfaced instantly.
   * Climbs during bottom time, decreases during ascent/offgassing.
   */
  gs: number

  /**
   * GF Now — current Gradient Factor at actual depth (%).
   * Stays at 0 while underwater (ambient pressure exceeds tissue tension).
   * Only rises above 0 near the surface.
   */
  gn?: number

  /**
   * Alarm code (bitmask). See {@link AlarmFlag}.
   * Common values: 0 (none), 2 (advisory), 6 (advisory + warning), 262144 (NDL warning).
   */
  a: number

  /**
   * Mode/phase flags (bitmask). See {@link DivePhaseFlag}.
   * Encodes the current dive phase: descent, at depth, safety stop, final ascent, surfaced.
   */
  mf: number

  /**
   * Obligation flag. Likely reserved for mandatory deco stops in technical dive modes (trimix/CCR).
   * Not observed to activate on recreational GF-based profiles, even when NDL=0.
   */
  o: boolean

  /**
   * Deco Required flag. Likely reserved for formal deco diving modes.
   * Not observed to activate on recreational GF-based profiles, even when NDL=0.
   */
  dr: boolean

  /** Tank pressure in bar at this sample. Omitted when no cylinder pressure data is available. */
  pressure?: number
}
