const x="viajeGraph",C="itineraryList";function I(){const a=localStorage.getItem(x);if(!a)return null;try{return JSON.parse(a)}catch{return null}}function L(a){localStorage.setItem(x,JSON.stringify(a))}function D(){return localStorage.getItem(x)!==null}function T(){const a=localStorage.getItem(C);if(!a)return null;try{return JSON.parse(a)}catch{return null}}function E(a){localStorage.setItem(C,JSON.stringify(a))}function B(){return localStorage.getItem(C)!==null}async function R(a){const e=[],t=[];for(const n of a.referencias.nodos)try{const r=await fetch(`/itinerary/data/${n}`);if(!r.ok){console.error(`Error loading node: ${n}`);continue}const s=await r.json();e.push(s)}catch(r){console.error(`Error loading node ${n}:`,r)}for(const n of a.referencias.aristas)try{const r=await fetch(`/itinerary/data/${n}`);if(!r.ok){console.error(`Error loading edge: ${n}`);continue}const s=await r.json();t.push(s)}catch(r){console.error(`Error loading edge ${n}:`,r)}return{version:a.version,nombre_viaje:a.nombre_viaje,fechas:a.fechas,nodos:e,aristas:t}}function q(a,e){let t=a.aristas.filter(n=>n.origen_id===e);return t=M(t),t}function M(a){return a.sort((t,n)=>{const r=new Date(`${t.logistica_salida.fecha_salida}T${t.logistica_salida.hora_salida_origen}`);return new Date(`${n.logistica_salida.fecha_salida}T${n.logistica_salida.hora_salida_origen}`)-r})}const b=500;function O(a){const e=a.nodos.find(t=>t.tipo==="casa_origen");if(!e)throw new Error('Grafo inválido: no se encontró un nodo de tipo "casa_origen".');return e}function G(a,e,t){return t.has(e)?[]:(t.add(e),q(a,e))}function w(a){const e=O(a),t=new Set(a.aristas.map(p=>p.id)),n=new Set,r=new Map,s=[],d=new Set,o=[];let c=e,u=0;r.set(e.id,0);const h=e.visitas&&e.visitas.length>0?e.visitas[0].entrada:"";for(o.push({tipo:"nodo",id:e.id,visitaIndex:0,fecha:h});(s.length>0||t.size>0)&&u<b;){u++;const p=G(a,c.id,n);for(const _ of p)t.has(_.id)&&!d.has(_.id)&&(d.add(_.id),s.push(_.id));const l=s.pop();if(!l){console.warn(`Grafo posiblemente desconectado. Quedan ${t.size} aristas sin procesar.`);break}if(d.delete(l),!t.has(l))continue;const i=a.aristas.find(_=>_.id===l);if(!i){t.delete(l),console.warn(`Arista con ID "${l}" no encontrada en el grafo. Se omite.`);continue}const m=i.logistica_salida?.fecha_salida||"";o.push({tipo:"arista",id:i.id,fecha:m}),t.delete(i.id);const g=a.nodos.find(_=>_.id===i.destino_id);if(!g)throw new Error(`El nodo destino "${i.destino_id}" de la arista "${i.id}" no existe en el grafo.`);const f=r.get(g.id)||0,v=o.find(_=>_.tipo==="nodo"&&_.id===g.id&&_.visitaIndex===f);let y=f;v?(y=f+1,r.set(g.id,y)):r.set(g.id,f);let $=i.logistica_salida?.fecha_salida||"";$||($=(g.visitas&&g.visitas.length>0?g.visitas[Math.min(y,g.visitas.length-1)]:null)?.entrada||""),o.push({tipo:"nodo",id:g.id,visitaIndex:y,fecha:$}),c=g}return u>=b&&console.warn(`El recorrido alcanzó el límite de ${b} iteraciones. Quedan ${t.size} aristas sin procesar.`),console.log(o),o}async function H(){if(D()){const a=I();if(!B()){const e=w(a);E(e)}return a}try{const a=await fetch("/itinerary/data/viaje-raiz.json");if(!a.ok)throw new Error(`HTTP error! status: ${a.status}`);const e=await a.json(),t=await R(e);L(t);const n=w(t);return E(n),t}catch(a){return console.error("Error loading viaje data:",a),null}}class F{constructor(){this.graph=null,this.itinerary=null,this.loading=!1,this.loaded=!1}async getData(){if(this.loaded&&this.graph)return{graph:this.graph,itinerary:this.itinerary};if(this.loading)return await new Promise(e=>{const t=setInterval(()=>{this.loading||(clearInterval(t),e())},50)}),{graph:this.graph,itinerary:this.itinerary};this.loading=!0;try{const e=await H();return this.graph=e,this.itinerary=T(),this.loaded=!0,{graph:this.graph,itinerary:this.itinerary}}catch(e){throw console.error("Error loading data:",e),e}finally{this.loading=!1}}getGraph(){return this.graph||I()}getItinerary(){return this.itinerary||T()}isLoaded(){return this.loaded}reset(){this.graph=null,this.itinerary=null,this.loaded=!1}}const N=new F;async function P(){let a="Itinerario";try{const t=await N.getData();t&&t.graph&&t.graph.nombre_viaje&&(a=t.graph.nombre_viaje)}catch(t){console.error("Error loading viaje name:",t)}document.title=a;const e=document.querySelector("h1");e&&(e.textContent=a)}P();(function(){const a=document.getElementById("home-content"),e=document.getElementById("settings-content"),t=document.querySelectorAll("[data-tab]");function n(s){if(s==="home")a.style.display="block",e.style.display="none";else if(s==="settings")a.style.display="none",e.style.display="block";else return;t.forEach(d=>{d.dataset.tab===s?d.classList.add("active"):d.classList.remove("active")});try{localStorage.setItem("activeTab",s)}catch{}}let r=null;try{r=localStorage.getItem("activeTab")}catch{}n(r&&(r==="home"||r==="settings")?r:"home"),t.forEach(s=>{s.addEventListener("click",function(d){const o=this.dataset.tab;o&&n(o)})})})();(function(){const a=document.getElementById("clear-cache-btn"),e=document.getElementById("viaje-version"),t=document.getElementById("cache-status"),n=document.getElementById("nodos-count"),r=document.getElementById("aristas-count"),s=document.getElementById("graph-file-input"),d=document.getElementById("load-graph-btn"),o=document.getElementById("load-status"),c=document.getElementById("download-def-btn"),u=document.getElementById("settings-advanced-header"),h=document.getElementById("settings-advanced-content");function p(){D()?t.textContent="Datos en caché":t.textContent="Sin datos en caché";const m=I();m?(e.textContent=m.version||"No definida",n.textContent=m.nodos?m.nodos.length:0,r.textContent=m.aristas?m.aristas.length:0):(e.textContent="No cargado",n.textContent="0",r.textContent="0")}function l(i){const m=new FileReader;m.onload=function(g){try{const f=JSON.parse(g.target.result);if(!f.nodos||!f.aristas){o.textContent="Error: El archivo no contiene un grafo válido (faltan nodos o aristas)",o.style.color="red";return}L(f);try{const v=w(f);E(v)}catch(v){console.error("Error al construir el itinerario:",v),o.textContent="Grafo guardado pero error al construir itinerario: "+v.message,o.style.color="orange",p();return}o.textContent="Grafo cargado y guardado correctamente. Recargando...",o.style.color="green",p(),setTimeout(()=>{window.location.reload()},1500)}catch(f){o.textContent="Error al leer el archivo JSON: "+f.message,o.style.color="red",console.error("Error al cargar el archivo:",f)}},m.onerror=function(){o.textContent="Error al leer el archivo",o.style.color="red"},m.readAsText(i)}d&&s&&(d.addEventListener("click",function(){const i=s.files[0];if(!i){o.textContent="Por favor selecciona un archivo JSON primero",o.style.color="orange";return}o.textContent="Cargando...",o.style.color="blue",l(i)}),s.addEventListener("change",function(){o.textContent=""})),c&&c.addEventListener("click",function(){fetch("/itinerary/docs/ItineraryDef.md").then(i=>{if(!i.ok)throw new Error("HTTP error! status: "+i.status);return i.text()}).then(i=>{const m=new Blob([i],{type:"text/markdown"}),g=URL.createObjectURL(m),f=document.createElement("a");f.href=g,f.download="ItineraryDef.md",document.body.appendChild(f),f.click(),document.body.removeChild(f),setTimeout(()=>{URL.revokeObjectURL(g)},100),o.textContent="Definición descargada correctamente",o.style.color="green"}).catch(i=>{console.error("Error al descargar el archivo:",i),o.textContent="Error al descargar la definición: "+i.message,o.style.color="red"})}),u&&h&&u.addEventListener("click",function(){h.style.display!=="none"?(h.style.display="none",u.classList.remove("expanded")):(h.style.display="block",u.classList.add("expanded"))}),p(),a&&a.addEventListener("click",function(){try{localStorage.clear(),console.log("Caché eliminada correctamente")}catch(i){console.error("Error al eliminar la caché:",i)}window.location.reload()})})();(function(){const a=document.getElementById("theme-toggle-checkbox"),e=document.getElementById("theme-icon"),t=document.documentElement;function n(s){s?t.classList.add("dark-mode"):t.classList.remove("dark-mode"),e&&(e.textContent=s?"dark_mode":"light_mode");const d=document.querySelector('meta[name="theme-color"]');d&&(d.content=s?"#121212":"#f5f5f5");try{localStorage.setItem("darkMode",s?"true":"false")}catch{}a&&(a.checked=s)}let r=null;try{r=localStorage.getItem("darkMode")}catch{}if(r!==null)n(r==="true");else{const s=window.matchMedia("(prefers-color-scheme: dark)").matches;n(s)}a&&a.addEventListener("change",function(){n(this.checked)})})();"serviceWorker"in navigator&&window.addEventListener("load",()=>{navigator.serviceWorker.register("/itinerary/sw.js").then(a=>{console.log("Service Worker registrado con éxito:",a.scope)}).catch(a=>{console.error("Error al registrar Service Worker:",a)})});const V={aeropuerto:"flight_takeoff",hotel:"bed",casa_origen:"home",casa_amigo:"diversity_2",atraccion:"theater_comedy",festival:"music_note",oficina_alquiler:"business_center"},z={avion:"flight",tren:"train",metro:"subway",bus:"directions_bus",auto:"directions_car",caminata:"directions_walk",taxi:"taxi",transbordador:"ferry"};function J(a){return V[a]||"location_on"}function U(a){return z[a]||"arrow_forward"}const W={aeropuerto:"Aeropuerto",hotel:"Hotel",casa_origen:"Inicio",casa_amigo:"Casa de amigo",atraccion:"Atracción",festival:"Festival",oficina_alquiler:"Alquiler de auto"},Y={avion:"Avión",tren:"Tren",metro:"Metro",bus:"Bus",auto:"Auto",caminata:"Caminata",taxi:"Taxi",transbordador:"Transbordador"};function K(a){return W[a]||a}function Q(a){return Y[a]||"Desplazamiento"}function S(a){if(!a)return"";const e=a.split("-");if(e.length!==3)return a;const t=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];return`${parseInt(e[2])} ${t[parseInt(e[1])-1]} ${e[0]}`}class X{constructor(){this.icons=J,this.labels=K,this.formatDate=S}render(e,t=0,n=""){const r=this.icons(e.tipo),s=this.labels(e.tipo),d=e.visitas&&e.visitas.length>0?e.visitas[Math.min(t,e.visitas.length-1)]:null,o=n||d?.entrada||"",c=d?.salida||"",u=e.direccion?.ciudad||"",h=e.direccion?.pais||"",p=e.direccion?.maps_link||"",l=e.contacto||{},i=e.horarios||{},m=d?.clima||null,g=d?.reserva||null,f=d?.notas||null,v=e.actividades||[],y=e.equipaje_recomendado||[],$=e.moneda_local||{},_=e.idioma_principal||"",A=e.tiempo_estimado_visita||"",j=e.reglas_especiales||[];return`
      <div class="nodo-card" data-id="${e.id}" data-visita="${t}">
        <div class="nodo-card-header">
          <span class="nodo-card-icon material-symbols-outlined">${r}</span>
          <div class="nodo-card-content">
            <div class="nodo-card-title">${e.nombre||e.id}</div>
            <div class="nodo-card-subtitle">
              <span class="nodo-card-badge ${e.tipo}">${s}</span>
              ${u?` · ${u}`:""}
              ${h?`, ${h}`:""}
              ${o?` · ${this.formatDate(o)}`:""}
            </div>
          </div>
          <span class="nodo-card-toggle material-symbols-outlined">expand_more</span>
        </div>

        <div class="nodo-card-expanded">
          ${this._renderFecha(o,c)}
          ${this._renderUbicacion(u,h,p)}
          ${this._renderContacto(l)}
          ${this._renderHorarios(i)}
          ${this._renderClima(m)}
          ${this._renderReserva(g)}
          ${this._renderActividades(v)}
          ${this._renderEquipaje(y)}
          ${this._renderTiempoVisita(A)}
          ${this._renderIdioma(_)}
          ${this._renderMoneda($)}
          ${this._renderReglas(j)}
          ${this._renderNotas(f)}
        </div>
      </div>
    `}_renderFecha(e,t){return e?`
      <div class="nodo-detail-row">
        <span class="material-symbols-outlined">calendar_today</span>
        <span><strong>Entrada:</strong> ${this.formatDate(e)}${t&&t!==e?` · <strong>Salida:</strong> ${this.formatDate(t)}`:""}</span>
      </div>
    `:""}_renderUbicacion(e,t,n){return!e&&!t?"":`
      <div class="nodo-detail-row">
        <span class="material-symbols-outlined">location_on</span>
        <span>${e}${e&&t?", ":""}${t}${n?` <a href="${n}" target="_blank" rel="noopener noreferrer" class="nodo-detail-link">Ver en mapa</a>`:""}</span>
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
    `:""}}class Z{constructor(e){this.nodosMap=e,this.icons=U,this.labels=Q,this.formatDate=S}render(e){const t=this.nodosMap.get(e.origen_id),n=this.nodosMap.get(e.destino_id),r=this.icons(e.modo),s=this.labels(e.modo),d=t?t.nombre||t.id:e.origen_id,o=n?n.nombre||n.id:e.destino_id,c=e.logistica_salida?.fecha_salida||"",u=e.logistica_salida?.hora_salida_origen||"",h=e.logistica_salida?.hora_llegada_destino||"",p=e.transporte||{},l=e.tiempo_estimado||{},i=e.costos||{},m=e.notas||"",g=e.reglas_holgura||null;return`
      <div class="arista-card" data-id="${e.id}">
        <div class="arista-card-header">
          <span class="arista-card-icon material-symbols-outlined">${r}</span>
          <div class="arista-card-content">
            <div class="arista-card-title">
              <span class="arista-modo">${s}</span>
              <span class="arista-fecha">${c?`${this.formatDate(c)} ${u}`:""}</span>
              <span class="arista-duracion">${l.minutos?`${l.minutos} min`:""}</span>
            </div>
          </div>
          <span class="arista-card-toggle material-symbols-outlined">expand_more</span>
        </div>

        <div class="arista-card-expanded">
          ${this._renderTrayecto(d,o)}
          ${this._renderTransporte(p)}
          ${this._renderTerminales(p)}
          ${this._renderCodigoReserva(p)}
          ${this._renderFechas(c,u,h)}
          ${this._renderTiempo(l)}
          ${this._renderHolgura(g)}
          ${this._renderCostos(i)}
          ${this._renderDetalles(p)}
          ${this._renderNotas(m)}
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
    `:""}_renderFechas(e,t,n){return!e&&!t&&!n?"":`
      <div class="arista-detail-row">
        <span class="material-symbols-outlined">schedule</span>
        <span>
          ${e?`<strong>Fecha:</strong> ${this.formatDate(e)}`:""}
          ${t?` · <strong>Salida:</strong> ${t}`:""}
          ${n?` · <strong>Llegada:</strong> ${n}`:""}
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
    `:""}}function ee(a){const e=a.querySelector(".nodo-card-expanded, .arista-card-expanded"),t=a.querySelector(".nodo-card-toggle, .arista-card-toggle");if(!e||!t)return;document.querySelectorAll(".nodo-card.expanded, .arista-card.expanded").forEach(r=>{if(r!==a){const s=r.querySelector(".nodo-card-expanded, .arista-card-expanded"),d=r.querySelector(".nodo-card-toggle, .arista-card-toggle");s&&d&&(s.style.maxHeight="0",s.style.opacity="0",d.textContent="expand_more",r.classList.remove("expanded"))}}),a.classList.contains("expanded")?(e.style.maxHeight="0",e.style.opacity="0",t.textContent="expand_more",a.classList.remove("expanded")):(e.style.maxHeight=e.scrollHeight+"px",e.style.opacity="1",t.textContent="expand_less",a.classList.add("expanded"))}function te(a){a.querySelectorAll(".nodo-card, .arista-card").forEach(t=>{const n=t.querySelector(".nodo-card-header, .arista-card-header");n&&n.addEventListener("click",()=>{ee(t)})})}function ae(a){const e={};for(const t of a){const n=t.fecha;n&&(e[n]||(e[n]=[]),e[n].push(t))}return e}class ne{constructor(){this.nodeRenderer=new X,this.edgeRenderer=null,this.container=null}render(e,t,n){if(this.container=n,!e||e.length===0){n.textContent="No se encontró itinerario";return}if(!t||!t.nodos||!t.aristas){n.textContent="No hay datos del grafo disponibles";return}const r=new Map;t.nodos.forEach(h=>{r.set(h.id,h)});const s=new Map;t.aristas.forEach(h=>{s.set(h.id,h)}),this.edgeRenderer=new Z(r);const d=ae(e),o=Object.keys(d).sort();let c="";for(const h of o){const p=d[h];c+=this._renderDay(h,p,r,s)}n.innerHTML=c;const u=typeof window<"u"&&window.__simulatedDate?window.__simulatedDate:new Date().toISOString().slice(0,10);this._expandirDiaCorrecto(u,n),te(n),this._addDayToggleListeners(n)}_renderDay(e,t,n,r){const s=S(e),d=new Set;let o=0;for(const l of t)if(l.tipo==="nodo"){const i=n.get(l.id);["atraccion","festival"].includes(i.tipo)&&o++,i&&i.direccion&&i.direccion.ciudad&&d.add(i.direccion.ciudad)}else if(l.tipo==="arista"){const i=r.get(l.id);if(i){const m=n.get(i.origen_id),g=n.get(i.destino_id);m&&m.direccion&&m.direccion.ciudad&&d.add(m.direccion.ciudad),g&&g.direccion&&g.direccion.ciudad&&d.add(g.direccion.ciudad)}}const c=d.size>0?Array.from(d).join(", "):"",u=o>0?` · ${o} eventos`:"",h=c?`${c}${u}`:u;let p="";for(const l of t)if(l.tipo==="nodo"){const i=n.get(l.id);i&&(p+=this.nodeRenderer.render(i,l.visitaIndex||0,l.fecha||""))}else if(l.tipo==="arista"){const i=r.get(l.id);i&&(p+=this.edgeRenderer.render(i))}return`
      <div class="dia-card" data-fecha="${e}">
        <div class="dia-card-header">
          <span class="dia-card-fecha">${s}</span>
          <span class="dia-card-resumen">${h}</span>
        </div>
        <div class="dia-card-body">
          ${p}
        </div>
      </div>
    `}_expandirDiaCorrecto(e,t){const n=t.querySelectorAll(".dia-card");if(n.length===0)return;const r=[];if(n.forEach(c=>{const u=c.dataset.fecha;u&&r.push(u)}),r.length===0)return;r.sort((c,u)=>c.localeCompare(u));const s=r[0],d=r[r.length-1];let o=null;if(e<s)o=s;else{if(e>d)return;if(r.includes(e))o=e;else{for(let c=r.length-1;c>=0;c--)if(r[c]<=e){o=r[c];break}o||(o=s)}}if(o){const c=t.querySelector(`.dia-card[data-fecha="${o}"]`);c&&c.classList.add("expanded")}}_addDayToggleListeners(e){e.querySelectorAll(".dia-card-header").forEach(n=>{n.addEventListener("click",()=>{const r=n.closest(".dia-card");if(!r)return;e.querySelectorAll(".dia-card.expanded").forEach(d=>{d!==r&&d.classList.remove("expanded")}),r.classList.toggle("expanded")})})}}async function k(){const a=document.getElementById("node-list");if(!a){console.error("Element #node-list not found");return}try{const e=await N.getData();if(!e.graph||!e.itinerary){a.textContent="No se encontraron datos del itinerario";return}new ne().render(e.itinerary,e.graph,a)}catch(e){console.error("Error displaying itinerary:",e),a.textContent="Error al cargar el itinerario"}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",k):k();
