// --- Suunto Types ---

export interface SuuntoDeviceLog {
  DeviceLog: {
    Header: SuuntoHeader;
    Samples: SuuntoSample[];
    Device: SuuntoDevice;
  };
}

export interface SuuntoHeader {
  DateTime: string;
  Depth: { Max: number };
  DepthAverage: number;
  DiveTime: number;
  Temperature: { Max: number; Min: number };
  Notes: string;
  Device: SuuntoDevice;
}

export interface SuuntoDevice {
  Name: string;
  SerialNumber: string;
  Info: { SW: string; HW: string };
}

export interface SuuntoSample {
  TimeISO8601: string;
  Depth?: number;
  Temperature?: number;
  DiveRouteOrigin?: {
    Latitude: number;
    Longitude: number;
    Altitude: number;
  };
  DiveEvents?: {
    DiveStatus?: boolean;
    DiveState?: string;
    GasSwitch?: { GasNumber: number };
  };
  Cylinders?: {
    GasNumber: number;
    GasTime: number;
    Pressure: number | null;
    Pressure2: number | null;
    Ventilation: number;
  }[];
  Ceiling?: number;
  AmbientIlluminance?: number;
  AbsPressure?: number;
  SurfacePressure?: number;
  BatteryCharge?: number;
  DeviceInternalTemperature?: number;
  NoDecTime?: number;
  VerticalSpeed?: number;
}

// --- Helpers ---

export function kelvinToCelsius(k: number): number {
  return Math.round((k - 273.15) * 100) / 100;
}

export function celsiusToFahrenheit(c: number): number {
  return (c * 9) / 5 + 32;
}

export function metersToFeet(m: number): number {
  return m * 3.28084;
}

export function barToPsi(bar: number): number {
  return bar * 14.5038;
}
