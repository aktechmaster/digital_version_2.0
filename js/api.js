/**
 * js/api.js
 * Modul Terpusat Komunikasi API Backend Google Apps Script
 * dengan Fitur Client-Side Caching
 */

const API = {
  // Variable penyimpan cache master data di memori browser
  _masterCache: null,

  /**
   * Helper internal untuk eksekusi Fetch POST
   */
  async _post(payload) {
    try {
      const response = await fetch(CONFIG.API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8" // Menghindari isu CORS preflight pada GAS
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("[API Error]:", error);
      return {
        status: "error",
        message: "Gagal terhubung ke server. Periksa koneksi internet Anda."
      };
    }
  },

  /**
   * Helper internal untuk eksekusi Fetch GET
   */
  async _get(action) {
    try {
      const url = `${CONFIG.API_URL}?action=${action}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("[API Error GET]:", error);
      return { status: "error", message: "Gagal mengambil data dari server." };
    }
  },

  // ---------------------------------------------------------------------------
  // METHOD API SPESIFIK & CACHE MANAGEMENT
  // ---------------------------------------------------------------------------

  /**
   * Membaca Seluruh Master Data (Guru, Siswa, Kelas, Mapel, Jadwal, Tim_Pengajar)
   * @param {boolean} forceRefresh - Set true jika ingin memaksa ambil data baru dari server
   */
  async readAllMaster(forceRefresh = false) {
    // 1. Jika data sudah ada di cache & tidak dipaksa refresh, gunakan data cache (Instant)
    if (this._masterCache && !forceRefresh) {
      console.log("[API Cache]: Menggunakan master data dari memori browser.");
      return this._masterCache;
    }

    // 2. Jika cache kosong / forceRefresh = true, ambil data baru dari Google Apps Script
    console.log("[API Network]: Meminta master data dari server Apps Script...");
    const result = await this._get("readAllMaster");

    // 3. Simpan ke cache jika request berhasil
    if (result && result.status === "success") {
      this._masterCache = result;
    }

    return result;
  },

  /**
   * Membersihkan cache lokal di frontend
   */
  clearCache() {
    this._masterCache = null;
    console.log("[API Cache]: Cache lokal berhasil dibersihkan.");
  },

  // Login User V2.0
  async login(username, password) {
    return await this._post({
      action: "login",
      username: username,
      password: password
    });
  },

  // Update Foto Profil ke Database (Kolom H / foto_profil)
  async updateProfilePhoto(username, photoUrl) {
    return await this._post({
      action: "updateProfilePhoto",
      username: username,
      photoUrl: photoUrl
    });
  },

  // Ubah Password User
  async changePassword(username, oldPassword, newPassword) {
    return await this._post({
      action: "changePassword",
      username: username,
      oldPassword: oldPassword,
      newPassword: newPassword
    });
  },

  // Generic Create (Otomatis reset cache setelah tambah data)
  async createData(sheetName, dataPayload) {
    const res = await this._post({
      action: "create",
      sheet: sheetName,
      payload: dataPayload
    });
    if (res && res.status === "success") this.clearCache();
    return res;
  },

  // Generic Update (Otomatis reset cache setelah ubah data)
  async updateData(sheetName, dataPayload) {
    const res = await this._post({
      action: "update",
      sheet: sheetName,
      payload: dataPayload
    });
    if (res && res.status === "success") this.clearCache();
    return res;
  }
};
