import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import { Download, Printer, ShieldCheck, CheckCircle2, QrCode as QrIcon, Sparkles, Loader2 } from 'lucide-react';
import { type EventPass } from '../services/passService';
import { soundFx } from '../utils/audio';

interface PassCardProps {
  pass: EventPass;
  onClose?: () => void;
  showActions?: boolean;
}

export const PassCard: React.FC<PassCardProps> = ({ pass, onClose, showActions = true }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    // Generate high-resolution QR code image
    const generateQR = async () => {
      try {
        const url = await QRCode.toDataURL(pass.qrData, {
          width: 320,
          margin: 1,
          color: {
            dark: '#030712',
            light: '#FFFFFF',
          },
          errorCorrectionLevel: 'H',
        });
        setQrDataUrl(url);
      } catch (err) {
        console.error('Failed to generate QR Code', err);
      }
    };
    generateQR();
  }, [pass.qrData]);

  const generateCanvasFallback = async (passData: EventPass, qrUrl: string): Promise<string> => {
    const canvas = document.createElement('canvas');
    canvas.width = 880;
    canvas.height = 1100;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No canvas context');

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 1100);
    grad.addColorStop(0, '#0B1020');
    grad.addColorStop(0.5, '#060A14');
    grad.addColorStop(1, '#04060A');
    ctx.fillStyle = grad;
    if (ctx.roundRect) {
      ctx.roundRect(0, 0, 880, 1100, 48);
    } else {
      ctx.rect(0, 0, 880, 1100);
    }
    ctx.fill();

    // Border
    ctx.strokeStyle = '#00E5CC';
    ctx.lineWidth = 4;
    if (ctx.roundRect) {
      ctx.roundRect(4, 4, 872, 1092, 44);
    } else {
      ctx.rect(4, 4, 872, 1092);
    }
    ctx.stroke();

    // Header
    ctx.fillStyle = '#00E5CC';
    ctx.font = 'bold 24px monospace';
    ctx.fillText('â˜… OFFICIAL ENTRY PASS', 48, 80);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '20px monospace';
    ctx.fillText('PIET â€¢ ECE Department Forum', 48, 115);

    // Status
    ctx.fillStyle = passData.status === 'CHECKED_IN' ? '#10B981' : '#00E5CC';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(`[ ${passData.status} ]`, 680, 95);

    // Event title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 34px sans-serif';
    ctx.fillText(passData.eventTitle.substring(0, 36), 48, 185);

    // Event meta
    ctx.fillStyle = '#94A3B8';
    ctx.font = '22px monospace';
    ctx.fillText(`ðŸ“… ${passData.eventDate}  â€¢  â° ${passData.eventTime}`, 48, 230);
    ctx.fillStyle = '#FFD60A';
    ctx.fillText(`ðŸ“ ${passData.eventVenue}`, 48, 268);

    // Pass ID Box
    ctx.fillStyle = '#03060E';
    if (ctx.roundRect) {
      ctx.roundRect(48, 305, 784, 105, 20);
    } else {
      ctx.rect(48, 305, 784, 105);
    }
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,229,204,0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#64748B';
    ctx.font = '18px monospace';
    ctx.fillText('UNIQUE PASS ID', 72, 345);
    ctx.fillStyle = '#00E5CC';
    ctx.font = 'bold 30px monospace';
    ctx.fillText(passData.passId, 72, 388);

    ctx.fillStyle = '#64748B';
    ctx.font = '18px monospace';
    ctx.fillText('CHECKSUM', 630, 345);
    ctx.fillStyle = '#FFD60A';
    ctx.font = 'bold 24px monospace';
    ctx.fillText(`#${passData.securityHash}`, 630, 385);

    // Attendee Box
    ctx.fillStyle = '#03060E';
    if (ctx.roundRect) {
      ctx.roundRect(48, 435, 784, 480, 20);
    } else {
      ctx.rect(48, 435, 784, 480);
    }
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.stroke();

    // Attendee details
    ctx.fillStyle = '#64748B';
    ctx.font = '16px monospace';
    ctx.fillText('PASS HOLDER', 72, 480);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText(passData.userName, 72, 520);

    ctx.fillStyle = '#64748B';
    ctx.font = '16px monospace';
    ctx.fillText('EMAIL', 72, 575);
    ctx.fillStyle = '#00E5CC';
    ctx.font = 'bold 22px monospace';
    ctx.fillText(passData.userEmail, 72, 608);

    ctx.fillStyle = '#64748B';
    ctx.font = '16px monospace';
    ctx.fillText('DEPARTMENT / YEAR', 72, 665);
    ctx.fillStyle = '#CBD5E1';
    ctx.font = '20px monospace';
    ctx.fillText(`${passData.department} (${passData.year})`, 72, 698);

    ctx.fillStyle = '#64748B';
    ctx.font = '16px monospace';
    ctx.fillText('PAYMENT REF', 72, 755);
    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(`${passData.paymentId} Â· ${passData.paymentStatus}`, 72, 788);

    // Draw QR Code image
    if (qrUrl) {
      try {
        const qrImg = new Image();
        qrImg.crossOrigin = 'anonymous';
        await new Promise((resolve) => {
          qrImg.onload = resolve;
          qrImg.onerror = resolve;
          qrImg.src = qrUrl;
        });
        ctx.fillStyle = '#FFFFFF';
        if (ctx.roundRect) {
          ctx.roundRect(560, 480, 240, 240, 16);
        } else {
          ctx.rect(560, 480, 240, 240);
        }
        ctx.fill();
        ctx.drawImage(qrImg, 570, 490, 220, 220);

        ctx.fillStyle = '#64748B';
        ctx.font = '16px monospace';
        ctx.fillText('SCAN AT GATE', 625, 750);
      } catch {}
    }

    // Footer
    ctx.fillStyle = '#475569';
    ctx.font = '18px monospace';
    ctx.fillText('ECE-FORUM-2026-PASS â€¢ OFFICIAL VERIFIED DIGITAL PASS', 170, 970);

    return canvas.toDataURL('image/png');
  };

  const handleDownload = async () => {
    soundFx.playClick();
    setIsDownloading(true);

    try {
      let dataUrl = '';

      if (cardRef.current) {
        try {
          await new Promise((resolve) => setTimeout(resolve, 150));
          const canvas = await html2canvas(cardRef.current, {
            scale: 2,
            backgroundColor: '#04060A',
            useCORS: true,
            allowTaint: true,
            logging: false,
          });
          dataUrl = canvas.toDataURL('image/png');
        } catch (canvasErr) {
          console.warn('html2canvas failed, falling back to direct canvas renderer:', canvasErr);
        }
      }

      if (!dataUrl || dataUrl === 'data:,') {
        dataUrl = await generateCanvasFallback(pass, qrDataUrl);
      }

      const link = document.createElement('a');
      link.download = `ECE-Pass-${pass.eventTitle.replace(/[^a-zA-Z0-9]/g, '_')}-${pass.passId}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      soundFx.playLaser();
    } catch (err) {
      console.error('Download error:', err);
      try {
        const fallbackUrl = await generateCanvasFallback(pass, qrDataUrl);
        const link = document.createElement('a');
        link.download = `ECE-Pass-${pass.passId}.png`;
        link.href = fallbackUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch {
        alert('Could not download pass. Please take a screenshot or use Print to PDF.');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    soundFx.playClick();
    const printWindow = window.open('', '_blank', 'width=650,height=800');
    if (!printWindow) {
      window.print();
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>ECE Forum Pass - ${pass.passId}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap');
            body {
              background-color: #04060A;
              color: #F8FAFC;
              font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
              box-sizing: border-box;
            }
            .pass-box {
              width: 100%;
              max-width: 440px;
              background: #0B1020;
              border: 2px solid #00E5CC;
              border-radius: 24px;
              padding: 28px;
              box-sizing: border-box;
              box-shadow: 0 0 40px rgba(0, 229, 204, 0.2);
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 1px solid rgba(255, 255, 255, 0.15);
              padding-bottom: 14px;
              margin-bottom: 16px;
            }
            .header-title {
              font-size: 11px;
              color: #00E5CC;
              font-family: 'JetBrains Mono', monospace;
              font-weight: 700;
              letter-spacing: 1.5px;
            }
            .header-sub {
              font-size: 10px;
              color: #94A3B8;
              font-family: 'JetBrains Mono', monospace;
            }
            .badge {
              background: rgba(0, 229, 204, 0.15);
              border: 1px solid #00E5CC;
              color: #00E5CC;
              font-family: 'JetBrains Mono', monospace;
              font-size: 10px;
              font-weight: 700;
              padding: 4px 10px;
              border-radius: 9999px;
            }
            .event-title {
              font-size: 20px;
              font-weight: 800;
              color: #FFFFFF;
              margin: 0 0 6px 0;
            }
            .event-meta {
              font-size: 12px;
              color: #94A3B8;
              font-family: 'JetBrains Mono', monospace;
              margin-bottom: 14px;
            }
            .venue {
              color: #FFD60A;
              font-weight: 600;
            }
            .id-box {
              background: #03060E;
              border: 1px solid rgba(0, 229, 204, 0.3);
              border-radius: 14px;
              padding: 12px 16px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 16px;
              font-family: 'JetBrains Mono', monospace;
            }
            .id-label {
              font-size: 9px;
              color: #64748B;
              text-transform: uppercase;
            }
            .id-val {
              font-size: 14px;
              font-weight: 800;
              color: #00E5CC;
            }
            .checksum-val {
              font-size: 12px;
              font-weight: 700;
              color: #FFD60A;
            }
            .details-grid {
              background: #03060E;
              border: 1px solid rgba(255, 255, 255, 0.08);
              border-radius: 16px;
              padding: 16px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 16px;
            }
            .details-col {
              font-family: 'JetBrains Mono', monospace;
              font-size: 11px;
              line-height: 1.5;
            }
            .details-label {
              font-size: 8px;
              color: #64748B;
              text-transform: uppercase;
              display: block;
              margin-top: 4px;
            }
            .details-val {
              font-weight: 700;
              color: #FFFFFF;
              font-size: 11px;
            }
            .qr-col {
              text-align: center;
              background: #FFFFFF;
              padding: 8px;
              border-radius: 12px;
            }
            .qr-col img {
              width: 100px;
              height: 100px;
              display: block;
            }
            .footer-note {
              text-align: center;
              font-size: 10px;
              color: #64748B;
              font-family: 'JetBrains Mono', monospace;
              border-top: 1px dashed rgba(255, 255, 255, 0.1);
              padding-top: 12px;
            }
            @media print {
              body { background: #FFFFFF !important; color: #000000 !important; }
              .pass-box { border: 2px solid #000000 !important; background: #FFFFFF !important; color: #000000 !important; box-shadow: none !important; }
              .id-box, .details-grid { background: #F8FAFC !important; border: 1px solid #CBD5E1 !important; }
              .event-title, .details-val, .id-val { color: #000000 !important; }
              .header-title, .badge { color: #000000 !important; border-color: #000000 !important; }
            }
          </style>
        </head>
        <body>
          <div class="pass-box">
            <div class="header">
              <div>
                <div class="header-title">â˜… OFFICIAL ENTRY PASS</div>
                <div class="header-sub">PIET â€¢ ECE Department Forum</div>
              </div>
              <div class="badge">${pass.status}</div>
            </div>

            <div class="event-title">${pass.eventTitle}</div>
            <div class="event-meta">
              ðŸ“… ${pass.eventDate} Â· â° ${pass.eventTime}<br>
              <span class="venue">ðŸ“ ${pass.eventVenue}</span>
            </div>

            <div class="id-box">
              <div>
                <span class="id-label">UNIQUE PASS ID</span>
                <div class="id-val">${pass.passId}</div>
              </div>
              <div style="text-align: right;">
                <span class="id-label">CHECKSUM</span>
                <div class="checksum-val">#${pass.securityHash}</div>
              </div>
            </div>

            <div class="details-grid">
              <div class="details-col">
                <span class="details-label">PASS HOLDER</span>
                <div class="details-val">${pass.userName}</div>

                <span class="details-label">EMAIL</span>
                <div class="details-val" style="color: #00E5CC;">${pass.userEmail}</div>

                <span class="details-label">COLLEGE / INSTITUTION</span>
                <div class="details-val" style="color: #FFD60A;">${pass.collegeName || 'PIET, Nagpur'}</div>

                <span class="details-label">DEPARTMENT / YEAR</span>
                <div class="details-val">${pass.department} (${pass.year})</div>

                <span class="details-label">PAYMENT REF</span>
                <div class="details-val">${pass.paymentId} Â· ${pass.paymentStatus}</div>
              </div>

              <div class="qr-col">
                ${qrDataUrl ? `<img src="${qrDataUrl}" alt="QR Code" />` : ''}
              </div>
            </div>

            <div class="footer-note">
              Show this QR code at the registration desk for verification.
            </div>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 300);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const isCheckedIn = pass.status === 'CHECKED_IN';

  return (
    <div className="space-y-4 max-w-md mx-auto">
      {/* Printable / Exportable Digital Pass Card Container */}
      <div
        ref={cardRef}
        id={`pass-card-${pass.passId}`}
        className="relative bg-gradient-to-b from-[#0B1020] via-[#060A14] to-[#04060A] border-2 border-[#FF4A15]/40 rounded-3xl p-6 sm:p-7 shadow-[0_0_50px_rgba(255,74,21,0.12)] overflow-hidden text-slate-100 font-sans"
      >
        {/* Holographic corner tech accents */}
        <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-lime/25 to-transparent rounded-tl-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-amber/25 to-transparent rounded-br-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-pink-500/10 to-transparent rounded-tr-3xl pointer-events-none" />

        {/* Top Header / Logos */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-midnight border border-white/10">
              <img src="/space_logo.webp" alt="SPACE" className="w-6 h-6 object-contain" />
              <span className="text-slate-600 text-[9px] font-mono">Ã—</span>
              <img src="/sinc_logo.webp" alt="SINC" className="w-6 h-6 object-contain filter drop-shadow-[0_0_4px_rgba(0,242,254,0.6)]" />
            </div>
            <div>
              <div className="text-[10px] font-mono font-bold text-lime uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-amber" />
                <span>OFFICIAL ENTRY PASS</span>
              </div>
              <div className="text-[9px] font-mono text-slate-400">PIET â€¢ ECE Department Forum</div>
            </div>
          </div>

          {/* Status Capsule */}
          <div
            className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border flex items-center gap-1.5 ${
              isCheckedIn
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                : 'bg-lime/15 text-lime border-lime/40 shadow-[0_0_12px_rgba(0,242,254,0.2)]'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isCheckedIn ? 'bg-emerald-400 animate-none' : 'bg-lime animate-ping'
              }`}
            />
            <span>{isCheckedIn ? 'CHECKED IN' : 'CONFIRMED'}</span>
          </div>
        </div>

        {/* Event Title Banner */}
        <div className="space-y-1 mb-5">
          <h4 className="font-space font-extrabold text-lg text-white leading-tight">
            {pass.eventTitle}
          </h4>
          <p className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
            <span>ðŸ“… {pass.eventDate}</span>
            <span>â€¢</span>
            <span>â° {pass.eventTime}</span>
          </p>
          <p className="text-[11px] font-mono text-amber">
            ðŸ“ {pass.eventVenue}
          </p>
        </div>

        {/* Pass ID Banner with Security Watermark */}
        <div className="p-3 rounded-2xl bg-midnight/90 border border-lime/30 flex items-center justify-between mb-4 relative overflow-hidden">
          <div className="absolute right-2 top-1 text-[24px] font-mono font-black text-white/[0.03] select-none pointer-events-none">
            SPACEÂ·SINC
          </div>
          <div>
            <span className="text-[9px] font-mono text-slate-400 block tracking-wider uppercase">
              UNIQUE PASS ID
            </span>
            <span className="text-sm font-mono font-black text-lime tracking-wider">
              {pass.passId}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[9px] font-mono text-slate-400 block tracking-wider uppercase">
              CHECKSUM
            </span>
            <span className="text-xs font-mono font-bold text-amber">
              #{pass.securityHash}
            </span>
          </div>
        </div>

        {/* Team Banner (If Team Pass) */}
        {pass.registrationType === 'team' && (
          <div className="mb-4 p-3 rounded-2xl bg-gradient-to-r from-amber/15 via-amber-500/10 to-transparent border border-amber/40 flex items-center justify-between">
            <div>
              <span className="text-[9px] font-mono text-amber uppercase tracking-wider block font-bold">
                TEAM PASS ({1 + (pass.teamMembers?.length || 0)} PARTICIPANTS)
              </span>
              <strong className="text-white font-space text-xs block">
                {pass.teamName || `${pass.userName}'s Team`}
              </strong>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber/20 text-amber border border-amber/40">
              TEAM PASS
            </span>
          </div>
        )}

        {/* Attendee Details & Dynamic QR Code Grid */}
        <div className="grid grid-cols-12 gap-4 items-center mb-4 bg-[#03060E] p-4 rounded-2xl border border-white/[0.08]">
          {/* Attendee Details Column */}
          <div className="col-span-7 space-y-2 text-xs font-mono">
            <div>
              <span className="text-[9px] text-slate-500 uppercase block">
                {pass.registrationType === 'team' ? 'TEAM LEADER' : 'PASS HOLDER'}
              </span>
              <strong className="text-white text-xs block truncate font-space font-bold">
                {pass.userName}
              </strong>
            </div>

            <div>
              <span className="text-[9px] text-slate-500 uppercase block">EMAIL</span>
              <strong className="text-lime text-[10px] block truncate">{pass.userEmail}</strong>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[9px] text-slate-500 uppercase block">YEAR</span>
                <strong className="text-slate-300 text-xs">{pass.year}</strong>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 uppercase block">PHONE</span>
                <strong className="text-slate-300 text-[10px] truncate block">{pass.phone || 'N/A'}</strong>
              </div>
            </div>

            <div>
              <span className="text-[9px] text-slate-500 uppercase block">INSTITUTION &amp; DEPT</span>
              <strong className="text-slate-200 text-[10px] block truncate" title={pass.collegeName}>
                {pass.collegeName || 'PIET, Nagpur'}
              </strong>
              <span className="text-slate-400 text-[9px] block truncate">
                {pass.department}
              </span>
            </div>
          </div>

          {/* High-Resolution Dynamic QR Code Frame */}
          <div className="col-span-5 flex flex-col items-center justify-center">
            <div className="p-2 bg-white rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.2)] relative group">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR code for ${pass.passId}`}
                  className="w-24 h-24 object-contain rounded-lg"
                />
              ) : (
                <div className="w-24 h-24 bg-slate-100 flex items-center justify-center rounded-lg">
                  <QrIcon className="w-8 h-8 text-slate-400 animate-spin" />
                </div>
              )}
            </div>
            <span className="text-[8px] font-mono text-slate-500 mt-1.5 uppercase tracking-wider text-center">
              Scan at Gate
            </span>
          </div>
        </div>

        {/* Team Members List (If Team Pass) */}
        {pass.registrationType === 'team' && pass.teamMembers && pass.teamMembers.length > 0 && (
          <div className="mb-4 p-3 rounded-2xl bg-[#03060E] border border-white/10 space-y-1.5 font-mono text-[10px]">
            <span className="text-slate-500 uppercase block text-[9px] font-bold">
              REGISTERED TEAM MEMBERS ({pass.teamMembers.length}):
            </span>
            <div className="space-y-1">
              {pass.teamMembers.map((m, idx) => (
                <div key={idx} className="flex justify-between items-center text-slate-300">
                  <span>{idx + 2}. <strong className="text-white">{m.name}</strong></span>
                  <span className="text-slate-500">{m.email}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Coupon Discount Banner if Coupon Applied */}
        {pass.couponCode && (
          <div className="mb-4 p-2.5 rounded-xl bg-cyber-emerald/10 border border-cyber-emerald/30 flex items-center justify-between text-[10px] font-mono text-cyber-emerald">
            <span>PROMO COUPON: <strong className="text-white">{pass.couponCode}</strong></span>
            <span>-â‚¹{pass.discountAmount || 0} DISCOUNT APPLIED</span>
          </div>
        )}

        {/* Verification Check-In Timestamp if checked in */}
        {isCheckedIn && (
          <div className="mb-4 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between text-[10px] font-mono text-emerald-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-bold">VERIFIED ENTRY:</span>
            </div>
            <span className="text-slate-200">{pass.checkedInAt}</span>
          </div>
        )}

        {/* Security & Payment Footer Badge */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[9px] font-mono text-slate-400">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="font-bold uppercase tracking-wider">
              {pass.amount > 0 ? `Paid â‚¹${pass.amount} (Razorpay)` : 'Free Admission Pass'}
            </span>
          </div>
          <div className="text-right text-[9px] text-slate-500">
            TXN: {pass.paymentId}
          </div>
        </div>

        {/* Decorative Laser Barcode Strip */}
        <div className="mt-3 pt-2 border-t border-dashed border-white/10 flex items-center justify-between opacity-50">
          <div className="flex gap-[2px] h-3 items-end">
            {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3].map((h, i) => (
              <span key={i} className={`w-[2px] bg-white h-${h}`} style={{ height: `${h * 3}px` }} />
            ))}
          </div>
          <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">
            ECE-FORUM-2026-PASS
          </span>
        </div>
      </div>

      {/* Action Buttons (Download PNG, Print PDF, Done) */}
      {showActions && (
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#FF4A15] to-[#FF6B3A] text-[#030508] font-[Syne] font-bold text-xs shadow-[0_0_20px_rgba(255,74,21,0.3)] hover:shadow-[0_0_30px_rgba(255,74,21,0.45)] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-midnight" />
                <span>Generating High-Res Pass...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Pass (PNG)</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="py-3 px-4 rounded-xl bg-midnight border border-white/15 text-slate-200 hover:text-white hover:border-lime/50 font-mono text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            title="Print / Save as PDF"
          >
            <Printer className="w-4 h-4 text-lime" />
            <span className="hidden sm:inline">Print / PDF</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-mono text-xs transition-all cursor-pointer"
            >
              Close
            </button>
          )}
        </div>
      )}
    </div>
  );
};
