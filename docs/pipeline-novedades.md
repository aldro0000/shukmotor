# Pipeline de novedades

El workflow `novedades.yml` consulta a las 12 y 21 UTC (9 y 18 en Argentina),
y también admite ejecución manual desde Actions. No requiere servidor propio.
Los datos oficiales y la metadata de YouTube van directo a `main`; las notas
propias pasan por un PR. Nunca se copia el cuerpo de artículos externos.

## Habilitación

1. En GitHub, Settings → Secrets and variables → Actions, agregar `YOUTUBE_API_KEY`
   de un proyecto con YouTube Data API v3 habilitada. Sin clave se informa una
   advertencia y el resto del pipeline continúa. Nunca usar una variable `VITE_`.
2. En Settings → Actions → General, permitir que GitHub Actions cree pull requests.
   El YAML solicita `contents: write`, `pull-requests: write` e `issues: write`.
   Si las reglas de `main` impiden pushes del bot, habrá que autorizarlo según la
   política del repositorio o cambiar la publicación de datos a PR; el workflow
   no altera esa configuración.
3. Ejecutar «Novedades automáticas» manualmente para verificar permisos y fuentes.
   Vercel sigue conectado a `main`; el workflow no necesita secretos de Vercel.

## Flujo editorial y publicación

- `borradores.ts` genera `estado: 'borrador'` con evidencia propia.
- En la rama `auto/novedades-<run>-<intento>`, `publicar-borradores.ts` prepara
  sólo los nuevos IDs con `estado: 'publicado'`. El texto completo está en el PR.
- Esa rama **no está en producción**. El editor modifica o elimina las notas y
  revisa el diff antes de integrar. No hay auto-merge.
- El merge introduce juntos el texto aprobado y su estado publicado; la web
  muestra sólo ese estado. No se inventan imágenes para las notas sin fotos.
- `publicar-borrador.yml`, disparado por PR cerrado e integrado, verifica el
  commit del merge. No puede modificar retroactivamente un commit ya creado.
  Por eso el cambio de estado se prepara ANTES del merge, no después.
- Mientras haya un PR editorial abierto, se respetan sus ediciones: se siguen
  actualizando precios/videos, pero se espera para generar otro lote editorial.
- Los vistos del radar se confirman en ese mismo PR. Cerrar un PR sin integrar
  no marca sus referencias como revisadas. Se pueden volver a ofrecer hasta
  que tengan más de siete días.

## Fuentes y límites

Radar: nueve RSS y doce búsquedas de Google News. Sólo se retienen título,
fuente, enlace, fecha y slugs relacionados en `data/.tmp/`, ignorado por Git.
`data/radar-vistos.json` contiene hashes y fechas, nunca títulos ni cuerpos.
Cada lote entrega hasta 60 referencias y 8 borradores; lo no entregado no se
marca visto. Los titulares se escapan para Markdown, no se interpretan como
instrucciones. Un fallo de feed se reporta en un issue; las fuentes válidas
pueden entregar un PR parcial y las fallidas se vuelven a consultar.

YouTube: lista editable en `scripts/canales-youtube.json`, actualmente
[Matías Antico](https://www.youtube.com/@MatiasAnticoTV) y
[Eduardo Smok](https://www.youtube.com/channel/UCoPk_bS6CXbmZ6DuxQqwNBw).
Se resuelven canales usando la API, nunca se inventan IDs. El cursor persistido
recorre gradualmente todos los pares modelo/canal. Se solicitan hasta 50
resultados ordenados por vistas en cada búsqueda; se conservan hasta tres por
modelo, públicos, insertables, de al menos 3 minutos y hasta 180 días. Se
actualizan los videos ya guardados antes de descubrir otros: los retirados o
vencidos desaparecen del archivo generado. `videosDe()` sigue apagada a pedido
del dueño: reactivarla en las fichas requiere una decisión posterior.

La cuota se registra antes de cada llamada, incluidos errores. Se reinicia a
medianoche del Pacífico, no de Argentina, con techo conservador de 8000 unidades
(100 por búsqueda) y además 80 búsquedas/día. La documentación vigente separa
el límite de búsquedas del resto de endpoints; los dos controles evitan
superar el presupuesto solicitado. El registro cuenta sólo este pipeline;
no puede conocer consumos de otra app que use el mismo proyecto de Google.

Referencias: [YouTube search.list](https://developers.google.com/youtube/v3/docs/search/list),
[cuotas](https://developers.google.com/youtube/v3/getting-started),
[políticas de metadata](https://developers.google.com/youtube/terms/developer-policies),
[eventos de Actions](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows).

## Precios y evidencia

El diff conserva los movimientos históricos y deduplica por ID estable. No
mezcla USD con ARS: registra la moneda y valores originales; los campos ARS
quedan vacíos si la fuente cotiza en USD. Un cambio de moneda no se presenta
como una suba o baja. Las frecuencias de aumento cuentan fechas distintas,
no la cantidad de versiones modificadas el mismo día.

`/precios` usa un historial compacto de referencias 0km extraído de los snapshots.
Cada versión y moneda tiene su propia serie. Sin dos observaciones no dibuja
una tendencia. La ficha enlaza por modelo y aclara que la versión de ACARA
puede ser otra. No se altera el precio de calle ilustrativo del catálogo.
El presupuesto compara referencias oficiales entre meses; no afirma que una
baja en ACARA sea un descuento real de una concesionaria.

## Verificación local

En PowerShell, anteponer `$env:Path = 'C:\Program Files\nodejs;' + $env:Path`.

```text
npm run test:pipeline
npm run snapshot:precios
npm run diff:precios
npm run historial:precios
npm run radar
npm run borradores
npm run pr:body
npm run fetch:videos
npx tsc -b
npm run check:data
npm run build
npm run verificar
```

No ejecutar `afinar` ni `comprimir` para este trabajo.

Validación inicial (10/9/2026): build y chequeo de datos pasan. El RSS real
de Motor1 produce 20 ítems y Google News 100. El radar entregó 60 referencias;
Autoblog/FeedBurner, MotorMagazine y Carmuv devolvieron HTML en vez de RSS.
YouTube requiere la clave, por lo que se verificó con fixtures, sin afirmar
una corrida real autenticada. `verificar` detecta una condición previa del
catálogo: una grilla tiene 3 etiquetas distintas donde exige 4. El catálogo,
su lógica de etiquetas y esa prueba no fueron modificados.
