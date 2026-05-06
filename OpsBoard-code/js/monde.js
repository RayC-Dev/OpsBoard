const MONDE = {
  initialized: false,
  renderReady: false,
  loading: false,
  filters: {
    flights: true,
    disasters: true,
    weather: true,
    conflicts: true,
    protests: true
  },
  camera: {
    yaw: 0.65,
    pitch: 0.12,
    zoom: 1
  },
  drag: {
    active: false,
    x: 0,
    y: 0
  },
  data: {
    flights: [],
    disasters: [],
    weather: [],
    conflicts: [],
    protests: []
  },
  sources: {
    flights: { name: "Trafic aerien mondial", status: "idle", message: "En attente", updatedAt: null },
    disasters: { name: "Seismes, volcans et incendies", status: "idle", message: "En attente", updatedAt: null },
    weather: { name: "Meteo extreme mondiale", status: "idle", message: "En attente", updatedAt: null },
    conflicts: { name: "Veille conflits", status: "idle", message: "En attente", updatedAt: null },
    protests: { name: "Veille manifestations", status: "idle", message: "En attente", updatedAt: null }
  },
  pickedItem: null,
  hoverItem: null,
  lastSync: null
};

const MONDE_COLORS = {
  flights: "#60a5fa",
  disasters: "#34d399",
  weather: "#fde047",
  conflicts: "#f87171",
  protests: "#c084fc"
};

const MONDE_CONTINENTS = [
  {
    name: "Amerique du Nord",
    label: [47, -102],
    points: [[74,-168],[71,-155],[67,-144],[63,-136],[60,-129],[56,-127],[53,-124],[49,-124],[45,-123],[41,-124],[38,-122],[34,-118],[31,-114],[27,-111],[24,-107],[23,-100],[25,-94],[27,-88],[31,-84],[35,-81],[40,-77],[45,-72],[49,-66],[55,-60],[61,-64],[66,-76],[70,-92],[73,-110],[74,-132],[75,-152]]
  },
  {
    name: "Amerique du Sud",
    label: [-18, -60],
    points: [[12,-81],[10,-78],[7,-76],[2,-78],[-4,-79],[-10,-78],[-15,-74],[-22,-72],[-30,-70],[-39,-72],[-46,-71],[-53,-68],[-56,-61],[-54,-54],[-49,-49],[-41,-44],[-33,-40],[-23,-40],[-13,-45],[-5,-50],[2,-55],[7,-63],[10,-71]]
  },
  {
    name: "Europe",
    label: [51, 14],
    points: [[71,-10],[69,2],[66,10],[63,18],[60,28],[56,33],[52,28],[49,24],[47,18],[45,12],[44,5],[46,-1],[50,-5],[56,-9],[62,-10]]
  },
  {
    name: "Afrique",
    label: [7, 20],
    points: [[37,-16],[35,-7],[33,0],[31,7],[29,15],[24,25],[16,33],[6,38],[-5,41],[-17,35],[-28,31],[-35,25],[-34,15],[-30,9],[-24,12],[-16,14],[-7,9],[3,3],[11,-1],[20,-7],[29,-12]]
  },
  {
    name: "Asie",
    label: [34, 92],
    points: [[78,30],[74,44],[72,58],[70,74],[69,89],[66,104],[61,118],[57,130],[52,140],[46,150],[38,145],[31,136],[24,126],[19,118],[14,108],[8,101],[5,94],[7,84],[14,74],[19,65],[27,58],[35,49],[45,42],[56,37],[66,34]]
  },
  {
    name: "Arabie",
    label: [22, 46],
    points: [[31,35],[28,42],[25,50],[20,55],[15,53],[12,46],[16,41],[22,39],[27,37]]
  },
  {
    name: "Inde",
    label: [22, 79],
    points: [[29,68],[27,76],[24,83],[20,88],[14,84],[9,78],[12,72],[18,70],[24,69]]
  },
  {
    name: "Asie du Sud-Est",
    label: [10, 108],
    points: [[22,96],[18,104],[15,111],[10,117],[5,118],[1,113],[-2,108],[2,103],[8,99],[15,96]]
  },
  {
    name: "Japon",
    label: [36, 138],
    points: [[44,141],[40,145],[36,143],[33,139],[35,135],[39,136]]
  },
  {
    name: "Oceanie",
    label: [-24, 134],
    points: [[-11,113],[-15,119],[-19,127],[-23,135],[-27,143],[-33,151],[-40,148],[-42,139],[-39,129],[-34,120],[-27,114],[-19,112]]
  },
  {
    name: "Groenland",
    label: [73, -41],
    points: [[82,-68],[81,-48],[78,-28],[73,-20],[67,-30],[63,-45],[67,-58],[75,-64]]
  },
  {
    name: "Royaume-Uni",
    label: [55, -3],
    points: [[59,-8],[57,-3],[54,1],[51,-2],[52,-6],[56,-7]]
  },
  {
    name: "Madagascar",
    label: [-20, 47],
    points: [[-13,49],[-18,50],[-23,49],[-26,47],[-22,44],[-16,45]]
  }
];

const MONDE_COUNTRY_CENTROIDS = {
  /* Africa */
  AGO:[-11.20,17.87], BDI:[-3.37,29.92], BEN:[9.31,2.32], BFA:[12.24,-1.56],
  BWA:[-22.33,24.68], CAF:[6.61,20.94], CIV:[7.54,-5.55], CMR:[7.37,12.35],
  COD:[-2.88,23.65], COG:[-0.23,15.83], DJI:[11.83,42.59], DZA:[28.03,1.66],
  EGY:[26.82,30.80], ERI:[15.18,39.78], ETH:[9.15,40.49], GAB:[-0.80,11.61],
  GHA:[7.95,-1.02], GIN:[11.74,-15.90], GMB:[13.44,-15.31], GNB:[11.80,-15.18],
  GNQ:[1.65,10.27], KEN:[-0.02,37.91], LBR:[6.43,-9.43], LBY:[26.33,17.23],
  LSO:[-29.61,28.23], MAR:[31.79,-7.09], MDG:[-18.77,46.87], MLI:[17.57,-3.99],
  MOZ:[-18.67,35.53], MRT:[21.01,-10.94], MUS:[-20.35,57.55], MWI:[-13.25,34.30],
  NAM:[-22.96,18.49], NER:[17.61,8.08], NGA:[9.08,8.67], RWA:[-1.94,29.87],
  SDN:[12.86,30.22], SEN:[14.50,-14.45], SLE:[8.46,-11.78], SOM:[5.15,46.20],
  SSD:[6.88,31.31], SWZ:[-26.52,31.47], TCD:[15.45,18.73], TGO:[8.62,0.82],
  TUN:[33.89,9.54], TZA:[-6.37,34.89], UGA:[1.37,32.29], ZAF:[-30.56,22.94],
  ZMB:[-13.13,27.85], ZWE:[-19.02,29.15],
  /* Americas */
  ARG:[-38.42,-63.62], BOL:[-16.29,-63.59], BRA:[-14.24,-51.93], CHL:[-35.68,-71.54],
  COL:[4.57,-74.30], CRI:[9.75,-83.75], CUB:[21.52,-77.78], DOM:[18.74,-70.16],
  ECU:[-1.83,-78.18], GTM:[15.78,-90.23], GUY:[4.86,-58.93], HND:[15.20,-86.24],
  HTI:[18.97,-72.29], JAM:[18.11,-77.30], MEX:[23.63,-102.55], NIC:[12.87,-85.21],
  PAN:[8.54,-80.78], PER:[-9.19,-75.02], PRY:[-23.44,-58.44], SLV:[13.79,-88.90],
  SUR:[3.92,-56.03], TTO:[10.69,-61.22], URY:[-32.52,-55.77], USA:[37.09,-95.71],
  VEN:[6.42,-66.59], CAN:[56.13,-106.35],
  /* Asia */
  AFG:[33.94,67.71], ARE:[23.42,53.85], ARM:[40.07,45.04], AZE:[40.14,47.58],
  BGD:[23.68,90.36], BHR:[26.02,50.56], BRN:[4.54,114.73], BTN:[27.51,90.43],
  CHN:[35.86,104.19], CYP:[35.13,33.43], GEO:[42.32,43.36], IDN:[-0.79,113.92],
  IND:[20.59,78.96], IRN:[32.43,53.69], IRQ:[33.22,43.68], ISR:[31.05,34.85],
  JOR:[30.59,36.24], JPN:[36.20,138.25], KAZ:[48.02,66.92], KGZ:[41.21,74.77],
  KHM:[12.57,104.99], KOR:[35.91,127.77], KWT:[29.31,47.48], LAO:[19.86,102.50],
  LBN:[33.85,35.86], LKA:[7.87,80.77], MMR:[21.92,95.96], MNG:[46.86,103.85],
  MYS:[4.21,101.98], NPL:[28.39,84.12], OMN:[21.51,55.92], PAK:[30.38,69.35],
  PHL:[12.88,121.77], PRK:[40.34,127.51], PSE:[31.95,35.23], QAT:[25.35,51.18],
  SAU:[23.89,45.08], SGP:[1.35,103.82], SYR:[34.80,38.99], TJK:[38.86,71.28],
  TKM:[38.97,59.56], TLS:[-8.87,125.73], TWN:[23.70,121.00], UZB:[41.38,64.59],
  VNM:[14.06,108.28], YEM:[15.55,48.52],
  /* Europe */
  ALB:[41.15,20.17], AUT:[47.52,14.55], BEL:[50.50,4.47], BGR:[42.73,25.49],
  BIH:[43.92,17.68], BLR:[53.71,27.95], CHE:[46.82,8.23], CZE:[49.82,15.47],
  DEU:[51.17,10.45], DNK:[56.26,9.50], ESP:[40.46,-3.75], EST:[58.60,25.01],
  FIN:[61.92,25.75], FRA:[46.23,2.21], GBR:[55.38,-3.44], GRC:[39.07,21.82],
  HRV:[45.10,15.20], HUN:[47.16,19.50], IRL:[53.41,-8.24], ITA:[41.87,12.57],
  LTU:[55.17,23.88], LVA:[56.88,24.60], MDA:[47.41,28.37], MKD:[41.61,21.75],
  MNE:[42.71,19.37], NLD:[52.13,5.29], NOR:[60.47,8.47], POL:[51.92,19.15],
  PRT:[39.40,-8.22], ROU:[45.94,24.97], RUS:[61.52,105.32], SRB:[44.02,21.01],
  SVK:[48.67,19.70], SVN:[46.15,14.99], SWE:[60.13,18.64], TUR:[38.96,35.24],
  UKR:[48.38,31.17], XKX:[42.60,20.90],
  /* Oceania */
  AUS:[-25.27,133.78], FJI:[-17.71,178.06], NZL:[-40.90,174.89], PNG:[-6.31,143.96],
  SLB:[-9.65,160.16], VUT:[-15.38,166.96]
};

/* ── Geo data for proper continent rendering ── */
let MONDE_GEO = null;

async function loadWorldGeo() {
  if (MONDE_GEO) return;
  try {
    // Load topojson-client if not already present
    if (!window.topojson) {
      await new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = "https://cdn.jsdelivr.net/npm/topojson-client@3/dist/topojson-client.min.js";
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });
    }
    const topo = await fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then(r => r.json());
    MONDE_GEO = window.topojson.feature(topo, topo.objects.countries);
  } catch (e) {
    console.warn("[monde] Geo load failed, falling back to pseudo-continents:", e);
  }
}

function drawGeoContents(ctx, cx, cy, radius) {
  if (!MONDE_GEO) {
    drawPseudoContinents(ctx, cx, cy, radius);
    return;
  }

  ctx.fillStyle = "rgba(96, 148, 70, 0.56)";
  ctx.strokeStyle = "rgba(195, 240, 170, 0.24)";
  ctx.lineWidth = 0.65;

  (MONDE_GEO.features || []).forEach(feature => {
    const geom = feature.geometry;
    if (!geom) return;
    const polys = geom.type === "Polygon"
      ? [geom.coordinates]
      : geom.type === "MultiPolygon"
        ? geom.coordinates
        : [];

    polys.forEach(poly => {
      poly.forEach(ring => {
        let started = false;
        ctx.beginPath();
        for (const [lon, lat] of ring) {
          const p = projectMonde(lat, lon, cx, cy, radius);
          if (!p || p.z < 0) {
            started = false;
            continue;
          }
          if (!started) {
            ctx.moveTo(p.x, p.y);
            started = true;
          } else {
            ctx.lineTo(p.x, p.y);
          }
        }
        if (started) {
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
      });
    });
  });

  // Continent labels (reuse existing label positions)
  ctx.fillStyle = "rgba(234, 244, 229, 0.82)";
  ctx.font = `600 ${Math.max(10, radius * 0.062)}px ${getComputedStyle(document.body).fontFamily}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowBlur = 10;
  ctx.shadowColor = "rgba(7,12,20,0.8)";
  MONDE_CONTINENTS.forEach(c => {
    const lp = projectMonde(c.label[0], c.label[1], cx, cy, radius);
    if (lp && lp.z > 0.18) {
      ctx.fillText(c.name, lp.x, lp.y);
    }
  });
  ctx.shadowBlur = 0;
}

function ensureMondePage() {
  const wrap = document.querySelector("#page-monde .main-wrap");
  if (!wrap || wrap.dataset.mondeMounted === "1") return;
  wrap.dataset.mondeMounted = "1";
  wrap.innerHTML = `
    <div class="monde-shell">
      <div class="page-header monde-head">
        <div>
          <div class="page-title">Monde</div>
          <div class="page-sub">Surveillance temps reel. Le globe n'affiche que des sources reelles chargees a la demande.</div>
           <div class="coming-soon-badge monde-dev-badge">⚙ En développement — vols encore limités selon les sources</div>
        </div>
        <div class="monde-source-note" id="monde-last-sync">Sources en attente</div>
      </div>

      <div class="monde-toolbar">
        <div class="monde-filter-group" id="monde-filters">
          <button class="monde-filter-badge mfb-flight active" data-filter="flights">
            <span class="monde-badge-icon" style="-webkit-mask-image:url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAABdUlEQVR4nO2WzS5DQRiGn0Ri4yesSFAXoFaEhAtQy1qxpna4BcRPcAvYqbWN3532FrARq9o0xN+OBfmSt8nkZNRJekxF+iSTM9870/nezPlmTqFBg3h0AJ+Rdgc0EZBXj4mpkAaulTQNLKpfCGngXEkzQAvwqHg0lIE9Jcwp3lacD2VgRQntafQA78AHkEoiQcpTZDPOeE6a7USFvDTbjUQoRww8AN0ay0izWqgwJO0FaE/CwIlzvI7VP9JYWrGdBpeCdDsZNbOmxezZBzx7XovdBy5Zzxxfuwc2geZqBrKabDthzH6zmN2MFew2vI1pwtpGnEIskzxjzk7UxcC41i7V+xWs16sIS0petQhPNTnrOYaDiq8ivylKX+CXLqIujU1KO3PmD0t7AlprTd7v2bZpZ3xe2q6jHUrbIgCrSrasuDfpj9FP7MvAnOIdxQcE4kIJJ4A2vXeLR0IZuFHCAWBJ/UsC8uYpUjuuQej8C3/LG/xPvgBdLb32eY65+AAAAABJRU5ErkJggg==');mask-image:url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAABdUlEQVR4nO2WzS5DQRiGn0Ri4yesSFAXoFaEhAtQy1qxpna4BcRPcAvYqbWN3532FrARq9o0xN+OBfmSt8nkZNRJekxF+iSTM9870/nezPlmTqFBg3h0AJ+Rdgc0EZBXj4mpkAaulTQNLKpfCGngXEkzQAvwqHg0lIE9Jcwp3lacD2VgRQntafQA78AHkEoiQcpTZDPOeE6a7USFvDTbjUQoRww8AN0ay0izWqgwJO0FaE/CwIlzvI7VP9JYWrGdBpeCdDsZNbOmxezZBzx7XovdBy5Zzxxfuwc2geZqBrKabDthzH6zmN2MFew2vI1pwtpGnEIskzxjzk7UxcC41i7V+xWs16sIS0petQhPNTnrOYaDiq8ivylKX+CXLqIujU1KO3PmD0t7AlprTd7v2bZpZ3xe2q6jHUrbIgCrSrasuDfpj9FP7MvAnOIdxQcE4kIJJ4A2vXeLR0IZuFHCAWBJ/UsC8uYpUjuuQej8C3/LG/xPvgBdLb32eY65+AAAAABJRU5ErkJggg==')"></span><span>Vols</span><span class="monde-badge-count" id="monde-count-flights">0</span>
          </button>
          <button class="monde-filter-badge mfb-disaster active" data-filter="disasters">
            <span class="monde-badge-icon" style="-webkit-mask-image:url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAACrElEQVR4nNXXW6hVVRQG4M9L2iktrbSMECEjURRBC3oIKiUQFClB6WI38IIokmQ+GBTUg0qGSIkSYRT54ItdnyrEsh5MJIXSDpVhkmAEShctNGXKv2Vx2J08+6x9wB8me825JnuM+Y/xjzEXlxE6sBVjKmvz8VBlXt69iSvb4cAV2IkfMTxrb2cUXIfD2TOwLqNPYBkexEgMRSc2N3HgdXyHIRiPp/BMHGsZ7+ZP/8Q/2IRHcQo3VRwYhdN4Eh/gHI5hLyb0ngcXKJ2FX7EOR8NMw4Hl+BkbcQRTtAlLwso2vIMNGY35e1igDzANj6FfRnm+r91Gn8ZBrEzMV+MtbA/19+Mr7Ipka8fX2J2EPB1nSvy3JDdK4u3I753tcOAk5uDFGLm28q4Y/jzh+A0P1218dIxOwiP4q0l4igoGYA9eqtuBRTlZkePL2Nfl/Y0JTXFkLfbX7cD7kdmg6HxVkz1z8QruClu31WX8hiTd3FTBE5Ve0Az9E44X6nJgRbJ8MK5PHjTD7dkjEj1WmbeMfjiU8tsd1of2zrTkkWGtFKheYSbO4NbKWsn0EZX5zWlUi/FFGtCgdMcDCUnL+DJ1voGx+DanfTZrRXI/xbFbopZ1YeLvLheWHuFe/IuJmV+T1vwJXsM3uCMFqsivgdk4i6WpkodavaDsTvIJjaULfo9hkdjxMPFhKK9iYU5/NneHHrMwK6cvBiYnyU7luYGOUN6dfKfj1dSOqy7VeP8kz9ZKc/kDD2gNQ1IXnu/JPfD3ZHdx5u7IqjeYl0OUntIthuIXPKd+fIqP/m/T2tB1yfHqAcanXhSVNMW4VK/ae3kF63PA6l3iYsktHxSf5blduBo/4I2uLx6PbgtN7cY9qQ8zqos70kjW9NE4km9IDUyNEx/30Si2/qut9y3OA65EvhEoWtEFAAAAAElFTkSuQmCC');mask-image:url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAACrElEQVR4nNXXW6hVVRQG4M9L2iktrbSMECEjURRBC3oIKiUQFClB6WI38IIokmQ+GBTUg0qGSIkSYRT54ItdnyrEsh5MJIXSDpVhkmAEShctNGXKv2Vx2J08+6x9wB8me825JnuM+Y/xjzEXlxE6sBVjKmvz8VBlXt69iSvb4cAV2IkfMTxrb2cUXIfD2TOwLqNPYBkexEgMRSc2N3HgdXyHIRiPp/BMHGsZ7+ZP/8Q/2IRHcQo3VRwYhdN4Eh/gHI5hLyb0ngcXKJ2FX7EOR8NMw4Hl+BkbcQRTtAlLwso2vIMNGY35e1igDzANj6FfRnm+r91Gn8ZBrEzMV+MtbA/19+Mr7Ipka8fX2J2EPB1nSvy3JDdK4u3I753tcOAk5uDFGLm28q4Y/jzh+A0P1218dIxOwiP4q0l4igoGYA9eqtuBRTlZkePL2Nfl/Y0JTXFkLfbX7cD7kdmg6HxVkz1z8QruClu31WX8hiTd3FTBE5Ve0Az9E44X6nJgRbJ8MK5PHjTD7dkjEj1WmbeMfjiU8tsd1of2zrTkkWGtFKheYSbO4NbKWsn0EZX5zWlUi/FFGtCgdMcDCUnL+DJ1voGx+DanfTZrRXI/xbFbopZ1YeLvLheWHuFe/IuJmV+T1vwJXsM3uCMFqsivgdk4i6WpkodavaDsTvIJjaULfo9hkdjxMPFhKK9iYU5/NneHHrMwK6cvBiYnyU7luYGOUN6dfKfj1dSOqy7VeP8kz9ZKc/kDD2gNQ1IXnu/JPfD3ZHdx5u7IqjeYl0OUntIthuIXPKd+fIqP/m/T2tB1yfHqAcanXhSVNMW4VK/ae3kF63PA6l3iYsktHxSf5blduBo/4I2uLx6PbgtN7cY9qQ8zqos70kjW9NE4km9IDUyNEx/30Si2/qut9y3OA65EvhEoWtEFAAAAAElFTkSuQmCC')"></span><span>Catastrophes</span><span class="monde-badge-count" id="monde-count-disasters">0</span>
          </button>
          <button class="monde-filter-badge mfb-weather active" data-filter="weather">
            <span class="monde-badge-icon" style="-webkit-mask-image:url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAACXklEQVR4nO2WTUhWURCGH0v6/xFbGVSrUCshoo1RC8EIrCiCMMSkP7A2kRGEQZqryIULIbIWtbECoUURlhDSImhlLiJ10zqwHwuMEhJl4P1kuHx9997u+QiiF4bLnTtn3pl7ZuYc+I94rAOeAIf5S6gF5oA3eb7tB24BK4oZwHLgJ/Ajoq8Aviq4GoqMQ3m24IzIbXuCoRUYB47n+VajQHYDS/XbTwDlIQPoVFYmjdLtBEad3uQzcI4ioARoAZ4ClSL/LtJJ4BnwFpgCbgBrKTJGRf4QWBkpTCM/CdwE7gPdQL2SCIJtLnNPbjgFfIlsS05GgOoQARyUw6GIvt2R2bfzQJPq57301p7b0xJuAq4A94DNwA45m3A2u4BZzYR8k3EJcNuts25JjBcuM8tqGfBB782yea73Qh2wCBiWnbVpYuwDeoCjwGLpDmjcWsGtUvZWE6UxvvYqgMdkRAnQAPS67AcTrFst229AP9Cltk6FcvcrvdxJuH4qsu4X0JEm82HXhlbhx4AjKYZPtbbT6uCuti+ufhbQ4MjXEwbNbozHdkevjK8RFuPyawdaQfTL8HTgAIbk14ZcQXTJ0PYuFGycf5TfLXHGVaraWTeEspI/cGdFIlx1LTQGPAIG/kAGVcxzOtptxCfGWffbsspIWnJ/wDQ6RxfV37+T67J7qXe7xm0lIwbk1J45lOr8sEPLY40uKXadD4J6kU8DG5w+l+mlAmv3AH1AWZYA3onostNtBGbUJXZvRK1lU67N2fVpbV2WAF4Br1UL/vIyqXugn/2fgAtOVybyYPdE/jnMA8PYvZKm2DAzAAAAAElFTkSuQmCC');mask-image:url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAACXklEQVR4nO2WTUhWURCGH0v6/xFbGVSrUCshoo1RC8EIrCiCMMSkP7A2kRGEQZqryIULIbIWtbECoUURlhDSImhlLiJ10zqwHwuMEhJl4P1kuHx9997u+QiiF4bLnTtn3pl7ZuYc+I94rAOeAIf5S6gF5oA3eb7tB24BK4oZwHLgJ/Ajoq8Aviq4GoqMQ3m24IzIbXuCoRUYB47n+VajQHYDS/XbTwDlIQPoVFYmjdLtBEad3uQzcI4ioARoAZ4ClSL/LtJJ4BnwFpgCbgBrKTJGRf4QWBkpTCM/CdwE7gPdQL2SCIJtLnNPbjgFfIlsS05GgOoQARyUw6GIvt2R2bfzQJPq57301p7b0xJuAq4A94DNwA45m3A2u4BZzYR8k3EJcNuts25JjBcuM8tqGfBB782yea73Qh2wCBiWnbVpYuwDeoCjwGLpDmjcWsGtUvZWE6UxvvYqgMdkRAnQAPS67AcTrFst229AP9Cltk6FcvcrvdxJuH4qsu4X0JEm82HXhlbhx4AjKYZPtbbT6uCuti+ufhbQ4MjXEwbNbozHdkevjK8RFuPyawdaQfTL8HTgAIbk14ZcQXTJ0PYuFGycf5TfLXHGVaraWTeEspI/cGdFIlx1LTQGPAIG/kAGVcxzOtptxCfGWffbsspIWnJ/wDQ6RxfV37+T67J7qXe7xm0lIwbk1J45lOr8sEPLY40uKXadD4J6kU8DG5w+l+mlAmv3AH1AWZYA3onostNtBGbUJXZvRK1lU67N2fVpbV2WAF4Br1UL/vIyqXugn/2fgAtOVybyYPdE/jnMA8PYvZKm2DAzAAAAAElFTkSuQmCC')"></span><span>Meteo extreme</span><span class="monde-badge-count" id="monde-count-weather">0</span>
          </button>
          <button class="monde-filter-badge mfb-conflict active" data-filter="conflicts">
            <span class="monde-badge-icon" style="-webkit-mask-image:url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAC0ElEQVR4nO2WSWgUURCGPxMTTYKauLQY9WRQPEXiQYwIMQhBPSkI4oILePMoeBMXEERwG8xJDy53gwfF5SAqggx6SRAjKLjiSlxJ1JiRJ/+D4vl67JkB8ZAfGrqr6q+qrldV3TCK/xA1wHpgG9Cq50p8tcrX1qy+jgIFcw0Cd4BuYBVQXYRbLZtucQYDX8eyJHBZxnmgHxgJnFwCGiK8Bums7Yh85PV8JUsCh2S8V88TgQ5gF/BSuh6gynCqJHO6F7LtEBf5Ksj3X7GmSLZzgDfSHzbyI5K9B+ZFeFelX50lgRky/phy3kuBIdnsALbr/jvQGbF31fkgm2Yy4rEI7Sn6TTrfH7pGJIuhXb6cz8zYL9IjoCXF5rhptj0pNi3mZfaVkkAdcFvEV0BboHelfCb9WWBMxMdC4LVsnK/xlIgG4KIcfAa6JK/XjDv5TWBchLtMPeRsrgETKBM1wDk5+qYNeUHPD4EpEc462RbErWST/oYr78FgwbwD5vIn3FT8NFvP7oqKcV6OhzSKYZIHTILOtiJMDkrn9vuwxm1DYDsWOKXAfiSHxSkLCfBV+7sJWKAmdAF2R6bF98QXYIVsfOM6LlrLJ4HGLAnUAw/k5B7wXPdngnFzVbol3VtgkeTO5rTkjrvFfBVjmzKKZnW5P9PrQK3RzwL6jP6+ZB614tjGzaXsi1RsNuS7Og6H+cBTyXt1ufsn0nlsNPyeUoN3mbJ9Mkms1BfPPd9QUk269+O5OOD7nxq/yIqiE1hryK5sM4Pj8GPmGtCjzvwPDJpFlNPl5c738rRqLEk5s8SUuaBP67QIvzr4IxoApsuHT6JQrBkbTSBPtsH7TCXyQVOGxzZgeiSRLyublHYEiQnYGwRPNB392oZTA67vjZwCxvz4hIoiCUoektxXcnaEt1P/gv58k2BUMwWPJXGC8pErJ7hHouBurMpFm5IoOfgo+Ff4BQ6LChmmdoMQAAAAAElFTkSuQmCC');mask-image:url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAC0ElEQVR4nO2WSWgUURCGPxMTTYKauLQY9WRQPEXiQYwIMQhBPSkI4oILePMoeBMXEERwG8xJDy53gwfF5SAqggx6SRAjKLjiSlxJ1JiRJ/+D4vl67JkB8ZAfGrqr6q+qrldV3TCK/xA1wHpgG9Cq50p8tcrX1qy+jgIFcw0Cd4BuYBVQXYRbLZtucQYDX8eyJHBZxnmgHxgJnFwCGiK8Bums7Yh85PV8JUsCh2S8V88TgQ5gF/BSuh6gynCqJHO6F7LtEBf5Ksj3X7GmSLZzgDfSHzbyI5K9B+ZFeFelX50lgRky/phy3kuBIdnsALbr/jvQGbF31fkgm2Yy4rEI7Sn6TTrfH7pGJIuhXb6cz8zYL9IjoCXF5rhptj0pNi3mZfaVkkAdcFvEV0BboHelfCb9WWBMxMdC4LVsnK/xlIgG4KIcfAa6JK/XjDv5TWBchLtMPeRsrgETKBM1wDk5+qYNeUHPD4EpEc462RbErWST/oYr78FgwbwD5vIn3FT8NFvP7oqKcV6OhzSKYZIHTILOtiJMDkrn9vuwxm1DYDsWOKXAfiSHxSkLCfBV+7sJWKAmdAF2R6bF98QXYIVsfOM6LlrLJ4HGLAnUAw/k5B7wXPdngnFzVbol3VtgkeTO5rTkjrvFfBVjmzKKZnW5P9PrQK3RzwL6jP6+ZB614tjGzaXsi1RsNuS7Og6H+cBTyXt1ufsn0nlsNPyeUoN3mbJ9Mkms1BfPPd9QUk269+O5OOD7nxq/yIqiE1hryK5sM4Pj8GPmGtCjzvwPDJpFlNPl5c738rRqLEk5s8SUuaBP67QIvzr4IxoApsuHT6JQrBkbTSBPtsH7TCXyQVOGxzZgeiSRLyublHYEiQnYGwRPNB392oZTA67vjZwCxvz4hIoiCUoektxXcnaEt1P/gv58k2BUMwWPJXGC8pErJ7hHouBurMpFm5IoOfgo+Ff4BQ6LChmmdoMQAAAAAElFTkSuQmCC')"></span><span>Conflits</span><span class="monde-badge-count" id="monde-count-conflicts">0</span>
          </button>
          <button class="monde-filter-badge mfb-protest active" data-filter="protests">
            <span class="monde-badge-icon" style="-webkit-mask-image:url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAABmUlEQVR4nO2UO0sDQRSFvyhGEFNZCFYWKqQQwS6JVRobxc4/YGOn2NkpQuITK8FGBEsRQaz8A4qgFlYWWklioeILQdQQWTiBIexms7OJ1R4Y2Ps4956ZnTsQIUIEO8SBDeBZa12+piEOrABF4BE4B8pV61yxpghadmnorBSQ9ohVBBWAfFhBBY+GFdQjKBdGQNmjoZ9tCio0QsC1y84eLARaCyj7rKYI6DQK3AI9VfGMEU/72IERAw5Evgd6XXIyFidUN+ZEfAOS8i16FD/V2BU1dnl9u92RujAMfIs4Kd84UKpq/AosAa01alkJOBJpR3Y/8CLfFnCl7ydgwKeWlYAPkfpkz8g+1N1oA/blO5OvoQI+Reo2fBNAwrA7NBlO3lijBZyItOmTN6u8PY94wrjIgZACfkSeqpGXVM6NRzyr+CUWmBbZmYZRnx2+e8SPFV/AEjnjCEcCcufFdaany1ZADNhVoS9gDRgE2ms83Vlj5yVd3lBoAVaB3wDPbmXnoZubGAK2gTudhltT5y5c6J9bH3uECPwX/gCXg86nK9szEwAAAABJRU5ErkJggg==');mask-image:url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAABmUlEQVR4nO2UO0sDQRSFvyhGEFNZCFYWKqQQwS6JVRobxc4/YGOn2NkpQuITK8FGBEsRQaz8A4qgFlYWWklioeILQdQQWTiBIexms7OJ1R4Y2Ps4956ZnTsQIUIEO8SBDeBZa12+piEOrABF4BE4B8pV61yxpghadmnorBSQ9ohVBBWAfFhBBY+GFdQjKBdGQNmjoZ9tCio0QsC1y84eLARaCyj7rKYI6DQK3AI9VfGMEU/72IERAw5Evgd6XXIyFidUN+ZEfAOS8i16FD/V2BU1dnl9u92RujAMfIs4Kd84UKpq/AosAa01alkJOBJpR3Y/8CLfFnCl7ydgwKeWlYAPkfpkz8g+1N1oA/blO5OvoQI+Reo2fBNAwrA7NBlO3lijBZyItOmTN6u8PY94wrjIgZACfkSeqpGXVM6NRzyr+CUWmBbZmYZRnx2+e8SPFV/AEjnjCEcCcufFdaany1ZADNhVoS9gDRgE2ms83Vlj5yVd3lBoAVaB3wDPbmXnoZubGAK2gTudhltT5y5c6J9bH3uECPwX/gCXg86nK9szEwAAAABJRU5ErkJggg==')"></span><span>Manifestations</span><span class="monde-badge-count" id="monde-count-protests">0</span>
          </button>
        </div>
        <div class="monde-actions">
          <button class="monde-refresh-btn" id="monde-refresh-btn">Rafraichir</button>
        </div>
      </div>

      <div class="monde-layout">
        <aside class="monde-panel monde-panel-left">
          <div class="monde-panel-title">Sources</div>
          <div class="monde-source-list" id="monde-source-list"></div>
        </aside>

        <section class="monde-stage">
          <div class="monde-canvas-wrap" id="monde-canvas-wrap">
            <canvas id="monde-canvas"></canvas>
            <div class="monde-tooltip" id="monde-tooltip"></div>
            <div class="monde-overlay-top">
              <span>Glisser: rotation</span>
              <span>Molette: zoom</span>
              <span>Clic point: detail</span>
            </div>
          </div>
          <div class="monde-stage-bar" id="monde-stage-bar"></div>
        </section>

        <aside class="monde-panel monde-panel-right">
          <div class="monde-panel-title">Evenements recents</div>
          <div class="monde-feed" id="monde-feed"></div>
        </aside>
      </div>

      <div class="monde-bottom">
        <div class="monde-bottom-card monde-activity-card">
          <div class="monde-panel-title">Zones d'activite</div>
          <div class="monde-activity-chart" id="monde-activity-chart"></div>
        </div>
      </div>
    </div>
  `;
}

function initMonde() {
  ensureMondePage();
  const canvas = document.getElementById("monde-canvas");
  const wrap = document.getElementById("monde-canvas-wrap");
  if (!canvas || !wrap || MONDE.initialized) return;

  MONDE.initialized = true;
  const ctx = canvas.getContext("2d");
  MONDE.ctx = ctx;
  MONDE.canvas = canvas;
  MONDE.wrap = wrap;
  MONDE.tooltip = document.getElementById("monde-tooltip");
  MONDE.lastCanvasWidth = 0;
  MONDE.lastCanvasHeight = 0;

  const resize = () => {
    const rect = wrap.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const nextWidth = Math.max(320, Math.floor(rect.width * dpr));
    const nextHeight = Math.max(320, Math.floor(rect.height * dpr));
    if (nextWidth === MONDE.lastCanvasWidth && nextHeight === MONDE.lastCanvasHeight) {
      drawMonde();
      return;
    }
    MONDE.lastCanvasWidth = nextWidth;
    MONDE.lastCanvasHeight = nextHeight;
    canvas.width = nextWidth;
    canvas.height = nextHeight;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawMonde();
  };

  MONDE.resizeObserver = new ResizeObserver(() => requestAnimationFrame(resize));
  MONDE.resizeObserver.observe(wrap);
  resize();

  wrap.addEventListener("pointerdown", e => {
    MONDE.drag.active = true;
    MONDE.drag.x = e.clientX;
    MONDE.drag.y = e.clientY;
    wrap.setPointerCapture(e.pointerId);
  });

  wrap.addEventListener("pointermove", e => {
    if (MONDE.drag.active) {
      const dx = e.clientX - MONDE.drag.x;
      const dy = e.clientY - MONDE.drag.y;
      MONDE.drag.x = e.clientX;
      MONDE.drag.y = e.clientY;
      MONDE.camera.yaw += dx * 0.008;
      MONDE.camera.pitch = clampMonde(MONDE.camera.pitch + dy * 0.006, -1.2, 1.2);
      drawMonde();
      return;
    }
    handleMondeHover(e);
  });

  wrap.addEventListener("pointerup", e => {
    MONDE.drag.active = false;
    wrap.releasePointerCapture?.(e.pointerId);
  });

  wrap.addEventListener("pointerleave", () => {
    MONDE.drag.active = false;
    MONDE.hoverItem = null;
    if (MONDE.tooltip) MONDE.tooltip.classList.remove("show");
    drawMonde();
  });

  wrap.addEventListener("wheel", e => {
    e.preventDefault();
    MONDE.camera.zoom = clampMonde(MONDE.camera.zoom + (e.deltaY > 0 ? -0.08 : 0.08), 0.72, 1.6);
    drawMonde();
  }, { passive: false });

  wrap.addEventListener("click", e => {
    const picked = pickMondeItem(e.offsetX, e.offsetY);
    MONDE.pickedItem = picked || null;
    renderMondeFeed();
    drawMonde();
  });

  document.getElementById("monde-refresh-btn")?.addEventListener("click", () => {
    loadMondeData(true);
  });

  document.querySelectorAll("#monde-filters .monde-filter-badge").forEach(btn => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.filter;
      MONDE.filters[key] = !MONDE.filters[key];
      btn.classList.toggle("active", MONDE.filters[key]);
      drawMonde();
      renderMondeStats();
      renderMondeFeed();
    });
  });

  if (!MONDE.refreshTimer) {
    MONDE.refreshTimer = setInterval(() => loadMondeData(false), 60000);
  }
  if (!MONDE.animating) {
    MONDE.animating = true;
    requestAnimationFrame(mondeTick);
  }
  // Load real geographic data for continent rendering
  loadWorldGeo().then(() => drawMonde());
}

function renderMonde() {
  ensureMondePage();
  initMonde();
  if (!MONDE.renderReady) {
    MONDE.renderReady = true;
    renderMondeStats();
    renderMondeSources();
    renderMondeFeed();
    renderMondeStageBar();
    renderMondeActivityChart();
    loadMondeData(false);
  } else {
    drawMonde();
    renderMondeStats();
    renderMondeFeed();
    renderMondeStageBar();
    renderMondeActivityChart();
  }
}

function clampMonde(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function mondeTimeLabel(date) {
  if (!date) return "Jamais";
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(date);
}

function mondeAgo(ts) {
  if (!ts) return "-";
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.max(0, Math.round(diff / 60000));
  if (mins < 1) return "a l'instant";
  if (mins < 60) return mins + " min";
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return hrs + " h";
  return Math.round(hrs / 24) + " j";
}

function setMondeSource(key, patch) {
  MONDE.sources[key] = Object.assign({}, MONDE.sources[key], patch);
  renderMondeSources();
}

function updateMondeLastSync() {
  const el = document.getElementById("monde-last-sync");
  if (!el) return;
  if (window.location.protocol === "file:") {
    el.textContent = "Mode fichier detecte : les flux live exigent http://127.0.0.1:5500";
    return;
  }
  el.textContent = MONDE.lastSync ? "Derniere sync " + mondeTimeLabel(MONDE.lastSync) : "Sources en attente";
}

async function loadMondeData(force) {
  if (MONDE.loading && !force) return;
  MONDE.loading = true;
  updateMondeLastSync();
  setMondeSource("flights", { status: "loading", message: "Chargement du trafic aerien..." });
  setMondeSource("disasters", { status: "loading", message: "Chargement des seismes, volcans et incendies..." });
  setMondeSource("weather", { status: "loading", message: "Chargement de la meteo extreme..." });
  setMondeSource("conflicts", { status: "loading", message: "Chargement des points de conflit..." });
  setMondeSource("protests", { status: "loading", message: "Chargement des points de manifestation..." });

  const [flights, quakes, volcanoes, weather, conflicts, protests] = await Promise.allSettled([
    fetchOpenSkyFlights(),
    fetchUSGSEarthquakes(),
    fetchEONETVolcanoes(),
    fetchEONETWeatherEvents(),
    fetchGDELTGeoEvents("(clashes OR shelling OR fighting OR airstrike OR offensive)", 20, "conflicts", "Base evenement GDELT"),
    fetchGDELTGeoEvents("(protest OR protests OR demonstration OR rally OR unrest)", 12, "protests", "Base evenement GDELT")
  ]);

  if (flights.status === "fulfilled") {
    MONDE.data.flights = flights.value;
    setMondeSource("flights", {
      status: "ok",
      message: flights.value.length ? flights.value.length + " vols visibles" : "0 vol remonte par le flux",
      updatedAt: new Date()
    });
  } else {
    MONDE.data.flights = [];
    setMondeSource("flights", {
      status: "error",
      message: mondeRelayHint(flights.reason, "vols"),
      updatedAt: null
    });
  }

  const disasters = [];
  if (quakes.status === "fulfilled") disasters.push(...quakes.value);
  if (volcanoes.status === "fulfilled") disasters.push(...volcanoes.value);
  MONDE.data.disasters = disasters.sort((a, b) => (b.ts || 0) - (a.ts || 0));
  if (quakes.status === "fulfilled" || volcanoes.status === "fulfilled") {
    setMondeSource("disasters", {
      status: "ok",
      message: disasters.length + " evenements naturels",
      updatedAt: new Date()
    });
  } else {
    setMondeSource("disasters", {
      status: "error",
      message: "Flux de catastrophes indisponibles",
      updatedAt: null
    });
  }

  if (weather.status === "fulfilled") {
    MONDE.data.weather = weather.value;
    setMondeSource("weather", {
      status: "ok",
      message: weather.value.length + " evenements meteorologiques",
      updatedAt: new Date()
    });
  } else {
    MONDE.data.weather = [];
    setMondeSource("weather", {
      status: "error",
      message: "Flux meteo indisponible",
      updatedAt: null
    });
  }

  if (conflicts.status === "fulfilled") {
    MONDE.data.conflicts = conflicts.value;
    setMondeSource("conflicts", {
      status: "ok",
      message: conflicts.value.length ? conflicts.value.length + " points geographiques" : "0 conflit remonte par le flux",
      updatedAt: new Date()
    });
  } else {
    MONDE.data.conflicts = [];
    setMondeSource("conflicts", {
      status: "error",
      message: mondeRelayHint(conflicts.reason, "conflits"),
      updatedAt: null
    });
  }

  if (protests.status === "fulfilled") {
    MONDE.data.protests = protests.value;
    setMondeSource("protests", {
      status: "ok",
      message: protests.value.length ? protests.value.length + " points geographiques" : "0 manifestation remontee par le flux",
      updatedAt: new Date()
    });
  } else {
    MONDE.data.protests = [];
    setMondeSource("protests", {
      status: "error",
      message: mondeRelayHint(protests.reason, "manifestations"),
      updatedAt: null
    });
  }

  MONDE.lastSync = new Date();
  MONDE.loading = false;
  updateMondeLastSync();
  renderMondeStats();
  renderMondeSources();
  renderMondeFeed();
  renderMondeStageBar();
  renderMondeActivityChart();
  drawMonde();
}

async function fetchJSON(url) {
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store"
  });
  if (!res.ok) throw new Error("HTTP " + res.status);
  return res.json();
}

async function fetchJSONViaLocalRelay(path, fallbackLoader) {
  try {
    return await fetchJSON(path);
  } catch (relayErr) {
    try {
      return await fallbackLoader();
    } catch (fallbackErr) {
      const err = new Error("relay_and_fallback_failed");
      err.relayError = relayErr;
      err.fallbackError = fallbackErr;
      throw err;
    }
  }
}

function mondeErrorMessage(err) {
  if (!err) return "";
  const relayText = String(err.relayError?.message || err.message || "");
  const fallbackText = String(err.fallbackError?.message || "");
  return (relayText + " " + fallbackText).trim().toLowerCase();
}

function mondeRelayHint(err, label) {
  const text = mondeErrorMessage(err);
  if (text.includes("failed to fetch") || text.includes("impossible de se connecter") || text.includes("http 404")) {
    return "Relais local " + label + " indisponible";
  }
  return "Flux " + label + " indisponible";
}

// Try multiple CORS proxies in sequence
const MONDE_PROXIES = [
  u => "https://api.allorigins.win/raw?url=" + encodeURIComponent(u),
  u => "https://corsproxy.io/?url=" + encodeURIComponent(u),
  u => "https://thingproxy.freeboard.io/fetch/" + u,
];

async function fetchJSONViaProxy(url) {
  for (const makeProxy of MONDE_PROXIES) {
    try {
      const proxyUrl = makeProxy(url);
      const res = await fetch(proxyUrl, { headers: { Accept: "application/json" }, cache: "no-store" });
      if (!res.ok) continue;
      const text = await res.text();
      if (!text || text.trimStart().startsWith("<")) continue; // HTML error page
      return JSON.parse(text);
    } catch (e) {
      continue;
    }
  }
  throw new Error("All CORS proxies failed for: " + url);
}

// For OpenSky specifically: use allorigins /get (JSON wrapper) which handles large responses
async function fetchJSONViaAllorigins(url) {
  // Strategy 1: allorigins /get wraps the response body in .contents (handles large JSON)
  try {
    const res = await fetch("https://api.allorigins.win/get?url=" + encodeURIComponent(url), { cache: "no-store" });
    if (res.ok) {
      const wrapper = await res.json();
      if (wrapper?.contents) return JSON.parse(wrapper.contents);
    }
  } catch (e) {}
  // Strategy 2: direct (works on some networks/browsers)
  try {
    return await fetchJSON(url);
  } catch (e) {}
  // Strategy 3: raw proxy cascade
  return fetchJSONViaProxy(url);
}

async function fetchOpenSkyFlights() {
  // OpenSky blocks direct browser requests — use allorigins /get wrapper (best for large JSON)
  const json = await fetchJSONViaLocalRelay(
    "/api/opensky/states",
    () => fetchJSONViaAllorigins("https://opensky-network.org/api/states/all")
  );
  const states = Array.isArray(json.states) ? json.states : [];
  return states
    .filter(s => s && typeof s[5] === "number" && typeof s[6] === "number" && s[8] === false)
    .filter(s => (s[9] || 0) > 55)
    .slice(0, 120)
    .map((s, index) => ({
      id: "flight-" + index + "-" + (s[0] || "x"),
      type: "flights",
      label: (s[1] || "Vol sans indicatif").trim() || "Vol sans indicatif",
      sub: (s[2] || "Pays inconnu") + " · " + Math.round((s[9] || 0) * 3.6) + " km/h",
      lat: s[6],
      lon: s[5],
      altitude: Math.round((s[13] || s[7] || 0) / 0.3048),
      velocity: Math.round((s[9] || 0) * 3.6),
      heading: typeof s[10] === "number" ? s[10] : 0,
      ts: s[4] ? s[4] * 1000 : Date.now()
    }));
}

async function fetchUSGSEarthquakes() {
  const json = await fetchJSON("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson");
  const features = Array.isArray(json.features) ? json.features : [];
  return features
    .filter(f => Array.isArray(f.geometry?.coordinates))
    .map((f, index) => ({
      id: "quake-" + index,
      type: "disasters",
      subtype: "earthquake",
      label: f.properties?.title || "Seisme",
      sub: "Seisme M" + (f.properties?.mag ?? "?"),
      lat: f.geometry.coordinates[1],
      lon: f.geometry.coordinates[0],
      mag: f.properties?.mag ?? null,
      depth: f.geometry.coordinates[2] ?? null,
      severity: Math.max(0.35, Math.min(1, (f.properties?.mag || 0) / 8)),
      ts: f.properties?.time || Date.now(),
      source: "Reseau sismique mondial"
    }))
    .sort((a, b) => (b.mag || 0) - (a.mag || 0) || (b.ts || 0) - (a.ts || 0))
    .slice(0, 20);
}

async function fetchEONETByCategory(categoryNames, maxCount, type, sourceLabel, options = {}) {
  const categoryLabel = {
    "Severe Storms": "Tempetes severes",
    "Wildfires": "Incendies",
    "Volcanoes": "Volcans",
    "Dust and Haze": "Poussieres et brume"
  };
  const status = options.status || "open";
  const days = options.days || 45;
  const categoryParam = categoryNames
    .map(name => {
      if (name === "Severe Storms") return "severeStorms";
      if (name === "Wildfires") return "wildfires";
      if (name === "Volcanoes") return "volcanoes";
      if (name === "Dust and Haze") return "dustHaze";
      return "";
    })
    .filter(Boolean)
    .join(",");
  const json = await fetchJSON("https://eonet.gsfc.nasa.gov/api/v3/events?status=" + encodeURIComponent(status) + "&days=" + encodeURIComponent(days) + "&limit=80&category=" + categoryParam);
  const events = Array.isArray(json.events) ? json.events : [];
  return events
    .filter(event => {
      const cats = Array.isArray(event.categories) ? event.categories.map(c => c.title) : [];
      return cats.some(cat => categoryNames.includes(cat));
    })
    .map((event, index) => {
      const geom = Array.isArray(event.geometry) ? event.geometry[event.geometry.length - 1] : null;
      const coords = geom?.coordinates;
      if (!Array.isArray(coords) || coords.length < 2) return null;
      const cats = Array.isArray(event.categories) ? event.categories.map(c => c.title) : [];
      const catsLabel = cats.map(cat => categoryLabel[cat] || cat).join(", ") || "Evenement";
      return {
        id: type + "-" + index,
        type,
        subtype: (cats[0] || categoryNames[0] || "natural").toLowerCase(),
        label: event.title || "Evenement naturel",
        sub: catsLabel,
        lat: coords[1],
        lon: coords[0],
        severity: cats.includes("Severe Storms") ? 0.82 : cats.includes("Wildfires") ? 0.72 : cats.includes("Dust and Haze") ? 0.58 : 0.62,
        ts: Date.parse(geom?.date || event.closed || event.geometry?.[0]?.date || "") || Date.now(),
        source: sourceLabel
      };
    })
    .filter(Boolean)
    .sort((a, b) => (b.ts || 0) - (a.ts || 0))
    .slice(0, maxCount);
}

async function fetchEONETVolcanoes() {
  return fetchEONETByCategory(["Volcanoes", "Wildfires"], 20, "disasters", "Observation naturelle mondiale", { status: "all", days: 90 });
}

async function fetchEONETWeatherEvents() {
  return fetchEONETByCategory(["Severe Storms", "Dust and Haze"], 20, "weather", "Veille meteo mondiale", { status: "all", days: 120 });
}

async function fetchGDELTGeoEvents(query, maxCount, type, sourceLabel) {
  const target = "https://api.gdeltproject.org/api/v2/geo/geo?query=" +
    encodeURIComponent(query) +
    "&mode=pointdata&format=geojson&TIMESPAN=24h&MAXPOINTS=" + maxCount;
  const relay = "/api/gdelt/" + encodeURIComponent(type) +
    "?limit=" + encodeURIComponent(maxCount) +
    "&q=" + encodeURIComponent(query);
  const json = await fetchJSONViaLocalRelay(relay, async () => {
    try {
      return await fetchJSON(target);
    } catch (err) {
      return fetchJSONViaProxy(target);
    }
  });
  const features = Array.isArray(json.features) ? json.features : [];
  return features
    .map((feature, index) => {
      const center = geometryCenter(feature.geometry);
      if (!center) return null;
      const props = feature.properties || {};
      const title = props.name || props.title || props.label || query;
      const html = String(props.html || props.description || "");
      const source = html.match(/https?:\/\/([^/"'<\s]+)/i)?.[1] || sourceLabel;
      const count = Number(props.count || props.numarticles || props.value || 1);
      const unit = props.unit || "mentions";
      const ts = Number(props.ts || 0) || Date.parse(props.updated || "") || Date.now();
      return {
        id: type + "-" + index,
        type,
        label: decodeHtml(title),
        sub: source + " · " + count + " " + unit,
        lat: center.lat,
        lon: center.lon,
        severity: Math.max(0.45, Math.min(1, 0.35 + count / 12)),
        ts: ts,
        source: sourceLabel,
        mentions: count
      };
    })
    .filter(Boolean)
    .slice(0, maxCount);
}

async function fetchReliefWebConflicts() {
  const params = new URLSearchParams();
  params.set("appname", "opsboard-local");
  params.set("limit", "18");
  params.set("preset", "latest");
  params.append("sort[]", "date.original:desc");
  params.append("query[value]", "conflict");
  params.append("fields[include][]", "title");
  params.append("fields[include][]", "primary_country.iso3");
  params.append("fields[include][]", "primary_country.name");
  params.append("fields[include][]", "country.iso3");
  params.append("fields[include][]", "country.name");
  params.append("fields[include][]", "source.name");
  params.append("fields[include][]", "date.original");
  params.append("fields[include][]", "url");

  const json = await fetchJSON("https://api.reliefweb.int/v2/reports?" + params.toString());
  const list = Array.isArray(json.data) ? json.data : Array.isArray(json.data?.list) ? json.data.list : [];
  return list
    .map((row, index) => {
      const fields = row.fields || row;
      const primary = Array.isArray(fields.primary_country) && fields.primary_country.length
        ? fields.primary_country[0]
        : fields.primary_country && !Array.isArray(fields.primary_country)
          ? fields.primary_country
        : Array.isArray(fields.country) && fields.country.length
          ? fields.country[0]
          : fields.country && !Array.isArray(fields.country)
            ? fields.country
            : null;
      const iso3 = primary?.iso3 ? String(primary.iso3).toUpperCase() : "";
      const point = MONDE_COUNTRY_CENTROIDS[iso3];
      if (!point) return null;
      const source = Array.isArray(fields.source) && fields.source.length ? fields.source[0].name : "ReliefWeb";
      return {
        id: "conflict-" + index + "-" + iso3,
        type: "conflicts",
        label: fields.title || "Conflit",
        sub: (primary?.name || iso3 || "Pays inconnu") + " · " + source,
        lat: point[0],
        lon: point[1],
        severity: 0.8,
        ts: Date.parse(fields.date?.original || fields["date.original"] || "") || Date.now(),
        source: "ReliefWeb",
        url: fields.url || row.href || ""
      };
    })
    .filter(Boolean);
}

function geometryCenter(geometry) {
  if (!geometry) return null;
  if (geometry.type === "Point" && Array.isArray(geometry.coordinates)) {
    return { lon: geometry.coordinates[0], lat: geometry.coordinates[1] };
  }
  const ring = geometry.type === "Polygon"
    ? geometry.coordinates?.[0]
    : geometry.type === "MultiPolygon"
      ? geometry.coordinates?.[0]?.[0]
      : null;
  if (!Array.isArray(ring) || !ring.length) return null;
  let lon = 0;
  let lat = 0;
  ring.forEach(p => {
    lon += p[0];
    lat += p[1];
  });
  return { lon: lon / ring.length, lat: lat / ring.length };
}

function decodeHtml(value) {
  const div = document.createElement("div");
  div.innerHTML = String(value || "");
  return div.textContent || div.innerText || "";
}

function weatherSeverity(value) {
  const key = String(value || "").toLowerCase();
  if (key.includes("extreme")) return 1;
  if (key.includes("severe")) return 0.82;
  if (key.includes("moderate")) return 0.62;
  return 0.48;
}

function activeMondeItems() {
  const items = [];
  if (MONDE.filters.flights) items.push(...MONDE.data.flights);
  if (MONDE.filters.disasters) items.push(...MONDE.data.disasters);
  if (MONDE.filters.weather) items.push(...MONDE.data.weather);
  if (MONDE.filters.conflicts) items.push(...MONDE.data.conflicts);
  if (MONDE.filters.protests) items.push(...MONDE.data.protests);
  return items;
}

function renderMondeSources() {
  const list = document.getElementById("monde-source-list");
  if (!list) return;
  const badges = {
    flights: "Vols",
    disasters: "Catastrophes",
    weather: "Meteo",
    conflicts: "Conflits",
    protests: "Manifestations"
  };
  list.innerHTML = Object.entries(MONDE.sources).map(([key, source]) => {
    const cls = "src-" + source.status;
    const time = source.updatedAt ? mondeTimeLabel(source.updatedAt) : "-";
    return `
      <div class="monde-source-card ${cls}">
        <div class="monde-source-top">
          <span class="monde-source-name">${source.name}</span>
          <span class="monde-source-badge">${badges[key] || key}</span>
        </div>
        <div class="monde-source-msg">${source.message}</div>
        <div class="monde-source-time">Maj: ${time}</div>
      </div>
    `;
  }).join("");
}

function renderMondeStats() {
  const stats = document.getElementById("monde-stats");
  updateMondeBadgeCounts();
  if (!stats) return;
  const rows = [
    { key: "flights", label: "Vols", value: MONDE.data.flights.length, color: "dot-flight" },
    { key: "disasters", label: "Catastrophes", value: MONDE.data.disasters.length, color: "dot-disaster" },
    { key: "weather", label: "Meteo", value: MONDE.data.weather.length, color: "dot-weather" },
    { key: "conflicts", label: "Conflits", value: MONDE.data.conflicts.length, color: "dot-conflict" },
    { key: "visible", label: "Affiches", value: activeMondeItems().length, color: "dot-visible" }
  ];
  stats.innerHTML = rows.map(row => `
    <div class="monde-stat-row ${MONDE.filters[row.key] === false ? "is-off" : ""}">
      <span class="monde-dot ${row.color}"></span>
      <span class="monde-stat-label">${row.label}</span>
      <span class="monde-stat-value">${row.value}</span>
    </div>
  `).join("");
}

function getMondeRegion(lat, lon) {
  if (lat < -10 && lon > 110) return "Oceanie";
  if (lon >= -170 && lon <= -30) return "Ameriques";
  if (lon >= -30 && lon <= 60 && lat >= -38) return "Europe / Afrique";
  if (lon > 60 && lon <= 180) return "Asie / Pacifique";
  return "Monde";
}

function renderMondeStageBar() {
  const bar = document.getElementById("monde-stage-bar");
  if (!bar) return;
  const visible = activeMondeItems();
  const okSources = Object.values(MONDE.sources).filter(s => s.status === "ok").length;
  const blocked = Object.values(MONDE.sources).filter(s => s.status === "error");
  const regionMap = {};
  visible.forEach(item => {
    const key = getMondeRegion(item.lat, item.lon);
    regionMap[key] = (regionMap[key] || 0) + 1;
  });
  const topZones = Object.entries(regionMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([name, count]) => name + " " + count)
    .join(" · ") || "Aucune zone";

  bar.innerHTML = `
    <div class="monde-mini-card">
      <span class="monde-mini-label">Affiches</span>
      <strong>${visible.length}</strong>
      <small>Points visibles sur le globe</small>
    </div>
    <div class="monde-mini-card">
      <span class="monde-mini-label">Sources OK</span>
      <strong>${okSources}/5</strong>
      <small>${okSources ? "Flux reussis au chargement" : "Aucune source chargee"}</small>
    </div>
    <div class="monde-mini-card">
      <span class="monde-mini-label">Zones actives</span>
      <strong>${topZones}</strong>
      <small>Repartition rapide</small>
    </div>
    <div class="monde-mini-card">
      <span class="monde-mini-label">A brancher</span>
      <strong>${blocked.length}</strong>
      <small>${blocked.length ? blocked.map(s => s.name).join(" · ") : "Aucun blocage"}</small>
    </div>
  `;
}

function renderMondeActivityChart() {
  const chart = document.getElementById("monde-activity-chart");
  if (!chart) return;
  const regions = ["Ameriques", "Europe / Afrique", "Asie / Pacifique", "Oceanie"];
  const keys = ["conflicts", "protests", "disasters", "weather", "flights"];
  const labels = {
    conflicts: "Conflits",
    protests: "Manifestations",
    disasters: "Catastrophes",
    weather: "Meteo extreme",
    flights: "Vols"
  };

  const rows = regions.map(region => {
    const counts = { conflicts: 0, protests: 0, disasters: 0, weather: 0, flights: 0 };
    activeMondeItems().forEach(item => {
      if (getMondeRegion(item.lat, item.lon) === region && counts[item.type] !== undefined) {
        counts[item.type]++;
      }
    });
    const total = keys.reduce((sum, key) => sum + counts[key], 0);
    return { region, counts, total };
  });

  const maxTotal = Math.max(1, ...rows.map(row => row.total));
  chart.innerHTML = rows.map(row => {
    const segments = keys
      .filter(key => row.counts[key] > 0)
      .map(key => {
        const width = row.total ? (row.counts[key] / row.total) * 100 : 0;
        return `<span class="monde-activity-seg seg-${key}" style="width:${width}%"></span>`;
      })
      .join("");

    const legend = keys
      .filter(key => row.counts[key] > 0)
      .map(key => `<span class="monde-activity-tag tag-${key}">${labels[key]} ${row.counts[key]}</span>`)
      .join("");

    return `
      <div class="monde-activity-row">
        <div class="monde-activity-head">
          <strong>${row.region}</strong>
          <span>${row.total} activites</span>
        </div>
        <div class="monde-activity-track">
          <div class="monde-activity-bar" style="width:${(row.total / maxTotal) * 100}%">
            ${segments || `<span class="monde-activity-seg seg-empty" style="width:100%"></span>`}
          </div>
        </div>
        <div class="monde-activity-legend">${legend || `<span class="monde-activity-tag tag-empty">Aucune</span>`}</div>
      </div>
    `;
  }).join("");
}

function updateMondeBadgeCounts() {
  const counts = {
    flights: MONDE.data.flights.length,
    disasters: MONDE.data.disasters.length,
    weather: MONDE.data.weather.length,
    conflicts: MONDE.data.conflicts.length,
    protests: MONDE.data.protests.length
  };
  Object.entries(counts).forEach(([key, value]) => {
    const el = document.getElementById("monde-count-" + key);
    if (el) el.textContent = value;
  });
}

function renderMondeFeed() {
  const feed = document.getElementById("monde-feed");
  if (!feed) return;
  const items = activeMondeItems()
    .sort((a, b) => (b.ts || 0) - (a.ts || 0))
    .slice(0, 8);

  const sourceAlerts = Object.entries(MONDE.sources)
    .filter(([, source]) => source.status === "error")
    .map(([key, source]) => `
      <div class="monde-alert-card">
        <span class="monde-dot dot-${mondeTypeDot(key)}"></span>
        <span class="monde-alert-copy">
          <strong>${source.name}</strong>
          <small>${source.message}</small>
        </span>
      </div>
    `)
    .join("");

  const picked = MONDE.pickedItem;
  const detail = picked ? `
    <div class="monde-detail-card">
      <div class="monde-detail-head">
        <span class="monde-dot dot-${mondeTypeDot(picked.type)}"></span>
        <span>${picked.label}</span>
      </div>
      <div class="monde-detail-meta">${picked.sub || ""}</div>
      <div class="monde-detail-grid">
        <div><span>Lat</span><strong>${picked.lat.toFixed(2)}</strong></div>
        <div><span>Lon</span><strong>${picked.lon.toFixed(2)}</strong></div>
        <div><span>Heure</span><strong>${mondeAgo(picked.ts)}</strong></div>
        <div><span>Source</span><strong>${picked.source || MONDE.sources[picked.type]?.name || "-"}</strong></div>
      </div>
    </div>
  ` : "";

  if (!items.length) {
    feed.innerHTML = detail + sourceAlerts + `<div class="monde-empty">Aucun evenement visible avec les filtres actifs.</div>`;
    return;
  }

  feed.innerHTML = detail + sourceAlerts + items.map(item => `
    <button class="monde-feed-item ${MONDE.pickedItem?.id === item.id ? "selected" : ""}" data-id="${item.id}">
      <span class="monde-dot dot-${mondeTypeDot(item.type)}"></span>
      <span class="monde-feed-copy">
        <strong>${item.label}</strong>
        <small>${item.sub || ""} · ${mondeAgo(item.ts)}</small>
      </span>
    </button>
  `).join("");

  feed.querySelectorAll(".monde-feed-item").forEach(btn => {
    btn.addEventListener("click", () => {
      const item = activeMondeItems().find(entry => entry.id === btn.dataset.id);
      MONDE.pickedItem = item || null;
      renderMondeFeed();
      drawMonde();
    });
  });
}

function drawMonde() {
  if (!MONDE.ctx || !MONDE.canvas || !MONDE.wrap) return;
  const ctx = MONDE.ctx;
  const width = MONDE.wrap.clientWidth;
  const height = MONDE.wrap.clientHeight;
  const cx = width * 0.5;
  const cy = height * 0.52;
  const radius = Math.min(width, height) * 0.32 * MONDE.camera.zoom;
  const atmosphere = radius * 1.12;

  ctx.clearRect(0, 0, width, height);
  drawMondeBackground(ctx, width, height);

  const glow = ctx.createRadialGradient(cx, cy, radius * 0.1, cx, cy, atmosphere);
  glow.addColorStop(0, "rgba(0,212,106,0.08)");
  glow.addColorStop(0.7, "rgba(34,197,94,0.1)");
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, atmosphere, 0, Math.PI * 2);
  ctx.fill();

  const sphere = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.45, radius * 0.25, cx, cy, radius);
  sphere.addColorStop(0, "#5aa8ff");
  sphere.addColorStop(0.3, "#2255a8");
  sphere.addColorStop(0.68, "#10284b");
  sphere.addColorStop(1, "#08101f");
  ctx.fillStyle = sphere;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.clip();
  drawMondeGrid(ctx, cx, cy, radius);
  drawGeoContents(ctx, cx, cy, radius);
  drawMondeItems(ctx, cx, cy, radius);
  ctx.restore();

  ctx.strokeStyle = "rgba(0, 212, 106, 0.34)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();
}

function drawMondeBackground(ctx, width, height) {
  const bg = ctx.createLinearGradient(0, 0, 0, height);
  bg.addColorStop(0, "#07110d");
  bg.addColorStop(1, "#0a0d12");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "rgba(255,255,255,0.75)";
  for (let i = 0; i < 110; i++) {
    const x = ((i * 97) % 1000) / 1000 * width;
    const y = ((i * 71) % 1000) / 1000 * height;
    const r = i % 7 === 0 ? 1.8 : 0.9;
    ctx.globalAlpha = i % 5 === 0 ? 0.9 : 0.45;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawMondeGrid(ctx, cx, cy, radius) {
  ctx.strokeStyle = "rgba(120, 212, 148, 0.18)";
  ctx.lineWidth = 1;
  for (let lat = -60; lat <= 60; lat += 30) {
    ctx.beginPath();
    for (let lon = -180; lon <= 180; lon += 4) {
      const p = projectMonde(lat, lon, cx, cy, radius);
      if (!p || p.z < 0) continue;
      if (lon === -180) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
  }

  for (let lon = -150; lon <= 180; lon += 30) {
    ctx.beginPath();
    let started = false;
    for (let lat = -89; lat <= 89; lat += 3) {
      const p = projectMonde(lat, lon, cx, cy, radius);
      if (!p || p.z < 0) {
        started = false;
        continue;
      }
      if (!started) {
        ctx.moveTo(p.x, p.y);
        started = true;
      } else {
        ctx.lineTo(p.x, p.y);
      }
    }
    ctx.stroke();
  }
}

function drawPseudoContinents(ctx, cx, cy, radius) {
  ctx.fillStyle = "rgba(119, 166, 104, 0.54)";
  ctx.strokeStyle = "rgba(208, 236, 183, 0.22)";
  ctx.lineWidth = 1.1;
  MONDE_CONTINENTS.forEach(continent => {
    let started = false;
    let visiblePoints = 0;
    ctx.beginPath();
    continent.points.forEach(([lat, lon]) => {
      const p = projectMonde(lat, lon, cx, cy, radius);
      if (!p || p.z < 0) return;
      visiblePoints++;
      if (!started) {
        ctx.moveTo(p.x, p.y);
        started = true;
      } else {
        ctx.lineTo(p.x, p.y);
      }
    });
    if (started && visiblePoints >= 3) {
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    const labelPoint = projectMonde(continent.label[0], continent.label[1], cx, cy, radius);
    if (labelPoint && labelPoint.z > 0.18) {
      ctx.fillStyle = "rgba(234, 244, 229, 0.78)";
      ctx.font = `600 ${Math.max(10, radius * 0.065)}px ${getComputedStyle(document.body).fontFamily}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowBlur = 10;
      ctx.shadowColor = "rgba(7,12,20,0.75)";
      ctx.fillText(continent.name, labelPoint.x, labelPoint.y);
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(119, 166, 104, 0.54)";
    }
  });
}

function drawMondeItems(ctx, cx, cy, radius) {
  const items = activeMondeItems();
  const projected = [];
  items.forEach(item => {
    const point = item.type === "flights" ? flightCurrentPoint(item) : { lat: item.lat, lon: item.lon };
    const p = projectMonde(point.lat, point.lon, cx, cy, radius);
    if (!p || p.z < 0) return;
    p.item = item;
    projected.push(p);
  });

  projected
    .sort((a, b) => a.z - b.z)
    .forEach(p => {
      if (p.item.type === "flights") drawFlightTrail(ctx, p, cx, cy, radius);
    });

  projected.forEach(p => {
    const color = MONDE_COLORS[p.item.type] || "#fff";
    const size = p.item.type === "flights"
      ? 3.2
      : p.item.type === "weather"
        ? 4.4
        : 4.8;
    const pulse = 1 + Math.sin(Date.now() / 350 + p.x * 0.02) * 0.12;

    ctx.fillStyle = color;
    ctx.shadowBlur = p.item.type === "flights" ? 8 : 16;
    ctx.shadowColor = color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, size * pulse * (p.item.severity || 1), 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    if (MONDE.hoverItem?.id === p.item.id || MONDE.pickedItem?.id === p.item.id) {
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, size * 2.8, 0, Math.PI * 2);
      ctx.stroke();
    }
  });

  MONDE.projectedItems = projected;
}

function drawFlightTrail(ctx, p, cx, cy, radius) {
  const heading = ((p.item.heading || 0) - 90) * Math.PI / 180;
  const length = 12 + Math.min(22, (p.item.velocity || 0) / 40);
  const x2 = p.x + Math.cos(heading) * length;
  const y2 = p.y + Math.sin(heading) * length;
  const grad = ctx.createLinearGradient(p.x, p.y, x2, y2);
  grad.addColorStop(0, "rgba(119,246,255,0.9)");
  grad.addColorStop(1, "rgba(119,246,255,0)");
  ctx.strokeStyle = grad;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function flightCurrentPoint(item) {
  const ageSeconds = Math.max(0, Math.min(120, (Date.now() - (item.ts || Date.now())) / 1000));
  const speedKmh = Math.max(0, item.velocity || 0);
  const distanceKm = speedKmh * (ageSeconds / 3600);
  const heading = (item.heading || 0) * Math.PI / 180;
  const lat1 = item.lat * Math.PI / 180;
  const lon1 = item.lon * Math.PI / 180;
  const angularDistance = distanceKm / 6371;

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angularDistance) +
    Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(heading)
  );
  const lon2 = lon1 + Math.atan2(
    Math.sin(heading) * Math.sin(angularDistance) * Math.cos(lat1),
    Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2)
  );

  return {
    lat: lat2 * 180 / Math.PI,
    lon: ((lon2 * 180 / Math.PI + 540) % 360) - 180
  };
}

function projectMonde(lat, lon, cx, cy, radius) {
  const phi = lat * Math.PI / 180;
  const lambda = lon * Math.PI / 180 + MONDE.camera.yaw;
  const x = Math.cos(phi) * Math.sin(lambda);
  const y = Math.sin(phi);
  const z = Math.cos(phi) * Math.cos(lambda);

  const cp = Math.cos(MONDE.camera.pitch);
  const sp = Math.sin(MONDE.camera.pitch);
  const y2 = y * cp - z * sp;
  const z2 = y * sp + z * cp;
  return {
    x: cx + x * radius,
    y: cy - y2 * radius,
    z: z2
  };
}

function pickMondeItem(x, y) {
  const items = MONDE.projectedItems || [];
  let best = null;
  let bestDist = 22;
  items.forEach(p => {
    const dx = p.x - x;
    const dy = p.y - y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < bestDist) {
      bestDist = dist;
      best = p.item;
    }
  });
  return best;
}

function handleMondeHover(e) {
  const item = pickMondeItem(e.offsetX, e.offsetY);
  MONDE.hoverItem = item || null;
  const tip = MONDE.tooltip;
  if (!tip || !item) {
    tip?.classList.remove("show");
    drawMonde();
    return;
  }
  tip.innerHTML = `
    <strong>${item.label}</strong>
    <span>${item.sub || ""}</span>
    <span>${mondeAgo(item.ts)}</span>
  `;
  tip.style.left = (e.offsetX + 18) + "px";
  tip.style.top = (e.offsetY + 18) + "px";
  tip.classList.add("show");
  drawMonde();
}

function mondeTypeDot(type) {
  if (type === "flights") return "flight";
  if (type === "disasters") return "disaster";
  if (type === "weather") return "weather";
  if (type === "conflicts") return "conflict";
  if (type === "protests") return "protest";
  return "visible";
}

function mondeTick() {
  if (document.getElementById("page-monde")?.classList.contains("active")) {
    drawMonde();
  }
  requestAnimationFrame(mondeTick);
}

document.addEventListener("DOMContentLoaded", () => {
  ensureMondePage();
  initMonde();
});
