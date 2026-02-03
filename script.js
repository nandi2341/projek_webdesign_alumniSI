const API_URL =
  "https://script.google.com/macros/s/AKfycbyMHadiPAAYFjvB5r-xk0VjJuqYNZJPQT81DG7hb-1385Zwxz-q_5TMg0Bh7AkaU4vG8A/exec";

const user = JSON.parse(localStorage.getItem("user_alumni"));
const pageId = $("body").attr("id");

let globalBerita = [];
let globalEvents = [];
let globalProker = [];
let allLokerData = [];
let globalStruktur = [];
let allAlumniData = [];

const KATEGORI_LOKER = [
  {
    name: "Teknologi dan pengembangan sistem",
    icon: "fa-laptop-code",
    color: "primary",
  },
  { name: "Data dan analis", icon: "fa-chart-line", color: "success" },
  { name: "Database dan infrastruktur", icon: "fa-server", color: "info" },
  { name: "Keamanan informasi", icon: "fa-user-shield", color: "danger" },
  { name: "Bisnis dan manajemen TI", icon: "fa-briefcase", color: "warning" },
  { name: "Bidang audit", icon: "fa-clipboard-check", color: "secondary" },
  { name: "E bisnis", icon: "fa-shopping-cart", color: "primary" },
  { name: "Edukasi dan riset", icon: "fa-graduation-cap", color: "success" },
  { name: "Lainnya", icon: "fa-th-large", color: "dark" },
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

  $(document).on("click", ".btn-view-event", function () {
    bukaEvent($(this).data("index"));
  });
  $(document).on("click", ".btn-view-berita", function () {
    bukaBerita($(this).data("index"));
  });
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
                    <img src="${user.foto}" class="rounded-circle border border-2 border-white shadow-sm" width="35" height="35" style="object-fit:cover;">
                </a>
                <ul class="dropdown-menu dropdown-menu-end shadow mt-2 border-0">
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

function setupDashboard() {
  if (user) {
    $("#welcome-name").text(user.nama.split(" ")[0]);
    $("#banner-btn-container").html(
      `<a href="alumni.html" class="btn btn-light text-primary fw-bold rounded-pill px-4 shadow me-2">Cari Teman</a>`,
    );
  } else {
    $("#welcome-name").text("Keluarga SI");
    $("#banner-btn-container").html(
      `<a href="login.html" class="btn btn-warning fw-bold rounded-pill px-4 shadow me-2">Gabung Sekarang</a>`,
    );
  }

  $.getJSON(API_URL + "?action=get_settings", function (res) {
    if (
      res.status === "success" &&
      res.data &&
      res.data.banner_images &&
      res.data.banner_images.length > 0
    ) {
      let banners = res.data.banner_images;
      let index = 0;
      $("#main-banner").css("background-image", `url('${banners[0]}')`);
      if (banners.length > 1) {
        setInterval(() => {
          index = (index + 1) % banners.length;
          $("#main-banner").css("background-image", `url('${banners[index]}')`);
        }, 5000);
      }
    }
  });

  $.getJSON(API_URL + "?action=get_events", function (res) {
    globalEvents = res.data || [];
    let html =
      !res.data || res.data.length === 0
        ? '<li class="list-group-item text-center small text-muted py-4">Belum ada agenda.</li>'
        : "";
    if (res.data)
      res.data.slice(0, 3).forEach((evt, i) => {
        let adminBtn = "";
        if (user && user.role === "admin") {
          let editBtn = `<button onclick="goToEditBerita(${index})" class="btn btn-sm btn-warning position-absolute top-0 end-0 mt-2 me-5 shadow rounded-circle text-white" style="width:30px;height:30px;padding:0;z-index:10;" title="Edit"><i class="fas fa-edit"></i></button>`;
          let delBtn = `<button onclick="hapusData('delete_berita','${news[0]}')" class="btn btn-sm btn-danger position-absolute top-0 end-0 m-2 shadow rounded-circle" style="width:30px;height:30px;padding:0;z-index:10;" title="Hapus"><i class="fas fa-trash"></i></button>`;
          adminBtn = editBtn + delBtn;
        }
        html += `<li class="list-group-item p-3 border-0 border-bottom"><div class="d-flex justify-content-between align-items-start"><div><h6 class="mb-1 fw-bold text-dark text-truncate" style="max-width: 200px;">${evt[1]} ${adminBtn}</h6><small class="text-muted"><i class="fas fa-map-marker-alt text-danger me-1"></i> ${evt[3]}</small></div><div class="text-end bg-light rounded p-1 px-2"><small class="text-danger fw-bold d-block">${new Date(evt[2]).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</small></div></div><button class="btn btn-sm btn-light text-primary w-100 mt-2 fw-bold btn-view-event rounded-pill" data-index="${i}" style="font-size:0.8rem;">Info <i class="fas fa-arrow-right ms-1"></i></button></li>`;
      });
    $("#home-events-container").html(html);
  });

  // Dashboard Widget: Berita
  $.getJSON(API_URL + "?action=get_berita", function (res) {
    globalBerita = res.data || [];
    let html = !globalBerita.length
      ? '<div class="w-100 text-center text-muted py-4">Belum ada berita.</div>'
      : "";

    if (globalBerita.length) {
      globalBerita.forEach((news, index) => {
        let imgUrl =
          news[5] || "https://via.placeholder.com/400x200?text=Berita+SI";

        // --- PERBAIKAN TOMBOL ADMIN DI SINI ---
        let adminBtn = "";
        if (user && user.role === "admin") {
          // 1. Tombol Edit (Kuning) - Posisinya digeser ke kiri (me-5) biar gak numpuk
          let editBtn = `<button onclick="goToEditBerita(${index})" class="btn btn-sm btn-warning position-absolute top-0 end-0 mt-2 me-5 shadow rounded-circle text-white" style="width:30px;height:30px;padding:0;z-index:10;" title="Edit"><i class="fas fa-edit"></i></button>`;

          // 2. Tombol Hapus (Merah)
          let delBtn = `<button onclick="hapusData('delete_berita','${news[0]}')" class="btn btn-sm btn-danger position-absolute top-0 end-0 m-2 shadow rounded-circle" style="width:30px;height:30px;padding:0;z-index:10;" title="Hapus"><i class="fas fa-trash"></i></button>`;

          // Gabungkan keduanya
          adminBtn = editBtn + delBtn;
        }
        // ---------------------------------------

        html += `
              <div class="news-slide-item">
                  <div class="card h-100 shadow-sm border-0 position-relative overflow-hidden">
                      ${adminBtn} 
                      <img src="${imgUrl}" class="card-img-top" style="height:180px; object-fit:cover;">
                      <div class="card-body d-flex flex-column p-3">
                          <div class="d-flex justify-content-between mb-2">
                              <span class="badge bg-primary bg-opacity-10 text-primary px-2 py-1 rounded-pill" style="font-size:0.7rem">${news[3]}</span>
                              <small class="text-muted" style="font-size:0.75rem">${new Date(news[1]).toLocaleDateString()}</small>
                          </div>
                          <h6 class="card-title fw-bold text-dark text-truncate mb-1">${news[2]}</h6>
                          <p class="card-text small text-muted text-truncate mb-3">${news[4]}</p>
                          <div class="mt-auto">
                              <button class="btn btn-sm btn-outline-primary w-100 rounded-pill btn-view-berita" data-index="${index}">Baca Selengkapnya</button>
                          </div>
                      </div>
                  </div>
              </div>`;
      });
    }
    $("#home-berita-container").html(html);
  });

  $.getJSON(API_URL + "?action=get_loker", function (res) {
    let html =
      !res.data || res.data.length === 0
        ? '<div class="card shadow-sm border-0"><div class="card-body text-center text-muted py-4">Belum ada info loker.</div></div>'
        : "";
    if (res.data)
      res.data.slice(0, 3).forEach((job) => {
        let badgeColor = job[4] == "Full-time" ? "success" : "warning";
        let actionLink = user
          ? `<a href="loker.html" class="btn btn-sm btn-light text-primary w-100 mt-2 fw-bold rounded-pill">Lihat Detail <i class="fas fa-arrow-right"></i></a>`
          : `<a href="login.html" class="btn btn-sm btn-light text-muted w-100 mt-2 rounded-pill"><i class="fas fa-lock"></i> Login</a>`;
        html += `<div class="card mb-3 border-0 shadow-sm"><div class="card-body"><div class="d-flex justify-content-between align-items-start"><div><h6 class="fw-bold text-dark mb-1">${job[2]}</h6><small class="text-muted"><i class="far fa-building"></i> ${job[3]}</small></div><span class="badge bg-${badgeColor}-subtle text-${badgeColor} border border-${badgeColor} rounded-pill">${job[4]}</span></div>${actionLink}</div></div>`;
      });
    $("#home-loker-summary").html(html);
  });
}

function setupEventPage() {
  $("#event-full-container").html(
    '<div class="col-12 text-center py-5"><div class="spinner-border text-primary"></div></div>',
  );

  $.getJSON(API_URL + "?action=get_events", function (res) {
    globalEvents = res.data || [];
    let html = "";

    if (!res.data || res.data.length === 0) {
      html =
        '<div class="col-12 text-center text-muted py-5"><i class="far fa-calendar-times fa-3x mb-3 text-secondary"></i><br>Belum ada agenda kegiatan.</div>';
    } else {
      res.data.forEach((evt, i) => {
        let imgUrl =
          evt[5] ||
          `https://source.unsplash.com/800x600/?meeting,technology&sig=${i}`;
        let tglObj = new Date(evt[2]);
        let tgl = tglObj.getDate();
        let bln = tglObj.toLocaleDateString("id-ID", { month: "short" });

        let adminControls = "";
        if (user && user.role === "admin") {
          adminControls = `
                    <div class="card-footer bg-white border-top-0 d-flex gap-2 pt-0 pb-3">
                        <button onclick="goToEditEvent(${i})" class="btn btn-sm btn-outline-warning w-50 rounded-pill"><i class="fas fa-edit"></i> Edit</button>
                        <button onclick="hapusData('delete_event','${evt[0]}')" class="btn btn-sm btn-outline-danger w-50 rounded-pill"><i class="fas fa-trash"></i> Hapus</button>
                    </div>`;
        }

        html += `
                <div class="col-md-6 col-lg-4 mb-4 animate-up" style="animation-delay: ${i * 0.1}s">
                    <div class="card event-card h-100 shadow-hover border-0 overflow-hidden">
                        <div class="event-date-badge">
                            <span class="d-block fw-bold fs-4 text-dark" style="line-height:1">${tgl}</span>
                            <span class="d-block small text-uppercase fw-bold text-danger">${bln}</span>
                        </div>
                        <div class="event-img-wrapper">
                            <img src="${imgUrl}" alt="${evt[1]}">
                            <div class="position-absolute bottom-0 start-0 w-100 p-3" style="background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);">
                                <small class="text-white"><i class="fas fa-map-marker-alt text-warning me-1"></i> ${evt[3]}</small>
                            </div>
                        </div>
                        <div class="card-body">
                            <h5 class="fw-bold text-dark mb-2 text-truncate">${evt[1]}</h5>
                            <p class="text-muted small line-clamp-3">${evt[4] ? evt[4].substring(0, 80) + "..." : "Tidak ada deskripsi."}</p>
                            <button class="btn btn-primary w-100 rounded-pill btn-view-event shadow-sm" data-index="${i}">Detail Agenda</button>
                        </div>
                        ${adminControls}
                    </div>
                </div>`;
      });
    }
    $("#event-full-container").html(html);
  });
}

function goToEditEvent(index) {
  localStorage.setItem("edit_event_data", JSON.stringify(globalEvents[index]));
  window.location.href = "organisasi.html";
}

function setupOrganisasi() {
  $.getJSON(API_URL + "?action=get_struktur", function (res) {
    let container = $("#struktur-tree-container");
    container.empty();

    globalStruktur = res.data || [];
    populatePJDropdown();

    if (!res.data || res.data.length === 0) {
      container.html(
        '<div class="alert alert-light border shadow-sm">Belum ada data pengurus.</div>',
      );
      return;
    }

    let levels = {};
    res.data.forEach((item) => {
      let lvl = item[4];
      if (!levels[lvl]) levels[lvl] = [];
      levels[lvl].push(item);
    });

    Object.keys(levels)
      .sort()
      .forEach((lvlKey) => {
        let members = levels[lvlKey];
        let levelHTML = `<div class="org-level ${members.length > 1 ? "has-siblings" : ""}">`;
        if (members.length > 1) {
          levelHTML += `<div class="connector-horizontal"></div>`;
        }

        members.forEach((i) => {
          let adminControls =
            user && user.role === "admin"
              ? `<div class="position-absolute top-0 end-0 p-2">
            <button onclick="handleEditStruktur('${i[0]}')" class="btn btn-sm btn-light text-warning shadow-sm rounded-circle mb-1" style="width:30px;height:30px;padding:0;"><i class="fas fa-edit"></i></button><br>
            <button onclick="hapusData('delete_struktur','${i[0]}')" class="btn btn-sm btn-light text-danger shadow-sm rounded-circle" style="width:30px;height:30px;padding:0;"><i class="fas fa-trash"></i></button>
         </div>`
              : "";

          levelHTML += `
                <div class="org-card animate-up bg-white p-4 text-center position-relative shadow-hover" style="width: 240px; margin: 0 15px;">
                    ${adminControls}
                    <div class="d-inline-block p-1 rounded-circle bg-white shadow-sm mb-3">
                        <img src="${i[3] || "https://via.placeholder.com/150"}" class="rounded-circle" width="90" height="90" style="object-fit:cover;">
                    </div>
                    <div class="org-role-badge shadow-sm mb-2">${i[2]}</div>
                    <h6 class="fw-bold text-dark mb-0">${i[1]}</h6>
                    <small class="text-muted d-block mb-3" style="font-size:0.75rem">${i[6] || "NIM: -"}</small>
                    ${i[5] ? `<a href="mailto:${i[5]}" class="btn btn-sm btn-outline-light text-secondary rounded-pill w-100 small" style="font-size:0.8rem; border-color:#eee"><i class="fas fa-envelope me-1"></i> Kontak</a>` : ""}
                </div>`;
        });
        levelHTML += `</div>`;
        container.append(levelHTML);
      });
  });

  if (user && user.role === "admin") {
    $("#admin-area").fadeIn();
    $("#form-struktur").submit(function (e) {
      e.preventDefault();
      let id = $("#struktur-id").val();
      handlePost(this, id ? "update_struktur" : "post_struktur");
    });
    $("#form-event").submit(function (e) {
      e.preventDefault();
      let id = $("#event-id").val();
      handlePost(this, id ? "update_event" : "post_event");
    });
    $("#form-proker").submit(function (e) {
      e.preventDefault();
      let id = $("#proker-id").val();
      handlePost(this, id ? "update_proker" : "post_proker");
    });
    $("#form-berita").submit(function (e) {
      e.preventDefault();
      let id = $("#berita-id").val();
      handlePost(this, id ? "update_berita" : "post_berita");
    });
    checkEditRedirects();
  }
}

function populatePJDropdown() {
  let options =
    '<option value="" selected disabled>Pilih Penanggung Jawab...</option>';
  globalStruktur
    .sort((a, b) => a[1].localeCompare(b[1]))
    .forEach((member) => {
      options += `<option value="${member[1]}">${member[1]} - ${member[2]}</option>`;
    });
  $("#proker-pj").html(options);
}

function handleEditStruktur(id) {
  let data = globalStruktur.find((item) => item[0] === id);

  if (!data) {
    alert("Data tidak ditemukan!");
    return;
  }

  let adminArea = document.getElementById("admin-area");
  adminArea.scrollIntoView({ behavior: "smooth" });

  let tabEl = document.querySelector(
    '#adminTab button[data-bs-target="#tab-struktur"]',
  );
  let tab = bootstrap.Tab.getOrCreateInstance(tabEl);
  tab.show();

  $("#struktur-id").val(data[0]);
  $("#str-nama").val(data[1]);
  $("#str-jabatan").val(data[2]);
  $("#str-foto").val(data[3]);
  $("#str-urutan").val(data[4]);
  $("#str-email").val(data[5] || "");
  $("#str-nim").val(data[6] || "");

  $("#btn-save-struktur")
    .text("Update Pengurus")
    .removeClass("btn-success")
    .addClass("btn-warning");
  $("#btn-cancel-struktur").show();
}

function checkEditRedirects() {
  let editProker = localStorage.getItem("edit_proker_data");
  if (editProker) {
    let data = JSON.parse(editProker);
    var tab = new bootstrap.Tab(
      document.querySelector('#adminTab button[data-bs-target="#tab-proker"]'),
    );
    tab.show();
    $("#proker-id").val(data[0]);
    $("#proker-program").val(data[1]);
    $("#proker-deskripsi").val(data[2]);
    $("#proker-status").val(data[3]);
    $("#proker-pj").val(data[4]);
    $("#proker-foto").val(data[5]);
    $("#btn-save-proker")
      .text("Update Proker")
      .removeClass("btn-info")
      .addClass("btn-warning");
    $("#btn-cancel-proker").show();
    localStorage.removeItem("edit_proker_data");
    document.getElementById("admin-area").scrollIntoView();
  }

  let editEvent = localStorage.getItem("edit_event_data");
  if (editEvent) {
    let data = JSON.parse(editEvent);
    var tab = new bootstrap.Tab(
      document.querySelector('#adminTab button[data-bs-target="#tab-event"]'),
    );
    tab.show();
    $("#event-id").val(data[0]);
    $("#event-judul-input").val(data[1]);
    let tgl = new Date(data[2]);
    let formattedDate = tgl.toISOString().substring(0, 10);
    $("#event-tanggal-input").val(formattedDate);
    $("#event-lokasi-input").val(data[3]);
    $("#event-deskripsi-input").val(data[4]);
    $("#event-foto-input").val(data[5]);
    $("#btn-save-event")
      .text("Update Event")
      .removeClass("btn-primary")
      .addClass("btn-warning");
    $("#btn-cancel-event").show();
    localStorage.removeItem("edit_event_data");
    document.getElementById("admin-area").scrollIntoView();
  }

  let editBerita = localStorage.getItem("edit_berita_data");
  if (editBerita) {
    let data = JSON.parse(editBerita);
    // Buka Tab Berita
    var tab = new bootstrap.Tab(
      document.querySelector('#adminTab button[data-bs-target="#tab-berita"]'),
    );
    tab.show();

    $("#berita-id").val(data[0]);
    $("#berita-judul-input").val(data[2]);
    $("#berita-kategori").val(data[3]);
    $("#berita-isi-input").val(data[4]);
    $("#berita-gambar-input").val(data[5]);

    $("#btn-save-berita")
      .text("Update Berita")
      .removeClass("btn-danger")
      .addClass("btn-warning");
    $("#btn-cancel-berita").show();

    localStorage.removeItem("edit_berita_data");
    document.getElementById("admin-area").scrollIntoView();
  }
}

function setupProkerPage() {
  $("#proker-full-container").html(
    '<div class="col-12 text-center py-5"><div class="spinner-border text-primary"></div></div>',
  );

  $.getJSON(API_URL + "?action=get_struktur", function (resStruktur) {
    globalStruktur = resStruktur.data || [];

    $.getJSON(API_URL + "?action=get_proker", function (res) {
      let html = "";
      globalProker = res.data || [];

      if (!res.data || res.data.length === 0) {
        html =
          '<div class="col-12 text-center text-muted py-5">Belum ada program kerja.</div>';
      } else {
        res.data.forEach((i, idx) => {
          let badgeClass =
            i[3] === "Terlaksana"
              ? "success"
              : i[3] === "Berjalan"
                ? "primary"
                : "secondary";
          let iconStatus =
            i[3] === "Terlaksana"
              ? "fa-check-circle"
              : i[3] === "Berjalan"
                ? "fa-spinner fa-spin"
                : "fa-clipboard-list";

          let imgHTML = i[5]
            ? `<div style="height:150px; overflow:hidden;"><img src="${i[5]}" class="w-100 h-100 object-fit-cover"></div>`
            : `<div style="height:150px; background:#f8f9fa;" class="d-flex align-items-center justify-content-center text-muted"><i class="fas fa-tasks fa-3x opacity-25"></i></div>`;

          let namaPJ = i[4];
          let fotoPJ = "https://via.placeholder.com/150";

          let pengurus = globalStruktur.find((p) => p[1] === namaPJ);
          if (pengurus && pengurus[3]) {
            fotoPJ = pengurus[3];
          }

          let adminBtn = "";
          if (user && user.role === "admin") {
            adminBtn = `
                        <div class="mt-3 pt-3 border-top d-flex gap-2">
                            <button onclick="goToEditProker(${idx})" class="btn btn-sm btn-outline-warning flex-grow-1 rounded-pill"><i class="fas fa-edit"></i></button>
                            <button onclick="hapusData('delete_proker','${i[0]}')" class="btn btn-sm btn-outline-danger flex-grow-1 rounded-pill"><i class="fas fa-trash"></i></button>
                        </div>`;
          }

          html += `
                    <div class="col-md-6 col-lg-4 mb-4 animate-up" style="animation-delay: ${idx * 0.1}s">
                        <div class="card proker-card h-100 border-0 shadow-sm overflow-hidden">
                            ${imgHTML}
                            <div class="card-body d-flex flex-column p-4">
                                <div class="d-flex justify-content-between align-items-start mb-2">
                                    <span class="badge bg-${badgeClass}-subtle text-${badgeClass} rounded-pill px-3 py-2 border border-${badgeClass}-subtle">
                                        <i class="fas ${iconStatus} me-1"></i> ${i[3]}
                                    </span>
                                </div>
                                <h5 class="fw-bold text-dark mb-2">${i[1]}</h5>
                                <p class="text-muted small mb-3 flex-grow-1 line-clamp-3">${i[2]}</p>
                                
                                <div class="d-flex align-items-center bg-light p-2 rounded mb-3 border">
                                    <div class="me-2">
                                        <img src="${fotoPJ}" class="rounded-circle shadow-sm" width="40" height="40" style="object-fit:cover;">
                                    </div>
                                    <div>
                                        <small class="text-muted d-block" style="font-size: 0.65rem; line-height:1; letter-spacing:1px; text-transform:uppercase;">Penanggung Jawab</small>
                                        <span class="fw-bold text-dark small">${namaPJ || "-"}</span>
                                    </div>
                                </div>

                                <button onclick="bukaProkerDetail(${idx})" class="btn btn-primary w-100 rounded-pill btn-sm fw-bold">
                                    Lihat Detail <i class="fas fa-arrow-right ms-1"></i>
                                </button>
                                ${adminBtn}
                            </div>
                        </div>
                    </div>`;
        });
      }
      $("#proker-full-container").html(html);
    });
  });
}

function goToEditProker(index) {
  localStorage.setItem("edit_proker_data", JSON.stringify(globalProker[index]));
  window.location.href = "organisasi.html";
}

function setupForum() {
  loadForum();
  $("#form-thread").submit(function (e) {
    e.preventDefault();
    handlePost(this, "post_thread");
  });
  $("#form-comment").submit(function (e) {
    e.preventDefault();
    let data =
      $(this).serialize() +
      "&action=post_comment&email=" +
      user.email +
      "&nama=" +
      user.nama;
    let btn = $(this).find("button");
    btn.prop("disabled", true);
    $.post(API_URL, data, function (res) {
      $("#form-comment")[0].reset();
      loadComments($("#current-thread-id").val());
      btn.prop("disabled", false);
    });
  });
}

function loadForum() {
  $("#forum-container").html(
    '<div class="col-12 text-center py-3"><div class="spinner-border text-primary"></div></div>',
  );

  $.getJSON(API_URL + "?action=get_forum", function (r) {
    let html =
      !r.data || r.data.length === 0
        ? '<div class="alert alert-info text-center col-12 shadow-sm border-0 py-4"><i class="far fa-comments fa-2x mb-3"></i><br>Belum ada topik diskusi. Jadilah yang pertama!</div>'
        : "";

    if (r.data)
      r.data.forEach((i, idx) => {
        let badgeClass =
          i[3] === "Info Event"
            ? "danger"
            : i[3] === "Tanya Jawab"
              ? "success"
              : "primary";
        let iconClass =
          i[3] === "Info Event"
            ? "fa-calendar-check"
            : i[3] === "Tanya Jawab"
              ? "fa-question-circle"
              : "fa-comments";

        let displayName = i[6] ? i[6] : i[2].split("@")[0];
        let initial = displayName.charAt(0).toUpperCase();

        html += `
            <div class="col-12 mb-3 animate-up" style="animation-delay: ${idx * 0.05}s">
                <div class="card forum-card shadow-sm w-100 p-3 border-0">
                    <div class="d-flex align-items-start gap-3">
                        <div class="forum-avatar shadow-sm flex-shrink-0 bg-gradient-primary text-white">${initial}</div>
                        <div class="flex-grow-1">
                            <div class="d-flex justify-content-between align-items-center mb-1">
                                <h5 class="fw-bold text-dark mb-0 fs-6">${i[4]}</h5>
                                <span class="badge bg-${badgeClass}-subtle text-${badgeClass} rounded-pill border border-${badgeClass}-subtle" style="font-size:0.7rem">
                                    <i class="fas ${iconClass} me-1"></i> ${i[3]}
                                </span>
                            </div>
                            
                            <small class="text-muted d-block mb-2" style="font-size:0.75rem">
                                <i class="far fa-user me-1"></i> <span class="fw-bold text-dark">${displayName}</span> • ${new Date(i[1]).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                            </small>
                            
                            <p class="text-secondary small mb-3 line-clamp-3" style="line-height: 1.5;">${i[5]}</p>
                            
                            <button onclick="bukaDetail('${i[0]}','${i[4]}','${displayName}','${i[5].replace(/\n/g, " ")}')" class="btn btn-sm btn-outline-primary rounded-pill px-4">
                                <i class="far fa-comment-alt me-2"></i> Lihat Diskusi
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;
      });
    $("#forum-container").html(html);
  });
}

function loadComments(id) {
  $("#comments-list").html(
    '<div class="text-center py-2"><div class="spinner-border spinner-border-sm text-secondary"></div></div>',
  );
  $.getJSON(API_URL + "?action=get_comments&id_thread=" + id, function (r) {
    let h = "";
    if (r.data && r.data.length > 0) {
      r.data.forEach((c) => {
        let dateStr = new Date(c[2]).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        });
        let initial = c[3].charAt(0).toUpperCase();
        h += `
                <div class="d-flex gap-2 mb-3 animate-up">
                    <div class="bg-light rounded-circle flex-shrink-0 d-flex align-items-center justify-content-center text-secondary fw-bold border" style="width:32px; height:32px; font-size:0.8rem;">${initial}</div>
                    <div class="bg-light p-3 rounded-3 flex-grow-1 position-relative">
                        <div class="d-flex justify-content-between mb-1">
                            <small class="fw-bold text-dark">${c[3]}</small>
                            <small class="text-muted" style="font-size:0.7em">${dateStr}</small>
                        </div>
                        <p class="mb-0 text-dark small" style="line-height:1.4">${c[4]}</p>
                    </div>
                </div>`;
      });
    } else {
      h =
        '<p class="text-center text-muted small py-2">Belum ada komentar.</p>';
    }
    $("#comments-list").html(h);
  });
}

function setupLoker() {
  $.getJSON(API_URL + "?action=get_loker", function (res) {
    allLokerData = res.data || [];
    renderKategoriLoker();
  });
  $("#form-loker").submit(function (e) {
    e.preventDefault();
    if (!user) {
      alert("Login dulu!");
      window.location.href = "login.html";
      return;
    }
    let id = $("#loker-id").val();
    handlePost(this, id ? "update_loker" : "post_loker");
  });
}

function renderKategoriLoker() {
  let html = "";
  let countMap = {};
  allLokerData.forEach((job) => {
    let kat = job[7] || "Lainnya";
    countMap[kat] = (countMap[kat] || 0) + 1;
  });
  KATEGORI_LOKER.forEach((kat) => {
    let count = countMap[kat.name] || 0;
    html += `<div class="col-6 col-md-4 col-lg-3"><div class="card h-100 shadow-sm border-0 cat-card text-center p-3 hover-lift" onclick="bukaLokerByKategori('${kat.name}')"><div class="mx-auto cat-icon bg-${kat.color}-subtle text-${kat.color} rounded-circle mb-3 d-flex align-items-center justify-content-center" style="width:60px; height:60px; font-size:1.5rem"><i class="fas ${kat.icon}"></i></div><h6 class="fw-bold mb-1 text-dark" style="font-size: 0.9rem;">${kat.name}</h6><small class="text-muted">${count} Lowongan</small></div></div>`;
  });
  $("#view-kategori").html(html);
  $("#view-kategori").show();
  $("#view-list-loker").hide();
  $("#loker-page-title").text("Kategori Pekerjaan");
}

function bukaLokerByKategori(kategoriName) {
  let filteredJobs = allLokerData.filter(
    (job) => (job[7] || "Lainnya") === kategoriName,
  );
  let html = "";
  if (filteredJobs.length === 0) {
    html = `<div class="col-12 text-center text-muted py-5"><i class="far fa-folder-open fa-3x mb-3"></i><br>Belum ada lowongan di kategori ini.</div>`;
  } else {
    filteredJobs.forEach((job, idx) => {
      let badgeColor = job[4] == "Full-time" ? "success" : "warning";
      let btnAction = "",
        deskripsi = "";
      let imgHTML = job[8]
        ? `<img src="${job[8]}" class="card-img-top" style="height: 180px; object-fit: cover;">`
        : "";

      let adminBtn = "";
      if (user && user.role === "admin") {
        adminBtn = `<div class="mt-2 d-flex gap-2"><button onclick="editLoker('${job[0]}')" class="btn btn-sm btn-warning w-50">Edit</button><button onclick="hapusData('delete_loker','${job[0]}')" class="btn btn-sm btn-danger w-50">Hapus</button></div>`;
      }

      if (user) {
        let linkUrl =
          job[6] && job[6] !== "-" && job[6] !== "#" ? job[6] : null;
        btnAction = linkUrl
          ? `<a href="${linkUrl}" target="_blank" class="btn btn-outline-primary w-100 rounded-pill">Lamar Sekarang</a>`
          : `<button class="btn btn-secondary w-100 rounded-pill" disabled>Info via DM/Email</button>`;
        deskripsi = `<p class="card-text small mt-3 text-muted" style="white-space: pre-line;">${job[5]}</p>`;
      } else {
        btnAction = `<a href="login.html" class="btn btn-primary w-100 rounded-pill"><i class="fas fa-lock me-2"></i>Login untuk Melamar</a>`;
        deskripsi = `<div class="p-3 bg-light rounded mt-3 text-center border"><small class="text-muted"><i class="fas fa-eye-slash me-1"></i> Rincian disembunyikan.</small></div>`;
      }
      html += `<div class="col-12 col-md-6 mb-4 animate-up"><div class="card h-100 shadow-sm border-0 overflow-hidden">${imgHTML}<div class="card-body d-flex flex-column"><div class="d-flex justify-content-between align-items-start mb-2"><div><h5 class="card-title fw-bold text-dark mb-1">${job[2]}</h5><h6 class="card-subtitle text-primary mb-2"><i class="fas fa-building me-1"></i> ${job[3]}</h6><span class="badge bg-${badgeColor}-subtle text-${badgeColor} border border-${badgeColor} rounded-pill">${job[4]}</span></div></div>${deskripsi}<div class="mt-auto pt-3">${btnAction} ${adminBtn}</div></div><div class="card-footer bg-white text-muted small border-top-0"><i class="far fa-clock me-1"></i> Diposting: ${new Date(job[1]).toLocaleDateString()}</div></div></div>`;
    });
  }
  $("#loker-container").html(html);
  $("#view-kategori").hide();
  $("#view-list-loker").fadeIn();
  $("#loker-page-title").html(
    `<span class="text-muted fw-light">Kategori:</span> ${kategoriName}`,
  );
  window.scrollTo(0, 0);
}

function editLoker(id) {
  let data = allLokerData.find((j) => j[0] == id);
  if (data) {
    $("#loker-id").val(data[0]);
    $("input[name='posisi']").val(data[2]);
    $("input[name='perusahaan']").val(data[3]);
    $("select[name='tipe']").val(data[4]);
    $("textarea[name='deskripsi']").val(data[5]);
    $("input[name='link']").val(data[6]);
    $("select[name='kategori']").val(data[7]);
    $("input[name='foto']").val(data[8]);
    $("#form-loker button[type='submit']")
      .text("Update Loker")
      .removeClass("btn-primary")
      .addClass("btn-warning");
    new bootstrap.Modal("#modalLoker").show();
  }
}

function setupDirektori() {
  $("#alumni-list").html(
    '<div class="col-12 text-center py-5"><div class="spinner-border text-primary"></div><p class="mt-2 text-muted">Mengambil data alumni...</p></div>',
  );

  $.getJSON(API_URL + "?action=get_alumni", function (res) {
    allAlumniData = res.data || [];
    renderAlumniList(allAlumniData);
  });

  $(".floating-search button").click(function () {
    lakukanPencarian();
  });

  $("#search-input").on("keyup", function () {
    lakukanPencarian();
  });
}

function lakukanPencarian() {
  let keyword = $("#search-input").val().toLowerCase();

  let hasilFilter = allAlumniData.filter((alumni) => {
    return (
      (alumni.nama && alumni.nama.toLowerCase().includes(keyword)) ||
      (alumni.nim && alumni.nim.toString().includes(keyword)) ||
      (alumni.pekerjaan && alumni.pekerjaan.toLowerCase().includes(keyword)) ||
      (alumni.skill && alumni.skill.toLowerCase().includes(keyword)) ||
      (alumni.tahun && alumni.tahun.toString().includes(keyword))
    );
  });

  renderAlumniList(hasilFilter);
}

function renderAlumniList(data) {
  let html = "";

  if (data.length === 0) {
    html = `
        <div class="col-12 text-center py-5 animate-up">
            <i class="fas fa-search fa-3x text-muted mb-3"></i>
            <h5 class="text-muted">Data tidak ditemukan.</h5>
            <p class="small text-secondary">Coba kata kunci lain.</p>
        </div>`;
  } else {
    data.forEach((alumni) => {
      if (user) {
        let skills = alumni.skill
          ? alumni.skill
              .split(",")
              .map(
                (s) =>
                  `<span class="badge bg-light text-dark border me-1 mb-1">${s.trim()}</span>`,
              )
              .join("")
          : "";
        let linkedinBtn =
          alumni.linkedin && alumni.linkedin !== "#" && alumni.linkedin !== "-"
            ? `<a href="${alumni.linkedin}" target="_blank" class="btn btn-sm btn-outline-primary rounded-pill w-100 mt-2"><i class="fab fa-linkedin"></i> Connect</a>`
            : "";

        html += `
                <div class="col-md-4 mb-4 item-alumni animate-up">
                    <div class="card alumni-card p-3 h-100 text-center shadow-sm">
                        <div class="alumni-img-wrapper">
                            <img src="${alumni.foto}" class="alumni-img">
                        </div>
                        <h5 class="fw-bold mb-0 text-dark">${alumni.nama}</h5>
                        <small class="text-muted d-block" style="font-size:0.85rem">NIM: ${alumni.nim}</small> 
                        <small class="text-primary fw-bold mb-2 d-block">${alumni.pekerjaan || "Alumni"}</small>
                        <span class="badge bg-info text-dark mb-3 rounded-pill">Angkatan ${alumni.tahun}</span>
                        <div class="mb-2 text-wrap">${skills}</div>
                        <div class="mt-auto">${linkedinBtn}</div>
                    </div>
                </div>`;
      } else {
        html += `
                <div class="col-md-4 mb-4 item-alumni animate-up">
                    <div class="card p-3 h-100 text-center bg-light border-0">
                        <div class="rounded-circle bg-secondary mx-auto mb-3" style="width:70px; height:70px; opacity:0.2"></div>
                        <h5 class="fw-bold mb-0 text-muted">Alumni ${alumni.tahun}</h5>
                        <small class="text-muted d-block mb-3">Nama Disembunyikan</small>
                        <a href="login.html" class="btn btn-sm btn-outline-secondary rounded-pill">Login untuk Kontak</a>
                    </div>
                </div>`;
      }
    });
  }

  $("#alumni-list").html(html);
}

function setupProfil() {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  $('input[name="nama"]').val(user.nama);
  $('input[name="email"]').val(user.email);
  $('input[name="nim"]').val(user.nim);
  $('input[name="tahun"]').val(user.tahun);
  $('input[name="pekerjaan"]').val(user.pekerjaan);
  $('input[name="linkedin"]').val(user.linkedin);
  $('input[name="foto"]').val(user.foto);
  $('input[name="skill"]').val(user.skill);
  $("#form-profil").submit(function (e) {
    e.preventDefault();
    handlePost(this, "update_profile");
  });
}

function setupAuthForms() {
  $("#form-login").submit(function (e) {
    e.preventDefault();
    handleAuth(this, "login");
  });
  $("#form-register").submit(function (e) {
    e.preventDefault();
    let email = $('input[name="email"]').val().trim();
    let nim = $('input[name="nim"]').val().trim();
    if (!/^\d{11}@uniku\.ac\.id$/.test(email)) {
      alert("Email harus: [NIM 11 digit]@uniku.ac.id");
      return;
    }
    if (email.split("@")[0] !== nim) {
      alert("NIM di email tidak sama dengan NIM yang diinput!");
      return;
    }
    handleAuth(this, "register");
  });
}

function handlePost(form, action) {
  if (!confirm("Proses data?")) return;
  const btn = $(form).find("button[type='submit']");
  const originalText = btn.text();
  btn.prop("disabled", true).text("Memproses...");
  let data =
    $(form).serialize() +
    "&action=" +
    action +
    (user ? "&email=" + user.email : "");

  $.post(API_URL, data, function (res) {
    if (res.status === "success") {
      alert(res.message);
      if (res.user) {
        localStorage.setItem("user_alumni", JSON.stringify(res.user));
      }

      location.reload();
    } else {
      alert("Gagal: " + res.message);
      btn.prop("disabled", false).text(originalText);
    }
  }).fail(function () {
    alert("Terjadi kesalahan jaringan.");
    btn.prop("disabled", false).text(originalText);
  });
}

function handleAuth(form, action) {
  const btn = $(form).find("button");
  const originalText = btn.text();
  btn.prop("disabled", true).text("Mohon Tunggu...");
  $.post(API_URL, $(form).serialize() + "&action=" + action, function (res) {
    if (res.status === "success") {
      if (action === "login")
        localStorage.setItem("user_alumni", JSON.stringify(res.user));
      alert(res.message);
      window.location.href = action === "login" ? "index.html" : "login.html";
    } else {
      alert(res.message);
      btn.prop("disabled", false).text(originalText);
    }
  });
}

function logout() {
  localStorage.removeItem("user_alumni");
  window.location.href = "index.html";
}

function hapusData(action, id) {
  if (confirm("Yakin ingin menghapus data ini?"))
    $.post(API_URL, { action: action, id: id }, function () {
      location.reload();
    });
}

function bukaDetail(id, t, a, c) {
  $("#detail-judul").text(t);
  $("#detail-isi").text(c);
  $("#current-thread-id").val(id);
  new bootstrap.Modal("#modalDetail").show();
  loadComments(id);
}

function bukaProkerDetail(index) {
  let data = globalProker[index];
  $("#proker-judul").text(data[1]);
  $("#proker-isi").text(data[2]);
  $("#proker-pj-detail").text(data[4]);
  $("#proker-status-detail").text(data[3]);

  let badgeClass =
    data[3] === "Terlaksana"
      ? "bg-success text-white"
      : data[3] === "Berjalan"
        ? "bg-primary text-white"
        : "bg-secondary text-white";
  $("#proker-status-detail")
    .removeClass()
    .addClass("badge px-3 py-2 border " + badgeClass);

  if (data[5]) {
    $("#proker-gambar").attr("src", data[5]).show();
  } else {
    $("#proker-gambar").hide();
  }
  new bootstrap.Modal("#modalProkerDetail").show();
}

function bukaBerita(i) {
  let d = globalBerita[i];
  if (d) {
    $("#berita-judul").text(d[2]);
    $("#berita-isi").html(d[4].replace(/\n/g, "<br>"));
    $("#berita-gambar").attr("src", d[5] || "");
    new bootstrap.Modal("#modalBerita").show();
  }
}

function bukaEvent(i) {
  let d = globalEvents[i];
  if (d) {
    $("#event-judul").text(d[1]);
    $("#event-tanggal").text(
      new Date(d[2]).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    );
    $("#event-lokasi").text(d[3]);
    $("#event-deskripsi").html(d[4] ? d[4].replace(/\n/g, "<br>") : "-");
    if (d[5]) {
      $("#event-gambar").attr("src", d[5]).show();
    } else {
      $("#event-gambar").hide();
    }
    new bootstrap.Modal("#modalEvent").show();
  }
}

function resetFormProker() {
  $("#form-proker")[0].reset();
  $("#proker-id").val("");
  $("#btn-save-proker")
    .text("Simpan Proker")
    .removeClass("btn-warning")
    .addClass("btn-info");
  $("#btn-cancel-proker").hide();
}
function resetFormBerita() {
  $("#form-berita")[0].reset();
  $("#berita-id").val("");
  $("#btn-save-berita")
    .text("Terbitkan Berita")
    .removeClass("btn-warning")
    .addClass("btn-danger");
  $("#btn-cancel-berita").hide();
}
function resetFormEvent() {
  $("#form-event")[0].reset();
  $("#event-id").val("");
  $("#btn-save-event")
    .text("Simpan Event")
    .removeClass("btn-warning")
    .addClass("btn-primary");
  $("#btn-cancel-event").hide();
}
function resetFormStruktur() {
  $("#form-struktur")[0].reset();
  $("#struktur-id").val("");
  $("#btn-save-struktur")
    .text("Simpan Pengurus")
    .removeClass("btn-warning")
    .addClass("btn-success");
  $("#btn-cancel-struktur").hide();
}
function kembaliKeKategori() {
  $("#view-list-loker").hide();
  $("#view-kategori").fadeIn();
  $("#loker-page-title").text("Kategori Pekerjaan");
}

(function () {
  const container = document.getElementById("home-berita-container");
  const slider = document.getElementById("news-scroll-slider");
  let isDraggingSlider = false;

  if (!container || !slider) return;

  function updateSliderMax() {
    const maxScroll = container.scrollWidth - container.clientWidth;
    slider.max = maxScroll > 0 ? maxScroll : 0;

    if (!isDraggingSlider) {
      slider.value = container.scrollLeft;
    }

    slider.style.display = maxScroll > 0 ? "block" : "none";
  }

  slider.addEventListener("mousedown", () => {
    isDraggingSlider = true;
  });
  slider.addEventListener("touchstart", () => {
    isDraggingSlider = true;
  });

  slider.addEventListener("mouseup", () => {
    isDraggingSlider = false;
  });
  slider.addEventListener("touchend", () => {
    isDraggingSlider = false;
  });

  slider.addEventListener("input", function () {
    container.scrollLeft = this.value;
  });

  container.addEventListener("scroll", function () {
    if (!isDraggingSlider) {
      slider.value = this.scrollLeft;
    }
  });

  updateSliderMax();
  window.addEventListener("resize", updateSliderMax);

  let checkCount = 0;
  const checkInterval = setInterval(() => {
    updateSliderMax();
    checkCount++;
    if (checkCount > 5) clearInterval(checkInterval);
  }, 1000);
})();

function goToEditBerita(index) {
  localStorage.setItem("edit_berita_data", JSON.stringify(globalBerita[index]));
  window.location.href = "organisasi.html";
}
