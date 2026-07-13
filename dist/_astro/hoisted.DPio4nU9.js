const b="viajeGraph",E="itineraryList";function w(){const n=localStorage.getItem(b);if(!n)return null;try{return JSON.parse(n)}catch{return null}}function I(n){localStorage.setItem(b,JSON.stringify(n))}function S(){return localStorage.getItem(b)!==null}function x(){const n=localStorage.getItem(E);if(!n)return null;try{return JSON.parse(n)}catch{return null}}function $(n){localStorage.setItem(E,JSON.stringify(n))}function j(){return localStorage.getItem(E)!==null}async function A(n){const e=[],t=[];for(const a of n.referencias.nodos)try{const r=await fetch(`/itinerary/data/${a}`);if(!r.ok){console.error(`Error loading node: ${a}`);continue}const s=await r.json();e.push(s)}catch(r){console.error(`Error loading node ${a}:`,r)}for(const a of n.referencias.aristas)try{const r=await fetch(`/itinerary/data/${a}`);if(!r.ok){console.error(`Error loading edge: ${a}`);continue}const s=await r.json();t.push(s)}catch(r){console.error(`Error loading edge ${a}:`,r)}return{version:n.version,nombre_viaje:n.nombre_viaje,fechas:n.fechas,nodos:e,aristas:t}}function D(n,e){let t=n.aristas.filter(a=>a.origen_id===e);return t=R(t),t}function R(n){return n.sort((t,a)=>{const r=new Date(`${t.logistica_salida.fecha_salida}T${t.logistica_salida.hora_salida_origen}`);return new Date(`${a.logistica_salida.fecha_salida}T${a.logistica_salida.hora_salida_origen}`)-r})}const v=500;function B(n){const e=n.nodos.find(t=>t.tipo==="casa_origen");if(!e)throw new Error('Grafo inválido: no se encontró un nodo de tipo "casa_origen".');return e}function M(n,e,t){return t.has(e)?[]:(t.add(e),D(n,e))}function y(n){const e=B(n),t=new Set(n.aristas.map(p=>p.id)),a=new Set,r=[],s=new Set,d=[];let o=e,l=0;for(d.push({tipo:"nodo",id:e.id});(r.length>0||t.size>0)&&l<v;){l++;const p=M(n,o.id,a);for(const i of p)t.has(i.id)&&!s.has(i.id)&&(s.add(i.id),r.push(i.id));const g=r.pop();if(!g){console.warn(`Grafo posiblemente desconectado. Quedan ${t.size} aristas sin procesar.`);break}if(s.delete(g),!t.has(g))continue;const c=n.aristas.find(i=>i.id===g);if(!c){t.delete(g),console.warn(`Arista con ID "${g}" no encontrada en el grafo. Se omite.`);continue}d.push({tipo:"arista",id:c.id}),t.delete(c.id);const h=n.nodos.find(i=>i.id===c.destino_id);if(!h)throw new Error(`El nodo destino "${c.destino_id}" de la arista "${c.id}" no existe en el grafo.`);d.push({tipo:"nodo",id:h.id}),o=h}return l>=v&&console.warn(`El recorrido alcanzó el límite de ${v} iteraciones. Quedan ${t.size} aristas sin procesar.`),d}async function q(){if(S()){const n=w();if(!j()){const e=y(n);$(e)}return n}try{const n=await fetch("/itinerary/data/viaje-raiz.json");if(!n.ok)throw new Error(`HTTP error! status: ${n.status}`);const e=await n.json(),t=await A(e);I(t);const a=y(t);return $(a),t}catch(n){return console.error("Error loading viaje data:",n),null}}class O{constructor(){this.graph=null,this.itinerary=null,this.loading=!1,this.loaded=!1}async getData(){if(this.loaded&&this.graph)return{graph:this.graph,itinerary:this.itinerary};if(this.loading)return await new Promise(e=>{const t=setInterval(()=>{this.loading||(clearInterval(t),e())},50)}),{graph:this.graph,itinerary:this.itinerary};this.loading=!0;try{const e=await q();return this.graph=e,this.itinerary=x(),this.loaded=!0,{graph:this.graph,itinerary:this.itinerary}}catch(e){throw console.error("Error loading data:",e),e}finally{this.loading=!1}}getGraph(){return this.graph||w()}getItinerary(){return this.itinerary||x()}isLoaded(){return this.loaded}reset(){this.graph=null,this.itinerary=null,this.loaded=!1}}const k=new O;async function G(){let n="Itinerario";try{const t=await k.getData();t&&t.graph&&t.graph.nombre_viaje&&(n=t.graph.nombre_viaje)}catch(t){console.error("Error loading viaje name:",t)}document.title=n;const e=document.querySelector("h1");e&&(e.textContent=n)}G();(function(){const n=document.getElementById("home-content"),e=document.getElementById("settings-content"),t=document.querySelectorAll("[data-tab]");function a(s){if(s==="home")n.style.display="block",e.style.display="none";else if(s==="settings")n.style.display="none",e.style.display="block";else return;t.forEach(d=>{d.dataset.tab===s?d.classList.add("active"):d.classList.remove("active")});try{localStorage.setItem("activeTab",s)}catch{}}let r=null;try{r=localStorage.getItem("activeTab")}catch{}a(r&&(r==="home"||r==="settings")?r:"home"),t.forEach(s=>{s.addEventListener("click",function(d){const o=this.dataset.tab;o&&a(o)})})})();(function(){const n=document.getElementById("clear-cache-btn"),e=document.getElementById("viaje-version"),t=document.getElementById("cache-status"),a=document.getElementById("nodos-count"),r=document.getElementById("aristas-count"),s=document.getElementById("graph-file-input"),d=document.getElementById("load-graph-btn"),o=document.getElementById("load-status"),l=document.getElementById("download-def-btn"),p=document.getElementById("settings-advanced-header"),g=document.getElementById("settings-advanced-content");function c(){S()?t.textContent="Datos en caché":t.textContent="Sin datos en caché";const u=w();u?(e.textContent=u.version||"No definida",a.textContent=u.nodos?u.nodos.length:0,r.textContent=u.aristas?u.aristas.length:0):(e.textContent="No cargado",a.textContent="0",r.textContent="0")}function h(i){const u=new FileReader;u.onload=function(f){try{const m=JSON.parse(f.target.result);if(!m.nodos||!m.aristas){o.textContent="Error: El archivo no contiene un grafo válido (faltan nodos o aristas)",o.style.color="red";return}I(m);try{const _=y(m);$(_)}catch(_){console.error("Error al construir el itinerario:",_),o.textContent="Grafo guardado pero error al construir itinerario: "+_.message,o.style.color="orange",c();return}o.textContent="Grafo cargado y guardado correctamente. Recargando...",o.style.color="green",c(),setTimeout(()=>{window.location.reload()},1500)}catch(m){o.textContent="Error al leer el archivo JSON: "+m.message,o.style.color="red",console.error("Error al cargar el archivo:",m)}},u.onerror=function(){o.textContent="Error al leer el archivo",o.style.color="red"},u.readAsText(i)}d&&s&&(d.addEventListener("click",function(){const i=s.files[0];if(!i){o.textContent="Por favor selecciona un archivo JSON primero",o.style.color="orange";return}o.textContent="Cargando...",o.style.color="blue",h(i)}),s.addEventListener("change",function(){o.textContent=""})),l&&l.addEventListener("click",function(){fetch("/itinerary/docs/ItineraryDef.md").then(i=>{if(!i.ok)throw new Error("HTTP error! status: "+i.status);return i.text()}).then(i=>{const u=new Blob([i],{type:"text/markdown"}),f=URL.createObjectURL(u),m=document.createElement("a");m.href=f,m.download="ItineraryDef.md",document.body.appendChild(m),m.click(),document.body.removeChild(m),setTimeout(()=>{URL.revokeObjectURL(f)},100),o.textContent="Definición descargada correctamente",o.style.color="green"}).catch(i=>{console.error("Error al descargar el archivo:",i),o.textContent="Error al descargar la definición: "+i.message,o.style.color="red"})}),p&&g&&p.addEventListener("click",function(){g.style.display!=="none"?(g.style.display="none",p.classList.remove("expanded")):(g.style.display="block",p.classList.add("expanded"))}),c(),n&&n.addEventListener("click",function(){try{localStorage.clear(),console.log("Caché eliminada correctamente")}catch(i){console.error("Error al eliminar la caché:",i)}window.location.reload()})})();(function(){const n=document.getElementById("theme-toggle-checkbox"),e=document.documentElement;function t(r){r?e.classList.add("dark-mode"):e.classList.remove("dark-mode");try{localStorage.setItem("darkMode",r?"true":"false")}catch{}n&&(n.checked=r)}let a=null;try{a=localStorage.getItem("darkMode")}catch{}if(a!==null)t(a==="true");else{const r=window.matchMedia("(prefers-color-scheme: dark)").matches;t(r)}n&&n.addEventListener("change",function(){t(this.checked)})})();"serviceWorker"in navigator&&window.addEventListener("load",()=>{navigator.serviceWorker.register("/itinerary/sw.js").then(n=>{console.log("Service Worker registrado con éxito:",n.scope)}).catch(n=>{console.error("Error al registrar Service Worker:",n)})});const F={aeropuerto:"flight_takeoff",hotel:"bed",casa_origen:"home",casa_amigo:"diversity_2",atraccion:"theater_comedy",festival:"music_note",oficina_alquiler:"business_center"},H={avion:"flight",tren:"train",metro:"subway",bus:"directions_bus",auto:"directions_car",caminata:"directions_walk",taxi:"taxi",transbordador:"ferry"};function P(n){return F[n]||"location_on"}function V(n){return H[n]||"arrow_forward"}const J={aeropuerto:"Aeropuerto",hotel:"Hotel",casa_origen:"Inicio",casa_amigo:"Casa de amigo",atraccion:"Atracción",festival:"Festival",oficina_alquiler:"Alquiler de auto"},U={avion:"Avión",tren:"Tren",metro:"Metro",bus:"Bus",auto:"Auto",caminata:"Caminata",taxi:"Taxi",transbordador:"Transbordador"};function z(n){return J[n]||n}function W(n){return U[n]||"Desplazamiento"}function L(n){if(!n)return"";const e=n.split("-");if(e.length!==3)return n;const t=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];return`${parseInt(e[2])} ${t[parseInt(e[1])-1]} ${e[0]}`}class Y{constructor(){this.icons=P,this.labels=z,this.formatDate=L}render(e){const t=this.icons(e.tipo),a=this.labels(e.tipo),r=e.visitas&&e.visitas.length>0?e.visitas[0].entrada:"",s=e.visitas&&e.visitas.length>0?e.visitas[0].salida:"",d=e.direccion?.ciudad||"",o=e.direccion?.pais||"",l=e.direccion?.maps_link||"",p=e.contacto||{},g=e.horarios||{},c=e.visitas&&e.visitas.length>0?e.visitas[0].clima:null,h=e.visitas&&e.visitas.length>0?e.visitas[0].reserva:null,i=e.visitas&&e.visitas.length>0?e.visitas[0].notas:null,u=e.actividades||[],f=e.equipaje_recomendado||[],m=e.moneda_local||{},_=e.idioma_principal||"",T=e.tiempo_estimado_visita||"",N=e.reglas_especiales||[];return`
      <div class="nodo-card" data-id="${e.id}">
        <div class="nodo-card-header">
          <span class="nodo-card-icon material-symbols-outlined">${t}</span>
          <div class="nodo-card-content">
            <div class="nodo-card-title">${e.nombre||e.id}</div>
            <div class="nodo-card-subtitle">
              <span class="nodo-card-badge ${e.tipo}">${a}</span>
              ${d?` · ${d}`:""}
              ${o?`, ${o}`:""}
              ${r?` · ${this.formatDate(r)}`:""}
            </div>
          </div>
          <span class="nodo-card-toggle material-symbols-outlined">expand_more</span>
        </div>

        <div class="nodo-card-expanded">
          ${this._renderFecha(r,s)}
          ${this._renderUbicacion(d,o,l)}
          ${this._renderContacto(p)}
          ${this._renderHorarios(g)}
          ${this._renderClima(c)}
          ${this._renderReserva(h)}
          ${this._renderActividades(u)}
          ${this._renderEquipaje(f)}
          ${this._renderTiempoVisita(T)}
          ${this._renderIdioma(_)}
          ${this._renderMoneda(m)}
          ${this._renderReglas(N)}
          ${this._renderNotas(i)}
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
    `:""}}class K{constructor(e){this.nodosMap=e,this.icons=V,this.labels=W,this.formatDate=L}render(e){const t=this.nodosMap.get(e.origen_id),a=this.nodosMap.get(e.destino_id),r=this.icons(e.modo),s=this.labels(e.modo),d=t?t.nombre||t.id:e.origen_id,o=a?a.nombre||a.id:e.destino_id,l=e.logistica_salida?.fecha_salida||"",p=e.logistica_salida?.hora_salida_origen||"",g=e.logistica_salida?.hora_llegada_destino||"",c=e.transporte||{},h=e.tiempo_estimado||{},i=e.costos||{},u=e.notas||"",f=e.reglas_holgura||null;return`
      <div class="arista-card" data-id="${e.id}">
        <div class="arista-card-header">
          <span class="arista-card-icon material-symbols-outlined">${r}</span>
          <div class="arista-card-content">
            <div class="arista-card-title">
              <span class="arista-modo">${s}</span>
              <span class="arista-fecha">${l?`${this.formatDate(l)} ${p}`:""}</span>
              <span class="arista-duracion">${h.minutos?`${h.minutos} min`:""}</span>
            </div>
          </div>
          <span class="arista-card-toggle material-symbols-outlined">expand_more</span>
        </div>

        <div class="arista-card-expanded">
          ${this._renderTrayecto(d,o)}
          ${this._renderTransporte(c)}
          ${this._renderTerminales(c)}
          ${this._renderCodigoReserva(c)}
          ${this._renderFechas(l,p,g)}
          ${this._renderTiempo(h)}
          ${this._renderHolgura(f)}
          ${this._renderCostos(i)}
          ${this._renderDetalles(c)}
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
    `:""}}function Q(n){const e=n.querySelector(".nodo-card-expanded, .arista-card-expanded"),t=n.querySelector(".nodo-card-toggle, .arista-card-toggle");if(!e||!t)return;document.querySelectorAll(".nodo-card.expanded, .arista-card.expanded").forEach(r=>{if(r!==n){const s=r.querySelector(".nodo-card-expanded, .arista-card-expanded"),d=r.querySelector(".nodo-card-toggle, .arista-card-toggle");s&&d&&(s.style.maxHeight="0",s.style.opacity="0",d.textContent="expand_more",r.classList.remove("expanded"))}}),n.classList.contains("expanded")?(e.style.maxHeight="0",e.style.opacity="0",t.textContent="expand_more",n.classList.remove("expanded")):(e.style.maxHeight=e.scrollHeight+"px",e.style.opacity="1",t.textContent="expand_less",n.classList.add("expanded"))}function X(n){n.querySelectorAll(".nodo-card, .arista-card").forEach(t=>{const a=t.querySelector(".nodo-card-header, .arista-card-header");a&&a.addEventListener("click",()=>{Q(t)})})}class Z{constructor(){this.nodeRenderer=new Y,this.edgeRenderer=null,this.container=null}render(e,t,a){if(this.container=a,!e||e.length===0){a.textContent="No se encontró itinerario";return}if(!t||!t.nodos||!t.aristas){a.textContent="No hay datos del grafo disponibles";return}const r=new Map;t.nodos.forEach(o=>{r.set(o.id,o)});const s=new Map;t.aristas.forEach(o=>{s.set(o.id,o)}),this.edgeRenderer=new K(r);let d="";for(const o of e)if(o.tipo==="nodo"){const l=r.get(o.id);l&&(d+=this.nodeRenderer.render(l))}else if(o.tipo==="arista"){const l=s.get(o.id);l&&(d+=this.edgeRenderer.render(l))}a.innerHTML=d,X(a)}}async function C(){const n=document.getElementById("node-list");if(!n){console.error("Element #node-list not found");return}try{const e=await k.getData();if(!e.graph||!e.itinerary){n.textContent="No se encontraron datos del itinerario";return}new Z().render(e.itinerary,e.graph,n)}catch(e){console.error("Error displaying itinerary:",e),n.textContent="Error al cargar el itinerario"}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",C):C();
