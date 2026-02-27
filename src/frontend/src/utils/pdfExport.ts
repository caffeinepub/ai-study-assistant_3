export interface ChatMessageForPDF {
  sender: string;
  content: string;
  isAI: boolean;
  timestamp?: bigint;
}

export function exportChatToPDF(messages: ChatMessageForPDF[], sessionId: string): void {
  const timestamp = new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const formatTime = (ts?: bigint): string => {
    if (!ts) return "";
    // ICP time is in nanoseconds
    const date = new Date(Number(ts / 1_000_000n));
    return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  };

  const escapeHtml = (text: string): string => {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br>");
  };

  const messagesHTML = messages
    .map((msg) => {
      const timeStr = formatTime(msg.timestamp);
      const senderLabel = msg.isAI ? "🤖 AI Study Assistant" : "👤 You";
      const bgColor = msg.isAI ? "#e8f0fe" : "#e3f2fd";
      const borderColor = msg.isAI ? "#4285f4" : "#1565c0";
      const alignStyle = msg.isAI ? "margin-right: 40px;" : "margin-left: 40px;";

      return `
      <div style="margin-bottom: 16px; ${alignStyle}">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <span style="font-weight: 600; color: ${borderColor}; font-size: 12px;">${senderLabel}</span>
          ${timeStr ? `<span style="font-size: 11px; color: #666;">${timeStr}</span>` : ""}
        </div>
        <div style="background: ${bgColor}; border-left: 3px solid ${borderColor}; padding: 12px 16px; border-radius: 4px; font-size: 14px; line-height: 1.6; color: #1a1a2e;">
          ${escapeHtml(msg.content)}
        </div>
      </div>`;
    })
    .join("");

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>AI Study Assistant — Chat Export</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Plus+Jakarta+Sans:wght@400;500&display=swap');
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
          font-family: 'Plus Jakarta Sans', Arial, sans-serif;
          background: #ffffff;
          color: #1a1a2e;
          padding: 40px;
          max-width: 800px;
          margin: 0 auto;
        }

        .header {
          text-align: center;
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 2px solid #1565c0;
        }

        .header-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 8px;
        }

        .header-logo .icon {
          width: 36px;
          height: 36px;
          background: #1565c0;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 18px;
        }

        h1 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 24px;
          font-weight: 700;
          color: #1565c0;
        }

        .subtitle {
          font-size: 12px;
          color: #666;
          margin-top: 4px;
        }

        .meta-info {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 16px;
          margin-bottom: 28px;
          padding: 16px;
          background: #f5f7ff;
          border-radius: 8px;
        }

        .meta-item {
          text-align: center;
        }

        .meta-label {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #888;
          margin-bottom: 2px;
        }

        .meta-value {
          font-size: 13px;
          font-weight: 600;
          color: #1a1a2e;
        }

        .messages-container {
          padding: 0;
        }

        .section-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 20px;
        }

        .footer {
          margin-top: 40px;
          padding-top: 16px;
          border-top: 1px solid #e0e0e0;
          text-align: center;
          font-size: 11px;
          color: #999;
        }

        @media print {
          body { padding: 20px; }
          .meta-info { break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="header-logo">
          <div class="icon">🤖</div>
          <h1>AI Study Assistant</h1>
        </div>
        <p class="subtitle">Your intelligent learning companion — Chat Export</p>
      </div>

      <div class="meta-info">
        <div class="meta-item">
          <div class="meta-label">Exported On</div>
          <div class="meta-value">${timestamp}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Total Messages</div>
          <div class="meta-value">${messages.length}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Session ID</div>
          <div class="meta-value">${sessionId.slice(0, 8)}...</div>
        </div>
      </div>

      <div class="messages-container">
        <div class="section-title">Conversation</div>
        ${messagesHTML}
      </div>

      <div class="footer">
        Generated by AI Study Assistant &bull; caffeine.ai &bull; ${timestamp}
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to export PDF. Use browser Print > Save as PDF.");
    return;
  }

  printWindow.document.write(htmlContent);
  printWindow.document.close();

  // Wait for content to load then trigger print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };
}
