#!/usr/bin/env node
/**
 * VO-to-Slides Generator
 * Reads a slide spec JSON + theme JSON → produces a .pptx
 *
 * Usage: node generate.js --spec spec.json --theme theme.json --output slides.pptx
 */

const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

// --- CLI args ---
const args = {};
process.argv.slice(2).forEach((a, i, arr) => {
  if (a.startsWith("--")) args[a.slice(2)] = arr[i + 1];
});
const SPEC_PATH = args.spec || "spec.json";
const THEME_PATH = args.theme || "theme.json";
const OUTPUT_PATH = args.output || "slides.pptx";

// --- Load config ---
const spec = JSON.parse(fs.readFileSync(SPEC_PATH, "utf8"));
const T = JSON.parse(fs.readFileSync(THEME_PATH, "utf8"));
const C = T.colors;

// --- Icon rendering ---
function renderSvg(IC, color, size) {
  return ReactDOMServer.renderToStaticMarkup(React.createElement(IC, { color, size: String(size) }));
}
async function iconPng(IC, color) {
  const svg = renderSvg(IC, color || "#000000", 256);
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}
function fileB64(fp) {
  const full = path.resolve(fp);
  if (!fs.existsSync(full)) { console.warn("Missing asset: " + full); return null; }
  return "image/png;base64," + fs.readFileSync(full).toString("base64");
}

// --- Build icon map ---
async function buildIcons() {
  const FA = require("react-icons/fa");
  const MD = require("react-icons/md");
  const map = {
    brain: [FA.FaBrain, "#" + C.black],
    wrench: [FA.FaWrench, "#" + C.black],
    file: [FA.FaFileAlt, "#" + C.black],
    fileGrey: [FA.FaFileAlt, "#" + C.grey],
    fileAccent: [FA.FaFileAlt, "#" + C.accent],
    globe: [FA.FaGlobe, "#" + C.black],
    globeW: [FA.FaGlobe, "#FFFFFF"],
    db: [FA.FaDatabase, "#" + C.black],
    dbW: [FA.FaDatabase, "#FFFFFF"],
    plug: [FA.FaPlug, "#" + C.black],
    plugW: [FA.FaPlug, "#FFFFFF"],
    terminal: [FA.FaTerminal, "#" + C.black],
    cog: [FA.FaCog, "#" + C.grey],
    cogs: [FA.FaCogs, "#" + C.grey],
    cogsB: [FA.FaCogs, "#" + C.black],
    folder: [FA.FaFolder, "#" + C.accent],
    folderOpen: [FA.FaFolderOpen, "#" + C.accent],
    bulb: [FA.FaLightbulb, "#DDAA00"],
    bulbGrey: [FA.FaLightbulb, "#" + C.greyLight],
    grad: [FA.FaGraduationCap, "#" + C.black],
    medal: [FA.FaMedal, "#" + C.accent],
    question: [FA.FaQuestion, "#" + C.accent],
    questionRed: [FA.FaQuestion, "#" + C.danger],
    questionGrey: [FA.FaQuestion, "#" + C.grey],
    xCircle: [FA.FaTimesCircle, "#" + C.danger],
    check: [FA.FaCheckCircle, "#" + C.green],
    play: [FA.FaPlay, "#" + C.red],
    book: [FA.FaBook, "#" + C.grey],
    bookAccent: [FA.FaBook, "#" + C.accent],
    bookGrey: [FA.FaBook, "#" + C.greyLight],
    bookOpen: [FA.FaBookOpen, "#" + C.accent],
    bookOpenW: [FA.FaBookOpen, "#FFFFFF"],
    bookOpenB: [FA.FaBookOpen, "#" + C.black],
    userTie: [FA.FaUserTie, "#" + C.black],
    user: [FA.FaUser, "#" + C.black],
    handshake: [FA.FaHandshake, "#" + C.sage],
    handshakeB: [FA.FaHandshake, "#" + C.black],
    headset: [FA.FaHeadset, "#" + C.accent],
    headsetB: [FA.FaHeadset, "#" + C.black],
    calc: [FA.FaCalculator, "#" + C.black],
    gavel: [FA.FaGavel, "#" + C.black],
    envelope: [FA.FaEnvelope, "#" + C.grey],
    envelopeW: [FA.FaEnvelope, "#FFFFFF"],
    chart: [FA.FaChartBar, "#" + C.grey],
    chartW: [FA.FaChartBar, "#FFFFFF"],
    bullseye: [FA.FaBullseye, "#" + C.accent],
    comment: [FA.FaComment, "#" + C.grey],
    commentA: [FA.FaComment, "#" + C.accent],
    comments: [FA.FaComments, "#" + C.accent],
    commentsW: [FA.FaComments, "#FFFFFF"],
    clipboard: [FA.FaClipboardList, "#" + C.black],
    clipCheck: [FA.FaClipboardCheck, "#" + C.sage],
    horn: [FA.FaBullhorn, "#" + C.black],
    star: [FA.FaStar, "#" + C.accent],
    rocket: [FA.FaRocket, "#" + C.accent],
    laptop: [FA.FaLaptopCode, "#" + C.black],
    github: [FA.FaGithub, "#" + C.black],
    share: [FA.FaShareAlt, "#4285F4"],
    fileCode: [FA.FaFileCode, "#" + C.accent],
    warn: [FA.FaExclamationTriangle, "#" + C.danger],
    search: [FA.FaSearch, "#" + C.black],
    searchA: [FA.FaSearch, "#" + C.accent],
    robot: [FA.FaRobot, "#" + C.grey],
    astW: [FA.FaAsterisk, "#FFFFFF"],
    calW: [MD.MdCalendarToday, "#FFFFFF"],
  };

  const I = {};
  console.log("Rendering " + Object.keys(map).length + " icons...");
  for (const [k, [Comp, color]] of Object.entries(map)) {
    I[k] = await iconPng(Comp, color);
  }
  return I;
}

// --- Slide helpers ---
let P, I;

function ns() { const s = P.addSlide(); s.background = { color: T.background }; return s; }
function rr(s, x, y, w, h, c) { s.addShape(P.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: c || C.card }, rectRadius: 0.15 }); }
function rc(s, x, y, w, h, c) { s.addShape(P.shapes.RECTANGLE, { x, y, w, h, fill: { color: c } }); }
function ov(s, x, y, d, c) { s.addShape(P.shapes.OVAL, { x, y, w: d, h: d, fill: { color: c } }); }
function ic(s, k, x, y, sz) { if (I[k]) s.addImage({ data: I[k], x, y, w: sz || 0.5, h: sz || 0.5 }); }
function cl(s, x, y, sz) {
  sz = sz || 0.7; rr(s, x, y, sz, sz, C.red);
  const q = sz * 0.55, o = (sz - q) / 2;
  s.addImage({ data: I.astW, x: x + o, y: y + o, w: q, h: q });
}
function tt(s, t, x, y, w, fs) {
  s.addText(t, { x: x || 0.6, y: y || 0.3, w: w || 8.8, h: 0.7, fontSize: fs || T.sizes.heading, fontFace: T.fonts.heading, color: C.black, bold: true, margin: 0 });
}
function st(s, t, x, y, w, fs) {
  s.addText(t, { x, y, w: w || 8, h: 0.5, fontSize: fs || T.sizes.body, fontFace: T.fonts.body, color: C.grey, margin: 0 });
}
function ct(s, t, x, y, w, fs, c) {
  s.addText(t, { x: x || 0, y, w: w || 10, h: 1, fontSize: fs || T.sizes.title, fontFace: T.fonts.heading, color: c || C.black, bold: true, align: "center", margin: 0 });
}
function lb(s, t, x, y, w, fs, c) {
  s.addText(t, { x, y, w: w || 3, h: 0.5, fontSize: fs || T.sizes.body, fontFace: T.fonts.body, color: c || C.black, bold: true, align: "center", margin: 0 });
}
function ar(s, x, y, w) { s.addShape(P.shapes.LINE, { x, y, w, h: 0, line: { color: C.black, width: 2, endArrowType: "triangle" } }); }
function arD(s, x, y, h, c) { s.addShape(P.shapes.LINE, { x, y, w: 0, h, line: { color: c || C.black, width: 2, endArrowType: "triangle" } }); }
function dash(s, x, y, w) { s.addShape(P.shapes.LINE, { x, y, w, h: 0, line: { color: C.danger, width: 2, dashType: "dash" } }); }
function lp(s, x, y) { s.addText("\u21BB", { x, y, w: 0.6, h: 0.5, fontSize: 22, fontFace: "Arial", color: C.black, align: "center", valign: "middle", margin: 0 }); }
function bigArr(s, x, y) { s.addText("\u2192", { x, y, w: 1, h: 1, fontSize: 48, fontFace: "Arial", color: C.accent, bold: true, align: "center", valign: "middle", margin: 0 }); }
function resolveColor(key) { return C[key] || key || C.accent; }

// ==============================================
// SLIDE TYPE RENDERERS
// ==============================================
const renderers = {

  chapter_title(d) {
    const s = ns();
    const mainIcon = d.icon || "search";
    ic(s, mainIcon === "claude" ? null : mainIcon, 4.2, 1.2, 1.5);
    if (mainIcon === "claude") cl(s, 4.3, 1.3, 1.2);
    if (d.secondary_icon) ic(s, d.secondary_icon, 5.4, 1.0, 0.6);
    ct(s, d.title, 0, 3.2, 10, T.sizes.title);
  },

  credit(d) {
    const s = ns();
    rr(s, 1.5, 1.2, 7, 3.2, C.white);
    rr(s, 2, 1.6, 1, 1, C.card);
    ic(s, "play", 2.25, 1.85, 0.5);
    s.addText(d.title, { x: 3.3, y: 1.6, w: 4.5, h: 1.2, fontSize: 22, fontFace: T.fonts.heading, color: C.black, bold: true, margin: 0 });
    s.addText("-- " + d.attribution, { x: 3.3, y: 2.8, w: 4.5, h: 0.4, fontSize: 14, fontFace: T.fonts.body, color: C.accent, bold: true, margin: 0 });
    if (d.note) st(s, d.note, 3.3, 3.3, 4.5, 12);
  },

  single_concept(d) {
    const s = ns();
    tt(s, d.title);
    if (d.subtitle) st(s, d.subtitle, 0.6, 0.9);
    if (d.card) rr(s, 2.5, 1.8, 5, 3.2, C.card);
    if (d.main_icon === "claude") cl(s, 4.25, 2.2, d.main_icon_size || 1.2);
    else ic(s, d.main_icon, 4.25, 2.2, d.main_icon_size || 1.5);
    if (d.supporting_icons) {
      d.supporting_icons.forEach((si, i) => {
        const sx = 3.0 + i * 1.6;
        if (si.icon === "claude") cl(s, sx, 4.0, 0.6);
        else ic(s, si.icon, sx, 4.0, 0.6);
      });
    }
  },

  icon_grid(d) {
    const s = ns();
    tt(s, d.title);
    if (d.subtitle) st(s, d.subtitle, 0.6, 0.9);
    const cols = d.columns || 3;
    d.items.forEach((item, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const tx = 1.5 + col * 2.5, ty = 1.8 + row * 1.8;
      rr(s, tx, ty, 2, 1.4, C.card);
      ic(s, item.icon, tx + 0.7, ty + 0.15, 0.6);
      lb(s, item.label, tx, ty + 0.85, 2, 13);
    });
  },

  tagged_concept(d) {
    const s = ns();
    tt(s, d.title);
    if (d.subtitle) st(s, d.subtitle, 0.6, 0.9);
    rr(s, 3, 1.6, 4, 3.5, C.white);
    ic(s, d.main_icon, 4.5, 1.9, 1.2);
    (d.tags || []).forEach((tag, i) => {
      rr(s, 3.3 + i * 1.3, 3.6, 1.2, 0.4, resolveColor(tag.color));
      s.addText(tag.text, { x: 3.3 + i * 1.3, y: 3.6, w: 1.2, h: 0.4, fontSize: 11, fontFace: T.fonts.body, color: C.white, bold: true, align: "center", valign: "middle", margin: 0 });
    });
  },

  equation(d) {
    const s = ns();
    tt(s, d.title);
    d.terms.forEach((term, i) => {
      const tx = 0.8 + i * 2.2;
      ic(s, term.icon, tx, 2.2, 1.0);
      lb(s, term.label, tx - 0.25, 3.3, 1.5, 14);
      if (i < d.terms.length - 1) {
        s.addText("+", { x: tx + 1.3, y: 2.4, w: 0.5, h: 0.8, fontSize: 36, fontFace: T.fonts.heading, color: C.accent, bold: true, align: "center", valign: "middle", margin: 0 });
      }
    });
    const eqX = 0.8 + d.terms.length * 2.2 - 0.9;
    s.addText("=", { x: eqX, y: 2.4, w: 0.5, h: 0.8, fontSize: 36, fontFace: T.fonts.heading, color: C.accent, bold: true, align: "center", valign: "middle", margin: 0 });
    rr(s, eqX + 0.8, 1.8, 2.2, 2.2, C.card);
    cl(s, eqX + 1.2, 2.3, 0.7);
    lp(s, eqX + 1.6, 2.1);
    ic(s, "laptop", eqX + 1.7, 2.9, 0.5);
    lb(s, d.result.label, eqX + 0.8, 4.1, 2.2, 16);
  },

  agent_card(d) {
    const s = ns();
    tt(s, d.title);
    rr(s, 2.5, 1.2, 5, 3.8, C.card);
    ct(s, d.card_label, 2.5, 1.3, 5, T.sizes.subheading);
    cl(s, 3.4, 2.2, 0.8);
    lp(s, 4.4, 2.0);
    ic(s, d.tool_icon, 5.6, 2.3, 0.7);
    (d.supporting_icons || []).forEach((ik, i) => ic(s, ik, 3.2 + i * 1.1, 3.8, 0.45));
  },

  card_row(d) {
    const s = ns();
    tt(s, d.title);
    const w = 2.0, gap = 0.3;
    const total = d.cards.length * w + (d.cards.length - 1) * gap;
    const startX = (10 - total) / 2;
    d.cards.forEach((card, i) => {
      const cx = startX + i * (w + gap);
      rr(s, cx, 1.4, w, 3.2, C.card);
      s.addText(card.label, { x: cx, y: 1.5, w, h: 0.5, fontSize: 14, fontFace: T.fonts.heading, color: C.black, bold: true, align: "center", margin: 0 });
      cl(s, cx + 0.3, 2.5, 0.6);
      lp(s, cx + 0.9, 2.3);
      ic(s, card.tool_icon, cx + 1.1, 3.0, 0.5);
    });
  },

  broken_grid(d) {
    const s = ns();
    tt(s, d.title);
    const positions = [[1,1.5],[3,1.3],[5,1.6],[7,1.4],[1.5,3.2],[3.5,3],[5.5,3.3],[7.5,3.1]];
    const count = Math.min(d.count || 8, positions.length);
    for (let i = 0; i < count; i++) { const [ax, ay] = positions[i]; rr(s, ax, ay, 1.2, 1.0, C.card); cl(s, ax + 0.25, ay + 0.15, 0.5); }
    dash(s, 2.2, 2.0, 0.8); dash(s, 4.2, 2.1, 0.8); dash(s, 6.2, 1.9, 0.8);
    dash(s, 2.7, 3.5, 0.8); dash(s, 4.7, 3.3, 0.8);
    ic(s, "xCircle", 8.5, 4.5, 0.7);
    if (d.subtitle) st(s, d.subtitle, 1.5, 4.8, 7);
  },

  comparison(d) {
    const s = ns();
    rr(s, 0.8, 1.0, 3.5, 3.5, C.card);
    ic(s, d.left.icon, 1.8, 1.5, 1.5);
    lb(s, d.left.label, 0.8, 3.3, 3.5, 22);
    s.addText(d.symbol || "\u2260", { x: 4.3, y: 2.0, w: 1.4, h: 1.4, fontSize: 72, fontFace: T.fonts.heading, color: resolveColor(d.symbol_color), bold: true, align: "center", valign: "middle", margin: 0 });
    rr(s, 5.7, 1.0, 3.5, 3.5, C.card);
    ic(s, d.right.icon, 6.7, 1.5, 1.0);
    if (d.right.secondary_icon) ic(s, d.right.secondary_icon, 7.0, 2.6, 0.6);
    lb(s, d.right.label, 5.7, 3.3, 3.5, 22);
  },

  option_card(d) {
    const s = ns();
    rr(s, 0.5, 0.4, 1.5, 0.5, resolveColor(d.option_color));
    s.addText(d.option_label, { x: 0.5, y: 0.4, w: 1.5, h: 0.5, fontSize: 16, fontFace: T.fonts.heading, color: C.white, bold: true, align: "center", valign: "middle", margin: 0 });
    rr(s, 1.5, 1.2, 7, 3.8, C.card);
    ic(s, d.main_icon, 3.2, 1.6, 1.5);
    (d.scatter_icons || []).forEach((ik, i) => ic(s, ik, 5.8 + (i % 3) * 0.5, 1.6 + Math.floor(i / 3) * 0.8, 0.6));
    ct(s, d.caption, 1.5, 3.8, 7, T.sizes.subheading);
  },

  option_pick(d) {
    const s = ns();
    ct(s, d.title, 0, 0.3, 10, 34);
    rr(s, 1, 1.5, 3.5, 3, C.cardLight);
    ic(s, d.left.icon, 2.2, 1.8, 1.0);
    ic(s, "xCircle", 3.3, 1.6, 0.7);
    lb(s, d.left.label, 1, 3.4, 3.5, 16, C.greyLight);
    rr(s, 5.5, 1.5, 3.5, 3, C.card);
    s.addShape(P.shapes.ROUNDED_RECTANGLE, { x: 5.5, y: 1.5, w: 3.5, h: 3, line: { color: C.green, width: 3 }, rectRadius: 0.15 });
    ic(s, d.right.icon, 6.6, 1.8, 1.0);
    ic(s, "check", 7.8, 1.6, 0.7);
    lb(s, d.right.label, 5.5, 3.4, 3.5, 16);
  },

  missing_piece(d) {
    const s = ns();
    tt(s, d.title);
    rr(s, 2.5, 1.3, 5, 3, C.card);
    cl(s, 3.5, 1.8, 0.9);
    lp(s, 4.6, 1.7);
    s.addShape(P.shapes.ROUNDED_RECTANGLE, { x: 5.5, y: 1.8, w: 1.2, h: 1.2, line: { color: C.grey, width: 2, dashType: "dash" } });
    ic(s, "questionGrey", 5.75, 2.05, 0.7);
    ct(s, d.caption, 2.5, 3.4, 5, T.sizes.subheading);
    if (d.attribution) s.addText(d.attribution, { x: 2.5, y: 3.9, w: 5, h: 0.4, fontSize: 13, fontFace: T.fonts.body, color: C.accent, align: "center", margin: 0 });
  },

  transition_diagram(d) {
    const s = ns();
    tt(s, d.title);
    for (let i = 0; i < (d.left.count || 4); i++) { rr(s, 0.5, 1.2 + i * 1.0, 1.8, 0.8, C.cardLight); cl(s, 0.7, 1.3 + i * 1.0, 0.4); }
    ic(s, "xCircle", 1.7, 2.5, 0.6);
    bigArr(s, 3.0, 2.3);
    rr(s, 4.5, 1.5, 2.5, 2.5, C.card);
    ct(s, "Agent", 4.5, 1.55, 2.5, 16);
    cl(s, 5.0, 2.2, 0.7); lp(s, 5.7, 2.1); ic(s, "laptop", 6.0, 2.7, 0.5);
    ar(s, 7.0, 2.8, 0.8);
    s.addShape(P.shapes.ROUNDED_RECTANGLE, { x: 8.0, y: 1.3, w: 1.7, h: 3.2, line: { color: C.grey, width: 1 }, rectRadius: 0.1 });
    ct(s, "Filesystem", 8.0, 1.3, 1.7, 12);
    for (let i = 0; i < 3; i++) { rr(s, 8.15, 1.9 + i * 0.8, 1.4, 0.55, C.lavender); lb(s, "Skill", 8.15, 1.9 + i * 0.8, 1.4, 12); }
  },

  file_tree(d) {
    const s = ns();
    tt(s, d.title);
    rr(s, 2.5, 1.3, 5, 3.5, C.white);
    const colorMap = { blue: "1A6FB5", orange: C.accent, purple: "7B5EA7" };
    s.addText(d.folder + "/", { x: 3.0, y: 1.6, w: 4, h: 0.5, fontSize: 18, fontFace: T.fonts.code, color: C.black, bold: true, margin: 0 });
    d.files.forEach((f, i) => {
      const prefix = i < d.files.length - 1 ? "\u251C " : "\u2514 ";
      const fc = colorMap[f.color] || C.accent;
      s.addText(prefix + f.name, { x: 3.3, y: 2.2 + i * 0.5, w: 3.5, h: 0.4, fontSize: 15, fontFace: T.fonts.code, color: fc, margin: 0 });
    });
  },

  checklist(d) {
    const s = ns();
    tt(s, d.title);
    rr(s, 1.5, 1.1, 7, 4, C.white);
    d.items.forEach((item, i) => {
      rc(s, 2.0, 1.5 + i * 0.9, 0.06, 0.6, resolveColor(item.color));
      ic(s, item.icon, 2.3, 1.5 + i * 0.9, 0.5);
      s.addText(item.label, { x: 3.0, y: 1.5 + i * 0.9, w: 4, h: 0.5, fontSize: 20, fontFace: T.fonts.heading, color: C.black, bold: true, margin: 0 });
    });
  },

  hub_spoke(d) {
    const s = ns();
    tt(s, d.title);
    if (d.center === "claude") cl(s, 4.5, 2.2, 0.9);
    else ic(s, d.center, 4.5, 2.2, 0.9);
    const positions = [[2.2,1.2],[6.8,1.2],[1.5,3.5],[7.5,3.5],[4.0,4.5],[5.5,0.9]];
    const sc = resolveColor(d.spoke_color);
    d.spokes.forEach((sp, i) => {
      if (i >= positions.length) return;
      const [bx, by] = positions[i];
      rr(s, bx, by, 1.5, 0.55, sc);
      lb(s, sp.label, bx, by, 1.5, 12, C.black);
    });
  },

  dual_playbook(d) {
    const s = ns();
    tt(s, d.title);
    // Left playbook
    rr(s, 0.8, 1.2, 4, 3.8, C.white);
    rc(s, 0.8, 1.2, 0.08, 3.8, resolveColor(d.left.color));
    ic(s, d.left.icon, 1.2, 1.5, 0.6);
    s.addText(d.left.header, { x: 2.0, y: 1.5, w: 2.5, h: 0.5, fontSize: 16, fontFace: T.fonts.heading, color: C.black, bold: true, margin: 0 });
    for (let i = 0; i < 3; i++) {
      ov(s, 1.5 + i * 1.3, 2.6, 0.5, resolveColor(d.left.color));
      s.addText(String(i + 1), { x: 1.5 + i * 1.3, y: 2.6, w: 0.5, h: 0.5, fontSize: 16, fontFace: T.fonts.heading, color: C.white, bold: true, align: "center", valign: "middle", margin: 0 });
      if (i < 2) ar(s, 2.1 + i * 1.3, 2.85, 0.7);
    }
    // Right playbook
    rr(s, 5.2, 1.2, 4, 3.8, C.white);
    rc(s, 5.2, 1.2, 0.08, 3.8, resolveColor(d.right.color));
    ic(s, d.right.icon, 5.6, 1.5, 0.6);
    s.addText(d.right.header, { x: 6.4, y: 1.5, w: 2.5, h: 0.5, fontSize: 16, fontFace: T.fonts.heading, color: C.black, bold: true, margin: 0 });
    ov(s, 6.7, 2.5, 1.0, resolveColor(d.right.color));
    s.addText("?", { x: 6.7, y: 2.5, w: 1.0, h: 1.0, fontSize: 28, fontFace: T.fonts.heading, color: C.white, bold: true, align: "center", valign: "middle", margin: 0 });
  },

  before_after(d) {
    const s = ns();
    tt(s, d.title);
    rr(s, 0.5, 1.2, 4, 3.8, C.cardLight);
    lb(s, "Before", 0.5, 1.3, 4, 14, C.danger);
    for (let i = 0; i < (d.before.count || 8); i++) {
      const cx = 1.0 + (i % 4) * 0.85, cy = 1.9 + Math.floor(i / 4) * 1.2;
      rr(s, cx, cy, 0.7, 0.7, C.card); cl(s, cx + 0.1, cy + 0.1, 0.4);
    }
    ic(s, "xCircle", 3.6, 4.0, 0.6);
    bigArr(s, 4.5, 2.5);
    rr(s, 5.5, 1.2, 4, 3.8, C.white);
    lb(s, "After", 5.5, 1.3, 4, 14, C.green);
    ic(s, "folder", 7.0, 1.9, 0.8);
    (d.after.files || ["skill-1.md", "skill-2.md", "skill-3.md"]).forEach((f, i) => {
      rr(s, 6.3, 3.0 + i * 0.55, 2.6, 0.4, C.cardLight);
      lb(s, f, 6.3, 3.0 + i * 0.55, 2.6, 11);
    });
    ic(s, "check", 8.6, 4.0, 0.6);
  },

  share_flow(d) {
    const s = ns();
    tt(s, d.title);
    ic(s, d.source_icon || "folderOpen", 4.3, 1.3, 1.2);
    d.destinations.forEach((dest, i) => {
      const positions = [[0.5, 3.0], [4, 3.8], [7.5, 3.0]];
      if (i >= positions.length) return;
      const [dx, dy] = positions[i];
      rr(s, dx, dy, 2, 1.6, C.white);
      ic(s, dest.icon, dx + 0.6, dy + 0.2, 0.8);
      lb(s, dest.label, dx, dy + 1.0, 2, 13);
    });
  },

  filing_cabinet(d) {
    const s = ns();
    rr(s, 3.5, 0.8, 3, 4.2, C.card);
    for (let i = 0; i < (d.drawers || 5); i++) {
      const dc = i === (d.active_drawer || 2) ? C.accent : C.cardLight;
      rr(s, 3.7, 1.0 + i * 0.75, 2.6, 0.6, dc);
      if (i === (d.active_drawer || 2)) lb(s, "loaded", 3.7, 1.0 + i * 0.75, 2.6, 11, C.white);
    }
    ct(s, d.title, 0, 5.0, 10, T.sizes.heading);
  },

  overload(d) {
    const s = ns();
    tt(s, d.title);
    rr(s, 2, 1.2, 6, 3.8, C.card);
    cl(s, 4.3, 1.6, 0.9);
    const dp = [[2.5,2],[3.2,1.5],[5.5,1.8],[6.3,1.5],[6.8,2.2],[2.8,3],[3.8,3.2],[5,3],[6,3.2],[7,3]];
    dp.slice(0, d.doc_count || 10).forEach(([dx, dy]) => ic(s, "fileGrey", dx, dy, 0.45));
    ic(s, "warn", 7.2, 4.0, 0.7);
  },

  index_expand(d) {
    const s = ns();
    tt(s, d.title);
    rr(s, 0.5, 1.2, 3.5, 3.8, C.white);
    lb(s, "Index", 0.5, 1.3, 3.5, 14);
    (d.index_items || []).forEach((item, i) => {
      const ac = i === (d.active_item || 2);
      rr(s, 0.7, 1.8 + i * 0.5, 3.1, 0.35, ac ? C.accent : C.cardLight);
      s.addText(item, { x: 0.7, y: 1.8 + i * 0.5, w: 3.1, h: 0.35, fontSize: 11, fontFace: T.fonts.code, color: ac ? C.white : C.grey, align: "center", valign: "middle", margin: 0 });
    });
    ar(s, 4.0, 2.85, 1.5);
    cl(s, 4.5, 1.5, 0.6); ic(s, "searchA", 5.0, 1.5, 0.4);
    rr(s, 5.8, 1.2, 3.7, 3.8, C.white); rc(s, 5.8, 1.2, 0.08, 3.8, C.accent);
    s.addText((d.expanded_folder || "skill") + "/", { x: 6.1, y: 1.4, w: 3, h: 0.4, fontSize: 14, fontFace: T.fonts.code, color: C.black, bold: true, margin: 0 });
    s.addText((d.expanded_files || []).join("\n"), { x: 6.3, y: 2.0, w: 3, h: 2.5, fontSize: 13, fontFace: T.fonts.code, color: C.accent, margin: 0 });
  },

  highlight_grid(d) {
    const s = ns();
    tt(s, d.title);
    const rows = d.rows || 3, cols = d.cols || 5;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const ac = r === (d.active_row || 1) && c === (d.active_col || 2);
      rr(s, 0.8 + c * 1.8, 1.5 + r * 1.2, 1.5, 0.8, ac ? resolveColor(d.active_color) : resolveColor(d.grid_color));
      if (ac) lb(s, "Active", 0.8 + c * 1.8, 1.5 + r * 1.2, 1.5, 13, C.white);
    }
    cl(s, 4.1, 4.5, 0.6);
  },

  book_split(d) {
    const s = ns();
    rr(s, 0.5, 0.8, 4, 4, C.card);
    ic(s, "user", 2.0, 1.0, 0.8);
    for (let i = 0; i < 6; i++) ic(s, "book", 1.0 + (i % 3) * 0.8, 2.0 + Math.floor(i / 3) * 0.9, 0.6);
    ic(s, "xCircle", 3.5, 3.8, 0.6);
    lb(s, d.left_label, 0.5, 4.0, 4, 14, C.danger);
    s.addText("vs", { x: 4.5, y: 2.3, w: 1, h: 0.8, fontSize: 24, fontFace: T.fonts.heading, color: C.accent, bold: true, align: "center", valign: "middle", margin: 0 });
    rr(s, 5.5, 0.8, 4, 4, C.card);
    ic(s, "user", 7.0, 1.0, 0.8);
    rc(s, 6.0, 2.5, 3, 0.06, C.grey);
    for (let i = 0; i < 5; i++) ic(s, i === 2 ? "bookAccent" : "bookGrey", 6.1 + i * 0.55, 2.0, 0.4);
    ic(s, "bookOpen", 7.0, 3.0, 0.8);
    ic(s, "check", 8.5, 3.8, 0.6);
    lb(s, d.right_label, 5.5, 4.0, 4, 14, C.green);
  },

  professional_row(d) {
    const s = ns();
    (d.icons || []).forEach((ik, i) => ic(s, ik, 2.0 + i * 1.6, 1.3, 1.0));
    ct(s, d.title, 0, 3.0, 10, 38);
  },

  quote_visual(d) {
    const s = ns();
    s.addText("\u201C", { x: 0.5, y: 0.3, w: 1, h: 1.5, fontSize: 120, fontFace: T.fonts.heading, color: C.accent, margin: 0 });
    (d.icon_pairs || []).forEach((pair, i) => {
      ic(s, pair.person, 1.0 + i * 1.7, 1.5, 0.7);
      arD(s, 1.35 + i * 1.7, 2.3, 0.5, C.accent);
      ic(s, "fileAccent", 1.1 + i * 1.7, 2.9, 0.5);
      lb(s, pair.label, 0.7 + i * 1.7, 3.5, 1.4, 12);
    });
    s.addText(d.quote, { x: 1, y: 4.2, w: 8, h: 0.5, fontSize: 16, fontFace: T.fonts.heading, color: C.black, italic: true, align: "center", margin: 0 });
    s.addText(d.attribution, { x: 1, y: 4.7, w: 8, h: 0.4, fontSize: 13, fontFace: T.fonts.body, color: C.accent, align: "center", margin: 0 });
  },

  code_vs_chat(d) {
    const s = ns();
    s.addText("</>", { x: 2.0, y: 1.2, w: 2.5, h: 2, fontSize: 60, fontFace: T.fonts.code, color: C.greyLight, align: "center", valign: "middle", margin: 0 });
    ic(s, "xCircle", 3.8, 1.2, 0.8);
    ic(s, "comments", 5.8, 1.2, 2.0);
    ic(s, "check", 7.2, 1.2, 0.8);
    ct(s, d.caption, 0, 3.8, 10, 30);
  },

  three_step_flow(d) {
    const s = ns();
    tt(s, d.title);
    d.steps.forEach((step, i) => {
      const sx = 0.5 + i * 3.2;
      if (i === 1) { rr(s, sx, 1.5, 2.0, 2.5, C.card); cl(s, sx + 0.5, 1.8, 0.7); ic(s, "cogsB", sx + 0.6, 2.8, 0.6); }
      else if (i === 2) {
        rr(s, sx, 1.5, 2.5, 2.5, C.white); rc(s, sx, 1.5, 0.08, 2.5, C.accent);
        ic(s, "folder", sx + 0.8, 1.7, 0.7);
        if (step.files) s.addText(step.files.join("\n"), { x: sx + 0.3, y: 2.6, w: 2, h: 1.2, fontSize: 12, fontFace: T.fonts.code, color: C.accent, margin: 0 });
        ic(s, "check", sx + 1.8, 3.4, 0.5);
      }
      else { rr(s, sx, 1.5, 2.5, 2.5, C.white); ic(s, "commentA", sx + 0.7, 1.8, 0.8); if (step.content) s.addText(step.content, { x: sx + 0.1, y: 2.7, w: 2.3, h: 0.8, fontSize: 13, fontFace: T.fonts.body, color: C.black, italic: true, align: "center", margin: 0 }); }
      if (i < 2) bigArr(s, sx + 2.3, 2.3);
      if (step.label) st(s, step.label, sx, 4.1, i === 1 ? 2 : 2.5, 12);
    });
  },

  spoke_diagram(d) {
    const s = ns();
    tt(s, d.title);
    cl(s, 4.3, 2.1, 1.0);
    const state = d.spoke_state || "connected";
    const positions = [[1.5,1],[7.5,1],[1,3.5],[8,3.5],[3,4.5],[6.5,4.5]];
    d.spokes.forEach((sp, i) => {
      if (i >= positions.length) return;
      const [ax, ay] = positions[i];
      rr(s, ax, ay, 1.2, 1.0, resolveColor(d.spoke_color));
      const iconKey = sp.icon + "W";
      if (I[iconKey]) ic(s, iconKey, ax + 0.3, ay + 0.05, 0.55);
      s.addText(sp.label, { x: ax, y: ay + 0.6, w: 1.2, h: 0.35, fontSize: 10, fontFace: T.fonts.body, color: C.white, bold: true, align: "center", valign: "middle", margin: 0 });
      if (state === "confused") ic(s, "questionRed", ax + 0.7, ay - 0.15, 0.3);
      else if (state === "skilled") ic(s, "check", ax + 0.7, ay - 0.15, 0.3);
    });
    if (state === "confused") ic(s, "questionRed", 5.0, 1.8, 0.5);
  },

  three_panel(d) {
    const s = ns();
    ct(s, d.title, 0, 0.2, 10, T.sizes.heading);
    const lc = resolveColor(d.left.color);
    rr(s, 0.5, 1.3, 3.5, 3.5, lc);
    ic(s, d.left.header_icon + "W", 1.8, 1.5, 0.8);
    s.addText(d.left.header, { x: 0.5, y: 2.3, w: 3.5, h: 0.5, fontSize: 20, fontFace: T.fonts.heading, color: C.white, bold: true, align: "center", margin: 0 });
    d.left.items.forEach((item, i) => { rr(s, 1.0, 3.0 + i * 0.55, 2.5, 0.4, C.sageDark); lb(s, item, 1.0, 3.0 + i * 0.55, 2.5, 13, C.white); });
    rr(s, 4.3, 1.8, 1.5, 2.5, C.card);
    cl(s, 4.6, 2.1, 0.8); lp(s, 4.7, 3.2);
    const rc2 = resolveColor(d.right.color);
    rr(s, 6.0, 1.3, 3.5, 3.5, rc2);
    ic(s, d.right.header_icon + "W", 7.3, 1.5, 0.8);
    s.addText(d.right.header, { x: 6.0, y: 2.3, w: 3.5, h: 0.5, fontSize: 20, fontFace: T.fonts.heading, color: C.white, bold: true, align: "center", margin: 0 });
    d.right.items.forEach((item, i) => { rr(s, 6.5, 3.0 + i * 0.55, 2.5, 0.4, C.lavenderDark); lb(s, item, 6.5, 3.0 + i * 0.55, 2.5, 13, C.white); });
  },

  closing(d) {
    const s = ns();
    ic(s, d.icons[0] || "rocket", 4.2, 0.8, 1.5);
    if (d.icons[1] === "claude") cl(s, 4.5, 2.8, 1.0);
    else ic(s, d.icons[1], 4.5, 2.8, 1.0);
    if (d.icons[2]) ic(s, d.icons[2], 5.3, 3.3, 0.5);
    ct(s, d.title, 0, 4.2, 10, T.sizes.title);
  },

  reference_image(d) {
    const s = ns();
    const imgData = fileB64(d.image);
    if (imgData) s.addImage({ data: imgData, x: 0, y: 0, w: 10, h: 5.625, sizing: { type: "cover", w: 10, h: 5.625 } });
    else s.addText("Missing: " + d.image, { x: 1, y: 2, w: 8, h: 1, fontSize: 24, color: C.danger, align: "center" });
  },
};

// --- Main ---
async function main() {
  I = await buildIcons();
  P = new pptxgen();
  P.layout = "LAYOUT_16x9";
  P.author = spec.author || "Author";
  P.title = spec.title || "Presentation";

  console.log("Generating " + spec.slides.length + " slides...");
  for (const slide of spec.slides) {
    const renderer = renderers[slide.type];
    if (renderer) {
      renderer(slide.data);
    } else {
      console.warn("Unknown slide type: " + slide.type + " — creating blank");
      const s = ns();
      ct(s, "TODO: " + slide.type, 0, 2.5, 10, 24, C.grey);
    }
  }

  await P.writeFile({ fileName: OUTPUT_PATH });
  console.log("Saved: " + OUTPUT_PATH + " (" + P.slides.length + " slides)");
}

main().catch(e => { console.error(e); process.exit(1); });
