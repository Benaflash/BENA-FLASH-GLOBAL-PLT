import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";

interface StaffMember {
  id: string;
  name: string;
  role: string;
  qualification: string;
  experience: string;
  avatarText: string;
  avatarUrl?: string;
  reportsTo: string | null;
}

interface Node {
  id: string;
  role: string;
  name: string;
  qualification: string;
  experience: string;
  avatarText: string;
  avatarUrl?: string;
  reportsTo: string | null;
  children?: Node[];
}

interface OrganizationChartProps {
  staff?: StaffMember[];
}

export default function OrganizationChart({
  staff = [],
}: OrganizationChartProps) {
  // Fallback static tree if staff is empty
  const defaultTree: Node = {
    id: "l1",
    role: "PENGARAH SYARIKAT",
    name: "Muhammad Yusri Bin Dzulkefli",
    qualification:
      "Pengasas Utama & Pengarah Urusan Strategi Korporat, Kelayakan Pengurusan Teknikal Kelas G2",
    experience:
      "Pengurusan litar utama & pimpinan projek M&E di seluruh Malaysia.",
    avatarText: "MY",
    avatarUrl: "https://picsum.photos/800/600",
    reportsTo: null,
    children: [
      {
        id: "l2-1",
        role: "PENGARAH OPERASI",
        name: "Mohd Nur Al Hadi Bin Norazmi",
        qualification:
          "Pengurusan Operasi Harian & Penyelaras Utama Projek Bekalan Elektrik Komersial",
        experience:
          "Latihan kemahiran, kawalan adab kakitangan & kualiti pendawaian Suruhanjaya Tenaga.",
        avatarText: "NH",
        avatarUrl: "https://picsum.photos/800/600",
        reportsTo: "l1",
        children: [
          {
            id: "l3-1",
            role: "EKSEKUTIF OPERASI",
            name: "Muhammad Alfadly Bin Rosli",
            qualification:
              "Penyelia Logistik, Perlaksanaan Tender Awam & Pematuhan CIDB",
            experience:
              "Menguruskan operasi harian di tapak, keselamatan kualiti pendawaian fasa tunggal & tiga fasa.",
            avatarText: "MA",
            avatarUrl: "https://picsum.photos/800/600",
            reportsTo: "l2-1",
            children: [
              {
                id: "l4-1",
                role: "SITE SUPERVISOR",
                name: "Mohd Safuan Bin Khalid",
                qualification:
                  "Diploma Kejuruteraan Elektrikal, Penyeliaan Tapak & Keselamatan",
                experience:
                  "Mengawal selia standard pemasangan, tapak kerja & keselamatan pekerja di lokasi.",
                avatarText: "MS",
                avatarUrl: "https://picsum.photos/800/600",
                reportsTo: "l3-1",
                children: [
                  {
                    id: "l5-1",
                    role: "PENJAGA JENTERA (CHARGEMAN)",
                    name: "Mohd Al Hafiz (Muhammad Iqbal)",
                    qualification:
                      "Kekompentenan Penjaga Jentera Berdaftar Suruhanjaya Tenaga",
                    experience:
                      "Pengawasan penyisihan litar papan agihan (DB) dan litar voltan rendah.",
                    avatarText: "AH",
                    avatarUrl: "https://picsum.photos/800/600",
                    reportsTo: "l4-1",
                    children: [
                      {
                        id: "l6-1",
                        role: "TEAM LEADER : AIRCOND",
                        name: "Aliff Izuan / Aliff Izzuan",
                        qualification:
                          "Pegang Sijil Penyejukbekuan & Penyaman Udara",
                        experience:
                          "Ketua kerja bagi pemasangan baru dan penyelenggaraan berkala aircond siling & dinding.",
                        avatarText: "AI",
                        reportsTo: "l5-1",
                      },
                      {
                        id: "l6-2",
                        role: "TEAM LEADER : ELEKTRIKAL",
                        name: "Ahmad Muzani Bin Rosni",
                        qualification:
                          "Sijil Keadilan Pendawaian Elektrikal Domestik & Industri",
                        experience:
                          "Pakar pendawaian dalaman, luar dan talian atas voltan rendah.",
                        avatarText: "AM",
                        reportsTo: "l5-1",
                      },
                      {
                        id: "l6-3",
                        role: "PEKERJA MAHIR",
                        name: "Dzulkefli Hasan / Firdaus",
                        qualification: "Pekerja Bertauliah Am Pemasangan",
                        experience:
                          "Melaksanakan tugasan sokongan sivil, pendawaian fizikal, & gantungan siling.",
                        avatarText: "PE",
                        reportsTo: "l5-1",
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: "l3-2",
            role: "COMPLIANCE / INTERNAL AUDITOR",
            name: "Noridayu Binti Abu Bakar",
            qualification:
              "Auditor Akaun Luar & Pegawai Pematuhan Berdaftar (Compliance Officer)",
            experience:
              "Kawal selia tadbir urus dan audit akaun syarikat PLT secara sah.",
            avatarText: "NA",
            reportsTo: "l2-1",
          },
          {
            id: "l3-3",
            role: "KERANI ADMIN",
            name: "Nur Qistina Batrisyia",
            qualification: "Diploma Pentadbiran Korporat & Pengurusan Dokumen",
            experience:
              "Logistik sebut harga, pengurusan kontrak, urusan petender & peti surat masuk.",
            avatarText: "NQ",
            reportsTo: "l2-1",
          },
        ],
      },
    ],
  };

  // Convert flat staff list (with reportsTo) into tree
  const buildTree = (list: StaffMember[]): Node | null => {
    if (!list || list.length === 0) return null;

    // Find root nodes (reportsTo is null, empty string, or not found in list)
    const rootNodes = list.filter(
      (m) => !m.reportsTo || !list.some((p) => p.id === m.reportsTo),
    );
    if (rootNodes.length === 0) return null;

    // Pick first root
    const root = rootNodes[0];

    const constructNode = (member: StaffMember): Node => {
      const children = list
        .filter((m) => m.reportsTo === member.id)
        .map(constructNode);
      return {
        ...member,
        children: children.length > 0 ? children : undefined,
      };
    };

    return constructNode(root);
  };

  const activeTree = buildTree(staff) || defaultTree;
  const [selectedNode, setSelectedNode] = useState<Node>(activeTree);

  // Initialize selectedNode with root of activeTree
  useEffect(() => {
    if (activeTree) {
      setSelectedNode(activeTree);
    }
  }, [staff]);

  const [assignedLeads, setAssignedLeads] = useState<any[]>([]);

  useEffect(() => {
    if (!selectedNode || !db) {
      setAssignedLeads([]);
      return;
    }
    const q = query(
      collection(db, "leads"),
      where("assignedStaffId", "==", selectedNode.id)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setAssignedLeads(list);
    }, (error) => {
      console.error("Error fetching staff leads:", error);
    });
    return () => unsubscribe();
  }, [selectedNode]);

  // Render nodes recursively in a tree diagram or simple elegant cards
  const renderCard = (node: Node, level = 0) => {
    const isSelected = selectedNode?.id === node.id;
    return (
      <div key={node.id} className="flex flex-col items-center">
        {/* Card Body */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => setSelectedNode(node)}
          className={`cursor-pointer max-w-xs w-64 p-4 rounded-xl border transition-all shadow-sm flex flex-col ${
            isSelected
              ? "bg-[#0F172A] border-[#D4AF37] text-white"
              : "bg-white border-slate-200 text-slate-800 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center gap-4">
            {node.avatarUrl ? (
              <img
                src={node.avatarUrl}
                alt={node.name}
                referrerPolicy="no-referrer"
                loading="lazy"
                width="64"
                height="64"
                className="w-16 h-16 rounded-full object-cover border-2 border-[#D4AF37] shadow-sm shrink-0"
              />
            ) : (
              <div
                className={`w-16 h-16 shrink-0 rounded-full font-bold flex items-center justify-center text-lg ${
                  isSelected
                    ? "bg-[#D4AF37] text-slate-900"
                    : "bg-slate-100 text-[#0F172A]"
                }`}
              >
                {node.avatarText}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <span
                className={`text-[9px] uppercase tracking-wider font-extrabold block ${
                  isSelected ? "text-[#D4AF37]" : "text-slate-500"
                }`}
              >
                {node.role}
              </span>
              <h4 className="text-xs font-bold truncate">{node.name}</h4>
            </div>
          </div>
        </motion.div>

        {node.children && node.children.length > 0 && (
          <div className="flex flex-col items-center mt-6 w-full">
            {/* Draw connect vertical lines */}
            <div className="w-0.5 h-6 bg-[#D4AF37]/40 mb-2"></div>

            <div className="flex flex-wrap justify-center gap-6 relative px-4">
              {node.children.map((child) => renderCard(child, level + 1))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <p className="text-xs uppercase tracking-[0.2em] font-bold text-[#D4AF37] mb-2">
          Kakitangan G2
        </p>
        <h3 className="text-2xl font-bold text-[#0F172A] mb-4">
          Carta Organisasi Berwibawa
        </h3>
        <p className="text-sm text-slate-500">
          Struktur organisasi berdisiplin yang bersedia memikul tanggungjawab
          bagi projek bernilai tinggi, disokong oleh pakar kompeten berkelulusan
          rasmi. Klik mana-mana kad untuk perincian kualifikasi teknikal.
        </p>
      </div>

      {/* Main Tree interactive Canvas */}
      <div className="w-full bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col lg:flex-row gap-8 items-start justify-center">
        {/* Interactive Viewer Section */}
        <div className="flex-1 overflow-x-auto w-full flex justify-center py-6">
          <div className="flex flex-col items-center">
            {activeTree ? (
              renderCard(activeTree)
            ) : (
              <div className="text-center py-12 text-slate-400 italic">
                Tiada data kakitangan.
              </div>
            )}
          </div>
        </div>

        {/* Selected Staff Qualification Card */}
        {selectedNode && (
          <div className="w-full lg:w-80 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm static lg:sticky lg:top-24">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 border-b pb-2">
              Kualifikasi Kakitangan
            </h4>
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedNode.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-widest">
                    {selectedNode.role}
                  </span>
                  <h5 className="text-lg font-bold text-[#0F172A]">
                    {selectedNode.name}
                  </h5>
                </div>
                <div className="space-y-3 pt-2 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="block font-bold text-slate-500 mb-1">
                      Latar Belakang & Kelulusan
                    </span>
                    <p className="text-slate-700 leading-relaxed">
                      {selectedNode.qualification}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="block font-bold text-slate-500 mb-1">
                      Pengalaman Teknikal
                    </span>
                    <p className="text-slate-700 leading-relaxed">
                      {selectedNode.experience}
                    </p>
                  </div>

                  {/* Active Assignments */}
                  <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-2">
                    <span className="block font-bold text-indigo-950 flex items-center gap-1 uppercase text-[9px] tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></span>
                      Projek Ditugaskan ({assignedLeads.length})
                    </span>
                    {assignedLeads.length === 0 ? (
                      <p className="text-slate-400 italic text-[11px]">
                        Tiada sebarang kerja teknikal ditugaskan pada masa ini.
                      </p>
                    ) : (
                      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                        {assignedLeads.map((L) => (
                          <div key={L.id} className="p-2 bg-white rounded-lg border border-slate-200 space-y-1">
                            <div className="flex items-center justify-between text-[9.5px]">
                              <span className="font-extrabold text-slate-800 uppercase">{L.serviceType}</span>
                              <span className="font-mono text-slate-400 text-[8px]">ID: {L.id.slice(0, 6)}...</span>
                            </div>
                            <p className="text-slate-600 text-[9.5px] leading-tight font-semibold">{L.location}</p>
                            <span className="inline-block text-[8px] bg-indigo-100 text-indigo-700 font-extrabold px-1.5 py-0.5 rounded-full uppercase">
                              {L.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
