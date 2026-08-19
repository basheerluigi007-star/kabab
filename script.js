const canvas = document.querySelector('#constellation');
const context = canvas.getContext('2d');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let width = 0;
let height = 0;
let stars = [];

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  stars = Array.from({ length: Math.min(75, Math.floor(width / 16)) }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 1.3 + .2,
    speed: Math.random() * .16 + .03,
    phase: Math.random() * Math.PI * 2
  }));
}

function drawFrame(time = 0) {
  context.clearRect(0, 0, width, height);
  const gradient = context.createRadialGradient(width * .65, height * .35, 0, width * .65, height * .35, width * .7);
  gradient.addColorStop(0, 'rgba(43, 48, 35, .22)');
  gradient.addColorStop(.45, 'rgba(10, 12, 18, .06)');
  gradient.addColorStop(1, 'rgba(8, 9, 13, 0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  stars.forEach((star, index) => {
    const drift = reducedMotion ? 0 : Math.sin(time * .00025 * star.speed + star.phase) * 10;
    const alpha = .18 + (Math.sin(time * .001 + index) + 1) * .12;
    context.beginPath();
    context.fillStyle = index % 7 === 0 ? `rgba(216, 255, 62, ${alpha + .16})` : `rgba(243, 241, 235, ${alpha})`;
    context.arc(star.x + drift, star.y, star.radius, 0, Math.PI * 2);
    context.fill();
  });

  if (!reducedMotion) requestAnimationFrame(drawFrame);
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);
drawFrame();

if (!reducedMotion) {
  document.querySelectorAll('.platform-card').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - .5;
      const y = (event.clientY - bounds.top) / bounds.height - .5;
      card.style.transform = `perspective(800px) rotateX(${y * -3}deg) rotateY(${x * 3}deg) translateY(-9px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
}

const shareButton = document.querySelector('.share-button');
const shareStatus = document.querySelector('#share-status');

shareButton.addEventListener('click', async () => {
  const shareData = {
    title: document.title,
    text: 'Connect with Basheer Almajdoby across social channels.',
    url: window.location.href
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
      shareStatus.textContent = 'Profile shared';
      return;
    }

    await navigator.clipboard.writeText(window.location.href);
    shareStatus.textContent = 'Profile link copied';
  } catch (error) {
    if (error.name !== 'AbortError') shareStatus.textContent = 'Copy the profile URL to share';
  }
});
