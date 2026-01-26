// GANTI URL API ANDA DI SINI
const API_URL = "https://script.google.com/macros/s/AKfycbzau0vNShmuqlZSjC0Bq51YU5Ec2d8aC6TKIP-yaSx_3QoWVxNKVitLnr4zqczakBJvlA/exec";

const user = JSON.parse(localStorage.getItem("user_alumni"));
const pageId = $("body").attr("id");
let globalBerita = [];
let globalEvents = [];
let globalProker = [];
let allLokerData = [];

// KATEGORI LOKER
const KATEGORI_LOKER = [
    { name: "Teknologi dan pengembangan sistem", icon: "fa-laptop-code", color: "primary" },
    { name: "Data dan analis", icon: "fa-chart-line", color: "success" },
    { name: "Database dan infrastruktur", icon: "fa-server", color: "info" },
    { name: "Keamanan informasi", icon: "fa-user-shield", color: "danger" },
    { name: "Bisnis dan manajemen TI", icon: "fa-briefcase", color: "warning" },
    { name: "Bidang audit", icon: "fa-clipboard-check", color: "secondary" },
    { name: "E bisnis", icon: "fa-shopping-cart", color: "primary" },
    { name: "Edukasi dan riset", icon: "fa-graduation-cap", color: "success" },
    { name: "Lainnya", icon: "fa-th-large", color: "dark" }
];

$(document).ready(function () {
  renderNavbar();
  
  if (pageId === "page-home") setupDashboard();
  if (pageId === "page-organisasi") setupOrganisasi();
  if (pageId === "page-proker") setupProkerPage();
  if (pageId === "page-event") setupEventPage();
  if (pageId === "page-alumni") setupDirektori();
  if (pageId === "page-loker") setupLoker();
  if (pageId === "page-forum") {
    if (!user) window.location.href = "login.html";
    else setupForum();
  }
  if (pageId === "page-profil") setupProfil();
  
  setupAuthForms();

  // Event Delegates untuk tombol View
  $(document).on("click", ".btn-view-event", function () { bukaEvent($(this).data("index")); });
  $(document).on("click", ".btn-view-berita", function () { bukaBerita($(this).data("index")); });
});

function renderNavbar() {
  let isActive = (id) => (pageId === id ? "active fw-bold" : "");
  let html = `
    <li class="nav-item"><a class="nav-link ${isActive("page-home")}" href="index.html">Dashboard</a></li>
    <li class="nav-item"><a class="nav-link ${isActive("page-organisasi")}" href="organisasi.html">Organisasi</a></li>
    <li class="nav-item"><a class="nav-link ${isActive("page-proker")}" href="proker.html">Program Kerja</a></li>
    <li class="nav-item"><a class="nav-link ${isActive("page-event")}" href="event.html">Agenda</a></li>
    <li class="nav-item"><a class="nav-link ${isActive("page-alumni")}" href="alumni.html">Direktori</a></li>
    <li class="nav-item"><a class="nav-link ${isActive("page-loker")}" href="loker.html">Bursa Kerja</a></li>`;
  
  if (user) {
    html += `<li class="nav-item"><a class="nav-link ${isActive("page-forum")}" href="forum.html">Forum</a></li>
             <li class="nav-item dropdown ms-lg-3">
                <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" data-bs-toggle="dropdown">
                    <img src="${user.foto}" class="rounded-circle border border-2 border-white" width="35" height="35" style="object-fit:cover;">
                </a>
                <ul class="dropdown-menu dropdown-menu-end shadow mt-2">
                    <li class="dropdown-header text-primary fw-bold">${user.nama}</li>
                    <li><a class="dropdown-item" href="profil.html"><i class="fas fa-user-edit me-2"></i> Edit Profil</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item text-danger" href="#" onclick="logout()"><i class="fas fa-sign-out-alt me-2"></i> Logout</a></li>
                </ul>
             </li>`;
  } else {
    html += `<li class="nav-item ms-lg-3"><a class="btn btn-warning rounded-pill px-4 fw-bold shadow-sm" href="login.html"><i class="fas fa-sign-in-alt me-1"></i> Masuk</a></li>`;
  }
  $("#dynamic-nav").html(html);
}

// =======================
// DASHBOARD (BERITA & EVENT ADMIN)
// =======================
function setupDashboard() {
  if (user) { $("#welcome-name").text(user.nama.split(" ")[0]); $("#banner-btn-container").html(`<a href="alumni.html" class="btn btn-light text-primary fw-bold rounded-pill px-4 shadow me-2">Cari Teman</a>`); } else { $("#welcome-name").text("Keluarga SI"); $("#banner-btn-container").html(`<a href="login.html" class="btn btn-warning fw-bold rounded-pill px-4 shadow me-2">Gabung Sekarang</a>`); }
  $.getJSON(API_URL + "?action=get_settings", function (res) { if (res.status === "success" && res.data && res.data.banner_images && res.data.banner_images.length > 0) { let banners = res.data.banner_images; let index = 0; $("#main-banner").css("background-image", `url('${banners[0]}')`); if (banners.length > 1) { setInterval(() => { index = (index + 1) % banners.length; $("#main-banner").css("background-image", `url('${banners[index]}')`); }, 5000); } } });
  
  // EVENT DASHBOARD (Edit Button for Admin)
  $.getJSON(API_URL + "?action=get_events", function (res) { 
      globalEvents = res.data || []; 
      let html = !res.data || res.data.length === 0 ? '<li class="list-group-item text-center small text-muted py-4">Belum ada agenda.</li>' : ""; 
      if (res.data) res.data.slice(0, 3).forEach((evt, i) => { 
          let adminBtn = "";
          // LOGIC BARU: Tombol Edit memanggil goToEditEvent
          if(user && user.role === 'admin') {
             adminBtn = `<button onclick="goToEditEvent(${i})" class="btn btn-sm btn-link text-warning p-0 ms-2" title="Edit Agenda"><i class="fas fa-edit"></i></button>`;
          }
          html += `<li class="list-group-item p-3"><div class="d-flex justify-content-between align-items-start"><div><h6 class="mb-1 fw-bold text-dark">${evt[1]} ${adminBtn}</h6><small class="text-muted"><i class="fas fa-map-marker-alt text-danger"></i> ${evt[3]}</small></div><div class="text-end"><small class="text-danger fw-bold d-block">${new Date(evt[2]).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</small><small class="text-muted" style="font-size:0.7rem">${new Date(evt[2]).getFullYear()}</small></div></div><button class="btn btn-sm btn-light text-primary w-100 mt-3 fw-bold btn-view-event" data-index="${i}" style="font-size:0.85rem; background-color: #f8f9fa;">Info Selengkapnya <i class="fas fa-arrow-right ms-1"></i></button></li>`; 
      }); 
      $("#home-events-container").html(html); 
  });

  // BERITA DASHBOARD
  $.getJSON(API_URL + "?action=get_berita", function (res) { 
      globalBerita = res.data || []; 
      let html = !globalBerita.length ? '<div class="col-12 text-center text-muted">Belum ada berita.</div>' : ""; 
      if (globalBerita.length) globalBerita.slice(0, 3).forEach((news, index) => { 
          let imgUrl = news[5] || "https://via.placeholder.com/400x200?text=Berita+SI"; 
          let adminBtn = "";
          if(user && user.role === 'admin') {
             adminBtn = `<button onclick="hapusData('delete_berita','${news[0]}')" class="btn btn-sm btn-danger position-absolute top-0 end-0 m-2 shadow"><i class="fas fa-trash"></i></button>`;
          }
          html += `<div class="col-md-4"><div class="card h-100 shadow-sm border-0 position-relative">${adminBtn}<img src="${imgUrl}" class="card-img-top" style="height:200px; object-fit:cover;"><div class="card-body d-flex flex-column"><div class="d-flex justify-content-between mb-2"><span class="badge bg-primary">${news[3]}</span><small class="text-muted">${new Date(news[1]).toLocaleDateString()}</small></div><h5 class="card-title fw-bold text-truncate">${news[2]}</h5><p class="card-text small text-muted text-truncate">${news[4]}</p><div class="mt-auto"><button class="btn btn-sm btn-outline-primary mt-2 w-100 btn-view-berita" data-index="${index}">Lihat Selengkapnya</button></div></div></div></div>`; 
      }); 
      $("#home-berita-container").html(html); 
  });
  
  $.getJSON(API_URL + "?action=get_loker", function (res) { let html = !res.data || res.data.length === 0 ? '<div class="card shadow-sm border-0"><div class="card-body text-center text-muted py-4">Belum ada info loker.</div></div>' : ""; if (res.data) res.data.slice(0, 3).forEach((job) => { let badgeColor = job[4] == "Full-time" ? "success" : "warning"; let actionLink = user ? `<a href="loker.html" class="btn btn-sm btn-light text-primary w-100 mt-2 fw-bold" style="background:#eef2ff">Lihat Detail <i class="fas fa-arrow-right"></i></a>` : `<a href="login.html" class="btn btn-sm btn-light text-muted w-100 mt-2"><i class="fas fa-lock"></i> Login untuk Detail</a>`; html += `<div class="card mb-3 border-0 shadow-sm"><div class="card-body"><div class="d-flex justify-content-between align-items-start"><div><h6 class="fw-bold text-dark mb-1">${job[2]}</h6><small class="text-muted"><i class="far fa-building"></i> ${job[3]}</small></div><span class="badge bg-${badgeColor}-subtle text-${badgeColor} border border-${badgeColor}">${job[4]}</span></div>${actionLink}</div></div>`; }); $("#home-loker-summary").html(html); });
}

// =======================
// EVENT PAGE (FULL)
// =======================
function setupEventPage() {
    $("#event-full-container").html('<div class="text-center py-5"><div class="spinner-border text-primary"></div></div>');
    $.getJSON(API_URL + "?action=get_events", function (res) {
        globalEvents = res.data || [];
        let html = "";
        if (!res.data || res.data.length === 0) {
            html = '<div class="col-12 text-center text-muted py-5">Belum ada agenda kegiatan.</div>';
        } else {
            res.data.forEach((evt, i) => {
                let imgHTML = evt[5] ? `<img src="${evt[5]}" class="card-img-top" style="height: 180px; object-fit: cover;">` : '';
                
                // Admin Buttons
                let adminControls = "";
                if(user && user.role === "admin") {
                    adminControls = `
                    <div class="mt-2 d-flex gap-2">
                        <button onclick="goToEditEvent(${i})" class="btn btn-sm btn-warning w-50 text-white"><i class="fas fa-edit"></i> Edit</button>
                        <button onclick="hapusData('delete_event','${evt[0]}')" class="btn btn-sm btn-danger w-50"><i class="fas fa-trash"></i> Hapus</button>
                    </div>`;
                }

                html += `
                <div class="col-md-6 col-lg-4 mb-4">
                    <div class="card h-100 shadow-sm border-0">
                        ${imgHTML}
                        <div class="card-body">
                            <div class="d-flex align-items-center mb-3">
                                <div class="bg-danger text-white rounded p-2 text-center me-3" style="min-width: 60px;">
                                    <span class="d-block fw-bold h4 mb-0">${new Date(evt[2]).getDate()}</span>
                                    <small class="text-uppercase" style="font-size:0.7rem">${new Date(evt[2]).toLocaleDateString('id-ID',{month:'short'})}</small>
                                </div>
                                <div><h5 class="fw-bold mb-1 text-dark text-truncate-2">${evt[1]}</h5><small class="text-muted"><i class="fas fa-map-marker-alt me-1 text-danger"></i> ${evt[3]}</small></div>
                            </div>
                            <button class="btn btn-outline-danger w-100 btn-view-event" data-index="${i}">Detail Agenda</button>
                            ${adminControls}
                        </div>
                    </div>
                </div>`;
            });
        }
        $("#event-full-container").html(html);
    });
}

// FUNGSI KHUSUS REDIRECT EDIT EVENT
function goToEditEvent(index) {
    // 1. Simpan data event ke localStorage
    localStorage.setItem("edit_event_data", JSON.stringify(globalEvents[index]));
    // 2. Pindah ke halaman admin (Organisasi)
    window.location.href = "organisasi.html";
}

// =======================
// ORGANISASI & PROKER (LOGIC EDIT)
// =======================
function setupOrganisasi() {
    $.getJSON(API_URL + "?action=get_struktur", function (res) {
        // ... (Kode Tree Structure Tetap Sama) ...
        let container = $("#struktur-tree-container"); container.empty(); if (!res.data || res.data.length === 0) { container.html('<p class="text-muted">Belum ada data pengurus.</p>'); return; } let levels = {}; res.data.forEach(item => { let lvl = item[4]; if (!levels[lvl]) levels[lvl] = []; levels[lvl].push(item); }); Object.keys(levels).sort().forEach(lvlKey => { let members = levels[lvlKey]; let levelHTML = `<div class="org-level ${members.length > 1 ? 'has-siblings' : ''}">`; if(members.length > 1) { levelHTML += `<div class="connector-horizontal"></div>`; } members.forEach(i => { let adminControls = user && user.role === "admin" ? `<div class="mt-2 d-flex justify-content-center gap-1"><button onclick="editStruktur('${i[0]}','${i[1]}','${i[2]}','${i[4]}','${i[3]}','${i[5] || ""}','${i[6] || ""}')" class="btn btn-sm btn-warning text-white"><i class="fas fa-edit"></i></button><button onclick="hapusData('delete_struktur','${i[0]}')" class="btn btn-sm btn-danger"><i class="fas fa-trash"></i></button></div>` : ""; levelHTML += `<div class="org-card animate-up"><img src="${i[3] || "https://via.placeholder.com/150"}" class="org-img"><h6 class="fw-bold mb-0 text-dark">${i[1]}</h6><small class="text-muted d-block" style="font-size:0.75rem">${i[6] || "-"}</small><span class="badge bg-primary mt-1 mb-1">${i[2]}</span>${adminControls}</div>`; }); levelHTML += `</div>`; container.append(levelHTML); });
    });

    if (user && user.role === "admin") {
        $("#admin-area").show();
        $("#form-struktur").submit(function (e) { e.preventDefault(); let id = $("#struktur-id").val(); handlePost(this, id ? "update_struktur" : "post_struktur"); });
        $("#form-event").submit(function (e) { e.preventDefault(); let id = $("#event-id").val(); handlePost(this, id ? "update_event" : "post_event"); });
        $("#form-proker").submit(function (e) { e.preventDefault(); let id = $("#proker-id").val(); handlePost(this, id ? "update_proker" : "post_proker"); });
        $("#form-berita").submit(function (e) { e.preventDefault(); let id = $("#berita-id").val(); handlePost(this, id ? "update_berita" : "post_berita"); });

        // CEK APAKAH ADA DATA EDIT DARI HALAMAN LAIN (Redirect Logic)
        checkEditRedirects();
    }
}

// LOGIC PENTING: MENERIMA DATA EDIT DARI PAGE LAIN
function checkEditRedirects() {
    // 1. Cek Edit Proker
    let editProker = localStorage.getItem("edit_proker_data");
    if(editProker) {
        let data = JSON.parse(editProker);
        var tab = new bootstrap.Tab(document.querySelector('#adminTab button[data-bs-target="#tab-proker"]')); tab.show();
        $("#proker-id").val(data[0]);
        $("#proker-program").val(data[1]);
        $("#proker-deskripsi").val(data[2]);
        $("#proker-status").val(data[3]);
        $("#proker-pj").val(data[4]);
        $("#proker-foto").val(data[5]);
        $("#btn-save-proker").text("Update Proker").removeClass("btn-info").addClass("btn-warning");
        $("#btn-cancel-proker").show();
        localStorage.removeItem("edit_proker_data");
        document.getElementById("admin-area").scrollIntoView();
    }

    // 2. Cek Edit Event (BARU)
    let editEvent = localStorage.getItem("edit_event_data");
    if(editEvent) {
        let data = JSON.parse(editEvent);
        var tab = new bootstrap.Tab(document.querySelector('#adminTab button[data-bs-target="#tab-event"]')); tab.show();
        
        // Isi Form Event (Sesuaikan ID di organisasi.html)
        // Data index: 0=ID, 1=Judul, 2=Tanggal, 3=Lokasi, 4=Deskripsi, 5=Foto
        $("#event-id").val(data[0]);
        $("#event-judul-input").val(data[1]);
        
        // Format tanggal agar masuk ke input type="date" (YYYY-MM-DD)
        let tgl = new Date(data[2]);
        let formattedDate = tgl.toISOString().substring(0,10);
        $("#event-tanggal-input").val(formattedDate);
        
        $("#event-lokasi-input").val(data[3]);
        $("#event-deskripsi-input").val(data[4]);
        $("#event-foto-input").val(data[5]);

        $("#btn-save-event").text("Update Event").removeClass("btn-primary").addClass("btn-warning");
        $("#btn-cancel-event").show();
        localStorage.removeItem("edit_event_data");
        document.getElementById("admin-area").scrollIntoView();
    }
}

function setupProkerPage() {
    $.getJSON(API_URL + "?action=get_proker", function (res) {
        let html = "";
        globalProker = res.data || [];
        if (!res.data || res.data.length === 0) {
            html = '<tr><td colspan="5" class="text-center py-4 text-muted">Belum ada program kerja.</td></tr>';
        } else {
            res.data.forEach((i, idx) => {
                let statusBadge = i[3] === 'Terlaksana' ? 'success' : (i[3] === 'Berjalan' ? 'primary' : 'secondary');
                let adminBtn = "";
                if (user && user.role === "admin") {
                    adminBtn = `<br><button onclick="goToEditProker(${idx})" class="btn btn-sm btn-warning mt-1 text-white" style="font-size: 0.7rem;"><i class="fas fa-edit"></i> Edit</button>
                                <button onclick="hapusData('delete_proker','${i[0]}')" class="btn btn-sm btn-danger mt-1" style="font-size: 0.7rem;"><i class="fas fa-trash"></i></button>`;
                }
                html += `<tr><td class="fw-bold text-dark">${i[1]}</td><td class="text-muted small text-truncate" style="max-width: 200px;">${i[2]}</td><td><div class="d-flex align-items-center"><div class="bg-light rounded-circle d-flex align-items-center justify-content-center me-2" style="width:30px; height:30px;"><i class="fas fa-user text-secondary" style="font-size: 0.8rem;"></i></div><span class="fw-bold text-dark" style="font-size: 0.9rem;">${i[4] || '-'}</span></div></td><td><span class="badge bg-${statusBadge}">${i[3]}</span></td><td><button onclick="bukaProkerDetail(${idx})" class="btn btn-sm btn-outline-info text-dark" style="font-size: 0.7rem;"><i class="fas fa-eye"></i> Detail</button>${adminBtn}</td></tr>`;
            });
        }
        $("#proker-full-container").html(html);
    });
}

function goToEditProker(index) {
    localStorage.setItem("edit_proker_data", JSON.stringify(globalProker[index]));
    window.location.href = "organisasi.html";
}

// =======================
// LOKER (EDIT)
// =======================
function setupLoker() {
    $.getJSON(API_URL + "?action=get_loker", function (res) {
        allLokerData = res.data || []; renderKategoriLoker();
    });
    $("#form-loker").submit(function (e) { e.preventDefault(); if (!user) { alert("Login dulu!"); window.location.href = "login.html"; return; } 
        let id = $("#loker-id").val();
        handlePost(this, id ? "update_loker" : "post_loker"); 
    });
}

function renderKategoriLoker() {
    let html = "";
    let countMap = {};
    allLokerData.forEach(job => { let kat = job[7] || "Lainnya"; countMap[kat] = (countMap[kat] || 0) + 1; });
    KATEGORI_LOKER.forEach(kat => {
        let count = countMap[kat.name] || 0;
        html += `<div class="col-6 col-md-4 col-lg-3"><div class="card h-100 shadow-sm border-0 cat-card text-center p-3" onclick="bukaLokerByKategori('${kat.name}')"><div class="mx-auto cat-icon bg-${kat.color}-subtle text-${kat.color}"><i class="fas ${kat.icon}"></i></div><h6 class="fw-bold mb-1 text-dark" style="font-size: 0.9rem;">${kat.name}</h6><small class="text-muted">${count} Lowongan</small></div></div>`;
    });
    $("#view-kategori").html(html); $("#view-kategori").show(); $("#view-list-loker").hide(); $("#loker-page-title").text("Kategori Pekerjaan");
}

function bukaLokerByKategori(kategoriName) {
    let filteredJobs = allLokerData.filter(job => (job[7] || "Lainnya") === kategoriName);
    let html = "";
    if (filteredJobs.length === 0) { html = `<div class="col-12 text-center text-muted py-5"><i class="far fa-folder-open fa-3x mb-3"></i><br>Belum ada lowongan di kategori ini.</div>`; } 
    else {
        filteredJobs.forEach((job, idx) => {
            let badgeColor = job[4] == "Full-time" ? "success" : "warning";
            let btnAction = "", deskripsi = "";
            let imgHTML = job[8] ? `<img src="${job[8]}" class="card-img-top" style="height: 200px; object-fit: cover;">` : '';
            
            let adminBtn = "";
            if(user && user.role === 'admin') {
                // job[0] adalah ID
                adminBtn = `<div class="mt-2"><button onclick="editLoker('${job[0]}')" class="btn btn-sm btn-warning w-100 mb-1">Edit</button><button onclick="hapusData('delete_loker','${job[0]}')" class="btn btn-sm btn-danger w-100">Hapus</button></div>`;
            }

            if (user) { let linkUrl = job[6] && job[6] !== "-" && job[6] !== "#" ? job[6] : null; btnAction = linkUrl ? `<a href="${linkUrl}" target="_blank" class="btn btn-outline-primary w-100">Lamar Sekarang</a>` : `<button class="btn btn-secondary w-100" disabled>Info via DM/Email</button>`; deskripsi = `<p class="card-text small mt-3 text-muted" style="white-space: pre-line;">${job[5]}</p>`; } else { btnAction = `<a href="login.html" class="btn btn-primary w-100"><i class="fas fa-lock me-2"></i>Login untuk Melamar</a>`; deskripsi = `<div class="p-3 bg-light rounded mt-3 text-center"><small class="text-muted"><i class="fas fa-eye-slash me-1"></i> Rincian disembunyikan.</small></div>`; }
            html += `<div class="col-12 col-md-6 mb-4 animate-up"><div class="card h-100 shadow-sm border-0">${imgHTML}<div class="card-body d-flex flex-column"><div class="d-flex justify-content-between align-items-start mb-2"><div><h5 class="card-title fw-bold text-dark mb-1">${job[2]}</h5><h6 class="card-subtitle text-primary mb-2"><i class="fas fa-building me-1"></i> ${job[3]}</h6><span class="badge bg-${badgeColor}-subtle text-${badgeColor} border border-${badgeColor}">${job[4]}</span></div></div>${deskripsi}<div class="mt-auto pt-3">${btnAction} ${adminBtn}</div></div><div class="card-footer bg-white text-muted small border-top-0"><i class="far fa-clock me-1"></i> Diposting: ${new Date(job[1]).toLocaleDateString()}</div></div></div>`;
        });
    }
    $("#loker-container").html(html); $("#view-kategori").hide(); $("#view-list-loker").fadeIn(); $("#loker-page-title").html(`<span class="text-muted fw-light">Kategori:</span> ${kategoriName}`); window.scrollTo(0, 0); 
}

function editLoker(id) {
    let data = allLokerData.find(j => j[0] == id);
    if(data) {
        $("#loker-id").val(data[0]);
        $("input[name='posisi']").val(data[2]);
        $("input[name='perusahaan']").val(data[3]);
        $("select[name='tipe']").val(data[4]);
        $("textarea[name='deskripsi']").val(data[5]);
        $("input[name='link']").val(data[6]);
        $("select[name='kategori']").val(data[7]);
        $("input[name='foto']").val(data[8]);
        
        $("#form-loker button[type='submit']").text("Update Loker").removeClass("btn-primary").addClass("btn-warning");
        new bootstrap.Modal("#modalLoker").show();
    }
}

// HELPER LAINNYA
function resetFormProker() { $("#form-proker")[0].reset(); $("#proker-id").val(""); $("#btn-save-proker").text("Simpan Proker").removeClass("btn-warning").addClass("btn-info"); $("#btn-cancel-proker").hide(); }
function resetFormBerita() { $("#form-berita")[0].reset(); $("#berita-id").val(""); $("#btn-save-berita").text("Terbitkan Berita").removeClass("btn-warning").addClass("btn-danger"); $("#btn-cancel-berita").hide(); }
function resetFormEvent() { $("#form-event")[0].reset(); $("#event-id").val(""); $("#btn-save-event").text("Simpan Event").removeClass("btn-warning").addClass("btn-primary"); $("#btn-cancel-event").hide(); }
function kembaliKeKategori() { $("#view-list-loker").hide(); $("#view-kategori").fadeIn(); $("#loker-page-title").text("Kategori Pekerjaan"); }
function setupForum() { loadForum(); $("#form-thread").submit(function (e) { e.preventDefault(); handlePost(this, "post_thread"); }); $("#form-comment").submit(function (e) { e.preventDefault(); let data = $(this).serialize() + "&action=post_comment&email=" + user.email + "&nama=" + user.nama; $.post(API_URL, data, function (res) { $("#form-comment")[0].reset(); loadComments($("#current-thread-id").val()); }); }); }
function loadForum() { $("#forum-container").html('<div class="text-center py-3"><div class="spinner-border text-primary"></div></div>'); $.getJSON(API_URL + "?action=get_forum", function (r) { let html = !r.data || r.data.length === 0 ? '<div class="alert alert-info text-center col-12">Belum ada topik diskusi. Mulailah membuat topik baru!</div>' : ""; if (r.data) r.data.forEach((i) => { let badgeClass = i[3] === "Info Event" ? "danger" : (i[3] === "Tanya Jawab" ? "success" : "primary"); html += `<div class="col-12 mb-3"><div class="card border-0 shadow-sm w-100"><div class="card-body"><div class="d-flex justify-content-between align-items-center mb-2"><span class="badge bg-${badgeClass}">${i[3]}</span><small class="text-muted" style="font-size: 0.75rem">${new Date(i[1]).toLocaleDateString()}</small></div><h5 class="fw-bold text-dark mb-2">${i[4]}</h5><p class="text-muted small text-truncate mb-3">${i[5]}</p><button onclick="bukaDetail('${i[0]}','${i[4]}','${i[2]}','${i[5].replace(/\n/g, " ")}')" class="btn btn-sm btn-outline-primary w-100">Lihat Diskusi <i class="fas fa-arrow-right ms-1"></i></button></div></div></div>`; }); $("#forum-container").html(html); }); }
function loadComments(id) { $.getJSON(API_URL + "?action=get_comments&id_thread=" + id, function (r) { let h = ""; if (r.data) r.data.forEach((c) => { let dateStr = new Date(c[2]).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit'}); h += `<div class="alert alert-light p-2 mb-1 border"><div class="d-flex justify-content-between"><small class="fw-bold text-primary">${c[3]}</small><small class="text-muted" style="font-size:0.7em">${dateStr}</small></div><p class="mb-0 text-dark small mt-1">${c[4]}</p></div>`; }); $("#comments-list").html(h); }); }
function editStruktur(id, n, j, u, f, e, nim) { document.getElementById("admin-area").scrollIntoView({ behavior: "smooth" }); var t = new bootstrap.Tab(document.querySelector('#adminTab button[data-bs-target="#tab-struktur"]')); t.show(); $("#struktur-id").val(id); $("#str-nama").val(n); $("#str-jabatan").val(j); $("#str-urutan").val(u); $("#str-foto").val(f); $("#str-email").val(e); $("#str-nim").val(nim); $("#btn-save-struktur").text("Update").removeClass("btn-success").addClass("btn-warning"); $("#btn-cancel-struktur").show(); }
function resetFormStruktur() { $("#form-struktur")[0].reset(); $("#struktur-id").val(""); $("#btn-save-struktur").text("Simpan").removeClass("btn-warning").addClass("btn-success"); $("#btn-cancel-struktur").hide(); }
function setupDirektori() { $.getJSON(API_URL + "?action=get_alumni", function (res) { let html = ""; res.data.forEach((alumni) => { if (user) { let skills = alumni.skill ? alumni.skill.split(",").map((s) => `<span class="badge bg-light text-dark border me-1">${s}</span>`).join("") : ""; let linkedinBtn = alumni.linkedin && alumni.linkedin !== "#" && alumni.linkedin !== "-" ? `<a href="${alumni.linkedin}" target="_blank" class="btn btn-sm btn-outline-primary w-100 mt-2"><i class="fab fa-linkedin"></i> Connect</a>` : ""; html += `<div class="col-md-4 mb-4 item-alumni animate-up"><div class="card p-3 h-100 text-center border-0 shadow-sm"><img src="${alumni.foto}" class="rounded-circle mx-auto mb-3" width="70" height="70" style="object-fit:cover"><h5 class="fw-bold mb-0">${alumni.nama}</h5><small class="text-muted d-block" style="font-size:0.85rem">NIM: ${alumni.nim}</small> <small class="text-primary fw-bold mb-2 d-block">${alumni.pekerjaan || "Alumni"}</small><span class="badge bg-info text-dark mb-3">Angkatan ${alumni.tahun}</span><div class="mb-2">${skills}</div><div class="mt-auto">${linkedinBtn}</div></div></div>`; } else { html += `<div class="col-md-4 mb-4 item-alumni"><div class="card p-3 h-100 text-center bg-light border-0"><div class="rounded-circle bg-secondary mx-auto mb-3" style="width:70px; height:70px; opacity:0.2"></div><h5 class="fw-bold mb-0 text-muted">Alumni ${alumni.tahun}</h5><small class="text-muted d-block mb-3">Nama Disembunyikan</small><a href="login.html" class="btn btn-sm btn-outline-secondary rounded-pill">Login untuk Kontak</a></div></div>`; } }); $("#alumni-list").html(html); }); }
function setupProfil() { if (!user) { window.location.href = "login.html"; return; } $('input[name="nama"]').val(user.nama); $('input[name="email"]').val(user.email); $('input[name="nim"]').val(user.nim); $('input[name="tahun"]').val(user.tahun); $('input[name="pekerjaan"]').val(user.pekerjaan); $('input[name="linkedin"]').val(user.linkedin); $('input[name="foto"]').val(user.foto); $('input[name="skill"]').val(user.skill); $("#form-profil").submit(function (e) { e.preventDefault(); handlePost(this, "update_profile"); }); }
function setupAuthForms() { $("#form-login").submit(function (e) { e.preventDefault(); handleAuth(this, "login"); }); $("#form-register").submit(function (e) { e.preventDefault(); let email = $('input[name="email"]').val().trim(); let nim = $('input[name="nim"]').val().trim(); if (!/^\d{11}@uniku\.ac\.id$/.test(email)) { alert("Email harus: [NIM 11 digit]@uniku.ac.id"); return; } if (email.split("@")[0] !== nim) { alert("NIM di email tidak sama dengan NIM yang diinput!"); return; } handleAuth(this, "register"); }); }
function handlePost(form, action) { if (!confirm("Proses data?")) return; const btn = $(form).find("button"); btn.prop("disabled", true).text("Processing..."); let data = $(form).serialize() + "&action=" + action + (user ? "&email=" + user.email : ""); $.post(API_URL, data, function (res) { alert(res.message); location.reload(); }); }
function handleAuth(form, action) { const btn = $(form).find("button"); btn.prop("disabled", true); $.post(API_URL, $(form).serialize() + "&action=" + action, function (res) { if (res.status === "success") { if (action === "login") localStorage.setItem("user_alumni", JSON.stringify(res.user)); alert(res.message); window.location.href = action === "login" ? "index.html" : "login.html"; } else { alert(res.message); btn.prop("disabled", false); } }); }
function logout() { localStorage.removeItem("user_alumni"); window.location.href = "index.html"; }
function hapusData(action, id) { if (confirm("Hapus?")) $.post(API_URL, { action: action, id: id }, function () { location.reload(); }); }
function bukaDetail(id, t, a, c) { $("#detail-judul").text(t); $("#detail-isi").text(c); $("#current-thread-id").val(id); new bootstrap.Modal("#modalDetail").show(); loadComments(id); }
function bukaProkerDetail(index) { let data = globalProker[index]; $("#proker-judul").text(data[1]); $("#proker-isi").text(data[2]); $("#proker-pj-detail").text(data[4]); $("#proker-status-detail").text(data[3]); if(data[5]) { $("#proker-gambar").attr("src", data[5]).show(); } else { $("#proker-gambar").hide(); } new bootstrap.Modal("#modalProkerDetail").show(); }
function bukaBerita(i) { let d = globalBerita[i]; if (d) { $("#berita-judul").text(d[2]); $("#berita-isi").html(d[4].replace(/\n/g, "<br>")); $("#berita-gambar").attr("src", d[5] || ""); new bootstrap.Modal("#modalBerita").show(); } }
function bukaEvent(i) { let d = globalEvents[i]; if (d) { $("#event-judul").text(d[1]); $("#event-tanggal").text(new Date(d[2]).toLocaleDateString()); $("#event-lokasi").text(d[3]); $("#event-deskripsi").html(d[4] ? d[4].replace(/\n/g, "<br>") : "-"); if(d[5]) { $("#event-gambar").attr("src", d[5]).show(); } else { $("#event-gambar").hide(); } new bootstrap.Modal("#modalEvent").show(); } }