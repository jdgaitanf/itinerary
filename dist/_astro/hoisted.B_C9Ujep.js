const x="viajeGraph",I="itineraryList";function C(){const n=localStorage.getItem(x);if(!n)return null;try{return JSON.parse(n)}catch{return null}}function L(n){localStorage.setItem(x,JSON.stringify(n))}function N(){return localStorage.getItem(x)!==null}function T(){const n=localStorage.getItem(I);if(!n)return null;try{return JSON.parse(n)}catch{return null}}function E(n){localStorage.setItem(I,JSON.stringify(n))}function B(){return localStorage.getItem(I)!==null}async function R(n){const e=[],t=[];for(const a of n.referencias.nodos)try{const o=await fetch(`/itinerary/data/${a}`);if(!o.ok){console.error(`Error loading node: ${a}`);continue}const s=await o.json();e.push(s)}catch(o){console.error(`Error loading node ${a}:`,o)}for(const a of n.referencias.aristas)try{const o=await fetch(`/itinerary/data/${a}`);if(!o.ok){console.error(`Error loading edge: ${a}`);continue}const s=await o.json();t.push(s)}catch(o){console.error(`Error loading edge ${a}:`,o)}return{version:n.version,nombre_viaje:n.nombre_viaje,fechas:n.fechas,nodos:e,aristas:t}}function M(n,e){let t=n.aristas.filter(a=>a.origen_id===e);return t=q(t),t}function q(n){return n.sort((t,a)=>{const o=new Date(`${t.logistica_salida.fecha_salida}T${t.logistica_salida.hora_salida_origen}`);return new Date(`${a.logistica_salida.fecha_salida}T${a.logistica_salida.hora_salida_origen}`)-o})}const b=500;function O(n){const e=n.nodos.find(t=>t.tipo==="casa_origen");if(!e)throw new Error('Grafo inválido: no se encontró un nodo de tipo "casa_origen".');return e}function G(n,e,t){return t.has(e)?[]:(t.add(e),M(n,e))}function w(n){const e=O(n),t=new Set(n.aristas.map(h=>h.id)),a=new Set,o=new Map,s=[],d=new Set,i=[];let p=e,c=0;o.set(e.id,0);const f=e.visitas&&e.visitas.length>0?e.visitas[0].entrada:"";for(i.push({tipo:"nodo",id:e.id,visitaIndex:0,fecha:f});(s.length>0||t.size>0)&&c<b;){c++;const h=G(n,p.id,a);for(const v of h)t.has(v.id)&&!d.has(v.id)&&(d.add(v.id),s.push(v.id));const l=s.pop();if(!l){console.warn(`Grafo posiblemente desconectado. Quedan ${t.size} aristas sin procesar.`);break}if(d.delete(l),!t.has(l))continue;const r=n.aristas.find(v=>v.id===l);if(!r){t.delete(l),console.warn(`Arista con ID "${l}" no encontrada en el grafo. Se omite.`);continue}const g=r.logistica_salida?.fecha_salida||"";i.push({tipo:"arista",id:r.id,fecha:g}),t.delete(r.id);const u=n.nodos.find(v=>v.id===r.destino_id);if(!u)throw new Error(`El nodo destino "${r.destino_id}" de la arista "${r.id}" no existe en el grafo.`);const m=o.get(u.id)||0,_=i.find(v=>v.tipo==="nodo"&&v.id===u.id&&v.visitaIndex===m);let y=m;_?(y=m+1,o.set(u.id,y)):o.set(u.id,m);let $=r.logistica_salida?.fecha_salida||"";$||($=(u.visitas&&u.visitas.length>0?u.visitas[Math.min(y,u.visitas.length-1)]:null)?.entrada||""),i.push({tipo:"nodo",id:u.id,visitaIndex:y,fecha:$}),p=u}return c>=b&&console.warn(`El recorrido alcanzó el límite de ${b} iteraciones. Quedan ${t.size} aristas sin procesar.`),console.log(i),i}async function H(){if(N()){const n=C();if(!B()){const e=w(n);E(e)}return n}try{const n=await fetch("/itinerary/data/viaje-raiz.json");if(!n.ok)throw new Error(`HTTP error! status: ${n.status}`);const e=await n.json(),t=await R(e);L(t);const a=w(t);return E(a),t}catch(n){return console.error("Error loading viaje data:",n),null}}class F{constructor(){this.graph=null,this.itinerary=null,this.loading=!1,this.loaded=!1}async getData(){if(this.loaded&&this.graph)return{graph:this.graph,itinerary:this.itinerary};if(this.loading)return await new Promise(e=>{const t=setInterval(()=>{this.loading||(clearInterval(t),e())},50)}),{graph:this.graph,itinerary:this.itinerary};this.loading=!0;try{const e=await H();return this.graph=e,this.itinerary=T(),this.loaded=!0,{graph:this.graph,itinerary:this.itinerary}}catch(e){throw console.error("Error loading data:",e),e}finally{this.loading=!1}}getGraph(){return this.graph||C()}getItinerary(){return this.itinerary||T()}isLoaded(){return this.loaded}reset(){this.graph=null,this.itinerary=null,this.loaded=!1}}const A=new F;async function P(){let n="Itinerario";try{const t=await A.getData();t&&t.graph&&t.graph.nombre_viaje&&(n=t.graph.nombre_viaje)}catch(t){console.error("Error loading viaje name:",t)}document.title=n;const e=document.querySelector("h1");e&&(e.textContent=n)}P();(function(){const n=document.getElementById("home-content"),e=document.getElementById("settings-content"),t=document.querySelectorAll("[data-tab]");function a(s){if(s==="home")n.style.display="block",e.style.display="none";else if(s==="settings")n.style.display="none",e.style.display="block";else return;t.forEach(d=>{d.dataset.tab===s?d.classList.add("active"):d.classList.remove("active")});try{localStorage.setItem("activeTab",s)}catch{}}let o=null;try{o=localStorage.getItem("activeTab")}catch{}a(o&&(o==="home"||o==="settings")?o:"home"),t.forEach(s=>{s.addEventListener("click",function(d){const i=this.dataset.tab;i&&a(i)})})})();(function(){const n=document.getElementById("clear-cache-btn"),e=document.getElementById("viaje-version"),t=document.getElementById("cache-status"),a=document.getElementById("nodos-count"),o=document.getElementById("aristas-count"),s=document.getElementById("graph-file-input"),d=document.getElementById("load-graph-btn"),i=document.getElementById("load-status"),p=document.getElementById("download-def-btn"),c=document.getElementById("settings-advanced-header"),f=document.getElementById("settings-advanced-content");function h(){N()?t.textContent="Datos en caché":t.textContent="Sin datos en caché";const g=C();g?(e.textContent=g.version||"No definida",a.textContent=g.nodos?g.nodos.length:0,o.textContent=g.aristas?g.aristas.length:0):(e.textContent="No cargado",a.textContent="0",o.textContent="0")}function l(r){const g=new FileReader;g.onload=function(u){try{const m=JSON.parse(u.target.result);if(!m.nodos||!m.aristas){i.textContent="Error: El archivo no contiene un grafo válido (faltan nodos o aristas)",i.style.color="red";return}L(m);try{const _=w(m);E(_)}catch(_){console.error("Error al construir el itinerario:",_),i.textContent="Grafo guardado pero error al construir itinerario: "+_.message,i.style.color="orange",h();return}i.textContent="Grafo cargado y guardado correctamente. Recargando...",i.style.color="green",h(),setTimeout(()=>{window.location.reload()},1500)}catch(m){i.textContent="Error al leer el archivo JSON: "+m.message,i.style.color="red",console.error("Error al cargar el archivo:",m)}},g.onerror=function(){i.textContent="Error al leer el archivo",i.style.color="red"},g.readAsText(r)}d&&s&&(d.addEventListener("click",function(){const r=s.files[0];if(!r){i.textContent="Por favor selecciona un archivo JSON primero",i.style.color="orange";return}i.textContent="Cargando...",i.style.color="blue",l(r)}),s.addEventListener("change",function(){i.textContent=""})),p&&p.addEventListener("click",function(){fetch("/itinerary/docs/ItineraryDef.md").then(r=>{if(!r.ok)throw new Error("HTTP error! status: "+r.status);return r.text()}).then(r=>{const g=new Blob([r],{type:"text/markdown"}),u=URL.createObjectURL(g),m=document.createElement("a");m.href=u,m.download="ItineraryDef.md",document.body.appendChild(m),m.click(),document.body.removeChild(m),setTimeout(()=>{URL.revokeObjectURL(u)},100),i.textContent="Definición descargada correctamente",i.style.color="green"}).catch(r=>{console.error("Error al descargar el archivo:",r),i.textContent="Error al descargar la definición: "+r.message,i.style.color="red"})}),c&&f&&c.addEventListener("click",function(){f.style.display!=="none"?(f.style.display="none",c.classList.remove("expanded")):(f.style.display="block",c.classList.add("expanded"))}),h(),n&&n.addEventListener("click",function(){try{localStorage.clear(),console.log("Caché eliminada correctamente")}catch(r){console.error("Error al eliminar la caché:",r)}window.location.reload()})})();(function(){const n=document.getElementById("theme-toggle-checkbox"),e=document.getElementById("theme-icon"),t=document.documentElement;function a(s){s?t.classList.add("dark-mode"):t.classList.remove("dark-mode"),e&&(e.textContent=s?"dark_mode":"light_mode");const d=document.querySelector('meta[name="theme-color"]');d&&(d.content=s?"#121212":"#f5f5f5");try{localStorage.setItem("darkMode",s?"true":"false")}catch{}n&&(n.checked=s)}let o=null;try{o=localStorage.getItem("darkMode")}catch{}if(o!==null)a(o==="true");else{const s=window.matchMedia("(prefers-color-scheme: dark)").matches;a(s)}n&&n.addEventListener("change",function(){a(this.checked)})})();"serviceWorker"in navigator&&window.addEventListener("load",()=>{navigator.serviceWorker.register("/itinerary/sw.js").then(n=>{console.log("Service Worker registrado con éxito:",n.scope)}).catch(n=>{console.error("Error al registrar Service Worker:",n)})});const V={aeropuerto:"flight_takeoff",hotel:"bed",casa_origen:"home",casa_amigo:"diversity_2",atraccion:"theater_comedy",festival:"music_note",oficina_alquiler:"business_center"},z={avion:"flight",tren:"train",metro:"subway",bus:"directions_bus",auto:"directions_car",caminata:"directions_walk",taxi:"taxi",transbordador:"ferry"};function J(n){return V[n]||"location_on"}function U(n){return z[n]||"arrow_forward"}const W={aeropuerto:"Aeropuerto",hotel:"Hotel",casa_origen:"Inicio",casa_amigo:"Casa de amigo",atraccion:"Atracción",festival:"Festival",oficina_alquiler:"Alquiler de auto"},Y={avion:"Avión",tren:"Tren",metro:"Metro",bus:"Bus",auto:"Auto",caminata:"Caminata",taxi:"Taxi",transbordador:"Transbordador"};function K(n){return W[n]||n}function Q(n){return Y[n]||"Desplazamiento"}function S(n){if(!n)return"";const e=n.split("-");if(e.length!==3)return n;const t=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];return`${parseInt(e[2])} ${t[parseInt(e[1])-1]} ${e[0]}`}class X{constructor(){this.icons=J,this.labels=K,this.formatDate=S}render(e,t=0,a=""){const o=this.icons(e.tipo),s=this.labels(e.tipo),d=e.visitas&&e.visitas.length>0?e.visitas[Math.min(t,e.visitas.length-1)]:null,i=a||d?.entrada||"",p=d?.salida||"",c=e.direccion?.ciudad||"",f=e.direccion?.pais||"",h=e.direccion?.maps_link||"",l=e.contacto||{},r=e.horarios||{},g=d?.clima||null,u=d?.reserva||null,m=d?.notas||null,_=e.actividades||[],y=e.equipaje_recomendado||[],$=e.moneda_local||{},v=e.idioma_principal||"",j=e.tiempo_estimado_visita||"",D=e.reglas_especiales||[];return`
      <div class="nodo-card" data-id="${e.id}" data-visita="${t}">
        <div class="nodo-card-header">
          <span class="nodo-card-icon material-symbols-outlined">${o}</span>
          <div class="nodo-card-content">
            <div class="nodo-card-title">${e.nombre||e.id}</div>
            <div class="nodo-card-subtitle">
              <span class="nodo-card-badge ${e.tipo}">${s}</span>
              ${c?` · ${c}`:""}
              ${f?`, ${f}`:""}
              ${i?` · ${this.formatDate(i)}`:""}
            </div>
          </div>
          <span class="nodo-card-toggle material-symbols-outlined">expand_more</span>
        </div>

        <div class="nodo-card-expanded">
          ${this._renderFecha(i,p)}
          ${this._renderUbicacion(c,f,h)}
          ${this._renderContacto(l)}
          ${this._renderHorarios(r)}
          ${this._renderClima(g)}
          ${this._renderReserva(u)}
          ${this._renderActividades(_)}
          ${this._renderEquipaje(y)}
          ${this._renderTiempoVisita(j)}
          ${this._renderIdioma(v)}
          ${this._renderMoneda($)}
          ${this._renderReglas(D)}
          ${this._renderNotas(m)}
        </div>
      </div>
    `}_renderFecha(e,t){return e?`
      <div class="nodo-detail-row">
        <span class="material-symbols-outlined">calendar_today</span>
        <span><strong>Entrada:</strong> ${this.formatDate(e)}${t&&t!==e?` · <strong>Salida:</strong> ${this.formatDate(t)}`:""}</span>
      </div>
    `:""}_renderUbicacion(e,t,a){return!e&&!t?"":`
      <div class="nodo-detail-row">
        <span class="material-symbols-outlined">location_on</span>
        <span>${e}${e&&t?", ":""}${t}${a?` <a href="${a}" target="_blank" rel="noopener noreferrer" class="nodo-detail-link">Ver en mapa</a>`:""}</span>
      </div>
    `}_renderContacto(e){return!e.telefono&&!e.email&&!e.web?"":`
      <div class="nodo-detail-row">
        <span class="material-symbols-outlined">contact_support</span>
        <span>
          ${e.telefono?`📞 ${e.telefono}`:""}
          ${e.email?` · ✉️ ${e.email}`:""}
          ${e.web?` · 🌐 <a href="${e.web}" target="_blank" rel="noopener noreferrer" class="nodo-detail-link">${e.web}</a>`:""}
        </span>
      </div>
    `}_renderHorarios(e){return!e.check_in&&!e.check_out&&!e.horario_apertura&&!e.horario_cierre&&!e.atencion?"":`
      <div class="nodo-detail-row">
        <span class="material-symbols-outlined">schedule</span>
        <span>
          ${e.check_in?`Check-in: ${e.check_in}`:""}
          ${e.check_out?` · Check-out: ${e.check_out}`:""}
          ${e.horario_apertura?` · Apertura: ${e.horario_apertura}`:""}
          ${e.horario_cierre?` · Cierre: ${e.horario_cierre}`:""}
          ${e.atencion?` · Atención: ${e.atencion}`:""}
        </span>
      </div>
    `}_renderClima(e){return e?`
      <div class="nodo-detail-row">
        <span class="material-symbols-outlined">partly_cloudy_day</span>
        <span>
          ${e.temperatura_promedio||""}
          ${e.condiciones||""}
          ${e.probabilidad_lluvia?` · Lluvia: ${e.probabilidad_lluvia}`:""}
          ${e.recomendacion_vestimenta?` · 👕 ${e.recomendacion_vestimenta}`:""}
        </span>
      </div>
    `:""}_renderReserva(e){return e?`
      <div class="nodo-detail-row">
        <span class="material-symbols-outlined">confirmation_number</span>
        <span>
          ${e.confirmada!==void 0?e.confirmada?"✅ Confirmada":"❌ No confirmada":""}
          ${e.nombre_titular?` · Titular: ${e.nombre_titular}`:""}
          ${e.codigo_reserva?` · Código: ${e.codigo_reserva}`:""}
          ${e.plataforma?` · ${e.plataforma}`:""}
          ${e.costo?` · 💰 ${e.costo.valor} ${e.costo.moneda}`:""}
        </span>
      </div>
    `:""}_renderActividades(e){return e.length===0?"":`
      <div class="nodo-detail-row nodo-detail-actividades">
        <span class="material-symbols-outlined">tour</span>
        <span>
          <strong>Actividades:</strong>
          <ul class="nodo-detail-list">
            ${e.map(t=>`
              <li>
                ${t.nombre||t.id}
                ${t.tipo?` (${t.tipo})`:""}
                ${t.duracion_estimada?` · ⏱️ ${t.duracion_estimada}`:""}
                ${t.horario_recomendado?` · 🕐 ${t.horario_recomendado}`:""}
                ${t.notas?` · ${t.notas}`:""}
              </li>
            `).join("")}
          </ul>
        </span>
      </div>
    `}_renderEquipaje(e){return e.length===0?"":`
      <div class="nodo-detail-row">
        <span class="material-symbols-outlined">luggage</span>
        <span>
          <strong>Equipaje recomendado:</strong>
          ${e.map(t=>`🧳 ${t}`).join(" · ")}
        </span>
      </div>
    `}_renderTiempoVisita(e){return e?`
      <div class="nodo-detail-row">
        <span class="material-symbols-outlined">hourglass_top</span>
        <span><strong>Tiempo estimado:</strong> ${e}</span>
      </div>
    `:""}_renderIdioma(e){return e?`
      <div class="nodo-detail-row">
        <span class="material-symbols-outlined">translate</span>
        <span><strong>Idioma:</strong> ${e}</span>
      </div>
    `:""}_renderMoneda(e){return e.codigo?`
      <div class="nodo-detail-row">
        <span class="material-symbols-outlined">payments</span>
        <span><strong>Moneda:</strong> ${e.codigo} ${e.simbolo||""} ${e.tasa_referencia?`(≈ ${e.tasa_referencia})`:""}</span>
      </div>
    `:""}_renderReglas(e){return e.length===0?"":`
      <div class="nodo-detail-row">
        <span class="material-symbols-outlined">gavel</span>
        <span>
          <strong>Reglas:</strong>
          <ul class="nodo-detail-list">
            ${e.map(t=>`<li>${t}</li>`).join("")}
          </ul>
        </span>
      </div>
    `}_renderNotas(e){return e?`
      <div class="nodo-detail-row nodo-detail-notas">
        <span class="material-symbols-outlined">note</span>
        <span><strong>Notas:</strong> ${e}</span>
      </div>
    `:""}}class Z{constructor(e){this.nodosMap=e,this.icons=U,this.labels=Q,this.formatDate=S}render(e){const t=this.nodosMap.get(e.origen_id),a=this.nodosMap.get(e.destino_id),o=this.icons(e.modo),s=this.labels(e.modo),d=t?t.nombre||t.id:e.origen_id,i=a?a.nombre||a.id:e.destino_id,p=e.logistica_salida?.fecha_salida||"",c=e.logistica_salida?.hora_salida_origen||"",f=e.logistica_salida?.hora_llegada_destino||"",h=e.transporte||{},l=e.tiempo_estimado||{},r=e.costos||{},g=e.notas||"",u=e.reglas_holgura||null;return`
      <div class="arista-card" data-id="${e.id}">
        <div class="arista-card-header">
          <span class="arista-card-icon material-symbols-outlined">${o}</span>
          <div class="arista-card-content">
            <div class="arista-card-title">
              <span class="arista-modo">${s}</span>
              <span class="arista-fecha">${p?`${this.formatDate(p)} ${c}`:""}</span>
              <span class="arista-duracion">${l.minutos?`${l.minutos} min`:""}</span>
            </div>
          </div>
          <span class="arista-card-toggle material-symbols-outlined">expand_more</span>
        </div>

        <div class="arista-card-expanded">
          ${this._renderTrayecto(d,i)}
          ${this._renderTransporte(h)}
          ${this._renderTerminales(h)}
          ${this._renderCodigoReserva(h)}
          ${this._renderFechas(p,c,f)}
          ${this._renderTiempo(l)}
          ${this._renderHolgura(u)}
          ${this._renderCostos(r)}
          ${this._renderDetalles(h)}
          ${this._renderNotas(g)}
        </div>
      </div>
    `}_renderTrayecto(e,t){return`
      <div class="arista-detail-row">
        <span class="material-symbols-outlined">route</span>
        <span><strong>Trayecto:</strong> ${e} → ${t}</span>
      </div>
    `}_renderTransporte(e){return!e.compania&&!e.tipo_vehiculo&&!e.numero_vuelo&&!e.linea?"":`
      <div class="arista-detail-row">
        <span class="material-symbols-outlined">directions_car</span>
        <span>
          ${e.compania?`${e.compania}`:""}
          ${e.tipo_vehiculo?` · ${e.tipo_vehiculo}`:""}
          ${e.numero_vuelo?` · ✈️ ${e.numero_vuelo}`:""}
          ${e.linea?` · 🚆 ${e.linea}`:""}
        </span>
      </div>
    `}_renderTerminales(e){return!e.terminal_origen&&!e.terminal_destino?"":`
      <div class="arista-detail-row">
        <span class="material-symbols-outlined">terminal</span>
        <span>
          ${e.terminal_origen?`Terminal origen: ${e.terminal_origen}`:""}
          ${e.terminal_destino?` · Terminal destino: ${e.terminal_destino}`:""}
        </span>
      </div>
    `}_renderCodigoReserva(e){return e.codigo_reserva_confirmacion?`
      <div class="arista-detail-row">
        <span class="material-symbols-outlined">confirmation_number</span>
        <span><strong>Código de reserva:</strong> ${e.codigo_reserva_confirmacion}</span>
      </div>
    `:""}_renderFechas(e,t,a){return!e&&!t&&!a?"":`
      <div class="arista-detail-row">
        <span class="material-symbols-outlined">schedule</span>
        <span>
          ${e?`<strong>Fecha:</strong> ${this.formatDate(e)}`:""}
          ${t?` · <strong>Salida:</strong> ${t}`:""}
          ${a?` · <strong>Llegada:</strong> ${a}`:""}
        </span>
      </div>
    `}_renderTiempo(e){return!e.minutos&&!e.rango?"":`
      <div class="arista-detail-row">
        <span class="material-symbols-outlined">hourglass_bottom</span>
        <span>
          <strong>Tiempo estimado:</strong> 
          ${e.minutos?`${e.minutos} min`:""}
          ${e.rango?` (${e.rango})`:""}
          ${e.con_holgura?` · Con holgura: ${e.con_holgura} min`:""}
        </span>
      </div>
    `}_renderHolgura(e){return e?`
      <div class="arista-detail-row arista-detail-holgura">
        <span class="material-symbols-outlined">warning</span>
        <span>
          <strong>${e.tiempo_requerido||""}</strong>
          ${e.motivo?` · ${e.motivo}`:""}
        </span>
      </div>
    `:""}_renderCostos(e){return!e.valor&&!e.moneda?"":`
      <div class="arista-detail-row">
        <span class="material-symbols-outlined">payments</span>
        <span>
          <strong>Costo:</strong> ${e.valor||""} ${e.moneda||""}
          ${e.pagado_por?` · Pagado por: ${e.pagado_por}`:""}
          ${e.incluido_en?` · Incluido en: ${e.incluido_en}`:""}
        </span>
      </div>
    `}_renderDetalles(e){return e.detalles?`
      <div class="arista-detail-row">
        <span class="material-symbols-outlined">info</span>
        <span>${e.detalles}</span>
      </div>
    `:""}_renderNotas(e){return e?`
      <div class="arista-detail-row arista-detail-notas">
        <span class="material-symbols-outlined">note</span>
        <span><strong>Notas:</strong> ${e}</span>
      </div>
    `:""}}function ee(n){const e=n.querySelector(".nodo-card-expanded, .arista-card-expanded"),t=n.querySelector(".nodo-card-toggle, .arista-card-toggle");if(!e||!t)return;document.querySelectorAll(".nodo-card.expanded, .arista-card.expanded").forEach(o=>{if(o!==n){const s=o.querySelector(".nodo-card-expanded, .arista-card-expanded"),d=o.querySelector(".nodo-card-toggle, .arista-card-toggle");s&&d&&(s.style.maxHeight="0",s.style.opacity="0",d.textContent="expand_more",o.classList.remove("expanded"))}}),n.classList.contains("expanded")?(e.style.maxHeight="0",e.style.opacity="0",t.textContent="expand_more",n.classList.remove("expanded")):(e.style.maxHeight=e.scrollHeight+"px",e.style.opacity="1",t.textContent="expand_less",n.classList.add("expanded"))}function te(n){n.querySelectorAll(".nodo-card, .arista-card").forEach(t=>{const a=t.querySelector(".nodo-card-header, .arista-card-header");a&&a.addEventListener("click",()=>{ee(t)})})}function ne(n){const e={};for(const t of n){const a=t.fecha;a&&(e[a]||(e[a]=[]),e[a].push(t))}return e}class ae{constructor(){this.nodeRenderer=new X,this.edgeRenderer=null,this.container=null}render(e,t,a){if(this.container=a,!e||e.length===0){a.textContent="No se encontró itinerario";return}if(!t||!t.nodos||!t.aristas){a.textContent="No hay datos del grafo disponibles";return}const o=new Map;t.nodos.forEach(c=>{o.set(c.id,c)});const s=new Map;t.aristas.forEach(c=>{s.set(c.id,c)}),this.edgeRenderer=new Z(o);const d=ne(e),i=Object.keys(d).sort();let p="";for(const c of i){const f=d[c];p+=this._renderDay(c,f,o,s)}a.innerHTML=p,te(a),this._addDayToggleListeners(a)}_renderDay(e,t,a,o){const s=S(e),d=new Set;let i=0;for(const l of t)if(l.tipo==="nodo"){const r=a.get(l.id);["atraccion","festival"].includes(r.tipo)&&i++,r&&r.direccion&&r.direccion.ciudad&&d.add(r.direccion.ciudad)}else if(l.tipo==="arista"){const r=o.get(l.id);if(r){const g=a.get(r.origen_id),u=a.get(r.destino_id);g&&g.direccion&&g.direccion.ciudad&&d.add(g.direccion.ciudad),u&&u.direccion&&u.direccion.ciudad&&d.add(u.direccion.ciudad)}}const p=d.size>0?Array.from(d).join(", "):"",c=i>0?` · ${i} eventos`:"",f=p?`${p}${c}`:c;let h="";for(const l of t)if(l.tipo==="nodo"){const r=a.get(l.id);r&&(h+=this.nodeRenderer.render(r,l.visitaIndex||0,l.fecha||""))}else if(l.tipo==="arista"){const r=o.get(l.id);r&&(h+=this.edgeRenderer.render(r))}return`
      <div class="dia-card expanded">
        <div class="dia-card-header">
          <span class="dia-card-fecha">${s}</span>
          <span class="dia-card-resumen">${f}</span>
        </div>
        <div class="dia-card-body">
          ${h}
        </div>
      </div>
    `}_addDayToggleListeners(e){e.querySelectorAll(".dia-card-header").forEach(a=>{a.addEventListener("click",()=>{const o=a.closest(".dia-card");if(!o)return;e.querySelectorAll(".dia-card.expanded").forEach(d=>{d!==o&&d.classList.remove("expanded")}),o.classList.toggle("expanded")})})}}async function k(){const n=document.getElementById("node-list");if(!n){console.error("Element #node-list not found");return}try{const e=await A.getData();if(!e.graph||!e.itinerary){n.textContent="No se encontraron datos del itinerario";return}new ae().render(e.itinerary,e.graph,n)}catch(e){console.error("Error displaying itinerary:",e),n.textContent="Error al cargar el itinerario"}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",k):k();
