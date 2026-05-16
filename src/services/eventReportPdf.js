const PDFDocument = require("pdfkit");
const { DEFAULT_PRIMARY, DEFAULT_SECONDARY } = require("./schoolReportBranding");

const MARGIN = 48;
const CONTENT_WIDTH = 595.28 - MARGIN * 2; // A4

const EMOJI_LABELS = {
  "👍": "Like",
  "👎": "Dislike",
  "👏": "Applause",
  "🙌": "Celebrate",
  "❤️": "Love",
  "😂": "Laugh",
  "😮": "Wow",
  "😢": "Sad",
  "😍": "Love",
  "🤔": "Thinking",
  "🎉": "Party",
  "🔥": "Fire",
  "💯": "100",
  "✅": "Yes",
  "❌": "No",
  "⭐": "Star",
  "💡": "Idea",
  "🙋": "Hand raised",
};

function fmtDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function fmtDateShort(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function humanizeKey(val) {
  if (!val) return "—";
  return String(val)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function reactionSummaryText(counts) {
  if (!counts || !Object.keys(counts).length) return "None recorded";
  return Object.entries(counts)
    .map(([emoji, count]) => {
      const label = EMOJI_LABELS[emoji] || "Reaction";
      return `${label} (${count})`;
    })
    .join("  ·  ");
}

function ensureSpace(doc, needed = 80) {
  if (doc.y + needed > doc.page.height - doc.page.margins.bottom - 36) {
    doc.addPage();
    return true;
  }
  return false;
}

function drawSectionTitle(doc, title, primary) {
  ensureSpace(doc, 48);
  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .fillColor(primary)
    .text(title.toUpperCase(), MARGIN, doc.y, { width: CONTENT_WIDTH });
  const y = doc.y + 4;
  doc
    .moveTo(MARGIN, y)
    .lineTo(MARGIN + CONTENT_WIDTH, y)
    .lineWidth(2)
    .strokeColor(primary)
    .stroke();
  doc.y = y + 12;
}

function drawInfoGrid(doc, rows, primary, secondary) {
  const colW = CONTENT_WIDTH / 2 - 8;
  let rowIdx = 0;
  for (let i = 0; i < rows.length; i += 2) {
    ensureSpace(doc, 52);
    const y0 = doc.y;
    const h = 44;
    for (let col = 0; col < 2; col++) {
      const item = rows[i + col];
      if (!item) continue;
      const x = MARGIN + col * (colW + 16);
      doc.roundedRect(x, y0, colW, h, 4).fillAndStroke("#f8fafc", "#e2e8f0");
      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor("#64748b")
        .text(item.label, x + 10, y0 + 8, { width: colW - 20 });
      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .fillColor(primary)
        .text(String(item.value), x + 10, y0 + 22, { width: colW - 20 });
    }
    doc.y = y0 + h + 10;
    rowIdx++;
  }
}

function drawStatCards(doc, stats, primary, secondary) {
  const cardW = (CONTENT_WIDTH - 24) / 4;
  const cardH = 52;
  ensureSpace(doc, cardH + 16);
  const y0 = doc.y;
  stats.forEach((stat, i) => {
    const x = MARGIN + i * (cardW + 8);
    doc.roundedRect(x, y0, cardW, cardH, 4).fillAndStroke("#fffbeb", secondary);
    doc
      .font("Helvetica-Bold")
      .fontSize(16)
      .fillColor(primary)
      .text(String(stat.value), x + 8, y0 + 10, { width: cardW - 16, align: "center" });
    doc
      .font("Helvetica")
      .fontSize(7)
      .fillColor("#64748b")
      .text(stat.label, x + 6, y0 + 32, { width: cardW - 12, align: "center" });
  });
  doc.y = y0 + cardH + 14;
}

function drawTable(doc, columns, tableRows, primary) {
  const headerH = 22;
  const rowH = 20;
  ensureSpace(doc, headerH + 24);

  const drawHeader = () => {
    const y = doc.y;
    doc.rect(MARGIN, y, CONTENT_WIDTH, headerH).fill(primary);
    let x = MARGIN + 6;
    doc.font("Helvetica-Bold").fontSize(8).fillColor("#ffffff");
    columns.forEach((col) => {
      doc.text(col.label, x, y + 7, { width: col.w - 8, lineBreak: false });
      x += col.w;
    });
    doc.y = y + headerH;
  };

  drawHeader();

  if (!tableRows.length) {
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#64748b")
      .text("No records.", MARGIN + 6, doc.y + 8);
    doc.y += 28;
    return;
  }

  tableRows.forEach((cells, rowIndex) => {
    if (doc.y + rowH > doc.page.height - doc.page.margins.bottom - 40) {
      doc.addPage();
      drawHeader();
    }
    const y = doc.y;
    const bg = rowIndex % 2 === 0 ? "#ffffff" : "#f8fafc";
    doc.rect(MARGIN, y, CONTENT_WIDTH, rowH).fill(bg);
    let x = MARGIN + 6;
    doc.font("Helvetica").fontSize(8).fillColor("#1e293b");
    cells.forEach((cell, i) => {
      doc.text(String(cell ?? "—").slice(0, 48), x, y + 6, {
        width: columns[i].w - 8,
        lineBreak: false,
      });
      x += columns[i].w;
    });
    doc.y = y + rowH;
  });
  doc.moveDown(0.5);
}

function drawChatBlock(doc, message, primary) {
  const who = message.author?.full_name || message.author?.username || "Participant";
  const role = message.author?.role ? humanizeKey(message.author.role) : "";
  const kind = message.is_question
    ? message.is_answered
      ? "Question (answered)"
      : "Question"
    : "Chat";
  const meta = [who, role, kind, fmtDateShort(message.sent_at)].filter(Boolean).join(" · ");
  const body = message.message || "";
  const replies = message.replies || [];

  doc.font("Helvetica").fontSize(9);
  const bodyH = doc.heightOfString(body, { width: CONTENT_WIDTH - 20 });
  const repliesH = replies.length * 16;
  const blockH = 34 + bodyH + repliesH;

  ensureSpace(doc, blockH + 12);
  const y0 = doc.y;
  doc.roundedRect(MARGIN, y0, CONTENT_WIDTH, blockH, 4).fillAndStroke("#f8fafc", "#e2e8f0");

  doc
    .font("Helvetica-Bold")
    .fontSize(8)
    .fillColor(primary)
    .text(meta, MARGIN + 10, y0 + 8, { width: CONTENT_WIDTH - 20 });
  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor("#334155")
    .text(body, MARGIN + 10, y0 + 22, { width: CONTENT_WIDTH - 20 });

  let y = y0 + 22 + bodyH + 4;
  replies.forEach((r) => {
    const replyWho = r.author?.full_name || r.author?.username || "Staff";
    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor("#475569")
      .text(`Reply — ${replyWho}: ${r.message || ""}`, MARGIN + 16, y, { width: CONTENT_WIDTH - 28 });
    y += 16;
  });

  doc.y = y0 + blockH + 10;
}

function drawPageFooters(doc, branding) {
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    const footerY = doc.page.height - 32;
    doc
      .moveTo(MARGIN, footerY - 8)
      .lineTo(MARGIN + CONTENT_WIDTH, footerY - 8)
      .lineWidth(0.5)
      .strokeColor("#e2e8f0")
      .stroke();
    doc
      .font("Helvetica")
      .fontSize(7)
      .fillColor("#94a3b8")
      .text(branding.name, MARGIN, footerY, { width: CONTENT_WIDTH / 2, lineBreak: false });
    doc.text(`Page ${i - range.start + 1} of ${range.count}`, MARGIN, footerY, {
      width: CONTENT_WIDTH,
      align: "right",
      lineBreak: false,
    });
  }
}

function drawReportHeader(doc, branding, report) {
  const primary = branding.primaryColor || DEFAULT_PRIMARY;
  const secondary = branding.secondaryColor || DEFAULT_SECONDARY;
  const ev = report.event;
  const headerTop = MARGIN;

  doc.rect(MARGIN, headerTop, CONTENT_WIDTH, 4).fill(secondary);

  const logoSize = 56;
  let textX = MARGIN;
  let textY = headerTop + 14;

  if (branding.logoPath) {
    try {
      doc.image(branding.logoPath, MARGIN, textY, { fit: [logoSize, logoSize], align: "left" });
      textX = MARGIN + logoSize + 14;
    } catch {
      /* skip broken image */
    }
  }

  doc
    .font("Helvetica-Bold")
    .fontSize(18)
    .fillColor(primary)
    .text(branding.name, textX, textY, { width: CONTENT_WIDTH - (textX - MARGIN) });

  let subY = textY + 22;
  if (branding.tagline) {
    doc
      .font("Helvetica-Oblique")
      .fontSize(9)
      .fillColor("#64748b")
      .text(branding.tagline, textX, subY, { width: CONTENT_WIDTH - (textX - MARGIN) });
    subY += 14;
  }

  const contact = [branding.phone, branding.email, branding.website].filter(Boolean).join("  ·  ");
  if (contact) {
    doc.font("Helvetica").fontSize(8).fillColor("#64748b").text(contact, textX, subY, {
      width: CONTENT_WIDTH - (textX - MARGIN),
    });
    subY += 12;
  }
  if (branding.addressLine) {
    doc.font("Helvetica").fontSize(8).fillColor("#64748b").text(branding.addressLine, textX, subY, {
      width: CONTENT_WIDTH - (textX - MARGIN),
    });
    subY += 12;
  }

  doc.y = Math.max(subY, headerTop + logoSize + 18) + 8;

  const titleY = doc.y;
  doc.roundedRect(MARGIN, titleY, CONTENT_WIDTH, 72, 6).fill(primary);
  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor(secondary)
    .text("ONLINE EVENT REPORT", MARGIN + 16, titleY + 14, { width: CONTENT_WIDTH - 32, align: "center" });
  doc
    .font("Helvetica-Bold")
    .fontSize(15)
    .fillColor("#ffffff")
    .text(ev.title || "Event", MARGIN + 16, titleY + 30, { width: CONTENT_WIDTH - 32, align: "center" });
  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor("#cbd5e1")
    .text(`Generated ${fmtDate(report.generated_at)}`, MARGIN + 16, titleY + 52, {
      width: CONTENT_WIDTH - 32,
      align: "center",
    });

  doc.y = titleY + 84;
  return { primary, secondary };
}

function buildEventReportPdf(report, branding = {}) {
  const brand = {
    name: branding.name || "School",
    tagline: branding.tagline || null,
    email: branding.email || null,
    phone: branding.phone || null,
    addressLine: branding.addressLine || null,
    website: branding.website || null,
    logoPath: branding.logoPath || null,
    primaryColor: branding.primaryColor || DEFAULT_PRIMARY,
    secondaryColor: branding.secondaryColor || DEFAULT_SECONDARY,
  };

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        margin: MARGIN,
        size: "A4",
        bufferPages: true,
        info: {
          Title: `Event Report — ${report.event?.title || "Event"}`,
          Author: brand.name,
          Subject: "Online event live session report",
        },
      });
      const chunks = [];
      doc.on("data", (c) => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const { primary, secondary } = drawReportHeader(doc, brand, report);
      const ev = report.event;
      const sum = report.summary;

      drawSectionTitle(doc, "Event details", primary);
      drawInfoGrid(
        doc,
        [
          { label: "Event type", value: humanizeKey(ev.event_type) },
          { label: "Delivery", value: humanizeKey(ev.delivery_mode) },
          { label: "Session status", value: humanizeKey(ev.session_status) },
          { label: "Location", value: ev.location || "Online" },
          { label: "Start", value: fmtDate(ev.start_date) },
          { label: "End", value: fmtDate(ev.end_date) },
        ],
        primary,
        secondary
      );

      drawSectionTitle(doc, "Session summary", primary);
      drawStatCards(
        doc,
        [
          { label: "Unique participants", value: sum.unique_participants ?? 0 },
          { label: "Total minutes", value: sum.total_minutes_in_event ?? 0 },
          { label: "Avg minutes", value: sum.avg_minutes_in_event ?? 0 },
          { label: "Reactions", value: sum.total_reactions ?? 0 },
        ],
        primary,
        secondary
      );

      drawInfoGrid(
        doc,
        [
          { label: "Lobby visits (all)", value: sum.total_lobby_requests ?? 0 },
          { label: "With recorded time", value: sum.participants_with_time ?? 0 },
          { label: "Chat messages", value: sum.total_chat_messages ?? 0 },
          {
            label: "Questions",
            value: `${sum.total_questions ?? 0} (${sum.questions_answered ?? 0} answered)`,
          },
          { label: "Denied (visits)", value: sum.denied ?? 0 },
          { label: "Reaction breakdown", value: reactionSummaryText(sum.reaction_counts) },
        ],
        primary,
        secondary
      );

      drawSectionTitle(doc, "Attendance", primary);
      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor("#64748b")
        .text("Minutes count time in the live session after admission from the waiting room.", MARGIN, doc.y, {
          width: CONTENT_WIDTH,
        });
      doc.moveDown(0.6);

      const attCols = [
        { label: "Name", w: 118 },
        { label: "Role", w: 52 },
        { label: "Status", w: 48 },
        { label: "Admitted", w: 88 },
        { label: "Left", w: 88 },
        { label: "Min", w: 34 },
      ];
      const attRows = (report.attendees || []).map((a) => [
        a.user?.full_name || a.user?.username || "—",
        humanizeKey(a.user?.role),
        humanizeKey(a.status),
        fmtDateShort(a.admitted_at),
        fmtDateShort(a.left_at),
        a.minutes_in_event != null ? String(a.minutes_in_event) : "—",
      ]);
      drawTable(doc, attCols, attRows, primary);

      drawSectionTitle(doc, "Chat & questions", primary);
      const chat = report.chat || [];
      if (!chat.length) {
        doc.font("Helvetica").fontSize(9).fillColor("#64748b").text("No messages were recorded for this event.");
      } else {
        chat.forEach((m) => drawChatBlock(doc, m, primary));
      }

      drawPageFooters(doc, brand);
      doc.end();
    } catch (e) {
      reject(e);
    }
  });
}

module.exports = { buildEventReportPdf };
