/**
 * js/login.js - Logika Autentikasi Halaman Login
 */
document.addEventListener("DOMContentLoaded", () => {
  // Redireksi otomatis jika sudah login
  Auth.redirectIfAuthenticated();

  const form = document.getElementById("loginForm");
  const errorBox = document.getElementById("errorBox");
  const btnLogin = document.getElementById("btnLogin");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorBox.style.display = "none";

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
      showError("Username dan password wajib diisi!");
      return;
    }

    // Set State Loading
    btnLogin.disabled = true;
    btnLogin.innerText = "Memverifikasi...";

    try {
      const response = await API.login(username, password);

      if (response.status === "success") {
        // Simpan sesi token aman di localStorage
        Auth.saveSession(response.data);
        window.location.href = "dashboard.html";
      } else {
        showError(response.message || "Login gagal. Periksa kembali kredensial Anda.");
      }
    } catch (err) {
      showError("Terjadi kesalahan koneksi ke server.");
    } finally {
      btnLogin.disabled = false;
      btnLogin.innerText = "Masuk ke Dashboard";
    }
  });

  function showError(msg) {
    errorBox.innerText = msg;
    errorBox.style.display = "block";
  }
});
