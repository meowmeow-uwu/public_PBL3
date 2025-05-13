// Dữ liệu mẫu (bạn sẽ thay bằng API thực tế)
const vocabData = [
  {
    word: 'apple',
    phonetic: '/ˈæp.əl/',
    type: 'noun',
    meaning: 'quả táo',
    level: 'A1',
    course: 'Bài 1',
    example: 'I eat an apple every day.'
  },
  {
    word: 'run',
    phonetic: '/rʌn/',
    type: 'verb',
    meaning: 'chạy',
    level: 'A2',
    course: 'Bài 2',
    example: 'He can run very fast.'
  }
];
const readingData = [
  {
    title: 'The Great Adventure',
    level: 'A1',
    readCount: 2,
    lastRead: '3 ngày trước',
    note: '',
    wordCount: 150,
    suggest: 'Gợi ý học thêm 3 từ mới từ bài'
  },
  {
    title: 'At the Supermarket',
    level: 'A2',
    readCount: 1,
    lastRead: '1 tuần trước',
    note: 'Từ mới nhiều',
    wordCount: 120,
    suggest: 'Gợi ý học thêm 2 từ mới từ bài'
  }
];

// Dữ liệu mẫu cho topic
const topics = {
  food: {
    name: "🍽️ Đồ ăn & Đồ uống",
    vocab: [
      { word: "apple", type: "noun", meaning: "quả táo", level: "A1", example: "I eat an apple." }
      // ... thêm từ
    ],
    grammar: [
      { rule: "There is/There are", example: "There are apples on the table." }
      // ... thêm ngữ pháp
    ],
    reading: [
      { title: "A trip to the market", level: "A1", summary: "..." }
      // ... thêm bài đọc
    ],
    idioms: [
      { idiom: "A piece of cake", meaning: "dễ như ăn bánh" }
      // ... thêm thành ngữ
    ]
  },
  // ... các topic khác
};

// Gán tên user (demo, thực tế lấy từ API)
document.addEventListener('DOMContentLoaded', async function() {
  if (typeof window.fetchUserInfo === 'function') {
    const user = await window.fetchUserInfo();
    if (user && user.name) {
      document.getElementById('collections-username').textContent = '👤 ' + user.name;
    }
  }
  renderVocabList(vocabData);
  renderReadingList(readingData);
});

// Tabs
const tabVocab = document.getElementById('tab-vocab');
const tabReading = document.getElementById('tab-reading');
const vocabList = document.getElementById('vocab-list');
const readingList = document.getElementById('reading-list');

tabVocab.onclick = function() {
  tabVocab.classList.add('active');
  tabReading.classList.remove('active');
  vocabList.style.display = '';
  readingList.style.display = 'none';
};
tabReading.onclick = function() {
  tabReading.classList.add('active');
  tabVocab.classList.remove('active');
  vocabList.style.display = 'none';
  readingList.style.display = '';
};

// Filter
const searchInput = document.getElementById('searchInput');
const levelFilter = document.getElementById('levelFilter');
const typeFilter = document.getElementById('typeFilter');
const courseFilter = document.getElementById('courseFilter');

[searchInput, levelFilter, typeFilter, courseFilter].forEach(el => {
  el.addEventListener('input', filterVocab);
  el.addEventListener('change', filterVocab);
});

function filterVocab() {
  let filtered = vocabData.filter(item => {
    const keyword = searchInput.value.trim().toLowerCase();
    const level = levelFilter.value;
    const type = typeFilter.value;
    const course = courseFilter.value;
    return (
      (!keyword || item.word.toLowerCase().includes(keyword) || item.meaning.toLowerCase().includes(keyword)) &&
      (!level || item.level === level) &&
      (!type || item.type === type) &&
      (!course || item.course === course)
    );
  });
  renderVocabList(filtered);
}

// Render vocab cards
function renderVocabList(data) {
  vocabList.innerHTML = data.map(item => `
    <div class="vocab-card" onclick="showVocabPopup('${item.word}')">
      <div class="vocab-word">🍎 ${item.word} <span class="vocab-phonetic">${item.phonetic}</span></div>
      <div class="vocab-meta">🧠 ${item.type} | 🇻🇳 ${item.meaning} | 📘 ${item.level} – ${item.course}</div>
      <div class="vocab-example">📖 Ví dụ: "${item.example}"</div>
      <div style="color:#4285f4;font-size:0.95rem;">▶ Nhấn để xem thêm</div>
    </div>
  `).join('');
}

// Render reading cards
function renderReadingList(data) {
  readingList.innerHTML = data.map(item => `
    <div class="reading-card" onclick="showReadingPopup('${item.title}')">
      <div class="reading-title">📚 ${item.title}</div>
      <div class="reading-meta">📖 Cấp độ: ${item.level} | 🧠 Đã đọc: ${item.readCount} lần | 🕒 Lần cuối: ${item.lastRead}</div>
      <div class="reading-note">${item.note ? '📌 ' + item.note : ''} ${item.wordCount ? '🧠 Số từ: ' + item.wordCount : ''}</div>
      <div style="color:#f44336;font-size:0.95rem;">▶ Nhấn để đọc lại hoặc lưu</div>
    </div>
  `).join('');
}

// Popup vocab
window.showVocabPopup = function(word) {
  const item = vocabData.find(v => v.word === word);
  if (!item) return;
  document.getElementById('popup').innerHTML = `
    <div class="popup-content">
      <span class="popup-close" onclick="closePopup()">&times;</span>
      <h3>🍎 ${item.word} <span class="vocab-phonetic">${item.phonetic}</span></h3>
      <div>🧠 <b>${item.type}</b> | 🇻🇳 <b>${item.meaning}</b></div>
      <div>📘 <b>${item.level}</b> – <b>${item.course}</b></div>
      <div>📖 <b>Ví dụ:</b> <i>${item.example}</i></div>
      <textarea placeholder="Thêm ghi chú cá nhân..." style="width:100%;margin:12px 0;"></textarea>
      <div style="margin-top:12px;display:flex;gap:12px;">
        <button class="btn" onclick="alert('Đã lưu ghi chú!')">Lưu ghi chú</button>
        <button class="btn" onclick="alert('Đã xóa khỏi bộ sưu tập!')">Xóa khỏi bộ sưu tập</button>
      </div>
    </div>
  `;
  document.getElementById('popup').style.display = 'flex';
}

// Popup reading
window.showReadingPopup = function(title) {
  const item = readingData.find(r => r.title === title);
  if (!item) return;
  document.getElementById('popup').innerHTML = `
    <div class="popup-content">
      <span class="popup-close" onclick="closePopup()">&times;</span>
      <h3>📚 ${item.title}</h3>
      <div>📖 <b>Cấp độ:</b> ${item.level}</div>
      <div>🧠 <b>Đã đọc:</b> ${item.readCount} lần</div>
      <div>🕒 <b>Lần cuối:</b> ${item.lastRead}</div>
      <div>🧠 <b>Số từ:</b> ${item.wordCount}</div>
      <div>📌 <b>Ghi chú:</b> ${item.note || 'Chưa có'}</div>
      <div>📈 <b>${item.suggest || ''}</b></div>
      <textarea placeholder="Lưu ghi chú..." style="width:100%;margin:12px 0;"></textarea>
      <div style="margin-top:12px;display:flex;gap:12px;">
        <button class="btn" onclick="alert('Đã lưu ghi chú!')">Lưu ghi chú</button>
        <button class="btn" onclick="alert('Đã xóa khỏi bộ sưu tập!')">Xóa khỏi bộ sưu tập</button>
      </div>
    </div>
  `;
  document.getElementById('popup').style.display = 'flex';
}

window.closePopup = function() {
  document.getElementById('popup').style.display = 'none';
}

// Xử lý click vào topic
document.querySelectorAll('.topic-card').forEach(card => {
  card.onclick = function() {
    const topicKey = this.getAttribute('data-topic');
    showTopicDetail(topicKey);
  };
});

function showTopicDetail(topicKey) {
  const topic = topics[topicKey];
  if (!topic) return;
  let html = `
    <div class="topic-detail-header">
      <h2>${topic.name}</h2>
      <div class="topic-detail-tabs">
        <button class="tab-btn active" onclick="showTopicTab('${topicKey}','vocab')">📘 Từ vựng</button>
        <button class="tab-btn" onclick="showTopicTab('${topicKey}','grammar')">📙 Ngữ pháp</button>
        <button class="tab-btn" onclick="showTopicTab('${topicKey}','reading')">📕 Bài đọc</button>
        <button class="tab-btn" onclick="showTopicTab('${topicKey}','idioms')">📝 Thành ngữ</button>
      </div>
    </div>
    <div id="topic-tab-content"></div>
    <button class="btn" onclick="closeTopicDetail()">⬅ Quay lại chủ đề</button>
  `;
  document.getElementById('topic-detail').innerHTML = html;
  document.getElementById('topic-detail').style.display = '';
  document.querySelector('.collections-topics').style.display = 'none';
  showTopicTab(topicKey, 'vocab');
}

window.showTopicTab = function(topicKey, tab) {
  const topic = topics[topicKey];
  let html = '';
  if (tab === 'vocab') {
    html = topic.vocab.map(item => `
      <div class="vocab-card">
        <div class="vocab-word">🍎 ${item.word}</div>
        <div class="vocab-meta">🧠 ${item.type} | 🇻🇳 ${item.meaning} | 📘 ${item.level}</div>
        <div class="vocab-example">📖 Ví dụ: "${item.example}"</div>
      </div>
    `).join('');
  } else if (tab === 'grammar') {
    html = topic.grammar.map(item => `
      <div class="vocab-card" style="background:#fffbe6;">
        <div class="vocab-word">📙 ${item.rule}</div>
        <div class="vocab-example">📖 Ví dụ: "${item.example}"</div>
      </div>
    `).join('');
  } else if (tab === 'reading') {
    html = topic.reading.map(item => `
      <div class="reading-card">
        <div class="reading-title">📕 ${item.title}</div>
        <div class="reading-meta">Cấp độ: ${item.level}</div>
        <div class="reading-note">${item.summary || ''}</div>
      </div>
    `).join('');
  } else if (tab === 'idioms') {
    html = topic.idioms.map(item => `
      <div class="vocab-card" style="background:#e6fff7;">
        <div class="vocab-word">📝 ${item.idiom}</div>
        <div class="vocab-meta">Ý nghĩa: ${item.meaning}</div>
      </div>
    `).join('');
  }
  document.getElementById('topic-tab-content').innerHTML = html || '<div style="color:#888;">Chưa có dữ liệu</div>';
  // Đổi active tab
  document.querySelectorAll('.topic-detail-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.topic-detail-tabs .tab-btn')[['vocab','grammar','reading','idioms'].indexOf(tab)].classList.add('active');
};

window.closeTopicDetail = function() {
  document.getElementById('topic-detail').style.display = 'none';
  document.querySelector('.collections-topics').style.display = '';
};
