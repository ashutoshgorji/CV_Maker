/*
 * CV Maker: turns plain CV text into the resume HTML.
 * Shared by the web editor (index.html) and the PDF command (make-pdf.js).
 *
 * Text format (see example-cv.txt):
 *   # Full Name                     -> name at the top
 *   email: you@example.com          -> contact lines (before the first "##")
 *   ## Section                      -> section heading
 *   ### date | title | place        -> entry with date column
 *   - text                          -> bullet point
 *   any other line                  -> plain text ("**Label:** text" makes the label bold)
 *   left || right                   -> line split into two columns
 *   **bold**, *italic*              -> inline formatting
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.CV = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Contact keys that get an icon. Anything else is shown as plain text.
  var ICONS = {
    email: '<path d="M2 5.5A1.5 1.5 0 0 1 3.5 4h17A1.5 1.5 0 0 1 22 5.5v.4l-10 6.2L2 5.9z"/><path d="M2 8.2v10.3A1.5 1.5 0 0 0 3.5 20h17a1.5 1.5 0 0 0 1.5-1.5V8.2l-10 6.2z"/>',
    phone: '<path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z"/>',
    location: '<path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/>',
    linkedin: '<path d="M20.45 2H3.55A1.55 1.55 0 0 0 2 3.55v16.9A1.55 1.55 0 0 0 3.55 22h16.9A1.55 1.55 0 0 0 22 20.45V3.55A1.55 1.55 0 0 0 20.45 2zM8.1 19H5.1V9.5h3zM6.6 8.2a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5zM19 19h-3v-4.6c0-1.1 0-2.5-1.5-2.5S12.8 13.1 12.8 14.3V19h-3V9.5h2.85v1.3h.05a3.1 3.1 0 0 1 2.8-1.55C18.5 9.25 19 11.2 19 13.7z"/>',
    birthday: '<path d="M7 2h2v2h6V2h2v2h2.5A1.5 1.5 0 0 1 21 5.5v15a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 20.5v-15A1.5 1.5 0 0 1 4.5 4H7zm-2 7v11h14V9z"/><path d="M8 12h3v3H8z"/>',
    website: '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm6.9 6h-2.95a15.7 15.7 0 0 0-1.38-3.56A8 8 0 0 1 18.9 8zM12 4.04A14 14 0 0 1 13.9 8h-3.8A14 14 0 0 1 12 4.04zM4.26 14a8 8 0 0 1 0-4h3.38a16.5 16.5 0 0 0 0 4zm.82 2h2.95a15.7 15.7 0 0 0 1.38 3.56A8 8 0 0 1 5.08 16zM8 8H5.08a8 8 0 0 1 4.33-3.56A15.7 15.7 0 0 0 8 8zm4 11.96A14 14 0 0 1 10.1 16h3.8A14 14 0 0 1 12 19.96zM14.34 14H9.66a14.7 14.7 0 0 1 0-4h4.68a14.7 14.7 0 0 1 0 4zm.25 5.56A15.7 15.7 0 0 0 15.97 16h2.95a8 8 0 0 1-4.33 3.56zM16.36 14a16.5 16.5 0 0 0 0-4h3.38a8 8 0 0 1 0 4z"/>'
  };
  var ALIASES = {
    mail: 'email', 'e-mail': 'email', tel: 'phone', mobile: 'phone', telephone: 'phone',
    address: 'location', city: 'location', 'date of birth': 'birthday', dob: 'birthday',
    birthdate: 'birthday', born: 'birthday', web: 'website', github: 'website', portfolio: 'website'
  };

  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function inline(s) {
    return escapeHtml(s.trim())
      .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
      .replace(/(^|[^*])\*(?!\s)(.+?)\*(?!\*)/g, '$1<i>$2</i>');
  }

  // Plain line, or two columns when it contains "||".
  function paragraph(s) {
    if (s.indexOf('||') !== -1) {
      return '<div class="cols">' + s.split('||').map(function (c) {
        return '<div>' + inline(c) + '</div>';
      }).join('') + '</div>';
    }
    return '<p>' + inline(s) + '</p>';
  }

  function parse(text) {
    var cv = { name: '', contacts: [], photo: '', sections: [] };
    var section = null, entry = null;

    text.replace(/\r\n?/g, '\n').split('\n').forEach(function (raw) {
      var line = raw.replace(/\s+$/, '');
      var t = line.trim();
      if (!t || /^\/\//.test(t)) return; // blank lines and // comments are ignored

      var m;
      if ((m = /^###\s*(.*)$/.exec(t))) {
        if (!section) { section = { title: '', items: [] }; cv.sections.push(section); }
        var parts = m[1].split('|').map(function (p) { return p.trim(); });
        if (parts.length === 1) parts.unshift('');
        entry = { type: 'entry', date: parts[0], title: parts[1] || '', place: parts.slice(2).join(' | '), lines: [] };
        section.items.push(entry);
      } else if ((m = /^##\s*(.*)$/.exec(t))) {
        section = { title: m[1], items: [] };
        cv.sections.push(section);
        entry = null;
      } else if ((m = /^#\s*(.*)$/.exec(t))) {
        cv.name = m[1];
      } else if (!section) {
        // Header area: "key: value" contact lines
        m = /^([A-Za-z][A-Za-z -]{0,20}):\s*(.+)$/.exec(t);
        if (m) {
          var key = m[1].trim().toLowerCase();
          key = ALIASES[key] || key;
          if (key === 'photo') cv.photo = m[2].trim();
          else cv.contacts.push({ key: key, value: m[2].trim() });
        } else {
          cv.contacts.push({ key: '', value: t });
        }
      } else {
        var bullet = /^[-•*]\s+(.*)$/.exec(t);
        var item = bullet ? { type: 'bullet', text: bullet[1] } : { type: 'text', text: t };
        (entry ? entry.lines : section.items).push(item);
      }
    });
    return cv;
  }

  function renderLines(lines) {
    var html = '', list = false;
    lines.forEach(function (l) {
      if (l.type === 'bullet') {
        if (!list) { html += '<ul>'; list = true; }
        html += '<li>' + inline(l.text) + '</li>';
      } else {
        if (list) { html += '</ul>'; list = false; }
        html += paragraph(l.text);
      }
    });
    if (list) html += '</ul>';
    return html;
  }

  function contactHtml(c) {
    var icon = ICONS[c.key];
    var value = inline(c.value);
    var svg = icon ? '<svg viewBox="0 0 24 24" aria-hidden="true">' + icon + '</svg>' : '';
    return '<span class="contact">' + svg + value + '</span>';
  }

  /**
   * Render CV text to HTML.
   * options.photo: image URL/data URL to use (overrides "photo:" line in the text).
   */
  function render(text, options) {
    options = options || {};
    var cv = parse(text);
    var photo = options.photo !== undefined ? options.photo : cv.photo;
    var html = '<div class="cv">';

    html += '<header class="cv-header"><div class="cv-head-text">';
    html += '<h1>' + inline(cv.name) + '</h1>';
    html += '<div class="contacts">' + cv.contacts.map(contactHtml).join('') + '</div>';
    html += '</div>';
    if (photo) html += '<img class="photo" src="' + escapeHtml(photo) + '" alt="">';
    html += '</header>';

    cv.sections.forEach(function (s) {
      html += '<section>';
      if (s.title) html += '<h2>' + inline(s.title) + '</h2>';
      var loose = [];
      var flush = function () { if (loose.length) { html += '<div class="block">' + renderLines(loose) + '</div>'; loose = []; } };
      s.items.forEach(function (it) {
        if (it.type !== 'entry') { loose.push(it); return; }
        flush();
        var head = '';
        if (it.title) head += '<b>' + inline(it.title) + (it.place ? ',' : '') + '</b>';
        if (it.place) head += ' <i>' + inline(it.place) + '</i>';
        html += '<div class="entry"><div class="date">' + inline(it.date) + '</div><div class="body">' +
          (head ? '<div class="entry-head">' + head + '</div>' : '') + renderLines(it.lines) + '</div></div>';
      });
      flush();
      html += '</section>';
    });

    return html + '</div>';
  }

  return { parse: parse, render: render };
});
