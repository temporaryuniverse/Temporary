// File: js/main.js
// Purpose: Handle audio, video, typed lines, poem modal, and samosa explosion

document.addEventListener("DOMContentLoaded", () => {
  // ===== AUDIO SETUP =====
  const audio = document.getElementById("bg-audio");
  let audioStarted = false;

  // Play audio on first user interaction anywhere
  function startAudioOnInteraction() {
    if (!audioStarted) {
      audio
        .play()
        .then(() => {
          audioStarted = true;
          console.log("Audio started!");
        })
        .catch((err) => {
          console.log("Audio blocked:", err);
        });
    }
  }

  // Trigger on click or touch
  document.body.addEventListener("click", startAudioOnInteraction, {
    once: true,
  });
  document.body.addEventListener("touchstart", startAudioOnInteraction, {
    once: true,
  });

  // ===== VIDEO MUTE TOGGLE =====
  const video = document.getElementById("bg-video");
  const videoMuteBtn = document.getElementById("video-mute-toggle");

  videoMuteBtn.addEventListener("click", () => {
    video.muted = !video.muted;
    if (video.muted) {
      videoMuteBtn.textContent = "🔈";
      videoMuteBtn.setAttribute("aria-pressed", "true");
    } else {
      videoMuteBtn.textContent = "🔊";
      videoMuteBtn.setAttribute("aria-pressed", "false");
    }
  });

  // ===== TYPED LINES =====
  const typedEl = document.getElementById("typed-lines");
  if (typedEl) {
    const lines = JSON.parse(typedEl.getAttribute("data-lines"));
    let lineIndex = 0;
    let charIndex = 0;
    let typing = true;

    function typeLoop() {
      if (!typedEl) return;

      if (typing) {
        if (charIndex < lines[lineIndex].length) {
          typedEl.textContent = lines[lineIndex].slice(0, charIndex + 1);
          charIndex++;
          setTimeout(typeLoop, 80);
        } else {
          typing = false;
          setTimeout(typeLoop, 2000); // wait before deleting
        }
      } else {
        if (charIndex > 0) {
          typedEl.textContent = lines[lineIndex].slice(0, charIndex - 1);
          charIndex--;
          setTimeout(typeLoop, 40);
        } else {
          typing = true;
          lineIndex = (lineIndex + 1) % lines.length;
          setTimeout(typeLoop, 400);
        }
      }
    }
    typeLoop();
  }

  // ===== PARTICLE / CANVAS SETUP =====
  const canvas = document.getElementById("particles-canvas");
  const ctx = canvas.getContext("2d");
  let particles = [];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  // Preload samosa image once
  const samosaImage = new Image();
  samosaImage.src = "assets/samosa.png";

  // ===== PARTICLE CLASS (SAMOSA) =====
  class Particle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.size = Math.random() * 32 + 24;
      this.speedY = Math.random() * -8 - 4; // upward burst
      this.speedX = (Math.random() - 0.5) * 10; // scatter sideways
      this.rotation = Math.random() * 360;
      this.rotationSpeed = (Math.random() - 0.5) * 10;
      this.opacity = 1;
      this.gravity = 0.3;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.speedY += this.gravity;
      this.rotation += this.rotationSpeed;
      this.opacity -= 0.01;
    }

    draw() {
      if (!samosaImage.complete) return;
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.drawImage(
        samosaImage,
        -this.size / 2,
        -this.size / 2,
        this.size,
        this.size
      );
      ctx.restore();
    }
  }

  class BusrtParticle {
    constructor(x, y, size = null, speedY = null) {
      this.x = x;
      this.y = y;
      this.size = size || Math.random() * 6 + 6; // small heart size
      this.speedY = speedY || Math.random() * -2 - 1; // rises upwards
      this.speedX = (Math.random() - 0.5) * 2; // slight horizontal movement
      this.opacity = 1;
      const colors = [
        "rgba(255,107,154,",
        "rgba(255,210,102,",
        "rgba(255,160,220,",
      ];
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.opacity -= 0.02;
    }

    draw() {
      ctx.beginPath();
      ctx.fillStyle = this.color + this.opacity + ")";
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function spawnHeartBurst(x, y, count = 20) {
    for (let i = 0; i < count; i++) {
      particles.push(new BusrtParticle(x, y));
    }
  }

  function handleParticles() {
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
      if (particles[i].opacity <= 0) {
        particles.splice(i, 1);
        i--;
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    handleParticles();
    requestAnimationFrame(animate);
  }
  animate();

  // ===== SAMOSA BUTTON CLICK =====
  const samosaBtn = document.getElementById("samosa-btn");
  if (samosaBtn) {
    samosaBtn.addEventListener("click", () => {
      const rect = samosaBtn.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      for (let i = 0; i < 40; i++) {
        // more particles for explosion
        const p = new Particle(x, y);
        p.speedX = (Math.random() - 0.5) * 20; // wider scatter
        p.speedY = Math.random() * -12 - 4; // stronger upward burst
        p.rotationSpeed = (Math.random() - 0.5) * 15;
        particles.push(p);
      }
    });
  }
  // Click anywhere on the page → spawn small hearts
  document.body.addEventListener("click", (e) => {
    spawnHeartBurst(e.clientX, e.clientY, 10); // 10 hearts per click
  });

  // ===== POEM MODAL =====
  const poemModal = document.getElementById("poem-modal");
  const openPoemBtn = document.getElementById("open-poem");
  const closePoemBtn = document.getElementById("close-poem");

  openPoemBtn.addEventListener("click", () => {
    poemModal.classList.add("open");
    poemModal.setAttribute("aria-hidden", "false");
  });

  closePoemBtn.addEventListener("click", () => {
    poemModal.classList.remove("open");
    poemModal.setAttribute("aria-hidden", "true");
  });

  // Close modal if clicking outside content
  poemModal.addEventListener("click", (e) => {
    if (e.target === poemModal) {
      poemModal.classList.remove("open");
      poemModal.setAttribute("aria-hidden", "true");
    }
  });

  // ===== CAROUSEL SCALING EFFECT =====
  const carousel = document.querySelector(".carousel");
  if (!carousel) return;

  let isHovered = false;
  let scrollSpeed = 1; // pixels per frame for auto-scroll
  let isDragging = false;
  let startX;
  let scrollStart;

  // Scale function: edges grow, center shrinks
  function scaleCarouselItems() {
    const items = document.querySelectorAll(".carousel-item");
    const carouselRect = carousel.getBoundingClientRect();
    const centerX = carouselRect.left + carouselRect.width / 2;

    items.forEach(item => {
      const itemRect = item.getBoundingClientRect();
      const itemCenterX = itemRect.left + itemRect.width / 2;
      const distance = Math.abs(centerX - itemCenterX);
      const maxDistance = carouselRect.width / 2 + itemRect.width;
      let scale = 0.6 + (distance / maxDistance) * 0.4; // center smaller, edges bigger
      scale = Math.min(scale, 1);
      item.style.transform = `scale(${scale})`;
      item.style.zIndex = Math.round(scale * 100);
    });
  }

  // Auto-scroll
  function autoScroll() {
    if (!isDragging) {
      carousel.scrollLeft += scrollSpeed;
      if (carousel.scrollLeft + carousel.offsetWidth >= carousel.scrollWidth) {
        carousel.scrollLeft = 0;
      }
    }
    scaleCarouselItems();
    requestAnimationFrame(autoScroll);
  }
  requestAnimationFrame(autoScroll);

  // Pause on hover
  carousel.addEventListener("mouseenter", () => isHovered = true);
  carousel.addEventListener("mouseleave", () => isHovered = false);

  // ===== DRAG TO SCROLL =====
  carousel.addEventListener("mousedown", e => {
    isDragging = true;
    startX = e.pageX - carousel.offsetLeft;
    scrollStart = carousel.scrollLeft;
    carousel.classList.add("dragging");
  });

  carousel.addEventListener("mouseleave", () => isDragging = false);
  carousel.addEventListener("mouseup", () => isDragging = false);

  carousel.addEventListener("mousemove", e => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - carousel.offsetLeft;
    const walk = (x - startX) * 2; // drag speed multiplier
    carousel.scrollLeft = scrollStart - walk;
    scaleCarouselItems();
  });

  // Touch events for mobile drag
  carousel.addEventListener("touchstart", e => {
    isDragging = true;
    startX = e.touches[0].pageX - carousel.offsetLeft;
    scrollStart = carousel.scrollLeft;
  });

  carousel.addEventListener("touchend", () => isDragging = false);
  carousel.addEventListener("touchmove", e => {
    if (!isDragging) return;
    const x = e.touches[0].pageX - carousel.offsetLeft;
    const walk = (x - startX) * 2;
    carousel.scrollLeft = scrollStart - walk;
    scaleCarouselItems();
  });

  // ===== ZOOM POPUP =====
  const zoomPopup = document.createElement("div");
  zoomPopup.id = "zoom-popup";
  const zoomImg = document.createElement("img");
  zoomPopup.appendChild(zoomImg);
  document.body.appendChild(zoomPopup);

  document.querySelectorAll(".carousel-item img").forEach(img => {
    img.addEventListener("click", () => {
      zoomImg.src = img.src;
      zoomPopup.style.display = "flex";
    });
  });

  zoomPopup.addEventListener("click", () => {
    zoomPopup.style.display = "none";
  });
});
