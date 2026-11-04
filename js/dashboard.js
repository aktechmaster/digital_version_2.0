/**
 * js/dashboard.js - Dynamic Menu Renderer & Dashboard Logic
 */

const MENU_CATALOG = [
  // A. UMUM (SEMUA GURU)
  { id: "jurnal_harian", title: "Jurnal Harian", desc: "Klik untuk input jurnal harian KBM.", icon: "📅", accent: "blue", permission: "always", link: "https://aktechmaster.github.io/SMP_Jurnal-Mengajar-Harian-New/" },
  { id: "jadwal_mengajar", title: "Jadwal Mengajar", desc: "Cek jadwal KBM Anda hari ini.", icon: "⌚", accent: "blue", permission: "always", modal: "modalJadwal" },
  { id: "laporan_kinerja", title: "Laporan Kinerja", desc: "Klik untuk melihat statistik: Jurnal, Piket, dan Absensi.", icon: "📊", accent: "orange", permission: "always", modal: "modalKinerja" },
  { id: "biodata_guru", title: "Biodata Guru", desc: "Klik untuk melihat data pribadi & kepegawaian.", icon: "👤", accent: "green", permission: "always", modal: "modalBiodata" },
  { id: "input_nilai", title: "Input Nilai", desc: "Klik untuk rekap nilai siswa.", icon: "📋", accent: "cyan", permission: "always", link: "https://google.com" },
  { id: "pusat_laporan", title: "Menuju Pusat Laporan", desc: "Lihat semua rekap & laporan terpusat.", icon: "🏠", accent: "cyan", permission: "always", link: "https://google.com" },
  { id: "jurnal_perilaku", title: "Jurnal Perilaku & Sikap", desc: "Khusus Guru & Wali Kelas.", icon: "📓", accent: "purple", permission: "always", link: "https://google.com" },

  // B. KHUSUS 1
  { id: "jurnal_t2q", title: "Jurnal T2Q", desc: "Tahsin & Tahfidz Al-Qur'an.", icon: "📖", accent: "purple", permission: "is_t2q", link: "https://google.com" },
  { id: "jurnal_bpi", title: "Jurnal BPI", desc: "Klik untuk input laporan Bina Pribadi Islam.", icon: "☪️", accent: "purple", permission: "is_bpi", link: "https://google.com" },
  { id: "jurnal_ekstra", title: "Jurnal Ekstra", desc: "Khusus Pembina Ekstrakurikuler.", icon: "⚽", accent: "blue", permission: "is_ekstra", link: "https://google.com" },

  // C. KHUSUS 2 (WAKUR)
  { id: "absensi_karyawan", title: "Absensi Karyawan", desc: "Khusus Waka Kurikulum.", icon: "📋", accent: "cyan", permission: "is_wakur", link: "https://google.com" },
  { id: "input_piket", title: "Input Piket", desc: "Khusus Waka Kurikulum & PMA.", icon: "✍️", accent: "orange", permission: "is_wakur", link: "https://google.com" },
  { id: "laporan_piket", title: "Laporan Piket", desc: "Rekap data piket harian.", icon: "📊", accent: "green", permission: "is_wakur", link: "https://google.com" },

  // D. KHUSUS WALI KELAS
  { id: "absensi_siswa", title: "Absensi Siswa", desc: "Rekap kehadiran siswa harian.", icon: "📝", accent: "cyan", permission: "is_wali_kelas", link: "https://google.com" },
  { id: "nilai_karakter", title: "Input Nilai Karakter", desc: "Khusus Wali Kelas.", icon: "🌟", accent: "orange", permission: "is_wali_kelas", link: "https://google.com" }
];

document.addEventListener("DOMContentLoaded", () => {
  Auth.requireAuth();
  const session = Auth.getSession();

  renderCurrentDate();
  renderWelcomeCard(session);
  renderMenuGrid();
  setupDropdownMenu();
  setupProfilePhotoUpload(session);
});

function renderCurrentDate() {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const today = new Date().toLocaleDateString('id-ID', options);
  document.getElementById("currentDateDisplay").innerText = today;
}

function renderWelcomeCard(session) {
  const namaLengkap = session.nama_lengkap || session.username || "Guru";
  const nipy = session.nip_nik || "-";
  const jabatan = session.jabatan || session.role || "Guru Mata Pelajaran";

  document.getElementById("userFullName").innerText = namaLengkap;
  document.getElementById("userNip").innerText = `NIPY: ${nipy}`;
  document.getElementById("userRoleTitle").innerText = jabatan;

  // PRIORITAS SINKRONISASI FOTO:
  // 1. Baca foto_profil dari Database (Sesi)
  // 2. Fallback ke LocalStorage
  const savedPhoto = session.foto_profil || localStorage.getItem(`profile_pic_${session.username}`);
  if (savedPhoto) {
    document.getElementById("userAvatar").src = savedPhoto;
  }
}

function setupProfilePhotoUpload(session) {
  const avatarImg = document.getElementById("userAvatar");
  const uploadInput = document.getElementById("upload-foto");

  if (!avatarImg || !uploadInput) return;

  avatarImg.addEventListener("click", () => {
    uploadInput.click();
  });

  uploadInput.addEventListener("change", function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const originalSrc = avatarImg.src;
    avatarImg.src = "https://via.placeholder.com/100?text=Uploading...";

    const reader = new FileReader();
    reader.onload = function(e) {
      const base64Data = e.target.result.split(',')[1];
      
      const gasUrl = 'https://script.google.com/macros/s/AKfycbxaR1H9owIIS3jTUK-4RjJuyCsTXRAw6sMq9nDh7d8mW7JFRrMnQh5ih3wRYC4y9PPM/exec';

      fetch(gasUrl, {
        method: 'POST',
        body: JSON.stringify({
          fileName: `Profile_${session.username}_${file.name}`,
          mimeType: file.type,
          fileData: base64Data
        })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Respon jaringan tidak OK');
        }
        return response.json();
      })
      .then(async data => {
        if (data.status === 'success') {
          avatarImg.src = data.url;

          // 1. Simpan ke LocalStorage lokal
          localStorage.setItem(`profile_pic_${session.username}`, data.url);

          // 2. Perbarui Sesi Login Aktif
          session.foto_profil = data.url;
          Auth.saveSession(session);

          // 3. Simpan URL foto ke Google Sheets (Kolom H)
          const dbResponse = await API.updateProfilePhoto(session.username, data.url);
          if (dbResponse.status === "success") {
            alert('Foto profil berhasil diperbarui & tersinkron ke database!');
          } else {
            alert('Foto berhasil diunggah ke Drive, namun gagal simpan ke database: ' + dbResponse.message);
          }
        } else {
          alert('Gagal mengupload foto: ' + data.message);
          avatarImg.src = originalSrc;
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Terjadi kesalahan jaringan saat menerima balasan dari server.');
        avatarImg.src = originalSrc;
      });
    };
    
    reader.readAsDataURL(file);
  });
}

function setupDropdownMenu() {
  const btnHamburger = document.getElementById("btnHamburger");
  const dropdownMenu = document.getElementById("dropdownMenu");

  if (!btnHamburger || !dropdownMenu) return;

  btnHamburger.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdownMenu.classList.toggle("show");
  });

  document.addEventListener("click", (e) => {
    if (!dropdownMenu.contains(e.target) && e.target !== btnHamburger) {
      dropdownMenu.classList.remove("show");
    }
  });

  document.getElementById("btnRefresh")?.addEventListener("click", () => location.reload());

  // MODAL TENTANG APLIKASI
  const modalAbout = document.getElementById("modalAbout");
  const btnCloseAboutModal = document.getElementById("btnCloseAboutModal");
  const btnOkAboutModal = document.getElementById("btnOkAboutModal");

  const openAboutModal = () => modalAbout?.classList.add("active");
  const closeAboutModal = () => modalAbout?.classList.remove("active");

  document.getElementById("btnAbout")?.addEventListener("click", () => {
    dropdownMenu.classList.remove("show");
    openAboutModal();
  });

  btnCloseAboutModal?.addEventListener("click", closeAboutModal);
  btnOkAboutModal?.addEventListener("click", closeAboutModal);

  modalAbout?.addEventListener("click", (e) => {
    if (e.target === modalAbout) closeAboutModal();
  });

  // UBAH PASSWORD
  document.getElementById("btnChangePass")?.addEventListener("click", async () => {
    const session = Auth.getSession();
    if (!session || !session.username) {
      alert("Sesi tidak valid. Silakan login kembali.");
      return;
    }

    const oldPassword = prompt("Masukkan Password Lama Anda:");
    if (!oldPassword) return;

    const newPassword = prompt("Masukkan Password Baru Anda:");
    if (!newPassword) return;

    const confirmPassword = prompt("Konfirmasi Password Baru Anda:");
    if (newPassword !== confirmPassword) {
      alert("Password baru dan konfirmasi tidak cocok!");
      return;
    }

    const btn = document.getElementById("btnChangePass");
    const originalText = btn.innerText;
    btn.innerText = "Memproses...";

    try {
      const response = await API.changePassword(session.username, oldPassword, newPassword);
      
      if (response.status === "success") {
        alert("Berhasil: " + response.message + "\n\nSilakan login kembali dengan password baru Anda.");
        Auth.logout();
      } else {
        alert("Gagal: " + response.message);
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat menghubungi server.");
    } finally {
      btn.innerText = originalText;
    }
  });

  // LOGOUT
  document.getElementById("btnLogout")?.addEventListener("click", () => {
    if (confirm("Apakah Anda yakin ingin keluar?")) {
      Auth.logout();
    }
  });
}

// 1. UPDATE FUNGSI RENDER MENU GRID
function renderMenuGrid() {
  const menuGrid = document.getElementById("menuGrid");
  if (!menuGrid) return;
  menuGrid.innerHTML = "";

  MENU_CATALOG.forEach(item => {
    if (!Auth.hasPermission(item.permission)) return;

    const card = document.createElement("a");
    card.className = "menu-card";
    card.setAttribute("data-accent", item.accent);

    if (item.link) {
      card.href = item.link;
      card.target = "_blank";
    } else {
      card.href = "#";
      card.addEventListener("click", (e) => {
        e.preventDefault();
        if (item.id === "jadwal_mengajar") {
          openJadwalModal(); // Panggil fungsi muat data jadwal
        } else {
          alert(`Membuka modal: ${item.title}`);
        }
      });
    }

    card.innerHTML = `
      <div class="card-icon">${item.icon}</div>
      <div class="card-title">${item.title}</div>
      <div class="card-desc">${item.desc}</div>
    `;

    menuGrid.appendChild(card);
  });

  setupModalJadwalEvents();
}

// 2. SETUP EVENT LISTENER TUTUP MODAL JADWAL
function setupModalJadwalEvents() {
  const modalJadwal = document.getElementById("modalJadwal");
  const btnCloseJadwalModal = document.getElementById("btnCloseJadwalModal");
  const btnOkJadwalModal = document.getElementById("btnOkJadwalModal");

  const closeJadwalModal = () => modalJadwal?.classList.remove("active");

  btnCloseJadwalModal?.addEventListener("click", closeJadwalModal);
  btnOkJadwalModal?.addEventListener("click", closeJadwalModal);

  modalJadwal?.addEventListener("click", (e) => {
    if (e.target === modalJadwal) closeJadwalModal();
  });
}

// Membuka Modal & Memuat Jadwal Guru Aktif
async function openJadwalModal() {
  const modal = document.getElementById("modalJadwal");
  const container = document.getElementById("jadwalContentContainer");
  
  if (!modal || !container) return;
  
  modal.classList.add("active");
  container.innerHTML = "<p style='text-align:center; padding: 20px;'>Memuat jadwal pelajaran...</p>";

  const session = Auth.getSession();
  const currentIdGuru = String(session?.id_guru || "").trim().toLowerCase();

  if (!currentIdGuru) {
    container.innerHTML = "<p style='text-align:center; color:red; padding: 20px;'>ID Guru tidak ditemukan pada sesi login.</p>";
    return;
  }

  const response = await API.readAllMaster();
  if (response.status !== "success" || !response.data) {
    container.innerHTML = "<p style='text-align:center; color:red; padding: 20px;'>Gagal mengambil data dari server.</p>";
    return;
  }

  const { Jadwal = [], Tim_Pengajar = [], Mapel = [], Kelas = [] } = response.data;

  // Helper Pencarian Nama Mapel dan Kelas
  const getMapelName = (idMapel) => {
    const m = Mapel.find(x => String(x.id_mapel || x.id_ma || "").trim().toLowerCase() === String(idMapel).trim().toLowerCase());
    return m ? (m.nama_mapel || m.nama || idMapel) : idMapel;
  };

  const getKelasName = (idKelas) => {
    const k = Kelas.find(x => String(x.id_kelas || x.id_ke || "").trim().toLowerCase() === String(idKelas).trim().toLowerCase());
    return k ? (k.nama_kelas || k.nama || idKelas) : idKelas;
  };

  // 1. Cari daftar ID Tim yang diikuti guru ini
  const userTeamIds = Tim_Pengajar
    .filter(tp => String(tp.id_guru || tp.id_g || "").trim().toLowerCase() === currentIdGuru)
    .map(tp => String(tp.id_tim || "").trim().toLowerCase());

  // 2. Filter jadwal individu ATAU jadwal tim
  const rawSchedules = Jadwal.filter(j => {
    const idG = String(j.id_g || j.id_guru || "").trim().toLowerCase();
    return idG === currentIdGuru || userTeamIds.includes(idG);
  });

  if (rawSchedules.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 30px 10px;">
        <p style="margin-bottom: 8px; font-weight: bold; color: #555;">Belum ada jadwal mengajar yang terdaftar untuk Anda.</p>
        <small style="color: #888;">(ID Guru Aktif: <b>${session.id_guru}</b>)</small>
      </div>`;
    return;
  }

  // 3. Kelompokkan Berdasarkan Hari
  const daysOrder = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
  const groupedByDay = {};
  daysOrder.forEach(day => groupedByDay[day] = []);

  rawSchedules.forEach(item => {
    const hariKey = daysOrder.find(d => d.toLowerCase() === String(item.hari || "").trim().toLowerCase());
    if (hariKey) {
      groupedByDay[hariKey].push(item);
    }
  });

  // 4. Render HTML Tabel Jadwal dengan Pengelompokan Otomatis
  let html = "";
  daysOrder.forEach(hari => {
    const dayItems = groupedByDay[hari];
    
    html += `
      <div style="margin-bottom: 20px;">
        <h4 style="background: #eef2f7; padding: 8px 12px; border-left: 4px solid #00a86b; margin-bottom: 10px; border-radius: 4px; color: #2c3e50;">${hari}</h4>`;
    
    if (dayItems.length === 0) {
      html += `<p style="color: #888; font-size: 0.9rem; padding-left: 12px;">Tidak ada jadwal mengajar.</p>`;
    } else {
      // --- A. GABUNGKAN KELAS PARALEL PADA JAM YANG SAMA ---
      const jamMap = {};
      dayItems.forEach(item => {
        const jam = Number(item.jam_ke);
        if (!jamMap[jam]) jamMap[jam] = [];
        jamMap[jam].push(item);
      });

      const sortedJams = Object.keys(jamMap).map(Number).sort((a, b) => a - b);
      const mergedJamList = [];

      sortedJams.forEach(jam => {
        const itemsAtJam = jamMap[jam];
        const mapelGroup = {};

        itemsAtJam.forEach(it => {
          const idG = String(it.id_g || it.id_guru || "").trim().toLowerCase();
          const isTeam = userTeamIds.includes(idG);
          const mapelName = getMapelName(it.id_ma || it.id_mapel);
          const kelasName = getKelasName(it.id_ke || it.id_kelas);
          
          const key = `${mapelName}_${isTeam}`;
          if (!mapelGroup[key]) {
            mapelGroup[key] = {
              jam: jam,
              mapelName: mapelName,
              isTeam: isTeam,
              kelasList: []
            };
          }
          if (!mapelGroup[key].kelasList.includes(kelasName)) {
            mapelGroup[key].kelasList.push(kelasName);
          }
        });

        Object.values(mapelGroup).forEach(g => mergedJamList.push(g));
      });

      // --- B. GABUNGKAN RENTANG JAM BERURUTAN (misal Jam 4, 5, 6 -> 4 - 6) ---
      const finalDisplayRows = [];
      let currentBlock = null;

      mergedJamList.forEach(item => {
        const kelasStr = item.isTeam && item.kelasList.length > 1 
          ? `Kelas 7 (${item.kelasList.join(", ")})` 
          : item.kelasList.join(", ");

        if (!currentBlock) {
          currentBlock = {
            startJam: item.jam,
            endJam: item.jam,
            kelas: kelasStr,
            mapelName: item.mapelName,
            isTeam: item.isTeam
          };
        } else if (
          item.jam === currentBlock.endJam + 1 &&
          kelasStr === currentBlock.kelas &&
          item.mapelName === currentBlock.mapelName &&
          item.isTeam === currentBlock.isTeam
        ) {
          currentBlock.endJam = item.jam;
        } else {
          finalDisplayRows.push(currentBlock);
          currentBlock = {
            startJam: item.jam,
            endJam: item.jam,
            kelas: kelasStr,
            mapelName: item.mapelName,
            isTeam: item.isTeam
          };
        }
      });
      if (currentBlock) finalDisplayRows.push(currentBlock);

      // --- C. RENDER TABEL ---
      html += `
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 0.95rem;">
          <thead>
            <tr style="background-color: #f8f9fa; text-align: left; border-bottom: 2px solid #dee2e6;">
              <th style="padding: 8px; width: 90px;">Jam Ke</th>
              <th style="padding: 8px;">Kelas</th>
              <th style="padding: 8px;">Mata Pelajaran / Kelompok</th>
            </tr>
          </thead>
          <tbody>`;
      
      finalDisplayRows.forEach(row => {
        const jamLabel = row.startJam === row.endJam ? `${row.startJam}` : `${row.startJam} - ${row.endJam}`;
        const tagTim = row.isTeam ? ` <span style="background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; font-weight: bold;">(Tim Pengajar)</span>` : "";
        
        html += `
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 8px; font-weight: bold;">${jamLabel}</td>
            <td style="padding: 8px;">${row.kelas}</td>
            <td style="padding: 8px;">${row.mapelName}${tagTim}</td>
          </tr>`;
      });
      
      html += `</tbody></table>`;
    }
    html += `</div>`;
  });

  container.innerHTML = html;
}
