/**
 * js/api.js
 * Modul Terpusat Komunikasi API Backend Google Apps Script
 */

const API = {
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
  // METHOD API SPESIFIK
  // ---------------------------------------------------------------------------

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

  // Membaca Seluruh Master Data (Guru, Siswa, Kelas, Mapel, Jadwal)
  async readAllMaster() {
    return await this._get("readAllMaster");
  },

  // Generic Create
  async createData(sheetName, dataPayload) {
    return await this._post({
      action: "create",
      sheet: sheetName,
      payload: dataPayload
    });
  },

  // Generic Update
  async updateData(sheetName, dataPayload) {
    return await this._post({
      action: "update",
      sheet: sheetName,
      payload: dataPayload
    });
  }
};
