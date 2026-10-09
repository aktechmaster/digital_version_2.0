/**
 * js/auth.js
 * Manajemen Sesi Token, Auth Guard & Otorisasi Role
 */

const Auth = {
  // Menyimpan Sesi Login ke LocalStorage
  saveSession(userData) {
    try {
      localStorage.setItem(CONFIG.SESSION_KEY, JSON.stringify(userData));
    } catch (e) {
      console.error("Gagal menyimpan session:", e);
    }
  },

  // Mengambil Sesi Aktif
  getSession() {
    try {
      const data = localStorage.getItem(CONFIG.SESSION_KEY);
      if (!data) return null;
      
      const session = JSON.parse(data);
      
      // Cek Kedaluwarsa Token (24 jam)
      if (session.expires_at) {
        const now = new Date();
        const expiresAt = new Date(session.expires_at);
        if (now > expiresAt) {
          this.logout();
          return null;
        }
      }
      return session;
    } catch (e) {
      this.logout();
      return null;
    }
  },

  // Mengecek Apakah User Sudah Login
  isLoggedIn() {
    return this.getSession() !== null;
  },

  // Menghapus Sesi & Redirect ke Login
  logout() {
    localStorage.removeItem(CONFIG.SESSION_KEY);
    window.location.href = "index.html";
  },

  // Guard untuk Halaman Terproteksi (Dipanggil di dashboard.html)
  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = "index.html";
    }
  },

  // Guard untuk Halaman Guest (Dipanggil di index.html)
  redirectIfAuthenticated() {
    if (this.isLoggedIn()) {
      window.location.href = "dashboard.html";
    }
  },

  // Cek Hak Akses Berdasarkan Flag Permission Boolean (is_wali_kelas, is_wakur, dll)
  hasPermission(permissionName) {
    const session = this.getSession();
    if (!session || !session.permissions) return false;
    
    // Admin otomatis memiliki akses penuh
    if (session.role === "Admin" || session.role === "Kepsek") return true;

    return Boolean(session.permissions[permissionName]);
  }
};
