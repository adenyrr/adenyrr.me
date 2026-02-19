import { useState, useRef, useCallback, useEffect } from "react";

/* ═══════════════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════════════ */

const SERVERS = [
  {
    id: "amelie", label: "Amélie", color: "#e07b39",
    cpu: "Intel i7-6700K", cores: 8, ram: "16 GB",
    containers: [
      { id: "ceph-a",    label: "CEPH",      type: "Natif", wan: false, services: ["mon","mgr","osd"],                             vlans: ["INFRA","POULE"],  desc: "Nœud CEPH : monitor, manager et OSD pour le stockage distribué." },
      { id: "opensense", label: "Opensense", type: "VM",    wan: true,  services: ["OPNsense Firewall","VPN WireGuard","DHCP/DNS"], vlans: ["INFRA"],          desc: "Pare-feu principal, VPN WireGuard et services réseau DHCP/DNS." },
      { id: "siem",      label: "SIEM",      type: "VM",    wan: false, services: ["Wazuh","Suricata"],                             vlans: ["ADMIN"],          desc: "Surveillance sécurité : Wazuh (SIEM) + Suricata (IDS/IPS)." },
      { id: "dns",       label: "DNS",       type: "LXC",   wan: false, services: ["AdGuard Home"],                                vlans: ["DNSPROXY"],       desc: "Filtrage DNS réseau local via AdGuard Home." },
      { id: "net-tools", label: "Net-tools", type: "LXC",   wan: false, services: ["Speedtest Tracker"],                           vlans: ["ADMIN"],          desc: "Surveillance de la bande passante réseau." },
      { id: "proxy",     label: "Proxy",     type: "LXC",   wan: true,  services: ["Nginx","CrowdSec","Fail2ban"],                 vlans: ["DNSPROXY"],       desc: "Reverse proxy edge : Nginx Proxy Manager + CrowdSec + Fail2ban." },
      { id: "acme",      label: "ACME",      type: "LXC",   wan: false, services: ["step-ca"],                                     vlans: ["INFRA"],          desc: "Autorité de certification interne step-ca (PKI, TLS end-to-end)." },
    ],
  },
  {
    id: "anne", label: "Anne", color: "#a78bfa",
    cpu: "Ryzen 5 3500 GE Pro", cores: 8, ram: "16 GB",
    containers: [
      { id: "ceph-b",     label: "CEPH",       type: "Natif", wan: false, services: ["mon","mgr"],                      vlans: ["INFRA","POULE"], desc: "Nœud CEPH : monitor et manager." },
      { id: "forgejo",    label: "Forgejo",    type: "LXC",   wan: true,  services: ["ForgeJo Git"],                    vlans: ["FORGE"],         desc: "Forge Git self-hosted : dépôts, issues, CI." },
      { id: "deploy",     label: "Deploy",     type: "LXC",   wan: false, services: ["Komodo","Semaphore"],             vlans: ["ADMIN"],          desc: "CI/CD : Komodo (Docker from git) + Semaphore (Infra from git)." },
      { id: "analytics",  label: "Analytics",  type: "LXC",   wan: true,  services: ["Umami"],                          vlans: ["SERVICES"],       desc: "Analytics web RGPD-compliant via Umami." },
      { id: "monitoring", label: "Monitoring", type: "VM",    wan: true,  services: ["Grafana","Prometheus","InfluxDB"], vlans: ["ADMIN"],          desc: "Stack monitoring : Grafana + Prometheus + InfluxDB." },
      { id: "dcmanager",  label: "DCManager",  type: "VM",    wan: false, services: ["Proxmox PDM"],                    vlans: ["ADMIN"],          desc: "Proxmox Datacenter Manager — pilotage cluster PVE." },
      { id: "pve-export", label: "PVE-Export", type: "VM",    wan: false, services: ["PVE exporter"],                   vlans: ["ADMIN"],          desc: "Exporte les métriques Proxmox vers Prometheus." },
    ],
  },
  {
    id: "grace", label: "Grace", color: "#4ecca3",
    cpu: "AMD Ryzen 7 2700X", cores: 16, ram: "48 GB",
    containers: [
      { id: "ceph-c",     label: "CEPH",       type: "Natif", wan: false, services: ["mon","mgr","osd"],                               vlans: ["INFRA","POULE"], desc: "Nœud CEPH principal avec OSD (stockage objet)." },
      { id: "stockage",   label: "Stockage",   type: "VM",    wan: false, services: ["OpenMediaVault","SMB/NFS"],                       vlans: ["POULE"],         desc: "NAS : OpenMediaVault + partages SMB/NFS." },
      { id: "medias",     label: "Médias",     type: "VM",    wan: true,  services: ["Jellyfin","Qbittorrent"],                         vlans: ["SERVICES"],      desc: "Serveur média Jellyfin + client torrent Qbittorrent." },
      { id: "cloud",      label: "Cloud",      type: "VM",    wan: true,  services: ["Immich","OpenCloud","LinkWarden","Vaultwarden"],   vlans: ["SERVICES"],      desc: "Cloud perso : photos, fichiers, bookmarks, mots de passe." },
      { id: "frontend",   label: "Frontend",   type: "VM",    wan: true,  services: ["Homepage"],                                       vlans: ["SERVICES"],      desc: "Dashboard d'accueil Homepage." },
      { id: "llm",        label: "LLM",        type: "VM",    wan: true,  services: ["Ollama","Open WebUI"],                            vlans: ["SERVICES"],      desc: "LLM local : serveur Ollama + interface Open WebUI." },
      { id: "lab",        label: "Lab",        type: "VM",    wan: false, services: ["Windows Server"],                                 vlans: ["SERVICES"],      desc: "VM lab Windows Server pour tests et compatibilité." },
      { id: "kubemaster", label: "KubeMaster", type: "VM",    wan: false, services: ["K8s Control Plane","MetalLB"],                    vlans: ["KUBE"],          desc: "Nœud maître Kubernetes + MetalLB load balancer." },
      { id: "kubeworker", label: "KubeWorker", type: "VM",    wan: false, services: ["K8s Worker Node"],                                vlans: ["KUBE"],          desc: "Nœud worker Kubernetes — charges de travail." },
    ],
  },
];

const NET_DEVICES = [
  { id: "internet", label: "Internet",     icon: "◈", color: "#e07b39", sub: "WAN",           desc: "Point d'entrée WAN. Tout le trafic entrant est filtré avant d'atteindre les VMs." },
  { id: "router",   label: "OPNsense",     icon: "⟳", color: "#e07b39", sub: "4×2.5G · FW",   desc: "Routeur/Firewall OPNsense. NIC Intel 4×2.5G, VPN WireGuard, DHCP/DNS." },
  { id: "ap",       label: "Unifi AP",     icon: "◎", color: "#38bdf8", sub: "WiFi 6 · MESH",  desc: "Point d'accès Ubiquiti Unifi WiFi 6 MESH — 2.4 GHz et 5 GHz.", vlans: ["WIFI","IOT"] },
  { id: "rpi4",     label: "RPi 4",        icon: "◉", color: "#f87171", sub: "ARM A72 · 4 GB", desc: "Raspberry Pi 4 — héberge Home Assistant en mode natif.", services: ["Home Assistant"], type: "Natif" },
  { id: "printers", label: "Printers",     icon: "⎙", color: "#84cc16", sub: "Impression",     desc: "Périphériques d'impression réseau.", services: ["Samsung ML", "Sidewinder X2"], type: "Natif", vlans: ["PRINT"] },
];

const VLANS = [
  { id: "INFRA",    color: "#e07b39", num: 10,  cidr: "/29", desc: "Nœuds Proxmox" },
  { id: "ADMIN",    color: "#fb923c", num: 20,  cidr: "/29", desc: "Administration" },
  { id: "POULE",    color: "#f59e0b", num: 30,  cidr: "/30", desc: "Stockage CEPH + NAS" },
  { id: "FORGE",    color: "#a78bfa", num: 40,  cidr: "/24", desc: "Git & CI/CD" },
  { id: "SERVICES", color: "#4ecca3", num: 50,  cidr: "/24", desc: "Services exposés" },
  { id: "KUBE",     color: "#38bdf8", num: 60,  cidr: "/29", desc: "Cluster Kubernetes" },
  { id: "NATIF",    color: "#94a3b8", num: 1,   cidr: "/26", desc: "Réseau natif switch" },
  { id: "DNSPROXY", color: "#e879f9", num: 80,  cidr: "/30", desc: "DNS + Proxy" },
  { id: "PRINT",    color: "#84cc16", num: 90,  cidr: "/29", desc: "Impression" },
  { id: "WIFI",     color: "#22d3ee", num: 100, cidr: "/24", desc: "Réseau WiFi" },
  { id: "IOT",      color: "#f472b6", num: 150, cidr: "/24", desc: "Appareils IoT" },
];

const EDGES = [
  { from: "internet",   to: "router",     type: "wan",    label: "WAN" },
  { from: "internet",   to: "proxy",      type: "wan",    label: "HTTPS" },
  { from: "proxy",      to: "forgejo",    type: "expose", label: "Traefik" },
  { from: "proxy",      to: "monitoring", type: "expose" },
  { from: "proxy",      to: "medias",     type: "expose" },
  { from: "proxy",      to: "cloud",      type: "expose" },
  { from: "proxy",      to: "frontend",   type: "expose" },
  { from: "proxy",      to: "llm",        type: "expose" },
  { from: "proxy",      to: "analytics",  type: "expose" },
  { from: "ceph-a",    to: "ceph-b",     type: "ceph",   label: "réplication" },
  { from: "ceph-b",    to: "ceph-c",     type: "ceph" },
  { from: "ceph-a",    to: "ceph-c",     type: "ceph" },
  { from: "dcmanager",  to: "amelie",     type: "manage", label: "PDM" },
  { from: "dcmanager",  to: "anne",       type: "manage" },
  { from: "dcmanager",  to: "grace",      type: "manage" },
  { from: "monitoring", to: "pve-export", type: "manage", label: "scrape" },
  { from: "deploy",     to: "forgejo",    type: "manage", label: "CI/CD" },
  { from: "dns",        to: "proxy",      type: "manage", label: "PKI" },
  { from: "router",     to: "amelie",     type: "network" },
  { from: "router",     to: "anne",       type: "network" },
  { from: "router",     to: "grace",      type: "network" },
  { from: "router",     to: "ap",         type: "network" },
  { from: "router",     to: "rpi4",       type: "network" },
  { from: "router",     to: "printers",   type: "network" },
  { from: "ap",         to: "rpi4",       type: "network", label: "WiFi" },
];

const EDGE_STYLES = {
  wan:     { color: "#e07b39", dash: undefined, width: 2,   opacity: 1   },
  expose:  { color: "#4ecca3", dash: "4,4",     width: 1.5, opacity: 0.9 },
  ceph:    { color: "#f59e0b", dash: undefined, width: 2.5, opacity: 1   },
  manage:  { color: "#64748b", dash: "6,3",     width: 1.2, opacity: 0.8 },
  network: { color: "#2d3748", dash: undefined, width: 1,   opacity: 0.5 },
};

const TYPE_COLORS = { VM: "#a78bfa", LXC: "#38bdf8", Natif: "#4ecca3" };

/* ═══════════════════════════════════════════════════════════════
   LAYOUT — desktop
═══════════════════════════════════════════════════════════════ */

const CW = 340;
const CH = 56;
const NW = (CW - 14 * 2 - 8) / 2;
const NH = 40;
const RG = 6;
const CG = 8;
const CP = 14;

const CLUSTER_X = { amelie: 20, anne: 420, grace: 820 };
const CLUSTER_Y = 200;

function clusterH(srv) {
  const rows = Math.ceil(srv.containers.length / 2);
  return CH + CP + rows * (NH + RG) - RG + CP;
}

function containerPos(srv, idx) {
  const row = Math.floor(idx / 2);
  const col = idx % 2;
  return { x: CLUSTER_X[srv.id] + CP + col * (NW + CG), y: CLUSTER_Y + CH + CP + row * (NH + RG), w: NW, h: NH };
}

function clusterCenter(srvId) {
  const srv = SERVERS.find(s => s.id === srvId);
  return { x: CLUSTER_X[srvId] + CW / 2, y: CLUSTER_Y + clusterH(srv) / 2 };
}

function containerCenter(srv, idx) {
  const p = containerPos(srv, idx);
  return { x: p.x + p.w / 2, y: p.y + p.h / 2 };
}

const NET_W = 200, NET_H = 44, NET_Y = 14;
const NET_POS = {
  internet: { x: 20,   y: NET_Y, w: NET_W, h: NET_H },
  router:   { x: 260,  y: NET_Y, w: NET_W, h: NET_H },
  ap:       { x: 500,  y: NET_Y, w: NET_W, h: NET_H },
  rpi4:     { x: 740,  y: NET_Y, w: NET_W, h: NET_H },
  printers: { x: 980,  y: NET_Y, w: NET_W, h: NET_H },
};

function netCenter(id) { const p = NET_POS[id]; return { x: p.x + p.w / 2, y: p.y + p.h / 2 }; }

function resolveCenter(id) {
  if (NET_POS[id]) return netCenter(id);
  for (const srv of SERVERS) {
    if (srv.id === id) return clusterCenter(id);
    const idx = srv.containers.findIndex(c => c.id === id);
    if (idx !== -1) return containerCenter(srv, idx);
  }
  return null;
}

const SVG_W = 1220;

/* ═══════════════════════════════════════════════════════════════
   HOOKS
═══════════════════════════════════════════════════════════════ */

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return mobile;
}

/* ═══════════════════════════════════════════════════════════════
   DESKTOP VIEW
═══════════════════════════════════════════════════════════════ */

function DesktopView({ selected, onSelect }) {
  const wrapRef = useRef(null);
  const [tf, setTf] = useState({ x: 0, y: 10, k: 1 });
  // Use a ref for the dragging flag so event callbacks always see the latest
  // value without needing to be recreated — avoids stale-closure crashes.
  const [dragging, setDragging] = useState(false);
  const draggingRef = useRef(false);
  const drag0 = useRef<{ ox: number; oy: number } | null>(null);
  const [hov, setHov] = useState(null);
  const [edgeFilter, setEdgeFilter] = useState(null);
  const [vlanFilter, setVlanFilter] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let rafId: number;
    let ro: ResizeObserver | null = null;

    const computeFit = (): boolean => {
      if (!wrapRef.current) return false;
      const rect = wrapRef.current.getBoundingClientRect();
      const cW = rect.width;
      const cH = rect.height;
      if (!cW || !cH) return false;
      const contentW = SVG_W + 40;
      const maxClusterH = Math.max(...SERVERS.map(clusterH));
      const contentH = CLUSTER_Y + maxClusterH + 30;
      const kW = (cW - 24) / contentW;
      const kH = (cH - 24) / contentH;
      const k = Math.min(kW, kH, 1);
      const x = Math.max(0, (cW - contentW * k) / 2);
      const y = Math.max(6, (cH - contentH * k) / 2);
      setTf({ x, y, k });
      return true;
    };

    rafId = requestAnimationFrame(() => {
      rafId = requestAnimationFrame(() => {
        if (computeFit()) return;
        if (!wrapRef.current) return;
        ro = new ResizeObserver(() => {
          if (computeFit()) { ro?.disconnect(); ro = null; }
        });
        ro.observe(wrapRef.current);
      });
    });

    return () => {
      cancelAnimationFrame(rafId);
      ro?.disconnect();
    };
  }, []);

  // Attach the wheel listener imperatively with { passive: false } so that
  // e.preventDefault() actually prevents the page from scrolling.
  // React's synthetic onWheel is passive in modern React — preventDefault() is
  // silently ignored inside it.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const d = e.deltaY > 0 ? 0.9 : 1.11;
      setTf(p => {
        const k = Math.max(0.3, Math.min(3, p.k * d));
        return { x: mx - (k / p.k) * (mx - p.x), y: my - (k / p.k) * (my - p.y), k };
      });
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  const onMD = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    // Capture current tf via functional read to avoid depending on `tf` in deps.
    setTf(p => {
      drag0.current = { ox: e.clientX - p.x, oy: e.clientY - p.y };
      return p; // no change to tf itself
    });
    draggingRef.current = true;
    setDragging(true);
  }, []);

  const onMM = useCallback((e: React.MouseEvent) => {
    // Read dragging from ref — always current, never stale.
    if (!draggingRef.current || !drag0.current) return;
    // Capture drag0 values synchronously before the async setTf updater runs.
    // Without this, stopDrag() could null drag0.current before the updater
    // executes, causing "Cannot read property 'ox' of null" crash.
    const ox = drag0.current.ox;
    const oy = drag0.current.oy;
    setTf(p => ({ ...p, x: e.clientX - ox, y: e.clientY - oy }));
  }, []);

  const stopDrag = useCallback(() => {
    draggingRef.current = false;
    setDragging(false);
    drag0.current = null;
  }, []);

  const sl = search.toLowerCase();
  const matchC = c => !sl || c.label.toLowerCase().includes(sl) || c.services.some(s => s.toLowerCase().includes(sl));
  const inVlan = c => !vlanFilter || c.vlans?.includes(vlanFilter);
  const dimC = c => !matchC(c) || !inVlan(c);

  const connEdges = selected ? EDGES.filter(e => e.from === selected || e.to === selected) : [];
  const connIds = new Set(connEdges.flatMap(e => [e.from, e.to]));

  const visibleEdges = edgeFilter
    ? EDGES.filter(e => edgeFilter === "all" || e.type === edgeFilter)
    : selected
      ? connEdges
      : [];

  const svgH = CLUSTER_Y + Math.max(...SERVERS.map(clusterH)) + 20;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px",
        borderBottom: "1px solid rgba(255,255,255,0.07)", flexWrap: "wrap",
        background: "rgba(9,12,19,0.98)", backdropFilter: "blur(12px)", flexShrink: 0 }}>

        <span style={{ fontSize: 9.5, color: "#475569", letterSpacing: ".1em", marginRight: 2 }}>LIENS</span>
        <TBtn active={edgeFilter === null} color="#334155" onClick={() => setEdgeFilter(null)}>Masqués</TBtn>
        {[
          { k: "wan",     label: "WAN" },
          { k: "expose",  label: "Exposition" },
          { k: "ceph",    label: "CEPH" },
          { k: "manage",  label: "Gestion" },
          { k: "network", label: "Réseau" },
          { k: "all",     label: "Tous ·faint·" },
        ].map(({ k, label }) => (
          <TBtn key={k} active={edgeFilter === k}
            color={k === "all" ? "#94a3b8" : EDGE_STYLES[k]?.color}
            onClick={() => setEdgeFilter(edgeFilter === k ? null : k)}>{label}</TBtn>
        ))}

        <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.08)", margin: "0 3px" }} />
        <span style={{ fontSize: 9.5, color: "#475569", letterSpacing: ".1em", marginRight: 2 }}>VLAN</span>
        {VLANS.map(v => (
          <TBtn key={v.id} active={vlanFilter === v.id} color={v.color}
            onClick={() => setVlanFilter(vlanFilter === v.id ? null : v.id)}
            title={`LAN ${v.num} · ${v.cidr} · ${v.desc}`}>
            {v.id}
          </TBtn>
        ))}

        <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.08)", margin: "0 3px" }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Filtrer…"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: 6, padding: "3px 9px", color: "#e2e8f0", fontSize: 10.5,
            fontFamily: "inherit", outline: "none", width: 120 }} />

        <button onClick={() => {
          if (!wrapRef.current) return;
          const rect = wrapRef.current.getBoundingClientRect();
          const cW = rect.width;
          const cH = rect.height;
          const contentW = SVG_W + 40;
          const maxClusterH = Math.max(...SERVERS.map(clusterH));
          const contentH = CLUSTER_Y + maxClusterH + 30;
          const kW = (cW - 24) / contentW;
          const kH = (cH - 24) / contentH;
          const k = Math.min(kW, kH, 1);
          const x = Math.max(0, (cW - contentW * k) / 2);
          const y = Math.max(6, (cH - contentH * k) / 2);
          setTf({ x, y, k });
        }} style={{ marginLeft: "auto", background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.09)", borderRadius: 6, padding: "3px 10px",
          color: "#64748b", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>⊡ Reset</button>
      </div>

      {/* SVG Canvas */}
      <div ref={wrapRef} style={{ flex: 1, overflow: "hidden", position: "relative",
        cursor: dragging ? "grabbing" : "grab" }}
        onMouseDown={onMD} onMouseMove={onMM} onMouseUp={stopDrag} onMouseLeave={stopDrag}>
        <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}
          onClick={() => onSelect(null)}>
          <defs>
            <pattern id="dg" width="36" height="36" patternUnits="userSpaceOnUse"
              x={tf.x % 36} y={tf.y % 36}>
              <path d="M36 0L0 0 0 36" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="0.7" />
            </pattern>
            {Object.entries(EDGE_STYLES).map(([k, s]) => (
              <marker key={k} id={`m-${k}`} markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
                <path d="M0,0 L0,7 L7,3.5 z" fill={s.color} opacity="0.8" />
              </marker>
            ))}
          </defs>
          <rect width="100%" height="100%" fill="url(#dg)" />

          <g transform={`translate(${tf.x},${tf.y}) scale(${tf.k})`}>

            {/* EDGES */}
            {visibleEdges.map((e, i) => {
              const A = resolveCenter(e.from);
              const B = resolveCenter(e.to);
              if (!A || !B) return null;
              const s = EDGE_STYLES[e.type];
              const isConn = connIds.has(e.from) && connIds.has(e.to);
              const baseOp = edgeFilter === "all" ? 0.18 : s.opacity;
              const op = selected ? (isConn ? s.opacity : 0.06) : baseOp;
              const mid = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };
              const dx = B.x - A.x, dy = B.y - A.y, len = Math.hypot(dx, dy) || 1;
              const bend = e.type === "ceph" ? 55 : 0;
              const cx = mid.x - (dy / len) * bend, cy = mid.y + (dx / len) * bend;
              const d = bend ? `M${A.x},${A.y} Q${cx},${cy} ${B.x},${B.y}` : `M${A.x},${A.y} L${B.x},${B.y}`;
              return (
                <g key={i} opacity={op} style={{ transition: "opacity .2s" }}>
                  <path d={d} fill="none" stroke={s.color} strokeWidth={s.width}
                    strokeDasharray={s.dash} markerEnd={`url(#m-${e.type})`} />
                  {e.label && op > 0.12 && (
                    <text x={cx || mid.x} y={(cy || mid.y) - 5} textAnchor="middle"
                      fontSize={8} fill={s.color} opacity={0.9} fontFamily="JetBrains Mono,monospace">{e.label}</text>
                  )}
                </g>
              );
            })}

            {/* NETWORK DEVICES */}
            {NET_DEVICES.map(n => {
              const p = NET_POS[n.id];
              const isSel = selected === n.id;
              const isHov = hov === n.id;
              return (
                <g key={n.id} style={{ cursor: "pointer" }}
                  onClick={e => { e.stopPropagation(); onSelect(isSel ? null : n.id); }}
                  onMouseEnter={() => setHov(n.id)} onMouseLeave={() => setHov(null)}>
                  <rect x={p.x} y={p.y} width={p.w} height={p.h} rx={8}
                    fill={isSel ? `${n.color}1e` : "rgba(13,17,27,0.95)"}
                    stroke={isSel ? n.color : isHov ? `${n.color}80` : `${n.color}50`}
                    strokeWidth={isSel ? 2 : 1.2} />
                  <text x={p.x + 12} y={p.y + 17} fontSize={11} fontWeight={700}
                    fill={n.color} fontFamily="JetBrains Mono,monospace">{n.icon}  {n.label}</text>
                  {n.sub && <text x={p.x + 12} y={p.y + 31} fontSize={8.5} fill="#475569"
                    fontFamily="JetBrains Mono,monospace">{n.sub}</text>}
                  {n.id === "rpi4" && <circle cx={p.x + p.w - 12} cy={p.y + 10} r={4}
                    fill="#f87171" opacity={0.9} />}
                </g>
              );
            })}

            {/* SERVER CLUSTERS */}
            {SERVERS.map(srv => {
              const x = CLUSTER_X[srv.id];
              const h = clusterH(srv);
              const isSel = selected === srv.id;
              return (
                <g key={srv.id}>
                  <rect x={x} y={CLUSTER_Y} width={CW} height={h} rx={10}
                    fill="rgba(13,17,27,0.92)"
                    stroke={isSel ? srv.color : `${srv.color}32`} strokeWidth={isSel ? 2 : 1} />
                  <rect x={x} y={CLUSTER_Y} width={CW} height={CH} rx={10} fill={`${srv.color}0c`} />
                  <rect x={x} y={CLUSTER_Y + CH - 1} width={CW} height={1} fill={`${srv.color}25`} />
                  <text x={x + 13} y={CLUSTER_Y + 24} fontSize={14} fontWeight={800}
                    fill={srv.color} fontFamily="Syne,sans-serif">{srv.label}</text>
                  <text x={x + 13} y={CLUSTER_Y + 39} fontSize={8.5} fill="#475569"
                    fontFamily="JetBrains Mono,monospace">{srv.cpu} · {srv.cores}c / {srv.ram}</text>
                  <rect x={x + CW - 46} y={CLUSTER_Y + 17} width={36} height={14} rx={4}
                    fill={`${srv.color}18`} stroke={`${srv.color}40`} strokeWidth={0.8} />
                  <text x={x + CW - 28} y={CLUSTER_Y + 28} textAnchor="middle" fontSize={7.5}
                    fill={srv.color} fontFamily="JetBrains Mono,monospace" fontWeight={700}>PVE</text>

                  {srv.containers.map((c, idx) => {
                    const p = containerPos(srv, idx);
                    const isCsel = selected === c.id;
                    const isChov = hov === c.id;
                    const isVlanMatch = vlanFilter && c.vlans?.includes(vlanFilter);
                    const dimmed = dimC(c) && !isCsel;
                    const tc = TYPE_COLORS[c.type];
                    return (
                      <g key={c.id} opacity={dimmed ? 0.14 : 1}
                        style={{ cursor: "pointer", transition: "opacity .15s" }}
                        onClick={e => { e.stopPropagation(); onSelect(isCsel ? null : c.id); }}
                        onMouseEnter={() => setHov(c.id)} onMouseLeave={() => setHov(null)}>
                        {isVlanMatch && (
                          <rect x={p.x - 2} y={p.y - 2} width={p.w + 4} height={p.h + 4} rx={8}
                            fill="none" stroke={VLANS.find(v => v.id === vlanFilter)?.color}
                            strokeWidth={1.5} strokeDasharray="3,3" opacity={0.85} />
                        )}
                        <rect x={p.x} y={p.y} width={p.w} height={p.h} rx={6}
                          fill={isCsel || isChov ? "rgba(24,30,48,1)" : "rgba(15,19,29,0.9)"}
                          stroke={isCsel ? srv.color : isChov ? `${srv.color}60` : "rgba(255,255,255,0.08)"}
                          strokeWidth={isCsel ? 1.5 : 0.7} />
                        {c.wan && <circle cx={p.x + p.w - 9} cy={p.y + 9} r={3.5} fill="#e07b39" />}
                        <text x={p.x + 8} y={p.y + 14} fontSize={10} fontWeight={600}
                          fill="#e2e8f0" fontFamily="JetBrains Mono,monospace">{c.label}</text>
                        <text x={p.x + 8} y={p.y + 27} fontSize={7.5} fill="#475569"
                          fontFamily="JetBrains Mono,monospace">
                          {c.services.slice(0, 2).join(" · ")}{c.services.length > 2 ? " …" : ""}
                        </text>
                        <rect x={p.x + p.w - 36} y={p.y + 6} width={28} height={12} rx={3}
                          fill={`${tc}15`} stroke={`${tc}45`} strokeWidth={0.7} />
                        <text x={p.x + p.w - 22} y={p.y + 15} textAnchor="middle" fontSize={6.5}
                          fill={tc} fontFamily="JetBrains Mono,monospace" fontWeight={700}>{c.type}</text>
                      </g>
                    );
                  })}
                </g>
              );
            })}

          </g>
        </svg>

        {/* Legend */}
        <div style={{ position: "absolute", bottom: 12, left: 12, fontSize: 9.5, color: "#4a5568",
          background: "rgba(9,12,19,0.92)", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 8, padding: "8px 12px", backdropFilter: "blur(8px)", lineHeight: 1.6,
          pointerEvents: "none" }}>
          {[
            { c: "#e07b39", d: false, l: "WAN" },
            { c: "#4ecca3", d: true,  l: "Exposition" },
            { c: "#f59e0b", d: false, l: "Réplication CEPH" },
            { c: "#64748b", d: true,  l: "Gestion" },
          ].map(l => (
            <div key={l.l} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2 }}>
              <svg width={24} height={8} style={{ flexShrink: 0 }}>
                <line x1={0} y1={4} x2={24} y2={4} stroke={l.c}
                  strokeWidth={l.d ? 1.5 : 2} strokeDasharray={l.d ? "4,3" : undefined} />
              </svg>
              {l.l}
            </div>
          ))}
          <div style={{ marginTop: 5, fontSize: 8.5, color: "#334155" }}>
            Clic nœud → connexions · Filtre liens → topologie
          </div>
        </div>

        {!edgeFilter && !selected && (
          <div style={{ position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)",
            fontSize: 10.5, color: "#475569", background: "rgba(9,12,19,0.88)",
            border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20,
            padding: "5px 16px", backdropFilter: "blur(8px)", pointerEvents: "none", whiteSpace: "nowrap" }}>
            Cliquer un nœud · ou activer un filtre de liens
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MOBILE VIEW
═══════════════════════════════════════════════════════════════ */

function MobileView({ selected, onSelect }) {
  const [open, setOpen] = useState({ amelie: true, anne: false, grace: false });
  const [vlanFilter, setVlanFilter] = useState(null);
  const [search, setSearch] = useState("");

  const sl = search.toLowerCase();
  const match = c => !sl || c.label.toLowerCase().includes(sl) ||
    c.services.some(s => s.toLowerCase().includes(sl)) ||
    c.vlans?.some(v => v.toLowerCase().includes(sl));
  const inVlan = c => !vlanFilter || c.vlans?.includes(vlanFilter);

  return (
    <div style={{ padding: "12px 12px 60px", overflowY: "auto", WebkitOverflowScrolling: "touch",
      flex: 1, minHeight: 0 }}>

      <input value={search} onChange={e => setSearch(e.target.value)}
        placeholder="🔍 Service, VLAN, label…"
        style={{ width: "100%", background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10,
          padding: "10px 14px", color: "#e2e8f0", fontSize: 13,
          fontFamily: "inherit", outline: "none", marginBottom: 12, boxSizing: "border-box" }} />

      {/* VLAN filter chips */}
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 16 }}>
        {VLANS.map(v => (
          <button key={v.id} onClick={() => setVlanFilter(vlanFilter === v.id ? null : v.id)} title={v.desc}
            style={{ padding: "4px 9px", borderRadius: 20, fontSize: 10, fontFamily: "inherit",
              border: `1px solid ${vlanFilter === v.id ? v.color : "rgba(255,255,255,0.09)"}`,
              background: vlanFilter === v.id ? `${v.color}20` : "transparent",
              color: vlanFilter === v.id ? v.color : "#64748b", cursor: "pointer" }}>
            {v.num} {v.id}
          </button>
        ))}
      </div>

      {/* WAN chain */}
      <MLabelSection>FLUX WAN — CHAÎNE DE SÉCURITÉ</MLabelSection>
      <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 4 }}>
        {[
          { id: "internet", label: "Internet / WAN",     sub: "Point d'entrée",             color: "#e07b39", icon: "◈" },
          { id: "router",   label: "Routeur OPNsense",   sub: "Firewall · VPN · DHCP",      color: "#e07b39", icon: "⟳" },
          { id: "proxy",    label: "Proxy — Nginx Edge", sub: "CrowdSec · Fail2ban · ACME", color: "#4ecca3", icon: "⇄" },
        ].map((n, i) => (
          <div key={n.id}>
            <MRow id={n.id} label={n.label} sub={n.sub} color={n.color} icon={n.icon}
              selected={selected === n.id} onTap={() => onSelect(selected === n.id ? null : n.id)}
              radius={i === 0 ? "10px 10px 4px 4px" : i === 2 ? "4px 4px 10px 10px" : "4px"} />
            {i < 2 && <div style={{ height: 10, display: "flex", justifyContent: "center" }}>
              <div style={{ width: 2, background: "rgba(224,123,57,0.3)", height: "100%" }} />
            </div>}
          </div>
        ))}
      </div>

      {/* Exposed services */}
      <div style={{ marginTop: 10, marginBottom: 16 }}>
        <MLabelSection>SERVICES EXPOSÉS INTERNET</MLabelSection>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {SERVERS.flatMap(s => s.containers).filter(c => c.wan).map(c => (
            <button key={c.id} onClick={() => onSelect(selected === c.id ? null : c.id)}
              style={{ padding: "5px 11px", borderRadius: 20, fontSize: 11, fontFamily: "inherit",
                border: `1px solid ${selected === c.id ? "#4ecca3" : "rgba(78,204,163,0.22)"}`,
                background: selected === c.id ? "rgba(78,204,163,0.14)" : "transparent",
                color: selected === c.id ? "#4ecca3" : "#4a5568", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ color: "#e07b39", fontSize: 7 }}>●</span>{c.label}
            </button>
          ))}
        </div>
      </div>

      {/* CEPH mesh */}
      <MLabelSection>RÉPLICATION CEPH — 3 NŒUDS</MLabelSection>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 16 }}>
        {SERVERS.map(srv => (
          <div key={srv.id} style={{ background: "rgba(13,17,27,0.9)",
            border: `1px solid ${srv.color}38`, borderRadius: 8, padding: "9px 7px", textAlign: "center" }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: srv.color, marginBottom: 5,
              fontFamily: "Syne, sans-serif" }}>{srv.label}</div>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 3 }}>
              {["mon", "mgr", ...(srv.id !== "anne" ? ["osd"] : [])].map(r => (
                <span key={r} style={{ fontSize: 8, padding: "2px 5px", borderRadius: 4,
                  background: `${srv.color}16`, color: srv.color, border: `1px solid ${srv.color}32` }}>{r}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Server accordions */}
      <MLabelSection>SERVEURS PROXMOX</MLabelSection>
      {SERVERS.map(srv => {
        const visible = srv.containers.filter(c => match(c) && inVlan(c));
        const isOpen = open[srv.id];
        return (
          <div key={srv.id} style={{ marginBottom: 8, borderRadius: 12, overflow: "hidden",
            border: `1px solid ${isOpen ? srv.color : `${srv.color}28`}`, transition: "border-color .2s" }}>
            <button onClick={() => setOpen(o => ({ ...o, [srv.id]: !o[srv.id] }))}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px",
                background: `${srv.color}0b`, cursor: "pointer", width: "100%",
                border: "none", textAlign: "left", fontFamily: "inherit" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: srv.color,
                boxShadow: `0 0 7px ${srv.color}`, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: srv.color, fontFamily: "Syne,sans-serif" }}>
                  {srv.label}</div>
                <div style={{ fontSize: 10, color: "#4a5568" }}>{srv.cpu} · {srv.cores}c / {srv.ram}</div>
              </div>
              <span style={{ fontSize: 10, color: "#334155" }}>{visible.length}/{srv.containers.length}</span>
              <span style={{ color: srv.color, fontSize: 14, lineHeight: 1,
                transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .2s" }}>▾</span>
            </button>

            {isOpen && (
              <div style={{ padding: "6px 10px 10px" }}>
                {visible.length === 0 && (
                  <div style={{ textAlign: "center", color: "#334155", fontSize: 12, padding: "14px 0" }}>
                    Aucun résultat
                  </div>
                )}
                {visible.map(c => {
                  const isSel = selected === c.id;
                  const tc = TYPE_COLORS[c.type];
                  return (
                    <div key={c.id} onClick={() => onSelect(isSel ? null : c.id)}
                      style={{ marginBottom: 5, padding: "9px 11px", borderRadius: 8, cursor: "pointer",
                        background: isSel ? "rgba(24,30,48,0.95)" : "rgba(13,17,27,0.8)",
                        border: `1px solid ${isSel ? srv.color : "rgba(255,255,255,0.07)"}`,
                        transition: "all .15s" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, fontSize: 13, color: "#e2e8f0", flex: 1 }}>{c.label}</span>
                        {c.wan && <span style={{ fontSize: 9, color: "#e07b39" }}>● WAN</span>}
                        <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4,
                          border: `1px solid ${tc}50`, color: tc, background: `${tc}12` }}>{c.type}</span>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: c.vlans?.length ? 5 : 0 }}>
                        {c.services.map(s => (
                          <span key={s} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4,
                            background: "rgba(255,255,255,0.04)", color: "#64748b",
                            border: "1px solid rgba(255,255,255,0.06)" }}>{s}</span>
                        ))}
                      </div>
                      {c.vlans?.length > 0 && (
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          {c.vlans.map(v => {
                            const vl = VLANS.find(x => x.id === v);
                            return (
                              <span key={v} style={{ fontSize: 8.5, padding: "1px 6px", borderRadius: 3,
                                color: vl?.color || "#475569",
                                border: `1px solid ${vl?.color || "#475569"}38`,
                                background: `${vl?.color || "#475569"}0e` }}>
                                LAN{vl?.num} {v}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Peripherals */}
      <MLabelSection style={{ marginTop: 8 }}>PÉRIPHÉRIQUES RÉSEAU</MLabelSection>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {[
          { id: "rpi4",     label: "Raspberry Pi 4",   sub: "ARM Cortex-A72 · 4 GB · Home Assistant (Natif)", color: "#f87171", icon: "◉" },
          { id: "ap",       label: "Ubiquiti Unifi AP", sub: "WiFi 6 MESH · 2.4 GHz & 5 GHz",                  color: "#38bdf8", icon: "◎" },
          { id: "printers", label: "Printers",          sub: "Samsung ML · Sidewinder X2 (Natif)",              color: "#84cc16", icon: "⎙" },
        ].map(n => (
          <MRow key={n.id} id={n.id} label={n.label} sub={n.sub} color={n.color} icon={n.icon}
            selected={selected === n.id} radius="9px"
            onTap={() => onSelect(selected === n.id ? null : n.id)} />
        ))}
      </div>
    </div>
  );
}

function MLabelSection({ children }) {
  return (
    <div style={{ fontSize: 9.5, color: "#4a5568", letterSpacing: ".1em", fontWeight: 700,
      marginBottom: 7, marginTop: 4 }}>{children}</div>
  );
}

function MRow({ id, label, sub, color, icon, selected, onTap, radius }) {
  return (
    <div onClick={onTap} style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 13px",
      background: selected ? `${color}16` : "rgba(13,17,27,0.88)",
      border: `1px solid ${selected ? color : "rgba(255,255,255,0.07)"}`,
      borderRadius: radius || "8px", cursor: "pointer" }}>
      <span style={{ fontSize: 18, color, lineHeight: 1 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color }}>{label}</div>
        <div style={{ fontSize: 10.5, color: "#4a5568" }}>{sub}</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DETAIL PANEL
═══════════════════════════════════════════════════════════════ */

function DetailPanel({ selected, onClose, isMobile }) {
  if (!selected) return null;

  let data = null, color = "#e07b39";
  for (const srv of SERVERS) {
    const c = srv.containers.find(x => x.id === selected);
    if (c) { data = { ...c, _server: srv }; color = srv.color; break; }
  }
  if (!data) {
    const net = NET_DEVICES.find(n => n.id === selected);
    if (net) { data = net; color = net.color; }
  }
  if (!data) return null;

  const connEdges = EDGES.filter(e => e.from === selected || e.to === selected);
  const tc = data.type ? TYPE_COLORS[data.type] : null;

  const inner = (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div>
          <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 17, color }}>{data.label}</div>
          {data._server && (
            <div style={{ fontSize: 10, color: "#4a5568", marginTop: 2 }}>
              {data._server.label}
              {tc && <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 3, marginLeft: 6,
                border: `1px solid ${tc}48`, color: tc, background: `${tc}10` }}>{data.type}</span>}
            </div>
          )}
        </div>
        <button onClick={onClose}
          style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "#64748b",
            cursor: "pointer", borderRadius: 6, width: 28, height: 28, fontSize: 14,
            display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
      </div>

      {data.desc && (
        <div style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.65, marginBottom: 12,
          padding: "9px 11px", background: "rgba(255,255,255,0.04)",
          borderRadius: 7, borderLeft: `3px solid ${color}` }}>{data.desc}</div>
      )}

      {data.wan && (
        <div style={{ padding: "7px 11px", borderRadius: 7, marginBottom: 12,
          background: "rgba(224,123,57,0.09)", border: "1px solid rgba(224,123,57,0.26)",
          fontSize: 11, color: "#e07b39" }}>🌐 Exposé Internet — nginx Edge + Traefik</div>
      )}

      {data.services?.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <PLabel>Services</PLabel>
          {data.services.map(s => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 9px",
              marginBottom: 3, background: "rgba(255,255,255,0.04)", borderRadius: 6,
              fontSize: 11.5, color: "#e2e8f0" }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: color,
                flexShrink: 0, boxShadow: `0 0 5px ${color}` }} />
              {s}
            </div>
          ))}
        </div>
      )}

      {data.vlans?.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <PLabel>VLANs</PLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {data.vlans.map(v => {
              const vl = VLANS.find(x => x.id === v);
              return (
                <span key={v} title={vl?.desc}
                  style={{ fontSize: 10.5, padding: "3px 9px", borderRadius: 6,
                    border: `1px solid ${vl?.color || "#475569"}42`,
                    color: vl?.color || "#64748b", background: `${vl?.color || "#475569"}0e` }}>
                  LAN{vl?.num} · {v} {vl?.cidr}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {connEdges.length > 0 && (
        <div>
          <PLabel>Connexions ({connEdges.length})</PLabel>
          {connEdges.map((e, i) => {
            const otherId = e.from === selected ? e.to : e.from;
            const dir = e.from === selected ? "→" : "←";
            const other = SERVERS.flatMap(s => s.containers).find(c => c.id === otherId)
              || NET_DEVICES.find(n => n.id === otherId)
              || SERVERS.find(s => s.id === otherId);
            const es = EDGE_STYLES[e.type];
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 7,
                padding: "6px 9px", marginBottom: 3, background: "rgba(255,255,255,0.03)",
                borderRadius: 6, fontSize: 11, border: "1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ color: es?.color, fontWeight: 700 }}>{dir}</span>
                <span style={{ flex: 1, color: "#94a3b8" }}>{other?.label || otherId}</span>
                <span style={{ fontSize: 9, color: es?.color, opacity: 0.8 }}>
                  {e.type}{e.label ? ` · ${e.label}` : ""}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </>
  );

  if (isMobile) return (
    <>
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.52)", zIndex: 40 }}
        onClick={onClose} />
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
        background: "rgba(9,12,19,0.99)", borderTop: `2px solid ${color}`,
        borderRadius: "16px 16px 0 0", padding: "16px 16px 36px",
        maxHeight: "72vh", overflowY: "auto" }}>
        {inner}
      </div>
    </>
  );

  return (
    <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: 280,
      background: "rgba(9,12,19,0.97)", borderLeft: `1px solid ${color}35`,
      padding: "18px 15px", overflowY: "auto", zIndex: 30 }}>
      {inner}
    </div>
  );
}

function PLabel({ children }) {
  return (
    <div style={{ fontSize: 9, color: "#475569", letterSpacing: ".1em", fontWeight: 700,
      textTransform: "uppercase", marginBottom: 6 }}>{children}</div>
  );
}

function TBtn({ active, color = "#64748b", onClick, children, title }) {
  return (
    <button onClick={onClick} title={title}
      style={{ padding: "3px 8px", borderRadius: 5, fontSize: 10,
        border: `1px solid ${active ? color : "rgba(255,255,255,0.08)"}`,
        background: active ? `${color}18` : "transparent",
        color: active ? color : "#4a5568", cursor: "pointer", fontFamily: "inherit",
        letterSpacing: ".03em", transition: "all .12s", whiteSpace: "nowrap" }}>
      {children}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ROOT
═══════════════════════════════════════════════════════════════ */

export default function InfraViz() {
  const isMobile = useIsMobile();
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fontLinkId = "infra-viz-fonts";
    if (document.getElementById(fontLinkId)) return;
    const link = document.createElement("link");
    link.id = fontLinkId;
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@700;800&display=swap";
    document.head.appendChild(link);
  }, []);

  return (
    <div style={{
      fontFamily: "'JetBrains Mono', monospace",
      background: "#090c13",
      color: "#e2e8f0",
      ...(isMobile
        ? { minHeight: "100vh" }
        : { height: "calc(100vh - 200px)", minHeight: "600px", overflow: "hidden", display: "flex", flexDirection: "column" }
      ),
      position: "relative",
      borderRadius: "0.75rem",
    }}>

      {/* Dot grid background */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
        backgroundSize: "32px 32px", borderRadius: "inherit" }} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px",
        zIndex: 10, flexShrink: 0, borderBottom: "1px solid rgba(255,255,255,0.07)",
        background: "rgba(9,12,19,0.97)", backdropFilter: "blur(12px)",
        position: isMobile ? "sticky" : "relative", top: 0,
        borderRadius: isMobile ? 0 : "0.75rem 0.75rem 0 0" }}>
        <div>
          <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 15,
            color: "#e07b39", letterSpacing: ".02em" }}>Infrastructure</div>
          <div style={{ fontSize: 9.5, color: "#334155" }}>
            3 nœuds Proxmox · CEPH · {VLANS.length} VLANs · {SERVERS.flatMap(s => s.containers).length + NET_DEVICES.filter(d => d.services).length} services
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
          {SERVERS.map(s => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: s.color,
                boxShadow: `0 0 6px ${s.color}` }} />
              <span style={{ fontSize: 10, color: s.color, fontFamily: "Syne,sans-serif", fontWeight: 800 }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main content area */}
      <div style={{
        position: "relative", zIndex: 1,
        ...(isMobile
          ? { flex: "none" }
          : { flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }
        ),
      }}>
        {isMobile ? (
          <>
            <MobileView selected={selected} onSelect={setSelected} />
            <DetailPanel selected={selected} onClose={() => setSelected(null)} isMobile />
          </>
        ) : (
          <div style={{ position: "relative", flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <DesktopView selected={selected} onSelect={setSelected} />
            <DetailPanel selected={selected} onClose={() => setSelected(null)} isMobile={false} />
          </div>
        )}
      </div>
    </div>
  );
}
