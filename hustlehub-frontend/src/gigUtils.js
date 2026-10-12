export const CATEGORIES = ['Design', 'Writing', 'Development', 'Marketing', 'Tutoring', 'Other'];

export const CURRENCY = 'R';

// Prevents raw HTML entities (like &#x27;) from rendering directly to the DOM
export const decodeEntities = (text = '') => {
  const el = document.createElement('textarea');
  el.innerHTML = text;
  return el.value;
};