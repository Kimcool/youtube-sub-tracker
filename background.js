// Background service worker - fetches RSS and manages badge

const ALARM_NAME = 'yt-check';
const CHECK_INTERVAL = 30; // minutes

chrome.runtime.onInstalled.addListener(async () => {
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: CHECK_INTERVAL });

  // Import preset channels on first install
  const { channels } = await chrome.storage.local.get('channels');
  if (!channels || !channels.length) {
    try {
      const resp = await fetch(chrome.runtime.getURL('preset-channels.json'));
      const preset = await resp.json();
      await chrome.storage.local.set({ channels: preset });
    } catch (e) { /* no preset */ }
  }

  checkUpdates();
});

chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === ALARM_NAME) checkUpdates();
});

async function checkUpdates() {
  const { channels = [], days = 3 } = await chrome.storage.local.get(['channels', 'days']);
  if (!channels.length) { chrome.action.setBadgeText({ text: '' }); return; }

  const cutoff = Date.now() - days * 24 * 3600 * 1000;
  const allVideos = [];

  for (const ch of channels) {
    try {
      const resp = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${ch.channel_id}`);
      const text = await resp.text();
      const videos = parseRSS(text, ch, cutoff);
      allVideos.push(...videos);
    } catch (e) { /* skip */ }
  }

  allVideos.sort((a, b) => b.publishedTs - a.publishedTs);
  await chrome.storage.local.set({ videos: allVideos, lastCheck: Date.now() });

  // Read status
  const { seen = [] } = await chrome.storage.local.get('seen');
  const seenSet = new Set(seen);
  const unseen = allVideos.filter(v => !seenSet.has(v.videoId)).length;

  chrome.action.setBadgeBackgroundColor({ color: '#e33' });
  chrome.action.setBadgeText({ text: unseen > 0 ? String(unseen) : '' });
}

function parseRSS(xml, channel, cutoff) {
  const videos = [];
  const entries = xml.split('<entry>').slice(1);

  for (const entry of entries) {
    const get = tag => { const m = entry.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`)); return m ? m[1].trim() : ''; };
    const getAttr = (tag, attr) => { const m = entry.match(new RegExp(`<${tag}[^>]*${attr}="([^"]*)"`)); return m ? m[1] : ''; };

    const published = new Date(get('published')).getTime();
    if (published < cutoff) continue;

    const videoId = get('yt:videoId');
    videos.push({
      title: get('title'),
      videoId,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      channelName: channel.name,
      channelId: channel.channel_id,
      published: new Date(published).toISOString(),
      publishedTs: published,
    });
  }
  return videos;
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'refresh') {
    checkUpdates().then(() => sendResponse({ ok: true }));
    return true;
  }
});
