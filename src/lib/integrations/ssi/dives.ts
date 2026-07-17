// biome-ignore-all lint/suspicious/noExplicitAny: API
import { queryOptions } from "@tanstack/react-query"
import { createServerFn } from "@tanstack/react-start"
import { useAppSession } from "@/lib/session.server"
import { ssiGet } from "./api"

export const getSsiDives = createServerFn({ method: "GET" }).handler(
  async (ctx) => {
    const session = await useAppSession()
    const x = await ssiGet<Divelog>({
      what: "get_divelog",
      token: session.data.ssiToken!,
    })
    return x
  }
)

export function ssiDivesOptions() {
  return queryOptions({
    queryKey: ["ssi", "dives"],
    queryFn: (ctx) => getSsiDives({ signal: ctx.signal }),
  })
}

export interface Divelog {
  verified_dives: number
  homescreen_dives: number
  verified_freediving_sessions: number
  homescreen_sessions: number
  highest_certified_divelognumber_scuba: number
  highest_certified_divelognumber_freediving: number
  logbook_sites: LogbookSite[]
  logbook_details: LogbookDetail[]
  logbook_buddies: LogbookBuddy[]
  logbook_stats: LogbookStats
  logbook_history: LogbookHistory
}

export interface LogbookBuddy {
  id: number
  master_id: number
  buddy_master_id: number
  firstname: string
  lastname: string
  dob: string
  favorite: number
  email: string
  phone: number | string
  address: string
  comment: string
  nickname: string
  added: Date
  image: string
  deleted: number
  forename: string
  city: string
  country: Country
  mobile_c?: number | string
  phone_c?: number | string
  leader_nr: number | string
  leader_active: number
  image_timestamp: number
  confirmed: number
}

export enum Country {
  Aut = "AUT",
  Deu = "DEU",
  Usa = "USA",
}

export interface LogbookDetail {
  odin_user_log_id: number | null
  odin_user_log_user_master_id: number
  odin_user_log_nr: number
  odin_user_log_dive_type: number
  odin_user_log_dive_sites_id: number
  odin_user_log_date: Date
  odin_user_log_entry_time: string
  odin_user_log_divetime: number
  odin_user_log_buddy_ids: number[]
  odin_user_log_leader_nr: string
  odin_user_log_comment: string
  odin_user_log_units: string
  odin_user_log_rating: number
  odin_user_log_deleted: number
  odin_user_log_var_divetype_id: number
  odin_user_log_var_water_body_id: number
  odin_user_log_var_watertype_id: number
  odin_user_log_var_entry_id: number
  odin_user_log_var_current_id: number
  odin_user_log_var_surface_id: number
  odin_user_log_var_weather_id: number
  odin_user_log_var_tanktype_id: number | null
  odin_user_log_depth_m: number
  odin_user_log_depth_ft: number
  odin_user_log_watertemp_c: number | null
  odin_user_log_watertemp_f: number | null
  odin_user_log_airtemp_c: number
  odin_user_log_airtemp_f: number
  odin_user_log_vis_m: number
  odin_user_log_vis_ft: number
  odin_user_log_weight_kg: number
  odin_user_log_weight_lb: number
  odin_user_log_tank_vol_l: number
  odin_user_log_tank_vol_cuft: number
  odin_user_log_ean: number
  odin_user_log_ean_percent: number
  odin_user_log_var_specialdive_id: OdinUserLogVarSpecialdiveIDEnum | number
  odin_user_log_pressure_start_bar: number
  odin_user_log_pressure_end_bar: number
  odin_user_log_pressure_start_psi: number
  odin_user_log_pressure_end_psi: number
  odin_user_log_avg_depth_m: number | null
  odin_user_log_avg_depth_ft: number | null
  odin_user_log_amv_l: number
  odin_user_log_amv_psi: number
  odin_user_log_gear_details: OdinUserLogGearDetails
  odin_user_log_animal_ids: any[]
  odin_user_log_verified: boolean
  odin_user_log_confirmed: boolean
  odin_user_log_divecenter_confirmed: number
  odin_user_log_divecenter_confirmed_id: number
  odin_user_log_divecenter_confirmed_name: string
  odin_user_log_leader_confirmed_id: number
  odin_user_log_leader_confirmed_name: OdinUserLogLeaderConfirmedName
  odin_user_log_user_confirmed_id: number
  odin_user_log_user_confirmed_name: string
  odin_user_log_buddy_confirmed_buddyid: number
  odin_user_log_buddy_confirmed_name: string
  odin_user_log_transferDate: OdinUserLogTransferDate
  odin_user_log_diveComputer: string
  odin_user_log_diveComputerData: string
  odin_user_log_depthDataset: string
  odin_user_log_last_sync: Date
  odin_user_log_si_before: number | null
  odin_user_log_watertemp_max_c: number | null
  odin_user_log_watertemp_max_f: number | null
  odin_user_log_gf_set: OdinUserLogGfSet
  odin_user_log_gf_set_1: number
  odin_user_log_gf_set_2: number
  odin_user_log_gf_end: number
  odin_user_log_cns_start: number
  odin_user_log_cns_end: number
  odin_user_log_otu_start: number
  odin_user_log_otu_end: number
  odin_user_log_tempDataset: string
  odin_user_log_gfnowDataset: string
  odin_user_log_gfSurfDataset: string
  odin_user_log_deepestDecoDataset: string
  odin_user_log_tankPressureDataset: string
  odin_user_log_alarmDataset: string
  odin_user_log_freeDiveSessionCharts: string
  odin_user_log_divecomputer_dive_ref: string
  odin_user_log_divecomputer_ref: OdinUserLogDivecomputerRef
  odin_user_log_alarm_fast_ascent: number
  odin_user_log_alarm_deco_stop: number
  odin_user_log_alarm_deco_violation: number
  odin_user_log_divecomputer_imported: number
  updates: number
  app_version: string
  timestamp: string
  odin_user_log_data_frd_id: null
  odin_user_log_data_frd_log_id: null
  x_odin_user_log_frd_suit: null
  odin_user_log_frd_weight_kg: null
  odin_user_log_frd_weight_lb: null
  odin_user_log_frd_neutral_m: null
  odin_user_log_frd_neutral_ft: null
  odin_user_log_frd_divetype_id: null
  x_odin_user_log_frdwater_body_id: null
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
  odin_user_log_frddisc_DNF: null
  odin_user_log_frddisc_DNF_WU: null
  odin_user_log_frddisc_DNF_MAX_m: null
  odin_user_log_frddisc_DNF_MAX_ft: null
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
  odin_user_log_data_xr_dive_id: null
  odin_user_log_data_xr_log_id: null
  odin_user_log_xr_divetype_id: null
  odin_user_log_xr_total_deco_time: null
  odin_user_log_xr_planned_bottom_time: null
  odin_user_log_xr_planned_deco_time: null
  odin_user_log_xr_planned_depth: null
  odin_user_log_xr_back: null
  odin_user_log_xr_back_tanktype_id: null
  odin_user_log_xr_back_vol_l: null
  odin_user_log_xr_back_vol_cuft: null
  odin_user_log_xr_back_o2: null
  odin_user_log_xr_back_he: null
  odin_user_log_xr_back_start_bar: null
  odin_user_log_xr_back_end_bar: null
  odin_user_log_xr_back_start_psi: null
  odin_user_log_xr_back_end_psi: null
  odin_user_log_xr_deco1: null
  odin_user_log_xr_deco1_tanktype_id: null
  odin_user_log_xr_deco1_vol_l: null
  odin_user_log_xr_deco1_vol_cuft: null
  odin_user_log_xr_deco1_o2: null
  odin_user_log_xr_deco1_he: null
  odin_user_log_xr_deco1_start_bar: null
  odin_user_log_xr_deco1_end_bar: null
  odin_user_log_xr_deco1_start_psi: null
  odin_user_log_xr_deco1_end_psi: null
  odin_user_log_xr_deco2: null
  odin_user_log_xr_deco2_tanktype_id: null
  odin_user_log_xr_deco2_vol_l: null
  odin_user_log_xr_deco2_vol_cuft: null
  odin_user_log_xr_deco2_o2: null
  odin_user_log_xr_deco2_he: null
  odin_user_log_xr_deco2_start_bar: null
  odin_user_log_xr_deco2_end_bar: null
  odin_user_log_xr_deco2_start_psi: null
  odin_user_log_xr_deco2_end_psi: null
  odin_user_log_xr_deco3: null
  odin_user_log_xr_deco3_tanktype_id: null
  odin_user_log_xr_deco3_vol_l: null
  odin_user_log_xr_deco3_vol_cuft: null
  odin_user_log_xr_deco3_o2: null
  odin_user_log_xr_deco3_he: null
  odin_user_log_xr_deco3_start_bar: null
  odin_user_log_xr_deco3_end_bar: null
  odin_user_log_xr_deco3_start_psi: null
  odin_user_log_xr_deco3_end_psi: null
  odin_user_log_xr_sac_bottom_l: null
  odin_user_log_xr_sac_bottom_psi: null
  odin_user_log_xr_sac_deco_l: null
  odin_user_log_xr_sac_deco_psi: null
  odin_user_log_data_scr_dive_id: null
  odin_user_log_data_scr_log_id: null
  odin_user_log_scr_unit_id: null
  odin_user_log_scr_total_deco_time: null
  odin_user_log_scr_sac_bailout_l: null
  odin_user_log_scr_sac_bailout_psi: null
  odin_user_log_scr_sac_deco_l: null
  odin_user_log_scr_sac_deco_psi: null
  odin_user_log_scr_bottom_tanktype_id: null
  odin_user_log_scr_bottom_tank_vol_l: null
  odin_user_log_scr_bottom_tank_vol_cuft: null
  odin_user_log_scr_bottom_o2: null
  odin_user_log_scr_bottom_setpoint: null
  odin_user_log_scr_bottom_start_bar: null
  odin_user_log_scr_bottom_start_psi: null
  odin_user_log_scr_bottom_end_bar: null
  odin_user_log_scr_bottom_end_psi: null
  odin_user_log_scr_deco: null
  odin_user_log_scr_deco_tanktype_id: null
  odin_user_log_scr_deco_tank_vol_l: null
  odin_user_log_scr_deco_tank_vol_cuft: null
  odin_user_log_scr_deco_o2: null
  odin_user_log_scr_deco_setpoint: null
  odin_user_log_scr_deco_start_bar: null
  odin_user_log_scr_deco_start_psi: null
  odin_user_log_scr_deco_end_bar: null
  odin_user_log_scr_deco_end_psi: null
  odin_user_log_scr_start_time: null
  odin_user_log_scr_end_time: null
  odin_user_log_scr_oc: null
  odin_user_log_data_ccr_dive_id: null
  odin_user_log_data_ccr_log_id: null
  odin_user_log_ccr_unit_id: null
  odin_user_log_ccr_total_deco_time: null
  odin_user_log_ccr_sac_bailout_l: null
  odin_user_log_ccr_sac_bailout_psi: null
  odin_user_log_ccr_sac_deco_l: null
  odin_user_log_ccr_sac_deco_psi: null
  odin_user_log_ccr_bottom_tanktype_id: null
  odin_user_log_ccr_bottom_tank_vol_l: null
  odin_user_log_ccr_bottom_tank_vol_cuft: null
  odin_user_log_ccr_o2: null
  odin_user_log_ccr_o2_tanktype_id: null
  odin_user_log_ccr_o2_tank_vol_l: null
  odin_user_log_ccr_o2_tank_vol_cuft: null
  odin_user_log_ccr_o2_start_bar: null
  odin_user_log_ccr_o2_start_psi: null
  odin_user_log_ccr_o2_end_bar: null
  odin_user_log_ccr_o2_end_psi: null
  odin_user_log_ccr_diluent_gas: null
  odin_user_log_ccr_diluent_tanktype_id: null
  odin_user_log_ccr_diluent_tank_vol_l: null
  odin_user_log_ccr_diluent_tank_vol_cuft: null
  odin_user_log_ccr_diluent_o2: null
  odin_user_log_ccr_diluent_he: null
  odin_user_log_ccr_diluent_start_bar: null
  odin_user_log_ccr_diluent_start_psi: null
  odin_user_log_ccr_diluent_end_bar: null
  odin_user_log_ccr_diluent_end_psi: null
  odin_user_log_ccr_bailout01: null
  odin_user_log_ccr_bailout01_tanktype_id: null
  odin_user_log_ccr_bailout01_tank_vol_l: null
  odin_user_log_ccr_bailout01_tank_vol_cuft: null
  odin_user_log_ccr_bailout01_o2: null
  odin_user_log_ccr_bailout01_he: null
  odin_user_log_ccr_bailout01_start_bar: null
  odin_user_log_ccr_bailout01_start_psi: null
  odin_user_log_ccr_bailout01_end_bar: null
  odin_user_log_ccr_bailout01_end_psi: null
  odin_user_log_ccr_bailout02: null
  odin_user_log_ccr_bailout02_tanktype_id: null
  odin_user_log_ccr_bailout02_tank_vol_l: null
  odin_user_log_ccr_bailout02_tank_vol_cuft: null
  odin_user_log_ccr_bailout02_o2: null
  odin_user_log_ccr_bailout02_he: null
  odin_user_log_ccr_bailout02_start_bar: null
  odin_user_log_ccr_bailout02_start_psi: null
  odin_user_log_ccr_bailout02_end_bar: null
  odin_user_log_ccr_bailout02_end_psi: null
  odin_user_log_ccr_bailout03: null
  odin_user_log_ccr_bailout03_tanktype_id: null
  odin_user_log_ccr_bailout03_tank_vol_l: null
  odin_user_log_ccr_bailout03_tank_vol_cuft: null
  odin_user_log_ccr_bailout03_o2: null
  odin_user_log_ccr_bailout03_he: null
  odin_user_log_ccr_bailout03_start_bar: null
  odin_user_log_ccr_bailout03_start_psi: null
  odin_user_log_ccr_bailout03_end_bar: null
  odin_user_log_ccr_bailout03_end_psi: null
  odin_user_log_data_deco_dive_id: number
  odin_user_log_data_deco_log_id: number
  odin_user_log_deco_dive: number | null
  odin_user_log_deco_time: number | null
  odin_user_log_deco_gas: null
  odin_user_log_deco_gas_tanktype_id: null
  odin_user_log_deco_gas_tank_vol_l: null
  odin_user_log_deco_gas_tank_vol_cuft: null
  odin_user_log_deco_gas_o2: null
  odin_user_log_deco_gas_start_bar: null
  odin_user_log_deco_gas_end_bar: null
  odin_user_log_deco_gas_start_psi: null
  odin_user_log_deco_gas_end_psi: null
  log_linked_log_id: number
  log_linked_mid: number
  log_linked_leader_nr: number | null
  log_linked_facility_id: number | null
  log_linked_brevet_rule_id: number
  log_linked_update_comment: null | string
  log_linked_updated_by: null | string
  log_linked_timestamp: Date
  log_extended_data_log_id: number | null
  log_extended_data_mid: number | null
  log_extended_data_cleanup_weight_kg: null
  log_extended_data_cleanup_weight_lb: null
  log_extended_data_latitude: null
  log_extended_data_longitude: null
  log_extended_data_divesite_name: null
  log_extended_data_divesite_spot: null
  log_extended_data_decomodel: null
  log_extended_data_conservatism: null
  log_extended_data_mblevel: null
  log_extended_data_hashedidentifier: null | string
  log_dataset_log_id: number | null
  log_dataset_mid: number | null
  log_updated: Date | null
  odin_user_log_apple_watch_log_id: number | null
  odin_user_log_apple_watch_mid: number | null
  odin_user_log_apple_watch_id: number | null
  odin_user_log_apple_watch: number | null
  odin_user_log_pressureDataset: null
  odin_user_log_heartRateDataset: null
  odin_user_log_batteryLevelDataset: null
  odin_user_log_accelerationDataset: null
  odin_user_log_gyroDataset: null
  odin_user_log_heartRateMin: null
  odin_user_log_heartRateMax: null
  odin_user_log_heartRateAvg: null
  odin_user_log_batteryLevelStart: null
  odin_user_log_batteryLevelEnd: null
  odin_user_log_pos_start_latitude: null
  odin_user_log_pos_start_longitude: null
  odin_user_log_pos_end_latitude: null
  odin_user_log_pos_end_longitude: null
  odin_user_log_housing: number | null
  odin_user_log_housing_dive_local_id: number | null
  odin_user_log_housing_local_dive_media: null
  odin_user_log_dive_on_own_risk: number | null
  odin_user_log_dive_on_own_risk_os_app: null
  odin_user_log_apple_watch_os_version: null
  odin_user_log_apple_watch_app_version: null
  odin_user_log_apple_watch_updated: Date | null
  log_aad_log_id: null
  log_aad_mid: null
  log_aad_aa_id: null
  log_aad_identifier: null
  log_aad_aer_id: null
  log_aad_deleted: null
  log_aad_updates: null
  log_aad_updated_by: null
  log_aad_updated: null
  odin_user_log_gearconfiguration_log_id: number | null
  odin_user_log_gearconfiguration_mid: number | null
  odin_user_log_gearconfiguration_id: number | null
  odin_user_log_gearconfiguration_timestamp: Date | null
  odin_user_log_datetime: string
  odin_user_log_gear: any[]
  debug_get_dives_for_master_id_for_app_2022: number
  odin_user_log_divecomputer_id: number | null
  odin_user_log_divecomputer_serial_nr: OdinUserLogDivecomputerSerialNr
  odin_user_log_divecomputer_firmware: OdinUserLogDivecomputerFirmware
  odin_user_log_divecomputer_ble_id: OdinUserLogDivecomputerBleID
  odin_user_log_divecomputer_name: OdinUserLogDivecomputerName
  odin_user_log_divecomputer_manufacturer: OdinUserLogDivecomputerManufacturer
  odin_user_log_diveSamples?: string
}

export enum OdinUserLogDivecomputerBleID {
  Empty = "",
  The02C8E4Bc8C80C256683AEfc4C4D24756 = "02C8E4BC-8C80-C256-683A-EFC4C4D24756",
}

export enum OdinUserLogDivecomputerFirmware {
  Empty = "",
  The010404 = "01.04.04",
  The010501 = "01.05.01",
}

export enum OdinUserLogDivecomputerManufacturer {
  Empty = "",
  Mares = "Mares",
}

export enum OdinUserLogDivecomputerName {
  Empty = "",
  MaresPuck4 = "Mares Puck4",
  Puck4 = "Puck4",
}

export enum OdinUserLogDivecomputerRef {
  Empty = "",
  MaresPuck42417004981 = "Mares Puck4_2417004981",
  Puck4 = "Puck4",
}

export enum OdinUserLogDivecomputerSerialNr {
  Empty = "",
  The2417004981 = "2417004981",
}

export enum OdinUserLogGearDetails {
  Empty = "",
  The5Mm = "5mm",
  The7Mm = "7mm",
}

export enum OdinUserLogGfSet {
  Empty = "",
  The7171 = "71 / 71",
  The7373 = "73 / 73",
  The7575 = "75 / 75",
  The7777 = "77 / 77",
  The8585 = "85 / 85",
}

export enum OdinUserLogLeaderConfirmedName {
  DominikBeyer125066 = "Dominik Beyer #125066",
  Empty = "",
  HannaMuir109160 = "Hanna Muir #109160",
  ManfredHoeller116108 = "Manfred Hoeller #116108",
  RobinTrieb70054 = "Robin Trieb #70054",
  TinaSackl116106 = "Tina Sackl #116106",
}

export enum OdinUserLogTransferDate {
  The00000000 = "0000-00-00",
}

export enum OdinUserLogVarSpecialdiveIDEnum {
  Empty = "",
  The15925 = "159,25",
  The2527 = "25,27",
}

export interface LogbookHistory {
  history_mid: number
  history_confirmed: number
  history_scuba_totaldives: number
  history_scuba_since: number
  history_scuba_totaldivetime: number
  history_scuba_maxdivetime: number
  history_scuba_mindivetime: number
  history_scuba_totaldepth: number
  history_scuba_totaldepth_ft: number
  history_scuba_maxdepth: number
  history_scuba_maxdepth_ft: number
  history_scuba_totaldivesites: number
  history_scuba_totaldivesnitrox: number
  history_scuba_totaldivestrimix: number
  history_scuba_totaldivesdeco: number
  history_scuba_totaldecotime: number
  history_scuba_maxdecotime: number
  history_scuba_maxwatertemp: null
  history_scuba_maxwatertemp_f: null
  history_scuba_minwatertemp: null
  history_scuba_minwatertemp_f: null
  history_scuba_maxairtemp: null
  history_scuba_maxairtemp_f: null
  history_scuba_minairtemp: null
  history_scuba_minairtemp_f: null
  history_scuba_maxsac: null
  history_scuba_maxsac_cft: null
  history_scuba_minsac: null
  history_scuba_minsac_cft: null
  history_scuba_minweight: null
  history_scuba_minweight_lb: null
  history_scuba_maxweight: null
  history_scuba_maxweight_lb: null
  history_freediving_sessions: number
  history_freediving_since: number
  history_freediving_totaldivesites: number
  history_freediving_sta_maxdivetime: number
  history_freediving_dyn_maxdistance: number
  history_freediving_dyn_maxdistance_ft: number
  history_freediving_dnf_maxdistance: number
  history_freediving_dnf_maxdistance_ft: number
  history_freediving_fim_maxdepth: number
  history_freediving_fim_maxdepth_ft: number
  history_freediving_cwt_maxdepth: number
  history_freediving_cwt_maxdepth_ft: number
  history_freediving_cnf_maxdepth: number
  history_freediving_cnf_maxdepth_ft: number
  history_freediving_vwt_maxdepth: number
  history_freediving_vwt_maxdepth_ft: number
  history_scr_runtime: number
  history_scr_units: any[]
  history_scr_maxdecotime: number
  history_ccr_runtime: number
  history_ccr_units: any[]
  history_ccr_maxdecotime: number
  history_ohe_totaldivetime: number
  history_ohe_maxdecotime: number
  history_confirmedby: string
  history_confirmeddate: Date
  history_confirmedcomment: string
  history_created: Date
  history_updated: Date
}

export interface LogbookSite {
  odin_dive_sites_id: number
  odin_dive_sites_country_iso3: string
  odin_dive_sites_region_id: number
  odin_dive_sites_area_id: number
  odin_dive_sites_name: string
  odin_dive_sites_meta_country: string
  odin_dive_sites_meta_region: string
  odin_dive_sites_meta_area: string
  odin_dive_sites_meta_address: string
  country_lalo: null | string
  odin_dive_sites_lat: number
  odin_dive_sites_lon: number
  odin_dive_sites_geo_locked: number
  odin_countries_code_iso: null | string
  odin_countries: null | string
  odin_dive_sites_regions_name: null | string
  odin_dive_sites_areas_name: string
  odin_dive_sites_address: string
  odin_dive_sites_is_private: number
  odin_dive_sites_deleted: number
  odin_dive_sites_geo_set_by: string
  odin_dive_sites_added_date: Date
  odin_dive_sites_comment: number | string
  odin_dive_sites_on_water: number
  odin_dive_sites_alias_ids: number | string
  timestamp: Date
  current: Current
  myloggedDives?: number
  myAverageMaxDepth?: number
  myAverageRating?: number
  myAverageDivetime?: number
  odin_user_log_animal_ids: number[]
  bow?: Bow
  odin_dive_sites_pos_verified?: string
  alias_names_search?: string
  alias_names?: string[]
  odin_dive_sites_is_private_owner?: number
}

export enum Bow {
  Artificial = "artificial",
  Fresh = "fresh",
  Salt = "salt",
}

export interface Current {
  no_current: number | null
  light_current: number | null
  strong_current: number | null
  ripping_current: number | null
}

export interface LogbookStats {
  myLoggedDives: number
  myAverageMaxDepth: number
  myAverageMaxDepthFt: number
  myMaxDepth: number
  myMaxDepthFt: number
  totalDepth: number
  totalDepthFt: number
  myAverageDivetime: number
  totalDiveTime: number
  minDiveTime: number
  maxDiveTime: number
  myAverageRating: null
  myAverageVis: number
  myAverageWaterTemp: number
  myAverageWaterTempF: number
  minWaterTemp: number
  minWaterTempF: number
  maxWaterTemp: number
  maxWaterTempF: number
  myAverageAirTemp: number
  myAverageAirTempF: number
  minAirTemp: number
  minAirTempF: number
  maxAirTemp: number
  maxAirTempF: number
  myAverageWeight: number
  myAverageWeightLb: number
  minWeight: number
  minWeightLb: number
  maxWeight: number
  maxWeightLb: number
  myVisitedSites: number
  myNitroxDives: number
  myAverageNitroxMix: number
  myRatedDives: number
  myAverageAMV: number
  minAMV: number
  maxAMV: number
  info: string
  dives_per_year_month: Record<string, Record<string, number>>
  dives_per_activity: DivesPerActivity
  dives_per_var: DivesPerVar
  sightings: any[]
  sightings_per_year_month: any[]
  center_stamped_dives: CenterStampedDive[]
  myAverageSac: number
}

export interface CenterStampedDive {
  stamps: number
  confirmed_id: number
  odin_facility_name: string
  odin_facility_city: string
  odin_facility_country: string
  odin_facility_lat: number
  odin_facility_lon: number
  center_stamp: boolean
  center_logo: string
  center_url: string
  log_nr: number[]
  log_id: number[]
}

export interface DivesPerActivity {
  scuba: number
}

export interface DivesPerVar {
  divetype: Divetype
  specialdive: Specialdive
  surface: Surface
  tanktype: Tanktype
  watertype: Watertype
  weather: Weather
}

export interface Divetype {
  education: number
  fun: number
}

export interface Specialdive {
  boat: number
  computer: number
  deep: number
  nitrox: number
  ice: number
  "sc-alt": number
}

export interface Surface {
  calm: number
}

export interface Tanktype {
  alu: number
  steel: number
}

export interface Watertype {
  fresh: number
  salt: number
}

export interface Weather {
  sunny: number
  rainy: number
}
