// GANTI URL DEPLOY BARU KAMU DI SINI
const API_URL = 'https://script.google.com/macros/s/AKfycbw4vA2lTRDGbD11PsU9gl2H8Dy07ZrAo2ynbSqunrB4Uxpg-GHF6614WbpzT8PieWgppA/exec'; 

const user = JSON.parse(localStorage.getItem('user_alumni'));
const pageId = $('body').attr('id');

// Variabel Global untuk menyimpan data sementara
let globalBerita = []; 
let globalEvents = []; // TAMBAHAN BARU: Untuk menyimpan data event

$(document).ready(function() {
    renderNavbar();
    if (pageId === 'page-home') setupDashboard();
    if (pageId === 'page-organisasi') setupOrganisasi();
    if (pageId === 'page-alumni') setupDirektori();
    if (pageId === 'page-loker') { if(!user) window.location.href='login.html'; else setupLoker(); }
    if (pageId === 'page-forum') { if(!user) window.location.href='login.html'; else setupForum(); }
    if (pageId === 'page-profil') setupProfil();
    setupAuthForms();
});

// ================= FUNGSI UTAMA =================

function renderNavbar() {
    let html = `
        <li class="nav-item"><a class="nav-link" href="index.html">Dashboard</a></li>
        <li class="nav-item"><a class="nav-link" href="organisasi.html">Organisasi</a></li>
        <li class="nav-item"><a class="nav-link" href="alumni.html">Direktori</a></li>
    `;

    if (user) {
        html += `
            <li class="nav-item"><a class="nav-link" href="loker.html">Bursa Kerja</a></li>
            <li class="nav-item"><a class="nav-link" href="forum.html">Forum</a></li>
            <li class="nav-item dropdown ms-lg-3">
                <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" role="button" data-bs-toggle="dropdown">
                    <img src="${user.foto}" class="rounded-circle border border-2 border-white" width="35" height="35" style="object-fit:cover;">
                </a>
                <ul class="dropdown-menu dropdown-menu-end shadow mt-2">
                    <li class="dropdown-header text-primary fw-bold">${user.nama}</li>
                    <li><a class="dropdown-item" href="profil.html"><i class="fas fa-user-edit me-2"></i> Edit Profil</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item text-danger" href="#" onclick="logout()"><i class="fas fa-sign-out-alt me-2"></i> Logout</a></li>
                </ul>
            </li>
        `;
    } else {
        html += `
            <li class="nav-item ms-lg-3">
                <a class="btn btn-warning rounded-pill px-4 fw-bold shadow-sm" href="login.html">
                    <i class="fas fa-sign-in-alt me-1"></i> Masuk
                </a>
            </li>
        `;
    }
    $('#dynamic-nav').html(html);
}

function setupDashboard() {
    if(user) {
        $('#welcome-name').text(user.nama.split(' ')[0]);
        $('#banner-btn-container').html(`<a href="alumni.html" class="btn btn-primary rounded-pill px-4">Cari Teman</a>`);
    } else {
        $('#welcome-name').text("Keluarga SI");
        $('#banner-btn-container').html(`<a href="login.html" class="btn btn-primary rounded-pill px-4">Gabung Sekarang</a>`);
    }

    // === LOAD EVENTS (DIPERBAIKI: ADA TOMBOL LIHAT) ===
    $.getJSON(API_URL + '?action=get_events', function(res) {
        let html = (!res.data || res.data.length === 0) ? '<li class="list-group-item text-center small text-muted">Belum ada agenda.</li>' : '';
        globalEvents = res.data || []; // Simpan ke global
        
        if(res.data) {
            res.data.slice(0, 3).forEach((evt, index) => {
                // evt format: [id, judul, tanggal, lokasi, deskripsi]
                html += `
                <li class="list-group-item p-3">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h6 class="mb-1 fw-bold text-dark">${evt[1]}</h6>
                            <small class="text-muted"><i class="fas fa-map-marker-alt text-danger"></i> ${evt[3]}</small>
                        </div>
                        <div class="text-end">
                            <small class="text-danger fw-bold d-block">${new Date(evt[2]).toLocaleDateString('id-ID', {day:'numeric', month:'short'})}</small>
                            <small class="text-muted">${new Date(evt[2]).getFullYear()}</small>
                        </div>
                    </div>
                    <button onclick="bukaEvent(${index})" class="btn btn-sm btn-light text-primary w-100 mt-2 fw-bold" style="font-size:0.8rem;">
                        Info Selengkapnya <i class="fas fa-arrow-right ms-1"></i>
                    </button>
                </li>`;
            });
        }
        $('#home-events-container').html(html);
    });

    // Load Berita
    $.getJSON(API_URL + '?action=get_berita', function(res) {
        let html = '';
        if(!res.data || res.data.length === 0) html = '<div class="col-12 text-center text-muted">Belum ada berita.</div>';
        else {
            globalBerita = res.data; 
            res.data.slice(0, 3).forEach((news, index) => {
                let imgUrl = news[5] || 'https://via.placeholder.com/400x200?text=Berita+SI';
                html += `
                <div class="col-md-4">
                    <div class="card h-100 shadow-sm border-0">
                        <img src="${imgUrl}" class="card-img-top" alt="..." style="height:200px; object-fit:cover;">
                        <div class="card-body d-flex flex-column">
                            <div class="d-flex justify-content-between mb-2">
                                <span class="badge bg-primary">${news[3]}</span>
                                <small class="text-muted">${new Date(news[1]).toLocaleDateString()}</small>
                            </div>
                            <h5 class="card-title fw-bold text-truncate">${news[2]}</h5>
                            <p class="card-text small text-muted text-truncate">${news[4]}</p>
                            <div class="mt-auto">
                                <button onclick="bukaBerita(${index})" class="btn btn-sm btn-outline-primary mt-2 w-100">Lihat Selengkapnya</button>
                            </div>
                        </div>
                    </div>
                </div>`;
            });
        }
        $('#home-berita-container').html(html);
    });

    // Load Loker Summary
    $.getJSON(API_URL + '?action=get_loker', function(res) {
        let html = '';
        if(!res.data || res.data.length === 0) html = '<p class="text-muted text-center">Belum ada loker.</p>';
        else {
            res.data.slice(0, 3).forEach(job => {
                if(user) {
                    html += `<div class="card mb-3 border-0 shadow-sm"><div class="card-body"><h6 class="fw-bold text-primary mb-1">${job[2]}</h6><small>${job[3]}</small><br><span class="badge bg-light text-dark border mt-1">${job[4]}</span><a href="loker.html" class="stretched-link"></a></div></div>`;
                } else {
                    html += `<div class="card mb-3 border-0 shadow-sm position-relative"><div class="card-body blur-content"><h6>Senior Dev</h6><small>PT. X</small></div><div class="locked-overlay"><small class="fw-bold text-dark"><i class="fas fa-lock"></i> Login</small></div></div>`;
                }
            });
        }
        $('#home-loker-summary').html(html);
    });
}

function setupOrganisasi() {
    $.getJSON(API_URL + '?action=get_struktur', function(res) {
        let html=''; if(res.data) res.data.forEach(i=>{
            let adminControls = (user && user.role === 'admin') ? 
                `<div class="mt-2"><button onclick="editStruktur('${i[0]}','${i[1]}','${i[2]}','${i[4]}','${i[3]}','${i[5]||''}')" class="btn btn-sm btn-warning text-white me-1"><i class="fas fa-edit"></i></button><button onclick="hapusData('delete_struktur','${i[0]}')" class="btn btn-sm btn-danger"><i class="fas fa-trash"></i></button></div>` : '';
            html+=`<div class="col-6 col-md-3 text-center mb-4"><img src="${i[3] || 'https://via.placeholder.com/150'}" class="rounded-circle mb-2 shadow-sm" width="80" height="80" style="object-fit:cover;"><h6 class="fw-bold mb-0">${i[1]}</h6><span class="badge bg-primary mb-1">${i[2]}</span>${adminControls}</div>`;
        }); $('#struktur-container').html(html);
    });
    $.getJSON(API_URL + '?action=get_proker', function(res) {
        let html=''; if(res.data) res.data.forEach(i=>{ html+=`<tr><td>${i[1]}</td><td>${i[2]}</td><td><span class="badge bg-success">${i[3]}</span></td></tr>` }); $('#proker-container').html(html);
    });
    if(user && user.role === 'admin') {
        $('#admin-area').show();
        $('#form-struktur').submit(function(e){ e.preventDefault(); let id=$('#struktur-id').val(); handlePost(this, id?'update_struktur':'post_struktur'); });
        $('#form-event').submit(function(e){ e.preventDefault(); handlePost(this, 'post_event'); });
        $('#form-proker').submit(function(e){ e.preventDefault(); handlePost(this, 'post_proker'); });
        $('#form-berita').submit(function(e){ e.preventDefault(); handlePost(this, 'post_berita'); });
    }
}

// Fungsi Edit/Reset Struktur
function editStruktur(id, nama, jabatan, urutan, foto, email) {
    document.getElementById('admin-area').scrollIntoView({ behavior: 'smooth' });
    var triggerEl = document.querySelector('#adminTab button[data-bs-target="#tab-struktur"]');
    var tab = new bootstrap.Tab(triggerEl); tab.show();
    $('#struktur-id').val(id); $('#str-nama').val(nama); $('#str-jabatan').val(jabatan); $('#str-urutan').val(urutan); $('#str-foto').val(foto); $('#str-email').val(email);
    $('#btn-save-struktur').text('Update Pengurus').removeClass('btn-success').addClass('btn-warning'); $('#btn-cancel-struktur').show();
}
function resetFormStruktur() { $('#form-struktur')[0].reset(); $('#struktur-id').val(''); $('#btn-save-struktur').text('Simpan Pengurus').removeClass('btn-warning').addClass('btn-success'); $('#btn-cancel-struktur').hide(); }

// ... FUNGSI LAINNYA (Sama, pastikan ada) ...
function setupDirektori() {
    $.getJSON(API_URL + '?action=get_alumni', function(res) {
        let html = ''; res.data.forEach(alumni => {
            if(user) {
                let skills = alumni.skill ? alumni.skill.split(',').map(s=>`<span class="badge bg-light text-dark border me-1">${s}</span>`).join('') : '';
                let linkedinBtn = (alumni.linkedin && alumni.linkedin !== '#' && alumni.linkedin !== '-') ? `<a href="${alumni.linkedin}" target="_blank" class="btn btn-sm btn-outline-primary w-100 mt-2"><i class="fab fa-linkedin"></i> Connect</a>` : '';
                html += `<div class="col-md-4 mb-4 item-alumni animate-up"><div class="card p-3 h-100 text-center border-0 shadow-sm"><img src="${alumni.foto}" class="rounded-circle mx-auto mb-3" width="70" height="70" style="object-fit:cover"><h5 class="fw-bold mb-0">${alumni.nama}</h5><small class="text-primary fw-bold mb-2 d-block">${alumni.pekerjaan || 'Alumni'}</small><span class="badge bg-info text-dark mb-3">Angkatan ${alumni.tahun}</span><div class="mb-2">${skills}</div><div class="mt-auto">${linkedinBtn}</div></div></div>`;
            } else {
                html += `<div class="col-md-4 mb-4 item-alumni"><div class="card p-3 h-100 text-center bg-light border-0"><div class="rounded-circle bg-secondary mx-auto mb-3" style="width:70px; height:70px; opacity:0.2"></div><h5 class="fw-bold mb-0 text-muted">Alumni ${alumni.tahun}</h5><small class="text-muted d-block mb-3">Nama Disembunyikan</small><a href="login.html" class="btn btn-sm btn-outline-secondary rounded-pill">Login untuk Kontak</a></div></div>`;
            }
        }); $('#alumni-list').html(html);
    });
}
function setupLoker() {
    $.getJSON(API_URL + '?action=get_loker', function(res) {
        let html=''; if(res.data) res.data.forEach(job=>{
            let linkUrl = (job[6] && job[6] !== '-' && job[6] !== '#') ? job[6] : null;
            let btnLink = linkUrl ? `<a href="${linkUrl}" target="_blank" class="btn btn-sm btn-outline-primary w-100">Lamar</a>` : `<button class="btn btn-sm btn-secondary w-100" disabled>Info via DM</button>`;
            html+=`<div class="col-md-6 mb-3"><div class="card h-100 shadow-sm border-0"><div class="card-body d-flex flex-column"><span class="badge bg-success mb-2 w-auto align-self-start">${job[4]}</span><h5 class="card-title fw-bold">${job[2]}</h5><h6 class="card-subtitle mb-2 text-muted"><i class="far fa-building"></i> ${job[3]}</h6><p class="card-text small mt-3" style="white-space: pre-line;">${job[5]}</p><div class="mt-auto pt-3">${btnLink}</div></div><div class="card-footer bg-white text-muted small">Diposting: ${new Date(job[1]).toLocaleDateString()}</div></div></div>`;
        }); $('#loker-container').html(html);
    });
    $('#form-loker').submit(function(e){ e.preventDefault(); handlePost(this, 'post_loker'); });
}
function setupForum() { loadForum(); $('#form-thread').submit(function(e){ e.preventDefault(); handlePost(this, 'post_thread'); }); $('#form-comment').submit(function(e) { e.preventDefault(); $.post(API_URL, $(this).serialize() + "&action=post_comment&email=" + user.email, function(){ $('#form-comment')[0].reset(); loadComments($('#current-thread-id').val()); }); }); }
function setupProfil() { if(!user){window.location.href='login.html';return;} $('input[name="nama"]').val(user.nama); $('input[name="email"]').val(user.email); $('input[name="nim"]').val(user.nim); $('input[name="tahun"]').val(user.tahun); $('input[name="pekerjaan"]').val(user.pekerjaan); $('input[name="linkedin"]').val(user.linkedin); $('input[name="foto"]').val(user.foto); $('input[name="skill"]').val(user.skill); $('#form-profil').submit(function(e){ e.preventDefault(); handlePost(this, 'update_profile'); }); }
function setupAuthForms() { $('#form-login').submit(function(e) { e.preventDefault(); handleAuth(this, 'login'); }); $('#form-register').submit(function(e) { e.preventDefault(); handleAuth(this, 'register'); }); }
function handlePost(form, action) { if(!confirm("Proses data?")) return; const btn = $(form).find('button'); btn.prop('disabled', true).text('Processing...'); let data = $(form).serialize() + "&action=" + action + (user ? "&email=" + user.email : ""); $.post(API_URL, data, function(res) { alert(res.message); location.reload(); }); }
function handleAuth(form, action) { const btn = $(form).find('button'); btn.prop('disabled', true); $.post(API_URL, $(form).serialize() + "&action=" + action, function(res) { if(res.status==='success') { if(action==='login') localStorage.setItem('user_alumni', JSON.stringify(res.user)); alert(res.message); window.location.href = (action==='login') ? 'index.html' : 'login.html'; } else { alert(res.message); btn.prop('disabled', false); } }); }
function logout() { localStorage.removeItem('user_alumni'); window.location.href = 'index.html'; }
function hapusData(action, id) { if(confirm("Hapus?")) $.post(API_URL, {action:action, id:id}, function(){ location.reload() }); }
function loadForum() { $('#forum-container').html('...'); $.getJSON(API_URL+'?action=get_forum', function(r){ let h=''; if(r.data) r.data.forEach(i=>{h+=`<div class="card mb-2 border-0 shadow-sm"><div class="card-body"><h5>${i[4]}</h5><p class="text-truncate">${i[5]}</p><button onclick="bukaDetail('${i[0]}','${i[4]}','${i[2]}','${i[5].replace(/\n/g,' ')}')" class="btn btn-sm btn-outline-primary">Lihat</button></div></div>`}); $('#forum-container').html(h); }); }
function bukaDetail(id,t,a,c) { $('#detail-judul').text(t); $('#detail-isi').text(c); $('#current-thread-id').val(id); new bootstrap.Modal('#modalDetail').show(); loadComments(id); }
function loadComments(id) { $.getJSON(API_URL+'?action=get_comments&id_thread='+id, function(r){ let h=''; if(r.data) r.data.forEach(c=>{h+=`<div class="alert alert-light p-2 mb-1"><small class="fw-bold">${c[3]}</small><p class="mb-0">${c[4]}</p></div>`}); $('#comments-list').html(h); }); }
function bukaBerita(index) { let data = globalBerita[index]; if(data) { $('#berita-judul').text(data[2]); $('#berita-isi').html(data[4].replace(/\n/g,'<br>')); let imgUrl = data[5] || 'https://via.placeholder.com/400x200?text=Berita+SI'; $('#berita-gambar').attr('src', imgUrl); new bootstrap.Modal('#modalBerita').show(); } }

// === FUNGSI BUKA EVENT (BARU) ===
function bukaEvent(index) {
    let data = globalEvents[index];
    if(data) {
        // data: [0:id, 1:judul, 2:tanggal, 3:lokasi, 4:deskripsi]
        $('#event-judul').text(data[1]);
        // Format tanggal agar cantik
        let tgl = new Date(data[2]).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        $('#event-tanggal').text(tgl);
        $('#event-lokasi').text(data[3]);
        // Ganti baris baru dengan <br> agar rapi
        $('#event-deskripsi').html(data[4] ? data[4].replace(/\n/g,'<br>') : '-');
        
        new bootstrap.Modal('#modalEvent').show();
    }
}