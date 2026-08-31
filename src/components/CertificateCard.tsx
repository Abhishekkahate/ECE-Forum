import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import {
  Download,
  Printer,
  ShieldCheck,
  CheckCircle2,
  QrCode as QrIcon,
  Sparkles,
  Loader2,
  Copy,
  Check,
  ExternalLink,
  Award,
  Maximize2,
  X,
  Share2,
} from 'lucide-react';
import { type ApiCertificate } from '../services/api';
import { CERTIFICATE_TEMPLATES, certificateService } from '../services/certificateService';
import { soundFx } from '../utils/audio';

interface CertificateCardProps {
  certificate: ApiCertificate;
  onClose?: () => void;
  showActions?: boolean;
}

export const CertificateCard: React.FC<CertificateCardProps> = ({
  certificate,
  onClose,
  showActions = true,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const activeTemplate =
    CERTIFICATE_TEMPLATES.find((t) => t.id === certificate.templateId) || CERTIFICATE_TEMPLATES[0];

  useEffect(() => {
    const generateQR = async () => {
      try {
        const verifyUrl = certificateService.generateVerificationQrUrl(certificate.certId);
        const url = await QRCode.toDataURL(verifyUrl, {
          width: 340,
          margin: 1,
          color: {
            dark: '#030712',
            light: '#FFFFFF',
          },
          errorCorrectionLevel: 'H',
        });
        setQrDataUrl(url);
      } catch (err) {
        console.error('Failed to generate certificate QR', err);
      }
    };
    generateQR();
  }, [certificate.certId]);

  const handleCopyLink = () => {
    soundFx.playClick();
    const url = certificateService.generateVerificationQrUrl(certificate.certId);
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  const handleCopyId = () => {
    soundFx.playClick();
    navigator.clipboard.writeText(certificate.certId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2200);
  };

  const handlePrint = () => {
    soundFx.playClick();
    window.print();
  };

  const handleDownload = async () => {
    if (!cardRef.current || isDownloading) return;
    soundFx.playClick();
    setIsDownloading(true);

    try {
      // 1. Direct html2canvas capture
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#030508',
        logging: false,
        imageTimeout: 15000,
      });

      const image = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.href = image;
      const cleanName = (certificate.userName || 'Student').replace(/\s+/g, '_');
      link.download = `ECE_CERT_${certificate.certId}_${cleanName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      soundFx.playSuccess();
    } catch (err) {
      console.warn('html2canvas capture error, falling back to manual canvas render:', err);
      try {
        await manualCanvasDownload(certificate, qrDataUrl);
        soundFx.playSuccess();
      } catch (e) {
        console.error('Canvas export failed:', e);
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const manualCanvasDownload = async (cert: ApiCertificate, qrUrl: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1600;
    canvas.height = 1130;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Outer Background
    const bgGrad = ctx.createLinearGradient(0, 0, 1600, 1130);
    bgGrad.addColorStop(0, '#0B0F19');
    bgGrad.addColorStop(0.5, '#070A11');
    bgGrad.addColorStop(1, '#04060A');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1600, 1130);

    // Gold Border
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 6;
    ctx.strokeRect(30, 30, 1540, 1070);

    ctx.strokeStyle = 'rgba(255, 215, 0, 0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(46, 46, 1508, 1038);

    // Header
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PRIYADARSHINI INSTITUTE OF ENGINEERING & TECHNOLOGY, NAGPUR', 800, 120);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('DEPARTMENT OF ELECTRONICS & COMMUNICATION ENGINEERING', 800, 155);

    ctx.fillStyle = '#00E5CC';
    ctx.font = '16px monospace';
    ctx.fillText('SPACE & SINC STUDENT FORUM COUNCIL 2026—27', 800, 190);

    // Title
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 44px Georgia, serif';
    ctx.fillText(cert.title.toUpperCase(), 800, 270);

    // Subtitle
    ctx.fillStyle = '#94A3B8';
    ctx.font = '22px sans-serif';
    ctx.fillText('This is proudly presented to', 800, 340);

    // Recipient Name
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 54px Georgia, serif';
    ctx.fillText(cert.userName, 800, 420);

    // Line under name
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(400, 445);
    ctx.lineTo(1200, 445);
    ctx.stroke();

    // Body text
    ctx.fillStyle = '#E2E8F0';
    ctx.font = '24px sans-serif';
    const rankInfo = cert.rankText ? ` securing ${cert.rankText}` : '';
    const descText =
      cert.description ||
      `for active and meritorious participation in "${cert.eventTitle}" organized on ${cert.eventDate} by the Department of Electronics & Communication Engineering.`;
    ctx.fillText(descText.substring(0, 110), 800, 520);
    if (descText.length > 110) {
      ctx.fillText(descText.substring(110, 220), 800, 560);
    }

    // Certificate Meta
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`ID: ${cert.certId}`, 100, 960);
    ctx.fillStyle = '#94A3B8';
    ctx.fillText(`Issued: ${cert.issuedAt}`, 100, 995);
    ctx.fillText(`Hash: ${cert.securityHash}`, 100, 1030);

    // Signatories
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('Dr. G. M. Asutkar', 550, 980);
    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#94A3B8';
    ctx.fillText('Principal & Patron, PIET', 550, 1010);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('Dr. R. S. Somkuwar', 1050, 980);
    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#94A3B8';
    ctx.fillText('Head of Department, ECE', 1050, 1010);

    // Draw QR
    if (qrUrl) {
      const qrImg = new Image();
      qrImg.src = qrUrl;
      await new Promise((resolve) => {
        qrImg.onload = () => {
          ctx.drawImage(qrImg, 1340, 890, 150, 150);
          resolve(true);
        };
        qrImg.onerror = () => resolve(false);
      });
    }

    const image = canvas.toDataURL('image/png', 1.0);
    const link = document.createElement('a');
    link.href = image;
    link.download = `ECE_CERT_${cert.certId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getRankBadgeStyle = (type: string, rank?: string) => {
    switch (type) {
      case 'WINNER_1ST':
        return {
          bg: 'bg-gradient-to-r from-amber-500/25 via-yellow-400/20 to-amber-500/25',
          border: 'border-yellow-400/50',
          text: 'text-yellow-300',
          label: rank || '🥇 1ST PLACE WINNER',
        };
      case 'RUNNER_UP_2ND':
        return {
          bg: 'bg-gradient-to-r from-slate-400/25 via-slate-300/20 to-slate-400/25',
          border: 'border-slate-300/50',
          text: 'text-slate-200',
          label: rank || '🥈 1ST RUNNER UP (2ND)',
        };
      case 'RUNNER_UP_3RD':
        return {
          bg: 'bg-gradient-to-r from-amber-700/25 via-orange-600/20 to-amber-700/25',
          border: 'border-amber-600/50',
          text: 'text-amber-400',
          label: rank || '🥉 2ND RUNNER UP (3RD)',
        };
      case 'MERIT':
        return {
          bg: 'bg-gradient-to-r from-purple-500/25 via-pink-500/20 to-purple-500/25',
          border: 'border-purple-400/50',
          text: 'text-purple-300',
          label: rank || '⭐ CERTIFICATE OF MERIT',
        };
      case 'APPRECIATION':
        return {
          bg: 'bg-gradient-to-r from-emerald-500/25 via-teal-500/20 to-emerald-500/25',
          border: 'border-emerald-400/50',
          text: 'text-emerald-300',
          label: rank || '🌟 SPECIAL APPRECIATION',
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-cyan-500/20 via-blue-500/15 to-cyan-500/20',
          border: 'border-cyan-400/40',
          text: 'text-cyan-300',
          label: rank || '✦ OFFICIAL PARTICIPATION',
        };
    }
  };

  const badgeInfo = getRankBadgeStyle(certificate.certType, certificate.rankText);

  return (
    <div className="w-full space-y-4">
      {/* Action Toolbar */}
      {showActions && (
        <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-2xl bg-[rgba(12,16,24,0.85)] border border-white/10 backdrop-blur-2xl">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
            <span className="text-xs font-mono text-white/80 font-semibold tracking-wide">
              {certificate.certId}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              VERIFIED OFFICIAL
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handleCopyId}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Copy Certificate ID"
            >
              {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedId ? 'Copied' : 'Copy ID'}</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Copy Verification Link"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedLink ? 'Link Copied' : 'Share Link'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Print Certificate (Landscape)"
            >
              <Printer className="w-3.5 h-3.5 text-[#00E5CC]" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#FF4A15] hover:bg-[#E84410] text-white font-bold text-xs font-mono shadow-[0_4px_16px_rgba(255,74,21,0.35)] transition-all cursor-pointer disabled:opacity-50"
            >
              {isDownloading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>{isDownloading ? 'Exporting HD...' : 'Download PNG'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Printable / Visual Certificate Container */}
      <div className="relative w-full overflow-hidden rounded-[28px] p-1 sm:p-2 bg-gradient-to-b from-white/15 via-white/5 to-transparent shadow-2xl">
        <div
          ref={cardRef}
          className={`relative w-full aspect-[1.414/1] min-h-[480px] sm:min-h-[580px] md:min-h-[660px] rounded-[24px] p-6 sm:p-10 md:p-14 flex flex-col justify-between overflow-hidden select-none ${
            certificate.templateBg ? '' : `bg-gradient-to-br ${activeTemplate.theme.bgGradient}`
          }`}
          style={
            certificate.templateBg
              ? {
                  backgroundImage: `url(${certificate.templateBg})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }
              : {}
          }
        >
          {/* Ornamental Outer Guilloché / Luxury Border */}
          <div className="pointer-events-none absolute inset-3 sm:inset-5 rounded-[18px] border-2 border-[#FFD700]/60 z-10" />
          <div className="pointer-events-none absolute inset-4 sm:inset-6 rounded-[14px] border border-white/15 z-10" />
          
          {/* Corner Ornamental Accents */}
          <div className="pointer-events-none absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-[#FFD700] z-10" />
          <div className="pointer-events-none absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-[#FFD700] z-10" />
          <div className="pointer-events-none absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-[#FFD700] z-10" />
          <div className="pointer-events-none absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-[#FFD700] z-10" />

          {/* Background Watermark Crest */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.04] z-0">
            <Award className="w-[420px] h-[420px] text-white" />
          </div>

          {/* 1. Certificate Header Section */}
          <div className="relative z-20 flex items-start justify-between gap-4">
            {/* College & Department Crest */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white p-1.5 shadow-lg border border-black/10 grid place-items-center overflow-hidden">
                <img src="/space_logo.webp" alt="SPACE" className="w-full h-full object-contain" />
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white p-1.5 shadow-lg border border-black/10 grid place-items-center overflow-hidden">
                <img src="/sinc_logo.webp" alt="SINC" className="w-full h-full object-contain" style={{ filter: 'brightness(0.15)' }} />
              </div>
              <div className="leading-tight">
                <div className="font-[Syne] font-[800] text-xs sm:text-sm md:text-base tracking-tight text-[#F5F3EF]">
                  PRIYADARSHINI INSTITUTE OF ENGINEERING &amp; TECHNOLOGY
                </div>
                <div className="text-[10px] sm:text-xs font-mono text-[#00E5CC] font-semibold tracking-wider uppercase">
                  Department of Electronics &amp; Communication Engineering
                </div>
                <div className="text-[9px] sm:text-[10px] font-mono text-white/50">
                  SPACE × SINC Dual Student Forum Council · Session 2026—27
                </div>
              </div>
            </div>

            {/* Official Hologram & Verified Stamp */}
            <div className="hidden sm:flex flex-col items-end shrink-0">
              <div className="px-3 py-1 rounded-full bg-[#FFD700]/15 border border-[#FFD700]/40 text-[#FFD700] text-[10px] font-mono font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,215,0,0.2)]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>OFFICIAL ACCREDITATION</span>
              </div>
              <span className="text-[9px] font-mono text-white/40 mt-1">NAAC A+ ACCREDITED</span>
            </div>
          </div>

          {/* 2. Certificate Body Section */}
          <div className="relative z-20 my-auto text-center py-4 sm:py-6 space-y-3 sm:space-y-4">
            {/* Certificate Title */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border text-[11px] sm:text-xs font-mono font-bold tracking-widest uppercase shadow-md backdrop-blur-md ${badgeInfo.bg} ${badgeInfo.border} ${badgeInfo.text}">
                <Sparkles className="w-3 h-3" />
                <span>{badgeInfo.label}</span>
              </div>

              <h1 className="font-[Syne] font-[900] text-2xl sm:text-4xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-[#FFF] via-[#FCEABB] to-[#D4AF37] tracking-tight uppercase drop-shadow-md">
                {certificate.title}
              </h1>
            </div>

            {/* Presentation Line */}
            <p className="text-xs sm:text-sm font-serif italic text-white/70">
              This certificate is proudly and honorably presented to
            </p>

            {/* Recipient Full Name */}
            <div className="relative inline-block py-1 sm:py-2">
              <span className="font-[Syne] font-[800] text-xl sm:text-3xl md:text-4xl text-white tracking-wide border-b-2 border-[#FFD700]/80 pb-1 px-6 sm:px-12 inline-block drop-shadow-[0_2px_12px_rgba(255,215,0,0.3)]">
                {certificate.userName}
              </span>
            </div>

            {/* Department / College */}
            <p className="text-[11px] sm:text-xs font-mono text-[#00E5CC] font-medium">
              {certificate.department} · {certificate.collegeName || 'PIET, Nagpur'}
            </p>

            {/* Commendation Description */}
            <div className="max-w-2xl mx-auto px-4">
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-sans font-light">
                {certificate.description || (
                  <>
                    for active and meritorious participation in{' '}
                    <strong className="text-white font-semibold">"{certificate.eventTitle}"</strong> held on{' '}
                    <span className="text-[#FFD700] font-mono">{certificate.eventDate}</span>, conducted with
                    distinction by the SPACE &amp; SINC Forum at Priyadarshini Institute of Engineering &amp;
                    Technology.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* 3. Certificate Footer & Signatories */}
          <div className="relative z-20 pt-4 border-t border-white/10 flex flex-wrap items-end justify-between gap-4 sm:gap-6">
            {/* Left: Security Credentials & QR Code */}
            <div className="flex items-center gap-3 shrink-0">
              {qrDataUrl ? (
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white p-1 rounded-xl shadow-md border border-white/20 shrink-0">
                  <img src={qrDataUrl} alt="Verify QR Code" className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/10 rounded-xl grid place-items-center">
                  <QrIcon className="w-6 h-6 text-white/50" />
                </div>
              )}

              <div className="space-y-0.5 text-left">
                <div className="text-[9px] sm:text-[10px] font-mono text-[#FFD700] font-bold">
                  CREDENTIAL: {certificate.certId}
                </div>
                <div className="text-[8.5px] sm:text-[9.5px] font-mono text-white/50">
                  Issued Date: {certificate.issuedAt}
                </div>
                <div className="text-[8px] font-mono text-white/40 max-w-[150px] truncate">
                  Hash: {certificate.securityHash}
                </div>
                <div className="text-[8px] font-mono text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  <span>Scan to verify on official portal</span>
                </div>
              </div>
            </div>

            {/* Right: Official Signatories */}
            <div className="flex items-center gap-4 sm:gap-8 shrink-0 text-center ml-auto">
              {certificate.signatories && certificate.signatories.length > 0 ? (
                certificate.signatories.slice(0, 3).map((sig, idx) => (
                  <div key={idx} className="space-y-1 text-center">
                    <div className="h-7 sm:h-8 flex items-center justify-center font-serif italic text-xs sm:text-sm text-[#FFD700] font-semibold opacity-90">
                      {sig.signatureImg ? (
                        <img src={sig.signatureImg} alt={sig.name} className="h-full object-contain" />
                      ) : (
                        <span>✍ {sig.name.split(' ')[0]}...</span>
                      )}
                    </div>
                    <div className="w-24 sm:w-28 h-px bg-white/20 mx-auto" />
                    <div className="text-[10px] sm:text-[11px] font-bold text-white leading-tight">
                      {sig.name}
                    </div>
                    <div className="text-[8px] sm:text-[9px] font-mono text-white/50 leading-tight">
                      {sig.title}
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div className="space-y-0.5 text-center">
                    <div className="h-7 sm:h-8 flex items-center justify-center font-serif italic text-xs sm:text-sm text-[#FFD700]">
                      ✍ G.M. Asutkar
                    </div>
                    <div className="w-24 sm:w-28 h-px bg-white/20 mx-auto" />
                    <div className="text-[10px] sm:text-[11px] font-bold text-white">Dr. G. M. Asutkar</div>
                    <div className="text-[8px] sm:text-[9px] font-mono text-white/50">Principal &amp; Patron</div>
                  </div>

                  <div className="space-y-0.5 text-center">
                    <div className="h-7 sm:h-8 flex items-center justify-center font-serif italic text-xs sm:text-sm text-[#FFD700]">
                      ✍ R.S. Somkuwar
                    </div>
                    <div className="w-24 sm:w-28 h-px bg-white/20 mx-auto" />
                    <div className="text-[10px] sm:text-[11px] font-bold text-white">Dr. R. S. Somkuwar</div>
                    <div className="text-[8px] sm:text-[9px] font-mono text-white/50">Head of Department</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
