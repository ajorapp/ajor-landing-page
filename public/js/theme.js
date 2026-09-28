// Applied before paint so a dark-mode reload does not flash white.
// Loaded as a blocking script in <head>; kept external so CSP can stay script-src 'self'.
try {
  var saved = localStorage.getItem('ajor-landing-theme');
  if (saved === 'dark' || saved === 'light') document.documentElement.dataset.theme = saved;
} catch (e) {}
