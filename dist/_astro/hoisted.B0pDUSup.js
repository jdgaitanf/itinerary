const I="viajeGraph",T="itineraryList";function k(){const n=localStorage.getItem(I);if(!n)return null;try{return JSON.parse(n)}catch{return null}}function M(n){localStorage.setItem(I,JSON.stringify(n))}function B(){return localStorage.getItem(I)!==null}function D(){const n=localStorage.getItem(T);if(!n)return null;try{return JSON.parse(n)}catch{return null}}function x(n){localStorage.setItem(T,JSON.stringify(n))}function U(){return localStorage.getItem(T)!==null}async function V(n){const e=[],t=[];for(const a of n.referencias.nodos)try{const o=await fetch(`/itinerary/data/${a}`);if(!o.ok){console.error(`Error loading node: ${a}`);continue}const l=await o.json();e.push(l)}catch(o){console.error(`Error loading node ${a}:`,o)}for(const a of n.referencias.aristas)try{const o=await fetch(`/itinerary/data/${a}`);if(!o.ok){console.error(`Error loading edge: ${a}`);continue}const l=await o.json();t.push(l)}catch(o){console.error(`Error loading edge ${a}:`,o)}return{version:n.version,nombre_viaje:n.nombre_viaje,fechas:n.fechas,nodos:e,aristas:t}}function z(n,e){let t=n.aristas.filter(a=>a.origen_id===e);return t=J(t),t}function J(n){return n.sort((t,a)=>{const o=new Date(`${t.logistica_salida.fecha_salida}T${t.logistica_salida.hora_salida_origen}`);return new Date(`${a.logistica_salida.fecha_salida}T${a.logistica_salida.hora_salida_origen}`)-o})}const E=500;function W(n){const e=n.nodos.find(t=>t.tipo==="casa_origen");if(!e)throw new Error('Grafo inválido: no se encontró un nodo de tipo "casa_origen".');return e}function Y(n,e,t){return t.has(e)?[]:(t.add(e),z(n,e))}function S(n){const e=W(n),t=new Set(n.aristas.map(p=>p.id)),a=new Set,o=new Map,l=[],d=new Set,r=[];let i=e,f=0;o.set(e.id,0);const s=e.visitas&&e.visitas.length>0?e.visitas[0].entrada:"";for(r.push({tipo:"nodo",id:e.id,visitaIndex:0,fecha:s});(l.length>0||t.size>0)&&f<E;){f++;const p=Y(n,i.id,a);for(const _ of p)t.has(_.id)&&!d.has(_.id)&&(d.add(_.id),l.push(_.id));const u=l.pop();if(!u){console.warn(`Grafo posiblemente desconectado. Quedan ${t.size} aristas sin procesar.`);break}if(d.delete(u),!t.has(u))continue;const c=n.aristas.find(_=>_.id===u);if(!c){t.delete(u),console.warn(`Arista con ID "${u}" no encontrada en el grafo. Se omite.`);continue}const g=c.logistica_salida?.fecha_salida||"";r.push({tipo:"arista",id:c.id,fecha:g}),t.delete(c.id);const m=n.nodos.find(_=>_.id===c.destino_id);if(!m)throw new Error(`El nodo destino "${c.destino_id}" de la arista "${c.id}" no existe en el grafo.`);const h=o.get(m.id)||0,v=r.find(_=>_.tipo==="nodo"&&_.id===m.id&&_.visitaIndex===h);let y=h;v?(y=h+1,o.set(m.id,y)):o.set(m.id,h);let b=c.logistica_salida?.fecha_llegada||c.logistica_salida?.fecha_salida||"";b||(b=(m.visitas&&m.visitas.length>0?m.visitas[Math.min(y,m.visitas.length-1)]:null)?.entrada||""),r.push({tipo:"nodo",id:m.id,visitaIndex:y,fecha:b}),i=m}return f>=E&&console.warn(`El recorrido alcanzó el límite de ${E} iteraciones. Quedan ${t.size} aristas sin procesar.`),console.log(r),r}async function K(){if(B()){const n=k();if(!U()){const e=S(n);x(e)}return n}try{const n=await fetch("/itinerary/data/viaje-raiz.json");if(!n.ok)throw new Error(`HTTP error! status: ${n.status}`);const e=await n.json(),t=await V(e);M(t);const a=S(t);return x(a),t}catch(n){return console.error("Error loading viaje data:",n),null}}class Q{constructor(){this.graph=null,this.itinerary=null,this.loading=!1,this.loaded=!1}async getData(){if(this.loaded&&this.graph)return{graph:this.graph,itinerary:this.itinerary};if(this.loading)return await new Promise(e=>{const t=setInterval(()=>{this.loading||(clearInterval(t),e())},50)}),{graph:this.graph,itinerary:this.itinerary};this.loading=!0;try{const e=await K();return this.graph=e,this.itinerary=D(),this.loaded=!0,{graph:this.graph,itinerary:this.itinerary}}catch(e){throw console.error("Error loading data:",e),e}finally{this.loading=!1}}getGraph(){return this.graph||k()}getItinerary(){return this.itinerary||D()}isLoaded(){return this.loaded}reset(){this.graph=null,this.itinerary=null,this.loaded=!1}}const L=new Q;async function X(){let n="Itinerario";try{const t=await L.getData();t&&t.graph&&t.graph.nombre_viaje&&(n=t.graph.nombre_viaje)}catch(t){console.error("Error loading viaje name:",t)}document.title=n;const e=document.querySelector("h1");e&&(e.textContent=n)}X();const Z="modulepreload",ee=function(n){return"/itinerary/"+n},O={},te=function(e,t,a){let o=Promise.resolve();if(t&&t.length>0){document.getElementsByTagName("link");const d=document.querySelector("meta[property=csp-nonce]"),r=d?.nonce||d?.getAttribute("nonce");o=Promise.allSettled(t.map(i=>{if(i=ee(i),i in O)return;O[i]=!0;const f=i.endsWith(".css"),s=f?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${i}"]${s}`))return;const p=document.createElement("link");if(p.rel=f?"stylesheet":Z,f||(p.as="script"),p.crossOrigin="",p.href=i,r&&p.setAttribute("nonce",r),document.head.appendChild(p),f)return new Promise((u,c)=>{p.addEventListener("load",u),p.addEventListener("error",()=>c(new Error(`Unable to preload CSS for ${i}`)))})}))}function l(d){const r=new Event("vite:preloadError",{cancelable:!0});if(r.payload=d,window.dispatchEvent(r),!r.defaultPrevented)throw d}return o.then(d=>{for(const r of d||[])r.status==="rejected"&&l(r.reason);return e().catch(l)})};(function(){const n=document.getElementById("home-content"),e=document.getElementById("finance-content"),t=document.getElementById("settings-content"),a=document.querySelectorAll("[data-tab]");let o=!1;function l(){o||te(()=>Promise.resolve().then(()=>le),void 0).then(i=>{i.loadFinance&&(i.loadFinance(),o=!0)}).catch(i=>{console.error("Error al cargar el módulo de finanzas:",i)})}function d(i){if(n.style.display="none",e.style.display="none",t.style.display="none",i==="home")n.style.display="block";else if(i==="finance")e.style.display="block",l();else if(i==="settings")t.style.display="block";else return;a.forEach(f=>{f.dataset.tab===i?f.classList.add("active"):f.classList.remove("active")});try{localStorage.setItem("activeTab",i)}catch{}}let r=null;try{r=localStorage.getItem("activeTab")}catch{}d(r&&(r==="home"||r==="finance"||r==="settings")?r:"home"),a.forEach(i=>{i.addEventListener("click",function(f){const s=this.dataset.tab;s&&d(s)})})})();const j={COP:1,EUR:4088.58,USD:3573.76,CHF:4425.25},N={hotel:"Alojamiento",casa:"Alojamiento",casa_amigo:"Alojamiento",aeropuerto:"Transporte",oficina_alquiler:"Transporte",atraccion:"Entradas",festival:"Eventos"},ne={avion:"Transporte",tren:"Transporte",metro:"Transporte",bus:"Transporte",auto:"Transporte",caminata:"Transporte",taxi:"Transporte",transbordador:"Transporte"};function q(n,e){if(!n||!n.sources)return"ai";const t=e.split(".");let a=n.sources;for(const o of t)if(a&&typeof a=="object"&&o in a)a=a[o];else return"ai";return typeof a=="string"?a:"ai"}function P(n,e){return q(n,e)}function ae(n,e){return q(n,e)}class oe{calculate(e,t="COP"){const a=[];let o=0,l=0;for(const s of e.nodos)if(s.visitas)for(let p=0;p<s.visitas.length;p++){const u=s.visitas[p];if(u.reserva&&u.reserva.costo){const c=u.reserva.costo;let g=Array.isArray(c)?c:[c];for(const m of g)if(m&&typeof m.valor=="number"){const h=P(s,`visitas[${p}].reserva.costo`),v=`${s.nombre||s.id} - Reserva${m.concepto?" ("+m.concepto+")":""}`,y=N[s.tipo]||"Otros";a.push({descripcion:v,categoria:y,monto:m.valor,moneda:m.moneda||"COP",pagado_por:m.pagado_por||"",source:h,nodoId:s.id,tipo:"nodo"})}}if(u.actividades)for(let c=0;c<u.actividades.length;c++){const g=u.actividades[c];if(g.reserva&&g.reserva.costo){const m=g.reserva.costo;let h=Array.isArray(m)?m:[m];for(const v of h)if(v&&typeof v.valor=="number"){const y=P(s,`visitas[${p}].actividades[${c}].reserva.costo`),b=`${s.nombre||s.id} - ${g.nombre||"Actividad"}`,_=N[s.tipo]||"Otros";a.push({descripcion:b,categoria:_,monto:v.valor,moneda:v.moneda||"COP",pagado_por:v.pagado_por||"",source:y,nodoId:s.id,tipo:"actividad"})}}}}for(const s of e.aristas)if(s.costos&&s.costos.valor){const p=s.costos;if(typeof p.valor=="number"){const u=ae(s,"costos"),c=e.nodos.find(v=>v.id===s.origen_id),g=e.nodos.find(v=>v.id===s.destino_id),m=`Traslado: ${c?.nombre||s.origen_id} → ${g?.nombre||s.destino_id}`,h=ne[s.modo]||"Transporte";a.push({descripcion:m,categoria:h,monto:p.valor,moneda:p.moneda||"COP",pagado_por:p.pagado_por||"",source:u,aristaId:s.id,tipo:"arista"})}}const d=a.map(s=>{const p=j[s.moneda]||1,u=j[t]||1,c=s.monto*p/u;return{...s,montoConvertido:c,monedaOriginal:s.moneda}});for(const s of d)o+=s.montoConvertido,s.pagado_por&&s.pagado_por.trim()!==""&&(l+=s.montoConvertido);const r={};for(const s of d){const p=s.categoria;r[p]||(r[p]=0),r[p]+=s.montoConvertido}const i={};for(const s of d)if(s.pagado_por&&s.pagado_por.trim()!==""){const p=s.pagado_por;i[p]||(i[p]=0),i[p]+=s.montoConvertido}const f=o-l;return{totalPresupuesto:o,totalGastado:l,saldo:f,porCategoria:r,porPersona:i,gastos:d,moneda:t}}}function $(n,e){const t={COP:"$",EUR:"€",USD:"US$",CHF:"Fr."}[e]||e,o=Math.floor(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g,".");return`${t} ${o}`}class re{render(e,t){e&&(e.innerHTML=this._buildHTML(t),this._attachEvents(e,t))}_buildHTML(e){const{totalPresupuesto:t,totalGastado:a,saldo:o,porCategoria:l,porPersona:d,gastos:r,moneda:i}=e,f=t>0?a/t*100:0,s=f>80?"#d32f2f":f>50?"#f57c00":"#2e7d32";return`
      <div class="finance-container">
        <div class="finance-summary">
          <div class="finance-card">
            <span class="finance-label">Presupuesto</span>
            <span class="finance-value">${$(t,i)}</span>
          </div>
          <div class="finance-card">
            <span class="finance-label">Gastado</span>
            <span class="finance-value">${$(a,i)}</span>
          </div>
          <div class="finance-card">
            <span class="finance-label">Saldo</span>
            <span class="finance-value ${o<0?"negative":""}">${$(o,i)}</span>
          </div>
        </div>

        <div class="finance-progress">
          <div class="progress-bar" style="width:${Math.min(f,100)}%; background-color:${s};"></div>
          <span class="progress-label">${f.toFixed(0)}%</span>
        </div>

        <div class="finance-currency-selector">
          <label for="currency-select">Moneda:</label>
          <select id="currency-select">
            <option value="COP" ${i==="COP"?"selected":""}>COP</option>
            <option value="EUR" ${i==="EUR"?"selected":""}>EUR</option>
            <option value="USD" ${i==="USD"?"selected":""}>USD</option>
            <option value="CHF" ${i==="CHF"?"selected":""}>CHF</option>
          </select>
        </div>

        <div class="finance-breakdown">
          <h3>Por categoría</h3>
          <ul class="breakdown-list">
            ${Object.entries(l).map(([u,c])=>`
              <li><span class="breakdown-label">${u}</span><span class="breakdown-value">${$(c,i)}</span></li>
            `).join("")}
          </ul>
        </div>

        <div class="finance-breakdown">
          <h3>Por persona</h3>
          <ul class="breakdown-list">
            ${Object.entries(d).map(([u,c])=>`
              <li><span class="breakdown-label">${u}</span><span class="breakdown-value">${$(c,i)}</span></li>
            `).join("")}
          </ul>
        </div>

        <div class="finance-details">
          <button id="toggle-details-btn" class="toggle-details-btn">Mostrar lista de gastos</button>
          <div id="details-list" style="display:none;">
            <ul class="expense-list">
              ${r.map((u,c)=>`
                <li class="expense-item ${u.source==="user"?"confirmed":"estimated"}">
                  <span class="expense-desc">${u.descripcion}</span>
                  <span class="expense-amount">${$(u.montoConvertido,i)}</span>
                  <span class="expense-badge ${u.source}">${u.source==="user"?"Confirmado":"Estimado"}</span>
                  <span class="expense-source">${u.pagado_por?`Pagado por: ${u.pagado_por}`:""}</span>
                  <span class="expense-category">${u.categoria}</span>
                </li>
              `).join("")}
            </ul>
          </div>
        </div>
      </div>
    `}_attachEvents(e,t){const a=e.querySelector("#toggle-details-btn"),o=e.querySelector("#details-list");a&&o&&a.addEventListener("click",()=>{const d=o.style.display==="none";o.style.display=d?"block":"none",a.textContent=d?"Ocultar lista de gastos":"Mostrar lista de gastos"});const l=e.querySelector("#currency-select");l&&l.addEventListener("change",d=>{const r=d.target.value;try{localStorage.setItem("selectedCurrency",r)}catch{}window.dispatchEvent(new CustomEvent("currencyChanged",{detail:{currency:r}}))})}}let w=null,se=null,C=null;function ie(){return C||(C=document.getElementById("finance-content")),C}function ce(){try{return localStorage.getItem("selectedCurrency")||"COP"}catch{return"COP"}}async function F(){const n=ie();if(n)try{const e=await L.getData();if(!e.graph){n.innerHTML="<p>No hay datos del grafo disponibles</p>";return}const t=new oe,a=ce(),o=t.calculate(e.graph,a);se=o,w||(w=new re),w.render(n,o)}catch(e){console.error("Error al renderizar finanzas:",e),n.innerHTML="<p>Error al cargar los datos financieros</p>"}}window.addEventListener("currencyChanged",()=>{F()});function de(){F()}const le=Object.freeze(Object.defineProperty({__proto__:null,loadFinance:de},Symbol.toStringTag,{value:"Module"}));(function(){const n=document.getElementById("clear-cache-btn"),e=document.getElementById("viaje-version"),t=document.getElementById("cache-status"),a=document.getElementById("nodos-count"),o=document.getElementById("aristas-count"),l=document.getElementById("graph-file-input"),d=document.getElementById("load-graph-btn"),r=document.getElementById("load-status"),i=document.getElementById("download-def-btn"),f=document.getElementById("settings-advanced-header"),s=document.getElementById("settings-advanced-content");function p(){B()?t.textContent="Datos en caché":t.textContent="Sin datos en caché";const g=k();g?(e.textContent=g.version||"No definida",a.textContent=g.nodos?g.nodos.length:0,o.textContent=g.aristas?g.aristas.length:0):(e.textContent="No cargado",a.textContent="0",o.textContent="0")}function u(c){const g=new FileReader;g.onload=function(m){try{const h=JSON.parse(m.target.result);if(!h.nodos||!h.aristas){r.textContent="Error: El archivo no contiene un grafo válido (faltan nodos o aristas)",r.style.color="red";return}M(h);try{const v=S(h);x(v)}catch(v){console.error("Error al construir el itinerario:",v),r.textContent="Grafo guardado pero error al construir itinerario: "+v.message,r.style.color="orange",p();return}r.textContent="Grafo cargado y guardado correctamente. Recargando...",r.style.color="green",p(),setTimeout(()=>{window.location.reload()},1500)}catch(h){r.textContent="Error al leer el archivo JSON: "+h.message,r.style.color="red",console.error("Error al cargar el archivo:",h)}},g.onerror=function(){r.textContent="Error al leer el archivo",r.style.color="red"},g.readAsText(c)}d&&l&&(d.addEventListener("click",function(){const c=l.files[0];if(!c){r.textContent="Por favor selecciona un archivo JSON primero",r.style.color="orange";return}r.textContent="Cargando...",r.style.color="blue",u(c)}),l.addEventListener("change",function(){r.textContent=""})),i&&i.addEventListener("click",function(){fetch("/itinerary/docs/ItineraryDef.md").then(c=>{if(!c.ok)throw new Error("HTTP error! status: "+c.status);return c.text()}).then(c=>{const g=new Blob([c],{type:"text/markdown"}),m=URL.createObjectURL(g),h=document.createElement("a");h.href=m,h.download="ItineraryDef.md",document.body.appendChild(h),h.click(),document.body.removeChild(h),setTimeout(()=>{URL.revokeObjectURL(m)},100),r.textContent="Definición descargada correctamente",r.style.color="green"}).catch(c=>{console.error("Error al descargar el archivo:",c),r.textContent="Error al descargar la definición: "+c.message,r.style.color="red"})}),f&&s&&f.addEventListener("click",function(){s.style.display!=="none"?(s.style.display="none",f.classList.remove("expanded")):(s.style.display="block",f.classList.add("expanded"))}),p(),n&&n.addEventListener("click",function(){try{localStorage.clear(),console.log("Caché eliminada correctamente")}catch(c){console.error("Error al eliminar la caché:",c)}window.location.reload()})})();(function(){const n=document.getElementById("theme-toggle-checkbox"),e=document.getElementById("theme-icon"),t=document.documentElement;function a(l){l?t.classList.add("dark-mode"):t.classList.remove("dark-mode"),e&&(e.textContent=l?"dark_mode":"light_mode");const d=document.querySelector('meta[name="theme-color"]');d&&(d.content=l?"#121212":"#f5f5f5");try{localStorage.setItem("darkMode",l?"true":"false")}catch{}n&&(n.checked=l)}let o=null;try{o=localStorage.getItem("darkMode")}catch{}if(o!==null)a(o==="true");else{const l=window.matchMedia("(prefers-color-scheme: dark)").matches;a(l)}n&&n.addEventListener("change",function(){a(this.checked)})})();"serviceWorker"in navigator&&window.addEventListener("load",()=>{navigator.serviceWorker.register("/itinerary/sw.js").then(n=>{console.log("Service Worker registrado con éxito:",n.scope)}).catch(n=>{console.error("Error al registrar Service Worker:",n)})});const ue={aeropuerto:"flight_takeoff",hotel:"bed",casa_origen:"home",casa_amigo:"diversity_2",atraccion:"theater_comedy",festival:"music_note",oficina_alquiler:"business_center"},pe={avion:"flight",tren:"train",metro:"subway",bus:"directions_bus",auto:"directions_car",caminata:"directions_walk",taxi:"taxi",transbordador:"ferry"};function fe(n){return ue[n]||"location_on"}function me(n){return pe[n]||"arrow_forward"}const ge={aeropuerto:"Aeropuerto",hotel:"Hotel",casa_origen:"Inicio",casa_amigo:"Casa de amigo",atraccion:"Atracción",festival:"Festival",oficina_alquiler:"Alquiler de auto"},he={avion:"Avión",tren:"Tren",metro:"Metro",bus:"Bus",auto:"Auto",caminata:"Caminata",taxi:"Taxi",transbordador:"Transbordador"};function ve(n){return ge[n]||n}function _e(n){return he[n]||"Desplazamiento"}function A(n){if(!n)return"";const e=n.split("-");if(e.length!==3)return n;const t=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];return`${parseInt(e[2])} ${t[parseInt(e[1])-1]} ${e[0]}`}class ye{constructor(){this.icons=fe,this.labels=ve,this.formatDate=A}render(e,t=0,a=""){const o=this.icons(e.tipo),l=this.labels(e.tipo),d=e.visitas&&e.visitas.length>0?e.visitas[Math.min(t,e.visitas.length-1)]:null,r=a||d?.entrada||"",i=d?.salida||"",f=e.direccion?.ciudad||"",s=e.direccion?.pais||"",p=e.direccion?.maps_link||"",u=e.contacto||{},c=e.horarios||{},g=d?.clima||null,m=d?.reserva||null,h=d?.notas||null,v=e.actividades||[],y=e.equipaje_recomendado||[],b=e.moneda_local||{},_=e.idioma_principal||"",H=e.tiempo_estimado_visita||"",G=e.reglas_especiales||[];return`
      <div class="nodo-card" data-id="${e.id}" data-visita="${t}">
        <div class="nodo-card-header">
          <span class="nodo-card-icon material-symbols-outlined">${o}</span>
          <div class="nodo-card-content">
            <div class="nodo-card-title">${e.nombre||e.id}</div>
            <div class="nodo-card-subtitle">
              <span class="nodo-card-badge ${e.tipo}">${l}</span>
              ${f?` · ${f}`:""}
              ${s?`, ${s}`:""}
              ${r?` · ${this.formatDate(r)}`:""}
            </div>
          </div>
          <span class="nodo-card-toggle material-symbols-outlined">expand_more</span>
        </div>

        <div class="nodo-card-expanded">
          ${this._renderFecha(r,i)}
          ${this._renderUbicacion(f,s,p)}
          ${this._renderContacto(u)}
          ${this._renderHorarios(c)}
          ${this._renderClima(g)}
          ${this._renderReserva(m)}
          ${this._renderActividades(v,b)}
          ${this._renderEquipaje(y)}
          ${this._renderTiempoVisita(H)}
          ${this._renderIdioma(_)}
          ${this._renderMoneda(b)}
          ${this._renderReglas(G)}
          ${this._renderNotas(h)}
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
    `:""}_renderReserva(e){if(!e)return"";let t="";return e.costo&&(e.costo.moneda&&e.costo.valor!==void 0?t=` · 💰 ${$(e.costo.valor,e.costo.moneda)}`:Array.isArray(e.costo)&&(t=` · 💰 ${e.costo.map(o=>`${o.concepto||"Costo"}: ${$(o.valor,o.moneda)}`).join(" · ")}`)),`
      <div class="nodo-detail-row">
        <span class="material-symbols-outlined">confirmation_number</span>
        <span>
          ${e.confirmada!==void 0?e.confirmada?"✅ Confirmada":"❌ No confirmada":""}
          ${e.nombre_titular?` · Titular: ${e.nombre_titular}`:""}
          ${e.codigo_reserva?` · Código: ${e.codigo_reserva}`:""}
          ${e.plataforma?` · ${e.plataforma}`:""}
          ${t}
        </span>
      </div>
    `}_renderActividades(e,t){return e.length===0?"":`
      <div class="nodo-detail-row nodo-detail-actividades">
        <span class="material-symbols-outlined">tour</span>
        <span>
          <strong>Actividades:</strong>
          <ul class="nodo-detail-list">
            ${e.map(a=>{let o="";if(a.reserva&&a.reserva.costo){const l=a.reserva.costo;o=` · 💰 ${$(l.valor,l.moneda)}`}return`
                <li>
                  ${a.nombre||a.id}
                  ${a.tipo?` (${a.tipo})`:""}
                  ${a.duracion_estimada?` · ⏱️ ${a.duracion_estimada}`:""}
                  ${a.horario_recomendado?` · 🕐 ${a.horario_recomendado}`:""}
                  ${o}
                  ${a.notas?` · ${a.notas}`:""}
                </li>
              `}).join("")}
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
    `:""}}class $e{constructor(e){this.nodosMap=e,this.icons=me,this.labels=_e,this.formatDate=A}render(e){const t=this.nodosMap.get(e.origen_id),a=this.nodosMap.get(e.destino_id),o=this.icons(e.modo),l=this.labels(e.modo),d=t?t.nombre||t.id:e.origen_id,r=a?a.nombre||a.id:e.destino_id,i=e.logistica_salida?.fecha_salida||"",f=e.logistica_salida?.hora_salida_origen||"",s=e.logistica_salida?.hora_llegada_destino||"",p=e.transporte||{},u=e.tiempo_estimado||{},c=e.costos||{},g=e.notas||"",m=e.reglas_holgura||null;return`
      <div class="arista-card" data-id="${e.id}">
        <div class="arista-card-header">
          <span class="arista-card-icon material-symbols-outlined">${o}</span>
          <div class="arista-card-content">
            <div class="arista-card-title">
              <span class="arista-modo">${l}</span>
              <span class="arista-fecha">${i?`${this.formatDate(i)} ${f}`:""}</span>
              <span class="arista-duracion">${u.minutos?`${u.minutos} min`:""}</span>
            </div>
          </div>
          <span class="arista-card-toggle material-symbols-outlined">expand_more</span>
        </div>

        <div class="arista-card-expanded">
          ${this._renderTrayecto(d,r)}
          ${this._renderTransporte(p)}
          ${this._renderTerminales(p)}
          ${this._renderCodigoReserva(p)}
          ${this._renderFechas(i,f,s)}
          ${this._renderTiempo(u)}
          ${this._renderHolgura(m)}
          ${this._renderCostos(c)}
          ${this._renderDetalles(p)}
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
    `:""}_renderCostos(e){if(!e.valor&&!e.moneda)return"";const t=e.moneda||"COP";return`
      <div class="arista-detail-row">
        <span class="material-symbols-outlined">payments</span>
        <span>
          <strong>Costo:</strong> ${$(e.valor,t)}
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
    `:""}}function be(n){const e=n.querySelector(".nodo-card-expanded, .arista-card-expanded"),t=n.querySelector(".nodo-card-toggle, .arista-card-toggle");if(!e||!t)return;document.querySelectorAll(".nodo-card.expanded, .arista-card.expanded").forEach(o=>{if(o!==n){const l=o.querySelector(".nodo-card-expanded, .arista-card-expanded"),d=o.querySelector(".nodo-card-toggle, .arista-card-toggle");l&&d&&(l.style.maxHeight="0",l.style.opacity="0",d.textContent="expand_more",o.classList.remove("expanded"))}}),n.classList.contains("expanded")?(e.style.maxHeight="0",e.style.opacity="0",t.textContent="expand_more",n.classList.remove("expanded")):(e.style.maxHeight=e.scrollHeight+"px",e.style.opacity="1",t.textContent="expand_less",n.classList.add("expanded"))}function Ee(n){n.querySelectorAll(".nodo-card, .arista-card").forEach(t=>{const a=t.querySelector(".nodo-card-header, .arista-card-header");a&&a.addEventListener("click",()=>{be(t)})})}function we(n){const e={};for(const t of n){const a=t.fecha;a&&(e[a]||(e[a]=[]),e[a].push(t))}return e}class Ce{constructor(){this.nodeRenderer=new ye,this.edgeRenderer=null,this.container=null}render(e,t,a){if(this.container=a,!e||e.length===0){a.textContent="No se encontró itinerario";return}if(!t||!t.nodos||!t.aristas){a.textContent="No hay datos del grafo disponibles";return}const o=new Map;t.nodos.forEach(s=>{o.set(s.id,s)});const l=new Map;t.aristas.forEach(s=>{l.set(s.id,s)}),this.edgeRenderer=new $e(o);const d=we(e),r=Object.keys(d).sort();let i="";for(const s of r){const p=d[s];i+=this._renderDay(s,p,o,l)}a.innerHTML=i;const f=typeof window<"u"&&window.__simulatedDate?window.__simulatedDate:new Date().toISOString().slice(0,10);this._expandirDiaCorrecto(f,a),Ee(a),this._addDayToggleListeners(a)}_renderDay(e,t,a,o){const l=A(e),d=new Set;let r=0;for(const u of t)if(u.tipo==="nodo"){const c=a.get(u.id);["atraccion","festival"].includes(c.tipo)&&r++,c&&c.direccion&&c.direccion.ciudad&&d.add(c.direccion.ciudad)}else if(u.tipo==="arista"){const c=o.get(u.id);if(c){const g=a.get(c.origen_id),m=a.get(c.destino_id);g&&g.direccion&&g.direccion.ciudad&&d.add(g.direccion.ciudad),m&&m.direccion&&m.direccion.ciudad&&d.add(m.direccion.ciudad)}}const i=d.size>0?Array.from(d).join(", "):"",f=r>0?` · ${r} eventos`:"",s=i?`${i}${f}`:f;let p="";for(const u of t)if(u.tipo==="nodo"){const c=a.get(u.id);c&&(p+=this.nodeRenderer.render(c,u.visitaIndex||0,u.fecha||""))}else if(u.tipo==="arista"){const c=o.get(u.id);c&&(p+=this.edgeRenderer.render(c))}return`
      <div class="dia-card" data-fecha="${e}">
        <div class="dia-card-header">
          <span class="dia-card-fecha">${l}</span>
          <span class="dia-card-resumen">${s}</span>
        </div>
        <div class="dia-card-body">
          ${p}
        </div>
      </div>
    `}_expandirDiaCorrecto(e,t){const a=t.querySelectorAll(".dia-card");if(a.length===0)return;const o=[];if(a.forEach(i=>{const f=i.dataset.fecha;f&&o.push(f)}),o.length===0)return;o.sort((i,f)=>i.localeCompare(f));const l=o[0],d=o[o.length-1];let r=null;if(e<l)r=l;else{if(e>d)return;if(o.includes(e))r=e;else{for(let i=o.length-1;i>=0;i--)if(o[i]<=e){r=o[i];break}r||(r=l)}}if(r){const i=t.querySelector(`.dia-card[data-fecha="${r}"]`);i&&i.classList.add("expanded")}}_addDayToggleListeners(e){e.querySelectorAll(".dia-card-header").forEach(a=>{a.addEventListener("click",()=>{const o=a.closest(".dia-card");if(!o)return;e.querySelectorAll(".dia-card.expanded").forEach(d=>{d!==o&&d.classList.remove("expanded")}),o.classList.toggle("expanded")})})}}async function R(){const n=document.getElementById("node-list");if(!n){console.error("Element #node-list not found");return}try{const e=await L.getData();if(!e.graph||!e.itinerary){n.textContent="No se encontraron datos del itinerario";return}new Ce().render(e.itinerary,e.graph,n)}catch(e){console.error("Error displaying itinerary:",e),n.textContent="Error al cargar el itinerario"}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",R):R();
