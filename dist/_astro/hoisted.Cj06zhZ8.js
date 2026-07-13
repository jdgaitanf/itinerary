const f="viajeGraph",h="itineraryList";function y(){const a=localStorage.getItem(f);if(!a)return null;try{return JSON.parse(a)}catch{return null}}function S(a){localStorage.setItem(f,JSON.stringify(a))}function L(){return localStorage.getItem(f)!==null}function T(){const a=localStorage.getItem(h);if(!a)return null;try{return JSON.parse(a)}catch{return null}}function E(a){localStorage.setItem(h,JSON.stringify(a))}function M(){return localStorage.getItem(h)!==null}async function C(a){const s=[],e=[];for(const t of a.referencias.nodos)try{const r=await fetch(`./data/${t}`);if(!r.ok){console.error(`Error loading node: ${t}`);continue}const n=await r.json();s.push(n)}catch(r){console.error(`Error loading node ${t}:`,r)}for(const t of a.referencias.aristas)try{const r=await fetch(`./data/${t}`);if(!r.ok){console.error(`Error loading edge: ${t}`);continue}const n=await r.json();e.push(n)}catch(r){console.error(`Error loading edge ${t}:`,r)}return{version:a.version,nombre_viaje:a.nombre_viaje,fechas:a.fechas,nodos:s,aristas:e}}function j(a){let s=a.aristas.map(d=>d.id),e=[],t=[],r=new Set,n=a.nodos.find(d=>d.tipo==="casa_origen");n&&t.push({tipo:"nodo",id:n.id});let l=0;do{let d=[];r.has(n.id)||(r.add(n.id),d=k(N(a,n.id)));let p=d.map(i=>i.id);s=s.filter(i=>!p.includes(i)),p.forEach(i=>{e.includes(i)||e.push(i)});let c=e.pop(),o=a.aristas.find(i=>i.id===c);o&&(t.push({tipo:"arista",id:o.id}),n=a.nodos.find(i=>i.id===o.destino_id),n&&t.push({tipo:"nodo",id:n.id}))}while((e.length>0||s.length>0)&&l<200);return t}function N(a,s){let e=a.aristas.filter(t=>t.origen_id===s);return e=k(e),e}function k(a){return a.sort((e,t)=>{const r=new Date(`${e.logistica_salida.fecha_salida}T${e.logistica_salida.hora_salida_origen}`);return new Date(`${t.logistica_salida.fecha_salida}T${t.logistica_salida.hora_salida_origen}`)-r})}async function I(){if(L()){const a=y();if(!M()){const s=j(a);E(s)}return a}try{const a=await fetch("./data/viaje-raiz.json");if(!a.ok)throw new Error(`HTTP error! status: ${a.status}`);const s=await a.json(),e=await C(s);S(e);const t=j(e);return E(t),e}catch(a){return console.error("Error loading viaje data:",a),null}}async function A(){let a="Itinerario";try{let e=y();e||(e=await I()),e&&e.nombre_viaje&&(a=e.nombre_viaje)}catch(e){console.error("Error loading viaje name:",e)}document.title=a;const s=document.querySelector("h1");s&&(s.textContent=a)}A();"serviceWorker"in navigator&&window.addEventListener("load",()=>{navigator.serviceWorker.register("/itinerary/sw.js").then(a=>{console.log("Service Worker registrado con éxito:",a.scope)}).catch(a=>{console.error("Error al registrar Service Worker:",a)})});async function q(){const a=document.getElementById("node-list");if(!a){console.error("Element #node-list not found");return}let s=y();s||(s=await I());const e=T();if(!e||e.length===0){a.textContent="No se encontró itinerario";return}const t=new Map;s.nodos.forEach(l=>{t.set(l.id,l)});const r=new Map;s.aristas.forEach(l=>{r.set(l.id,l)});let n="";for(const l of e)if(l.tipo==="nodo"){const d=t.get(l.id);d&&(n+=H(d))}else if(l.tipo==="arista"){const d=r.get(l.id);if(d){const p=t.get(d.origen_id),c=t.get(d.destino_id);n+=V(d,p,c)}}a.innerHTML=n,document.querySelectorAll(".nodo-card, .arista-card").forEach(l=>{const d=l.querySelector(".nodo-card-header, .arista-card-header");d&&d.addEventListener("click",()=>{G(l)})})}function H(a){const s=B(a.tipo),e=O(a.tipo),t=a.visitas&&a.visitas.length>0?a.visitas[0].entrada:"",r=a.visitas&&a.visitas.length>0?a.visitas[0].salida:"",n=a.direccion?.ciudad||"",l=a.direccion?.pais||"",d=a.direccion?.maps_link||"",p=a.contacto||{},c=a.horarios||{},o=a.visitas&&a.visitas.length>0?a.visitas[0].clima:null,i=a.visitas&&a.visitas.length>0?a.visitas[0].reserva:null,u=a.visitas&&a.visitas.length>0?a.visitas[0].notas:null,$=a.actividades||[],g=a.equipaje_recomendado||[],v=a.moneda_local||{},b=a.idioma_principal||"",w=a.tiempo_estimado_visita||"",x=a.reglas_especiales||[];return`
    <div class="nodo-card" data-id="${a.id}">
      <div class="nodo-card-header">
        <span class="nodo-card-icon material-symbols-outlined">${s}</span>
        <div class="nodo-card-content">
          <div class="nodo-card-title">${a.nombre||a.id}</div>
          <div class="nodo-card-subtitle">
            <span class="nodo-card-badge ${a.tipo}">${e}</span>
            ${n?` · ${n}`:""}
            ${l?`, ${l}`:""}
            ${t?` · ${_(t)}`:""}
          </div>
        </div>
        <span class="nodo-card-toggle material-symbols-outlined">expand_more</span>
      </div>

      <div class="nodo-card-expanded">
        ${t?`
          <div class="nodo-detail-row">
            <span class="material-symbols-outlined">calendar_today</span>
            <span><strong>Entrada:</strong> ${_(t)}${r&&r!==t?` · <strong>Salida:</strong> ${_(r)}`:""}</span>
          </div>
        `:""}

        ${n||l?`
          <div class="nodo-detail-row">
            <span class="material-symbols-outlined">location_on</span>
            <span>${n}${n&&l?", ":""}${l}</span>
            ${d?`<a href="${d}" target="_blank" rel="noopener noreferrer" class="nodo-detail-link">Ver en mapa</a>`:""}
          </div>
        `:""}

        ${p.telefono||p.email||p.web?`
          <div class="nodo-detail-row">
            <span class="material-symbols-outlined">contact_support</span>
            <span>
              ${p.telefono?`📞 ${p.telefono}`:""}
              ${p.email?` · ✉️ ${p.email}`:""}
              ${p.web?` · 🌐 <a href="${p.web}" target="_blank" rel="noopener noreferrer" class="nodo-detail-link">${p.web}</a>`:""}
            </span>
          </div>
        `:""}

        ${c.check_in||c.check_out||c.horario_apertura||c.horario_cierre||c.atencion?`
          <div class="nodo-detail-row">
            <span class="material-symbols-outlined">schedule</span>
            <span>
              ${c.check_in?`Check-in: ${c.check_in}`:""}
              ${c.check_out?` · Check-out: ${c.check_out}`:""}
              ${c.horario_apertura?` · Apertura: ${c.horario_apertura}`:""}
              ${c.horario_cierre?` · Cierre: ${c.horario_cierre}`:""}
              ${c.atencion?` · Atención: ${c.atencion}`:""}
            </span>
          </div>
        `:""}

        ${o?`
          <div class="nodo-detail-row">
            <span class="material-symbols-outlined">partly_cloudy_day</span>
            <span>
              ${o.temperatura_promedio||""}
              ${o.condiciones||""}
              ${o.probabilidad_lluvia?` · Lluvia: ${o.probabilidad_lluvia}`:""}
              ${o.recomendacion_vestimenta?` · 👕 ${o.recomendacion_vestimenta}`:""}
            </span>
          </div>
        `:""}

        ${i?`
          <div class="nodo-detail-row">
            <span class="material-symbols-outlined">confirmation_number</span>
            <span>
              ${i.confirmada!==void 0?i.confirmada?"✅ Confirmada":"❌ No confirmada":""}
              ${i.nombre_titular?` · Titular: ${i.nombre_titular}`:""}
              ${i.codigo_reserva?` · Código: ${i.codigo_reserva}`:""}
              ${i.plataforma?` · ${i.plataforma}`:""}
              ${i.costo?` · 💰 ${i.costo.valor} ${i.costo.moneda}`:""}
            </span>
          </div>
        `:""}

        ${$.length>0?`
          <div class="nodo-detail-row nodo-detail-actividades">
            <span class="material-symbols-outlined">tour</span>
            <span>
              <strong>Actividades:</strong>
              <ul class="nodo-detail-list">
                ${$.map(m=>`
                  <li>
                    ${m.nombre||m.id}
                    ${m.tipo?` (${m.tipo})`:""}
                    ${m.duracion_estimada?` · ⏱️ ${m.duracion_estimada}`:""}
                    ${m.horario_recomendado?` · 🕐 ${m.horario_recomendado}`:""}
                    ${m.notas?` · ${m.notas}`:""}
                  </li>
                `).join("")}
              </ul>
            </span>
          </div>
        `:""}

        ${g.length>0?`
          <div class="nodo-detail-row">
            <span class="material-symbols-outlined">luggage</span>
            <span>
              <strong>Equipaje recomendado:</strong>
              ${g.map(m=>`🧳 ${m}`).join(" · ")}
            </span>
          </div>
        `:""}

        ${w?`
          <div class="nodo-detail-row">
            <span class="material-symbols-outlined">hourglass_top</span>
            <span><strong>Tiempo estimado:</strong> ${w}</span>
          </div>
        `:""}

        ${b?`
          <div class="nodo-detail-row">
            <span class="material-symbols-outlined">translate</span>
            <span><strong>Idioma:</strong> ${b}</span>
          </div>
        `:""}

        ${v.codigo?`
          <div class="nodo-detail-row">
            <span class="material-symbols-outlined">payments</span>
            <span><strong>Moneda:</strong> ${v.codigo} ${v.simbolo||""} ${v.tasa_referencia?`(≈ ${v.tasa_referencia})`:""}</span>
          </div>
        `:""}

        ${x.length>0?`
          <div class="nodo-detail-row">
            <span class="material-symbols-outlined">gavel</span>
            <span>
              <strong>Reglas:</strong>
              <ul class="nodo-detail-list">
                ${x.map(m=>`<li>${m}</li>`).join("")}
              </ul>
            </span>
          </div>
        `:""}

        ${u?`
          <div class="nodo-detail-row nodo-detail-notas">
            <span class="material-symbols-outlined">note</span>
            <span><strong>Notas:</strong> ${u}</span>
          </div>
        `:""}
      </div>
    </div>
  `}function V(a,s,e){const t=J(a.modo),r=P(a.modo),n=s?s.nombre||s.id:a.origen_id,l=e?e.nombre||e.id:a.destino_id,d=a.logistica_salida?.fecha_salida||"",p=a.logistica_salida?.hora_salida_origen||"",c=a.logistica_salida?.hora_llegada_destino||"",o=a.transporte||{},i=a.tiempo_estimado||{},u=a.costos||{},$=a.notas||"",g=a.reglas_holgura||null;return`
    <div class="arista-card" data-id="${a.id}">
      <div class="arista-card-header">
        <span class="arista-card-icon material-symbols-outlined">${t}</span>
        <div class="arista-card-content">
          <div class="arista-card-title">
            <span class="arista-modo">${r}</span>
            <span class="arista-fecha">${d?`${_(d)} ${p}`:""}</span>
            <span class="arista-duracion">${i.minutos?`${i.minutos} min`:""}</span>
          </div>
        </div>
        <span class="arista-card-toggle material-symbols-outlined">expand_more</span>
      </div>

      <div class="arista-card-expanded">
        <div class="arista-detail-row">
          <span class="material-symbols-outlined">route</span>
          <span><strong>Trayecto:</strong> ${n} → ${l}</span>
        </div>

        ${o.compania||o.tipo_vehiculo||o.numero_vuelo||o.linea?`
          <div class="arista-detail-row">
            <span class="material-symbols-outlined">directions_car</span>
            <span>
              ${o.compania?`${o.compania}`:""}
              ${o.tipo_vehiculo?` · ${o.tipo_vehiculo}`:""}
              ${o.numero_vuelo?` · ✈️ ${o.numero_vuelo}`:""}
              ${o.linea?` · 🚆 ${o.linea}`:""}
            </span>
          </div>
        `:""}

        ${o.terminal_origen||o.terminal_destino?`
          <div class="arista-detail-row">
            <span class="material-symbols-outlined">terminal</span>
            <span>
              ${o.terminal_origen?`Terminal origen: ${o.terminal_origen}`:""}
              ${o.terminal_destino?` · Terminal destino: ${o.terminal_destino}`:""}
            </span>
          </div>
        `:""}

        ${o.codigo_reserva_confirmacion?`
          <div class="arista-detail-row">
            <span class="material-symbols-outlined">confirmation_number</span>
            <span><strong>Código de reserva:</strong> ${o.codigo_reserva_confirmacion}</span>
          </div>
        `:""}

        ${d||p||c?`
          <div class="arista-detail-row">
            <span class="material-symbols-outlined">schedule</span>
            <span>
              ${d?`<strong>Fecha:</strong> ${_(d)}`:""}
              ${p?` · <strong>Salida:</strong> ${p}`:""}
              ${c?` · <strong>Llegada:</strong> ${c}`:""}
            </span>
          </div>
        `:""}

        ${i.minutos||i.rango?`
          <div class="arista-detail-row">
            <span class="material-symbols-outlined">hourglass_bottom</span>
            <span>
              <strong>Tiempo estimado:</strong> 
              ${i.minutos?`${i.minutos} min`:""}
              ${i.rango?` (${i.rango})`:""}
              ${i.con_holgura?` · Con holgura: ${i.con_holgura} min`:""}
            </span>
          </div>
        `:""}

        ${g?`
          <div class="arista-detail-row arista-detail-holgura">
            <span class="material-symbols-outlined">warning</span>
            <span>
              <strong>${g.tiempo_requerido||""}</strong>
              ${g.motivo?` · ${g.motivo}`:""}
            </span>
          </div>
        `:""}

        ${u.valor||u.moneda?`
          <div class="arista-detail-row">
            <span class="material-symbols-outlined">payments</span>
            <span>
              <strong>Costo:</strong> ${u.valor||""} ${u.moneda||""}
              ${u.pagado_por?` · Pagado por: ${u.pagado_por}`:""}
              ${u.incluido_en?` · Incluido en: ${u.incluido_en}`:""}
            </span>
          </div>
        `:""}

        ${o.detalles?`
          <div class="arista-detail-row">
            <span class="material-symbols-outlined">info</span>
            <span>${o.detalles}</span>
          </div>
        `:""}

        ${$?`
          <div class="arista-detail-row arista-detail-notas">
            <span class="material-symbols-outlined">note</span>
            <span><strong>Notas:</strong> ${$}</span>
          </div>
        `:""}
      </div>
    </div>
  `}function G(a){const s=a.querySelector(".nodo-card-expanded, .arista-card-expanded"),e=a.querySelector(".nodo-card-toggle, .arista-card-toggle");if(!s||!e)return;document.querySelectorAll(".nodo-card.expanded, .arista-card.expanded").forEach(r=>{if(r!==a){const n=r.querySelector(".nodo-card-expanded, .arista-card-expanded"),l=r.querySelector(".nodo-card-toggle, .arista-card-toggle");n&&l&&(n.style.maxHeight="0",n.style.opacity="0",l.textContent="expand_more",r.classList.remove("expanded"))}}),a.classList.contains("expanded")?(s.style.maxHeight="0",s.style.opacity="0",e.textContent="expand_more",a.classList.remove("expanded")):(s.style.maxHeight=s.scrollHeight+"px",s.style.opacity="1",e.textContent="expand_less",a.classList.add("expanded"))}function _(a){if(!a)return"";const s=a.split("-");if(s.length!==3)return a;const e=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];return`${parseInt(s[2])} ${e[parseInt(s[1])-1]} ${s[0]}`}function B(a){return{aeropuerto:"flight_takeoff",hotel:"bed",casa_origen:"home",casa_amigo:"diversity_2",atraccion:"theater_comedy",festival:"music_note",oficina_alquiler:"business_center"}[a]||"location_on"}function O(a){return{aeropuerto:"Aeropuerto",hotel:"Hotel",casa_origen:"Inicio",casa_amigo:"Casa de amigo",atraccion:"Atracción",festival:"Festival",oficina_alquiler:"Alquiler de auto"}[a]||a}function J(a){return{avion:"flight",tren:"train",metro:"subway",bus:"directions_bus",auto:"directions_car",caminata:"directions_walk",taxi:"taxi",transbordador:"ferry"}[a]||"arrow_forward"}function P(a){return{avion:"Avión",tren:"Tren",metro:"Metro",bus:"Bus",auto:"Auto",caminata:"Caminata",taxi:"Taxi",transbordador:"Transbordador"}[a]||"Desplazamiento"}q();
