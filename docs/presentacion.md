# Metrodata: presentación del proyecto

**Inteligencia de afluencia para el Metro de Medellín**
Tablero en vivo: <https://metrodata.vercel.app> · Duración objetivo: **10 minutos** + preguntas

> Todas las cifras de este documento salen de los mismos archivos que alimenta el tablero (`public/data/`). Si en la demo aparece un número, es el mismo que está aquí.

---

## 1. Guion con tiempos

| Min. | Bloque | Qué mostrar | Mensaje clave |
|---|---|---|---|
| 0:00–1:00 | Contexto y problema | Portada del tablero (Flujo, 17:00) | El Metro mueve casi un millón de abordajes por día hábil, pero la información llega en hojas de cálculo por línea y por hora. |
| 1:00–2:00 | Preguntas de negocio | Las cuatro pestañas | Cuatro preguntas, una página por pregunta. |
| 2:00–3:00 | Datos y KPIs | Panel «Sobre los datos» | Qué se midió, qué no, y por qué confiar en los números. |
| 3:00–4:30 | **Flujo**: ¿dónde está la demanda? | Mapa animado y panel de la Línea A | La Línea A es la columna vertebral (64,9 %), y cada línea tiene su propio horario. |
| 4:30–6:00 | **Picos**: ¿cuándo se exige la red? | Mapa de calor y saturación | La Línea A parece tocar un techo a las 17:00. |
| 6:00–7:30 | **Calendario**: ¿qué días rompen el patrón? | Calendario, ranking y tendencia | Elecciones y diciembre explican los extremos; 2026 va −4,0 % frente a 2025. |
| 7:30–9:00 | **Acceso**: ¿a quién le sirve la red? | Mapa de áreas caminables | El 48 % del área urbana de Medellín está a 15 minutos a pie. |
| 9:00–10:00 | Conclusiones y siguientes pasos | Volver al Flujo | Qué decisiones habilita el tablero y qué datos faltan. |

**Consejo práctico:** el botón **Demo** del tablero recorre exactamente esta historia en 10 pasos, con las cifras narradas. Úselo como «diapositivas» y avance con las flechas ← →.

---

## 2. Contexto y problema de negocio

El Metro de Medellín opera un sistema integrado de 12 líneas con ridership registrado:
- **Metro:** A y B.
- **Tranvía de Ayacucho:** T-A.
- **Metrocable:** H, J, K, L, M y P.
- **Metroplús:** 1, 2 y O.

La empresa publica la afluencia como abordajes por línea, por día y por hora. Son más de **773 millones de registros de abordaje** entre enero de 2024 y julio de 2026. Es mucha información, pero en ese formato:

- no se ve **dónde** se concentra la demanda dentro de la red;
- no se sabe **cuándo** el sistema llega a su límite;
- no se distinguen los días **atípicos** de los normales;
- y no se conecta la red con **la ciudad a la que sirve**.

**Objetivo del proyecto:** convertir esos datos en un tablero que responda preguntas concretas de operación, planeación y comunicación, sin inventar información que los datos no tienen.

**Usuarios previstos:**

| Área | Para qué lo usaría |
|---|---|
| Operación | Programación de flota y personal por franja horaria |
| Planeación | Priorizar inversiones y evaluar la cobertura de la red |
| Comunicaciones y mercadeo | Anticipar días de alta y baja demanda |
| Gerencia | Seguimiento de la tendencia comparable año a año |

---

## 3. Las preguntas de negocio

| # | Pregunta | Página del tablero |
|---|---|---|
| 1 | ¿Qué líneas cargan la red y cómo cambia la demanda a lo largo del día? | **Flujo** |
| 2 | ¿Cuándo y dónde se exige más el sistema? ¿Hay líneas cerca de su límite? | **Picos** |
| 3 | ¿Qué días se comportan fuera de lo normal y por qué podría ser? ¿Estamos creciendo? | **Calendario** |
| 4 | ¿Qué parte de la ciudad tiene una estación a una distancia caminable? | **Acceso** |

Cada página responde una sola pregunta. Los filtros globales de **año** y **tipo de día** (hábil, sábado, domingo o festivo) permiten repetir la pregunta en otro contexto.

---

## 4. Los datos (y por qué confiar en ellos)

**Fuentes:**
- Afluencia horaria por línea 2024–2026 (Excel del Metro).
- Estaciones, trazados de líneas y rutas alimentadoras (GeoJSON de datos abiertos).
- Barrios y comunas de Medellín.
- Calles de OpenStreetMap, usadas para las áreas caminables.

**Controles de calidad** (automatizados, con pruebas):
- **Cuadre total:** los totales de 2026 coinciden exactamente con el total general del archivo fuente (185.914.886).
- **Cuadre por fila:** en cada fila, la suma de las horas es igual al total diario (0 diferencias), y no hay registros duplicados.
- **Día excluido:** el **20 feb 2024** registró solo 6.570 abordajes, contra unos 700.000 esperados (probable falla de registro), y se excluye de todos los indicadores.
- **Cierres:** los días en que una línea no operó (por ejemplo, el mantenimiento semanal de la Línea L) se tratan como **cierres, no como ceros**, para no subestimar los promedios.
- **Falta octubre–diciembre de 2025.** Por eso **toda comparación interanual usa solo enero–julio** («comparación equivalente»).

**Lo que los datos NO tienen**, y que el tablero no inventa:
- **Ni estación ni origen–destino:** no hay afluencia por estación ni viajes de origen a destino; los mapas muestran volúmenes por línea.
- **Abordajes, no pasajeros:** quien hace transbordo se cuenta una vez en cada línea que aborda.
- **Ni capacidad ni frecuencias:** sin ocupación a bordo, capacidad ni frecuencias, los indicadores de congestión son **aproximaciones (proxies)**.

---

## 5. KPIs: qué medimos y por qué

| KPI | Definición | Pregunta de negocio | Por qué este KPI |
|---|---|---|---|
| **Abordajes promedio en día hábil** | Media diaria en días hábiles, solo días con operación | ¿Cuánta demanda atiende cada línea en un día típico? | El día hábil es el que dimensiona la operación. Excluir cierres evita promedios engañosos. |
| **Participación por línea** | Abordajes en día hábil de la línea ÷ total de las líneas | ¿Qué tan concentrada está la demanda? | Muestra la dependencia del sistema de una sola línea (riesgo operativo). |
| **Relación fin de semana** | Promedio de sábado (o domingo/festivo) ÷ promedio de día hábil | ¿Qué líneas tienen un uso distinto al laboral? | Separa las líneas de trabajo de las recreativas, como Arví. |
| **Concentración en hora pico** | Abordajes de la hora más concurrida ÷ abordajes del día | ¿Qué tan concentrada en el tiempo está la demanda? | Una hora con mucho peso exige más flota en una franja corta. |
| **Pico ÷ hora promedio** | Hora pico ÷ promedio de las horas de operación | ¿Qué tan «afilado» es el pico? | Compara líneas de distinto tamaño en la misma escala. |
| **Carga en hora pico por km** | Mediana de abordajes en hora pico de días hábiles ÷ longitud de la línea | ¿Qué línea soporta más presión por kilómetro? | Normaliza por tamaño: una línea corta y llena puede estar más exigida que una larga. |
| **Índice de saturación (aprox.)** | P95 ÷ mediana del volumen en la hora pico de los días hábiles | ¿Hay líneas que chocan contra un techo? | Si el pico casi no varía (índice ≈ 1), la demanda podría estar limitada por la capacidad. **Es una aproximación**, no una medición de ocupación. |
| **Índice de picos** | Abordajes del día ÷ esperado − 1 (el esperado es la mediana del mismo día de la semana y tipo de día en ±35 días) | ¿Qué días se salen de lo normal? | Compara cada día con sus pares, sin confundir un domingo con un lunes. |
| **Crecimiento comparable** | Promedio diario ene–jul del año ÷ ene–jul del año anterior − 1 | ¿Estamos creciendo? | Es la única comparación honesta, porque falta el cuarto trimestre de 2025. |
| **Cobertura a pie** | Área urbana a ≤15 min caminando de una estación (calculada sobre calles reales) | ¿A qué parte de la ciudad le sirve la red? | Mide el acceso físico, el complemento de la demanda. |

Validación: los indicadores se calculan en Python con pruebas automáticas contra valores de referencia (tolerancia del 0,5 %), y el tablero muestra **exactamente esos números**.

---

## 6. Por qué cada gráfico

Los gráficos se eligieron según la **función** de cada pregunta (comparar, distribución, tendencia, ubicación), siguiendo el catálogo de [datavizproject.com](https://datavizproject.com/). La identidad visual replica la del sitio oficial del Metro: colores oficiales de cada línea, tipografía Outfit y verde Metro.

### Página 1: Flujo

| Gráfico | Por qué | Alternativa descartada |
|---|---|---|
| **Mapa de flujo animado** (grosor y brillo = abordajes, puntos en movimiento = volumen) | La pregunta es espacial y temporal: «dónde» y «a qué hora». El mapa muestra la red como la conoce el usuario, y la animación cuenta el día completo. | Barras por línea: pierden la geografía. Mapa estático: pierde la hora. |
| **Selector «el grosor muestra»** (abordajes / por km / % del día) | La Línea A aplasta visualmente a las demás. «% del día» muestra el **ritmo** de cada línea sin importar su tamaño. | Escala logarítmica: difícil de leer para público de negocio. |
| **Perfil horario (área)** en el panel de cada línea | Muestra la forma del día: un pico o dos. | Tabla de 20 horas: no se ve la forma. |

### Página 2: Picos

| Gráfico | Por qué | Alternativa descartada |
|---|---|---|
| **Mapa de calor línea × hora** | Doce líneas por veinte horas son 240 valores; el color permite ver patrones de un vistazo (los cables al amanecer). | Doce gráficos de línea superpuestos: ilegibles. |
| **Perfil del sistema por tipo de día** (líneas) | Compara la forma del día hábil, el sábado y el domingo en un solo vistazo. | Barras agrupadas: fragmentan la continuidad horaria. |
| **Tabla de picos ordenable con mini-gráficos** | Para cifras exactas (hora y porcentaje) se lee mejor una tabla; el mini-gráfico mantiene el contexto. | Solo gráfico: se pierde la precisión. |
| **Gráfico de piruletas** (carga por km) | Ranking claro de una sola medida; los puntos huecos marcan las longitudes indicativas. | Barras: más tinta para la misma información. |
| **Gráfico de franjas** (saturación: un punto por día, mediana y P95) | Muestra la **distribución**, no solo el promedio: se ve el «techo» de la Línea A. | Caja y bigotes: oculta los días individuales. |

### Página 3: Calendario

| Gráfico | Por qué | Alternativa descartada |
|---|---|---|
| **Calendario de calor** (rojo = por debajo, azul = por encima) | Los días atípicos se ubican en el tiempo (diciembre, Semana Santa, elecciones). Rojo–azul es legible para personas con daltonismo. | Serie de tiempo diaria: el ruido semanal tapa los eventos. |
| **Ranking de picos y caídas** con etiqueta «causa probable (hipótesis)» | Responde «¿cuáles fueron los días?» y propone una explicación **verificable**, no una afirmación. | Solo el calendario: obliga a buscar. |
| **Día frente a horas esperadas** | Muestra **cuándo** dentro del día se ganó o se perdió la demanda. | Solo el total diario. |
| **Pesas por mes** y **barras divergentes por hora** (ene–jul) | Comparan los tres años mes a mes sin mezclar periodos incompletos. | Un total anual: compararía 12 meses con 7. |

### Página 4: Acceso

| Gráfico | Por qué | Alternativa descartada |
|---|---|---|
| **Isócronas de 5/10/15 min** sobre calles reales | Caminar no es en línea recta: las laderas y el río cambian el alcance. | Círculos de 500 m: sobreestiman el acceso en laderas. |
| **Mapa de cobertura** (tiempo a la estación más cercana) y **superposición** | Muestra los vacíos y las zonas cubiertas dos veces. | Solo un porcentaje: no dice dónde. |
| **Lista de barrios totalmente cubiertos** | Traduce la geografía en una lista accionable. | — |

---

## 7. La historia que cuentan los datos

### 7.1 Una red que depende de su columna vertebral (Flujo)

- **Volumen:** en un día hábil promedio de 2026 el sistema registra **1.052.491 abordajes**. La hora más concurrida es **17:00–17:59**, con el **10,2 %** de los abordajes del día.
- **Concentración:** la **Línea A concentra el 64,9 %** de los abordajes en días hábiles, **683.405 por día**. Le siguen la Línea 1 (9,8 %), la B (9,2 %) y el Tranvía (5,5 %).
- **Ritmos distintos:**
  - Los **Metrocables H, J, K y P tienen su pico a las 05:00**, antes que el resto de la red. En la Línea H, el **20 %** de sus abordajes del día ocurre en esa sola hora.
  - La Línea A y la B tienen dos picos (mañana y 17:00).
- **Fines de semana:**
  - El sábado mueve el **74 %** de un día hábil, y el domingo o festivo el **34 %**.
  - La **Línea L (Arví)** es la excepción: los domingos y festivos tiene **3,2 veces** los abordajes de un día hábil. Es una línea **recreativa**.
  - La **Línea K** atiende lo mismo un sábado que un día hábil (1,01).

**Para la empresa:** la operación de la Línea A es crítica para todo el sistema, y los cables necesitan su refuerzo **antes del amanecer**, no a la hora del pico general.

### 7.2 Un posible techo en la Línea A (Picos)

- **Carga por km:** la Línea A registra **3.158 abordajes por km en la hora pico** (mediana de días hábiles), casi el doble de la siguiente (B, 1.810).
- **Saturación (aproximación):** el volumen de la hora pico de la Línea A **casi no varía** de un día hábil a otro.
  - El percentil 95 está apenas **5,6 % por encima de la mediana**, con un índice de saturación de **1,06**.
  - Su récord por hora es prácticamente el mismo cada año: **88.553 (2024), 89.551 (2025) y 89.036 (2026)**.
- **Hipótesis:** si la demanda fuera libre, los días más fuertes se dispararían; un tope tan estable sugiere que **la capacidad de la Línea A podría estar limitando la demanda en la hora pico**.
- **Limitación:** es una **aproximación**. Sin datos de capacidad, frecuencias ni ocupación a bordo no se puede afirmar; habría que confirmarlo con datos operativos.

**Para la empresa:** es una señal para priorizar estudios de capacidad en la Línea A en la franja de 17:00.

### 7.3 Los días que rompen el patrón y la tendencia (Calendario)

- **Mayores subidas:**
  - Los domingos de diciembre de 2024: el **22 dic 2024, +35,1 %**, y el 15 dic, +26,1 %. Causa probable (hipótesis): **alumbrados navideños**.
  - **Puentes festivos**, por ejemplo +25,8 % el 29 jun 2025.
  - La **Feria de las Flores**: +23,4 % el 10 ago 2025.
- **Mayores caídas:**
  - Los **tres domingos electorales de 2026**: −62 % a −65 %. Son los días más bajos del año.
  - Fin de año: 31 dic 2024, −45 %.
  - Los sábados de **Semana Santa**: alrededor de −37 %.
- **Tendencia comparable** (ene–jul):
  - **2024 → 2025: +2,2 %**, de 894.007 a 913.899 abordajes diarios.
  - **2025 → 2026: −4,0 %**, de 913.899 a 876.957.
  - La caída es generalizada: Línea A −4,3 %, B −5,6 %, **O −10,9 %**. Crece la **Línea L (+12,9 %)**.
  - Los tres domingos electorales explican menos de medio punto de esa caída. La causa principal **no está en los datos** y merece análisis.

**Para la empresa:** los eventos de alta demanda son predecibles (diciembre, puentes, ferias), así que se puede programar flota y comunicación con anticipación. La caída de 2026 es la alerta principal del tablero.

### 7.4 ¿A quién le sirve la red? (Acceso)

- **Cobertura total:** las 50 estaciones principales cubren **69,9 km²** a 15 minutos a pie. Eso es el **48 % del área urbana de Medellín**, y **90 de 269 barrios** quedan totalmente cubiertos.
- **Por red:**
  - Metro: 31 % del área urbana y 49 barrios.
  - Metrocable: 20 % y 43 barrios.
  - Tranvía: 10 % y 17 barrios.
- **Superposición:** **30 km²** quedan cubiertos por dos o más estaciones, lo que indica zonas con redundancia.
- **Calles reales:** las áreas siguen las calles. Desde Poblado se alcanzan **2,7 km²** en 15 minutos, y en las estaciones de ladera el área es mucho menor por la topografía.

**Para la empresa:** la mitad del área urbana no tiene una estación a 15 minutos a pie. Ahí la red depende de las rutas alimentadoras, que también aparecen en el mapa de flujo como capa opcional. Esto es **acceso, no demanda**: no hay datos por estación.

---

## 8. Conclusiones y recomendaciones

1. **Proteger la Línea A.** Concentra casi dos de cada tres abordajes y muestra señales de techo en la hora pico. Se recomienda un estudio de capacidad con datos operativos.
2. **Operar por ritmo, no por promedio.** Los cables piden refuerzo a las 05:00. La Línea L necesita su capacidad los fines de semana. El sábado concentra su pico al mediodía.
3. **Planear los eventos.** Diciembre, los puentes y la Feria son subidas predecibles; las elecciones y el fin de año, caídas predecibles.
4. **Investigar la caída de 2026** (−4,0 % comparable), especialmente en la Línea O (−10,9 %), cruzándola con obras, tarifas y movilidad.
5. **Usar la cobertura para priorizar la intermodalidad**, con alimentadores y estaciones nuevas donde no hay acceso a pie.

## 9. Limitaciones (decirlas en voz alta genera confianza)

- **Abordajes, no pasajeros:** hay abordajes por línea, no pasajeros únicos ni datos por estación ni de origen–destino.
- **Congestión aproximada:** los indicadores de congestión son aproximaciones, sin capacidad, frecuencias ni ocupación a bordo.
- **Causas como hipótesis:** las causas de los picos y caídas son hipótesis por verificar. Las fechas de la Feria de las Flores son externas a los datos.
- **Año incompleto:** falta octubre–diciembre de 2025, así que solo se comparan enero–julio.
- **Longitudes indicativas:** las longitudes de las líneas 1, 2 y O son indicativas (corredores de buses); la Línea O se dibuja con su trazado proyectado.
- **Precisión de las áreas caminables:** parten del punto de calle más cercano a cada estación, no de sus entradas reales (margen de decenas de metros), y los barrios solo están disponibles para Medellín.

## 10. Siguientes pasos

- Datos de **validaciones por estación** y **origen–destino**, para pasar de líneas a estaciones.
- **Capacidad y frecuencias** por línea, para convertir el índice de saturación en ocupación real.
- **Población por barrio**, para medir personas cubiertas y no solo área.
- **Actualización automática** de los datos.

---

## Anexo A: el tablero en una frase por página

| Página | Pregunta | Respuesta |
|---|---|---|
| Flujo | ¿Dónde está la demanda? | En la Línea A (64,9 %), con un pico a las 17:00 y los cables al amanecer. |
| Picos | ¿Cuándo se exige la red? | Entre semana a las 17:00. La Línea A parece tocar un techo cercano a 89.000 abordajes por hora. |
| Calendario | ¿Qué días rompen el patrón? | Diciembre y los puentes suben; las elecciones y el fin de año bajan; 2026 cae −4,0 %. |
| Acceso | ¿A quién le sirve la red? | Al 48 % del área urbana de Medellín, a 15 minutos a pie. |

## Anexo B: preguntas probables del público

- **«¿Por qué dicen abordajes y no pasajeros?»**
  Porque quien hace transbordo se cuenta en cada línea; no hay forma de identificar pasajeros únicos con estos datos.
- **«¿Cómo saben que la Línea A está saturada?»**
  No lo afirmamos. Vemos un techo muy estable en la hora pico, compatible con saturación. Confirmarlo requiere datos de capacidad.
- **«¿Por qué no comparan 2025 completo con 2024?»**
  Porque falta octubre–diciembre de 2025. Comparar 9 meses con 12 sesgaría el resultado.
- **«¿De dónde salen las áreas caminables?»**
  Del motor de rutas Valhalla sobre las calles de OpenStreetMap, a 4,8 km/h, calculadas para cada estación.
- **«¿Los números son confiables?»**
  Cuadran con el total del archivo fuente, tienen pruebas automáticas y el tablero muestra exactamente los mismos valores.

## Anexo C: glosario

| Término | Significado |
|---|---|
| **Abordaje** | Ingreso de una persona a una línea |
| **Día hábil** | Lunes a viernes no festivo |
| **Comparación equivalente** | Comparar los mismos meses (enero–julio) de cada año |
| **P95** | Valor que solo supera el 5 % de los días |
| **Isócrona** | Área alcanzable en un tiempo dado, caminando por calles reales |
| **Proxy (aproximación)** | Indicador indirecto de algo que no se puede medir con los datos disponibles |
