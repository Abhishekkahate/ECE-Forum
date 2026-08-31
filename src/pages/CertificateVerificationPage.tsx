import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  QrCode as QrIcon,
  Award,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Camera,
  ExternalLink,
  Sparkles,
  Loader2,
  Calendar,
  User,
  Building2,
  Hash,
  Download,
  Printer,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { forumApi, type ApiCertificate, type CertificateVerificationResponse } from '../services/api';
import { CertificateCard } from '../components/CertificateCard';
import { soundFx } from '../utils/audio';

export const CertificateVerificationPage: React.FC = () => {
  const { certId: routeCertId } = useParams<{ certId?: string }>();
  const [searchParams] = useSearchParams();
  const queryCertId = searchParams.get('id') || routeCertId || '';

  const [inputCertId, setInputCertId] = useState(queryCertId);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<CertificateVerificationResponse | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [showFullCertificate, setShowFullCertificate] = useState(false);

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const navigate = useNavigate();

  const handleVerify = async (idToVerify: string) => {
    const cleanId = (idToVerify || '').trim();
    if (!cleanId) return;

    soundFx.playClick();
    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const result = await forumApi.verifyCertificate(cleanId);
      setVerificationResult(result);
      if (result.valid) {
        soundFx.playSuccess();
      } else {
        soundFx.playLaser();
      }
    } catch (err) {
      setVerificationResult({
        valid: false,
        status: 'INVALID',
        message: 'Could not connect to verification server. Please check your network.',
        verifiedAt: new Date().toISOString(),
      });
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    if (queryCertId) {
      setInputCertId(queryCertId);
      handleVerify(queryCertId);
    }
  }, [queryCertId]);

  // QR Scanner Lifecycle
  useEffect(() => {
    if (showScanner) {
      const scanner = new Html5QrcodeScanner(
        'certificate-qr-reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        false
      );

      scanner.render(
        (decodedText) => {
          let extractedId = decodedText.trim();
          try {
            if (extractedId.startsWith('{') && extractedId.endsWith('}')) {
              const parsed = JSON.parse(extractedId);
              if (parsed.certId) extractedId = parsed.certId;
            } else if (extractedId.includes('/verify/')) {
              extractedId = extractedId.split('/verify/')[1].split('?')[0];
            } else if (extractedId.includes('id=')) {
              extractedId = new URL(extractedId).searchParams.get('id') || extractedId;
            }
          } catch {}

          setInputCertId(extractedId);
          setShowScanner(false);
          scanner.clear().catch(() => {});
          handleVerify(extractedId);
        },
        () => {
          // Scanner frame error ignored
        }
      );

      scannerRef.current = scanner;

      return () => {
        scanner.clear().catch(() => {});
      };
    }
  }, [showScanner]);

  return (
    <div className="min-h-screen bg-[#030508] text-white selection:bg-[#FFD700]/30 selection:text-white py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-[#FFD700]/10 via-[#FF4A15]/5 to-transparent blur-[120px]" />
      </div>

      <div className="relative max-w-4xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/"
            onClick={() => soundFx.playClick()}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-mono text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to ECE Forum</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono text-white/50 uppercase tracking-wider">
              Registry Node Online
            </span>
          </div>
        </div>

        {/* Header Hero Section */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] text-xs font-mono font-bold tracking-wider uppercase shadow-[0_0_20px_rgba(255,215,0,0.15)]">
            <ShieldCheck className="w-4 h-4" />
            <span>Public Credential Verification Portal</span>
          </div>

          <h1 className="font-[Syne] font-[900] text-3xl sm:text-5xl text-white tracking-tight leading-tight">
            Verify E-Certificate
          </h1>

          <p className="text-sm sm:text-base text-white/60 max-w-xl mx-auto font-sans">
            Validate official academic and technical achievement certificates issued by the Department of
            Electronics &amp; Communication Engineering, PIET.
          </p>
        </div>

        {/* Search & Camera Input Card */}
        <div className="p-6 sm:p-8 rounded-[32px] bg-[rgba(10,14,22,0.92)] border border-white/[0.12] shadow-glass-xl backdrop-blur-3xl space-y-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerify(inputCertId);
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                value={inputCertId}
                onChange={(e) => setInputCertId(e.target.value)}
                placeholder="Enter Certificate ID (e.g. ECE-CERT-2026-XXXXX)"
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/[0.04] border border-white/15 text-sm sm:text-base text-white placeholder:text-white/35 font-mono focus:outline-none focus:border-[#FFD700] transition-colors uppercase"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setShowScanner(!showScanner);
                }}
                className={`px-4 py-3.5 rounded-2xl border flex items-center justify-center gap-2 text-xs font-mono font-bold transition-all cursor-pointer ${
                  showScanner
                    ? 'bg-[#FF4A15] border-[#FF4A15] text-white shadow-lg'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
                }`}
                title="Scan QR Code via Camera"
              >
                <Camera className="w-4 h-4" />
                <span className="hidden sm:inline">{showScanner ? 'Close Cam' : 'Scan QR'}</span>
              </button>

              <button
                type="submit"
                disabled={isVerifying || !inputCertId.trim()}
                className="px-7 py-3.5 rounded-2xl bg-[#FFD700] hover:bg-[#F5C700] text-black font-bold text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(255,215,0,0.3)] transition-all cursor-pointer disabled:opacity-50"
              >
                {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>{isVerifying ? 'Validating...' : 'Verify Now'}</span>
              </button>
            </div>
          </form>

          {/* Camera QR Viewport */}
          {showScanner && (
            <div className="p-4 rounded-2xl bg-black/60 border border-white/15 space-y-3 animate-in fade-in zoom-in-[0.98]">
              <div className="flex items-center justify-between text-xs font-mono text-white/70">
                <span className="flex items-center gap-2 text-[#00E5CC]">
                  <Camera className="w-3.5 h-3.5" /> Align Certificate QR Code inside camera frame
                </span>
                <button
                  onClick={() => setShowScanner(false)}
                  className="text-white/40 hover:text-white text-xs cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>
              <div id="certificate-qr-reader" className="overflow-hidden rounded-xl bg-black" />
            </div>
          )}
        </div>

        {/* Verification Result Card */}
        {verificationResult && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {verificationResult.valid && verificationResult.certificate ? (
              <div className="p-6 sm:p-8 rounded-[32px] bg-gradient-to-b from-[rgba(12,24,18,0.95)] to-[rgba(8,16,12,0.98)] border border-emerald-500/30 shadow-[0_20px_60px_rgba(16,185,129,0.15)] backdrop-blur-3xl space-y-6">
                {/* Result Header Badge */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-emerald-500/20">
                  <div className="flex items-center gap-3.5">
                    <span className="w-12 h-12 rounded-2xl bg-emerald-500 text-black grid place-items-center shrink-0 shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                      <CheckCircle2 className="w-7 h-7" />
                    </span>
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-mono font-bold uppercase tracking-wider border border-emerald-500/40">
                        <ShieldCheck className="w-3 h-3" />
                        <span>OFFICIALLY VERIFIED CREDENTIAL</span>
                      </div>
                      <h2 className="font-[Syne] font-[800] text-xl sm:text-2xl text-white mt-1">
                        Authentic Certificate Validated
                      </h2>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      soundFx.playClick();
                      setShowFullCertificate(!showFullCertificate);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-mono text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{showFullCertificate ? 'Hide Certificate' : 'View Full Certificate'}</span>
                  </button>
                </div>

                {/* Details Dossier Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06] space-y-1">
                    <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">
                      Recipient Name
                    </span>
                    <div className="text-base font-bold text-white flex items-center gap-1.5">
                      <User className="w-4 h-4 text-emerald-400" />
                      <span>{verificationResult.certificate.userName}</span>
                    </div>
                    <div className="text-xs font-mono text-white/50 truncate">
                      {verificationResult.certificate.department}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06] space-y-1">
                    <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">
                      Achievement / Award
                    </span>
                    <div className="text-base font-bold text-[#FFD700] flex items-center gap-1.5">
                      <Award className="w-4 h-4" />
                      <span>{verificationResult.certificate.title}</span>
                    </div>
                    <div className="text-xs font-mono text-emerald-300">
                      {verificationResult.certificate.rankText || 'Participant'}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06] space-y-1">
                    <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">
                      Event / Forum
                    </span>
                    <div className="text-base font-bold text-white truncate">
                      {verificationResult.certificate.eventTitle}
                    </div>
                    <div className="text-xs font-mono text-white/50 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{verificationResult.certificate.eventDate}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06] space-y-1">
                    <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">
                      Certificate ID
                    </span>
                    <div className="text-xs font-mono text-[#00E5CC] font-bold">
                      {verificationResult.certificate.certId}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06] space-y-1">
                    <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">
                      Issuing Institution
                    </span>
                    <div className="text-xs font-semibold text-white">
                      PIET Nagpur · SPACE × SINC
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06] space-y-1">
                    <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">
                      Security Hash
                    </span>
                    <div className="text-[11px] font-mono text-white/60 truncate">
                      {verificationResult.certificate.securityHash}
                    </div>
                  </div>
                </div>

                {/* Interactive Certificate View */}
                {showFullCertificate && (
                  <div className="pt-6 border-t border-emerald-500/20">
                    <CertificateCard certificate={verificationResult.certificate} />
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 sm:p-8 rounded-[32px] bg-[rgba(26,10,12,0.95)] border border-red-500/30 shadow-[0_20px_60px_rgba(239,68,68,0.15)] backdrop-blur-3xl space-y-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-red-500/20 border border-red-500/40 mx-auto grid place-items-center text-red-400">
                  <ShieldAlert className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-[Syne] font-[800] text-xl text-white">
                    {verificationResult.status === 'REVOKED'
                      ? 'Certificate Revoked'
                      : 'Certificate Not Found'}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/60 max-w-md mx-auto">
                    {verificationResult.message}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
