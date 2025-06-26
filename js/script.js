function menuShow() {
  let menuMobile = document.querySelector('.mobile-menu');
  if (menuMobile.classList.contains('open')) {
    menuMobile.classList.remove('open');
    document.querySelector('.icon').src = "img/Menu.svg";
  } else {
    menuMobile.classList.add('open');
    document.querySelector('.icon').src = "img/Menu.svg";
  }
}

const toggleBtn = document.getElementById("darkModeToggle");
const toggleIcon = toggleBtn.querySelector("img");

// Atualiza ícone conforme o modo
function updateDarkModeIcon(isDark) {
  toggleIcon.src = isDark ? "img/sun.svg" : "img/moon.svg";
  toggleIcon.alt = isDark ? "Desativar modo noturno" : "Ativar modo noturno";
}

// Aplica modo salvo (se houver)
const savedMode = localStorage.getItem("darkMode");
if (savedMode === "true") {
  document.body.classList.add("dark-mode");
  updateDarkModeIcon(true);
} else {
  updateDarkModeIcon(false);
}

// Ao clicar no botão
toggleBtn.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark-mode");
  localStorage.setItem("darkMode", isDark);
  updateDarkModeIcon(isDark);
});

// Efeito de scroll no header
window.addEventListener("scroll", () => {
  const header = document.querySelector("header");
  header.classList.toggle("scrolled", window.scrollY > 20);
});

// Observer para animação dos cards
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
    }
  });
});

document.querySelectorAll(".hability-card, .project-card").forEach(el => {
  observer.observe(el);
});
