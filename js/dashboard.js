/**
 * js/dashboard.js - Dynamic Menu Renderer & Dashboard Logic
 * (MODE TEMPORARY: Semua menu ditampilkan tanpa pembatasan peran untuk pengujian UI)
 */

const MENU_CATALOG = [
  {
    id: "jurnal_harian",
    title: "Jurnal Harian",
    desc: "Klik untuk input jurnal harian KBM.",
    icon: "📅",
    accent: "blue",
    permission: "always",
    link: "https://google.com"
  },
  {
    id: "jurnal_t2q",
    title: "Jurnal T2Q",
    desc: "Tahsin & Tahfidz Al-Qur'an.",
    icon: "📖",
    accent: "purple",
    permission: "is_t2q",
    link: "https://google.com"
  },
  {
    id: "jadwal_mengajar",
    title: "Jadwal Mengajar",
    desc: "Cek jadwal KBM Anda hari ini.",
    icon: "⌚",
    accent: "blue",
    permission: "always",
    modal: "modalJadwal"
  },
  {
    id: "absensi_siswa",
    title: "Absensi Siswa",
    desc: "Rekap kehadiran siswa harian.",
    icon: "📝",
    accent: "cyan",
    permission: "is_wali_kelas",
    link: "https://google.com"
  },
  {
    id: "laporan_kinerja",
    title: "Laporan Kinerja",
    desc: "Klik untuk melihat statistik: Jurnal, Piket, dan Absensi.",
    icon: "📊",
    accent: "orange",
    permission: "always",
    modal: "modalKinerja"
  },
  {
    id: "biodata_guru",
    title: "Biodata Guru",
    desc: "Klik untuk melihat data pribadi & kepegawaian.",
    icon: "👤",
    accent: "green",
    permission: "always",
    modal: "modalBiodata"
  },
  {
    id: "jurnal_bpi",
    title: "Jurnal BPI",
    desc: "Klik untuk input laporan Bina Pribadi Islam.",
    icon: "☪️",
    accent: "purple",
    permission: "is_bpi",
    link: "https://google.com"
  },
  {
    id: "input_nilai",
    title: "Input Nilai",
    desc: "Klik untuk rekap nilai siswa.",
    icon: "📋",
    accent: "cyan",
    permission: "always",
    link: "https://google.com"
  },
  {
    id: "pusat_laporan",
    title: "Menuju Pusat Laporan",
    desc: "Lihat semua rekap & laporan terpusat.",
    icon: "🏠",
    accent: "cyan",
    permission: "always",
    link: "https://google.com"
  },
  {
    id: "jurnal_ekstra",
    title: "Jurnal Ekstra",
    desc: "Khusus Pembina Ekstrakurikuler.",
    icon: "⚽",
    accent: "blue",
    permission: "is_ekstra",
    link: "https://google.com"
  },
  {
    id: "absensi_karyawan",
    title: "Absensi Karyawan",
    desc: "Khusus Waka Kurikulum.",
    icon: "📋",
    accent: "cyan",
    permission: "is_wakur",
    link: "https://google.com"
  },
  {
    id: "input_piket",
    title: "Input Piket",
    desc: "Khusus Waka Kurikulum & PMA.",
    icon: "✍️",
    accent: "orange",
    permission: "is_wakur",
    link: "https://google.com"
  },
  {
    id: "laporan_piket",
    title: "Laporan Piket",
    desc: "Rekap data piket harian.",
    icon: "📊",
    accent: "green",
    permission: "is_wakur",
    link: "https://google.com"
  },
  {
    id: "jurnal_perilaku",
    title: "Jurnal Perilaku & Sikap",
    desc: "Khusus Guru & Wali Kelas.",
    icon: "📓",
    accent: "purple",
    permission: "is_wali_kelas",
    link: "https://google.com"
  },
  {
    id: "nilai_karakter",
    title: "Input Nilai Karakter",
    desc: "Khusus Wali Kelas.",
    icon: "🌟",
    accent: "orange",
    permission: "is_wali_kelas",
    link: "https://google.com"
  }
];

document.addEventListener("DOMContentLoaded", () => {
  Auth.requireAuth();
  const session = Auth.getSession();

  renderCurrentDate();
  renderWelcomeCard(session);
  renderMenuGrid();
  setupDropdownMenu();
});

function renderCurrentDate() {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const today = new Date().toLocaleDateString('id-ID', options);
  document.getElementById("currentDateDisplay").innerText = today;
}

function renderWelcomeCard(session) {
  // Ambil data detail hasil pencocokan dari tab Guru saat login
  const namaLengkap = session.nama_lengkap || session.username || "Guru";
  const nipy = session.nip_nik || "-";
  const jabatan = session.jabatan || session.role || "Guru Mata Pelajaran";

  document.getElementById("userFullName").innerText = namaLengkap;
  document.getElementById("userNip").innerText = `NIPY: ${nipy}`;
  document.getElementById("userRoleTitle").innerText = jabatan;
}

function setupDropdownMenu() {
  const btnHamburger = document.getElementById("btnHamburger");
  const dropdownMenu = document.getElementById("dropdownMenu");

  if (!btnHamburger || !dropdownMenu) return;

  // Toggle Tampilan Dropdown
  btnHamburger.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdownMenu.classList.toggle("show");
  });

  // Tutup Otomatis Jika Mengklik Area di Luar Dropdown
  document.addEventListener("click", (e) => {
    if (!dropdownMenu.contains(e.target) && e.target !== btnHamburger) {
      dropdownMenu.classList.remove("show");
    }
  });

  // Listener Aksi Komponen Menu Dropdown
  document.getElementById("btnRefresh")?.addEventListener("click", () => location.reload());
  
  document.getElementById("btnAbout")?.addEventListener("click", () => {
    alert("SMP DIGITAL V2.0\nPortal Informasi Guru Islam Terpadu Al-Kautsar");
  });

  // --- FUNGSI UBAH PASSWORD ---
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
        Auth.logout(); // Memaksa user logout untuk mencoba password baru
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

  document.getElementById("btnLogout")?.addEventListener("click", () => {
    if (confirm("Apakah Anda yakin ingin keluar?")) {
      Auth.logout();
    }
  });
}

function renderMenuGrid() {
  const menuGrid = document.getElementById("menuGrid");
  if (!menuGrid) return;
  menuGrid.innerHTML = "";

  MENU_CATALOG.forEach(item => {
    // SEMENTARA: Menampilkan SELURUH 15 menu tanpa memfilter permission
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
        alert(`Membuka modal: ${item.title}`);
      });
    }

    card.innerHTML = `
      <div class="card-icon">${item.icon}</div>
      <div class="card-title">${item.title}</div>
      <div class="card-desc">${item.desc}</div>
    `;

    menuGrid.appendChild(card);
  });
}
