// Background service worker - fetches RSS via offscreen document and manages badge

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

// Ensure offscreen document exists
let creatingOffscreen;
async function ensureOffscreen() {
  const contexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
  });
  if (contexts.length) return;

  if (creatingOffscreen) {
    await creatingOffscreen;
  } else {
    creatingOffscreen = chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: ['DOM_PARSER'],
      justification: 'Fetch YouTube RSS feeds with browser cookies',
    });
    await creatingOffscreen;
    creatingOffscreen = null;
  }
}

async function fetchRSSViaOffscreen(channelId) {
  await ensureOffscreen();
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: 'fetchRSS', channelId }, (resp) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else if (resp && resp.ok) {
        resolve(resp.data);
      } else {
        reject(new Error(resp ? resp.error : 'No response'));
      }
    });
  });
}

// Direct fetch as backup
async function fetchRSSDirect(channelId) {
  const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const text = await resp.text();
  if (text.includes('Error 404') || text.includes('<!DOCTYPE html>')) throw new Error('Not RSS');
  return text;
}

async function checkUpdates() {
  const { channels = [], days = 3 } = await chrome.storage.local.get(['channels', 'days']);
  if (!channels.length) { chrome.action.setBadgeText({ text: '' }); return; }

  const cutoff = Date.now() - days * 24 * 3600 * 1000;
  let allVideos = [];
  let failCount = 0;

  for (const ch of channels) {
    let xml = null;

    // Try offscreen first (has cookies)
    try {
      xml = await fetchRSSViaOffscreen(ch.channel_id);
    } catch (e) {
      console.log(`[YT-Sub] Offscreen fail for ${ch.name}: ${e.message}`);
    }

    // Fallback to direct fetch
    if (!xml) {
      try {
        xml = await fetchRSSDirect(ch.channel_id);
      } catch (e) {
        console.log(`[YT-Sub] Direct fail for ${ch.name}: ${e.message}`);
      }
    }

    if (xml) {
      const videos = parseRSS(xml, ch, cutoff);
      allVideos.push(...videos);
    } else {
      failCount++;
    }
  }

  console.log(`[YT-Sub] Results: ${allVideos.length} videos, ${failCount}/${channels.length} failed`);

  // Server fallback if most failed
  if (failCount > channels.length * 0.5 && channels.length > 0) {
    try {
      const ids = channels.map(ch => ch.channel_id).join(',');
      const resp = await fetch(`${SERVER_API}/feed?ids=${encodeURIComponent(ids)}&days=${days}`);
      if (resp.ok) {
        const data = await resp.json();
        if (data.videos && data.videos.length > allVideos.length) {
          allVideos = data.videos;
          console.log(`[YT-Sub] Server fallback: ${allVideos.length} videos`);
        }
      }
    } catch (e) {
      console.log(`[YT-Sub] Server fallback failed: ${e.message}`);
    }
  }

  allVideos.sort((a, b) => b.publishedTs - a.publishedTs);
  const seen = new Set();
  allVideos = allVideos.filter(v => { if (seen.has(v.videoId)) return false; seen.add(v.videoId); return true; });

  await chrome.storage.local.set({ videos: allVideos, lastCheck: Date.now() });

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

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'refresh') {
    checkUpdates().then(() => sendResponse({ ok: true })).catch(() => sendResponse({ ok: false }));
    return true;
  }
  // Don't handle fetchRSS here - that's for offscreen document
});
