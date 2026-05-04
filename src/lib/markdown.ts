export function markdownToHtml(markdown: string): string {
  const lines = markdown.split("\n");
  const htmlLines: string[] = [];
  let inList = false;
  let inBlockquote = false;

  const inlineFormat = (text: string): string => {
    return text
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/`(.+?)`/g, "<code>$1</code>")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-[#1a2f2a] underline underline-offset-2 hover:text-[#EBC161] transition-colors">$1</a>');
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("### ")) {
      if (inList) { htmlLines.push("</ul>"); inList = false; }
      if (inBlockquote) { htmlLines.push("</blockquote>"); inBlockquote = false; }
      htmlLines.push(`<h3 class="text-lg font-bold text-[#2C2C2C] mt-8 mb-3">${inlineFormat(line.slice(4))}</h3>`);
      continue;
    }

    if (line.startsWith("## ")) {
      if (inList) { htmlLines.push("</ul>"); inList = false; }
      if (inBlockquote) { htmlLines.push("</blockquote>"); inBlockquote = false; }
      htmlLines.push(`<h2 class="text-xl sm:text-2xl font-bold text-[#2C2C2C] mt-10 mb-4">${inlineFormat(line.slice(3))}</h2>`);
      continue;
    }

    if (line.startsWith("> ")) {
      if (inList) { htmlLines.push("</ul>"); inList = false; }
      if (!inBlockquote) {
        htmlLines.push('<blockquote class="border-l-4 border-[#EBC161] pl-4 my-6 text-slate-600 italic space-y-2">');
        inBlockquote = true;
      }
      htmlLines.push(`<p>${inlineFormat(line.slice(2))}</p>`);
      continue;
    }

    if (inBlockquote && !line.startsWith("> ")) {
      htmlLines.push("</blockquote>");
      inBlockquote = false;
    }

    if (line.startsWith("- ")) {
      if (!inList) {
        htmlLines.push('<ul class="list-disc list-outside pl-5 my-4 space-y-2 text-slate-700">');
        inList = true;
      }
      htmlLines.push(`<li>${inlineFormat(line.slice(2))}</li>`);
      continue;
    }

    if (inList && !line.startsWith("- ")) {
      htmlLines.push("</ul>");
      inList = false;
    }

    if (line.trim() === "") {
      continue;
    }

    htmlLines.push(`<p class="text-slate-700 leading-relaxed my-4">${inlineFormat(line)}</p>`);
  }

  if (inList) htmlLines.push("</ul>");
  if (inBlockquote) htmlLines.push("</blockquote>");

  return htmlLines.join("\n");
}
