const root = document.documentElement;
const reduceMotionPreferred = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Menu mobile
const menuButton = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");

function setMenuOpen(isOpen) {
  mobileMenu.classList.toggle("open", isOpen);
  menuButton.setAttribute("aria-expanded", isOpen);
  menuButton.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
  menuButton.querySelector("use").setAttribute("href", isOpen ? "#i-close" : "#i-menu");
}

menuButton.addEventListener("click", () => {
  setMenuOpen(!mobileMenu.classList.contains("open"));
});

mobileMenu.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", () => setMenuOpen(false));
});

// Modo noturno (o tema salvo já é aplicado no <head>)
const toggleBtn = document.getElementById("darkModeToggle");

function updateDarkModeButton(isDark) {
  toggleBtn.querySelector("use").setAttribute("href", isDark ? "#i-sun" : "#i-moon");
  toggleBtn.setAttribute("aria-label", isDark ? "Desativar modo noturno" : "Ativar modo noturno");
}

updateDarkModeButton(root.classList.contains("dark-mode"));

toggleBtn.addEventListener("click", () => {
  const isDark = root.classList.toggle("dark-mode");
  try {
    localStorage.setItem("darkMode", isDark);
  } catch (e) { }
  updateDarkModeButton(isDark);
});

// Sombra no header ao rolar
const header = document.querySelector("header");

function updateHeader() {
  header.classList.toggle("scrolled", window.scrollY > 20);
}

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

// Animação de entrada das seções e cards
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

// Destaca no menu a seção visível
const navLinks = document.querySelectorAll(".nav-list .nav-link");
const sections = [...navLinks]
  .map(link => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    navLinks.forEach(link => {
      link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
    });
  });
}, { rootMargin: "-45% 0px -50% 0px" });

sections.forEach(section => sectionObserver.observe(section));

// A Pokédex só mostra o layout de desktop a partir de ~760px de largura e precisa
// de ~750px de altura. Na demo ela é desenhada nesse tamanho e reduzida para caber,
// sem scroll. Em telas estreitas usa o layout de celular dela, sem reduzir.
const DEMO_MIN_WIDTH = 1000;
const DEMO_HEIGHT = 760;

function fitLiveDemo(stage, iframe) {
  const width = stage.clientWidth;
  const height = stage.clientHeight;

  if (width < 520) {
    iframe.style.removeProperty("width");
    iframe.style.removeProperty("height");
    iframe.style.removeProperty("transform");
    return;
  }

  const scale = Math.min(width / DEMO_MIN_WIDTH, height / DEMO_HEIGHT, 1);
  iframe.style.width = `${width / scale}px`;
  iframe.style.height = `${height / scale}px`;
  iframe.style.transform = `scale(${scale})`;
}

// Pokédex ao vivo: a Pokébola abre e troca o print pela aplicação real
document.querySelectorAll("[data-live-demo]").forEach(demo => {
  const button = demo.querySelector(".poke-start");
  const stage = demo.querySelector(".browser-stage");

  button.addEventListener("click", () => {
    if (demo.classList.contains("is-opening")) return;
    demo.classList.add("is-opening");

    const iframe = document.createElement("iframe");
    iframe.src = button.dataset.src;
    iframe.title = button.dataset.title;
    iframe.addEventListener("load", () => iframe.classList.add("is-loaded"), { once: true });

    // Troca no pico do flash, para a Pokédex "sair" da Pokébola
    setTimeout(() => {
      stage.querySelectorAll("img, .poke-start").forEach(el => el.remove());
      stage.prepend(iframe);
      demo.classList.add("is-live");

      fitLiveDemo(stage, iframe);
      new ResizeObserver(() => fitLiveDemo(stage, iframe)).observe(stage);
    }, reduceMotionPreferred ? 0 : 420);
  });
});

// Terminal do Movie Search: "roda" a busca quando aparece na tela
const terminal = document.querySelector("[data-terminal]");

if (terminal) {
  const lines = [...terminal.querySelectorAll(".t-line")];
  const inputs = [...terminal.querySelectorAll(".t-input")];
  const cursor = document.createElement("span");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let currentRun = 0;

  cursor.className = "t-cursor";
  inputs.forEach(input => {
    input.dataset.text = input.textContent;
  });

  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

  async function runTerminal() {
    const run = ++currentRun;

    lines.forEach(line => line.classList.add("is-pending"));
    inputs.forEach(input => {
      input.textContent = "";
    });

    for (const line of lines) {
      if (run !== currentRun) return;

      line.classList.remove("is-pending");
      line.append(cursor);

      const input = line.querySelector(".t-input");

      if (input) {
        await wait(600);

        for (const char of input.dataset.text) {
          if (run !== currentRun) return;
          input.textContent += char;
          await wait(130);
        }

        await wait(400);
      } else {
        await wait(line.classList.contains("t-wait") ? 1100 : 70);
      }
    }
  }

  if (!reduceMotion) {
    const terminalObserver = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        runTerminal();
        terminalObserver.disconnect();
      }
    }, { threshold: 0.4 });

    terminalObserver.observe(terminal);
  }

  terminal.querySelector(".terminal-replay").addEventListener("click", runTerminal);
}

// Tecnologias: filtro por categoria
const skillFilters = document.querySelectorAll(".skill-filter");
const skillCards = document.querySelectorAll(".hability-card");
const filterBar = document.querySelector(".skill-filters");
const filterIndicator = document.querySelector(".skill-filter-indicator");

// O indicador desliza até a aba ativa
function moveFilterIndicator() {
  const active = filterBar.querySelector('[aria-pressed="true"]');
  filterIndicator.style.setProperty("--x", `${active.offsetLeft}px`);
  filterIndicator.style.setProperty("--w", `${active.offsetWidth}px`);
}

if (filterBar) {
  moveFilterIndicator();
  document.fonts.ready.then(moveFilterIndicator);
  window.addEventListener("resize", moveFilterIndicator);
}

skillFilters.forEach(filter => {
  filter.addEventListener("click", () => {
    const category = filter.dataset.filter;
    let shown = 0;

    skillFilters.forEach(other => other.setAttribute("aria-pressed", other === filter));
    moveFilterIndicator();

    // No celular as abas rolam para o lado: traz a escolhida para o centro
    if (filterBar.scrollWidth > filterBar.clientWidth) {
      filterBar.scrollTo({
        left: filter.offsetLeft - (filterBar.clientWidth - filter.offsetWidth) / 2,
        behavior: reduceMotionPreferred ? "auto" : "smooth"
      });
    }

    skillCards.forEach(card => {
      const matches = category === "all" || card.dataset.category === category;
      card.hidden = !matches;

      if (matches) {
        card.classList.add("visible");
        if (!reduceMotionPreferred) {
          card.animate(
            [
              { opacity: 0, transform: "translateY(2rem) scale(0.96)" },
              { opacity: 1, transform: "none" }
            ],
            { duration: 500, delay: (shown % 8) * 60, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)", fill: "backwards" }
          );
        }
        shown++;
      }
    });
  });
});

// Toca um story por vez
const creativeVideos = document.querySelectorAll(".creative-video");

creativeVideos.forEach(video => {
  video.addEventListener("play", () => {
    creativeVideos.forEach(other => {
      if (other !== video) other.pause();
    });
  });
});
