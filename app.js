/* Simple Note app: localStorage-based notes with pin/star, search, color backgrounds */
(() => {
  const COLORS = [
    '#FFFFFF', // classic white
    '#FFF7D9', // sunny lemon
    '#FFD6E0', // soft pink
    '#FFEED9', // peach
    '#E8FDF5', // mint
    '#E7F0FF', // sky
    '#FDE68A', // light yellow
    '#FBCFE8', // lavender/pink
    '#D8FCF6'  // aqua
  ];
  const qs = s => document.querySelector(s);
  const qsa = s => Array.from(document.querySelectorAll(s));

  const noteTitle = qs('#noteTitle');
  const noteBody = qs('#noteBody');
  const colorPalette = qs('#colorPalette');
  const saveBtn = qs('#saveBtn');
  const cancelEdit = qs('#cancelEdit');
  const notesContainer = qs('#notesContainer');
  const noteTemplate = qs('#noteTemplate');
  const search = qs('#search');
  const clearAllBtn = qs('#clearAll');

  let notes = []; // {id,title,body,color,created,pinned,starred}
  let selectedColor = COLORS[0];
  let editId = null;

  function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6)}

  function saveNotes(){localStorage.setItem('notes_app_v1', JSON.stringify(notes)); buildSidebar();}
  function loadNotes(){
    try{
      const raw = localStorage.getItem('notes_app_v1');
      notes = raw ? JSON.parse(raw) : [];
    }catch(e){notes = []}
  }

  // track current view: {type: 'recent'|'all'|'month', year?, monthIndex?}
  let currentView = {type:'recent'};

  function formatDate(ts){
    try{ return new Date(ts).toLocaleString(); }catch(e){return ''}
  }

  function renderNotes(){
    const q = search.value.trim().toLowerCase();
    // filter by search first
    const filtered = notes.filter(n=>{
      if(!q) return true;
      const hay = (n.title+' '+n.body).toLowerCase();
      return hay.includes(q);
    });

    // group by year -> month
    const groups = {}; // { year: { monthKey: [notes...] } }
    const monthNames = Intl.DateTimeFormat(undefined, {month:'long'});

    filtered.forEach(n=>{
      const dt = new Date(n.created);
      const year = dt.getFullYear();
      const monthIndex = dt.getMonth();
      const monthLabel = monthNames.format(dt); // e.g., 'January'
      groups[year] = groups[year] || {};
      groups[year][monthIndex] = groups[year][monthIndex] || {label: monthLabel, items: []};
      groups[year][monthIndex].items.push(n);
    });

    notesContainer.innerHTML = '';

    // render years in descending order
    Object.keys(groups).map(Number).sort((a,b)=>b-a).forEach(year => {
      const yearDiv = document.createElement('div');
      yearDiv.className = 'year-group';
      const yh = document.createElement('div');
      yh.className = 'year-header';
      yh.textContent = year;
      yearDiv.appendChild(yh);

      // months in descending order (11..0)
      Object.keys(groups[year]).map(Number).sort((a,b)=>b-a).forEach(monthIndex => {
        const month = groups[year][monthIndex];

        // sort notes within month: pinned, starred, newest
        month.items.sort((a,b)=>{
          if(a.pinned && !b.pinned) return -1;
          if(!a.pinned && b.pinned) return 1;
          if(a.starred && !b.starred) return -1;
          if(!a.starred && b.starred) return 1;
          return b.created - a.created;
        });

        const mh = document.createElement('div');
        mh.className = 'month-header';
        mh.textContent = `${month.label} — ${month.items.length}`;
        yearDiv.appendChild(mh);

        const monthGrid = document.createElement('div');
        monthGrid.className = 'month-grid';

        month.items.forEach(n=>{
          const tpl = noteTemplate.content.cloneNode(true);
          const card = tpl.querySelector('.note-card');
          const titleEl = tpl.querySelector('.note-title');
          const bodyEl = tpl.querySelector('.note-body');
          const dateEl = tpl.querySelector('.note-date');
          const pinBtn = tpl.querySelector('.pin');
          const starBtn = tpl.querySelector('.star');
          const editBtn = tpl.querySelector('.edit');
          const delBtn = tpl.querySelector('.delete');

          card.style.background = n.color || '#fff';
          if(n.pinned) card.classList.add('pinned');
          if(n.starred) card.classList.add('starred');

          titleEl.textContent = n.title || '';
          bodyEl.textContent = n.body || '';
          dateEl.textContent = formatDate(n.created);

          pinBtn.addEventListener('click', ()=>{
            pinBtn.classList.add('pulse');
            setTimeout(()=>pinBtn.classList.remove('pulse'),400);
            togglePinned(n.id);
          });
          starBtn.addEventListener('click', ()=>{
            starBtn.classList.add('tada');
            setTimeout(()=>starBtn.classList.remove('tada'),600);
            toggleStar(n.id);
          });
          editBtn.addEventListener('click', ()=>{startEdit(n.id)});
          delBtn.addEventListener('click', ()=>{deleteNote(n.id)});

          monthGrid.appendChild(tpl);
          // animate entry
          const appended = monthGrid.lastElementChild;
          if(appended){
            appended.classList.add('enter');
            appended.addEventListener('animationend', ()=>{ appended.classList.remove('enter'); }, {once:true});
          }
        });

        yearDiv.appendChild(monthGrid);
      });

      notesContainer.appendChild(yearDiv);
    });
  }

  // Render a flat grid of provided notes (applies search filter)
  function renderGrid(list){
    const q = search.value.trim().toLowerCase();
    const filtered = list.filter(n=>{
      if(!q) return true;
      const hay = (n.title+' '+n.body).toLowerCase();
      return hay.includes(q);
    });

    notesContainer.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'grid';
    filtered.forEach(n=>{
      const tpl = noteTemplate.content.cloneNode(true);
      const card = tpl.querySelector('.note-card');
      const titleEl = tpl.querySelector('.note-title');
      const bodyEl = tpl.querySelector('.note-body');
      const dateEl = tpl.querySelector('.note-date');
      const pinBtn = tpl.querySelector('.pin');
      const starBtn = tpl.querySelector('.star');
      const editBtn = tpl.querySelector('.edit');
      const delBtn = tpl.querySelector('.delete');

      card.style.background = n.color || '#fff';
      if(n.pinned) card.classList.add('pinned');
      if(n.starred) card.classList.add('starred');

      titleEl.textContent = n.title || '';
      bodyEl.textContent = n.body || '';
      dateEl.textContent = formatDate(n.created);

      pinBtn.addEventListener('click', ()=>{ pinBtn.classList.add('pulse'); setTimeout(()=>pinBtn.classList.remove('pulse'),400); togglePinned(n.id); });
      starBtn.addEventListener('click', ()=>{ starBtn.classList.add('tada'); setTimeout(()=>starBtn.classList.remove('tada'),600); toggleStar(n.id); });
      editBtn.addEventListener('click', ()=>{startEdit(n.id)});
      delBtn.addEventListener('click', ()=>{deleteNote(n.id)});

      grid.appendChild(tpl);
      const appended = grid.lastElementChild;
      if(appended){ appended.classList.add('enter'); appended.addEventListener('animationend', ()=>{ appended.classList.remove('enter'); }, {once:true}); }
    });

    notesContainer.appendChild(grid);
  }

  function renderRecent(){
    currentView = {type:'recent'};
    // recent across all notes, newest first
    const q = search.value.trim().toLowerCase();
    const filtered = notes.filter(n=>{
      if(!q) return true;
      const hay = (n.title+' '+n.body).toLowerCase();
      return hay.includes(q);
    });
    const sorted = filtered.slice().sort((a,b)=>b.created - a.created).slice(0, 12);
    renderGrid(sorted);
  }

  function renderMonth(year, monthIndex){
    currentView = {type:'month', year, monthIndex};
    const list = notes.filter(n=>{
      const dt = new Date(n.created);
      return dt.getFullYear()===year && dt.getMonth()===monthIndex;
    }).sort((a,b)=>{
      if(a.pinned && !b.pinned) return -1;
      if(!a.pinned && b.pinned) return 1;
      if(a.starred && !b.starred) return -1;
      if(!a.starred && b.starred) return 1;
      return b.created - a.created;
    });
    renderGrid(list);
  }

  // Build the sidebar folders (year -> months)
  function buildSidebar(){
    const folders = qs('#folders');
    if(!folders) return;
    folders.innerHTML = '';
    // create a single previous notes section to contain all years/months
    const prevSection = document.createElement('div');
    prevSection.className = 'previous-section';
    const prevHeader = document.createElement('button');
    prevHeader.className = 'previous-header';
    prevHeader.type = 'button';
    prevHeader.innerHTML = '<span>Previous Notes</span><span class="arrow">▸</span>';
    prevSection.appendChild(prevHeader);
    folders.appendChild(prevSection);
    const monthNames = Intl.DateTimeFormat(undefined, {month:'long'});
    const groups = {};
    notes.forEach(n=>{
      const dt = new Date(n.created);
      const year = dt.getFullYear();
      const month = dt.getMonth();
      const label = monthNames.format(dt);
      groups[year] = groups[year] || {};
      groups[year][month] = groups[year][month] || {label, count:0};
      groups[year][month].count++;
    });

    Object.keys(groups).map(Number).sort((a,b)=>b-a).forEach(year=>{
      const ydiv = document.createElement('div'); ydiv.className='year-item';
      const ylab = document.createElement('div'); ylab.className='year-label';
      // year label with toggle
      const yText = document.createElement('span'); yText.textContent = year;
      const yToggle = document.createElement('button'); yToggle.className='year-toggle'; yToggle.textContent = '▾';
      ylab.appendChild(yText); ylab.appendChild(yToggle);
      ydiv.appendChild(ylab);
      const monthsWrap = document.createElement('div'); monthsWrap.className='months-list';
      Object.keys(groups[year]).map(Number).sort((a,b)=>b-a).forEach(monthIndex=>{
        const mi = groups[year][monthIndex];
        const mbtn = document.createElement('div'); mbtn.className='month-block';
        const mHeader = document.createElement('button'); mHeader.className='month-item';
        mHeader.innerHTML = `${mi.label} <span class="count">${mi.count}</span>`;
        mHeader.addEventListener('click', ()=>{
          qsa('.nav-btn').forEach(b=>b.classList.remove('active'));
          qsa('.month-item').forEach(b=>b.classList.remove('active'));
          mHeader.classList.add('active');
          renderMonth(year, monthIndex);
        });

        // add a small list of recent notes under this month
        const notesList = document.createElement('div'); notesList.className = 'month-notes';
        // get notes for this month, sorted newest first
        const notesForMonth = notes.filter(n=>{
          const dt = new Date(n.created); return dt.getFullYear()===year && dt.getMonth()===monthIndex;
        }).sort((a,b)=>b.created - a.created).slice(0,5);
        notesForMonth.forEach(n=>{
          const nl = document.createElement('button'); nl.className='note-link'; nl.textContent = (n.title||n.body||'Untitled').slice(0,40);
          nl.title = n.title || n.body || 'Untitled';
          nl.addEventListener('click', ()=>{ startEdit(n.id); window.scrollTo({top:0,behavior:'smooth'}); });
          notesList.appendChild(nl);
        });

        // append month header and its recent notes
        mbtn.appendChild(mHeader);
        mbtn.appendChild(notesList);
        monthsWrap.appendChild(mbtn);
      });
      ydiv.appendChild(monthsWrap);
      // append year block into the previous section instead of top-level folders
      prevSection.appendChild(ydiv);
    });

    // collapsed by default — toggle to reveal years
    prevSection.classList.remove('expanded');
    const arrowEl = prevHeader.querySelector('.arrow');
    prevHeader.addEventListener('click', ()=>{
      const isExpanded = prevSection.classList.toggle('expanded');
      if(arrowEl) arrowEl.textContent = isExpanded ? '▾' : '▸';
      // if expanded, focus first year item
      if(isExpanded){
        const firstYear = prevSection.querySelector('.year-item');
        if(firstYear) firstYear.scrollIntoView({behavior:'smooth', block:'start'});
      }
    });

    // wire year toggle behavior (collapse/expand months)
    qsa('.year-toggle').forEach(btn=>{
      btn.addEventListener('click', (e)=>{
        const ydiv = btn.closest('.year-item');
        if(!ydiv) return;
        ydiv.classList.toggle('collapsed');
        const months = ydiv.querySelector('.months-list');
        if(months) months.style.display = months.style.display==='none' ? 'flex' : 'none';
        btn.textContent = months && months.style.display==='none' ? '▸' : '▾';
      });
      // initialize expanded
      const ydiv = btn.closest('.year-item'); if(ydiv) { const months = ydiv.querySelector('.months-list'); if(months) months.style.display='flex'; }
    });
  }

  function togglePinned(id){
    const it = notes.find(n=>n.id===id); if(!it) return; it.pinned = !it.pinned; saveNotes(); renderNotes();
  }
  function toggleStar(id){
    const it = notes.find(n=>n.id===id); if(!it) return; it.starred = !it.starred; saveNotes(); renderNotes();
  }
  function deleteNote(id){
    if(!confirm('Delete this note?')) return;
    notes = notes.filter(n=>n.id!==id); saveNotes(); renderNotes();
  }

  function startEdit(id){
    const it = notes.find(n=>n.id===id); if(!it) return;
    editId = it.id;
    noteTitle.value = it.title || '';
    noteBody.value = it.body || '';
    selectedColor = it.color || COLORS[0];
    updateColorSelection();
    saveBtn.textContent = 'Update Note';
    cancelEdit.classList.remove('hidden');
    noteBody.focus();
  }

  function cancelEditFn(){
    editId = null; noteTitle.value=''; noteBody.value=''; selectedColor = COLORS[0]; updateColorSelection(); saveBtn.textContent='Add Note'; cancelEdit.classList.add('hidden');
  }

  function addOrUpdateNote(){
    const title = noteTitle.value.trim();
    const body = noteBody.value.trim();
    if(!title && !body){ alert('Please enter a note.'); return; }
    if(editId){
      const it = notes.find(n=>n.id===editId); if(!it) return;
      it.title = title; it.body = body; it.color = selectedColor; it.updated = Date.now();
    }else{
      const n = {id:uid(),title,body,color:selectedColor,created:Date.now(),pinned:false,starred:false};
      notes.push(n);
    }
    saveNotes(); cancelEditFn(); renderNotes();
  }

  function deleteAll(){
    if(!confirm('Delete ALL notes? This cannot be undone.')) return;
    notes = []; saveNotes(); renderNotes();
  }

  function updateColorSelection(){
    qsa('.color-swatch').forEach(el=>{
      el.classList.toggle('selected', el.dataset.color === selectedColor);
    });
  }

  function setupPalette(){
    COLORS.forEach(c=>{
      const b = document.createElement('button');
      b.className='color-swatch'; b.dataset.color=c; b.style.background=c;
      b.title = c;
      b.addEventListener('click', ()=>{ selectedColor = c; updateColorSelection(); });
      colorPalette.appendChild(b);
    });
    updateColorSelection();
  }

  function init(){
    setupPalette();
    loadNotes();
    buildSidebar();
    // default to recent view
    renderRecent();

    saveBtn.addEventListener('click', addOrUpdateNote);
    cancelEdit.addEventListener('click', cancelEditFn);
    search.addEventListener('input', ()=>{
      // re-render based on current view
      if(currentView.type==='recent') renderRecent();
      else if(currentView.type==='all') renderNotes();
      else if(currentView.type==='month') renderMonth(currentView.year, currentView.monthIndex);
    });
    clearAllBtn.addEventListener('click', deleteAll);

    // nav buttons
    const navRecent = qs('#navRecent');
    const navAll = qs('#navAll');
    const newNoteBtn = qs('#newNote');
    if(navRecent) navRecent.addEventListener('click', ()=>{ qsa('.nav-btn').forEach(b=>b.classList.remove('active')); navRecent.classList.add('active'); renderRecent(); });
    if(navAll) navAll.addEventListener('click', ()=>{ qsa('.nav-btn').forEach(b=>b.classList.remove('active')); navAll.classList.add('active'); renderNotes(); currentView.type='all'; });
    if(newNoteBtn) newNoteBtn.addEventListener('click', ()=>{ noteTitle.focus(); });

    // sidebar toggle (small screens or user preference)
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'toggleSidebar';
    toggleBtn.className = 'toggle-sidebar';
    toggleBtn.title = 'Toggle sidebar';
    toggleBtn.innerHTML = '☰';
    const header = document.querySelector('.app-header');
    if(header) header.appendChild(toggleBtn);
    const sidebar = qs('.sidebar');
    toggleBtn.addEventListener('click', ()=>{
      if(!sidebar) return;
      sidebar.classList.toggle('collapsed');
      // adjust container margin
      const container = document.querySelector('.container');
      if(sidebar.classList.contains('collapsed')){
        if(container) container.style.marginLeft = '100px';
        if(header) header.style.marginLeft = '100px';
      } else {
        if(container) container.style.marginLeft = '280px';
        if(header) header.style.marginLeft = '280px';
      }
    });

    // ensure header margin matches sidebar initially
    if(header && sidebar && !sidebar.classList.contains('collapsed')) header.style.marginLeft = '280px';

    // keyboard shortcut: Ctrl+Enter to save
    noteBody.addEventListener('keydown', (e)=>{
      if((e.ctrlKey||e.metaKey) && e.key === 'Enter'){
        addOrUpdateNote();
      }
    });

    // initial select first color
    const first = colorPalette.querySelector('.color-swatch');
    if(first) { first.classList.add('selected'); selectedColor = first.dataset.color || COLORS[0]; }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
