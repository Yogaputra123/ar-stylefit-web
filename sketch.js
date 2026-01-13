let video;
let faceMesh;
let faces = [];
let osc; // Untuk Audio SFX

function preload() {
  // Load model FaceMesh
  faceMesh = ml5.faceMesh(options = { maxFaces: 1, refineLandmarks: true });
}

function setup() {
  // 1. Menggunakan WEBGL untuk material 3D
  createCanvas(windowWidth, windowHeight, WEBGL);

  // Setup Video Webcam
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  // Jalankan deteksi wajah
  faceMesh.detectStart(video, gotFaces);

  // 2. Setup AUDIO (Simple Synthesizer sebagai SFX)
  // Kita pakai Oscillator agar tidak perlu file mp3 eksternal
  osc = new p5.Oscillator('sine');
}

function draw() {
  background(0);

  // PENTING: Koordinat WEBGL (0,0) ada di tengah layar.
  // Koordinat Video (0,0) ada di kiri atas.
  // Kita harus menengahkan posisi video.
  translate(-width / 2, -height / 2);

  // Gambar Video sebagai latar belakang (tetap 2D tapi dalam world 3D)
  // Kita matikan depth test sebentar agar video selalu di belakang
  resetShader();
  noStroke();
  
  // Tampilkan video webcam (Mirroring agar natural)
  push();
  translate(width, 0);
  scale(-1, 1);
  // Agar video full screen proporsional
  image(video, 0, 0, width, height);
  pop();

  // VISUAL POLISH: Pencahayaan
  // Aktifkan pencahayaan untuk efek 3D
  ambientLight(60); // Cahaya dasar redup
  pointLight(255, 255, 255, width/2, height/2, 500); // Cahaya sorot dari depan
  directionalLight(255, 0, 100, -1, 0, -1); // Cahaya aksen merah/ungu dari samping

  // Logika AR: Jika wajah terdeteksi
  if (faces.length > 0) {
    let face = faces[0];
    
    // Ambil posisi hidung (titik ke-1)
    let nose = face.keypoints[1];

    // Konversi koordinat video ke koordinat layar penuh
    // (Mapping posisi dari resolusi video 640x480 ke ukuran layar Window)
    let x = map(nose.x, 0, 640, width, 0); // Dibalik karena mirroring
    let y = map(nose.y, 0, 480, 0, height);

    push();
    translate(x, y, 0); // Pindahkan objek ke hidung
    
    // 3. VISUAL POLISH: Material & Texture
    noStroke();
    specularMaterial(0, 255, 255); // Material mengkilap warna Cyan
    shininess(50); // Tingkat kilap
    
    // Animasi rotasi objek
    rotateX(frameCount * 0.02);
    rotateY(frameCount * 0.02);
    
    // Gambar Objek 3D (Torus sebagai kacamata/aksesoris abstrak)
    torus(40, 10); 
    pop();
  }
}

function gotFaces(results) {
  faces = results;
}

// 4. AUDIO INTERACTION
function mousePressed() {
  // Mainkan SFX saat layar di-tap
  userStartAudio(); // Syarat browser modern
  
  osc.start();
  osc.freq(880); // Nada A5
  osc.amp(0.5, 0.1); // Fade in cepat
  
  // Hentikan suara setelah 0.1 detik (efek 'ting')
  setTimeout(() => {
    osc.amp(0, 0.5);
    osc.stop(0.5);
  }, 100);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}