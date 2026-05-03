const canvas = document.getElementById('frame');
const context = canvas.getContext('2d');

const frames = {
  currentIndex: 1,
  maxIndex: 1086,
};

let imagesLoaded = 0;
const images = [];

// Text stages — split animation into 4 equal parts
// Each stage covers 25% of the scroll (frames 0–95, 96–191, 192–286, 287–382)
const TEXT_STAGES = 4;
let currentTextStage = 0;

function updateTextStage(frameIndex) {
  const stage = Math.min(
    Math.floor((frameIndex / frames.maxIndex) * TEXT_STAGES),
    TEXT_STAGES - 1
  );

  if (stage === currentTextStage) return;
  currentTextStage = stage;

  // Update left panel
  const leftBlocks = document.querySelectorAll('#left-panel .text-block');
  leftBlocks.forEach((block) => block.classList.remove('active'));
  if (leftBlocks[stage]) leftBlocks[stage].classList.add('active');

  // Update right panel
  const rightBlocks = document.querySelectorAll('#right-panel .text-block');
  rightBlocks.forEach((block) => block.classList.remove('active'));
  if (rightBlocks[stage]) rightBlocks[stage].classList.add('active');
}

function preloadImages() {
  for (let i = 1; i <= frames.maxIndex; i++) {
    const imageUrl = `./frames/frame_${i.toString().padStart(4, "0")}.jpeg`;
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      imagesLoaded++;
      if (imagesLoaded === frames.maxIndex) {
        loadImage(frames.currentIndex);
        startAnimation();
      }
    };
    images.push(img);
  }
}

function loadImage(index) {
  if (index >= 0 && index <= frames.maxIndex) {
    const img = images[index];
    const wrapper = canvas.parentElement;

    canvas.width = wrapper.clientWidth;
    canvas.height = wrapper.clientHeight;

    const scaleX = canvas.width / img.width;
    const scaleY = canvas.height / img.height;
    const scale = Math.max(scaleX, scaleY);

    const newWidth = img.width * scale;
    const newHeight = img.height * scale;

    const offsetX = (canvas.width - newWidth) / 2;
    const offsetY = (canvas.height - newHeight) / 2;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(img, offsetX, offsetY, newWidth, newHeight);

    frames.currentIndex = index;

    // Update text based on current frame
    updateTextStage(index);
  }
}

window.addEventListener('resize', () => {
  loadImage(frames.currentIndex);
});

gsap.registerPlugin(ScrollTrigger);

function startAnimation() {
  var tl = gsap.timeline({
    scrollTrigger: {
      trigger: '.parent',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 2,
    },
  });

  tl.to(frames, {
    currentIndex: frames.maxIndex,
    snap: "currentIndex",
    onUpdate: function () {
      loadImage(Math.floor(frames.currentIndex));
    },
  });
}

preloadImages();