import { type CreateDive, DivePhaseFlag, type DiveSample } from '../ssi/create-dive';
import { barToPsi, celsiusToFahrenheit, kelvinToCelsius, metersToFeet } from './dive';
import type { SuuntoDiveLog } from './schema';

// --- Main Converter ---

function createDiveSamples(data: SuuntoDiveLog): DiveSample[] {
  const diveSamples: DiveSample[] = [];

  let index = 1;
  let sampleId = -1;
  for (const suuntoSample of data.DeviceLog.Samples) {
    sampleId++;

    if (suuntoSample.Depth === undefined) {
      continue;
    }

    const tempOffsetId = data.DeviceLog.Samples.reduce(
      (previous, current, idx) => {
        if (current.Temperature === undefined) {
          return previous;
        }

        const offset = Math.abs(sampleId - idx);
        if (previous === null) {
          return sampleId - idx;
        }

        if (offset < previous) {
          return sampleId - idx;
        }

        return previous;
      },
      null as null | number,
    );

    let temp = 0;
    if (tempOffsetId !== null) {
      const entry = data.DeviceLog.Samples[sampleId - tempOffsetId];
      if (entry.Temperature !== undefined) {
        temp = kelvinToCelsius(entry.Temperature);
      }
    }

    const offset = new Date(suuntoSample.TimeISO8601).getTime() - new Date(data.DeviceLog.Header.DateTime).getTime();
    const rawCylPressure = suuntoSample.Cylinders?.[0]?.Pressure;
    const samplePressureBar = rawCylPressure != null ? Math.round((rawCylPressure / 100000) * 100) / 100 : undefined;

    diveSamples.push({
      a: 0,
      d: suuntoSample.Depth,
      dr: false,
      // gn: suuntoSample.RtGradientFactors?.gf99,
      gs: suuntoSample.RtGradientFactors?.gfSurface ?? 0,
      mf: DivePhaseFlag.DIVE,
      n: index,
      ndl: Math.min((suuntoSample.NoDecTime ?? 0) / 60, 99),
      o: false,
      s: 0,
      t: offset,
      te: temp,
      ...(samplePressureBar !== undefined && { pressure: samplePressureBar }),
    });

    index++;
  }
  return diveSamples;
}

export function convertSuuntoToSSI(data: SuuntoDiveLog): CreateDive {
  const { Header, Samples } = data.DeviceLog;

  // Find dive start/end indices
  const diveStartIdx = Samples.findIndex((s) => s.DiveEvents?.DiveStatus === true);

  const diveStartTime =
    diveStartIdx >= 0 ? new Date(Samples[diveStartIdx].TimeISO8601).getTime() : new Date(Header.DateTime).getTime();
  const diveEndTime = diveStartTime + Header.DiveTime * 1000;

  // Extract time-series data within dive phase
  const depthData: number[] = [];
  const tempData: number[] = [];
  const tempValues: number[] = [];

  for (const sample of Samples) {
    const sampleTime = new Date(sample.TimeISO8601).getTime();
    if (sampleTime < diveStartTime || sampleTime > diveEndTime) continue;

    const _secondsOffset = (sampleTime - diveStartTime) / 1000;

    if (sample.Depth !== undefined) {
      depthData.push(sample.Depth);
    }

    if (sample.Temperature !== undefined) {
      const celsius = kelvinToCelsius(sample.Temperature);
      tempValues.push(celsius);
      tempData.push(celsius);
    }
  }

  // Water temp min/max from dive samples
  const waterTempMinC = tempValues.length > 0 ? Math.min(...tempValues) : null;
  const waterTempMaxC = tempValues.length > 0 ? Math.max(...tempValues) : null;

  // GPS from first DiveRouteOrigin sample
  const gpsSample = Samples.find((s) => 'DiveRouteOrigin' in s);
  const latitude = gpsSample?.DiveRouteOrigin?.Latitude ?? null;
  const longitude = gpsSample?.DiveRouteOrigin?.Longitude ?? null;

  // Cylinder pressure (first/last non-null)
  let pressureStartBar: number | null = null;
  let pressureEndBar: number | null = null;
  for (const sample of Samples) {
    const sampleTime = new Date(sample.TimeISO8601).getTime();
    if (sampleTime < diveStartTime || sampleTime > diveEndTime) continue;

    if (!sample.Cylinders) continue;

    for (const cyl of sample.Cylinders) {
      if (cyl.Pressure != null) {
        if (pressureStartBar === null) {
          pressureStartBar = cyl.Pressure / 100000;
        }
        pressureEndBar = cyl.Pressure / 100000;
      }
    }
  }

  // DateTime parsing
  const dt = new Date(Header.DateTime);
  const year = dt.getFullYear();
  const month = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  const hours = String(dt.getHours()).padStart(2, '0');
  const minutes = String(dt.getMinutes()).padStart(2, '0');
  const seconds = String(dt.getSeconds()).padStart(2, '0');
  const millis = String(dt.getMilliseconds()).padStart(3, '0');

  const dateStr = `${year}-${month}-${day}`;
  const entryTime = `${hours}:${minutes}`;
  const dateTimeStr = `${dateStr}+${hours}:${minutes}:${seconds}.${millis}`;

  const deviceName = `Suunto ${Header.Device.Name}`;
  const diveTimeMinutes = Math.round((Header.DiveTime / 60) * 10) / 10;

  const samples = createDiveSamples(data);

  return {
    // --- Bookkeeping (overridden in import.tsx) ---
    odin_user_log_id: null,
    odin_user_log_nr: 125,
    localSiteId: null,
    localBuddyIds: [],
    odin_user_log_crdate: null,
    reset_profile_divelog_number_with_deletion: null,
    needsUpload: true,
    needsVerificationUpload: null,
    needsUnverifyUpload: null,
    uploadError: null,

    // --- Core dive data ---
    odin_user_log_datetime: dateTimeStr,
    odin_user_log_depth_m: Header.Depth.Max,
    odin_user_log_depth_ft: Math.round(metersToFeet(Header.Depth.Max) * 100) / 100,
    odin_user_log_avg_depth_m: Header.DepthAverage,
    odin_user_log_avg_depth_ft: Math.round(metersToFeet(Header.DepthAverage) * 100) / 100,
    odin_user_log_divetime: diveTimeMinutes,
    odin_user_log_dive_type: 0,
    odin_user_log_rating: null,
    odin_user_log_airtemp_c: null,
    odin_user_log_airtemp_f: null,
    odin_user_log_watertemp_c: waterTempMinC !== null ? Math.round(waterTempMinC * 100) / 100 : null,
    odin_user_log_watertemp_f:
      waterTempMinC !== null ? Math.round(celsiusToFahrenheit(waterTempMinC) * 100) / 100 : null,
    odin_user_log_watertemp_max_c: waterTempMaxC !== null ? Math.round(waterTempMaxC * 100) / 100 : null,
    odin_user_log_watertemp_max_f:
      waterTempMaxC !== null ? Math.round(celsiusToFahrenheit(waterTempMaxC) * 100) / 100 : null,

    // --- Pressure ---
    odin_user_log_pressure_start_bar: pressureStartBar ?? null,
    odin_user_log_pressure_start_psi: pressureStartBar ? Math.round(barToPsi(pressureStartBar)) : null,
    odin_user_log_pressure_end_bar: pressureEndBar ?? null,
    odin_user_log_pressure_end_psi: pressureEndBar ? Math.round(barToPsi(pressureEndBar)) : null,

    // --- Site, buddies, gear ---
    odin_user_log_dive_sites_id: null,
    odin_user_log_buddy_ids: [],
    odin_user_log_animal_ids: [],
    odin_user_log_gear: [],
    odin_user_log_user_master_id: null,
    odin_user_log_leader_nr: null,
    odin_user_log_comment: Header.Notes ?? null,
    odin_user_log_deleted: false,

    // --- Date/time ---
    odin_user_log_date: dateStr,
    odin_user_log_entry_time: entryTime,

    // --- Variables ---
    odin_user_log_var_divetype_id: 24,
    odin_user_log_var_water_body_id: null,
    odin_user_log_var_watertype_id: 4,
    odin_user_log_var_entry_id: null,
    odin_user_log_var_current_id: null,
    odin_user_log_var_surface_id: null,
    odin_user_log_var_weather_id: null,
    odin_user_log_var_tanktype_id: 19,
    odin_user_log_vis_m: null,
    odin_user_log_vis_ft: null,
    odin_user_log_weight_kg: null,
    odin_user_log_weight_lb: null,
    odin_user_log_tank_vol_l: null,
    odin_user_log_tank_vol_cuft: null,
    odin_user_log_ean: null,
    odin_user_log_ean_percent: null,
    odin_user_log_var_specialdive_id: null,
    odin_user_log_amv_l: null,
    odin_user_log_amv_psi: null,

    // --- Freediving ---
    odin_user_log_frd_weight_kg: null,
    odin_user_log_frd_weight_lb: null,
    odin_user_log_frd_neutral_m: null,
    odin_user_log_frd_neutral_ft: null,
    odin_user_log_frd_divetype_id: 50,
    odin_user_log_frddisc_STA: null,
    odin_user_log_frddisc_STA_WU: null,
    odin_user_log_frddisc_STA_MAX: null,
    odin_user_log_frddisc_STA_CT: null,
    odin_user_log_frddisc_STATT: null,
    odin_user_log_frddisc_STATT_RP: null,
    odin_user_log_frddisc_STATT_MAX: null,
    odin_user_log_frddisc_WAPN: null,
    odin_user_log_frddisc_WAPN_WU: null,
    odin_user_log_frddisc_WAPN_RP: null,
    odin_user_log_frddisc_WAPN_MAX: null,
    odin_user_log_frddisc_DYN: null,
    odin_user_log_frddisc_DYN_WU: null,
    odin_user_log_frddisc_DYN_MAX_m: null,
    odin_user_log_frddisc_DYN_MAX_ft: null,
    odin_user_log_frddisc_DYNTT: null,
    odin_user_log_frddisc_DYNTT_RP: null,
    odin_user_log_frddisc_DYNTT_MAX_m: null,
    odin_user_log_frddisc_DYNTT_MAX_ft: null,
    odin_user_log_frddisc_FIM: null,
    odin_user_log_frddisc_FIM_WU: null,
    odin_user_log_frddisc_FIM_MAX_m: null,
    odin_user_log_frddisc_FIM_MAX_ft: null,
    odin_user_log_frddisc_FIM_TIME: null,
    odin_user_log_frddisc_CWT: null,
    odin_user_log_frddisc_CWT_WU: null,
    odin_user_log_frddisc_CWT_MAX_m: null,
    odin_user_log_frddisc_CWT_MAX_ft: null,
    odin_user_log_frddisc_CWT_TIME: null,
    odin_user_log_frddisc_CNF: null,
    odin_user_log_frddisc_CNF_WU: null,
    odin_user_log_frddisc_CNF_MAX_m: null,
    odin_user_log_frddisc_CNF_MAX_ft: null,
    odin_user_log_frddisc_CNF_TIME: null,
    odin_user_log_frddisc_VWT: null,
    odin_user_log_frddisc_VWT_WU: null,
    odin_user_log_frddisc_VWT_MAX_m: null,
    odin_user_log_frddisc_VWT_MAX_ft: null,
    odin_user_log_frddisc_VWT_TIME: null,
    odin_user_log_frddisc_FRC: null,
    odin_user_log_frddisc_FRC_RP: null,
    odin_user_log_frddisc_FRC_MAX_m: null,
    odin_user_log_frddisc_FRC_MAX_ft: null,
    odin_user_log_frddisc_DNF: null,
    odin_user_log_frddisc_DNF_WU: null,
    odin_user_log_frddisc_DNF_MAX_m: null,
    odin_user_log_frddisc_DNF_MAX_ft: null,

    // --- XR (extended range / tech diving) ---
    odin_user_log_xr_divetype_id: null,
    odin_user_log_xr_planned_bottom_time: null,
    odin_user_log_xr_total_deco_time: null,
    odin_user_log_xr_planned_depth: null,
    odin_user_log_xr_planned_deco_time: null,
    odin_user_log_xr_back: null,
    odin_user_log_xr_back_tanktype_id: null,
    odin_user_log_xr_deco_tanktype_id: null,
    odin_user_log_xr_back_vol_l: null,
    odin_user_log_xr_back_vol_cuft: null,
    odin_user_log_xr_back_ean: null,
    odin_user_log_xr_back_tmx: null,
    odin_user_log_xr_back_o2: null,
    odin_user_log_xr_back_he: null,
    odin_user_log_xr_back_start_bar: null,
    odin_user_log_xr_back_end_bar: null,
    odin_user_log_xr_back_start_psi: null,
    odin_user_log_xr_back_end_psi: null,
    odin_user_log_xr_deco1: null,
    odin_user_log_xr_deco1_tanktype_id: null,
    odin_user_log_xr_deco1_vol_l: null,
    odin_user_log_xr_deco1_vol_cuft: null,
    odin_user_log_xr_deco1_ean: null,
    odin_user_log_xr_deco1_tmx: null,
    odin_user_log_xr_deco1_o2: null,
    odin_user_log_xr_deco1_he: null,
    odin_user_log_xr_deco1_start_bar: null,
    odin_user_log_xr_deco1_end_bar: null,
    odin_user_log_xr_deco1_start_psi: null,
    odin_user_log_xr_deco1_end_psi: null,
    odin_user_log_xr_deco2: null,
    odin_user_log_xr_deco2_tanktype_id: null,
    odin_user_log_xr_deco2_vol_l: null,
    odin_user_log_xr_deco2_vol_cuft: null,
    odin_user_log_xr_deco2_ean: null,
    odin_user_log_xr_deco2_tmx: null,
    odin_user_log_xr_deco2_o2: null,
    odin_user_log_xr_deco2_he: null,
    odin_user_log_xr_deco2_start_bar: null,
    odin_user_log_xr_deco2_end_bar: null,
    odin_user_log_xr_deco2_start_psi: null,
    odin_user_log_xr_deco2_end_psi: null,
    odin_user_log_xr_deco3: null,
    odin_user_log_xr_deco3_tanktype_id: null,
    odin_user_log_xr_deco3_vol_l: null,
    odin_user_log_xr_deco3_vol_cuft: null,
    odin_user_log_xr_deco3_ean_o2: null,
    odin_user_log_xr_deco3_o2: null,
    odin_user_log_xr_deco3_he: null,
    odin_user_log_xr_deco3_start_bar: null,
    odin_user_log_xr_deco3_end_bar: null,
    odin_user_log_xr_deco3_start_psi: null,
    odin_user_log_xr_deco3_end_psi: null,
    odin_user_log_xr_sac_bottom_l: null,
    odin_user_log_xr_sac_bottom_psi: null,
    odin_user_log_xr_sac_deco_l: null,
    odin_user_log_xr_sac_deco_psi: null,

    // --- Confirmation / verification ---
    odin_user_log_divecenter_confirmed: null,
    odin_user_log_divecenter_confirmed_id: null,
    odin_user_log_divecenter_confirmed_name: null,
    odin_user_log_divecenter_confirmed_logo: null,
    odin_user_log_leader_confirmed_id: null,
    odin_user_log_leader_confirmed_name: null,
    odin_user_log_user_confirmed_id: null,
    odin_user_log_user_confirmed_name: null,
    odin_user_log_transferDate: null,
    odin_user_log_confirmed: null,
    odin_user_log_verified: null,
    timestamp: null,

    // --- Dive computer ---
    odin_user_log_diveComputer: deviceName,
    odin_user_log_diveComputerData: null,
    odin_user_log_divecomputer_id: null,
    odin_user_log_divecomputer_name: deviceName,
    odin_user_log_divecomputer_serial_nr: Header.Device.SerialNumber,
    odin_user_log_divecomputer_ble_id: null,
    odin_user_log_divecomputer_firmware: Header.Device.Info.SW,
    odin_user_log_divecomputer_manufacturer: 'Suunto',
    odin_user_log_divecomputer_ref: `Suunto ${Header.Device.Name}_${Header.Device.SerialNumber}`,
    odin_user_log_divecomputer_dive_ref: Header.DateTime,
    odin_user_log_divecomputer_imported: false,
    odin_user_log_divecomputer_raw_data_header: null,
    odin_user_log_divecomputer_raw_data_details: null,
    odin_user_log_divecomputer_max_sensor_depth: null,
    odin_user_log_divecomputer_bottomtimer: null,
    odin_user_log_divecomputer_productname: null,

    // --- Datasets ---
    odin_user_log_depthDataset: JSON.stringify(samples.map((s) => s.d)),
    odin_user_log_tempDataset: JSON.stringify(samples.map((s) => s.te)),
    odin_user_log_alarmDataset: null,
    odin_user_log_gfnowDataset: null, //JSON.stringify(samples.map((s) => s.gn)),
    odin_user_log_gfSurfDataset: JSON.stringify(samples.map((s) => s.gs)),
    odin_user_log_deepestDecoDataset: null,
    odin_user_log_tankPressureDataset: samples.some((s) => s.pressure !== undefined)
      ? JSON.stringify(samples.map((s) => s.pressure ?? null))
      : null,
    odin_user_log_freeDiveSessionCharts: null,
    odin_user_log_pressureDataset: null,
    odin_user_log_locationDataset: null,
    odin_user_log_diveSamples: JSON.stringify(samples),

    // --- Decompression ---
    odin_user_log_si_before: data.DeviceLog.Windows.reduce(
      (previous, acc) => acc.Window?.DiveRecoveryTime ?? previous,
      null as null | number,
    ),
    odin_user_log_gf_set: null,
    odin_user_log_gf_set_1: null,
    odin_user_log_gf_set_2: null,
    odin_user_log_gf_end: null,
    odin_user_log_cns_start: null,
    odin_user_log_cns_end: null,
    odin_user_log_otu_start: null,
    odin_user_log_otu_end: null,
    odin_user_log_deco_dive: null,
    odin_user_log_deco_time: null,
    odin_user_log_deco_gas: null,
    odin_user_log_deco_gas_tanktype_id: null,
    odin_user_log_deco_gas_tank_vol_l: null,
    odin_user_log_deco_gas_tank_vol_cuft: null,
    odin_user_log_deco_gas_o2: null,
    odin_user_log_deco_gas_start_bar: null,
    odin_user_log_deco_gas_end_bar: null,
    odin_user_log_deco_gas_start_psi: null,
    odin_user_log_deco_gas_end_psi: null,
    odin_user_log_alarm_fast_ascent: null,
    odin_user_log_alarm_deco_stop: null,
    odin_user_log_alarm_deco_violation: null,

    // --- SCR (semi-closed rebreather) ---
    odin_user_log_scr_unit_id: null,
    odin_user_log_scr_total_deco_time: null,
    odin_user_log_scr_sac_bailout_l: null,
    odin_user_log_scr_sac_bailout_psi: null,
    odin_user_log_scr_sac_deco_l: null,
    odin_user_log_scr_sac_deco_psi: null,
    odin_user_log_scr_bottom_tanktype_id: null,
    odin_user_log_scr_bottom_tank_vol_l: null,
    odin_user_log_scr_bottom_tank_vol_cuft: null,
    odin_user_log_scr_bottom_o2: null,
    odin_user_log_scr_bottom_setpoint: null,
    odin_user_log_scr_bottom_start_bar: null,
    odin_user_log_scr_bottom_start_psi: null,
    odin_user_log_scr_bottom_end_bar: null,
    odin_user_log_scr_bottom_end_psi: null,
    odin_user_log_scr_deco: null,
    odin_user_log_scr_deco_tanktype_id: null,
    odin_user_log_scr_deco_tank_vol_l: null,
    odin_user_log_scr_deco_tank_vol_cuft: null,
    odin_user_log_scr_deco_o2: null,
    odin_user_log_scr_deco_setpoint: null,
    odin_user_log_scr_deco_start_bar: null,
    odin_user_log_scr_deco_start_psi: null,
    odin_user_log_scr_deco_end_bar: null,
    odin_user_log_scr_deco_end_psi: null,
    odin_user_log_scr_start_time: null,
    odin_user_log_scr_end_time: null,
    odin_user_log_scr_oc: null,

    // --- CCR (closed-circuit rebreather) ---
    odin_user_log_ccr_unit_id: null,
    odin_user_log_ccr_total_deco_time: null,
    odin_user_log_ccr_sac_bailout_l: null,
    odin_user_log_ccr_sac_bailout_psi: null,
    odin_user_log_ccr_sac_deco_l: null,
    odin_user_log_ccr_sac_deco_psi: null,
    odin_user_log_ccr_bottom_tank_vol_cuft: null,
    odin_user_log_ccr_bailout01: null,
    odin_user_log_ccr_bailout01_tanktype_id: null,
    odin_user_log_ccr_bailout01_tank_vol_l: null,
    odin_user_log_ccr_bailout01_tank_vol_cuft: null,
    odin_user_log_ccr_bailout01_o2: null,
    odin_user_log_ccr_bailout01_he: null,
    odin_user_log_ccr_bailout01_start_bar: null,
    odin_user_log_ccr_bailout01_start_psi: null,
    odin_user_log_ccr_bailout01_end_bar: null,
    odin_user_log_ccr_bailout01_end_psi: null,
    odin_user_log_ccr_bailout02: null,
    odin_user_log_ccr_bailout02_tanktype_id: null,
    odin_user_log_ccr_bailout02_tank_vol_l: null,
    odin_user_log_ccr_bailout02_tank_vol_cuft: null,
    odin_user_log_ccr_bailout02_o2: null,
    odin_user_log_ccr_bailout02_he: null,
    odin_user_log_ccr_bailout02_start_bar: null,
    odin_user_log_ccr_bailout02_start_psi: null,
    odin_user_log_ccr_bailout02_end_bar: null,
    odin_user_log_ccr_bailout02_end_psi: null,
    odin_user_log_ccr_bailout03: null,
    odin_user_log_ccr_bailout03_tanktype_id: null,
    odin_user_log_ccr_bailout03_tank_vol_l: null,
    odin_user_log_ccr_bailout03_tank_vol_cuft: null,
    odin_user_log_ccr_bailout03_o2: null,
    odin_user_log_ccr_bailout03_he: null,
    odin_user_log_ccr_bailout03_start_bar: null,
    odin_user_log_ccr_bailout03_start_psi: null,
    odin_user_log_ccr_bailout03_end_bar: null,
    odin_user_log_ccr_bailout03_end_psi: null,
    odin_user_log_ccr_diluent_gas: null,
    odin_user_log_ccr_diluent_tanktype_id: null,
    odin_user_log_ccr_diluent_tank_vol_l: null,
    odin_user_log_ccr_diluent_tank_vol_cuft: null,
    odin_user_log_ccr_diluent_o2: null,
    odin_user_log_ccr_diluent_he: null,
    odin_user_log_ccr_diluent_start_bar: null,
    odin_user_log_ccr_diluent_start_psi: null,
    odin_user_log_ccr_diluent_end_bar: null,
    odin_user_log_ccr_diluent_end_psi: null,
    odin_user_log_ccr_o2_tanktype_id: null,
    odin_user_log_ccr_o2_tank_vol_l: null,
    odin_user_log_ccr_o2_tank_vol_cuft: null,
    odin_user_log_ccr_o2_start_bar: null,
    odin_user_log_ccr_o2_start_psi: null,
    odin_user_log_ccr_o2_end_bar: null,
    odin_user_log_ccr_o2_end_psi: null,

    // --- Freediving (additional) ---
    odin_user_log_frd_suit: null,
    odin_user_log_frd_NOTES: null,
    odin_user_log_frdwater_body_id: null,
    odin_user_log_frddisc: null,

    // --- Linked / extended ---
    log_linked_facility_id: null,
    log_linked_brevet_rule_id: null,
    odin_user_log_gearconfiguration_id: null,
    log_extended_data_cleanup_weight_kg: null,
    log_extended_data_cleanup_weight_lb: null,

    // --- GPS ---
    odin_user_log_pos_start_latitude: latitude,
    odin_user_log_pos_start_longitude: longitude,
    odin_user_log_pos_end_latitude: null,
    odin_user_log_pos_end_longitude: null,

    // --- Apple Watch ---
    odin_user_log_apple_watch: 0,
    odin_user_log_apple_watch_log_id: null,
    odin_user_log_apple_watch_id: null,
    odin_user_log_apple_watch_app_version: null,
    odin_user_log_apple_watch_os_version: null,

    // --- Sensor datasets ---
    odin_user_log_heartRateMin: null,
    odin_user_log_heartRateMax: null,
    odin_user_log_heartRateAvg: null,
    odin_user_log_heartRateDataset: null,
    odin_user_log_batteryLevelDataset: null,
    odin_user_log_batteryLevelStart: null,
    odin_user_log_batteryLevelEnd: null,
    odin_user_log_accelerationDataset: null,
    odin_user_log_gyroDataset: null,

    // --- Misc ---
    odin_user_log_dive_on_own_risk: 0,
    odin_user_log_dive_on_own_risk_os_app: null,
    odin_user_log_housing_local_dive_media: null,
  } satisfies CreateDive;
}
