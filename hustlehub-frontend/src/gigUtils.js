// src/gigUtils.js
export const CATEGORIES = ['Design', 'Writing', 'Development', 'Marketing', 'Tutoring', 'Other'];

export const CURRENCY = 'R';

// The server escapes text on the way in (for example & becomes &amp;).
// React escapes everything it renders, so decoding here is safe and
// stops titles like "Logo &amp; Branding" showing up on screen.
export const decodeEntities = (text = '') => {
  const el = document.createElement('textarea');
  el.innerHTML = text;
  return el.value;
};
