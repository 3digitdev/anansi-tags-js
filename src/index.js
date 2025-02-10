const OPEN = {
    // Decoration
    bold: '1',
    dim: '2',
    italic: '3',
    under: '4',
    blink: '5',
    strike: '9',
    frame: '51',
    circle: '52',
    overline: '53',
    // Foreground Colors
    black: '30',
    red: '31',
    green: '32',
    yellow: '33',
    blue: '34',
    magenta: '35',
    cyan: '36',
    white: '37',
    // Background Colors
    bg_black: '40',
    bg_red: '41',
    bg_green: '42',
    bg_yellow: '43',
    bg_blue: '44',
    bg_magenta: '45',
    bg_cyan: '46',
}
const CLOSE = {
    // Decoration
    '/bold': '22',
    '/dim': '22',
    '/italic': '23',
    '/under': '24',
    '/blink': '25',
    '/strike': '29',
    '/frame': '54',
    '/circle': '54',
    '/overline': '55',
    // Foreground Colors
    '/fg': '39',
    // Background Colors
    '/bg': '49',
    // End all formatting
    '/': '0',
}
const ESC = '\x1b['
const LINK_PREFIX = '\x1b]8;;'
const LINK_SUFFIX = '\x1b\x5c'
// Matches all ansi regex tags that are supported in a string
const ANSI_REGEX = new RegExp(/\x1b\[\d+(;\d*)*m|\x1b]8;;[^\\]*\x1b\x5c/g)
// Captures the _formatting codes_ for the ANSI
const TAG_ANSI_BASIC_REGEX = new RegExp(/\x1b\[(\d+(?:;\d*)*)m/g)
// Captures the _link ref_ for the ANSI
const TAG_ANSI_LINK_REGEX = new RegExp(/\x1b]8;;([^\\]*)\x1b\x5c/g)
const TAG_ANSI_LINK_STRIP_REGEX = new RegExp(/\x1b]8;;([^\\]*)\x1b\x5c[^\\]*\x1b]8;;\x1b\x5c/g);
const ANSI = {...OPEN, ...CLOSE}
const TAG_REGEX = new RegExp(`(\\[(?:(?:(?:${Object.keys(ANSI).join('|')})\\s*)*)+])`, 'g')
const LINK_REGEX = new RegExp(/\[link=(?<url>[^\]]*)](?<txt>.*)\[\/link]/g)

const parseBasicAnsi = (_, codes, ...__) => {
  const tags = codes.split(';').reduce((acc, code) => {
    if (code === '') {
      return acc;
    }
    for (const [k, v] of Object.entries(ANSI)) {
      if (v === code) {
        return [...acc, k];
      }
    }
    throw new Error(`${code} is not a supported ANSI code`);
  }, []);
  return `[${tags.join(' ')}]`;
}

const parseBasicTags = (_, tags, ...__) => {
  const ansi = tags.replace(/[\[\]]/gm, '').split(' ').reduce((acc, tag, i) => {
    const code = ANSI[tag];
    return (code === undefined) ? acc : `${acc}${i > 0 ? ';' : ''}${code}`;
  }, '');
  return `${ESC}${ansi}m`;
}

const stripAnsi = (ansiStr, keepUrl = false) => {
  if (keepUrl) {
    ansiStr = ansiStr.replace(
      TAG_ANSI_LINK_STRIP_REGEX, 
      (_, text, ...__) => text
    )
  }
  return ansiStr.replace(ANSI_REGEX, '');
}

const parseAnsi = (ansiStr) => {
  return ansiStr
    .replace(TAG_ANSI_BASIC_REGEX, parseBasicAnsi)
    .replace(
      TAG_ANSI_LINK_REGEX,
      (_, linkRef, ...__) => linkRef ? `[link=${linkRef}]` : '[/link]',
    );
};

const stripTags = (tagStr, keepUrl = false) => {
  return tagStr
    .replace(TAG_REGEX, '')
    .replace(
      LINK_REGEX,
      (_, url, txt, __) => keepUrl ? url : txt,
    );
}

const parseTags = (tagStr) => {
  return tagStr
    .replace(TAG_REGEX, parseBasicTags)
    .replace(
      LINK_REGEX,
      (_, url, txt, ...__) => `${LINK_PREFIX}${url}${LINK_SUFFIX}${txt}${LINK_PREFIX}${LINK_SUFFIX}`,
    );
}

export { parseAnsi, parseTags, stripAnsi, stripTags };