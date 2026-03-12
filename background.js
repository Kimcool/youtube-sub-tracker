// Background service worker - fetches videos via server API + client RSS fallback

const ALARM_NAME = 'yt-check';
const CHECK_INTERVAL = 30; // minutes
const SERVER_API = 'https://lgggg.de/youtube/api';

chrome.runtime.onInstalled.addListener(async () => {
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: CHECK_INTERVAL });

  const { channels } = await chrome.storage.local.get('channels');
  if (!channels || !channels.length) {
    try {
      const resp = await fetch(chrome.runtime.getURL('preset-channels.json'));
      const preset = await resp.json();
      if (preset.length) await chrome.storage.local.set({ channels: preset });
    } catch (e) {}
  }

  checkUpdates();
});

chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === ALARM_NAME) checkUpdates();
});

async function checkUpdates() {
  const { channels = [], days = 3 } = await chrome.storage.local.get(['channels', 'days']);
  if (!channels.length) { chrome.action.setBadgeText({ text: '' }); return; }

  let allVideos = [];

  // Primary: fetch from server API
  try {
    const ids = channels.map(ch => ch.channel_id).join(',');
    const resp = await fetch(`${SERVER_API}/feed?ids=${encodeURIComponent(ids)}&days=${days}`);
    if (resp.ok) {
      const data = await resp.json();
      if (data.videos) allVideos = data.videos;
      console.log(`[YT-Sub] Server: ${allVideos.length} videos`);
    }
  } catch (e) {
    console.log(`[YT-Sub] Server failed: ${e.message}`);
  }

  // Fallback: client-side RSS (in case server is down)
  if (allVideos.length === 0) {
    console.log('[YT-Sub] Trying client-side RSS fallback...');
    const cutoff = Date.now() - days * 24 * 3600 * 1000;
    for (const ch of channels) {
      try {
        const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${ch.channel_id}`;
        const resp = await fetch(url);
        if (!resp.ok) continue;
        const text = await resp.text();
        if (text.includes('Error 404')) continue;
        const videos = parseRSS(text, ch, cutoff);
        allVideos.push(...videos);
      } catch (e) {}
    }
  }

  allVideos.sort((a, b) => b.publishedTs - a.publishedTs);
  // Deduplicate
  const seen = new Set();
  allVideos = allVideos.filter(v => { if (seen.has(v.videoId)) return false; seen.add(v.videoId); return true; });

  await chrome.storage.local.set({ videos: allVideos, lastCheck: Date.now() });

  // Badge
  const { seen: seenIds = [] } = await chrome.storage.local.get('seen');
  const seenSet = new Set(seenIds);
  const unseen = allVideos.filter(v => !seenSet.has(v.videoId)).length;

  chrome.action.setBadgeBackgroundColor({ color: '#e33' });
  chrome.action.setBadgeText({ text: unseen > 0 ? String(unseen) : '' });
}

function parseRSS(xml, channel, cutoff) {
  const videos = [];
  const entries = xml.split('<entry>').slice(1);
  for (const entry of entries) {
    const get = tag => { const m = entry.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`)); return m ? m[1].trim() : ''; };
    const published = new Date(get('published')).getTime();
    if (published < cutoff) continue;
    const videoId = get('yt:videoId');
    videos.push({
      title: get('title'), videoId,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      channelName: channel.name, channelId: channel.channel_id,
      published: new Date(published).toISOString(), publishedTs: published,
    });
  }
  return videos;
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'refresh') {
    checkUpdates().then(() => sendResponse({ ok: true })).catch(() => sendResponse({ ok: false }));
    return true;
  }
});
