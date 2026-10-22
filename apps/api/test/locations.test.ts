import { describe, expect, it } from "vitest";
import { startTestApp } from "./support.ts";

const t = await startTestApp();

describe("GET /locations", () => {
  it("lists the signed-in User's Organization's Locations by name, and no one else's", async () => {
    const larkspur = await t.scenario.organization({
      locations: [
        {
          name: "Valencia St",
          city: "San Francisco",
          state: "CA",
          timeZone: "America/Los_Angeles",
        },
        { name: "Court St", city: "Brooklyn", state: "NY", timeZone: "America/New_York" },
      ],
    });
    await t.scenario.organization({ locations: [{ name: "Pearl St" }] });

    const api = await t.signedInAs(larkspur.orgAdmin);
    const { data, response } = await api.GET("/locations");

    expect(response.status).toBe(200);
    expect(data?.locations).toEqual([
      {
        id: expect.any(String),
        name: "Court St",
        city: "Brooklyn",
        state: "NY",
        timeZone: "America/New_York",
      },
      {
        id: expect.any(String),
        name: "Valencia St",
        city: "San Francisco",
        state: "CA",
        timeZone: "America/Los_Angeles",
      },
    ]);
  });
});

describe("GET /locations/{locationId}", () => {
  it("returns one of the Organization's own Locations", async () => {
    const org = await t.scenario.organization({
      locations: [{ name: "Lake Ave", city: "Pasadena", state: "CA" }],
    });
    const [lakeAve] = org.locations;
    if (!lakeAve) throw new Error("scenario created no Location");

    const api = await t.signedInAs(org.orgAdmin);
    const { data, response } = await api.GET("/locations/{locationId}", {
      params: { path: { locationId: lakeAve.id } },
    });

    expect(response.status).toBe(200);
    expect(data).toMatchObject({ id: lakeAve.id, name: "Lake Ave", city: "Pasadena", state: "CA" });
  });

  it("answers 404 for another Organization's Location, as if it did not exist", async () => {
    const mine = await t.scenario.organization();
    const theirs = await t.scenario.organization({ locations: 1 });
    const [theirLocation] = theirs.locations;
    if (!theirLocation) throw new Error("scenario created no Location");

    const api = await t.signedInAs(mine.orgAdmin);
    const { error, response } = await api.GET("/locations/{locationId}", {
      params: { path: { locationId: theirLocation.id } },
    });

    expect(response.status).toBe(404);
    expect(error).toEqual({ error: { code: "not_found", message: expect.any(String) } });
  });

  it("answers 400 for an id that is not a UUID", async () => {
    const org = await t.scenario.organization();
    const api = await t.signedInAs(org.orgAdmin);

    const { response } = await api.GET("/locations/{locationId}", {
      params: { path: { locationId: "not-a-uuid" } },
    });

    expect(response.status).toBe(400);
  });
});
