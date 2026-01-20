const API_URL =
  "https://script.google.com/macros/s/AKfycby8H1-tf80xeQuQ2FOrfxvN2oYSM3ju-SRdbLpPWXNeL1W_arLLhxrR8YhWf9FNCbtO_A/exec";

const user = JSON.parse(localStorage.getItem("user_alumni"));
const pageId = $("body").attr("id");
let globalBerita = [];
let globalEvents = [];

//Hasbi
$(document).ready(function () {
  renderNavbar();
  if (pageId === "page-home") setupDashboard();
  if (pageId === "page-organisasi") setupOrganisasi();
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
  let html = `<li class="nav-item"><a class="nav-link ${isActive("page-home")}" href="index.html">Dashboard</a></li><li class="nav-item"><a class="nav-link ${isActive("page-organisasi")}" href="organisasi.html">Organisasi</a></li><li class="nav-item"><a class="nav-link ${isActive("page-alumni")}" href="alumni.html">Direktori</a></li><li class="nav-item"><a class="nav-link ${isActive("page-loker")}" href="loker.html">Bursa Kerja</a></li>`;
  if (user) {
    html += `<li class="nav-item"><a class="nav-link ${isActive("page-forum")}" href="forum.html">Forum</a></li><li class="nav-item dropdown ms-lg-3"><a class="nav-link dropdown-toggle d-flex align-items-center" href="#" data-bs-toggle="dropdown"><img src="${user.foto}" class="rounded-circle border border-2 border-white" width="35" height="35" style="object-fit:cover;"></a><ul class="dropdown-menu dropdown-menu-end shadow mt-2"><li class="dropdown-header text-primary fw-bold">${user.nama}</li><li><a class="dropdown-item" href="profil.html"><i class="fas fa-user-edit me-2"></i> Edit Profil</a></li><li><hr class="dropdown-divider"></li><li><a class="dropdown-item text-danger" href="#" onclick="logout()"><i class="fas fa-sign-out-alt me-2"></i> Logout</a></li></ul></li>`;
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
    let html =
      !res.data || res.data.length === 0
        ? '<li class="list-group-item text-center small text-muted py-4">Belum ada agenda.</li>'
        : "";
    globalEvents = res.data || [];
    if (res.data)
      res.data.slice(0, 3).forEach((evt, i) => {
        html += `<li class="list-group-item p-3"><div class="d-flex justify-content-between align-items-start"><div><h6 class="mb-1 fw-bold text-dark">${evt[1]}</h6><small class="text-muted"><i class="fas fa-map-marker-alt text-danger"></i> ${evt[3]}</small></div><div class="text-end"><small class="text-danger fw-bold d-block">${new Date(evt[2]).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</small><small class="text-muted" style="font-size:0.75rem">${new Date(evt[2]).getFullYear()}</small></div></div><button class="btn btn-sm btn-light text-primary w-100 mt-3 fw-bold btn-view-event" data-index="${i}" style="font-size:0.85rem; background-color: #f8f9fa;">Info Selengkapnya <i class="fas fa-arrow-right ms-1"></i></button></li>`;
      });
    $("#home-events-container").html(html);
  });
  $.getJSON(API_URL + "?action=get_berita", function (res) {
    let html = "";
    globalBerita = res.data || [];
    if (!globalBerita.length)
      html =
        '<div class="col-12 text-center text-muted">Belum ada berita.</div>';
    else {
      globalBerita.slice(0, 3).forEach((news, index) => {
        let imgUrl =
          news[5] || "https://via.placeholder.com/400x200?text=Berita+SI";
        html += `<div class="col-md-4"><div class="card h-100 shadow-sm border-0"><img src="${imgUrl}" class="card-img-top" style="height:200px; object-fit:cover;"><div class="card-body d-flex flex-column"><div class="d-flex justify-content-between mb-2"><span class="badge bg-primary">${news[3]}</span><small class="text-muted">${new Date(news[1]).toLocaleDateString()}</small></div><h5 class="card-title fw-bold text-truncate">${news[2]}</h5><p class="card-text small text-muted text-truncate">${news[4]}</p><div class="mt-auto"><button class="btn btn-sm btn-outline-primary mt-2 w-100 btn-view-berita" data-index="${index}">Lihat Selengkapnya</button></div></div></div></div>`;
      });
    }
    $("#home-berita-container").html(html);
  });
  $.getJSON(API_URL + "?action=get_loker", function (res) {
    let html = "";
    if (!res.data || res.data.length === 0)
      html =
        '<div class="card shadow-sm border-0"><div class="card-body text-center text-muted py-4">Belum ada info loker.</div></div>';
    else {
      res.data.slice(0, 3).forEach((job) => {
        let badgeColor = job[4] == "Full-time" ? "success" : "warning";
        let actionLink = user
          ? `<a href="loker.html" class="btn btn-sm btn-light text-primary w-100 mt-2 fw-bold" style="background:#eef2ff">Lihat Detail <i class="fas fa-arrow-right"></i></a>`
          : `<a href="login.html" class="btn btn-sm btn-light text-muted w-100 mt-2"><i class="fas fa-lock"></i> Login untuk Detail</a>`;
        html += `<div class="card mb-3 border-0 shadow-sm"><div class="card-body"><div class="d-flex justify-content-between align-items-start"><div><h6 class="fw-bold text-dark mb-1">${job[2]}</h6><small class="text-muted"><i class="far fa-building"></i> ${job[3]}</small></div><span class="badge bg-${badgeColor}-subtle text-${badgeColor} border border-${badgeColor}">${job[4]}</span></div>${actionLink}</div></div>`;
      });
    }
    $("#home-loker-summary").html(html);
  });
}

// Nandi
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
    $.post(API_URL, data, function (res) {
      $("#form-comment")[0].reset();
      loadComments($("#current-thread-id").val());
    });
  });
}

function loadForum() {
  $("#forum-container").html(
    '<div class="text-center py-3"><div class="spinner-border text-primary"></div></div>',
  );

  $.getJSON(API_URL + "?action=get_forum", function (r) {
    let html = "";
    if (!r.data || r.data.length === 0) {
      html =
        '<div class="alert alert-info text-center">Belum ada topik diskusi. Mulailah membuat topik baru!</div>';
    } else {
      r.data.forEach((i) => {
        let badgeClass = "secondary";
        if (i[3] === "Info Event") badgeClass = "danger";
        else if (i[3] === "Tanya Jawab") badgeClass = "success";
        else if (i[3] === "Diskusi Umum") badgeClass = "primary";

        // w-100 agar kartu memenuhi lebar kontainer induk
        html += `
                <div class="card mb-3 border-0 shadow-sm w-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="badge bg-${badgeClass}">${i[3]}</span>
                            <small class="text-muted" style="font-size: 0.75rem">${new Date(i[1]).toLocaleDateString()}</small>
                        </div>
                        <h5 class="fw-bold text-dark mb-2">${i[4]}</h5>
                        <p class="text-muted small text-truncate mb-3">${i[5]}</p>
                        <button onclick="bukaDetail('${i[0]}','${i[4]}','${i[2]}','${i[5].replace(/\n/g, " ")}')" class="btn btn-sm btn-outline-primary w-100">
                            Lihat Diskusi <i class="fas fa-arrow-right ms-1"></i>
                        </button>
                    </div>
                </div>`;
      });
    }
    $("#forum-container").html(html);
  });
}

// Adi
function setupDirektori() {
  $.getJSON(API_URL + "?action=get_alumni", function (res) {
    let html = "";
    res.data.forEach((alumni) => {
      if (user) {
        let skills = alumni.skill
          ? alumni.skill
              .split(",")
              .map(
                (s) =>
                  `<span class="badge bg-light text-dark border me-1">${s}</span>`,
              )
              .join("")
          : "";
        let linkedinBtn =
          alumni.linkedin && alumni.linkedin !== "#" && alumni.linkedin !== "-"
            ? `<a href="${alumni.linkedin}" target="_blank" class="btn btn-sm btn-outline-primary w-100 mt-2"><i class="fab fa-linkedin"></i> Connect</a>`
            : "";

        html += `
                <div class="col-md-4 mb-4 item-alumni animate-up">
                    <div class="card p-3 h-100 text-center border-0 shadow-sm">
                        <img src="${alumni.foto}" class="rounded-circle mx-auto mb-3" width="70" height="70" style="object-fit:cover">
                        <h5 class="fw-bold mb-0">${alumni.nama}</h5>
                        <small class="text-muted d-block" style="font-size:0.85rem">NIM: ${alumni.nim}</small> <small class="text-primary fw-bold mb-2 d-block">${alumni.pekerjaan || "Alumni"}</small>
                        <span class="badge bg-info text-dark mb-3">Angkatan ${alumni.tahun}</span>
                        <div class="mb-2">${skills}</div>
                        <div class="mt-auto">${linkedinBtn}</div>
                    </div>
                </div>`;
      } else {
        html += `<div class="col-md-4 mb-4 item-alumni"><div class="card p-3 h-100 text-center bg-light border-0"><div class="rounded-circle bg-secondary mx-auto mb-3" style="width:70px; height:70px; opacity:0.2"></div><h5 class="fw-bold mb-0 text-muted">Alumni ${alumni.tahun}</h5><small class="text-muted d-block mb-3">Nama Disembunyikan</small><a href="login.html" class="btn btn-sm btn-outline-secondary rounded-pill">Login untuk Kontak</a></div></div>`;
      }
    });
    $("#alumni-list").html(html);
  });
}

// Nandi
function setupOrganisasi() {
  $.getJSON(API_URL + "?action=get_struktur", function (res) {
    let html = "";
    if (res.data)
      res.data.forEach((i) => {
        // i[0]=id, i[1]=nama, i[2]=jabatan, i[3]=foto, i[4]=urutan, i[5]=email, i[6]=NIM
        let adminControls =
          user && user.role === "admin"
            ? `<div class="mt-2"><button onclick="editStruktur('${i[0]}','${i[1]}','${i[2]}','${i[4]}','${i[3]}','${i[5] || ""}','${i[6] || ""}')" class="btn btn-sm btn-warning text-white me-1"><i class="fas fa-edit"></i></button><button onclick="hapusData('delete_struktur','${i[0]}')" class="btn btn-sm btn-danger"><i class="fas fa-trash"></i></button></div>`
            : "";

        html += `
            <div class="col-6 col-md-3 text-center mb-4">
                <img src="${i[3] || "https://via.placeholder.com/150"}" class="rounded-circle mb-2 shadow-sm" width="80" height="80" style="object-fit:cover;">
                <h6 class="fw-bold mb-0">${i[1]}</h6>
                <small class="text-muted d-block" style="font-size:0.75rem">${i[6] || "-"}</small> <span class="badge bg-primary mb-1">${i[2]}</span>
                ${adminControls}
            </div>`;
      });
    $("#struktur-container").html(html);
  });
  $.getJSON(API_URL + "?action=get_proker", function (res) {
    let html = "";
    if (res.data)
      res.data.forEach((i) => {
        html += `<tr><td>${i[1]}</td><td>${i[2]}</td><td><span class="badge bg-success">${i[3]}</span></td></tr>`;
      });
    $("#proker-container").html(html);
  });
  if (user && user.role === "admin") {
    $("#admin-area").show();
    // Handle Submit Struktur (Include NIM)
    $("#form-struktur").submit(function (e) {
      e.preventDefault();
      let id = $("#struktur-id").val();
      handlePost(this, id ? "update_struktur" : "post_struktur");
    });
    $("#form-event").submit(function (e) {
      e.preventDefault();
      handlePost(this, "post_event");
    });
    $("#form-proker").submit(function (e) {
      e.preventDefault();
      handlePost(this, "post_proker");
    });
    $("#form-berita").submit(function (e) {
      e.preventDefault();
      handlePost(this, "post_berita");
    });
  }
}

//Nandi
function editStruktur(id, nama, jabatan, urutan, foto, email, nim) {
  document.getElementById("admin-area").scrollIntoView({ behavior: "smooth" });
  var tab = new bootstrap.Tab(
    document.querySelector('#adminTab button[data-bs-target="#tab-struktur"]'),
  );
  tab.show();
  $("#struktur-id").val(id);
  $("#str-nama").val(nama);
  $("#str-jabatan").val(jabatan);
  $("#str-urutan").val(urutan);
  $("#str-foto").val(foto);
  $("#str-email").val(email);
  $("#str-nim").val(nim); // Isi NIM
  $("#btn-save-struktur")
    .text("Update")
    .removeClass("btn-success")
    .addClass("btn-warning");
  $("#btn-cancel-struktur").show();
}

function resetFormStruktur() {
  $("#form-struktur")[0].reset();
  $("#struktur-id").val("");
  $("#btn-save-struktur")
    .text("Simpan")
    .removeClass("btn-warning")
    .addClass("btn-success");
  $("#btn-cancel-struktur").hide();
}

// Hasbi
function setupLoker() {
  $.getJSON(API_URL + "?action=get_loker", function (res) {
    let html = "";
    if (!res.data || res.data.length === 0)
      html =
        '<div class="col-12 text-center text-muted">Belum ada lowongan.</div>';
    else {
      res.data.forEach((job) => {
        let badgeColor = job[4] == "Full-time" ? "success" : "warning";
        let btnAction = "",
          deskripsi = "";

        if (user) {
          let linkUrl =
            job[6] && job[6] !== "-" && job[6] !== "#" ? job[6] : null;
          btnAction = linkUrl
            ? `<a href="${linkUrl}" target="_blank" class="btn btn-outline-primary w-100">Lamar Sekarang</a>`
            : `<button class="btn btn-secondary w-100" disabled>Info via DM/Email</button>`;
          deskripsi = `<p class="card-text small mt-3 text-muted" style="white-space: pre-line;">${job[5]}</p>`;
        } else {
          btnAction = `<a href="login.html" class="btn btn-primary w-100"><i class="fas fa-lock me-2"></i>Login untuk Melamar</a>`;
          deskripsi = `<div class="p-3 bg-light rounded mt-3 text-center"><small class="text-muted"><i class="fas fa-eye-slash me-1"></i> Rincian disembunyikan.</small></div>`;
        }

        // col-12: Di HP dia ambil 1 baris penuh.
        // col-md-6: Di Laptop dia ambil setengah (2 kolom).
        html += `
                <div class="col-12 col-md-6 mb-4">
                    <div class="card h-100 shadow-sm border-0">
                        <div class="card-body d-flex flex-column">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                    <h5 class="card-title fw-bold text-dark mb-1">${job[2]}</h5>
                                    <h6 class="card-subtitle text-primary"><i class="fas fa-building me-1"></i> ${job[3]}</h6>
                                </div>
                                <span class="badge bg-${badgeColor}">${job[4]}</span>
                            </div>
                            ${deskripsi}
                            <div class="mt-auto pt-3">${btnAction}</div>
                        </div>
                        <div class="card-footer bg-white text-muted small border-top-0">
                            <i class="far fa-clock me-1"></i> Diposting: ${new Date(job[1]).toLocaleDateString()}
                        </div>
                    </div>
                </div>`;
      });
    }
    $("#loker-container").html(html);
  });

  $("#form-loker").submit(function (e) {
    e.preventDefault();
    if (!user) {
      alert("Login dulu!");
      window.location.href = "login.html";
      return;
    }
    handlePost(this, "post_loker");
  });
}

//Adi
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
  const btn = $(form).find("button");
  btn.prop("disabled", true).text("Processing...");
  let data =
    $(form).serialize() +
    "&action=" +
    action +
    (user ? "&email=" + user.email : "");
  $.post(API_URL, data, function (res) {
    alert(res.message);
    location.reload();
  });
}
function handleAuth(form, action) {
  const btn = $(form).find("button");
  btn.prop("disabled", true);
  $.post(API_URL, $(form).serialize() + "&action=" + action, function (res) {
    if (res.status === "success") {
      if (action === "login")
        localStorage.setItem("user_alumni", JSON.stringify(res.user));
      alert(res.message);
      window.location.href = action === "login" ? "index.html" : "login.html";
    } else {
      alert(res.message);
      btn.prop("disabled", false);
    }
  });
}
function logout() {
  localStorage.removeItem("user_alumni");
  window.location.href = "index.html";
}

//hapus data
function hapusData(action, id) {
  if (confirm("Hapus?"))
    $.post(API_URL, { action: action, id: id }, function () {
      location.reload();
    });
}

//Nandi
function bukaDetail(id, t, a, c) {
  $("#detail-judul").text(t);
  $("#detail-isi").text(c);
  $("#current-thread-id").val(id);
  new bootstrap.Modal("#modalDetail").show();
  loadComments(id);
}
function loadComments(id) {
  $.getJSON(API_URL + "?action=get_comments&id_thread=" + id, function (r) {
    let h = "";
    if (r.data)
      r.data.forEach((c) => {
        h += `<div class="alert alert-light p-2 mb-1"><small class="fw-bold text-primary">${c[3]}</small><p class="mb-0 text-dark small">${c[4]}</p></div>`;
      });
    $("#comments-list").html(h);
  });
}

//hasbi
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
    $("#event-tanggal").text(new Date(d[2]).toLocaleDateString());
    $("#event-lokasi").text(d[3]);
    $("#event-deskripsi").html(d[4] ? d[4].replace(/\n/g, "<br>") : "-");
    new bootstrap.Modal("#modalEvent").show();
  }
}
