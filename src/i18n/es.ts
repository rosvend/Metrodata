import type { DemoFacts } from "../demo/facts";
import { formatDate, formatDecimal, formatInt, formatPercent } from "../lib/format";
import type { Messages } from "./en";

const hh = (h: number) => `${String(h).padStart(2, "0")}:00`;
const signed = (v: number) => formatPercent(v / 100, { signed: true });

// Spanish copy (Colombia). "Abordajes" = boardings: each line a person enters, not unique passengers
export const es: Messages = {
  locale: "es-CO",
  common: {
    loading: "Cargando datos",
    whatIs: (label: string) => `¿Qué es ${label}?`,
    close: "Cerrar",
    retry: "Reintentar",
    loadError: "No se pudieron cargar los datos de esta vista.",
    loadErrorHint: (message: string) =>
      `${message}. Ejecute \`npm run data\` si faltan archivos y vuelva a intentarlo.`,
    mapError: (message: string) => `No se pudo dibujar el mapa: ${message}`,
    boardings: "abordajes",
  },
  shell: {
    home: "Inicio de Metrodata",
    tagline: "Inteligencia de afluencia",
    skip: "Saltar al contenido",
    pagesNav: "Páginas",
    demo: "Demo",
    endDemo: "Terminar demo",
    about: "Datos",
    aboutLong: "Sobre los datos",
    theme: (next: "light" | "dark") => `Cambiar a tema ${next === "dark" ? "oscuro" : "claro"}`,
    language: "Idioma / Language",
  },
  pages: {
    "/": {
      label: "Flujo",
      title: "Dónde están los abordajes",
      lede: "Abordajes por línea, hora a hora. Reproduzca el día para ver cómo la red se llena y se vacía.",
    },
    "/peaks": {
      label: "Picos",
      title: "Cuándo se exige la red",
      lede: "Horas pico, qué tan marcadas son y qué líneas alcanzan el mismo techo día tras día.",
    },
    "/calendar": {
      label: "Calendario",
      title: "Días fuera de lo normal",
      lede: "Cada día comparado con días similares cercanos, para encontrar picos y caídas.",
    },
    "/access": {
      label: "Acceso",
      title: "Quince minutos a pie",
      lede: "Áreas caminables alrededor de cada estación, calculadas sobre la red de calles.",
    },
  },
  notFound: {
    title: "Aquí no hay estación",
    lede: "Esta dirección no corresponde a ninguna página del tablero.",
    link: "Ir al mapa de flujo",
  },
  filters: {
    year: "Año",
    days: "Días",
    yearHint: (y: number, coverage: string) => `${y}: datos de ${coverage}`,
    coverage: { 2024: "ene–dic", 2025: "ene–sep", 2026: "ene–jul" },
    dayShort: { weekday: "Hábil", saturday: "Sáb", sunday_holiday: "Dom y fest." },
    dayPlural: { weekday: "Días hábiles", saturday: "Sábados", sunday_holiday: "Domingos y festivos" },
    daySingular: { weekday: "día hábil", saturday: "sábado", sunday_holiday: "domingo o festivo" },
  },
  about: {
    title: "Sobre los datos",
    intro:
      "Abordajes por hora de las 12 líneas del sistema Metro de Medellín, con la ubicación de estaciones y el trazado de líneas de los datos abiertos del sistema.",
    limitsTitle: "Qué se puede y qué no se puede leer aquí",
    limits: [
      "La afluencia se registra por línea, por día y por hora. No hay datos por estación ni de origen–destino, así que los mapas muestran solo volúmenes por línea.",
      "Las cifras son abordajes, no pasajeros: quien hace transbordo se cuenta una vez en cada línea que aborda.",
      "Las medidas de congestión (concentración en la hora pico, carga por km, índice de saturación) son aproximaciones. Los datos no tienen ocupación a bordo, capacidad ni frecuencias.",
      "Las razones de los picos y caídas (alumbrados navideños, Feria de las Flores, puentes festivos, elecciones) son hipótesis, no causas comprobadas.",
      "Los datos van de enero de 2024 a julio de 2026, pero octubre–diciembre de 2025 no existe. Por eso las comparaciones interanuales usan solo enero–julio.",
      "Las líneas 1, 2 y O son corredores de buses; sus longitudes y las cifras por km son indicativas. El trazado de la Línea O es el Corredor de la 80 proyectado.",
    ],
    checksTitle: "Verificaciones de datos",
    loadingChecks: "Cargando verificaciones",
    reconciled: (ok: boolean, mismatches: number) =>
      `${ok ? "Los totales de 2026 coinciden con el total general del archivo fuente" : "Los totales de 2026 NO coinciden con la fuente"}; las horas de cada fila suman su total diario (${mismatches} diferencias).`,
    excluded: (date: string, boardings: string) =>
      `${date} se excluye de todas las medidas: solo se registraron ${boardings} abordajes (probable falla de registro; se esperaban unos 700.000).`,
    missing: (dates: string) => `Faltan en la fuente y no se rellenan: ${dates}.`,
    closures: "Los días en que una línea no operó se tratan como cierres, nunca como cero abordajes.",
    noBaseline: (n: number) =>
      `${n} días tienen muy pocos días comparables para calcular el índice de picos y quedan en blanco.`,
    walking: (ok: number, total: number, date: string, version: string, speed: number) =>
      `Áreas caminables: ${ok} de ${total} estaciones, datos de OpenStreetMap del ${date}, Valhalla ${version} a ${speed} km/h.`,
  },
  kpi: {
    avg_weekday_boardings:
      "Promedio de abordajes diarios en días hábiles (sin sábados, domingos ni festivos), sobre los días en que la línea operó.",
    line_share:
      "Promedio de abordajes en días hábiles de esta línea dividido entre la suma de todas las líneas. Los transbordos cuentan una vez por línea abordada.",
    peak_hour:
      "La franja de una hora más concurrida del día hábil promedio, y la proporción de los abordajes del día que ocurren en ella.",
    peak_to_average:
      "Hora más concurrida dividida entre el promedio de las horas de operación (horas con más del 0,5 % del día). Más alto significa un pico más marcado.",
    load_per_km:
      "Mediana de abordajes en la hora pico de los días hábiles dividida por la longitud de la línea. Aproxima la presión sobre la línea: los abordajes se cuentan al ingreso, no la ocupación a bordo.",
    saturation_index:
      "P95 ÷ mediana del volumen en la hora pico de los días hábiles. Valores cercanos a 1 indican que el pico casi no varía de un día a otro, lo que puede señalar un techo de capacidad. Solo una aproximación: los datos no tienen capacidad, frecuencias ni conteos a bordo.",
    weekend_ratio:
      "Promedio de abordajes del sábado (o de domingos y festivos) como proporción del promedio en días hábiles.",
  },
  flow: {
    loading: "Cargando la red",
    mapLabel: "Mapa de flujo",
    play: "Reproducir el día",
    pause: "Pausar el día",
    hourOfOperation: "Hora de operación",
    hourOfDay: "Hora del día",
    speed: "Velocidad",
    widthShows: "El grosor muestra",
    feeders: "Rutas alimentadoras",
    loadingFeeders: "Cargando rutas alimentadoras…",
    metrics: { boardings: "Abordajes", per_km: "Por km", share: "% del día" },
    metricSentence: {
      boardings: "abordajes por hora",
      per_km: "abordajes por hora por km de línea",
      share: "la proporción de cada línea sobre sus propios abordajes diarios",
    },
    value: {
      boardings: (v: string) => `${v} abordajes`,
      per_km: (v: string) => `${v} abordajes por km`,
      share: (v: string) => `${v} de los abordajes diarios de la línea`,
    },
    context: (daySingular: string, year: number) => `${daySingular} promedio, ${year}`,
    legendItem: (badge: string, mode: string, value: string) => `Línea ${badge}, ${mode}: ${value}. Ver detalles`,
    linesLabel: "Líneas",
    readMap: "este mapa",
    howToRead: (metric: string, context: string, coverage: string) =>
      `El grosor y el brillo de cada línea muestran ${metric}, ${context} (${coverage}). Los puntos en movimiento son proporcionales a ese valor; no son vehículos. La afluencia se registra por línea, así que las estaciones solo indican ubicación. Punteado: trazado proyectado de la Línea O (indicativo). Gris punteado: Cable Palmitas, sin datos. Sombreado: fuera del área metropolitana del Valle de Aburrá.`,
    tipPlanned: "Trazado y longitud indicativos: la fuente dibuja el Corredor de la 80 proyectado.",
    tipNoData: "Sin datos de afluencia para esta línea.",
    tipLines: (lines: string) => `Líneas ${lines}`,
    tipStation: "La afluencia se registra por línea, no por estación.",
    panel: {
      details: (badge: string) => `Detalles de la línea ${badge}`,
      closeDetails: "Cerrar detalles de la línea",
      indicative: " (indicativa)",
      profileTitle: (dayPlural: string, year: number) => `Abordajes promedio por hora, ${dayPlural} ${year}`,
      coverageNote: (year: number, coverage: string, band: string) =>
        `Datos de ${year}: ${coverage}. Marcador: ${band}.`,
      profileLabel: (badge: string) => `Perfil horario de abordajes de la línea ${badge}`,
      yAxis: "abordajes / hora",
      daily: (n: string, daySingular: string) => `${n} abordajes en un ${daySingular} promedio.`,
      indicatorsTitle: (year: number) => `Indicadores de días hábiles, ${year}`,
      weekdayBoardings: "Abordajes en día hábil",
      share: "Participación entre líneas",
      peakHour: "Hora pico",
      peakToAverage: "Pico ÷ hora promedio",
      loadPerKm: "Abordajes en hora pico por km",
      saturation: "Índice de saturación (aprox.)",
      saturday: "Sábado ÷ día hábil",
      sunday: "Domingo y festivo ÷ día hábil",
      indicativeNote: "* La longitud es indicativa en los corredores de buses.",
    },
  },
  peaks: {
    loading: "Cargando datos de picos",
    coverageNote: (year: number, coverage: string) => `${year} cubre ${coverage}. Abordajes, no pasajeros.`,
    weekdaysOnly: " Solo días hábiles, por definición.",
    noData: "No hay datos para esta selección.",
    heatTitle: "Línea × hora",
    heatSubtitle: (dayPlural: string, year: number) => `${dayPlural} promedio, ${year}`,
    heatInfo:
      "Cada celda es el promedio de abordajes en esa franja horaria sobre los días de operación del tipo de día elegido. El modo % del día divide por el total diario de cada línea, para comparar líneas de tamaños muy distintos.",
    colorShows: "El color muestra",
    shareOfDay: "% del día",
    boardings: "Abordajes",
    heatLabel: (share: boolean) =>
      `Mapa de calor de ${share ? "la proporción de abordajes diarios" : "abordajes"} por línea y hora`,
    heatTip: (badge: string, band: string, boardings: string) => `Línea ${badge}, ${band}\n${boardings} abordajes`,
    heatTipShare: (share: string) => `\n${share} del día de la línea`,
    profileTitle: "Perfil del sistema por tipo de día",
    profileSubtitle: (year: number) => `Todas las líneas, abordajes promedio por hora, ${year}`,
    profileLabel: "Abordajes del sistema por hora según el tipo de día",
    perHour: "Abordajes por hora",
    profileTip: (day: string, band: string, boardings: string) => `${day}, ${band}\n${boardings} abordajes (promedio)`,
    legend: "Leyenda",
    tableTitle: "Picos por línea",
    tableSubtitle: (dayPlural: string, year: number) => `${dayPlural}, ${year}. Haga clic en una columna para ordenar.`,
    colLine: "Línea",
    colPeakHour: "Hora pico",
    colPeakShare: "% en el pico",
    colRatio: "Pico ÷ prom.",
    colDay: "Día",
    system: "Sistema",
    lineSr: "Línea ",
    loadTitle: "Carga en hora pico por km",
    loadSubtitle: (year: number) => `Abordajes en hora pico ÷ km, mediana hábil, ${year}.`,
    loadLabel: "Mediana de abordajes en hora pico por km en días hábiles, por línea",
    loadTip: (badge: string, value: string, indicative: boolean) =>
      `Línea ${badge}: ${value} abordajes por km en la hora pico${indicative ? " (longitud indicativa)" : ""}`,
    hollowNote: "* Hueco: corredor de buses, longitud indicativa.",
    satTitle: "Saturación (aprox.)",
    satSubtitle:
      "Abordajes en la hora más concurrida de cada día hábil, un punto por día. Línea: mediana; punteada: P95.",
    satPicker: "Línea para la vista de saturación",
    satButton: (badge: string, si: string) => `Línea ${badge}, índice de saturación ${si}`,
    satLabel: (badge: string) => `Distribución de abordajes en hora pico de días hábiles de la línea ${badge} por año`,
    satTip: (date: string, boardings: string, hour: number) => `${date}: ${boardings} abordajes a las ${hour}:00`,
  },
  calendar: {
    loading: "Cargando el calendario",
    coreNote:
      "Líneas base A, B, T-A, 1, 2, O y P. Cada día se compara con el mismo día de la semana y tipo de día en ±35 días.",
    yearTitle: (year: number) => `${year}, día a día`,
    yearSubtitle: (coverage: string) =>
      `Datos de ${coverage}. Haga clic en un día para ver sus horas. Se muestran todos los tipos de día: cada uno se compara solo con los de su tipo.`,
    info: "Desviación = abordajes de las líneas base ÷ esperado − 1. El esperado es la mediana del mismo día de la semana y tipo de día en ±35 días, sin contar el propio día. Borde gris: muy pocos días comparables (en blanco). Rojo punteado: día excluido (probable falla de registro). Vacío: sin datos en la fuente.",
    legendLow: "−40 % o menos",
    legendHigh: "+40 % o más",
    legendLabel: "Leyenda de color",
    heatLabel: "Calendario de la desviación diaria frente a los abordajes esperados",
    weekdays: ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"],
    months: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"],
    tipMissing: "Sin datos en la fuente",
    tipExcluded: "Excluido: probable falla de registro",
    tipCore: (n: string) => `Líneas base: ${n} abordajes`,
    tipAll: (n: string) => `Todas las líneas: ${n} abordajes`,
    tipExpected: (n: string) => `Esperado: ${n}`,
    tipDeviation: (v: string) => `Desviación: ${v}`,
    tipNoBaseline: "Muy pocos días comparables para un valor esperado",
    tipHoliday: (name: string) => `Festivo: ${name}`,
    tipDriver: (label: string) => `Causa probable (hipótesis): ${label}`,
    rankedTitle: "Mayores picos y caídas",
    rankedSubtitle: (year: number) => `${year}. Las causas son hipótesis por verificar, no hechos.`,
    above: "Más por encima de lo esperado",
    below: "Más por debajo de lo esperado",
    hypothesis: "(hipótesis)",
    dayTitle: "El día frente a sus horas esperadas",
    goToDate: "Ir a la fecha",
    pickDay: "Elija un día en el calendario o en la lista.",
    noCoreData: (date: string) => `Sin datos de líneas base para ${date}.`,
    versusExpected: (actual: string, expected: string | null) => `${actual} frente a ${expected ?? "sin"} esperado`,
    dayLabel: (date: string) => `Abordajes por hora del ${date} comparados con el perfil esperado`,
    tipActual: (n: string) => `Real: ${n}`,
    dayNote: (n: number, window: number, lines: string) =>
      `Continua: este día. Punteada: mediana de ${n} días comparables (mismo día de la semana y tipo de día, ±${window} días). Líneas base ${lines}.`,
    trendTitle: "Tendencia comparable",
    lflNote:
      "Comparación equivalente: solo enero–julio, porque falta octubre–diciembre de 2025 y 2026 termina en julio.",
    view: "Vista",
    byMonth: "Por mes",
    byHour: "Por hora",
    lflHeadline: "Abordajes diarios promedio, ene–jul:",
    lflPair: (y: string, vs: number, g: string) => `${y} vs ${vs} ${g}`,
    monthlyLabel: "Abordajes diarios promedio por mes, de enero a julio, por año",
    monthlyAxis: "Abordajes diarios promedio",
    monthlyTip: (month: string, year: number, v: string) => `${month} ${year}: ${v} abordajes por día`,
    hourlyNote: (dayPlural: string) =>
      `${dayPlural}, abordajes promedio por franja horaria, 2026 vs 2025. Después de las 22:00 la base es muy pequeña y los porcentajes varían mucho.`,
    hourlyLabel: "Cambio de abordajes por franja horaria, enero a julio de 2026 frente a 2025",
    hourlyAxis: "2026 vs 2025",
    drivers: {
      election: "Día de elecciones",
      holiday: "Festivo",
      feria: "Feria de las Flores",
      christmas: "Alumbrados navideños",
      christmas_eve: "Nochebuena",
      new_years_eve: "Fin de año",
      new_year: "Temporada de Año Nuevo",
      holy_week: "Semana Santa",
      long_weekend: "Puente festivo",
      none: "Sin causa evidente",
    },
    holidayDriver: (name: string) => `Festivo: ${name}`,
  },
  access: {
    loading: "Cargando áreas caminables",
    mapLabel: "Mapa de acceso",
    method:
      "Las áreas caminables se calcularon fuera de línea con Valhalla sobre las calles de OpenStreetMap a 4,8 km/h, para las 50 estaciones principales (Metro, Tranvía, Metrocable y las estaciones principales de Metroplús). Siguen calles y senderos, no líneas rectas.",
    methodLabel: "cómo se calcularon las áreas caminables",
    show: "Mostrar",
    oneStation: "Una estación",
    coverage: "Cobertura",
    stations: "Estaciones",
    filters: { all: "Todas", metro: "Metro", tranvia: "Tranvía", metrocable: "Metrocable" },
    filterNames: {
      all: "todas las estaciones",
      metro: "estaciones de Metro",
      tranvia: "estaciones de Tranvía",
      metrocable: "estaciones de Metrocable",
    },
    showOverlap: "Ver superposición",
    findStation: "Buscar estación",
    findPlaceholder: "p. ej. Poblado",
    clickHint: "Haga clic en cualquier punto del mapa para consultar el trayecto a pie.",
    details: "Detalles",
    pickTitle: "Elija una estación",
    pickBody1:
      "Haga clic en una estación del mapa, o use Buscar estación, para ver hasta dónde se puede caminar desde ella en 5, 10 y 15 minutos.",
    pickBody2: "Cambie a Cobertura para ver el tiempo a pie hasta la estación más cercana en toda la ciudad.",
    reachable: "Área alcanzable a pie",
    min: (m: number) => `${m} min`,
    overlapShare: (share: string) => `${share} del área de 15 minutos también está a 15 minutos de otra estación.`,
    underOne: "Menos del 1 %",
    nearest: "Estaciones más cercanas",
    straightLine: (d: string) => `${d} en línea recta`,
    overlap: ", sus áreas se superponen",
    touch: ", sus áreas apenas se tocan",
    snapNote: (m: string) =>
      `Los contornos parten del punto de calle más cercano a la estación (a ${m} m). Las entradas de las estaciones no están en los datos, así que los bordes tienen un margen de decenas de metros.`,
    coverageTitle: "Tiempo a pie hasta la estación más cercana",
    using: (filter: string, n: number) => `Con ${filter} (${n}).`,
    band: (m: number) => (m === 5 ? "Hasta 5 min" : `${m - 4}–${m} min`),
    within15: "A 15 min o menos",
    urbanShare: "Del área urbana de Medellín",
    twice: "Cubierta dos o más veces",
    barriosTitle: (n: number, total: number) => `Barrios totalmente a 15 minutos: ${n} de ${total}`,
    barriosNote: (pct: string) =>
      `Solo barrios urbanos de Medellín (los datos no incluyen otros municipios). Totalmente significa al menos el ${pct} del área.`,
    filterBarrios: "Filtrar barrios",
    findBarrio: "Buscar un barrio",
    comuna: (n: number) => `Comuna ${n}`,
    noMatch: "Sin resultados.",
    within5: "A 5 minutos o menos",
    minutesRange: (m: number) => `${m - 4}–${m} minutos`,
    onFootTo: (name: string) => `a pie hasta ${name}.`,
    beyond: "A más de 15 minutos a pie de cualquier estación mostrada.",
    clear: "Borrar",
    pointNote: (lat: string, lon: string) =>
      `En ${lat}, ${lon}. Respuesta tomada de los contornos precalculados de 5, 10 y 15 minutos, así que la resolución es de 5 minutos.`,
  },
  demo: {
    label: "Demo guiada",
    step: (i: number, n: number) => `Paso ${i} de ${n}`,
    back: "Atrás",
    next: "Siguiente",
    finish: "Finalizar",
    end: "Terminar demo",
    keys: "← y → para avanzar, Esc para salir",
    failed: (message: string) => `No se pudo iniciar la demo: ${message}.`,
  },
  tour: [
    {
      title: "La red en el pico de la tarde",
      caption: (f: DemoFacts) =>
        `Un día hábil promedio de 2026 a las ${hh(f.systemPeakHour)}, la hora más concurrida (${formatPercent(f.systemPeakShare)} de los abordajes del día). Solo la Línea A concentra el ${formatPercent(f.lineAShare)} de los abordajes en días hábiles.`,
    },
    {
      title: "Cada línea tiene su propio día",
      caption: (f: DemoFacts) =>
        `Ahora el grosor muestra la proporción de cada línea sobre su propio día. Las líneas de Metrocable tienen su pico a las ${hh(f.cablePeakHour)}, antes que el resto de la red; el pico de la ciudad llega en la tarde.`,
    },
    {
      title: "La Línea A en detalle",
      caption: (f: DemoFacts) =>
        `${formatInt(f.lineAWeekday)} abordajes en un día hábil promedio, con pico a las ${hh(f.lineAPeakHour)} y el ${formatPercent(f.lineAPeakShare)} del día. Quien cambia de línea se cuenta una vez en cada línea.`,
    },
    {
      title: "Cuándo se exige la red",
      caption: (f: DemoFacts) =>
        `El mapa de calor muestra el ritmo de cada línea: los cables son más intensos al amanecer, mientras que Arví (L) se mantiene estable todo el día (pico ÷ promedio ${formatDecimal(f.arviPeakToAverage, 2)}).`,
    },
    {
      title: "Un posible techo en la Línea A",
      caption: (f: DemoFacts) =>
        `La hora más concurrida de la Línea A casi no cambia de un día hábil a otro: el percentil 95 está apenas ${formatPercent(f.lineAP95AboveMedian)} por encima de la mediana (índice de saturación ${formatDecimal(f.lineASaturation, 2)}). Es solo una aproximación: los datos no tienen capacidad ni conteos a bordo.`,
    },
    {
      title: "Días fuera de lo normal",
      caption: (f: DemoFacts) =>
        `El ${formatDate(f.topSpike.date)} estuvo ${signed(f.topSpike.value)} por encima de días comparables. Causa probable (hipótesis): ${f.topSpike.driver}.`,
    },
    {
      title: "Las caídas más profundas",
      caption: (f: DemoFacts) =>
        `${formatDate(f.topDip.date)}: ${signed(f.topDip.value)} frente a días comparables. Causa probable (hipótesis): ${f.topDip.driver}. Los tres domingos electorales de 2026 son los días más bajos del año.`,
    },
    {
      title: "Comparación equivalente",
      caption: (f: DemoFacts) =>
        `Comparando solo enero–julio, porque falta octubre–diciembre de 2025: 2026 va ${formatPercent(f.growth2026, { signed: true })} frente a 2025, después de que 2025 creció ${formatPercent(f.growth2025, { signed: true })} sobre 2024.`,
    },
    {
      title: "Quince minutos a pie",
      caption: (f: DemoFacts) =>
        `Las áreas caminables siguen las calles reales. Desde Poblado se alcanzan ${formatDecimal(f.pobladoArea15, 1)} km² en 15 minutos.`,
    },
    {
      title: "Cuánta ciudad está al alcance",
      caption: (f: DemoFacts) =>
        `El ${formatPercent(f.urbanShare15, { digits: 0 })} del área urbana de Medellín está a 15 minutos a pie de una estación, y ${f.barriosFully} de ${f.barriosTotal} barrios están totalmente cubiertos. Esto es acceso, no demanda: la afluencia se registra por línea.`,
    },
  ],
};
