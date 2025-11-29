document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");

  // Akun admin (bisa kamu ubah)
  const adminAccount = {
    username: "admin",
    password: "12345"
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    // Cek login benar atau salah
    if (username === adminAccount.username && password === adminAccount.password) {
      // Simpan status login di localStorage
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("adminUser", username);

      alert("✅ Login berhasil! Selamat datang, " + username + ".");
      window.location.href = "dashboard.html";
    } else {
      // Login gagal
      alert("❌ Nama pengguna atau kata sandi salah!");

      // Efek visual: input bergetar sebentar
      form.classList.add("shake");
      setTimeout(() => form.classList.remove("shake"), 500);

      // Kosongkan password biar aman
      passwordInput.value = "";
      passwordInput.focus();
    }
  });
});
