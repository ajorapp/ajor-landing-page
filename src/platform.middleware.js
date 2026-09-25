// Sets res.locals.os so every view can branch without repeating this.
// User-Agent is a hint, never proof - it is trivially spoofed.
const detect = (req) => {
  // Client Hints where the browser sends them; more reliable than the UA string.
  const hint = (req.headers['sec-ch-ua-platform'] || '').replace(/"/g, '').toLowerCase();
  if (hint === 'android') return 'android';
  if (hint === 'ios') return 'ios';

  const ua = req.headers['user-agent'] || '';
  if (/android/i.test(ua)) return 'android';
  // iPadOS reports itself as a Mac, so check for touch support alongside it.
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios';
  if (/macintosh/i.test(ua) && /mobile/i.test(ua)) return 'ios';
  return 'other';
};

const platform = (req, res, next) => {
  res.locals.os = detect(req);
  next();
};

module.exports = platform;
