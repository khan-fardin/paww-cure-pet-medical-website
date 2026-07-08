import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFPage,
  type PDFFont,
} from "pdf-lib";

type PrescriptionPdfInput = {
  consultationId: string;
  diagnosis?: string;
  issuedAt: Date;
  medications: {
    dosage: string;
    duration: string;
    frequency: string;
    instructions?: string;
    name: string;
  }[];
  pet: {
    breed?: string;
    name: string;
    species?: string;
  };
  prescription: {
    dietRecommendations?: string;
    expiryDate: Date;
    followUpInstructions?: string;
    precautions?: string[];
  };
  user: {
    name: string;
  };
  vet: {
    clinicName?: string;
    licenseNumber?: string;
    name: string;
    specializations?: string[];
  };
};

const PAGE = { height: 842, width: 595 };
const emerald = rgb(0.02, 0.59, 0.41);
const emeraldDark = rgb(0.01, 0.17, 0.13);
const slate = rgb(0.28, 0.34, 0.42);
const pale = rgb(0.95, 0.98, 0.97);

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) <= maxWidth) {
      line = next;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawLines(
  page: PDFPage,
  lines: string[],
  options: {
    color?: ReturnType<typeof rgb>;
    font: PDFFont;
    lineHeight: number;
    size: number;
    x: number;
    y: number;
  }
) {
  lines.forEach((line, index) => {
    page.drawText(line, {
      color: options.color ?? slate,
      font: options.font,
      size: options.size,
      x: options.x,
      y: options.y - index * options.lineHeight,
    });
  });
  return options.y - lines.length * options.lineHeight;
}

export async function generatePrescriptionPdf(input: PrescriptionPdfInput) {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  let page = pdf.addPage([PAGE.width, PAGE.height]);
  let y = 760;

  const addPage = () => {
    page = pdf.addPage([PAGE.width, PAGE.height]);
    page.drawRectangle({
      color: emeraldDark,
      height: 14,
      width: PAGE.width,
      x: 0,
      y: PAGE.height - 14,
    });
    y = 780;
  };

  const ensureSpace = (height: number) => {
    if (y - height < 70) addPage();
  };

  page.drawRectangle({
    color: emeraldDark,
    height: 128,
    width: PAGE.width,
    x: 0,
    y: PAGE.height - 128,
  });
  page.drawText("pawwcure", {
    color: rgb(1, 1, 1),
    font: bold,
    size: 24,
    x: 42,
    y: 790,
  });
  page.drawText("DIGITAL VETERINARY PRESCRIPTION", {
    color: rgb(0.63, 0.91, 0.79),
    font: bold,
    size: 9,
    x: 42,
    y: 768,
  });
  page.drawText(`RX  ${input.consultationId.slice(-8).toUpperCase()}`, {
    color: rgb(1, 1, 1),
    font: bold,
    size: 11,
    x: 420,
    y: 790,
  });
  page.drawText(input.issuedAt.toLocaleDateString("en-GB"), {
    color: rgb(0.8, 0.86, 0.84),
    font: regular,
    size: 9,
    x: 442,
    y: 770,
  });

  y = 682;
  page.drawRectangle({
    color: pale,
    height: 88,
    width: 511,
    x: 42,
    y: y - 62,
  });
  page.drawText("PATIENT", { color: emerald, font: bold, size: 8, x: 58, y });
  page.drawText(input.pet.name, {
    color: emeraldDark,
    font: bold,
    size: 16,
    x: 58,
    y: y - 22,
  });
  page.drawText(
    `${input.pet.species ?? "Pet"} / ${input.pet.breed ?? "Breed not recorded"}`,
    { color: slate, font: regular, size: 9, x: 58, y: y - 40 }
  );
  page.drawText("USER", { color: emerald, font: bold, size: 8, x: 320, y });
  page.drawText(input.user.name, {
    color: emeraldDark,
    font: bold,
    size: 12,
    x: 320,
    y: y - 22,
  });
  y -= 104;

  if (input.diagnosis) {
    page.drawText("CLINICAL IMPRESSION", {
      color: emerald,
      font: bold,
      size: 9,
      x: 42,
      y,
    });
    y -= 18;
    const lines = wrapText(input.diagnosis, regular, 10, 511);
    y = drawLines(page, lines, {
      color: slate,
      font: regular,
      lineHeight: 15,
      size: 10,
      x: 42,
      y,
    });
    y -= 14;
  }

  page.drawText("PRESCRIBED MEDICATION", {
    color: emerald,
    font: bold,
    size: 9,
    x: 42,
    y,
  });
  y -= 22;

  for (let index = 0; index < input.medications.length; index += 1) {
    const medication = input.medications[index];
    const instructionLines = medication.instructions
      ? wrapText(medication.instructions, regular, 9, 430)
      : [];
    const boxHeight = 58 + instructionLines.length * 13;
    ensureSpace(boxHeight + 12);
    page.drawRectangle({
      borderColor: rgb(0.88, 0.92, 0.91),
      borderWidth: 1,
      color: rgb(1, 1, 1),
      height: boxHeight,
      width: 511,
      x: 42,
      y: y - boxHeight + 8,
    });
    page.drawText(`${index + 1}`, {
      color: rgb(1, 1, 1),
      font: bold,
      size: 10,
      x: 57,
      y: y - 14,
    });
    page.drawCircle({ color: emerald, size: 12, x: 60, y: y - 10 });
    page.drawText(medication.name, {
      color: emeraldDark,
      font: bold,
      size: 12,
      x: 84,
      y: y - 10,
    });
    page.drawText(
      `${medication.dosage} / ${medication.frequency} / ${medication.duration}`,
      { color: slate, font: regular, size: 9, x: 84, y: y - 29 }
    );
    if (instructionLines.length) {
      drawLines(page, instructionLines, {
        color: slate,
        font: regular,
        lineHeight: 13,
        size: 9,
        x: 84,
        y: y - 46,
      });
    }
    y -= boxHeight + 12;
  }

  const sections = [
    ["DIET & CARE", input.prescription.dietRecommendations],
    ["FOLLOW-UP", input.prescription.followUpInstructions],
    [
      "PRECAUTIONS",
      input.prescription.precautions?.length
        ? input.prescription.precautions.join("; ")
        : undefined,
    ],
  ] as const;

  for (const [label, value] of sections) {
    if (!value) continue;
    const lines = wrapText(value, regular, 9, 511);
    ensureSpace(34 + lines.length * 13);
    page.drawText(label, { color: emerald, font: bold, size: 8, x: 42, y });
    y -= 16;
    y = drawLines(page, lines, {
      color: slate,
      font: regular,
      lineHeight: 13,
      size: 9,
      x: 42,
      y,
    });
    y -= 12;
  }

  ensureSpace(118);
  page.drawLine({
    color: rgb(0.85, 0.89, 0.88),
    end: { x: 553, y },
    start: { x: 42, y },
    thickness: 1,
  });
  y -= 26;
  page.drawText(input.vet.name, {
    color: emeraldDark,
    font: bold,
    size: 14,
    x: 42,
    y,
  });
  page.drawText("Digitally signed by the prescribing veterinarian", {
    color: slate,
    font: regular,
    size: 8,
    x: 42,
    y: y - 16,
  });
  page.drawText(
    [
      input.vet.licenseNumber
        ? `License: ${input.vet.licenseNumber}`
        : "License on verified profile",
      input.vet.clinicName,
      input.vet.specializations?.join(", "),
    ]
      .filter(Boolean)
      .join(" / "),
    { color: slate, font: regular, size: 9, x: 42, y: y - 34 }
  );
  page.drawText(
    `Valid until ${input.prescription.expiryDate.toLocaleDateString("en-GB")}`,
    { color: emerald, font: bold, size: 9, x: 420, y }
  );

  for (const currentPage of pdf.getPages()) {
    currentPage.drawText(
      "Generated securely by pawwcure. Verify medicines and seek urgent in-person care for emergencies.",
      {
        color: rgb(0.48, 0.53, 0.58),
        font: regular,
        size: 7,
        x: 42,
        y: 28,
      }
    );
  }

  return pdf.save();
}
