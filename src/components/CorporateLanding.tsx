import React from "react";
import {
  Phone,
  CheckCircle2,
  ShieldCheck,
  Award,
  MapPin,
  Zap,
  Wind,
  Wrench,
  ChevronRight,
  Clock,
  Box,
  Facebook,
  Instagram,
  Twitter,
  Music,
  Youtube,
} from "lucide-react";
import { translations } from "../translations";
import { motion } from "motion/react";
import { optWebp } from "../data";
import { Lightbox } from "./Lightbox";
import { useState } from "react";

const IconMap: Record<string, React.ElementType> = {
  Zap,
  Wind,
  Wrench,
  Box,
};

export const CorporateLanding = ({
  services = [],
  clientLogos = [],
  companyInfo,
  lang = "MS",
}: {
  services?: any[];
  clientLogos?: any[];
  companyInfo?: any;
  lang?: "MS" | "EN";
}) => {
  const t = translations[lang];
  const [lightboxState, setLightboxState] = useState<{ images: string[], index: number } | null>(null);

  // Config common container animations
  const sectionVariants = {
    hidden: { opacity: 0, y: 35 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: (customIndex: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        delay: customIndex * 0.1,
      },
    }),
  };

  return (
    <div className="bg-[#f8fafc] font-sans antialiased text-slate-800">
      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-700 via-slate-900 to-black"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 md:py-32 flex flex-col items-center text-center">
          <div className="mb-6 inline-flex items-center bg-white/10 px-4 py-2 rounded-full text-sm font-medium text-[#D4AF37] backdrop-blur-sm border border-white/10">
            <MapPin className="w-4 h-4 mr-2" /> {t.kuantanPahang}
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight leading-tight max-w-4xl">
            {lang === "MS" ? (
              <>
                Kontraktor Elektrik &{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-yellow-200">
                  Servis Aircond
                </span>{" "}
                Berdaftar di Kuantan & Pekan
              </>
            ) : (
              <>
                Registered Electrical &{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-yellow-200">
                  Aircond Service
                </span>{" "}
                Contractor in Kuantan & Pekan
              </>
            )}
          </h1>

          <p className="text-base md:text-lg text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            {t.heroDesc}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <a
              href="https://wa.me/601162995904"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex justify-center items-center bg-[#D4AF37] text-slate-900 px-8 py-4 rounded-full font-bold text-base hover:bg-[#b8952c] transition shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              {t.getQuote} <ChevronRight className="w-5 h-5 ml-2" />
            </a>
            <a
              href="#perkhidmatan"
              className="inline-flex justify-center items-center bg-white/10 text-white border border-white/20 px-8 py-4 rounded-full font-bold text-base hover:bg-white/20 transition backdrop-blur-sm"
            >
              {t.viewServices}
            </a>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionVariants}
        className="py-8 sm:py-12 bg-white border-b border-slate-100 shadow-sm relative z-20 -mt-6 mx-4 rounded-xl md:mx-auto max-w-6xl"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 px-4 sm:px-6">
          {[
            { label: t.g2Contractor, icon: Award, desc: t.registeredCidb },
            {
              label: t.electricalExpert,
              icon: ShieldCheck,
              desc: t.energyCommission,
            },
            { label: t.spkkCert, icon: CheckCircle2, desc: t.certApproval },
            { label: t.bumiputeraStatus, icon: Award, desc: t.govRecognized },
          ].map((item, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={itemVariants}
              className="flex flex-col items-center text-center p-2"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-50 flex items-center justify-center rounded-full mb-3 sm:mb-4 shadow-inner hover:scale-110 transition-transform">
                <item.icon className="w-6 h-6 sm:w-8 sm:h-8 text-[#D4AF37]" />
              </div>
              <span className="font-bold text-slate-900 text-xs sm:text-base md:text-lg mb-1 leading-tight">
                {item.label}
              </span>
              <span className="text-[9px] sm:text-xs text-slate-500 tracking-wide uppercase leading-tight">
                {item.desc}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Main Services (SEO Focus) */}
      <section
        id="perkhidmatan"
        className="py-12 sm:py-20 md:py-24 px-4 sm:px-6 max-w-7xl mx-auto overflow-hidden"
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={sectionVariants}
          className="text-center mb-10 sm:mb-16"
        >
          <span className="text-[#D4AF37] font-extrabold text-[10px] sm:text-xs uppercase tracking-wider block mb-2">
            BFGKualiti Terbaik
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-[#0F172A] mb-4 sm:mb-6 tracking-tight">
            {t.servicesTitle}
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
            {t.servicesDesc}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {services.map((svc, idx) => {
            const IconComponent = IconMap[svc.iconName] || Box;
            return (
              <motion.div
                key={svc.id || idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                custom={idx % 3}
                variants={itemVariants}
                className="bg-white rounded-2xl shadow-lg border border-slate-100 flex flex-col hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 ease-out group overflow-hidden"
              >
                
                {svc.imageUrl ? (
                  <div 
                    className="h-44 sm:h-48 w-full bg-slate-100 relative overflow-hidden cursor-pointer"
                    onClick={() => setLightboxState({ images: [svc.imageUrl!], index: 0 })}
                  >
                    <img
                      src={optWebp(svc.imageUrl)}
                      alt={svc.title}

                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      decoding="async"
                      width="400"
                      height="300"
                    />
                    <div className="absolute top-4 left-4 w-10 h-10 bg-white/90 backdrop-blur text-[#D4AF37] flex items-center justify-center rounded-lg shadow-md">
                      <IconComponent className="w-6 h-6" />
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 p-6 pb-0">
                    <IconComponent className="w-12 h-12 text-[#D4AF37]" />
                  </div>
                )}

                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 sm:mb-4">
                      {svc.title}
                    </h3>
                    <p className="text-slate-600 text-xs sm:text-sm mb-6 leading-relaxed text-justify">
                      {svc.description}
                    </p>
                  </div>
                  <ul className="text-xs sm:text-sm text-slate-700 space-y-2 border-t border-slate-50 pt-4">
                    {(svc.bullets || []).map((b: string, i: number) => (
                      <li key={i} className="flex items-start">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span className="leading-snug text-left">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Rakan Kerjasama & Korporat Client */}
      {clientLogos && clientLogos.length > 0 && (
        <section className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-100 overflow-hidden">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={sectionVariants}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {t.partnerTitle}
            </h2>
            <p className="text-slate-500 mt-2">{t.partnerDesc}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-8 md:gap-12 items-center opacity-75 hover:opacity-100 transition-opacity"
          >
            {clientLogos.map((logo, i) => (
              <motion.div
                key={logo.id || i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="w-32 h-16 md:w-40 md:h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300"
              >
                {logo.logoUrl ? (
                  <img
                    src={optWebp(logo.logoUrl)}
                    alt={logo.name}
                    decoding="async"
                    loading="lazy"
                    className="max-h-full max-w-full object-contain"
                    referrerPolicy="no-referrer"
                    width="160"
                    height="80"
                  />
                ) : (
                  <span className="font-bold text-slate-400 uppercase tracking-widest text-center text-sm">
                    {logo.name}
                  </span>
                )}
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}

      {/* Social Media Section */}
      {companyInfo &&
        (companyInfo.facebookUrl ||
          companyInfo.instagramUrl ||
          companyInfo.tiktokUrl ||
          companyInfo.twitterUrl ||
          companyInfo.youtubeUrl) && (
          <section className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-100 overflow-hidden">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={sectionVariants}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {lang === "MS"
                  ? "Pautan Media Sosial Rasmi"
                  : "Official Social Media"}
              </h2>
              <p className="text-slate-500 mt-2">
                {lang === "MS"
                  ? "Ikuti perkembangan dan hasil kerja terbaru kami secara langsung di platform media sosial."
                  : "Follow our latest updates and projects live on our social media platforms."}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-4 lg:flex lg:flex-wrap lg:justify-center gap-6 max-w-5xl mx-auto"
            >
              {companyInfo.facebookUrl && (
                <a
                  href={companyInfo.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="lg:w-48 group bg-white border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center hover:border-[#1877F2] hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-16 h-16 bg-blue-50 text-[#1877F2] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Facebook className="w-8 h-8" />
                  </div>
                  <span className="font-bold text-slate-800">Facebook</span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 mt-1">
                    Official Page
                  </span>
                </a>
              )}
              {companyInfo.tiktokUrl && (
                <a
                  href={companyInfo.tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="lg:w-48 group bg-white border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center hover:border-black hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-16 h-16 bg-slate-100 text-black rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Music className="w-8 h-8" />
                  </div>
                  <span className="font-bold text-slate-800">TikTok</span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 mt-1">
                    Official Page
                  </span>
                </a>
              )}
              {companyInfo.instagramUrl && (
                <a
                  href={companyInfo.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="lg:w-48 group bg-white border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center hover:border-[#E1306C] hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-16 h-16 bg-pink-50 text-[#E1306C] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Instagram className="w-8 h-8" />
                  </div>
                  <span className="font-bold text-slate-800">Instagram</span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 mt-1">
                    Official Page
                  </span>
                </a>
              )}
              {companyInfo.twitterUrl && (
                <a
                  href={companyInfo.twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="lg:w-48 group bg-white border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center hover:border-[#1DA1F2] hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-16 h-16 bg-sky-50 text-[#1DA1F2] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Twitter className="w-8 h-8" />
                  </div>
                  <span className="font-bold text-slate-800">X (Twitter)</span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 mt-1">
                    Official Page
                  </span>
                </a>
              )}
              {companyInfo.youtubeUrl && (
                <a
                  href={companyInfo.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="lg:w-48 group bg-white border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center hover:border-[#FF0000] hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-16 h-16 bg-red-50 text-[#FF0000] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Youtube className="w-8 h-8" />
                  </div>
                  <span className="font-bold text-slate-800">YouTube</span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 mt-1">
                    Official Channel
                  </span>
                </a>
              )}
            </motion.div>
          </section>
        )}

      {/* Coverage Area CTA */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionVariants}
        className="bg-slate-900 border-b border-t-4 border-[#D4AF37] py-20 px-6 relative overflow-hidden"
      >
        <div className="absolute inset-0 z-0">
          <img
            src={optWebp("https://picsum.photos/800/600")}
            className="w-full h-full object-cover opacity-30"
            alt="Pahang Background"
            loading="lazy"
            width="2072"
            height="1381"
          />
        </div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            {t.coverageTitle}
          </h2>
          <p className="text-base md:text-lg text-slate-300 mb-10 max-w-2xl mx-auto font-medium">
            {t.coverageDesc}
          </p>
          <a
            href="https://wa.me/601162995904"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center bg-[#D4AF37] text-slate-900 px-10 py-5 rounded-full font-bold text-base hover:bg-[#b8952c] transition shadow-xl hover:-translate-y-1"
          >
            <Clock className="w-6 h-6 mr-3" /> {t.bookToday}
          </a>
        </div>
      </motion.section>

      {/* SEO FAQ Section */}
      <section className="py-24 px-6 bg-white overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={sectionVariants}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
              {t.faqTitle}
            </h2>
            <p className="text-slate-600">{t.faqDesc}</p>
          </motion.div>

          <div className="space-y-6">
            {[
              {
                q: lang === "MS" ? "Kawasan Liputan?" : "Coverage Area?",
                a:
                  lang === "MS" ? (
                    <>
                      Kami cover servis aircond dan elektrikal secara meluas di
                      area <strong className="text-slate-800">Kuantan</strong>{" "}
                      dan <strong className="text-slate-800">Pekan</strong>,
                      Pahang. Untuk projek komersial atau bangunan, liputan kami
                      berkembang hingga ke Maran dan Raub mengikut keperluan
                      pelanggan.
                    </>
                  ) : (
                    <>
                      We comprehensively cover aircond and electrical services
                      in the areas of{" "}
                      <strong className="text-slate-800">Kuantan</strong> and{" "}
                      <strong className="text-slate-800">Pekan</strong>, Pahang.
                      For commercial or building projects, our coverage extends
                      to Maran and Raub as required.
                    </>
                  ),
              },
              {
                q: lang === "MS" ? "Harga Servis?" : "Service Pricing?",
                a:
                  lang === "MS" ? (
                    <>
                      Harga bagi setiap pemeriksaan (troubleshoot) atau
                      pemasangan sangat kompetitif dan telus tanpa cas
                      tersembunyi. Kami akan memberikan{" "}
                      <strong className="text-slate-800">
                        sebut harga jelas
                      </strong>{" "}
                      sebelum memulakan sebarang kerja.
                    </>
                  ) : (
                    <>
                      Prices for each inspection (troubleshooting) or
                      installation are highly competitive and transparent with
                      no hidden charges. We provide a{" "}
                      <strong className="text-slate-800">
                        clear written quote
                      </strong>{" "}
                      before starting any works.
                    </>
                  ),
              },
              {
                q: lang === "MS" ? "Lesen & Sijil?" : "Licenses & Certs?",
                a:
                  lang === "MS" ? (
                    <>
                      Ya, Bena Flash Global PLT memegang perakuan lesen{" "}
                      <strong className="text-slate-800">CIDB Gred G2</strong>{" "}
                      (No: 0120230308-PH115139) dan berdaftar rasmi dengan{" "}
                      <strong className="text-slate-800">
                        Suruhanjaya Tenaga (ST)
                      </strong>{" "}
                      untuk pematuhan keselamatan penuh.
                    </>
                  ) : (
                    <>
                      Yes, Bena Flash Global PLT holds the license certification
                      for{" "}
                      <strong className="text-slate-800">CIDB Grade G2</strong>{" "}
                      (No: 0120230308-PH115139) and is officially registered
                      with the{" "}
                      <strong className="text-slate-800">
                        Energy Commission (ST)
                      </strong>{" "}
                      for full safety compliance.
                    </>
                  ),
              },
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="bg-slate-50 p-6 flex flex-col md:flex-row gap-6 rounded-2xl border border-slate-100"
              >
                <div className="md:w-1/4">
                  <span className="font-bold text-lg text-slate-900">
                    {faq.q}
                  </span>
                </div>
                <div className="md:w-3/4">
                  <div className="text-slate-600 leading-relaxed text-justify">
                    {faq.a}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Map / Contact Visual Split */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionVariants}
        className="bg-slate-900 text-white border-t-4 border-[#D4AF37]"
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row">
          <div className="p-12 md:p-24 md:w-1/2 flex flex-col justify-center">
            <h2 className="text-3xl font-bold mb-6">
              {lang === "MS" ? "Hubungi Kami" : "Contact Us"}
            </h2>
            <p className="text-slate-300 mb-8 leading-relaxed">
              {lang === "MS"
                ? "Sama ada rumah idaman, kedai pejabat, atau kilang. Serahkan tugas elektrik dan aircond kepada pakar."
                : "Whether for a dream home, retail office, or factory, leave your electrical and aircond tasks to the experts."}
            </p>

            <div className="space-y-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mr-4 shrink-0">
                  <Phone className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div>
                  <div className="text-sm text-slate-400">
                    {lang === "MS" ? "Telefon / WhatsApp" : "Phone / WhatsApp"}
                  </div>
                  <div className="font-bold text-lg">+60 11-6299 5904</div>
                  <div className="font-bold text-lg">+60 10-804 5904</div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mr-4 shrink-0">
                  <MapPin className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div>
                  <div className="text-sm text-slate-400">
                    {lang === "MS" ? "Ibu Pejabat" : "Headquarters"}
                  </div>
                  <div className="font-bold text-xs max-w-xs leading-snug">
                    A-15A, LORONG SUNGAI SOI, JAYA 10, JALAN KEMPADANG, 26060
                    KUANTAN PAHANG
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="md:w-1/2 bg-slate-800 min-h-[400px] flex items-center justify-center text-slate-500 p-8 text-center relative overflow-hidden">
            {/* Abstract Map visual or brand image replacement */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "radial-gradient(#D4AF37 1px, transparent 1px)",
                backgroundSize: "30px 30px",
              }}
            ></div>
            <div className="relative z-10 max-w-sm">
              <ShieldCheck className="w-24 h-24 text-slate-600 mx-auto mb-4 animate-pulse" />
              <h3 className="text-2xl font-bold text-white mb-2">
                {lang === "MS"
                  ? "Jaminan Keselamatan 100%"
                  : "100% Safety Guarantee"}
              </h3>
              <p className="text-sm">
                {lang === "MS"
                  ? "Kerja M&E kami mematuhi perundangan akta Bekalan Elektrik 1990 kerajaan Malaysia."
                  : "Our M&E works fully comply with the Electricity Supply Act 1990 of the Malaysian government."}
              </p>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
};
