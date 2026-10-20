
const QUESTIONS = [
  {
    q: "Trong Python, lệnh nào dùng để hiển thị dữ liệu ra màn hình?",
    a: ["input()", "print()", "int()", "type()"],
    correct: 1
  },
  {
    q: "Lệnh input() dùng để làm gì?",
    a: ["In dữ liệu", "Nhập dữ liệu từ bàn phím", "Tính tổng", "Xóa dữ liệu"],
    correct: 1
  },
  {
    q: "Giá trị trả về mặc định của input() thuộc kiểu dữ liệu nào?",
    a: ["int", "float", "str", "bool"],
    correct: 2
  },
  {
    q: "Câu lệnh nào in ra dòng chữ Xin chào?",
    a: ['print("Xin chào")', 'input("Xin chào")', "int(Xin chào)", "print Xin chào"],
    correct: 0
  },
  {
    q: "Kết quả của print(2 + 3) là gì?",
    a: ["23", "2 + 3", "5", "Lỗi"],
    correct: 2
  },
  {
    q: "Lệnh nào nhập một số nguyên từ bàn phím?",
    a: ["input(int)", "int(input())", "print(int)", "str(input)"],
    correct: 1
  },
  {
    q: "Muốn nhập một số thực từ bàn phím, ta thường dùng:",
    a: ["float(input())", "print(float)", "str(float())", "input(float)"],
    correct: 0
  },
  {
    q: "Kết quả của print('A', 'B') là gì?",
    a: ["AB", "A B", "'A', 'B'", "Lỗi"],
    correct: 1
  },
  {
    q: "Tham số sep trong print() có tác dụng gì?",
    a: ["Đổi màu chữ", "Quy định ký tự phân cách", "Nhập dữ liệu", "Kết thúc chương trình"],
    correct: 1
  },
  {
    q: "Kết quả của print('A', 'B', sep='-') là gì?",
    a: ["A B", "AB", "A-B", "A,B"],
    correct: 2
  },
  {
    q: "Tham số end trong print() dùng để làm gì?",
    a: ["Quy định nội dung kết thúc sau khi in", "Nhập dữ liệu", "Đếm ký tự", "Tạo biến"],
    correct: 0
  },
  {
    q: "Kết quả của print('Hello', end='!') là gì?",
    a: ["!Hello", "Hello!", "Hello ! !", "Lỗi"],
    correct: 1
  },
  {
    q: "Nếu không chỉ định end, print() thường kết thúc bằng ký tự nào?",
    a: ["Dấu cách", "Dấu chấm", "Ký tự xuống dòng", "Dấu phẩy"],
    correct: 2
  },
  {
    q: "Muốn in hai nội dung trên cùng một dòng, có thể sử dụng:",
    a: ["end=' '", "sep='\\n' trong mọi trường hợp", "input=' '", "int=' '"],
    correct: 0
  },
  {
    q: "Kết quả của print(10, 20, sep=':') là gì?",
    a: ["1020", "10 20", "10:20", "10,20"],
    correct: 2
  },
  {
    q: "Muốn nối chuỗi nhập vào với lời chào, cách nào đúng?",
    a: ['print("Chào " + input())', "input() + print()", "print(int(input()))", "str(print())"],
    correct: 0
  },
  {
    q: "Đâu là cách nhập tên rồi lưu vào biến ten?",
    a: ["print(ten)", "ten = input()", "input = ten", "ten == input"],
    correct: 1
  },
  {
    q: "Với a = input(), nếu người dùng nhập 12 thì a là gì?",
    a: ["Số nguyên 12", "Số thực 12.0", "Chuỗi '12'", "Giá trị True"],
    correct: 2
  },
  {
    q: "Lệnh nào chuyển chuỗi số thành số nguyên?",
    a: ["str()", "float()", "input()", "int()"],
    correct: 3
  },
  {
    q: "Đoạn lệnh print('Tin', 'hoc', sep='-', end='!') in ra gì?",
    a: ["Tin hoc!", "Tin-hoc!", "Tin-hoc !", "Tin hoc"],
    correct: 1
  }
];

const $ = id => document.getElementById(id);
const letters = ["A", "B", "C", "D"];

let soundOn = true;
let audioCtx = null;
let playing = false;
let modalOpen = false;
let currentQuestion = null;
let timeLeft = 15;
let duration = 15;
let timerInterval = null;
let spawnInterval = null;
let bugs = [];
let completed = new Set();
let hitPosition = { x: 0, y: 0 };

const playfield = $("playfield");
const player = $("player");
const modal = $("questionModal");

function playTone(freq, length = 0.1, type = "sine", volume = 0.06) {
  if (!soundOn) return;

  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const now = audioCtx.currentTime;

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + length);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + length);
  } catch (error) {
    console.warn("Không phát được âm thanh:", error);
  }
}

function soundEffect(kind) {
  if (kind === "hit") {
    if (!soundOn) return;

    // Tiếng tách giòn: tiếng va chạm sắc + tiếng nứt ngắn.
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === "suspended") audioCtx.resume();

      const now = audioCtx.currentTime;
      const sampleLength = 0.075;
      const buffer = audioCtx.createBuffer(
        1,
        Math.floor(audioCtx.sampleRate * sampleLength),
        audioCtx.sampleRate
      );
      const data = buffer.getChannelData(0);

      for (let i = 0; i < data.length; i++) {
        const t = i / data.length;
        const envelope = Math.pow(1 - t, 3);
        data[i] = (Math.random() * 2 - 1) * envelope;
      }

      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;

      const highpass = audioCtx.createBiquadFilter();
      highpass.type = "highpass";
      highpass.frequency.value = 1800;

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.9, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + sampleLength);

      noise.connect(highpass);
      highpass.connect(gain);
      gain.connect(audioCtx.destination);
      noise.start(now);
      noise.stop(now + sampleLength);

      // Hai tiếng gõ rất nhanh tạo cảm giác "tách! tắc!"
      playTone(1650, 0.025, "square", 0.08);
      setTimeout(() => playTone(850, 0.035, "triangle", 0.05), 32);
    } catch (error) {
      console.warn("Không phát được tiếng đập:", error);
    }
  }

  if (kind === "good") {
    playTone(620, 0.09, "triangle", 0.07);
    setTimeout(() => playTone(880, 0.14, "sine", 0.07), 90);
  }

  if (kind === "bad") {
    playTone(260, 0.14, "sawtooth", 0.045);
  }

  if (kind === "start") {
    playTone(440, 0.08);
    setTimeout(() => playTone(620, 0.1), 90);
  }

  if (kind === "timeout") {
    playTone(300, 0.18, "triangle");
  }
}

function updateProgress() {
  $("doneCount").textContent = `${completed.size}/${QUESTIONS.length}`;
  $("progressBar").style.width = `${completed.size / QUESTIONS.length * 100}%`;

  if (completed.size === QUESTIONS.length && playing && !modalOpen) {
    finishGame();
  }
}

function randomPosition() {
  const rect = playfield.getBoundingClientRect();
  const margin = 65;
  const maxX = Math.max(margin, rect.width - margin);
  const maxY = Math.max(115, rect.height - 110);

  return {
    x: margin + Math.random() * (maxX - margin),
    y: 85 + Math.random() * Math.max(10, maxY - 85)
  };
}

function spawnBug() {
  if (!playing || modalOpen || completed.size >= QUESTIONS.length) return;

  const remaining = QUESTIONS.map((_, i) => i)
    .filter(i => !completed.has(i) && !bugs.some(b => b.id === i && b.alive));

  if (!remaining.length) return;

  const id = remaining[Math.floor(Math.random() * remaining.length)];
  const pos = randomPosition();
  const el = document.createElement("button");

  el.type = "button";
  el.className = "bug";
  el.textContent = "🦟";
  el.setAttribute("aria-label", `Đập muỗi để mở câu ${id + 1}`);
  el.style.left = `${pos.x}px`;
  el.style.top = `${pos.y}px`;

  const bug = { id, el, alive: true };
  bugs.push(bug);

  el.addEventListener("click", () => hitBug(bug));
  playfield.appendChild(el);

  // Tự di chuyển muỗi nhẹ nhàng theo thời gian.
  const moveTimer = setInterval(() => {
    if (!bug.alive || !el.isConnected || !playing) {
      clearInterval(moveTimer);
      return;
    }

    if (modalOpen) return;

    const next = randomPosition();
    el.style.left = `${next.x}px`;
    el.style.top = `${next.y}px`;
  }, 1500 + Math.random() * 1000);

  bug.moveTimer = moveTimer;
}

function removeAllBugs() {
  bugs.forEach(bug => {
    bug.alive = false;
    clearInterval(bug.moveTimer);
    bug.el.remove();
  });
  bugs = [];
}

function hitBug(bug) {
  if (!playing || modalOpen || !bug.alive || completed.has(bug.id)) return;

  modalOpen = true;
  currentQuestion = bug.id;
  bug.alive = false;
  clearInterval(bug.moveTimer);

  const rect = playfield.getBoundingClientRect();
  hitPosition = {
    x: parseFloat(bug.el.style.left) || rect.width / 2,
    y: parseFloat(bug.el.style.top) || rect.height / 2
  };

  bug.el.remove();
  $("gameMessage").textContent = "BỐP! Đang kiểm tra mặt gậy...";
  $("speech").textContent = "Để xem nào... 👀";

  $("hitFx").style.left = `${hitPosition.x}px`;
  $("hitFx").style.top = `${hitPosition.y}px`;
  $("hitFx").classList.remove("hidden");

  player.classList.remove("inspect");
  player.classList.remove("swing");
  void player.offsetWidth;
  player.classList.add("swing");

  soundEffect("hit");

  // Đập xong, nhân vật đưa gậy lên kiểm tra.
  setTimeout(() => {
    $("hitFx").classList.add("hidden");
    player.classList.remove("swing");
    void player.offsetWidth;
    player.classList.add("inspect");

    $("racketText").textContent = "KIỂM TRA!";
    $("splat").classList.add("hidden");
    $("speech").textContent = "Câu gì đây ta? 🤔";

    setTimeout(() => openQuestion(bug.id), 380);
  }, 430);
}

function openQuestion(index) {
  if (!playing) return;

  stopTimer();
  currentQuestion = index;
  timeLeft = duration;

  const q = QUESTIONS[index];
  $("questionBadge").textContent =
    `CÂU ${String(index + 1).padStart(2, "0")} / ${QUESTIONS.length}`;
  $("questionText").textContent = q.q;
  $("answerList").innerHTML = "";
  $("feedback").className = "feedback hidden";
  $("feedback").textContent = "";
  $("answerHint").textContent = "Chọn một đáp án đúng nhất nhé!";
  $("nextBtn").classList.add("hidden");

  q.a.forEach((answer, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "answer-btn";

    const letter = document.createElement("span");
    letter.className = "answer-letter";
    letter.textContent = letters[i];

    const text = document.createElement("span");
    text.textContent = answer;

    btn.append(letter, text);
    btn.addEventListener("click", () => answerQuestion(i));
    $("answerList").appendChild(btn);
  });

  modal.classList.remove("hidden");
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    timeLeft = Math.max(0, timeLeft - 1);
    updateTimerDisplay();

    if (timeLeft <= 0) timeExpired();
  }, 1000);
}

function updateTimerDisplay() {
  $("timeLeft").textContent = timeLeft;
  $("timerBar").style.width = `${timeLeft / duration * 100}%`;
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function lockAnswers() {
  $("answerList").querySelectorAll("button").forEach(btn => {
    btn.disabled = true;
  });

  stopTimer();
  $("nextBtn").classList.remove("hidden");
  $("answerHint").textContent = "Nhấn tiếp tục để săn câu hỏi tiếp theo.";
}

function showFeedback(good, message) {
  const feedback = $("feedback");
  feedback.className = `feedback ${good ? "good" : "bad"}`;
  feedback.textContent = message;
}

function answerQuestion(selected) {
  if (!modalOpen || $("answerList").querySelector("button:disabled")) return;

  const q = QUESTIONS[currentQuestion];
  const buttons = [...$("answerList").querySelectorAll(".answer-btn")];
  const good = selected === q.correct;

  buttons.forEach((btn, i) => {
    if (i === q.correct) btn.classList.add("correct");
    if (i === selected && i !== q.correct) btn.classList.add("wrong");
  });

  completed.add(currentQuestion);

  if (good) {
    showFeedback(true, "🎉 TRÚNG RỒI HEHE! 😂 Bạn đã hạ gục con muỗi kiến thức!");
    $("speech").textContent = "Trúng rồi hehe! 😎";
    $("gameMessage").textContent = "Chiến thắng! Muỗi đã bị hạ gục.";
    $("winFx").classList.remove("hidden");
    $("taunt").classList.add("hidden");

    $("racketText").textContent = "";
    $("splat").textContent = "🦟💥";
    $("splat").classList.remove("hidden");

    soundEffect("good");
  } else {
    showFeedback(false, `😜 ĐỐ ANH BẮT ĐƯỢC EM! Đáp án đúng là ${letters[q.correct]}.`);
    $("speech").textContent = "Ối, hụt rồi! 😝";
    $("gameMessage").textContent = "Muỗi đang khiêu khích bạn!";
    $("taunt").classList.remove("hidden");
    $("winFx").classList.add("hidden");

    $("racketText").textContent = "HỤT RỒI!";
    $("splat").classList.add("hidden");

    soundEffect("bad");
  }

  lockAnswers();
  updateProgress();
}

function timeExpired() {
  if (!modalOpen || $("answerList").querySelector("button:disabled")) return;

  const q = QUESTIONS[currentQuestion];
  const buttons = [...$("answerList").querySelectorAll(".answer-btn")];

  buttons.forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.correct) btn.classList.add("correct");
  });

  completed.add(currentQuestion);
  showFeedback(false, `⏰ Hết giờ rồi! Đáp án đúng là ${letters[q.correct]}.`);
  $("speech").textContent = "Nhanh lên chứ! 😜";
  $("taunt").classList.remove("hidden");
  $("racketText").textContent = "HỤT RỒI!";
  $("splat").classList.add("hidden");

  soundEffect("timeout");
  lockAnswers();
  updateProgress();
}

function continueGame() {
  stopTimer();
  modal.classList.add("hidden");
  modalOpen = false;

  $("winFx").classList.add("hidden");
  $("taunt").classList.add("hidden");
  $("splat").classList.add("hidden");
  $("racketText").textContent = "SĂN MUỖI!";

  player.classList.remove("swing", "inspect");

  if (completed.size >= QUESTIONS.length) {
    finishGame();
    return;
  }

  $("gameMessage").textContent = "Muỗi mới đang xuất hiện...";
  $("speech").textContent = "Lại đây nào! 😏";

  spawnBug();
  spawnBug();
  spawnBug();
}

function startGame() {
  resetGame(false);
  playing = true;

  $("startOverlay").classList.add("hidden");
  $("endOverlay").classList.add("hidden");
  $("gameMessage").textContent = "Bắt đầu săn muỗi!";
  soundEffect("start");

  spawnBug();
  spawnBug();
  spawnBug();

  spawnInterval = setInterval(() => {
    if (bugs.filter(b => b.alive).length < 4) spawnBug();
  }, 1400);
}

function finishGame() {
  playing = false;
  modalOpen = false;
  stopTimer();
  clearInterval(spawnInterval);
  removeAllBugs();
  modal.classList.add("hidden");

  $("endText").textContent =
    `Bạn đã hoàn thành ${completed.size}/${QUESTIONS.length} câu hỏi. Quá đỉnh! 🎉`;
  $("endOverlay").classList.remove("hidden");
  $("gameMessage").textContent = "Thử thách đã hoàn thành!";
}

function resetGame(showStart = true) {
  stopTimer();
  clearInterval(spawnInterval);
  removeAllBugs();

  playing = false;
  modalOpen = false;
  currentQuestion = null;
  completed.clear();

  $("questionModal").classList.add("hidden");
  $("endOverlay").classList.add("hidden");
  $("winFx").classList.add("hidden");
  $("taunt").classList.add("hidden");
  $("hitFx").classList.add("hidden");

  $("racketText").textContent = "SĂN MUỖI!";
  $("splat").classList.add("hidden");
  $("speech").textContent = "Lại đây nào! 😏";

  player.classList.remove("swing", "inspect");
  $("gameMessage").textContent = "Muỗi đang bay quanh đây...";
  $("timeLeft").textContent = duration;
  updateProgress();

  if (showStart) $("startOverlay").classList.remove("hidden");
}

$("startBtn").addEventListener("click", startGame);
$("restartBtn").addEventListener("click", () => resetGame(true));
$("playAgainBtn").addEventListener("click", startGame);
$("nextBtn").addEventListener("click", continueGame);

$("closeModalBtn").addEventListener("click", () => {
  // Đóng bảng không làm mất câu hỏi; người chơi có thể mở lại bằng nút tiếp tục.
  if (modalOpen) {
    $("answerHint").textContent = "Hãy chọn đáp án hoặc tiếp tục khi đã trả lời.";
  }
});

$("soundBtn").addEventListener("click", () => {
  soundOn = !soundOn;
  $("soundBtn").textContent = soundOn ? "🔊 Âm thanh: Bật" : "🔇 Âm thanh: Tắt";
  if (soundOn) soundEffect("start");
});

window.addEventListener("resize", () => {
  bugs.forEach(bug => {
    if (!bug.alive) return;
    const pos = randomPosition();
    bug.el.style.left = `${pos.x}px`;
    bug.el.style.top = `${pos.y}px`;
  });
});

updateProgress();
