/**
 * js/dashboard.js - Dynamic Menu Renderer & Dashboard Logic
 */

// Katalog Semua Menu Aplikasi beserta Pengaturan Aksesnya
const MENU_CATALOG = [
  {
    id: "jurnal_harian",
    title: "Jurnal Harian",
    desc: "Klik untuk input jurnal harian KBM.",
    icon: "📅",
    accent: "blue",
    permission: "always",
    link: "https://google.com" // Ganti dengan link Form/App Anda
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
    desc: "Khusus Pembina Ekstrakulikuler.",
    icon: "⚽",
    accent: "blue",
    permission: "is_ekstra",
    link: "https://google.com"
  },
  {
    id: "absensi_karyawan",
    title: "Absensi Karyawan",
    desc: "Khusus Waka Kurikulum.",
    icon: "📝",
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
  // 1. Guard Sesi
  Auth.requireAuth();
  const session = Auth.getSession();

  // 2. Render Tanggal Navbar
  renderCurrentDate();

  // 3. Render Welcome Card
  renderWelcomeCard(session);

  // 4. Render Menu Grid Sesuai Role Permission
  renderMenuGrid();

  // 5. Logout Listener
  document.getElementById("btnLogout").addEventListener("click", () => {
    if (confirm("Apakah Anda yakin ingin keluar?")) {
      Auth.logout();
    }
  });
});

function renderCurrentDate() {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const today = new Date().toLocaleDateString('id-ID', options);
  document.getElementById("currentDateDisplay").innerText = today;
}

function renderWelcomeCard(session) {
  document.getElementById("userFullName").innerText = session.username || "Guru";
  document.getElementById("userNip").innerText = `NIPY: ${session.id_guru || '-'}`;
  document.getElementById("userRoleTitle").innerText = session.role || "Guru Mata Pelajaran";
}

function renderMenuGrid() {
  const menuGrid = document.getElementById("menuGrid");
  menuGrid.innerHTML = "";

  MENU_CATALOG.forEach(item => {
    // Check permission
    let canAccess = false;
    if (item.permission === "always") {
      canAccess = true;
    } else {
      canAccess = Auth.hasPermission(item.permission);
    }

    // Hanya buat elemen jika user berhak mengakses
    if (canAccess) {
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
    }
  });
}
