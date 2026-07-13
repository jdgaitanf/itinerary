const _="viajeGraph",$="itineraryList";function w(){const r=localStorage.getItem(_);if(!r)return null;try{return JSON.parse(r)}catch{return null}}function L(r){localStorage.setItem(_,JSON.stringify(r))}function k(){return localStorage.getItem(_)!==null}function f(){const r=localStorage.getItem($);if(!r)return null;try{return JSON.parse(r)}catch{return null}}function v(r){localStorage.setItem($,JSON.stringify(r))}function S(){return localStorage.getItem($)!==null}async function A(r){const e=[],a=[];for(const n of r.referencias.nodos)try{const t=await fetch(`./itinerary/data/${n}`);if(!t.ok){console.error(`Error loading node: ${n}`);continue}const i=await t.json();e.push(i)}catch(t){console.error(`Error loading node ${n}:`,t)}for(const n of r.referencias.aristas)try{const t=await fetch(`./itinerary/data/${n}`);if(!t.ok){console.error(`Error loading edge: ${n}`);continue}const i=await t.json();a.push(i)}catch(t){console.error(`Error loading edge ${n}:`,t)}return{version:r.version,nombre_viaje:r.nombre_viaje,fechas:r.fechas,nodos:e,aristas:a}}function D(r,e){let a=r.aristas.filter(n=>n.origen_id===e);return a=E(a),a}function E(r){return r.sort((a,n)=>{const t=new Date(`${a.logistica_salida.fecha_salida}T${a.logistica_salida.hora_salida_origen}`);return new Date(`${n.logistica_salida.fecha_salida}T${n.logistica_salida.hora_salida_origen}`)-t})}function y(r){let e=r.aristas.map(s=>s.id),a=[],n=[],t=new Set,i=r.nodos.find(s=>s.tipo==="casa_origen");i&&n.push({tipo:"nodo",id:i.id});let d=0;do{let s=[];t.has(i.id)||(t.add(i.id),s=E(D(r,i.id)));let l=s.map(o=>o.id);e=e.filter(o=>!l.includes(o)),l.forEach(o=>{a.includes(o)||a.push(o)});let u=a.pop(),c=r.aristas.find(o=>o.id===u);c&&(n.push({tipo:"arista",id:c.id}),i=r.nodos.find(o=>o.id===c.destino_id),i&&n.push({tipo:"nodo",id:i.id}))}while((a.length>0||e.length>0)&&d<200);return n}async function R(){if(k()){const r=w();if(!S()){const e=y(r);v(e)}return r}try{const r=await fetch("./itinerary/data/viaje-raiz.json");if(!r.ok)throw new Error(`HTTP error! status: ${r.status}`);const e=await r.json(),a=await A(e);L(a);const n=y(a);return v(n),a}catch(r){return console.error("Error loading viaje data:",r),null}}class M{constructor(){this.graph=null,this.itinerary=null,this.loading=!1,this.loaded=!1}async getData(){if(this.loaded&&this.graph)return{graph:this.graph,itinerary:this.itinerary};if(this.loading)return await new Promise(e=>{const a=setInterval(()=>{this.loading||(clearInterval(a),e())},50)}),{graph:this.graph,itinerary:this.itinerary};this.loading=!0;try{const e=await R();return this.graph=e,this.itinerary=f(),this.loaded=!0,{graph:this.graph,itinerary:this.itinerary}}catch(e){throw console.error("Error loading data:",e),e}finally{this.loading=!1}}getGraph(){return this.graph||w()}getItinerary(){return this.itinerary||f()}isLoaded(){return this.loaded}reset(){this.graph=null,this.itinerary=null,this.loaded=!1}}const x=new M;async function q(){let r="Itinerario";try{const a=await x.getData();a&&a.graph&&a.graph.nombre_viaje&&(r=a.graph.nombre_viaje)}catch(a){console.error("Error loading viaje name:",a)}document.title=r;const e=document.querySelector("h1");e&&(e.textContent=r)}q();"serviceWorker"in navigator&&window.addEventListener("load",()=>{navigator.serviceWorker.register("/itinerary/sw.js").then(r=>{console.log("Service Worker registrado con éxito:",r.scope)}).catch(r=>{console.error("Error al registrar Service Worker:",r)})});const O={aeropuerto:"flight_takeoff",hotel:"bed",casa_origen:"home",casa_amigo:"diversity_2",atraccion:"theater_comedy",festival:"music_note",oficina_alquiler:"business_center"},G={avion:"flight",tren:"train",metro:"subway",bus:"directions_bus",auto:"directions_car",caminata:"directions_walk",taxi:"taxi",transbordador:"ferry"};function H(r){return O[r]||"location_on"}function P(r){return G[r]||"arrow_forward"}const V={aeropuerto:"Aeropuerto",hotel:"Hotel",casa_origen:"Inicio",casa_amigo:"Casa de amigo",atraccion:"Atracción",festival:"Festival",oficina_alquiler:"Alquiler de auto"},B={avion:"Avión",tren:"Tren",metro:"Metro",bus:"Bus",auto:"Auto",caminata:"Caminata",taxi:"Taxi",transbordador:"Transbordador"};function F(r){return V[r]||r}function J(r){return B[r]||"Desplazamiento"}function I(r){if(!r)return"";const e=r.split("-");if(e.length!==3)return r;const a=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];return`${parseInt(e[2])} ${a[parseInt(e[1])-1]} ${e[0]}`}class W{constructor(){this.icons=H,this.labels=F,this.formatDate=I}render(e){const a=this.icons(e.tipo),n=this.labels(e.tipo),t=e.visitas&&e.visitas.length>0?e.visitas[0].entrada:"",i=e.visitas&&e.visitas.length>0?e.visitas[0].salida:"",d=e.direccion?.ciudad||"",s=e.direccion?.pais||"",l=e.direccion?.maps_link||"",u=e.contacto||{},c=e.horarios||{},o=e.visitas&&e.visitas.length>0?e.visitas[0].clima:null,p=e.visitas&&e.visitas.length>0?e.visitas[0].reserva:null,g=e.visitas&&e.visitas.length>0?e.visitas[0].notas:null,m=e.actividades||[],h=e.equipaje_recomendado||[],C=e.moneda_local||{},T=e.idioma_principal||"",j=e.tiempo_estimado_visita||"",N=e.reglas_especiales||[];return`
      <div class="nodo-card" data-id="${e.id}">
        <div class="nodo-card-header">
          <span class="nodo-card-icon material-symbols-outlined">${a}</span>
          <div class="nodo-card-content">
            <div class="nodo-card-title">${e.nombre||e.id}</div>
            <div class="nodo-card-subtitle">
              <span class="nodo-card-badge ${e.tipo}">${n}</span>
              ${d?` · ${d}`:""}
              ${s?`, ${s}`:""}
              ${t?` · ${this.formatDate(t)}`:""}
            </div>
          </div>
          <span class="nodo-card-toggle material-symbols-outlined">expand_more</span>
        </div>

        <div class="nodo-card-expanded">
          ${this._renderFecha(t,i)}
          ${this._renderUbicacion(d,s,l)}
          ${this._renderContacto(u)}
          ${this._renderHorarios(c)}
          ${this._renderClima(o)}
          ${this._renderReserva(p)}
          ${this._renderActividades(m)}
          ${this._renderEquipaje(h)}
          ${this._renderTiempoVisita(j)}
          ${this._renderIdioma(T)}
          ${this._renderMoneda(C)}
          ${this._renderReglas(N)}
          ${this._renderNotas(g)}
        </div>
      </div>
    `}_renderFecha(e,a){return e?`
      <div class="nodo-detail-row">
        <span class="material-symbols-outlined">calendar_today</span>
        <span><strong>Entrada:</strong> ${this.formatDate(e)}${a&&a!==e?` · <strong>Salida:</strong> ${this.formatDate(a)}`:""}</span>
      </div>
    `:""}_renderUbicacion(e,a,n){return!e&&!a?"":`
      <div class="nodo-detail-row">
        <span class="material-symbols-outlined">location_on</span>
        <span>${e}${e&&a?", ":""}${a}${n?` <a href="${n}" target="_blank" rel="noopener noreferrer" class="nodo-detail-link">Ver en mapa</a>`:""}</span>
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
            ${e.map(a=>`
              <li>
                ${a.nombre||a.id}
                ${a.tipo?` (${a.tipo})`:""}
                ${a.duracion_estimada?` · ⏱️ ${a.duracion_estimada}`:""}
                ${a.horario_recomendado?` · 🕐 ${a.horario_recomendado}`:""}
                ${a.notas?` · ${a.notas}`:""}
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
          ${e.map(a=>`🧳 ${a}`).join(" · ")}
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
            ${e.map(a=>`<li>${a}</li>`).join("")}
          </ul>
        </span>
      </div>
    `}_renderNotas(e){return e?`
      <div class="nodo-detail-row nodo-detail-notas">
        <span class="material-symbols-outlined">note</span>
        <span><strong>Notas:</strong> ${e}</span>
      </div>
    `:""}}class Y{constructor(e){this.nodosMap=e,this.icons=P,this.labels=J,this.formatDate=I}render(e){const a=this.nodosMap.get(e.origen_id),n=this.nodosMap.get(e.destino_id),t=this.icons(e.modo),i=this.labels(e.modo),d=a?a.nombre||a.id:e.origen_id,s=n?n.nombre||n.id:e.destino_id,l=e.logistica_salida?.fecha_salida||"",u=e.logistica_salida?.hora_salida_origen||"",c=e.logistica_salida?.hora_llegada_destino||"",o=e.transporte||{},p=e.tiempo_estimado||{},g=e.costos||{},m=e.notas||"",h=e.reglas_holgura||null;return`
      <div class="arista-card" data-id="${e.id}">
        <div class="arista-card-header">
          <span class="arista-card-icon material-symbols-outlined">${t}</span>
          <div class="arista-card-content">
            <div class="arista-card-title">
              <span class="arista-modo">${i}</span>
              <span class="arista-fecha">${l?`${this.formatDate(l)} ${u}`:""}</span>
              <span class="arista-duracion">${p.minutos?`${p.minutos} min`:""}</span>
            </div>
          </div>
          <span class="arista-card-toggle material-symbols-outlined">expand_more</span>
        </div>

        <div class="arista-card-expanded">
          ${this._renderTrayecto(d,s)}
          ${this._renderTransporte(o)}
          ${this._renderTerminales(o)}
          ${this._renderCodigoReserva(o)}
          ${this._renderFechas(l,u,c)}
          ${this._renderTiempo(p)}
          ${this._renderHolgura(h)}
          ${this._renderCostos(g)}
          ${this._renderDetalles(o)}
          ${this._renderNotas(m)}
        </div>
      </div>
    `}_renderTrayecto(e,a){return`
      <div class="arista-detail-row">
        <span class="material-symbols-outlined">route</span>
        <span><strong>Trayecto:</strong> ${e} → ${a}</span>
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
    `:""}_renderFechas(e,a,n){return!e&&!a&&!n?"":`
      <div class="arista-detail-row">
        <span class="material-symbols-outlined">schedule</span>
        <span>
          ${e?`<strong>Fecha:</strong> ${this.formatDate(e)}`:""}
          ${a?` · <strong>Salida:</strong> ${a}`:""}
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
    `:""}}function z(r){const e=r.querySelector(".nodo-card-expanded, .arista-card-expanded"),a=r.querySelector(".nodo-card-toggle, .arista-card-toggle");if(!e||!a)return;document.querySelectorAll(".nodo-card.expanded, .arista-card.expanded").forEach(t=>{if(t!==r){const i=t.querySelector(".nodo-card-expanded, .arista-card-expanded"),d=t.querySelector(".nodo-card-toggle, .arista-card-toggle");i&&d&&(i.style.maxHeight="0",i.style.opacity="0",d.textContent="expand_more",t.classList.remove("expanded"))}}),r.classList.contains("expanded")?(e.style.maxHeight="0",e.style.opacity="0",a.textContent="expand_more",r.classList.remove("expanded")):(e.style.maxHeight=e.scrollHeight+"px",e.style.opacity="1",a.textContent="expand_less",r.classList.add("expanded"))}function K(r){r.querySelectorAll(".nodo-card, .arista-card").forEach(a=>{const n=a.querySelector(".nodo-card-header, .arista-card-header");n&&n.addEventListener("click",()=>{z(a)})})}class U{constructor(){this.nodeRenderer=new W,this.edgeRenderer=null,this.container=null}render(e,a,n){if(this.container=n,!e||e.length===0){n.textContent="No se encontró itinerario";return}if(!a||!a.nodos||!a.aristas){n.textContent="No hay datos del grafo disponibles";return}const t=new Map;a.nodos.forEach(s=>{t.set(s.id,s)});const i=new Map;a.aristas.forEach(s=>{i.set(s.id,s)}),this.edgeRenderer=new Y(t);let d="";for(const s of e)if(s.tipo==="nodo"){const l=t.get(s.id);l&&(d+=this.nodeRenderer.render(l))}else if(s.tipo==="arista"){const l=i.get(s.id);l&&(d+=this.edgeRenderer.render(l))}n.innerHTML=d,K(n)}}async function b(){const r=document.getElementById("node-list");if(!r){console.error("Element #node-list not found");return}try{const e=await x.getData();if(!e.graph||!e.itinerary){r.textContent="No se encontraron datos del itinerario";return}new U().render(e.itinerary,e.graph,r)}catch(e){console.error("Error displaying itinerary:",e),r.textContent="Error al cargar el itinerario"}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",b):b();
