// ===== i18n =====
const I18N = {
  zh: {
    tab_videos: '📺 更新', tab_channels: '📋 频道', tab_settings: '⚙ 设置',
    refresh: '↻ 刷新', add: '添加', add_placeholder: '粘贴 YouTube 频道链接...',
    batch_add: '📦 批量添加', batch_placeholder: '每行一个频道链接...',
    batch_hint: '每行一个链接，最多 50 个', batch_submit: '批量添加',
    theme_title: '主题', prefs_title: '偏好设置',
    lang_label: '语言', days_label: '更新天数',
    theme_dark: '暗夜', theme_midnight: '深蓝', theme_light: '亮白', theme_mocha: '摩卡', theme_nord: '北极',
    empty: '📭 近 {n} 天无更新', loading: '加载中...',
    videos_info: '{v} 个视频 · {t} 更新',
    channels_count: '共 {n} 个频道',
    added: '已添加: {name}', exists: '频道已存在', resolve_fail: '无法解析频道 ID',
    add_fail: '添加失败', batch_done: '批量完成: 成功 {ok} 个，失败 {fail} 个',
    remove: '移除', no_channels: '暂无频道',
    ago_min: '{n}分钟前', ago_hour: '{n}小时前', ago_day: '{n}天前',
    days_3: '3 天', days_7: '7 天', days_15: '15 天',
  },
  en: {
    tab_videos: '📺 Videos', tab_channels: '📋 Channels', tab_settings: '⚙ Settings',
    refresh: '↻ Refresh', add: 'Add', add_placeholder: 'Paste YouTube channel URL...',
    batch_add: '📦 Batch Add', batch_placeholder: 'One channel URL per line...',
    batch_hint: 'One URL per line, max 50', batch_submit: 'Batch Add',
    theme_title: 'Theme', prefs_title: 'Preferences',
    lang_label: 'Language', days_label: 'Update Range',
    theme_dark: 'Dark', theme_midnight: 'Midnight', theme_light: 'Light', theme_mocha: 'Mocha', theme_nord: 'Nord',
    empty: '📭 No updates in {n} days', loading: 'Loading...',
    videos_info: '{v} videos · updated {t}',
    channels_count: '{n} channels',
    added: 'Added: {name}', exists: 'Channel already exists', resolve_fail: 'Cannot resolve channel ID',
    add_fail: 'Add failed', batch_done: 'Batch done: {ok} added, {fail} failed',
    remove: 'Remove', no_channels: 'No channels yet',
    ago_min: '{n}m ago', ago_hour: '{n}h ago', ago_day: '{n}d ago',
    days_3: '3 days', days_7: '7 days', days_15: '15 days',
  },
  ja: {
    tab_videos: '📺 更新', tab_channels: '📋 チャンネル', tab_settings: '⚙ 設定',
    refresh: '↻ 更新', add: '追加', add_placeholder: 'YouTubeチャンネルURLを貼り付け...',
    batch_add: '📦 一括追加', batch_placeholder: '1行に1つのURL...',
    batch_hint: '1行に1つ、最大50件', batch_submit: '一括追加',
    theme_title: 'テーマ', prefs_title: '設定',
    lang_label: '言語', days_label: '更新日数',
    theme_dark: 'ダーク', theme_midnight: 'ミッドナイト', theme_light: 'ライト', theme_mocha: 'モカ', theme_nord: 'ノルド',
    empty: '📭 {n}日間更新なし', loading: '読み込み中...',
    videos_info: '{v}本の動画 · {t}更新',
    channels_count: '{n}チャンネル',
    added: '追加: {name}', exists: '既に登録済み', resolve_fail: 'チャンネルID解析失敗',
    add_fail: '追加失敗', batch_done: '一括完了: 成功{ok}件、失敗{fail}件',
    remove: '削除', no_channels: 'チャンネルなし',
    ago_min: '{n}分前', ago_hour: '{n}時間前', ago_day: '{n}日前',
    days_3: '3日', days_7: '7日', days_15: '15日',
  },
  ko: {
    tab_videos: '📺 업데이트', tab_channels: '📋 채널', tab_settings: '⚙ 설정',
    refresh: '↻ 새로고침', add: '추가', add_placeholder: 'YouTube 채널 URL 붙여넣기...',
    batch_add: '📦 일괄 추가', batch_placeholder: '한 줄에 하나의 URL...',
    batch_hint: '한 줄에 하나, 최대 50개', batch_submit: '일괄 추가',
    theme_title: '테마', prefs_title: '환경설정',
    lang_label: '언어', days_label: '업데이트 범위',
    theme_dark: '다크', theme_midnight: '미드나이트', theme_light: '라이트', theme_mocha: '모카', theme_nord: '노르드',
    empty: '📭 {n}일간 업데이트 없음', loading: '로딩 중...',
    videos_info: '{v}개 동영상 · {t} 업데이트',
    channels_count: '{n}개 채널',
    added: '추가됨: {name}', exists: '이미 등록된 채널', resolve_fail: '채널 ID 확인 불가',
    add_fail: '추가 실패', batch_done: '일괄 완료: 성공 {ok}개, 실패 {fail}개',
    remove: '삭제', no_channels: '채널 없음',
    ago_min: '{n}분 전', ago_hour: '{n}시간 전', ago_day: '{n}일 전',
    days_3: '3일', days_7: '7일', days_15: '15일',
  },
};

let currentLang = 'zh';

function t(key, vars = {}) {
  let s = (I18N[currentLang] || I18N.zh)[key] || (I18N.zh)[key] || key;
  for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, v);
  return s;
}

function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh || el.dataset['i18nPh']); });
  // Fix placeholder attr name
  const urlIn = document.getElementById('urlIn');
  if (urlIn) urlIn.placeholder = t('add_placeholder');
  const batchIn = document.getElementById('batchInput');
  if (batchIn) batchIn.placeholder = t('batch_placeholder');
  // Update days select text
  const ds = document.getElementById('daysSelect');
  ds.options[0].text = t('days_3'); ds.options[1].text = t('days_7'); ds.options[2].text = t('days_15');
}

// ===== Tab switching =====
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t2 => t2.classList.remove('on'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('on'));
    tab.classList.add('on');
    document.getElementById('p-' + tab.dataset.tab).classList.add('on');
    if (tab.dataset.tab === 'channels') loadChannels();
  });
});

// ===== Theme =====
function applyTheme(name) {
  document.body.className = 't-' + name;
  document.querySelectorAll('.theme-btn').forEach(b => b.classList.toggle('on', b.dataset.theme === name));
  chrome.storage.local.set({ theme: name });
}
document.querySelectorAll('.theme-btn').forEach(btn => {
  btn.addEventListener('click', () => applyTheme(btn.dataset.theme));
});

// ===== Language =====
document.getElementById('langSelect').addEventListener('change', async (e) => {
  currentLang = e.target.value;
  await chrome.storage.local.set({ lang: currentLang });
  applyI18n();
  loadVideos();
});

// ===== Days =====
document.getElementById('daysSelect').addEventListener('change', async (e) => {
  const days = parseInt(e.target.value);
  await chrome.storage.local.set({ days });
  chrome.runtime.sendMessage({ action: 'refresh' });
  setTimeout(loadVideos, 2000);
});

// ===== Batch toggle =====
document.getElementById('batchToggle').addEventListener('click', () => {
  document.getElementById('batchArea').classList.toggle('on');
});

// ===== Utils =====
function ago(iso) {
  const m = Math.floor((Date.now() - new Date(iso)) / 60000);
  if (m < 60) return t('ago_min', { n: m });
  const h = Math.floor(m / 60);
  if (h < 24) return t('ago_hour', { n: h });
  return t('ago_day', { n: Math.floor(h / 24) });
}
function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

// ===== Videos =====
async function loadVideos() {
  const { videos = [], lastCheck, days = 3 } = await chrome.storage.local.get(['videos', 'lastCheck', 'days']);
  const info = document.getElementById('info');
  const list = document.getElementById('vlist');

  if (lastCheck) {
    info.textContent = t('videos_info', { v: videos.length, t: new Date(lastCheck).toLocaleTimeString() });
  }

  if (!videos.length) {
    list.innerHTML = `<div class="empty">${t('empty', { n: days })}</div>`;
    return;
  }

  list.innerHTML = videos.map(v => {
    const pub = new Date(v.published);
    const today = new Date(); today.setHours(0,0,0,0);
    const diff = Math.floor((today - new Date(pub.getFullYear(), pub.getMonth(), pub.getDate())) / 86400000);
    const dayClass = diff === 0 ? 'day-today' : diff === 1 ? 'day-yesterday' : 'day-older';
    return `<a class="vitem ${dayClass}" href="${v.url}" target="_blank">
      <div class="vtitle">${esc(v.title)}</div>
      <div class="vmeta">
        <span class="vch">${esc(v.channelName)}</span>
        <span class="vtime">${ago(v.published)}</span>
      </div>
    </a>`;
  }).join('');

  await chrome.storage.local.set({ seen: videos.map(v => v.videoId) });
  chrome.action.setBadgeText({ text: '' });
}

// ===== Refresh =====
async function refresh() {
  const btn = document.getElementById('refreshBtn');
  btn.textContent = '...';
  btn.disabled = true;
  await chrome.runtime.sendMessage({ action: 'refresh' });
  await loadVideos();
  btn.textContent = t('refresh');
  btn.disabled = false;
}
document.getElementById('refreshBtn').addEventListener('click', refresh);

// ===== Resolve channel =====
async function resolveChannel(url, serverOnly = false) {
  let cleanUrl = url.trim();
  if (cleanUrl.startsWith('@')) cleanUrl = 'https://www.youtube.com/' + cleanUrl;
  if (!cleanUrl.startsWith('http')) cleanUrl = 'https://www.youtube.com/' + cleanUrl;
  cleanUrl = cleanUrl.replace('://youtube.com/', '://www.youtube.com/');

  let channelId = null, name = '';

  // Direct channel ID in URL
  const cidMatch = cleanUrl.match(/youtube\.com\/channel\/(UC[\w-]+)/);
  if (cidMatch) {
    channelId = cidMatch[1];
  }

  // Client-side resolve (skip for batch)
  if (!channelId && !serverOnly) {
    try {
      const resp = await fetch(cleanUrl);
      if (resp.ok) {
        const text = await resp.text();
        for (const pat of [/"channelId":"(UC[\w-]+)"/, /"externalId":"(UC[\w-]+)"/, /"browseId":"(UC[\w-]+)"/]) {
          const m = text.match(pat);
          if (m) { channelId = m[1]; break; }
        }
        const nm = text.match(/"ownerChannelName":"([^"]+)"/);
        if (nm) name = nm[1];
      }
    } catch (e) {}
  }

  // Server-side fallback (or primary for batch)
  if (!channelId) {
    try {
      const resp = await fetch(`https://lgggg.de/youtube/api/resolve?url=${encodeURIComponent(cleanUrl)}`);
      const data = await resp.json();
      if (data.channel_id) { channelId = data.channel_id; name = data.name || ''; }
    } catch (e) {}
  }

  // Get name from RSS
  if (channelId && !name) {
    try {
      const rss = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`);
      const xml = await rss.text();
      const tm = xml.match(/<title>([^<]+)<\/title>/);
      if (tm) name = tm[1];
    } catch (e) { name = channelId; }
  }

  return { channelId, name, url: cleanUrl };
}

// ===== Add single channel =====
async function addChannel() {
  const input = document.getElementById('urlIn');
  const btn = document.getElementById('addBtn');
  const status = document.getElementById('statusMsg');
  const url = input.value.trim();
  if (!url) return;

  btn.disabled = true;
  status.className = 'status-msg';
  status.textContent = t('loading');

  const result = await resolveChannel(url);
  if (!result.channelId) {
    status.className = 'status-msg err';
    status.textContent = t('resolve_fail');
    btn.disabled = false;
    return;
  }

  const { channels = [] } = await chrome.storage.local.get('channels');
  if (channels.some(ch => ch.channel_id === result.channelId)) {
    status.className = 'status-msg err';
    status.textContent = t('exists');
    btn.disabled = false;
    return;
  }

  channels.push({ channel_id: result.channelId, name: result.name, url: result.url });
  await chrome.storage.local.set({ channels });
  input.value = '';
  status.className = 'status-msg ok';
  status.textContent = t('added', { name: result.name });
  loadChannels();
  chrome.runtime.sendMessage({ action: 'refresh' });
  btn.disabled = false;
}
document.getElementById('addBtn').addEventListener('click', addChannel);
document.getElementById('urlIn').addEventListener('keydown', e => { if (e.key === 'Enter') addChannel(); });

// ===== Batch add =====
async function batchAdd() {
  const textarea = document.getElementById('batchInput');
  const btn = document.getElementById('batchBtn');
  const status = document.getElementById('statusMsg');
  const lines = textarea.value.split('\n').map(l => l.trim()).filter(Boolean);

  if (!lines.length) return;
  if (lines.length > 50) {
    status.className = 'status-msg err';
    status.textContent = 'Max 50!';
    return;
  }

  btn.disabled = true;
  const { channels = [] } = await chrome.storage.local.get('channels');
  const existing = new Set(channels.map(ch => ch.channel_id));
  let ok = 0, fail = 0;

  for (let i = 0; i < lines.length; i++) {
    status.className = 'status-msg';
    status.textContent = `${i + 1} / ${lines.length}...`;

    const result = await resolveChannel(lines[i], true); // server-side only
    if (result.channelId && !existing.has(result.channelId)) {
      channels.push({ channel_id: result.channelId, name: result.name, url: result.url });
      existing.add(result.channelId);
      ok++;
    } else if (!result.channelId) {
      fail++;
    }
    // Delay between requests to avoid rate limiting
    if (i < lines.length - 1) await new Promise(r => setTimeout(r, 800));
  }

  await chrome.storage.local.set({ channels });
  status.className = 'status-msg ok';
  status.textContent = t('batch_done', { ok, fail });
  textarea.value = '';
  loadChannels();
  chrome.runtime.sendMessage({ action: 'refresh' });
  btn.disabled = false;
}
document.getElementById('batchBtn').addEventListener('click', batchAdd);

// ===== Channel list =====
async function loadChannels() {
  const { channels = [] } = await chrome.storage.local.get('channels');
  document.getElementById('chCount').textContent = t('channels_count', { n: channels.length });
  const list = document.getElementById('chList');
  if (!channels.length) {
    list.innerHTML = `<div style="color:var(--sub);text-align:center;padding:16px">${t('no_channels')}</div>`;
    return;
  }
  list.innerHTML = channels.map((ch, i) =>
    `<div class="chitem"><span>${esc(ch.name)}</span><button data-idx="${i}">${t('remove')}</button></div>`
  ).join('');
  list.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', async () => {
      const { channels: chs = [] } = await chrome.storage.local.get('channels');
      chs.splice(parseInt(btn.dataset.idx), 1);
      await chrome.storage.local.set({ channels: chs });
      loadChannels();
      chrome.runtime.sendMessage({ action: 'refresh' });
    });
  });
}

// ===== Init =====
async function init() {
  const { theme = 'light', lang, days = 3 } = await chrome.storage.local.get(['theme', 'lang', 'days']);

  // Language: saved > chrome > default zh
  currentLang = lang || (navigator.language.startsWith('zh') ? 'zh' : navigator.language.startsWith('ja') ? 'ja' : navigator.language.startsWith('ko') ? 'ko' : navigator.language.startsWith('en') ? 'en' : 'zh');

  applyTheme(theme);
  document.getElementById('langSelect').value = currentLang;
  document.getElementById('daysSelect').value = String(days);
  applyI18n();
  loadVideos();
}
init();
