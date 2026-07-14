const x="viajeGraph",I="itineraryList";function C(){const n=localStorage.getItem(x);if(!n)return null;try{return JSON.parse(n)}catch{return null}}function T(n){localStorage.setItem(x,JSON.stringify(n))}function L(){return localStorage.getItem(x)!==null}function S(){const n=localStorage.getItem(I);if(!n)return null;try{return JSON.parse(n)}catch{return null}}function E(n){localStorage.setItem(I,JSON.stringify(n))}function B(){return localStorage.getItem(I)!==null}async function R(n){const e=[],t=[];for(const a of n.referencias.nodos)try{const r=await fetch(`/itinerary/data/${a}`);if(!r.ok){console.error(`Error loading node: ${a}`);continue}const s=await r.json();e.push(s)}catch(r){console.error(`Error loading node ${a}:`,r)}for(const a of n.referencias.aristas)try{const r=await fetch(`/itinerary/data/${a}`);if(!r.ok){console.error(`Error loading edge: ${a}`);continue}const s=await r.json();t.push(s)}catch(r){console.error(`Error loading edge ${a}:`,r)}return{version:n.version,nombre_viaje:n.nombre_viaje,fechas:n.fechas,nodos:e,aristas:t}}function M(n,e){let t=n.aristas.filter(a=>a.origen_id===e);return t=q(t),t}function q(n){return n.sort((t,a)=>{const r=new Date(`${t.logistica_salida.fecha_salida}T${t.logistica_salida.hora_salida_origen}`);return new Date(`${a.logistica_salida.fecha_salida}T${a.logistica_salida.hora_salida_origen}`)-r})}const b=500;function O(n){const e=n.nodos.find(t=>t.tipo==="casa_origen");if(!e)throw new Error('Grafo inválido: no se encontró un nodo de tipo "casa_origen".');return e}function G(n,e,t){return t.has(e)?[]:(t.add(e),M(n,e))}function w(n){const e=O(n),t=new Set(n.aristas.map(p=>p.id)),a=new Set,r=new Map,s=[],i=new Set,o=[];let g=e,m=0;r.set(e.id,0);const _=e.visitas&&e.visitas.length>0?e.visitas[0].entrada:"";for(o.push({tipo:"nodo",id:e.id,visitaIndex:0,fecha:_});(s.length>0||t.size>0)&&m<b;){m++;const p=G(n,g.id,a);for(const h of p)t.has(h.id)&&!i.has(h.id)&&(i.add(h.id),s.push(h.id));const f=s.pop();if(!f){console.warn(`Grafo posiblemente desconectado. Quedan ${t.size} aristas sin procesar.`);break}if(i.delete(f),!t.has(f))continue;const d=n.aristas.find(h=>h.id===f);if(!d){t.delete(f),console.warn(`Arista con ID "${f}" no encontrada en el grafo. Se omite.`);continue}const u=d.logistica_salida?.fecha_salida||"";o.push({tipo:"arista",id:d.id,fecha:u}),t.delete(d.id);const l=n.nodos.find(h=>h.id===d.destino_id);if(!l)throw new Error(`El nodo destino "${d.destino_id}" de la arista "${d.id}" no existe en el grafo.`);const c=r.get(l.id)||0,v=o.find(h=>h.tipo==="nodo"&&h.id===l.id&&h.visitaIndex===c);let $=c;v?($=c+1,r.set(l.id,$)):r.set(l.id,c);let y=d.logistica_salida?.fecha_salida||"";y||(y=(l.visitas&&l.visitas.length>0?l.visitas[Math.min($,l.visitas.length-1)]:null)?.entrada||""),o.push({tipo:"nodo",id:l.id,visitaIndex:$,fecha:y}),g=l}return m>=b&&console.warn(`El recorrido alcanzó el límite de ${b} iteraciones. Quedan ${t.size} aristas sin procesar.`),console.log(o),o}async function F(){if(L()){const n=C();if(!B()){const e=w(n);E(e)}return n}try{const n=await fetch("/itinerary/data/viaje-raiz.json");if(!n.ok)throw new Error(`HTTP error! status: ${n.status}`);const e=await n.json(),t=await R(e);T(t);const a=w(t);return E(a),t}catch(n){return console.error("Error loading viaje data:",n),null}}class V{constructor(){this.graph=null,this.itinerary=null,this.loading=!1,this.loaded=!1}async getData(){if(this.loaded&&this.graph)return{graph:this.graph,itinerary:this.itinerary};if(this.loading)return await new Promise(e=>{const t=setInterval(()=>{this.loading||(clearInterval(t),e())},50)}),{graph:this.graph,itinerary:this.itinerary};this.loading=!0;try{const e=await F();return this.graph=e,this.itinerary=S(),this.loaded=!0,{graph:this.graph,itinerary:this.itinerary}}catch(e){throw console.error("Error loading data:",e),e}finally{this.loading=!1}}getGraph(){return this.graph||C()}getItinerary(){return this.itinerary||S()}isLoaded(){return this.loaded}reset(){this.graph=null,this.itinerary=null,this.loaded=!1}}const N=new V;async function H(){let n="Itinerario";try{const t=await N.getData();t&&t.graph&&t.graph.nombre_viaje&&(n=t.graph.nombre_viaje)}catch(t){console.error("Error loading viaje name:",t)}document.title=n;const e=document.querySelector("h1");e&&(e.textContent=n)}H();(function(){const n=document.getElementById("home-content"),e=document.getElementById("settings-content"),t=document.querySelectorAll("[data-tab]");function a(s){if(s==="home")n.style.display="block",e.style.display="none";else if(s==="settings")n.style.display="none",e.style.display="block";else return;t.forEach(i=>{i.dataset.tab===s?i.classList.add("active"):i.classList.remove("active")});try{localStorage.setItem("activeTab",s)}catch{}}let r=null;try{r=localStorage.getItem("activeTab")}catch{}a(r&&(r==="home"||r==="settings")?r:"home"),t.forEach(s=>{s.addEventListener("click",function(i){const o=this.dataset.tab;o&&a(o)})})})();(function(){const n=document.getElementById("clear-cache-btn"),e=document.getElementById("viaje-version"),t=document.getElementById("cache-status"),a=document.getElementById("nodos-count"),r=document.getElementById("aristas-count"),s=document.getElementById("graph-file-input"),i=document.getElementById("load-graph-btn"),o=document.getElementById("load-status"),g=document.getElementById("download-def-btn"),m=document.getElementById("settings-advanced-header"),_=document.getElementById("settings-advanced-content");function p(){L()?t.textContent="Datos en caché":t.textContent="Sin datos en caché";const u=C();u?(e.textContent=u.version||"No definida",a.textContent=u.nodos?u.nodos.length:0,r.textContent=u.aristas?u.aristas.length:0):(e.textContent="No cargado",a.textContent="0",r.textContent="0")}function f(d){const u=new FileReader;u.onload=function(l){try{const c=JSON.parse(l.target.result);if(!c.nodos||!c.aristas){o.textContent="Error: El archivo no contiene un grafo válido (faltan nodos o aristas)",o.style.color="red";return}T(c);try{const v=w(c);E(v)}catch(v){console.error("Error al construir el itinerario:",v),o.textContent="Grafo guardado pero error al construir itinerario: "+v.message,o.style.color="orange",p();return}o.textContent="Grafo cargado y guardado correctamente. Recargando...",o.style.color="green",p(),setTimeout(()=>{window.location.reload()},1500)}catch(c){o.textContent="Error al leer el archivo JSON: "+c.message,o.style.color="red",console.error("Error al cargar el archivo:",c)}},u.onerror=function(){o.textContent="Error al leer el archivo",o.style.color="red"},u.readAsText(d)}i&&s&&(i.addEventListener("click",function(){const d=s.files[0];if(!d){o.textContent="Por favor selecciona un archivo JSON primero",o.style.color="orange";return}o.textContent="Cargando...",o.style.color="blue",f(d)}),s.addEventListener("change",function(){o.textContent=""})),g&&g.addEventListener("click",function(){fetch("/itinerary/docs/ItineraryDef.md").then(d=>{if(!d.ok)throw new Error("HTTP error! status: "+d.status);return d.text()}).then(d=>{const u=new Blob([d],{type:"text/markdown"}),l=URL.createObjectURL(u),c=document.createElement("a");c.href=l,c.download="ItineraryDef.md",document.body.appendChild(c),c.click(),document.body.removeChild(c),setTimeout(()=>{URL.revokeObjectURL(l)},100),o.textContent="Definición descargada correctamente",o.style.color="green"}).catch(d=>{console.error("Error al descargar el archivo:",d),o.textContent="Error al descargar la definición: "+d.message,o.style.color="red"})}),m&&_&&m.addEventListener("click",function(){_.style.display!=="none"?(_.style.display="none",m.classList.remove("expanded")):(_.style.display="block",m.classList.add("expanded"))}),p(),n&&n.addEventListener("click",function(){try{localStorage.clear(),console.log("Caché eliminada correctamente")}catch(d){console.error("Error al eliminar la caché:",d)}window.location.reload()})})();(function(){const n=document.getElementById("theme-toggle-checkbox"),e=document.getElementById("theme-icon"),t=document.documentElement;function a(s){s?t.classList.add("dark-mode"):t.classList.remove("dark-mode"),e&&(e.textContent=s?"dark_mode":"light_mode");const i=document.querySelector('meta[name="theme-color"]');i&&(i.content=s?"#121212":"#f5f5f5");try{localStorage.setItem("darkMode",s?"true":"false")}catch{}n&&(n.checked=s)}let r=null;try{r=localStorage.getItem("darkMode")}catch{}if(r!==null)a(r==="true");else{const s=window.matchMedia("(prefers-color-scheme: dark)").matches;a(s)}n&&n.addEventListener("change",function(){a(this.checked)})})();"serviceWorker"in navigator&&window.addEventListener("load",()=>{navigator.serviceWorker.register("/itinerary/sw.js").then(n=>{console.log("Service Worker registrado con éxito:",n.scope)}).catch(n=>{console.error("Error al registrar Service Worker:",n)})});const P={aeropuerto:"flight_takeoff",hotel:"bed",casa_origen:"home",casa_amigo:"diversity_2",atraccion:"theater_comedy",festival:"music_note",oficina_alquiler:"business_center"},J={avion:"flight",tren:"train",metro:"subway",bus:"directions_bus",auto:"directions_car",caminata:"directions_walk",taxi:"taxi",transbordador:"ferry"};function U(n){return P[n]||"location_on"}function z(n){return J[n]||"arrow_forward"}const W={aeropuerto:"Aeropuerto",hotel:"Hotel",casa_origen:"Inicio",casa_amigo:"Casa de amigo",atraccion:"Atracción",festival:"Festival",oficina_alquiler:"Alquiler de auto"},Y={avion:"Avión",tren:"Tren",metro:"Metro",bus:"Bus",auto:"Auto",caminata:"Caminata",taxi:"Taxi",transbordador:"Transbordador"};function K(n){return W[n]||n}function Q(n){return Y[n]||"Desplazamiento"}function j(n){if(!n)return"";const e=n.split("-");if(e.length!==3)return n;const t=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];return`${parseInt(e[2])} ${t[parseInt(e[1])-1]} ${e[0]}`}class X{constructor(){this.icons=U,this.labels=K,this.formatDate=j}render(e,t=0,a=""){const r=this.icons(e.tipo),s=this.labels(e.tipo),i=e.visitas&&e.visitas.length>0?e.visitas[Math.min(t,e.visitas.length-1)]:null,o=a||i?.entrada||"",g=i?.salida||"",m=e.direccion?.ciudad||"",_=e.direccion?.pais||"",p=e.direccion?.maps_link||"",f=e.contacto||{},d=e.horarios||{},u=i?.clima||null,l=i?.reserva||null,c=i?.notas||null,v=e.actividades||[],$=e.equipaje_recomendado||[],y=e.moneda_local||{},h=e.idioma_principal||"",A=e.tiempo_estimado_visita||"",D=e.reglas_especiales||[];return`
      <div class="nodo-card" data-id="${e.id}" data-visita="${t}">
        <div class="nodo-card-header">
          <span class="nodo-card-icon material-symbols-outlined">${r}</span>
          <div class="nodo-card-content">
            <div class="nodo-card-title">${e.nombre||e.id}</div>
            <div class="nodo-card-subtitle">
              <span class="nodo-card-badge ${e.tipo}">${s}</span>
              ${m?` · ${m}`:""}
              ${_?`, ${_}`:""}
              ${o?` · ${this.formatDate(o)}`:""}
            </div>
          </div>
          <span class="nodo-card-toggle material-symbols-outlined">expand_more</span>
        </div>

        <div class="nodo-card-expanded">
          ${this._renderFecha(o,g)}
          ${this._renderUbicacion(m,_,p)}
          ${this._renderContacto(f)}
          ${this._renderHorarios(d)}
          ${this._renderClima(u)}
          ${this._renderReserva(l)}
          ${this._renderActividades(v)}
          ${this._renderEquipaje($)}
          ${this._renderTiempoVisita(A)}
          ${this._renderIdioma(h)}
          ${this._renderMoneda(y)}
          ${this._renderReglas(D)}
          ${this._renderNotas(c)}
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
    `:""}}class Z{constructor(e){this.nodosMap=e,this.icons=z,this.labels=Q,this.formatDate=j}render(e){const t=this.nodosMap.get(e.origen_id),a=this.nodosMap.get(e.destino_id),r=this.icons(e.modo),s=this.labels(e.modo),i=t?t.nombre||t.id:e.origen_id,o=a?a.nombre||a.id:e.destino_id,g=e.logistica_salida?.fecha_salida||"",m=e.logistica_salida?.hora_salida_origen||"",_=e.logistica_salida?.hora_llegada_destino||"",p=e.transporte||{},f=e.tiempo_estimado||{},d=e.costos||{},u=e.notas||"",l=e.reglas_holgura||null;return`
      <div class="arista-card" data-id="${e.id}">
        <div class="arista-card-header">
          <span class="arista-card-icon material-symbols-outlined">${r}</span>
          <div class="arista-card-content">
            <div class="arista-card-title">
              <span class="arista-modo">${s}</span>
              <span class="arista-fecha">${g?`${this.formatDate(g)} ${m}`:""}</span>
              <span class="arista-duracion">${f.minutos?`${f.minutos} min`:""}</span>
            </div>
          </div>
          <span class="arista-card-toggle material-symbols-outlined">expand_more</span>
        </div>

        <div class="arista-card-expanded">
          ${this._renderTrayecto(i,o)}
          ${this._renderTransporte(p)}
          ${this._renderTerminales(p)}
          ${this._renderCodigoReserva(p)}
          ${this._renderFechas(g,m,_)}
          ${this._renderTiempo(f)}
          ${this._renderHolgura(l)}
          ${this._renderCostos(d)}
          ${this._renderDetalles(p)}
          ${this._renderNotas(u)}
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
    `:""}}function ee(n){const e=n.querySelector(".nodo-card-expanded, .arista-card-expanded"),t=n.querySelector(".nodo-card-toggle, .arista-card-toggle");if(!e||!t)return;document.querySelectorAll(".nodo-card.expanded, .arista-card.expanded").forEach(r=>{if(r!==n){const s=r.querySelector(".nodo-card-expanded, .arista-card-expanded"),i=r.querySelector(".nodo-card-toggle, .arista-card-toggle");s&&i&&(s.style.maxHeight="0",s.style.opacity="0",i.textContent="expand_more",r.classList.remove("expanded"))}}),n.classList.contains("expanded")?(e.style.maxHeight="0",e.style.opacity="0",t.textContent="expand_more",n.classList.remove("expanded")):(e.style.maxHeight=e.scrollHeight+"px",e.style.opacity="1",t.textContent="expand_less",n.classList.add("expanded"))}function te(n){n.querySelectorAll(".nodo-card, .arista-card").forEach(t=>{const a=t.querySelector(".nodo-card-header, .arista-card-header");a&&a.addEventListener("click",()=>{ee(t)})})}class ne{constructor(){this.nodeRenderer=new X,this.edgeRenderer=null,this.container=null}render(e,t,a){if(this.container=a,!e||e.length===0){a.textContent="No se encontró itinerario";return}if(!t||!t.nodos||!t.aristas){a.textContent="No hay datos del grafo disponibles";return}const r=new Map;t.nodos.forEach(o=>{r.set(o.id,o)});const s=new Map;t.aristas.forEach(o=>{s.set(o.id,o)}),this.edgeRenderer=new Z(r);let i="";for(const o of e)if(o.tipo==="nodo"){const g=r.get(o.id);g&&(i+=this.nodeRenderer.render(g,o.visitaIndex||0,o.fecha||""))}else if(o.tipo==="arista"){const g=s.get(o.id);g&&(i+=this.edgeRenderer.render(g))}a.innerHTML=i,te(a)}}async function k(){const n=document.getElementById("node-list");if(!n){console.error("Element #node-list not found");return}try{const e=await N.getData();if(!e.graph||!e.itinerary){n.textContent="No se encontraron datos del itinerario";return}new ne().render(e.itinerary,e.graph,n)}catch(e){console.error("Error displaying itinerary:",e),n.textContent="Error al cargar el itinerario"}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",k):k();
