// RenT v1.2 — financial separation for rent, deposit, admin commission and repairs.
if(!Array.isArray(state.repairs)) state.repairs=[];
if(state.settings.depositReturned==null) state.settings.depositReturned=false;
if(state.settings.depositReturnDate==null) state.settings.depositReturnDate='';
if(state.settings.depositDeductionAmount==null) state.settings.depositDeductionAmount=0;
if(state.settings.depositDeductionNote==null) state.settings.depositDeductionNote='';
save();

function currentContractRentPayments(){
  return state.payments.filter(p=>p.type==='rent'&&isContractMonth(p.month));
}
function rentCollectedTotal(){
  return currentContractRentPayments().reduce((sum,p)=>sum+Number(p.amount||0),0);
}
function repairPaidTotal(){
  return state.repairs.filter(r=>r.status==='paid').reduce((sum,r)=>sum+Number(r.amount||0),0);
}
function repairPendingTotal(){
  return state.repairs.filter(r=>r.status!=='paid').reduce((sum,r)=>sum+Number(r.amount||0),0);
}
function adminPaidTotal(){
  let s=state.settings;
  return s.adminFeePaid?Number(s.adminFeeAmount||0):0;
}
function adminPendingTotal(){
  let s=state.settings;
  return !s.adminFeePaid?Number(s.adminFeeAmount||0):0;
}
function ownerInvestmentPaid(){return adminPaidTotal()+repairPaidTotal()}
function ownerInvestmentPending(){return adminPendingTotal()+repairPendingTotal()}
function depositReturnAmount(){
  let s=state.settings;
  if(!s.depositPaid||s.depositReturned)return 0;
  return Math.max(0,Number(s.depositAmount||0)-Number(s.depositDeductionAmount||0));
}
function repairStatusBadge(r){return r.status==='paid'?'<span class="badge ok">Pagada</span>':'<span class="badge warn">Pendiente</span>'}
function repairRows(){
  if(!state.repairs.length)return '<div class="muted" style="text-align:center;padding:16px">Aún no hay reparaciones registradas.</div>';
  return [...state.repairs].sort((a,b)=>(b.date||'').localeCompare(a.date||'')).map(r=>`<div class="kv"><div><b>${esc(r.concept||'Reparación')}</b><div class="small muted">${fmt(r.date)}${r.note?' · '+esc(r.note):''}</div>${repairStatusBadge(r)}</div><div style="text-align:right"><b>${money(r.amount)}</b><div><button class="btn secondary compact" data-repair-edit="${r.id}">Editar</button></div></div></div>`).join('');
}

function contract(){
  let s=state.settings,notes=noteDates(),paidNotes=notes.filter(d=>rentStatus(d.slice(0,7))==='paid').length;
  let depositOutstanding=depositReturnAmount(),deduction=Number(s.depositDeductionAmount||0),rentCollected=rentCollectedTotal(),repairsPaid=repairPaidTotal(),repairsPending=repairPendingTotal(),invested=ownerInvestmentPaid(),toInvest=ownerInvestmentPending();
  document.getElementById('contract').innerHTML=`
    <h1 class="title">Contrato</h1>
    <div class="muted" style="margin-bottom:14px">Contrato y control financiero de la propiedad</div>

    <div class="card">
      <div class="row"><div><b>Contrato de arrendamiento</b><div class="small muted">${s.contractSigned?'Firmado '+fmt(s.contractSigned):'Fecha de firma pendiente'}</div></div><span class="badge ${s.contractStart?'ok':'warn'}">${s.contractStart?'Configurado':'Configurar'}</span></div>
      <div class="kv"><span class="muted">Vigencia</span><b>${fmt(s.contractStart)} — ${fmt(s.contractEnd)}</b></div>
      <div class="kv"><span class="muted">Inquilino</span><b>${esc(s.tenantName||'—')}</b></div>
      <div class="kv"><span class="muted">Contacto</span><b>${esc(s.tenantPhone||'—')}<br><span class="small">${esc(s.tenantEmail||'')}</span></b></div>
    </div>

    <h3>Resumen financiero</h3>
    <div class="card hero">
      <div class="kv"><span>🏠 Rentas cobradas</span><b>${money(rentCollected)}</b></div>
      <div class="kv"><span>🔒 Depósito en custodia</span><b>${s.depositPaid&&!s.depositReturned?money(s.depositAmount):s.depositReturned?'Devuelto':'Pendiente de recibir'}</b></div>
      <div class="kv"><span>↩️ Depósito a devolver</span><b>${money(depositOutstanding)}</b></div>
      <div class="kv"><span>🛠️ Inversión pagada</span><b>${money(invested)}</b></div>
      <div class="kv"><span>⏳ Inversión pendiente</span><b>${money(toInvest)}</b></div>
      <div class="small muted">La inversión del propietario incluye comisión administrativa y reparaciones. El depósito se muestra aparte porque es dinero en custodia y no ingreso.</div>
    </div>

    <h3>Depósito</h3>
    <div class="card">
      <div class="kv"><span class="muted">Depósito recibido</span><b>${money(s.depositAmount)} · ${s.depositPaid?'Recibido':'Pendiente'}</b></div>
      <div class="kv"><span class="muted">Deducciones justificadas</span><b>${money(deduction)}</b></div>
      <div class="kv"><span class="muted">A devolver al inquilino</span><b>${s.depositReturned?'$0 · Devuelto':money(depositOutstanding)}</b></div>
      ${s.depositDeductionNote?`<div class="small muted">Deducciones: ${esc(s.depositDeductionNote)}</div>`:''}
      ${s.depositReturned?`<div class="small muted">Devuelto ${fmt(s.depositReturnDate)}</div>`:''}
    </div>

    <h3>Rentas</h3>
    <div class="card">
      <div class="kv"><span class="muted">Mensualidad total</span><b>${s.rentAmount?money(s.rentAmount):'Sin configurar'}</b></div>
      <div class="kv"><span class="muted">Cobrado durante este contrato</span><b>${money(rentCollected)}</b></div>
      <div class="kv"><span class="muted">Interés moratorio</span><b>${s.moratoryInterestPercent?esc(s.moratoryInterestPercent)+'% mensual':'Sin configurar'}</b></div>
      <div class="kv"><span class="muted">Periodo de gracia</span><b>${Number(s.rentGraceDays||0)} días naturales</b></div>
      <div class="kv"><span class="muted">Mantto incluido</span><b>${s.maintenanceAmount?money(s.maintenanceAmount):'Sin configurar'}</b></div>
      <div class="kv"><span class="muted">Casa Club incluido</span><b>${s.clubAmount?money(s.clubAmount):'Sin configurar'}</b></div>
    </div>

    <div class="card">
      <div class="kv"><span class="muted">Primer pago</span><b>${s.firstPaymentAmount?money(s.firstPaymentAmount):'Sin configurar'} · ${firstPaymentPaid()?'Pagado':'Pendiente'}</b></div>
      <div class="small muted">Primera renta + depósito. La renta es ingreso; el depósito permanece separado como importe potencialmente reembolsable.</div>
    </div>

    <div class="card">
      <div class="row"><div><b>${s.promissoryCount} pagarés</b><div class="small muted">Mensualidades posteriores a la primera</div></div><span class="badge info">${paidNotes}/${s.promissoryCount} pagados</span></div>
      ${notes.length?notes.map((d,i)=>`<div class="kv"><span>Pagaré ${i+1}/${s.promissoryCount} · ${fmt(d)}</span><b class="${rentStatus(d.slice(0,7))==='paid'?'':'muted'}">${rentStatus(d.slice(0,7))==='paid'?'✓ Pagado':money(s.rentAmount)}</b></div>`).join(''):'<div class="small muted" style="padding-top:12px">Configura la fecha de inicio para generar el calendario.</div>'}
    </div>

    <h3>Inversión del propietario</h3>
    <div class="card">
      <div class="kv"><span class="muted">Comisión del administrador</span><b>${s.adminFeeAmount?money(s.adminFeeAmount):'Sin monto'} · ${s.adminFeePaid?'Pagada':'Pendiente'}</b></div>
      ${s.adminFeeNote?`<div class="small muted">${esc(s.adminFeeNote)}</div>`:''}
      <div class="kv"><span class="muted">Reparaciones pagadas</span><b>${money(repairsPaid)}</b></div>
      <div class="kv"><span class="muted">Reparaciones pendientes</span><b>${money(repairsPending)}</b></div>
      <div class="kv"><span><b>Total invertido</b></span><b>${money(invested)}</b></div>
    </div>

    <div class="card">
      <div class="row"><div><b>Reparaciones</b><div class="small muted">Registra trabajos, materiales y gastos de la propiedad</div></div><button id="radd" class="btn primary compact">＋ Agregar</button></div>
      <div id="repairList" style="margin-top:8px">${repairRows()}</div>
    </div>

    <button id="cedit" class="btn primary full">Editar contrato y depósito</button>
    <button id="cdoc" class="btn secondary full" style="margin-top:8px">Ver documentos</button>`;

  document.getElementById('cedit').onclick=contractModal;
  document.getElementById('cdoc').onclick=()=>{docFilter='contract';navigate('documents')};
  document.getElementById('radd').onclick=()=>repairModal();
  document.querySelectorAll('[data-repair-edit]').forEach(b=>b.onclick=()=>repairModal(b.dataset.repairEdit));
}

function repairModal(id){
  let r=id?state.repairs.find(x=>x.id===id):null;
  modal(r?'Editar reparación':'Agregar reparación',`<form id="rf">
    <div class="field"><label>Concepto</label><input id="rc" class="input" value="${esc(r?.concept||'')}" placeholder="Ej. Pintura recámara" required></div>
    <div class="grid"><div class="field"><label>Monto MXN</label><input id="ra" class="input" type="number" min="0" step="0.01" value="${r?.amount||''}" required></div><div class="field"><label>Fecha</label><input id="rd" class="input" type="date" value="${r?.date||new Date().toISOString().slice(0,10)}" required></div></div>
    <div class="field"><label>Estado</label><select id="rs" class="input"><option value="pending" ${r?.status!=='paid'?'selected':''}>Pendiente</option><option value="paid" ${r?.status==='paid'?'selected':''}>Pagada</option></select></div>
    <div class="field"><label>Nota / proveedor</label><textarea id="rn" class="input" placeholder="Opcional">${esc(r?.note||'')}</textarea></div>
    <button class="btn primary full">Guardar</button>
    ${r?'<button type="button" id="rdel" class="btn danger full" style="margin-top:8px">Eliminar reparación</button>':''}
  </form>`);
  document.getElementById('rf').onsubmit=e=>{e.preventDefault();let item={id:r?.id||crypto.randomUUID(),concept:rc.value.trim(),amount:Number(ra.value||0),date:rd.value,status:rs.value,note:rn.value.trim()};state.repairs=state.repairs.filter(x=>x.id!==item.id);state.repairs.push(item);save();closeModal();contract();toast('Reparación guardada')};
  document.getElementById('rdel')?.addEventListener('click',()=>{if(confirm('¿Eliminar esta reparación?')){state.repairs=state.repairs.filter(x=>x.id!==r.id);save();closeModal();contract();toast('Reparación eliminada')}});
}

function contractModal(){
  let s=state.settings;
  modal('Datos del contrato y depósito',`<form id="cf">
    <div class="field"><label>Inquilino</label><input id="tn" class="input" value="${esc(s.tenantName)}"></div>
    <div class="grid"><div class="field"><label>Email</label><input id="te" class="input" type="email" value="${esc(s.tenantEmail)}"></div><div class="field"><label>Teléfono</label><input id="tp" class="input" value="${esc(s.tenantPhone)}"></div></div>
    <div class="grid"><div class="field"><label>Firma</label><input id="csg" class="input" type="date" value="${s.contractSigned}"></div><div class="field"><label>Primer pago</label><input id="fpd" class="input" type="date" value="${s.firstPaymentDue}"></div></div>
    <div class="grid"><div class="field"><label>Inicio</label><input id="cs" class="input" type="date" value="${s.contractStart}"></div><div class="field"><label>Fin</label><input id="ce" class="input" type="date" value="${s.contractEnd}"></div></div>
    <div class="grid"><div class="field"><label>Interés moratorio % mensual</label><input id="mi" class="input" type="number" min="0" max="100" step="0.01" value="${s.moratoryInterestPercent||''}"></div><div class="field"><label>Número de pagarés</label><input id="pc" class="input" type="number" min="0" max="36" value="${s.promissoryCount}"></div></div>
    <hr style="border:0;border-top:1px solid var(--line);margin:18px 0"><b>Depósito</b>
    <div class="grid" style="margin-top:12px"><div class="field"><label>Depósito MXN</label><input id="da" class="input" type="number" value="${s.depositAmount||''}"></div><div class="field"><label>Fecha recibido</label><input id="dd" class="input" type="date" value="${s.depositDate}"></div></div>
    <label><input id="dp" type="checkbox" ${s.depositPaid?'checked':''}> Depósito recibido</label>
    <div class="grid" style="margin-top:12px"><div class="field"><label>Deducciones al depósito MXN</label><input id="dda" class="input" type="number" min="0" value="${s.depositDeductionAmount||''}"></div><div class="field"><label>Fecha devolución</label><input id="drd" class="input" type="date" value="${s.depositReturnDate||''}"></div></div>
    <div class="field"><label>Motivo de deducciones</label><input id="ddn" class="input" value="${esc(s.depositDeductionNote||'')}" placeholder="Ej. servicio pendiente o daño imputable"></div>
    <label><input id="dr" type="checkbox" ${s.depositReturned?'checked':''}> Depósito ya devuelto</label>
    <hr style="border:0;border-top:1px solid var(--line);margin:18px 0"><b>Comisión administrativa</b>
    <div class="grid" style="margin-top:12px"><div class="field"><label>Cuota admin MXN</label><input id="aa" class="input" type="number" value="${s.adminFeeAmount||''}"></div><div class="field"><label>Fecha pagada</label><input id="ad" class="input" type="date" value="${s.adminFeeDate}"></div></div>
    <div class="field"><label>Nota admin</label><input id="an" class="input" value="${esc(s.adminFeeNote)}"></div>
    <label><input id="ap" type="checkbox" ${s.adminFeePaid?'checked':''}> Comisión pagada</label>
    <button class="btn primary full" style="margin-top:16px">Guardar</button>
  </form>`);
  document.getElementById('cf').onsubmit=e=>{e.preventDefault();Object.assign(s,{tenantName:tn.value,tenantEmail:te.value,tenantPhone:tp.value,contractSigned:csg.value,firstPaymentDue:fpd.value,contractStart:cs.value,contractEnd:ce.value,moratoryInterestPercent:Number(mi.value||0),promissoryCount:Number(pc.value||0),depositAmount:Number(da.value||0),depositDate:dd.value,depositPaid:dp.checked,depositDeductionAmount:Number(dda.value||0),depositDeductionNote:ddn.value,depositReturned:dr.checked,depositReturnDate:drd.value,adminFeeAmount:Number(aa.value||0),adminFeeDate:ad.value,adminFeeNote:an.value,adminFeePaid:ap.checked});s.firstPaymentAmount=Number(s.rentAmount)+Number(s.depositAmount);save();closeModal();contract();toast('Contrato actualizado')};
}

const rentMoreV11=more;
more=function(){rentMoreV11();let e=document.getElementById('more');if(e)e.innerHTML=e.innerHTML.replace('RenT v1.1','RenT v1.2')};
