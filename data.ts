import {
  CompanyInfo,
  Project,
  Career,
  Blog,
  LeadQuote,
  Application,
  Certification,
  ClientLogo,
  StaffMember,
  CorporateDocument,
  ServiceInfo,
  AircondRate,
  Testimonial,
  FAQItem,
} from "./types";

export const initialCompanyInfo: CompanyInfo = {
  name: "BENA FLASH GLOBAL PLT",
  tagline: "Kontraktor Elektrik & Pemasangan Pendingin Hawa Berdaftar G2",
  aboutText:
    "BENA FLASH GLOBAL PLT (No. Pendaftaran: LLP0036568-LGN / 202304002617) adalah sebuah syarikat perkongsian liabiliti terhad bumiputera yang komited dalam memberikan perkhidmatan bertaraf tinggi berasaskan keselamatan, kebolehgunaan, dan kualiti optimum bagi litar elektrik serta sistem pendingin hawa (HVAC). Ditubuhkan pada 29 Ogos 2022, syarikat kami disokong kuat oleh rangkaian tenaga mahir M&E yang kompeten dan bertauliah tinggi daripada Suruhanjaya Tenaga (ST Kelas C), Lembaga Pembangunan Industri Pembinaan Malaysia (CIDB Gred G2), serta Kementerian Kewangan Malaysia (MOF taraf Bumiputera).",
  phone: "011-6299 5904 / 010-804 5904",
  email: "admin@bfgplt.com",
  address:
    "A-15A, LORONG SUNGAI SOI, JAYA 10, JALAN KEMPADANG, 26060 KUANTAN PAHANG",
  ecommerceLink: "https://benaflash.bukku.store",
  experienceYears: 4,
  completedProjects: 11,
  customerSatisfaction: 100,
  clientsCorporate: 12,
  operatingStates: 3,
  coreStaff: 10,
  beforeAfterBeforeImg: "https://picsum.photos/800/600",
  beforeAfterAfterImg: "https://picsum.photos/800/600",
  isPromoActive: true,
  promoText:
    "🌟 Tawaran Penyelenggaraan Awal Tahun: Diskaun 15% untuk Servis Aircond Komersial",
  promoLink: "https://wa.me/60108045904",
};

export const initialTestimonials: Testimonial[] = [
  {
    id: "test-1",
    clientName: "Muzamir Bin Mustapa",
    clientCompany: "Pekan, Pahang",
    rating: 5,
    feedback: "Sangat berpuas hati dengan servis pemasangan aircond dan pendawaian dari team Bena Flash Global. Kerja sangat kemas, cepat and profesional. Harga juga sangat berpatutan. Highly recommended!",
    date: "12/05/2026",
    verified: true,
    userId: "admin-seed-1"
  },
  {
    id: "test-2",
    clientName: "Norhaslinda Ahmad",
    clientCompany: "Kuantan, Pahang",
    rating: 5,
    feedback: "Servis terbaik! Team datang buat troubleshooting elektrik rumah yang trip. Masalah selesai cepat dan diterangkan puncanya dengan sangat jelas. Pekerja sangat sopan dan berdisiplin.",
    date: "18/05/2026",
    verified: true,
    userId: "admin-seed-2"
  },
  {
    id: "test-3",
    clientName: "Ahmad Syamil",
    clientCompany: "Pekan, Pahang",
    rating: 5,
    feedback: "Pemasangan aircond kaset di pejabat kami dilakukan dengan sangat kemas. Kemasan luaran dan kemasan dalam siling sangat memuaskan hati. Kontraktor bumiputera yang sangat cemerlang!",
    date: "22/05/2026",
    verified: true,
    userId: "admin-seed-3"
  },
  {
    id: "test-4",
    clientName: "Siti Fatimah",
    clientCompany: "Kuantan, Pahang",
    rating: 5,
    feedback: "Terbaik Bena Flash Global. Respon pantas bila dihubungi, kerja servis aircond kimia bersih gila, sejuk semula macam baru. Sangat disyorkan untuk penduduk Pekan dan Kuantan.",
    date: "04/06/2026",
    verified: true,
    userId: "admin-seed-4"
  },
  {
    id: "test-5",
    clientName: "Khairul Anuar",
    clientCompany: "Kuantan, Pahang",
    rating: 5,
    feedback: "Syarikat kontraktor elektrikal yang dipercayai dan kompeten. Kerja mengikut spesifikasi keselamatan Suruhanjaya Tenaga. Harga telus tiada cas tersembunyi.",
    date: "15/06/2026",
    verified: true,
    userId: "admin-seed-5"
  }
];

export const initialProjects: Project[] = [
  {
    id: "proj-1",
    title: "Kerja-Kerja Pendawaian Dalaman di Padang Polo B, Pekan",
    client: "Kelab Polo Diraja Pahang",
    location: "Kawasan Padang Polo, Pekan, Pahang",
    value: "RM 236,000",
    completionDate: "01/01/2025",
    category: "Electrical Installation",
    status: "Completed",
    img: "https://picsum.photos/800/600",
    description:
      "Pendawaian elektrik dalaman utama bagi fasa perlindungan premium di bangunan sukan polo, kelolaan kualiti tenaga bertingkat.",
  },
  {
    id: "proj-2",
    title: "Kerja Pendawaian Tambahan di Pusat Tenun Pulau Keladi",
    client: "Yayasan Tenun Pahang Diraja",
    location: "Rumah Tun Razak & Balai Permaisuri, Pekan, Pahang",
    value: "RM 189,000",
    completionDate: "30/06/2024",
    category: "MSB & DB Installation",
    status: "Completed",
    img: "https://picsum.photos/800/600",
    description:
      "Pemasangan tambahan pendawaian litar elektrik premium serta pemasangan sistem pendingin hawa bersepadu untuk Rumah Tun Razak.",
  },
  {
    id: "proj-3",
    title: "Menaiktaraf Pencahayaan Jalan Masuk Kuantan By-Pass",
    client: "South Asia Growth Sdn Bhd",
    location: "Kuantan, Pahang",
    value: "RM 104,375",
    completionDate: "15/09/2023",
    category: "MSB & DB Installation",
    status: "Completed",
    img: "https://picsum.photos/800/600",
    description:
      "Sistem pencahayaan premium jalan masuk Kuantan By-Pass serta kerja-kerja elektrik berkaitan bagi tawaran semula sivil.",
  },
  {
    id: "proj-4",
    title: "Pemasangan Lampu Solar LED Jalan Cheroh (Raub)",
    client: "Jabatan Kerja Raya (JKR) Pahang",
    location: "Jalan Cheroh (Seksyen 20.60), C5, Raub, Pahang",
    value: "RM 100,000",
    completionDate: "04/08/2025",
    category: "Solar Installation",
    status: "Completed",
    img: "https://picsum.photos/800/600",
    description:
      "Pembekalan ramah alam dan pemasangan bertingkat tiang berserta lampu solar LED pintar di luar bandar.",
  },
  {
    id: "proj-5",
    title: "Menaiktaraf Muzium Masjid Sultan Abdullah Pekan",
    client: "Jabatan Kerja Raya JKR / Kerajaan Negeri",
    location: "Pekan, Pahang",
    value: "RM 70,000",
    completionDate: "15/07/2023",
    category: "MSB & DB Installation",
    status: "Completed",
    img: "https://picsum.photos/800/600",
    description:
      "Projek menaiktaraf pendawaian elektrik, pemasangan papan suis, serta litar pencahayaan antik bersejarah.",
  },
  {
    id: "proj-6",
    title: "Kerja Pendawaian Permukaan Homestay Pusat Tenun Pulau Keladi",
    client: "Yayasan Tenun Pahang Diraja",
    location: "Pulau Keladi, Pekan, Pahang",
    value: "RM 70,000",
    completionDate: "12/06/2024",
    category: "Electrical Installation",
    status: "Completed",
    img: "https://picsum.photos/800/600",
    description:
      "Pendawaian permukaan kekubah (surface) di tapak homestay warisan budaya kebangsaan.",
  },
];

export const initialCareers: Career[] = [
  {
    id: "job-1",
    title: "Chargeman A4 / B4 (Penyelia Elektrikal)",
    department: "M&E Engineering Division",
    location: "Kuala Lumpur & Selangor",
    jobType: "Full-time",
    salary: "RM 4,500 - RM 7,500",
    status: "Active",
    requirements: [
      "Memiliki perakuan kekompetenan Chargeman A4 atau B4 daripada Suruhanjaya Tenaga (ST).",
      "Sekurang-kurangnya 3 tahun pengalaman dalam mengendalikan Main Switchboard (MSB) voltan rendah (HT adalah kelebihan).",
      "Berkebolehan memimpin juruteknik, mengawal selia aspek keselamatan elektrik berpandukan Akta Bekalan Elektrik.",
      "Kekompetenan dalam ujian suntikan arus dan penyelenggaraan berkala transformer.",
    ],
  },
  {
    id: "job-2",
    title: "Wireman PW4 (Pendawai Elektrik)",
    department: "Project Operations Team",
    location: "Outstation (Seluruh Malaysia)",
    jobType: "Full-time",
    salary: "RM 2,500 - RM 3,800",
    status: "Active",
    requirements: [
      "Memiliki Sijil Kekompetenan Pendawai Tiga Fasa (PW4) dengan pengesahan Endosmen Ujian.",
      "Familiar dengan lukisan litar skematik elektrikal, pemasangan trunking/conduit, penyambungan DB utama.",
      "Sikap kerja yang selamat, sanggup bekerja outstation (elaun khas disediakan).",
      "Boleh bekerja di bawah pemantauan minimum daripada Chargeman/Project Manager.",
    ],
  },
  {
    id: "job-3",
    title: "Aircond / HVAC Technician Senior",
    department: "HVAC Servicing & Contract Maintenance",
    location: "Selangor",
    jobType: "Contract",
    salary: "RM 3,000 - RM 4,500",
    status: "Active",
    requirements: [
      "Sijil Vokasional / Diploma Kejuruteraan Mekanikal (Penyejukan & Penyaman Udara).",
      "Mahir mengendalikan sistem pendingin hawa gred komersial (Chiller, VRF/VRV, Cooling Tower, AHU).",
      "Lancar mendiagnosis kebocoran gas, pertukaran compressor, pembersihan kimia, troubleshoot litar kawalan.",
      "Mempunyai lesen Memandu GDL atau sekurang-kurangnya Kelas D adalah kelebihan utama.",
    ],
  },
  {
    id: "job-4",
    title: "Internship Pelajar Kejuruteraan Elektrik / Mekanikal",
    department: "Corporate Management & Engineering Office",
    location: "Seri Kembangan, Selangor",
    jobType: "Internship",
    salary: "RM 800 - RM 1,200",
    status: "Active",
    requirements: [
      "Sedang mengikuti Diploma atau Ijazah Sarjana Muda Kejuruteraan Elektrikal / Mekanikal / Tenaga Boleh Baharu.",
      "Kekosongan untuk latihan industri minimum 12 minggu hingga 24 minggu.",
      "Diberi pendedahan penuh di tapak projek, lukisan CAD, penyediaan sebut harga tender projek G2, dan pengurusan pentadbiran.",
      "Sikap rajin belajar, celik komputer, dan kemahiran berkomunikasi yang proaktif.",
    ],
  },
];

export const initialBlogs: Blog[] = [
  {
    id: "blog-1",
    title:
      "Panduan Memilih Kontraktor Elektrikal G2 Yang Layak Untuk Projek Industri",
    category: "Projek Korporat",
    snippet:
      "Ketahui kriteria pensijilan penting seperti kelas CIDB, sistem insurans liabiliti, dan keahlian ST yang menentukan kredibiliti kontraktor utama anda.",
    content:
      "Apabila syarikat anda merancang untuk melakukan pemasangan elektrikal berskala besar bagi bangunan industri, pemilihan kontraktor tidak boleh diambil ringan. Kontraktor elektrik berkaliber G2 bermaksud syarikat tersebut mempunyai kapasiti berlesen Gred G2 untuk mengendalikan nilai projek sehingga RM 500,000.\n\nPertama, pastikan mereka berdaftar dengan CIDB (Lembaga Pembangunan Industri Pembinaan). Seterusnya, pastikan syarikat mempunyai sijil pendaftaran sebagai Kontraktor Elektrik Kelas C/B/A di bawah Suruhanjaya Tenaga. Ketiga, periksa rekod keselamatan (safety track record) dan kelengkapan insurans liabiliti awam untuk melindungi harta benda kilang anda semasa pelaksanaan kerja.",
    date: "01/06/2026",
    readTime: "5 minit",
    author: "Zulhelmi Rosli, Pengarah Projek",
    img: "https://picsum.photos/800/600",
    websiteUrl: "https://www.bfgplt.com",
  },
  {
    id: "blog-2",
    title:
      "Kepentingan Suntikan Arus Sekunder & Pengujian Relay Perlindungan MSB",
    category: "Informasi Teknikal",
    snippet:
      "Mengapa bangunan kilang lama wajib melakukan pengujian penentukuran breaker sekali setiap 2 tahun demi mengelakkan letupan papan suis dan 'blackout' kilang.",
    content:
      "Banyak pemilik premis komersial dan kilang mengabaikan peranti perlindungan dalam Main Switch Board (MSB) mereka sehinggalah berlaku kerosakan letupan atau blackout tidak dijangka yang merugikan ratusan ribu ringgit.\n\nRelay perlindungan (protection relays) adalah 'otak' yang mengesan kerosakan arus lebih (overcurrent) atau kebocoran bumi (earth fault) dan memberi arahan kepada Air Circuit Breaker (ACB) untuk trip. Pengujian suntikan arus sekunder (secondary injection testing) mensimulasikan keadaan kerosakan ini untuk menentu ukur kepekaan relay. Di bawah garis panduan Suruhanjaya Tenaga, bangunan komersial sangat digalakkan menjalankan audit kesihatan MSB secara berjadual.",
    date: "18/05/2026",
    readTime: "8 minit",
    author: "Ir. Ahmad Shahrir, Jurutera Elektrik Kompeten",
    img: "https://picsum.photos/800/600",
    websiteUrl: "https://www.bfgplt.com",
  },
  {
    id: "blog-3",
    title:
      "Kelebihan Pemasangan Sistem Penyejukan Aliran Bahan Sejuk VRV / VRF",
    category: "HVAC & Pendingin Hawa",
    snippet:
      "Perbandingan jimat tenaga, kemudahan kawalan, dan jangka hayat sistem ducting VRV berbanding sistem penyaman udara konvensional komersial.",
    content:
      "Sistem Variable Refrigerant Volume (VRV) atau Variable Refrigerant Flow (VRF) merupakan teknologi penyaman udara tercanggih untuk bangunan moden yang mengutamakan kelestarian tenaga.\n\nSistem ini membolehkan satu unit pemeluwap luar (outdoor condenser unit) disambungkan kepada banyak unit penyebar dalaman (indoor units). Pemampat penyongsang (inverter compressor) akan melaraskan kadar aliran bahan pendingin secara dinamik mengikut beban terma sebenar di setiap zon bilik. Ini memberikan penjimatan tenaga bil elektrik sehingga 30-40% berbanding sistem aircond Split atau Chiller berskala rendah lama.",
    date: "10/05/2026",
    readTime: "6 minit",
    author: "Nor Azman, Pakar Sistem HVAC",
    img: "https://picsum.photos/800/600",
    websiteUrl: "https://www.bfgplt.com",
  },
];

export const initialLeads: LeadQuote[] = [
  {
    id: "lead-1",
    date: "04/06/2026",
    name: "Mohamad Hanafi bin Kassim",
    companyName: "Rakyat Properties Sdn Bhd",
    phone: "013-9087654",
    email: "hanafi@rakyatproperties.com.my",
    serviceType: "Electrical Service",
    location: "Kajang, Selangor",
    budget: "RM 100,000 - RM 250,000",
    message:
      "Kami memerlukan kerja-kerja pendawaian semula elektrik, pembinaan DB baharu, dan pemasangan lampu limpah LED pintar untuk fasiliti warehouse kami yang baru diambil alih. Mohon sebut harga penuh dan pelan litar CAD.",
    status: "New",
  },
  {
    id: "lead-2",
    date: "02/06/2026",
    name: "Dr. Liyana Aris",
    companyName: "Klinik Kesihatan Prime Care",
    phone: "019-3344556",
    email: "dr.liyana@primecare.com",
    serviceType: "Aircond / HVAC",
    location: "Putrajaya",
    budget: "di bawah RM 50,500",
    message:
      "Sistem aircond kaset (cassette) sedia ada sering bocor air dan tidak sejuk. Kami memerlukan khidmat servis kimia komprehensif untuk 12 unit kaset dan 2 unit komersial ducting berkapasiti tinggi.",
    status: "Reviewed",
  },
];

export const initialApplications: Application[] = [
  {
    id: "app-1",
    date: "03/06/2026",
    careerId: "job-1",
    careerTitle: "Chargeman A4 / B4 (Penyelia Elektrikal)",
    name: "Khairul Amin bin Mustafa",
    email: "khairul.competent@gmail.com",
    phone: "012-7654321",
    experienceSummary:
      "Mempunyai kekompetenan Chargeman A4 daripada ST sejak tahun 2021. Pengalaman kerja 5 tahun menyelenggara MSB 11kV di sebuah kilang semikonduktor di Pulau Pinang. Mahir membuat laporan audit ST bertulis dan melatih pasukan teknikal.",
  },
];

export const initialCertifications: Certification[] = [
  {
    id: "cert-1",
    name: "Perakuan Pendaftaran Kontraktor (PPK) G2",
    issuingBody: "Lembaga Pembangunan Industri Pembinaan Malaysia (CIDB)",
    logoText: "CIDB G2",
    description:
      "Lembaga Pembangunan Industri Pembinaan Malaysia meluluskan kapasiti Gred G2 bagi kerja bangunan sivil, mekanikal, dan elektrikal.",
    registrationNo: "0120230308-PH115139",
    validity: "20/01/2025 - 06/03/2028",
    specialties: [
      "B04: Kerja Am Bangunan",
      "CE21: Pembinaan Kejuruteraan Awam",
      "ME01: Sistem Penyaman Udara",
      "ME21: Sistem Pendawaian Elektrikal",
    ],
  },
  {
    id: "cert-2",
    name: "Kontraktor Elektrik Kelas C (Suruhanjaya Tenaga)",
    issuingBody: "Suruhanjaya Tenaga",
    logoText: "ST CLASS C",
    description:
      "Sertifikasi rasmi Borang Q membenarkan kami mengendalikan pemasangan, rekaan, pembaikan, dan pengujian litar elektrik Kelas C.",
    registrationNo: "ST(PKN)PHG/C/KE/00864/2024",
    validity: "15/10/2024 - 14/10/2029",
    specialties: [
      "Jenis Kontraktor: Kelas C Berlesen",
      "Ujian Rintangan & Penebatan Voltan Rendah",
      "Kerja-kerja pendawaian fasa tunggal dan tiga fasa",
      "Penyeliaan berdaftar di bawah Suruhanjaya Tenaga",
    ],
  },
  {
    id: "cert-3",
    name: "Sijil Taraf Bumiputera (STB) G2",
    issuingBody: "Kementerian Pembangunan Usahawan dan Koperasi (PKK)",
    logoText: "STB BUMI",
    description:
      "Pengiktirafan Taraf Bumiputera G2 melayakkan syarikat menyertai sebut harga pembinaan dan perolehan kerja kerajaan khas.",
    registrationNo: "0120230308-PH115139",
    validity: "05/03/2025 - 06/03/2028",
    specialties: [
      "Gred Kontraktor: G2 Bumiputera Sah",
      "Kelayakan tender terhad bumiputera",
      "Disahkan oleh Bahagian Pembangunan Kontraktor & Usahawan",
    ],
  },
  {
    id: "cert-4",
    name: "Sijil Pendaftaran Kementerian Kewangan (MOF)",
    issuingBody: "Kementerian Kewangan Malaysia (MOF)",
    logoText: "MOF BUMI",
    description:
      "Akreditasi daripada Perbendaharaan Malaysia membenarkan urusan pembekalan am dan rundingan perkhidmatan sebut harga agensi kerajaan.",
    registrationNo: "357-000237078",
    validity: "20/01/2023 - 06/12/2026",
    specialties: [
      "020301: Perabot & Perkakas Elektrik Pejabat",
      "140301/2: Kabel, Wayar Elektrik & Aksesori",
      "220301: Penyelenggaraan Alat Hawa Dingin",
    ],
  },
  {
    id: "cert-5",
    name: "Perakuan Pendaftaran Pertukaran (SSM) PLT",
    issuingBody: "Suruhanjaya Syarikat Malaysia",
    logoText: "SSM PLT",
    description:
      "Syarikat PLT berdaftar sah di bawah Seksyen 32(1) Akta Perkongsian Liabiliti Terhad 2012.",
    registrationNo: "202304002617 (LLP0036568-LGN)",
    validity: "Mula 25/09/2023",
    specialties: [
      "Kod 27900u: Import/Eksport Alatan Elektrik",
      "Kod 43225: Pemasangan Pengudaraan & Pendingin Hawa",
      "Kod 43211: Pendawaian & Kelengkapan Elektrik",
    ],
  },
  {
    id: "cert-6",
    name: "Sijil Akuan Status PMKS (Mikro)",
    issuingBody: "SME Corporation Malaysia",
    logoText: "SME CORP",
    description:
      "Pengiktirafan rasmi berstatus PMKS Mikro bagi menyokong ekosistem usahawan bertaraf kemahiran tinggi.",
    registrationNo: "SME240109103",
    validity: "09/01/2024 - 08/01/2026",
    specialties: [
      "Perniagaan Mikro Bumiputera",
      "Disahkan status PMKS oleh CEO SME Corp Malaysia",
    ],
  },
  
, { id: "cert-7",
    name: "Sijil Kekompetenan NIOSH",
    issuingBody: "National Institute of Occupational Safety and Health (NIOSH)",
    logoText: "NIOSH",
    description: "Sijil keselamatan dan kesihatan pekerjaan mematuhi piawaian industri keselamatan nasional.",
    registrationNo: "NSH-2023-9021",
    validity: "Aktif",
    specialties: [
      "Passport Keselamatan (OGSP / AESP)",
      "Pengurusan Kesihatan & Keselamatan Pekerjaan",
    ],
  },
  {
    id: "cert-8",
    name: "Sijil Vendor TNB",
    issuingBody: "Tenaga Nasional Berhad (TNB)",
    logoText: "TNB VENDOR",
    description: "Berdaftar sebagai vendor rasmi untuk menjalankan kerja-kerja pembekalan dan perkhidmatan untuk Tenaga Nasional Berhad.",
    registrationNo: "TNB-V-12903",
    validity: "Aktif",
    specialties: [
      "Kerja-kerja Elektrikal & Pembekalan",
      "Penyelenggaraan Infrastruktur Elektrik",
    ],
  }
];

export const initialClientLogos: ClientLogo[] = [
  { id: "partner-1", name: "JABATAN KERJA RAYA" },
  { id: "partner-2", name: "PRASARANA MY" },
  { id: "partner-3", name: "LUAS SELANGOR" },
  { id: "partner-4", name: "TNB VENDOR" },
  { id: "partner-5", name: "BOUSTEAD PLC" },
  { id: "partner-6", name: "ABC MANUF." },
];

export const initialStaff: StaffMember[] = [
  {
    id: "l1",
    name: "Muhammad Yusri Bin Dzulkefli",
    role: "PENGARAH SYARIKAT",
    qualification:
      "Pengasas Utama & Pengarah Urusan Strategi Korporat, Kelayakan Pengurusan Teknikal Kelas G2",
    experience:
      "Pengurusan litar utama & pimpinan projek M&E di seluruh Malaysia.",
    avatarText: "MY",
    avatarUrl: "https://picsum.photos/800/600",
    reportsTo: null,
  },
  {
    id: "l2-1",
    name: "Mohd Nur Al Hadi Bin Norazmi",
    role: "PENGARAH OPERASI",
    qualification:
      "Pengurusan Operasi Harian & Penyelaras Utama Projek Bekalan Elektrik Komersial",
    experience:
      "Latihan kemahiran, kawalan adab kakitangan & kualiti pendawaian Suruhanjaya Tenaga.",
    avatarText: "NH",
    avatarUrl: "https://picsum.photos/800/600",
    reportsTo: "l1",
  },
  {
    id: "l3-1",
    name: "Muhammad Alfadly Bin Rosli",
    role: "EKSEKUTIF OPERASI",
    qualification:
      "Penyelia Logistik, Perlaksanaan Tender Awam & Pematuhan CIDB",
    experience:
      "Menguruskan operasi harian di tapak, keselamatan kualiti pendawaian fasa tunggal & tiga fasa.",
    avatarText: "MA",
    avatarUrl: "https://picsum.photos/800/600",
    reportsTo: "l2-1",
  },
  {
    id: "l4-1",
    name: "Mohd Safuan Bin Khalid",
    role: "SITE SUPERVISOR",
    qualification:
      "Diploma Kejuruteraan Elektrikal, Penyeliaan Tapak & Keselamatan",
    experience:
      "Mengawal selia standard pemasangan, tapak kerja & keselamatan pekerja di lokasi.",
    avatarText: "MS",
    avatarUrl: "https://picsum.photos/800/600",
    reportsTo: "l3-1",
  },
  {
    id: "l5-1",
    name: "Mohd Al Hafiz (Muhammad Iqbal)",
    role: "PENJAGA JENTERA (CHARGEMAN)",
    qualification: "Kekompentenan Penjaga Jentera Berdaftar Suruhanjaya Tenaga",
    experience:
      "Pengawasan penyisihan litar papan agihan (DB) dan litar voltan rendah.",
    avatarText: "AH",
    avatarUrl: "https://picsum.photos/800/600",
    reportsTo: "l4-1",
  },
  {
    id: "l6-1",
    name: "Aliff Izuan",
    role: "TEAM LEADER : AIRCOND",
    qualification: "Pegang Sijil Penyejukbekuan & Penyaman Udara",
    experience:
      "Ketua kerja bagi pemasangan baru dan penyelenggaraan berkala aircond siling & dinding.",
    avatarText: "AI",
    avatarUrl: "https://picsum.photos/800/600",
    reportsTo: "l5-1",
  },
  {
    id: "l6-2",
    name: "Ahmad Muzani Bin Rosni",
    role: "TEAM LEADER : ELEKTRIKAL",
    qualification: "Sijil Keadilan Pendawaian Elektrikal Domestik & Industri",
    experience: "Pakar pendawaian dalaman, luar dan talian atas voltan rendah.",
    avatarText: "AM",
    avatarUrl: "https://picsum.photos/800/600",
    reportsTo: "l5-1",
  },
  {
    id: "l6-3",
    name: "Dzulkefli Hasan",
    role: "PEKERJA MAHIR",
    qualification: "Pekerja Bertauliah Am Pemasangan",
    experience:
      "Melaksanakan tugasan sokongan sivil, pendawaian fizikal, & gantungan siling.",
    avatarText: "DH",
    avatarUrl: "https://picsum.photos/800/600",
    reportsTo: "l5-1",
  },
  {
    id: "l3-2",
    name: "Noridayu Binti Abu Bakar",
    role: "COMPLIANCE / INTERNAL AUDITOR",
    qualification:
      "Auditor Akaun Luar & Pegawai Pematuhan Berdaftar (Compliance Officer)",
    experience:
      "Kawal selia tadbir urus dan audit akaun syarikat PLT secara sah.",
    avatarText: "NA",
    avatarUrl: "https://picsum.photos/800/600",
    reportsTo: "l2-1",
  },
  {
    id: "l3-3",
    name: "Nur Qistina Batrisyia",
    role: "KERANI ADMIN",
    qualification: "Diploma Pentadbiran Korporat & Pengurusan Dokumen",
    experience:
      "Logistik sebut harga, pengurusan kontrak, urusan petender & peti surat masuk.",
    avatarText: "NQ",
    avatarUrl: "https://picsum.photos/800/600",
    reportsTo: "l2-1",
  },
];

export const initialDocuments: CorporateDocument[] = [
  {
    id: "profile",
    title: "Company Profile BENA FLASH GLOBAL PLT (v3.2)",
    cat: "Peta Kemahiran & Portfolio",
    desc: "Mengandungi skop profil, senarai projek G2 siap, jaminan liabiliti kerja insurans, kraf carta organisasi, dan butiran vendor pimpinan.",
    imgUrl: "https://picsum.photos/800/600",
    isDownload: true,
  },
  {
    id: "cidb",
    title: "Sijil Perakuan Pembinaan CIDB (G2)",
    cat: "Pelesenan Rasmi",
    desc: "Saringan sah perakuan pendaftaran syarikat gred tender industri sehingga RM 500k daripada Lembaga Pembangunan Industri Pembinaan Malaysia (CIDB).",
    imgUrl: "https://picsum.photos/800/600",
    isDownload: true,
  },
  {
    id: "st",
    title: "Lesen Kontraktor Suruhanjaya Tenaga",
    cat: "Akreiditasi Keselamatan",
    desc: "Salinan perakuan kelayakan Kontraktor Elektrik Kelas A untuk memulakan reka letak perkhidmatan pengagihan, suntikan breaker, dan reka pelan litar kuasa.",
    imgUrl: "https://picsum.photos/800/600",
    isDownload: true,
  },
  {
    id: "store",
    title: "Portal Belanja Bekalan E-Store BFG",
    cat: "Transaksi Secara Langsung",
    desc: "Lengkap dengan sistem invois berpusat. Untuk pemaju yang ingin memborong pendingin hawa atau menempah alat-alat penyelenggaraan mekanikal pintar.",
    imgUrl: "https://picsum.photos/800/600",
    isDownload: false,
    link: "https://benaflash.bukku.store",
  },
];

export const initialServices: ServiceInfo[] = [
  {
    id: "svc-1",
    iconName: "Zap",
    imageUrl: "https://picsum.photos/800/600",
    title: "Pendawaian Elektrik",
    description:
      "Pakar pendawaian baru, membaiki litar pintas, pemasangan lampu, kipas, water heater dan tambah point plug soket (domestik & komersial).",
    bullets: ["Upgrade DB Box (Fasa Tunggal/Tiga)", "Troubleshooting Blackout"],
  },
  {
    id: "svc-2",
    iconName: "Wind",
    imageUrl: "https://picsum.photos/800/600",
    title: "Servis & Pasang Aircond",
    description:
      "Menawarkan khidmat pemasangan baru, buka dan alih (relocate), servis normal & chemical cuci aircond supaya sentiasa sejuk dan jimat elektrik.",
    bullets: ["Chemical Overhaul", "Tambah Gas (R32 / R410A)"],
  },
  {
    id: "svc-3",
    iconName: "Wrench",
    imageUrl: "https://picsum.photos/800/600",
    title: "Infrastruktur & JKR",
    description:
      "Kontraktor berdaftar untuk projek penyelenggaraan lampu jalan kerajaan, sistem solar, permohonan meter TNB dan kerja-kerja industri berat.",
    bullets: ["Permohonan Meter TNB", "Lampu Jalan Solar JKR"],
  },
];

export const initialAircondRates: AircondRate[] = [
  {
    id: "split",
    labelMs: "Servis Pendingin Hawa Lekat Dinding (Aircond Wall Mounted)",
    labelEn: "Wall Mounted Aircond Servicing",
    minPrice: 150,
    maxPrice: 250,
    order: 1,
  },
  {
    id: "cassette",
    labelMs: "Servis Pendingin Hawa Siling Kaset (Ceiling Cassette)",
    labelEn: "Ceiling Cassette Aircond Servicing",
    minPrice: 350,
    maxPrice: 600,
    order: 2,
  },
  {
    id: "wiring_point",
    labelMs: "Pendawaian Litar Baru / Point Elektrikal",
    labelEn: "New Electrical Point Wiring",
    minPrice: 120,
    maxPrice: 180,
    order: 3,
  },
  {
    id: "db_box_single",
    labelMs: "Pemasangan / Peningkatan DB Box (Single Phase)",
    labelEn: "Single Phase DB Box Setup / Upgrade",
    minPrice: 450,
    maxPrice: 850,
    order: 4,
  },
  {
    id: "db_box_three",
    labelMs: "Pemasangan / Peningkatan DB Box (Three Phase)",
    labelEn: "Three Phase DB Box Setup / Upgrade",
    minPrice: 1200,
    maxPrice: 2200,
    order: 5,
  },
  {
    id: "troubleshoot_blackout",
    labelMs: "Pemeriksaan Litar Pintas / Blackout Troubleshooting",
    labelEn: "Short Circuit & Blackout Troubleshooting",
    minPrice: 90,
    maxPrice: 180,
    order: 6,
  },
  {
    id: "tnb_meter_apply",
    labelMs: "Permohonan Baru & Pemasangan Meter TNB",
    labelEn: "TNB Meter Application & Installation",
    minPrice: 350,
    maxPrice: 650,
    order: 7,
  },
  {
    id: "smart_switch_setup",
    labelMs: "Sistem Smart Switch / Rumah Pintar (Smart Home Integration)",
    labelEn: "Smart Switch & Home Automation Setup",
    minPrice: 250,
    maxPrice: 550,
    order: 8,
  },
];

export const initialFaqs: FAQItem[] = [
  {
    id: "faq-1",
    question: "Adakah harga lawatan tapak dikenakan?",
    answer:
      "Bagi lawatan tapak di dalam radius Selangor & KL, sebut harga awal dan lawatan pertinjauan adalah percuma tanpa sebarang caj.",
  },
  {
    id: "faq-2",
    question: "Adakah syarikat menerima skop tender luar Selangor?",
    answer:
      "Ya, kami aktif menguruskan projek M&E di Pahang, Melaka, Putrajaya, Negeri Sembilan & Johor mengikut kapasiti projek.",
  },
  {
    id: "faq-3",
    question: "Berapa lamakah jaminan / waranti kerja elektrik?",
    answer:
      "Kerja pendawaian mempunyai jaminan hasil kerja selama 3 hingga 6 bulan tertakluk pada jenis pakej yang dipersetujui.",
  },
];

export function optWebp(url: string | undefined | null): string {
  if (!url) return "";
  if (url.includes("unsplash.com")) {
    let opt = url
      .replace(/auto=format/g, "fm=webp")
      .replace(/format=auto/g, "fm=webp");
    if (!opt.includes("fm=webp")) {
      opt += (opt.includes("?") ? "&" : "?") + "fm=webp";
    }
    return opt;
  }
  return url;
}
