const CACHE = globalThis.__MONDE_CACHE || (globalThis.__MONDE_CACHE = new Map());

const OPENSKY_BOXES = [
  { name: "ameriques", lamin: -60, lomin: -170, lamax: 75, lomax: -25 },
  { name: "europe_afrique", lamin: -40, lomin: -25, lamax: 72, lomax: 60 },
  { name: "asie", lamin: -5, lomin: 60, lamax: 75, lomax: 150 },
  { name: "oceanie", lamin: -50, lomin: 110, lamax: 10, lomax: 180 }
];

const GDELT_QUERY_BY_TYPE = {
  conflicts: "(clashes OR shelling OR fighting OR airstrike OR offensive)",
  protests: "(protest OR protests OR demonstration OR rally OR unrest)"
};

function readZipText(buffer) {
  const AdmZip = require("adm-zip");
  const zip = new AdmZip(buffer);
  const entries = zip.getEntries();
  if (!entries.length) return "";
  return entries[0].getData().toString("utf8");
}

function sendJson(res, data, statusCode = 200) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
  res.end(JSON.stringify(data));
}

async function fetchJson(url, timeoutMs = 30000) {
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "MondeDashboard/1.0"
    },
    cache: "no-store",
    signal: AbortSignal.timeout(timeoutMs)
  });
  if (!res.ok) {
    throw new Error("HTTP " + res.status + " for " + url);
  }
  return res.json();
}

async function fetchBuffer(url, timeoutMs = 45000) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "MondeDashboard/1.0"
    },
    cache: "no-store",
    signal: AbortSignal.timeout(timeoutMs)
  });
  if (!res.ok) {
    throw new Error("HTTP " + res.status + " for " + url);
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

function getCached(key) {
  const entry = CACHE.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    CACHE.delete(key);
    return null;
  }
  return entry.data;
}

function setCached(key, data, ttlMs) {
  CACHE.set(key, {
    data,
    expiresAt: Date.now() + ttlMs
  });
  return data;
}

function getIntValue(value) {
  const n = parseInt(String(value || ""), 10);
  return Number.isFinite(n) ? n : 0;
}

function getDoubleValue(value) {
  const n = parseFloat(String(value || "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function convertGdeltTimestamp(value) {
  const text = String(value || "");
  if (text.length < 14) return Date.now();
  const iso = `${text.slice(0, 4)}-${text.slice(4, 6)}-${text.slice(6, 8)}T${text.slice(8, 10)}:${text.slice(10, 12)}:${text.slice(12, 14)}Z`;
  const ts = Date.parse(iso);
  return Number.isFinite(ts) ? ts : Date.now();
}

async function getGdeltLatestExportUrl() {
  const listUrls = [
    "https://data.gdeltproject.org/gdeltv2/lastupdate-translation.txt",
    "https://data.gdeltproject.org/gdeltv2/lastupdate.txt",
    "https://data.gdeltproject.org/gdeltv2/masterfilelist-translation.txt"
  ];

  for (const listUrl of listUrls) {
    try {
      const res = await fetch(listUrl, {
        cache: "no-store",
        signal: AbortSignal.timeout(15000)
      });
      if (!res.ok) continue;
      const text = await res.text();
      const lines = text.split(/\r?\n/).filter((line) => line.includes(".export.CSV.zip"));
      if (!lines.length) continue;
      const line = listUrl.includes("masterfile") ? lines[lines.length - 1] : lines[0];
      const parts = line.trim().split(/\s+/);
      if (parts.length) return parts[parts.length - 1];
    } catch {}
  }

  throw new Error("Aucun export GDELT disponible");
}

async function getGdeltRecentExportUrls(count = 8) {
  const latest = await getGdeltLatestExportUrl();
  const match = latest.match(/(\d{14})\.export\.CSV\.zip/);
  if (!match) return [latest];

  const stamp = match[1];
  const startIso = `${stamp.slice(0, 4)}-${stamp.slice(4, 6)}-${stamp.slice(6, 8)}T${stamp.slice(8, 10)}:${stamp.slice(10, 12)}:${stamp.slice(12, 14)}Z`;
  const start = Date.parse(startIso);
  if (!Number.isFinite(start)) return [latest];

  const prefix = latest.slice(0, latest.length - (stamp.length + ".export.CSV.zip".length));
  const urls = [];
  for (let i = 0; i < count; i += 1) {
    const ts = new Date(start - i * 15 * 60 * 1000);
    const y = ts.getUTCFullYear();
    const m = String(ts.getUTCMonth() + 1).padStart(2, "0");
    const d = String(ts.getUTCDate()).padStart(2, "0");
    const hh = String(ts.getUTCHours()).padStart(2, "0");
    const mm = String(ts.getUTCMinutes()).padStart(2, "0");
    const ss = String(ts.getUTCSeconds()).padStart(2, "0");
    urls.push(`${prefix}${y}${m}${d}${hh}${mm}${ss}.export.CSV.zip`);
  }
  return urls;
}

async function getOpenSkyStates() {
  const cacheKey = "opensky-states";
  const cached = getCached(cacheKey);
  if (cached) return cached;

  async function fetchOpenSkyPayload(target) {
    const attempts = [
      async () => fetchJson(target, 25000),
      async () => fetchJson("https://api.allorigins.win/raw?url=" + encodeURIComponent(target), 25000),
      async () => {
        const wrapper = await fetchJson("https://api.allorigins.win/get?url=" + encodeURIComponent(target), 25000);
        if (!wrapper?.contents) throw new Error("AllOrigins n'a renvoye aucun contenu");
        return JSON.parse(wrapper.contents);
      }
    ];

    let lastError = null;
    for (const attempt of attempts) {
      try {
        const data = await attempt();
        if (data && Array.isArray(data.states)) return data;
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError || new Error("OpenSky indisponible");
  }

  const target = "https://opensky-network.org/api/states/all";
  const attempts = [
    async () => fetchOpenSkyPayload(target),
    async () => {
      const settled = await Promise.allSettled(
        OPENSKY_BOXES.map((box) => {
          const query = new URLSearchParams({
            lamin: String(box.lamin),
            lomin: String(box.lomin),
            lamax: String(box.lamax),
            lomax: String(box.lomax)
          });
          return fetchOpenSkyPayload(target + "?" + query.toString());
        })
      );

      const byIcao = new Map();
      settled.forEach((result) => {
        if (result.status !== "fulfilled") return;
        const states = Array.isArray(result.value?.states) ? result.value.states : [];
        states.forEach((state) => {
          const icao = state?.[0] || Math.random().toString(36).slice(2);
          const prev = byIcao.get(icao);
          if (!prev || (state?.[4] || 0) > (prev?.[4] || 0)) {
            byIcao.set(icao, state);
          }
        });
      });

      if (!byIcao.size) throw new Error("Aucune zone OpenSky n'a repondu");
      return { time: Math.floor(Date.now() / 1000), states: [...byIcao.values()] };
    }
  ];

  let lastError = null;
  for (const attempt of attempts) {
    try {
      const data = await attempt();
      if (data && Array.isArray(data.states)) {
        return setCached(cacheKey, data, 60 * 1000);
      }
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("OpenSky indisponible");
}

async function getGdeltGeoFallback(type, limit) {
  const query = GDELT_QUERY_BY_TYPE[type];
  if (!query) throw new Error("Type GDELT invalide");

  const target = "https://api.gdeltproject.org/api/v2/geo/geo?query=" +
    encodeURIComponent(query) +
    "&mode=pointdata&format=geojson&TIMESPAN=24h&MAXPOINTS=" + limit;

  const attempts = [
    async () => fetchJson(target, 25000),
    async () => fetchJson("https://api.allorigins.win/raw?url=" + encodeURIComponent(target), 25000),
    async () => {
      const wrapper = await fetchJson("https://api.allorigins.win/get?url=" + encodeURIComponent(target), 25000);
      if (!wrapper?.contents) throw new Error("AllOrigins n'a renvoye aucun contenu");
      return JSON.parse(wrapper.contents);
    }
  ];

  let lastError = null;
  for (const attempt of attempts) {
    try {
      const json = await attempt();
      if (json && Array.isArray(json.features)) return json;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error("Flux GDELT geo indisponible");
}

async function getGdeltEventFeed(type, limit) {
  const cacheKey = `gdelt-${type}-${limit}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  if (!["conflicts", "protests"].includes(type)) {
    throw new Error("Type GDELT invalide");
  }

  try {
    const quick = await getGdeltGeoFallback(type, limit);
    if (quick && Array.isArray(quick.features) && quick.features.length) {
      return setCached(cacheKey, quick, 5 * 60 * 1000);
    }
  } catch (error) {
    return setCached(cacheKey, {
      type: "FeatureCollection",
      features: [],
      meta: {
        source: "gdelt-geo-fallback",
        unavailable: true,
        message: error.message
      }
    }, 60 * 1000);
  }

  return setCached(cacheKey, {
    type: "FeatureCollection",
    features: [],
    meta: {
      source: "gdelt-geo-fallback",
      unavailable: false,
      message: "0 evenement remonte par le flux"
    }
  }, 60 * 1000);
}

module.exports = {
  sendJson,
  getOpenSkyStates,
  getGdeltEventFeed
};
const CACHE = globalThis.__MONDE_CACHE || (globalThis.__MONDE_CACHE = new Map());

const OPENSKY_BOXES = [
  { name: "ameriques", lamin: -60, lomin: -170, lamax: 75, lomax: -25 },
  { name: "europe_afrique", lamin: -40, lomin: -25, lamax: 72, lomax: 60 },
  { name: "asie", lamin: -5, lomin: 60, lamax: 75, lomax: 150 },
  { name: "oceanie", lamin: -50, lomin: 110, lamax: 10, lomax: 180 }
];

const GDELT_QUERY_BY_TYPE = {
  conflicts: "(clashes OR shelling OR fighting OR airstrike OR offensive)",
  protests: "(protest OR protests OR demonstration OR rally OR unrest)"
};

function readZipText(buffer) {
  const AdmZip = require("adm-zip");
  const zip = new AdmZip(buffer);
  const entries = zip.getEntries();
  if (!entries.length) return "";
  return entries[0].getData().toString("utf8");
}

function sendJson(res, data, statusCode = 200) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
  res.end(JSON.stringify(data));
}

async function fetchJson(url, timeoutMs = 30000) {
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "MondeDashboard/1.0"
    },
    cache: "no-store",
    signal: AbortSignal.timeout(timeoutMs)
  });
  if (!res.ok) {
    throw new Error("HTTP " + res.status + " for " + url);
  }
  return res.json();
}

async function fetchBuffer(url, timeoutMs = 45000) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "MondeDashboard/1.0"
    },
    cache: "no-store",
    signal: AbortSignal.timeout(timeoutMs)
  });
  if (!res.ok) {
    throw new Error("HTTP " + res.status + " for " + url);
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

function getCached(key) {
  const entry = CACHE.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    CACHE.delete(key);
    return null;
  }
  return entry.data;
}

function setCached(key, data, ttlMs) {
  CACHE.set(key, {
    data,
    expiresAt: Date.now() + ttlMs
  });
  return data;
}

function getIntValue(value) {
  const n = parseInt(String(value || ""), 10);
  return Number.isFinite(n) ? n : 0;
}

function getDoubleValue(value) {
  const n = parseFloat(String(value || "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function convertGdeltTimestamp(value) {
  const text = String(value || "");
  if (text.length < 14) return Date.now();
  const iso = `${text.slice(0, 4)}-${text.slice(4, 6)}-${text.slice(6, 8)}T${text.slice(8, 10)}:${text.slice(10, 12)}:${text.slice(12, 14)}Z`;
  const ts = Date.parse(iso);
  return Number.isFinite(ts) ? ts : Date.now();
}

async function getGdeltLatestExportUrl() {
  const listUrls = [
    "https://data.gdeltproject.org/gdeltv2/lastupdate-translation.txt",
    "https://data.gdeltproject.org/gdeltv2/lastupdate.txt",
    "https://data.gdeltproject.org/gdeltv2/masterfilelist-translation.txt"
  ];

  for (const listUrl of listUrls) {
    try {
      const res = await fetch(listUrl, {
        cache: "no-store",
        signal: AbortSignal.timeout(15000)
      });
      if (!res.ok) continue;
      const text = await res.text();
      const lines = text.split(/\r?\n/).filter((line) => line.includes(".export.CSV.zip"));
      if (!lines.length) continue;
      const line = listUrl.includes("masterfile") ? lines[lines.length - 1] : lines[0];
      const parts = line.trim().split(/\s+/);
      if (parts.length) return parts[parts.length - 1];
    } catch {}
  }

  throw new Error("Aucun export GDELT disponible");
}

async function getGdeltRecentExportUrls(count = 8) {
  const latest = await getGdeltLatestExportUrl();
  const match = latest.match(/(\d{14})\.export\.CSV\.zip/);
  if (!match) return [latest];

  const stamp = match[1];
  const startIso = `${stamp.slice(0, 4)}-${stamp.slice(4, 6)}-${stamp.slice(6, 8)}T${stamp.slice(8, 10)}:${stamp.slice(10, 12)}:${stamp.slice(12, 14)}Z`;
  const start = Date.parse(startIso);
  if (!Number.isFinite(start)) return [latest];

  const prefix = latest.slice(0, latest.length - (stamp.length + ".export.CSV.zip".length));
  const urls = [];
  for (let i = 0; i < count; i += 1) {
    const ts = new Date(start - i * 15 * 60 * 1000);
    const y = ts.getUTCFullYear();
    const m = String(ts.getUTCMonth() + 1).padStart(2, "0");
    const d = String(ts.getUTCDate()).padStart(2, "0");
    const hh = String(ts.getUTCHours()).padStart(2, "0");
    const mm = String(ts.getUTCMinutes()).padStart(2, "0");
    const ss = String(ts.getUTCSeconds()).padStart(2, "0");
    urls.push(`${prefix}${y}${m}${d}${hh}${mm}${ss}.export.CSV.zip`);
  }
  return urls;
}

async function getOpenSkyStates() {
  const cacheKey = "opensky-states";
  const cached = getCached(cacheKey);
  if (cached) return cached;

  async function fetchOpenSkyPayload(target) {
    const attempts = [
      async () => fetchJson(target, 25000),
      async () => fetchJson("https://api.allorigins.win/raw?url=" + encodeURIComponent(target), 25000),
      async () => {
        const wrapper = await fetchJson("https://api.allorigins.win/get?url=" + encodeURIComponent(target), 25000);
        if (!wrapper?.contents) throw new Error("AllOrigins n'a renvoye aucun contenu");
        return JSON.parse(wrapper.contents);
      }
    ];

    let lastError = null;
    for (const attempt of attempts) {
      try {
        const data = await attempt();
        if (data && Array.isArray(data.states)) return data;
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError || new Error("OpenSky indisponible");
  }

  const target = "https://opensky-network.org/api/states/all";
  const attempts = [
    async () => fetchOpenSkyPayload(target),
    async () => {
      const settled = await Promise.allSettled(
        OPENSKY_BOXES.map((box) => {
          const query = new URLSearchParams({
            lamin: String(box.lamin),
            lomin: String(box.lomin),
            lamax: String(box.lamax),
            lomax: String(box.lomax)
          });
          return fetchOpenSkyPayload(target + "?" + query.toString());
        })
      );

      const byIcao = new Map();
      settled.forEach((result) => {
        if (result.status !== "fulfilled") return;
        const states = Array.isArray(result.value?.states) ? result.value.states : [];
        states.forEach((state) => {
          const icao = state?.[0] || Math.random().toString(36).slice(2);
          const prev = byIcao.get(icao);
          if (!prev || (state?.[4] || 0) > (prev?.[4] || 0)) {
            byIcao.set(icao, state);
          }
        });
      });

      if (!byIcao.size) throw new Error("Aucune zone OpenSky n'a repondu");
      return { time: Math.floor(Date.now() / 1000), states: [...byIcao.values()] };
    }
  ];

  let lastError = null;
  for (const attempt of attempts) {
    try {
      const data = await attempt();
      if (data && Array.isArray(data.states)) {
        return setCached(cacheKey, data, 60 * 1000);
      }
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("OpenSky indisponible");
}

async function getGdeltGeoFallback(type, limit) {
  const query = GDELT_QUERY_BY_TYPE[type];
  if (!query) throw new Error("Type GDELT invalide");

  const target = "https://api.gdeltproject.org/api/v2/geo/geo?query=" +
    encodeURIComponent(query) +
    "&mode=pointdata&format=geojson&TIMESPAN=24h&MAXPOINTS=" + limit;

  const attempts = [
    async () => fetchJson(target, 25000),
    async () => fetchJson("https://api.allorigins.win/raw?url=" + encodeURIComponent(target), 25000),
    async () => {
      const wrapper = await fetchJson("https://api.allorigins.win/get?url=" + encodeURIComponent(target), 25000);
      if (!wrapper?.contents) throw new Error("AllOrigins n'a renvoye aucun contenu");
      return JSON.parse(wrapper.contents);
    }
  ];

  let lastError = null;
  for (const attempt of attempts) {
    try {
      const json = await attempt();
      if (json && Array.isArray(json.features)) return json;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error("Flux GDELT geo indisponible");
}

async function getGdeltEventFeed(type, limit) {
  const cacheKey = `gdelt-${type}-${limit}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  if (!["conflicts", "protests"].includes(type)) {
    throw new Error("Type GDELT invalide");
  }

  try {
    const quick = await getGdeltGeoFallback(type, limit);
    if (quick && Array.isArray(quick.features) && quick.features.length) {
      return setCached(cacheKey, quick, 5 * 60 * 1000);
    }
  } catch (error) {
    return setCached(cacheKey, {
      type: "FeatureCollection",
      features: [],
      meta: {
        source: "gdelt-geo-fallback",
        unavailable: true,
        message: error.message
      }
    }, 60 * 1000);
  }

  return setCached(cacheKey, {
    type: "FeatureCollection",
    features: [],
    meta: {
      source: "gdelt-geo-fallback",
      unavailable: false,
      message: "0 evenement remonte par le flux"
    }
  }, 60 * 1000);
}

module.exports = {
  sendJson,
  getOpenSkyStates,
  getGdeltEventFeed
};
