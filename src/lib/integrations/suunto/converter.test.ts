import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { describe, expect, it, test } from "vitest"
import {
  barToPsi,
  celsiusToFahrenheit,
  kelvinToCelsius,
  metersToFeet,
} from "../../units"
import { convertSuuntoToSSI } from "./converter"

describe("helpers", () => {
  test("kelvinToCelsius", () => {
    expect(kelvinToCelsius(273.15)).toBeCloseTo(0)
    expect(kelvinToCelsius(285.5)).toBeCloseTo(12.35)
    expect(kelvinToCelsius(373.15)).toBeCloseTo(100)
  })

  test("celsiusToFahrenheit", () => {
    expect(celsiusToFahrenheit(0)).toBeCloseTo(32)
    expect(celsiusToFahrenheit(100)).toBeCloseTo(212)
    expect(celsiusToFahrenheit(12.35)).toBeCloseTo(54.23)
  })

  test("metersToFeet", () => {
    expect(metersToFeet(1)).toBeCloseTo(3.28084)
    expect(metersToFeet(7.08)).toBeCloseTo(23.228, 2)
    expect(metersToFeet(0)).toBe(0)
  })

  test("barToPsi", () => {
    expect(barToPsi(1)).toBeCloseTo(14.5038)
    expect(barToPsi(200)).toBeCloseTo(2900.76)
    expect(barToPsi(0)).toBe(0)
  })
})

describe("convertSuuntoToSSI", () => {
  it.each(["2.json", "3.json", "4.json", "5.json", "6.json"])(
    "should convert dive %s",
    async (f) => {
      const file = JSON.parse(
        await readFile(
          join(
            import.meta.dirname,
            "..",
            "..",
            "..",
            "..",
            "samples",
            "suunto",
            f
          ),
          "utf-8"
        )
      )

      expect(convertSuuntoToSSI(file)).toMatchSnapshot()
    }
  )
})
