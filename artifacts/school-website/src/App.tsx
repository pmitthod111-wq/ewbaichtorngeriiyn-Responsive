import { useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import {
  ClerkProvider,
  SignIn,
  SignUp,
  useAuth,
  useClerk,
  useUser,
} from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Building2,
  CalendarDays,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clock3,
  DoorOpen,
  Download,
  FileText,
  Filter,
  Inbox,
  Layers3,
  LogOut,
  MapPin,
  Menu,
  MessageCircle,
  Move3d,
  Plus,
  Search,
  Send,
  ShieldAlert,
  Sparkles,
  UsersRound,
  X,
} from 'lucide-react';
import {
  getGetAdminSummaryQueryKey,
  getListAdminAnnouncementsQueryKey,
  getListAdminInquiriesQueryKey,
  getListPublicAnnouncementsQueryKey,
  useCreateAnnouncement,
  useCreateInquiry,
  useDeleteAnnouncement,
  useGetAdminSummary,
  useListAdminAnnouncements,
  useListAdminInquiries,
  useListPublicAnnouncements,
  useUpdateAnnouncement,
  useUpdateInquiryStatus,
} from '@workspace/api-client-react';
import type {
  Announcement,
  AnnouncementInput,
  Inquiry,
  InquiryInput,
  InquiryTopic,
} from '@workspace/api-client-react';
import { Redirect, Route, Router as WouterRouter, Switch, useLocation, Link } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: true } },
});
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

function stripBase(path: string) {
  return basePath && path.startsWith(basePath) ? path.slice(basePath.length) || '/' : path;
}

if (!clerkPubKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env file');
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: 'clerk',
  options: {
    logoPlacement: 'inside' as const,
    logoLinkUrl: basePath || '/',
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: '#278244',
    colorForeground: '#214a30',
    colorMutedForeground: '#738177',
    colorDanger: '#bf4b35',
    colorBackground: '#fffefa',
    colorInput: '#fbfdf9',
    colorInputForeground: '#214a30',
    colorNeutral: '#dce8d9',
    fontFamily: "'Noto Sans Thai', sans-serif",
    borderRadius: '0.85rem',
  },
  elements: {
    rootBox: 'w-full flex justify-center',
    cardBox: 'bg-[#fffefa] rounded-2xl w-[440px] max-w-full overflow-hidden shadow-xl',
    card: '!shadow-none !border-0 !bg-transparent !rounded-none',
    footer: '!shadow-none !border-0 !bg-transparent !rounded-none',
    headerTitle: 'text-[#1d5b34] font-extrabold',
    headerSubtitle: 'text-[#718276]',
    socialButtonsBlockButtonText: 'text-[#31583b] font-semibold',
    formFieldLabel: 'text-[#31583b] font-semibold',
    footerActionLink: 'text-[#238044] font-bold',
    footerActionText: 'text-[#718276]',
    dividerText: 'text-[#89948a]',
    identityPreviewEditButton: 'text-[#238044]',
    formFieldSuccessText: 'text-[#238044]',
    alertText: 'text-[#8c412e]',
    logoBox: 'rounded-lg',
    logoImage: 'object-contain',
    socialButtonsBlockButton: 'border-[#dce8d9] bg-white hover:bg-[#f6faf3]',
    formButtonPrimary: 'bg-[#278244] hover:bg-[#1b6c35] shadow-none',
    formFieldInput: 'bg-[#fbfdf9] border-[#dce8d9] text-[#214a30]',
    footerAction: 'text-[#718276]',
    dividerLine: 'bg-[#e4ebe1]',
    alert: 'border-[#f0d4c5] bg-[#fff8f2]',
    otpCodeFieldInput: 'border-[#dce8d9] bg-[#fbfdf9]',
    formFieldRow: 'text-[#31583b]',
    main: 'text-[#31583b]',
  },
};

type TopicFilter = InquiryTopic | 'all';
type StatusFilter = Inquiry['status'] | 'all';
type InquiryStatus = Inquiry['status'];

const topicLabels: Record<InquiryTopic, string> = {
  visit: 'เยี่ยมชมโรงเรียน',
  admission: 'สมัครเรียน',
  '3d': 'ชมแบบ 3D',
  general: 'สอบถามทั่วไป',
};
const statusLabels: Record<InquiryStatus, string> = {
  new: 'ใหม่',
  in_progress: 'กำลังติดตาม',
  resolved: 'เรียบร้อย',
};

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`brand-lockup ${compact ? 'brand-lockup-compact' : ''}`} data-testid="text-school-brand">
      <span className="brand-mark" aria-hidden="true"><span className="brand-roof" /><span className="brand-shield">ร</span></span>
      <span className="brand-words"><strong>โรงเรียนของเรา</strong><small>มุ่งมั่น พัฒนา ร่วมกัน</small></span>
    </span>
  );
}

type DeferredPwaInstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

function InstallAppControl() {
  const [promptEvent, setPromptEvent] = useState<DeferredPwaInstallPrompt | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || (navigator as Navigator & { standalone?: boolean }).standalone === true;
    setInstalled(standalone);

    const capturePrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as DeferredPwaInstallPrompt);
    };
    const markInstalled = () => {
      setInstalled(true);
      setPromptEvent(null);
      setShowInstructions(false);
    };

    window.addEventListener('beforeinstallprompt', capturePrompt);
    window.addEventListener('appinstalled', markInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', capturePrompt);
      window.removeEventListener('appinstalled', markInstalled);
    };
  }, []);

  const install = async () => {
    if (!promptEvent) {
      setShowInstructions((current) => !current);
      return;
    }

    try {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice.outcome === 'accepted') setInstalled(true);
    } catch (error) {
      console.error('The app installation prompt could not be opened.', error);
      setShowInstructions(true);
    } finally {
      setPromptEvent(null);
    }
  };

  return (
    <div className="install-app-control">
      <button
        type="button"
        className="install-app-button"
        data-testid="button-install-app"
        disabled={installed}
        aria-expanded={showInstructions}
        aria-controls="install-app-instructions"
        onClick={() => { void install(); }}
      >
        <Download size={16} />
        {installed ? 'ติดตั้งแอปแล้ว' : promptEvent ? 'ติดตั้งแอป' : 'เพิ่มแอปไว้บนหน้าจอ'}
        {!installed && <ArrowRight size={15} />}
      </button>
      {showInstructions && !installed && (
        <p id="install-app-instructions" className="install-app-instructions" role="status">
          Android: เปิดเมนู ⋮ แล้วเลือก “ติดตั้งแอป” · iPhone: แตะ “แชร์” แล้วเลือก “เพิ่มไปยังหน้าจอโฮม”
        </p>
      )}
    </div>
  );
}

function PublicHome() {
  const [interestOpen, setInterestOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeAppTab, setActiveAppTab] = useState<'home' | 'explore' | 'news' | 'contact'>('home');
  const [activeAnnouncement, setActiveAnnouncement] = useState<number | null>(null);
  const [form, setForm] = useState<InquiryInput>({ fullName: '', contact: '', topic: 'visit', message: '' });
  const announcements = useListPublicAnnouncements({ query: { queryKey: getListPublicAnnouncementsQueryKey() } });
  const createInquiry = useCreateInquiry();
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => { document.title = 'โรงเรียนของเรา | ระบบแนะนำและสำรวจโรงเรียน'; }, []);
  useEffect(() => {
    const tabBySection: Record<string, 'home' | 'explore' | 'news' | 'contact'> = {
      home: 'home',
      'explore-detail': 'explore',
      news: 'news',
      contact: 'contact',
    };
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];
      const tab = visible ? tabBySection[visible.target.id] : undefined;
      if (tab) setActiveAppTab(tab);
    }, { rootMargin: '-18% 0px -62% 0px', threshold: 0 });

    for (const id of Object.keys(tabBySection)) {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    }
    return () => observer.disconnect();
  }, []);
  const published = announcements.data ?? [];
  const filtered = published.filter((item) =>
    `${item.title} ${item.category} ${item.summary}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
  );
  const scrollTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const submitInquiry = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createInquiry.mutate(
      { data: { ...form, message: form.message?.trim() || undefined } },
      {
        onSuccess: () => {
          setForm({ fullName: '', contact: '', topic: 'visit', message: '' });
          queryClient.invalidateQueries({ queryKey: getGetAdminSummaryQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListAdminInquiriesQueryKey() });
        },
      },
    );
  };
  const closeInterest = () => {
    if (createInquiry.isPending) return;
    setInterestOpen(false);
    createInquiry.reset();
  };

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="container page-header">
          <button className="brand-button focus-ring" data-testid="button-brand" onClick={() => { setActiveAppTab('home'); scrollTo('top'); }} aria-label="กลับสู่หน้าแรก"><Logo /></button>
          <nav className="desktop-nav" aria-label="เมนูหลัก">
            <button className="nav-link active" data-testid="link-home" onClick={() => scrollTo('top')}>หน้าหลัก</button>
            <button className="nav-link" data-testid="link-buildings" onClick={() => scrollTo('explore-detail')}>อาคารเรียน</button>
            <button className="nav-link" data-testid="link-places" onClick={() => scrollTo('campus-map')}>สถานที่</button>
            <button className="nav-link" data-testid="link-plans" onClick={() => scrollTo('campus-map')}>แผนผังโรงเรียน</button>
            <button className="nav-link" data-testid="button-header-search" onClick={() => { setSearchOpen(true); scrollTo('campus-map'); }}>ค้นหา</button>
          </nav>
          <Link href="/admin" className="login-button focus-ring" data-testid="link-admin"><Inbox size={16} /> สำหรับผู้ดูแล</Link>
          <button className="mobile-menu-button focus-ring" data-testid="button-mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'ปิดเมนู' : 'เปิดเมนู'} aria-expanded={menuOpen}>{menuOpen ? <X size={21} /> : <Menu size={21} />}</button>
        </div>
        {menuOpen && <div className="mobile-panel">
          <button data-testid="mobile-link-home" onClick={() => { setActiveAppTab('home'); scrollTo('top'); }}>หน้าหลัก <ArrowRight size={16} /></button>
          <button data-testid="mobile-link-buildings" onClick={() => scrollTo('explore-detail')}>อาคารเรียน <ArrowRight size={16} /></button>
          <button data-testid="mobile-link-places" onClick={() => scrollTo('campus-map')}>สถานที่ <ArrowRight size={16} /></button>
          <button data-testid="mobile-link-plans" onClick={() => scrollTo('campus-map')}>แผนผังโรงเรียน <ArrowRight size={16} /></button>
          <Link href="/admin" className="mobile-admin-link" data-testid="mobile-link-admin" onClick={() => setMenuOpen(false)}>สำหรับผู้ดูแล <Inbox size={16} /></Link>
          <InstallAppControl />
        </div>}
      </header>

      <main id="top">
        <section id="home" className="hero-section">
          <div className="hero-color-wash" aria-hidden="true" />
          <div className="container hero-grid">
            <div className="hero-copy">
              <p className="hero-kicker"><span /> ระบบแนะนำและสำรวจโรงเรียน</p>
              <h1 data-testid="text-hero-title">ค้นหาและสำรวจ<br /><em>โรงเรียนในฝัน</em></h1>
              <p className="hero-description">ค้นหาอาคาร ห้องเรียน และสถานที่ต่าง ๆ ภายในโรงเรียน<br className="desktop-only" /> ได้อย่างง่ายดาย ครบ จบในที่เดียว</p>
              <div className="hero-search"><Search size={19} aria-hidden="true" /><input data-testid="input-hero-search" value={query} onChange={(e) => { setQuery(e.target.value); setSearchOpen(true); }} onFocus={() => setSearchOpen(true)} placeholder="ค้นหาข่าวสารและประกาศ..." aria-label="ค้นหาข่าวสารและประกาศ" /><button className="hero-search-submit focus-ring" data-testid="button-hero-search" onClick={() => { setSearchOpen(true); scrollTo('campus-map'); }} aria-label="เปิดผลการค้นหา"><ArrowRight size={18} /></button></div>
              <button className="primary-button focus-ring" data-testid="button-explore-campus" onClick={() => scrollTo('explore-detail')}><MapPin size={17} /> สำรวจโรงเรียน <ArrowRight size={17} /></button>
              {searchOpen && query && <div className="hero-search-results" data-testid="panel-search-results">
                {filtered.length ? filtered.slice(0, 3).map((item) => <button key={item.id} data-testid={`result-search-${item.id}`} onClick={() => { setActiveAnnouncement(item.id); scrollTo('campus-map'); setSearchOpen(false); }}><span>{item.title}</span><ChevronRight size={15} /></button>) : <p>ไม่พบประกาศที่ตรงกับคำค้นหา</p>}
              </div>}
            </div>
            <div className="hero-visual">
              <img data-testid="img-campus-hero" src="/campus-hero.png" alt="อาคารเรียนและพื้นที่สีเขียวของโรงเรียนของเรา" />
              <div className="hero-image-caption"><span className="live-dot" /> เปิดให้สำรวจแล้ววันนี้</div>
              <div className="hero-image-card"><Move3d size={18} /><span><b>ดูโรงเรียนในรูปแบบ 3D</b><small>เดินชมพื้นที่แบบเสมือนจริง</small></span></div>
            </div>
          </div>
        </section>

        <section className="stats-wrap container" aria-label="ข้อมูลโรงเรียน">
          <div className="stats-strip">
            {[{ value: '6', label: 'อาคารเรียน', icon: Building2, tone: 'orange' }, { value: '128', label: 'ห้องเรียน', icon: DoorOpen, tone: 'green' }, { value: '15', label: 'สถานที่สำคัญ', icon: MapPin, tone: 'orange' }, { value: '2,345', label: 'นักเรียนทั้งหมด', icon: UsersRound, tone: 'green' }].map(({ value, label, icon: Icon, tone }) => <div data-testid={`stat-${label}`} className="stat-item" key={label}><span className={`stat-icon ${tone}`}><Icon size={22} /></span><span><strong>{value}</strong><small>{label}</small></span></div>)}
          </div>
        </section>

        <section id="explore-detail" className="explore-section section-anchor">
          <div className="container">
            <div className="section-heading centered"><span className="section-label">EXPLORE SCHOOL</span><h2 data-testid="text-explore-title">เลือกสิ่งที่คุณต้องการค้นหา</h2><span className="heading-rule" /><p>ทุกข้อมูลที่คุณกำลังมองหาเกี่ยวกับโรงเรียน<br className="desktop-only" /> อยู่ที่นี่แล้ว</p></div>
            <div className="feature-grid">
              {[{ id: 'buildings', title: 'อาคารเรียน', description: 'ดูข้อมูลอาคารเรียนแต่ละอาคาร ชั้น และห้องเรียน', icon: Building2, accent: 'orange', action: 'ดูอาคารเรียน' }, { id: 'places', title: 'สถานที่', description: 'ค้นหาสนาม ห้องอาหาร ห้องสมุด และสถานที่สำคัญ', icon: MapPin, accent: 'green', action: 'ดูสถานที่' }, { id: 'plans', title: 'แผนผังโรงเรียน', description: 'สำรวจเส้นทางและตำแหน่งอาคารภายในโรงเรียน', icon: Layers3, accent: 'orange', action: 'ดูแผนผัง' }, { id: 'search', title: 'ค้นหาข่าวสาร', description: 'ติดตามประกาศและกิจกรรมล่าสุดจากโรงเรียน', icon: Search, accent: 'green', action: 'ดูประกาศ' }].map(({ id, title, description, icon: Icon, accent, action }) => <button data-testid={`card-feature-${id}`} className={`feature-card ${accent}`} key={id} onClick={() => id === 'search' ? scrollTo('campus-map') : scrollTo(id === 'plans' ? 'campus-map' : 'explore-detail')}><span className="feature-icon"><Icon size={31} strokeWidth={1.8} /></span><span className="feature-title">{title}</span><span className="feature-description">{description}</span><span className="feature-action">{action} <ArrowRight size={16} /></span></button>)}
            </div>
          </div>
        </section>

        <section id="campus-map" className="campus-section section-anchor">
          <div className="container campus-grid">
            <div className="map-card"><div className="map-card-copy"><span className="mini-label">EXPLORE IN 3D</span><h2>สำรวจโรงเรียน<br /><em>ในรูปแบบ 3D</em></h2><p>ชมพื้นที่ภายในโรงเรียนแบบเสมือนจริง พร้อมดูรายละเอียดอาคารและสถานที่ต่าง ๆ ได้ทุกที่ทุกเวลา</p><button data-testid="button-open-3d" className="small-green-button focus-ring" onClick={() => { setForm((current) => ({ ...current, topic: '3d' })); setInterestOpen(true); }}><Move3d size={16} /> ขอข้อมูล 3D <ArrowRight size={15} /></button></div><div className="map-illustration" aria-label="ภาพจำลองแผนผังโรงเรียน"><img src="/campus-hero.png" alt="" /><div className="map-grid-overlay" /><span className="map-pin pin-one"><MapPin size={20} /></span><span className="map-pin pin-two"><MapPin size={20} /></span><span className="map-3d-badge">3D</span></div></div>
            <div id="news" className="news-card section-anchor">
              <div className="news-card-heading"><div><span className="mini-label">LATEST UPDATE</span><h2>ข่าวสารและประกาศ</h2></div><span className="news-count">{announcements.data?.length ?? 0} รายการ</span></div>
              {announcements.isLoading ? <div className="public-news-state"><span className="skeleton-line" /><span className="skeleton-line short" /><span className="skeleton-line" /></div> : announcements.isError ? <div className="public-news-state"><p>ไม่สามารถโหลดประกาศได้ในขณะนี้</p><button onClick={() => announcements.refetch()} data-testid="button-retry-public-news">ลองอีกครั้ง</button></div> : published.length === 0 ? <div className="public-news-state"><Bell size={21} /><p>ยังไม่มีประกาศล่าสุด</p><small>โปรดกลับมาติดตามข่าวสารจากโรงเรียน</small></div> : <div className="news-list">
                {published.map((item) => <div className="news-row" data-testid={`row-news-${item.id}`} key={item.id}><button className="news-row-button" data-testid={`button-news-${item.id}`} onClick={() => setActiveAnnouncement(activeAnnouncement === item.id ? null : item.id)} aria-expanded={activeAnnouncement === item.id}><span className="news-bell"><Bell size={16} /></span><span className="news-row-copy"><strong>{item.title}</strong><small>{item.category}</small></span><span className="news-date">{formatThaiDate(item.createdAt)}</span>{activeAnnouncement === item.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</button>{activeAnnouncement === item.id && <p className="news-detail" data-testid={`text-news-detail-${item.id}`}>{item.summary}</p>}</div>)}
              </div>}
            </div>
          </div>
        </section>
        <section id="contact" className="interest-section section-anchor"><div className="container interest-inner"><div><span className="section-label">STAY CONNECTED</span><h2>อยากรู้จักโรงเรียน<br /><em>ของเราให้มากขึ้น?</em></h2><p>ฝากข้อมูลความสนใจไว้ เราจะติดต่อกลับพร้อมข้อมูลที่เหมาะกับคุณ</p></div><button data-testid="button-interest" className="white-button focus-ring" onClick={() => setInterestOpen(true)}>ลงทะเบียนความสนใจ <ArrowRight size={17} /></button></div></section>
      </main>
      <footer className="site-footer"><div className="container footer-grid"><div className="footer-brand"><Logo /><p>แหล่งรวมข้อมูลโรงเรียน<br />เพื่อการค้นพบที่ง่ายขึ้น</p></div><div className="footer-column"><h3>เมนูหลัก</h3><button data-testid="footer-link-home" onClick={() => scrollTo('top')}>หน้าหลัก</button><button data-testid="footer-link-buildings" onClick={() => scrollTo('explore-detail')}>อาคารเรียน</button><button data-testid="footer-link-places" onClick={() => scrollTo('campus-map')}>สถานที่</button></div><div className="footer-column"><h3>ข้อมูลโรงเรียน</h3><button data-testid="footer-link-about" onClick={() => { setForm((v) => ({ ...v, topic: 'general' })); setInterestOpen(true); }}>เกี่ยวกับโรงเรียน</button><button data-testid="footer-link-contact" onClick={() => { setForm((v) => ({ ...v, topic: 'general' })); setInterestOpen(true); }}>ติดต่อเรา</button><Link href="/admin" data-testid="footer-link-admin">ผู้ดูแลระบบ</Link></div><div className="footer-column footer-contact"><h3>ติดต่อเรา</h3><p><MapPin size={15} /> 123 หมู่ 1 ตำบลทุ่งสุข<br />อำเภอเมือง จังหวัดเชียงใหม่</p><p><MessageCircle size={15} /> 02-123-4567</p><p><Send size={15} /> info@our-school.ac.th</p></div></div><div className="container footer-bottom"><span>© 2024 โรงเรียนของเรา สงวนลิขสิทธิ์</span><span>สร้างพื้นที่เพื่อการค้นพบและการเรียนรู้</span></div></footer>

      <nav className="mobile-app-nav" aria-label="เมนูแอป">
        <button type="button" className={activeAppTab === 'home' ? 'active' : ''} aria-current={activeAppTab === 'home' ? 'page' : undefined} onClick={() => { setActiveAppTab('home'); scrollTo('top'); }}>
          <span className="mobile-tab-icon"><Building2 size={18} /></span><span>หน้าหลัก</span>
        </button>
        <button type="button" className={activeAppTab === 'explore' ? 'active' : ''} aria-current={activeAppTab === 'explore' ? 'page' : undefined} onClick={() => { setActiveAppTab('explore'); scrollTo('explore-detail'); }}>
          <span className="mobile-tab-icon"><MapPin size={18} /></span><span>สำรวจ</span>
        </button>
        <button type="button" className={activeAppTab === 'news' ? 'active' : ''} aria-current={activeAppTab === 'news' ? 'page' : undefined} onClick={() => { setActiveAppTab('news'); scrollTo('news'); }}>
          <span className="mobile-tab-icon"><Bell size={18} /></span><span>ข่าวสาร</span>
        </button>
        <button type="button" className={activeAppTab === 'contact' ? 'active' : ''} aria-current={activeAppTab === 'contact' ? 'page' : undefined} onClick={() => { setActiveAppTab('contact'); setMenuOpen(false); setForm((current) => ({ ...current, topic: 'general' })); setInterestOpen(true); }}>
          <span className="mobile-tab-icon"><MessageCircle size={18} /></span><span>ติดต่อ</span>
        </button>
      </nav>

      {searchOpen && query && <button className="search-dismiss" aria-label="ปิดผลการค้นหา" data-testid="button-dismiss-search" onClick={() => setSearchOpen(false)} />}
      {interestOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeInterest(); }}><div className="interest-modal" role="dialog" aria-modal="true" aria-labelledby="interest-title"><button className="icon-close focus-ring" data-testid="button-close-interest" onClick={closeInterest} aria-label="ปิดแบบฟอร์ม"><X size={19} /></button>{createInquiry.isSuccess ? <div className="success-state" data-testid="state-inquiry-success"><span className="success-check"><Check size={24} /></span><h2 id="interest-title">ได้รับข้อมูลแล้ว</h2><p>ทีมงานโรงเรียนของเราจะติดต่อกลับโดยเร็วที่สุด</p><button className="modal-primary-button" data-testid="button-close-success" onClick={closeInterest}>เรียบร้อย</button></div> : <><span className="login-icon green"><MessageCircle size={25} /></span><h2 id="interest-title">ลงทะเบียนความสนใจ</h2><p>กรอกข้อมูลสั้น ๆ ให้ทีมโรงเรียนติดต่อกลับ</p><form data-testid="form-interest" onSubmit={submitInquiry}><label htmlFor="inquiry-name">ชื่อผู้ติดต่อ<input id="inquiry-name" data-testid="input-interest-name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required minLength={2} maxLength={120} placeholder="ชื่อ - นามสกุล" /></label><label htmlFor="inquiry-contact">อีเมลหรือเบอร์โทรศัพท์<input id="inquiry-contact" data-testid="input-interest-contact" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} required minLength={3} maxLength={180} placeholder="สำหรับติดต่อกลับ" /></label><label htmlFor="inquiry-topic">เรื่องที่สนใจ<select id="inquiry-topic" data-testid="select-interest-topic" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value as InquiryTopic })}><option value="visit">นัดเยี่ยมชมโรงเรียน</option><option value="admission">ข้อมูลการสมัครเรียน</option><option value="3d">ชมโรงเรียนรูปแบบ 3D</option><option value="general">สอบถามทั่วไป</option></select></label><label htmlFor="inquiry-message">รายละเอียดเพิ่มเติม <span className="optional-label">ไม่บังคับ</span><textarea id="inquiry-message" data-testid="input-interest-message" value={form.message ?? ''} onChange={(e) => setForm({ ...form, message: e.target.value })} maxLength={2000} placeholder="แจ้งช่วงเวลาที่สะดวก หรือรายละเอียดที่ต้องการทราบ" rows={3} /></label>{createInquiry.isError && <p className="form-error" role="alert" data-testid="text-inquiry-error">ส่งข้อมูลไม่สำเร็จ กรุณาตรวจสอบแล้วลองอีกครั้ง</p>}<button className="modal-primary-button" data-testid="button-submit-interest" type="submit" disabled={createInquiry.isPending}>{createInquiry.isPending ? 'กำลังส่งข้อมูล…' : 'ส่งข้อมูลความสนใจ'} <Send size={16} /></button></form></>}</div></div>}
    </div>
  );
}

function formatThaiDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

function formatThaiDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
}

function errorStatus(error: unknown) {
  const err = error as { status?: number; response?: { status?: number } } | undefined;
  return err?.status ?? err?.response?.status;
}

function LoadingAdmin() {
  return <div className="admin-loading" aria-label="กำลังโหลด"><div className="admin-skeleton wide" /><div className="admin-skeleton" /><div className="admin-skeleton" /><div className="admin-skeleton block" /></div>;
}

function AdminFrame({ children, active }: { children: React.ReactNode; active: 'inbox' | 'announcements' }) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [menuOpen, setMenuOpen] = useState(false);
  return <div className="admin-shell">
    <aside className={`admin-sidebar ${menuOpen ? 'is-open' : ''}`}>
      <div className="admin-brand"><Link href="/" aria-label="หน้าโรงเรียน" data-testid="link-admin-brand"><Logo compact /></Link><button className="admin-close-menu" data-testid="button-admin-menu-close" onClick={() => setMenuOpen(false)} aria-label="ปิดเมนู"><X size={19} /></button></div>
      <div className="admin-space-label">จัดการโรงเรียน</div>
      <nav className="admin-nav" aria-label="เมนูผู้ดูแล">
        <Link href="/admin" className={active === 'inbox' ? 'active' : ''} data-testid="link-admin-inbox"><Inbox size={18} /><span>กล่องข้อความ</span><span className="nav-pulse" /></Link>
        <Link href="/admin/announcements" className={active === 'announcements' ? 'active' : ''} data-testid="link-admin-announcements"><FileText size={18} /><span>ข่าวสารและประกาศ</span></Link>
      </nav>
      <div className="sidebar-bottom">
        <div className="sidebar-help"><span className="sidebar-help-icon"><CircleHelp size={17} /></span><strong>ต้องการความช่วยเหลือ?</strong><small>สอบถามทีมสนับสนุนโรงเรียน</small><a href="mailto:info@our-school.ac.th" data-testid="link-admin-support">ติดต่อทีมงาน <ArrowRight size={14} /></a></div>
        <div className="admin-profile"><span className="profile-initial">{(user?.firstName?.[0] ?? user?.primaryEmailAddress?.emailAddress?.[0] ?? 'ผ').toLocaleUpperCase()}</span><span className="profile-copy"><strong>{user?.fullName || 'ผู้ดูแลระบบ'}</strong><small>ผู้ดูแลโรงเรียน</small></span><button data-testid="button-admin-signout" aria-label="ออกจากระบบ" onClick={() => signOut({ redirectUrl: basePath || '/' })}><LogOut size={17} /></button></div>
      </div>
    </aside>
    {menuOpen && <button className="admin-scrim" aria-label="ปิดเมนู" data-testid="button-admin-scrim" onClick={() => setMenuOpen(false)} />}
    <div className="admin-main">
      <header className="admin-topbar"><button className="admin-menu-toggle" data-testid="button-admin-menu" onClick={() => setMenuOpen(true)} aria-label="เปิดเมนู"><Menu size={21} /></button><div className="admin-breadcrumb"><span>โรงเรียนของเรา</span><ChevronRight size={14} /><strong>{active === 'inbox' ? 'กล่องข้อความ' : 'ข่าวสารและประกาศ'}</strong></div><div className="topbar-actions"><span className="secure-chip"><ShieldAlert size={14} /> พื้นที่ผู้ดูแล</span><Link href="/" className="view-site-link" data-testid="link-view-public">ดูหน้าเว็บไซต์ <ArrowRight size={14} /></Link></div></header>
      <div className="admin-content">{children}</div>
    </div>
  </div>;
}

function AccessDenied({ retry }: { retry?: () => void }) {
  return <div className="access-denied" data-testid="state-access-denied"><span className="denied-icon"><ShieldAlert size={27} /></span><span className="eyebrow">พื้นที่สำหรับผู้มีสิทธิ์เท่านั้น</span><h1>บัญชีนี้ยังไม่มีสิทธิ์ผู้ดูแล</h1><p>เราไม่สามารถเปิดข้อมูลผู้ดูแลของโรงเรียนได้ หากคุณคิดว่านี่เป็นข้อผิดพลาด โปรดติดต่อผู้ดูแลระบบ</p>{retry && <button className="button-secondary" data-testid="button-retry-access" onClick={retry}>ลองตรวจสอบอีกครั้ง</button>}<Link href="/" className="back-public-link" data-testid="link-back-public"><ArrowLeft size={16} /> กลับสู่หน้าเว็บไซต์</Link></div>;
}

function SignInRequired() {
  return <div className="auth-required" data-testid="state-admin-sign-in"><span className="login-icon green"><ShieldAlert size={25} /></span><span className="eyebrow">สำหรับบุคลากรโรงเรียน</span><h1>เข้าสู่ระบบเพื่อจัดการ</h1><p>ลงชื่อเข้าใช้บัญชีผู้ดูแลที่ได้รับอนุญาต เพื่อดูข้อความและประกาศของโรงเรียน</p><Link className="admin-primary-button" href="/sign-in" data-testid="link-admin-sign-in">เข้าสู่ระบบ <ArrowRight size={17} /></Link><Link href="/" className="back-public-link" data-testid="link-admin-back-home"><ArrowLeft size={16} /> กลับสู่หน้าเว็บไซต์</Link></div>;
}

function AdminInbox() {
  const { isLoaded, isSignedIn } = useAuth();
  const [, setLocation] = useLocation();
  const [topic, setTopic] = useState<TopicFilter>('all');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [mobileDetail, setMobileDetail] = useState(false);
  const summary = useGetAdminSummary({ query: { enabled: isLoaded && !!isSignedIn, queryKey: getGetAdminSummaryQueryKey(), staleTime: 0, refetchInterval: 15000 } });
  const inquiriesQuery = useListAdminInquiries({ query: { enabled: isLoaded && !!isSignedIn, queryKey: getListAdminInquiriesQueryKey(), staleTime: 0, refetchInterval: 15000 } });
  const updateStatus = useUpdateInquiryStatus();
  const [notice, setNotice] = useState('');
  const inquiries = inquiriesQuery.data ?? [];
  const visibleInquiries = useMemo(() => inquiries.filter((item) => {
    const matchesTopic = topic === 'all' || item.topic === topic;
    const matchesStatus = status === 'all' || item.status === status;
    const q = search.trim().toLocaleLowerCase();
    const matchesSearch = !q || `${item.fullName} ${item.contact} ${item.message ?? ''}`.toLocaleLowerCase().includes(q);
    return matchesTopic && matchesStatus && matchesSearch;
  }), [inquiries, topic, status, search]);
  const selected = visibleInquiries.find((item) => item.id === selectedId) ?? inquiries.find((item) => item.id === selectedId) ?? null;

  useEffect(() => { document.title = 'กล่องข้อความ | ผู้ดูแลโรงเรียน'; }, []);
  useEffect(() => {
    if (isLoaded && !isSignedIn) setLocation('/sign-in');
  }, [isLoaded, isSignedIn, setLocation]);

  const changeStatus = (item: Inquiry, nextStatus: InquiryStatus) => {
    if (item.status === nextStatus) return;
    setNotice('');
    updateStatus.mutate({ id: item.id, data: { status: nextStatus } }, {
      onSuccess: async () => {
        setNotice('อัปเดตสถานะเรียบร้อยแล้ว');
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: getListAdminInquiriesQueryKey() }),
          queryClient.invalidateQueries({ queryKey: getGetAdminSummaryQueryKey() }),
        ]);
      },
      onError: () => setNotice('บันทึกสถานะไม่สำเร็จ กรุณาลองอีกครั้ง'),
    });
  };

  if (!isLoaded) return <div className="admin-loading-screen"><LoadingAdmin /></div>;
  if (!isSignedIn) return <SignInRequired />;
  if ((summary.isError && [401, 403].includes(errorStatus(summary.error) ?? 0)) || (inquiriesQuery.isError && [401, 403].includes(errorStatus(inquiriesQuery.error) ?? 0))) return <AdminFrame active="inbox"><AccessDenied retry={() => { summary.refetch(); inquiriesQuery.refetch(); }} /></AdminFrame>;
  if (summary.isLoading || inquiriesQuery.isLoading) return <AdminFrame active="inbox"><LoadingAdmin /></AdminFrame>;
  if (summary.isError || inquiriesQuery.isError) return <AdminFrame active="inbox"><div className="admin-error-state" data-testid="state-inbox-error"><span><CircleHelp size={23} /></span><h2>โหลดกล่องข้อความไม่สำเร็จ</h2><p>ข้อมูลยังไม่พร้อมใช้งาน โปรดลองเชื่อมต่อใหม่อีกครั้ง</p><button className="admin-primary-button" data-testid="button-retry-inbox" onClick={() => { summary.refetch(); inquiriesQuery.refetch(); }}>ลองอีกครั้ง <ArrowRight size={16} /></button></div></AdminFrame>;

  return <AdminFrame active="inbox">
    <div className="admin-page-heading"><div><span className="eyebrow">SCHOOL INBOX</span><h1 data-testid="text-inbox-title">กล่องข้อความ</h1><p>ติดตามทุกคำถามและความสนใจจากผู้ปกครองในที่เดียว</p></div><div className="heading-date"><CalendarDays size={16} /><span>{new Intl.DateTimeFormat('th-TH', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}</span></div></div>
    <div className="overview-strip">
      <div className="overview-item overview-total"><span className="overview-icon"><Inbox size={18} /></span><span><small>ข้อความทั้งหมด</small><strong data-testid="value-total-inquiries">{summary.data?.totalInquiries ?? 0}</strong></span></div>
      <div className="overview-item"><span className="overview-dot new" /><span><small>รายการใหม่</small><strong data-testid="value-new-inquiries">{summary.data?.newInquiries ?? 0}</strong></span></div>
      <div className="overview-item"><span className="overview-dot progress" /><span><small>กำลังติดตาม</small><strong data-testid="value-in-progress-inquiries">{summary.data?.inProgressInquiries ?? 0}</strong></span></div>
      <div className="overview-item"><span className="overview-dot resolved" /><span><small>เรียบร้อยแล้ว</small><strong data-testid="value-resolved-inquiries">{summary.data?.resolvedInquiries ?? 0}</strong></span></div>
      <div className="overview-foot"><Sparkles size={15} /> ข้อมูลล่าสุดจากกล่องข้อความ</div>
    </div>
    <section className={`inbox-layout ${mobileDetail ? 'show-detail' : ''}`}>
      <div className="inbox-panel">
        <div className="inbox-panel-head"><div><h2>ข้อความที่ได้รับ</h2><span data-testid="text-visible-count">{visibleInquiries.length} รายการ</span></div><button className="refresh-button" data-testid="button-refresh-inquiries" onClick={() => { summary.refetch(); inquiriesQuery.refetch(); }} aria-label="รีเฟรชข้อความ"><Clock3 size={16} /></button></div>
        <div className="inbox-filters">
          <label className="filter-search"><Search size={16} /><input data-testid="input-inquiry-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหาชื่อหรือข้อความ" aria-label="ค้นหาข้อความ" /><button onClick={() => setSearch('')} aria-label="ล้างการค้นหา" data-testid="button-clear-search" className={search ? 'visible' : ''}><X size={15} /></button></label>
          <label className="filter-select"><Filter size={15} /><select data-testid="select-inquiry-topic-filter" value={topic} onChange={(e) => setTopic(e.target.value as TopicFilter)} aria-label="กรองตามหัวข้อ"><option value="all">ทุกหัวข้อ</option><option value="visit">เยี่ยมชม</option><option value="admission">สมัครเรียน</option><option value="3d">ชมแบบ 3D</option><option value="general">สอบถามทั่วไป</option></select><ChevronDown size={14} /></label>
          <div className="status-filter" role="group" aria-label="กรองตามสถานะ">{(['all', 'new', 'in_progress', 'resolved'] as StatusFilter[]).map((item) => <button key={item} className={status === item ? 'active' : ''} data-testid={`filter-status-${item}`} onClick={() => setStatus(item)}>{item === 'all' ? 'ทั้งหมด' : statusLabels[item]}</button>)}</div>
        </div>
        {notice && <div className={`inline-notice ${notice.includes('ไม่สำเร็จ') ? 'error' : ''}`} role="status" data-testid="text-inbox-notice">{notice}</div>}
        <div className="inquiry-list" data-testid="list-inquiries">
          {visibleInquiries.length ? visibleInquiries.map((item) => <button className={`inquiry-row ${selectedId === item.id ? 'selected' : ''}`} key={item.id} data-testid={`card-inquiry-${item.id}`} onClick={() => { setSelectedId(item.id); setMobileDetail(true); }}>
            <span className="inquiry-avatar">{initials(item.fullName)}</span><span className="inquiry-main"><span className="inquiry-line"><strong>{item.fullName}</strong>{item.status === 'new' && <i className="new-indicator" aria-label="ข้อความใหม่" />}</span><span className="inquiry-preview">{item.message || item.contact}</span><span className="inquiry-meta"><span className={`topic-label topic-${item.topic}`}>{topicLabels[item.topic]}</span><span className="inquiry-time">{relativeDate(item.createdAt)}</span></span></span><span className={`status-badge ${item.status}`}>{statusLabels[item.status]}</span><ChevronRight className="inquiry-chevron" size={17} />
          </button>) : <div className="empty-inbox" data-testid="state-inbox-empty"><span className="empty-inbox-icon"><Inbox size={22} /></span><h3>{inquiries.length ? 'ไม่พบข้อความที่ตรงกัน' : 'ยังไม่มีข้อความเข้ามา'}</h3><p>{inquiries.length ? 'ลองเปลี่ยนตัวกรองหรือคำค้นหา' : 'เมื่อมีผู้ปกครองติดต่อโรงเรียน ข้อความจะแสดงที่นี่'}</p>{(topic !== 'all' || status !== 'all' || search) && <button className="button-secondary" data-testid="button-clear-filters" onClick={() => { setTopic('all'); setStatus('all'); setSearch(''); }}>ล้างตัวกรอง</button>}</div>}
        </div>
      </div>
      <div className="inquiry-detail">
        {selected ? <><div className="detail-mobile-bar"><button data-testid="button-inquiry-back" onClick={() => setMobileDetail(false)}><ArrowLeft size={18} /> กลับรายการ</button><span>รายละเอียดข้อความ</span></div><div className="detail-topline"><span className={`topic-label topic-${selected.topic}`}>{topicLabels[selected.topic]}</span><span className={`status-badge ${selected.status}`}>{statusLabels[selected.status]}</span></div><h2 data-testid={`text-inquiry-name-${selected.id}`}>{selected.fullName}</h2><p className="detail-created"><CalendarDays size={15} /> ส่งเมื่อ {formatThaiDateTime(selected.createdAt)}</p><div className="detail-contact-card"><span className="contact-mark">{initials(selected.fullName)}</span><div><small>ช่องทางติดต่อกลับ</small><strong data-testid={`text-inquiry-contact-${selected.id}`}>{selected.contact}</strong></div><a href={contactHref(selected.contact)} target="_blank" rel="noreferrer" className="contact-action" data-testid={`link-contact-inquiry-${selected.id}`} aria-label="ติดต่อกลับ"><ArrowRight size={16} /></a></div><div className="detail-message"><div className="message-heading"><MessageCircle size={16} /><strong>ข้อความจากผู้ติดต่อ</strong></div><p data-testid={`text-inquiry-message-${selected.id}`}>{selected.message?.trim() || 'ผู้ติดต่อไม่ได้ระบุข้อความเพิ่มเติม'}</p></div><div className="detail-status-section"><span className="detail-label">จัดการสถานะ</span><p>เลือกสถานะที่ตรงกับการติดตามล่าสุด</p><div className="status-actions">{(['new', 'in_progress', 'resolved'] as InquiryStatus[]).map((next) => <button key={next} data-testid={`button-set-status-${next}-${selected.id}`} className={`status-action ${selected.status === next ? 'chosen' : ''} ${next}`} disabled={updateStatus.isPending} onClick={() => changeStatus(selected, next)}>{next === 'new' ? <Bell size={15} /> : next === 'in_progress' ? <Clock3 size={15} /> : <CheckCheck size={15} />}{statusLabels[next]}</button>)}</div>{updateStatus.isPending && <span className="saving-note">กำลังบันทึกสถานะ…</span>}</div><div className="detail-note"><ShieldAlert size={15} /><span>ข้อมูลนี้แสดงเฉพาะผู้ดูแลที่มีสิทธิ์เท่านั้น</span></div></> : <div className="detail-placeholder"><span><Inbox size={24} /></span><strong>เลือกข้อความเพื่อดูรายละเอียด</strong><p>แตะรายการทางซ้ายเพื่ออ่านและจัดการการติดตาม</p></div>}
      </div>
    </section>
  </AdminFrame>;
}

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0] ?? '').join('').toLocaleUpperCase() || 'ผ';
}

function relativeDate(value: string) {
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return '—';
  const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));
  if (minutes < 1) return 'เมื่อสักครู่';
  if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)} ชม.ที่แล้ว`;
  return formatThaiDate(value);
}

function contactHref(value: string) {
  const trimmed = value.trim();
  if (/^[+()\d\s-]{7,}$/.test(trimmed)) return `tel:${trimmed.replace(/[^\d+]/g, '')}`;
  if (trimmed.includes('@')) return `mailto:${trimmed}`;
  return `mailto:info@our-school.ac.th?subject=${encodeURIComponent('ติดต่อกลับผู้สนใจ')}`;
}

const blankAnnouncement: AnnouncementInput = { title: '', summary: '', category: 'ประกาศ', published: false };

function AnnouncementManager() {
  const { isLoaded, isSignedIn } = useAuth();
  const [, setLocation] = useLocation();
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [form, setForm] = useState<AnnouncementInput>(blankAnnouncement);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [scope, setScope] = useState<'all' | 'published' | 'draft'>('all');
  const announcementsQuery = useListAdminAnnouncements({ query: { enabled: isLoaded && !!isSignedIn, queryKey: getListAdminAnnouncementsQueryKey(), staleTime: 0 } });
  const createAnnouncement = useCreateAnnouncement();
  const updateAnnouncement = useUpdateAnnouncement();
  const deleteAnnouncement = useDeleteAnnouncement();
  const items = announcementsQuery.data ?? [];
  const visibleItems = items.filter((item) => scope === 'all' || (scope === 'published' ? item.published : !item.published));

  useEffect(() => { document.title = 'ข่าวสารและประกาศ | ผู้ดูแลโรงเรียน'; }, []);
  useEffect(() => {
    if (isLoaded && !isSignedIn) setLocation('/sign-in');
  }, [isLoaded, isSignedIn, setLocation]);

  const openCreate = () => { setEditing(null); setForm({ ...blankAnnouncement }); setNotice(''); setDialogOpen(true); };
  const openEdit = (item: Announcement) => { setEditing(item); setForm({ title: item.title, summary: item.summary, category: item.category, published: item.published }); setNotice(''); setDialogOpen(true); };
  const save = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice('');
    const onSuccess = async () => {
      setDialogOpen(false);
      setNotice(editing ? 'บันทึกการแก้ไขเรียบร้อยแล้ว' : 'สร้างประกาศเรียบร้อยแล้ว');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: getListAdminAnnouncementsQueryKey() }),
        queryClient.invalidateQueries({ queryKey: getListPublicAnnouncementsQueryKey() }),
      ]);
    };
    if (editing) updateAnnouncement.mutate({ id: editing.id, data: form }, { onSuccess, onError: () => setNotice('บันทึกไม่สำเร็จ กรุณาลองอีกครั้ง') });
    else createAnnouncement.mutate({ data: form }, { onSuccess, onError: () => setNotice('สร้างประกาศไม่สำเร็จ กรุณาลองอีกครั้ง') });
  };
  const togglePublish = (item: Announcement) => {
    updateAnnouncement.mutate({ id: item.id, data: { title: item.title, summary: item.summary, category: item.category, published: !item.published } }, {
      onSuccess: async () => {
        setNotice(item.published ? 'ยกเลิกการเผยแพร่แล้ว' : 'เผยแพร่ประกาศแล้ว');
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: getListAdminAnnouncementsQueryKey() }),
          queryClient.invalidateQueries({ queryKey: getListPublicAnnouncementsQueryKey() }),
        ]);
      },
      onError: () => setNotice('เปลี่ยนสถานะการเผยแพร่ไม่สำเร็จ'),
    });
  };
  const remove = (item: Announcement) => {
    if (!window.confirm(`ลบประกาศ “${item.title}” ใช่หรือไม่? การลบนี้ไม่สามารถย้อนกลับได้`)) return;
    deleteAnnouncement.mutate({ id: item.id }, {
      onSuccess: async () => {
        setNotice('ลบประกาศเรียบร้อยแล้ว');
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: getListAdminAnnouncementsQueryKey() }),
          queryClient.invalidateQueries({ queryKey: getListPublicAnnouncementsQueryKey() }),
        ]);
      },
      onError: () => setNotice('ลบประกาศไม่สำเร็จ กรุณาลองอีกครั้ง'),
    });
  };
  const busy = createAnnouncement.isPending || updateAnnouncement.isPending;

  if (!isLoaded) return <div className="admin-loading-screen"><LoadingAdmin /></div>;
  if (!isSignedIn) return <SignInRequired />;
  if (announcementsQuery.isError && [401, 403].includes(errorStatus(announcementsQuery.error) ?? 0)) return <AdminFrame active="announcements"><AccessDenied retry={() => announcementsQuery.refetch()} /></AdminFrame>;
  if (announcementsQuery.isLoading) return <AdminFrame active="announcements"><LoadingAdmin /></AdminFrame>;
  if (announcementsQuery.isError) return <AdminFrame active="announcements"><div className="admin-error-state" data-testid="state-announcements-error"><span><CircleHelp size={23} /></span><h2>โหลดประกาศไม่สำเร็จ</h2><p>กรุณาตรวจสอบการเชื่อมต่อแล้วลองอีกครั้ง</p><button className="admin-primary-button" data-testid="button-retry-announcements" onClick={() => announcementsQuery.refetch()}>ลองอีกครั้ง <ArrowRight size={16} /></button></div></AdminFrame>;

  return <AdminFrame active="announcements">
    <div className="admin-page-heading"><div><span className="eyebrow">SCHOOL UPDATES</span><h1 data-testid="text-announcements-title">ข่าวสารและประกาศ</h1><p>เขียนข่าวสารให้ชุมชนโรงเรียนรับรู้ และเลือกเวลาเผยแพร่ได้ตามต้องการ</p></div><button className="admin-primary-button add-announcement" data-testid="button-create-announcement" onClick={openCreate}><Plus size={18} /> สร้างประกาศ</button></div>
    {notice && <div className={`manager-notice ${notice.includes('ไม่สำเร็จ') ? 'error' : ''}`} role="status" data-testid="text-announcement-notice">{notice}<button onClick={() => setNotice('')} aria-label="ปิดข้อความแจ้งเตือน" data-testid="button-dismiss-notice"><X size={15} /></button></div>}
    <div className="announcement-toolbar"><div className="announcement-stats"><span><strong>{items.length}</strong> ประกาศทั้งหมด</span><span><i className="published-key" />เผยแพร่ {items.filter((item) => item.published).length}</span><span><i className="draft-key" />ฉบับร่าง {items.filter((item) => !item.published).length}</span></div><div className="announcement-tabs" role="group" aria-label="กรองประกาศ">{([{ key: 'all', label: 'ทั้งหมด' }, { key: 'published', label: 'เผยแพร่แล้ว' }, { key: 'draft', label: 'ฉบับร่าง' }] as const).map((item) => <button className={scope === item.key ? 'active' : ''} key={item.key} data-testid={`filter-announcements-${item.key}`} onClick={() => setScope(item.key)}>{item.label}</button>)}</div></div>
    {visibleItems.length ? <div className="announcement-list" data-testid="list-announcements">{visibleItems.map((item) => <article className="announcement-item" data-testid={`card-announcement-${item.id}`} key={item.id}><div className={`announcement-symbol ${item.published ? 'live' : 'draft'}`}><FileText size={20} /></div><div className="announcement-copy"><div className="announcement-item-meta"><span className={`publish-status ${item.published ? 'published' : 'draft'}`}><i />{item.published ? 'เผยแพร่แล้ว' : 'ฉบับร่าง'}</span><span className="announcement-category">{item.category}</span><span className="announcement-date">{formatThaiDate(item.createdAt)}</span></div><h2>{item.title}</h2><p>{item.summary}</p></div><div className="announcement-actions"><button className="announce-edit" data-testid={`button-edit-announcement-${item.id}`} onClick={() => openEdit(item)}><FileText size={15} /> แก้ไข</button><button className={`announce-publish ${item.published ? 'is-published' : ''}`} data-testid={`button-toggle-publish-${item.id}`} disabled={updateAnnouncement.isPending} onClick={() => togglePublish(item)}>{item.published ? <><Check size={15} /> เผยแพร่แล้ว</> : <><Send size={15} /> เผยแพร่</>}</button><button className="announce-delete" data-testid={`button-delete-announcement-${item.id}`} disabled={deleteAnnouncement.isPending} onClick={() => remove(item)} aria-label={`ลบประกาศ ${item.title}`}><X size={16} /></button></div></article>)}</div> : <div className="announcement-empty" data-testid="state-announcements-empty"><span><FileText size={24} /></span><h2>{items.length ? 'ไม่มีประกาศในหมวดนี้' : 'ยังไม่มีประกาศ'}</h2><p>{items.length ? 'ลองเลือกตัวกรองอื่นเพื่อดูรายการทั้งหมด' : 'เริ่มแบ่งปันข่าวสาร กิจกรรม หรือประกาศสำคัญของโรงเรียน'}</p>{!items.length && <button className="admin-primary-button" data-testid="button-empty-create-announcement" onClick={openCreate}><Plus size={17} /> สร้างประกาศแรก</button>}</div>}
    {(createAnnouncement.isError || updateAnnouncement.isError || deleteAnnouncement.isError) && <p className="form-error" role="alert" data-testid="text-announcement-error">เกิดข้อผิดพลาดในการบันทึก โปรดลองอีกครั้ง</p>}
    {dialogOpen && <div className="modal-backdrop admin-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) setDialogOpen(false); }}><div className="announcement-modal" role="dialog" aria-modal="true" aria-labelledby="announcement-form-title"><div className="announcement-modal-head"><span className="announcement-modal-icon"><FileText size={21} /></span><div><span className="eyebrow">SCHOOL UPDATE</span><h2 id="announcement-form-title">{editing ? 'แก้ไขประกาศ' : 'สร้างประกาศใหม่'}</h2></div><button className="icon-close focus-ring" data-testid="button-close-announcement-form" onClick={() => setDialogOpen(false)} aria-label="ปิดแบบฟอร์ม"><X size={18} /></button></div><p className="announcement-modal-intro">ข้อมูลจะปรากฏบนหน้าเว็บไซต์เมื่อคุณเลือกเผยแพร่</p><form data-testid="form-announcement" onSubmit={save}><label htmlFor="announcement-title">หัวข้อประกาศ<input id="announcement-title" data-testid="input-announcement-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required minLength={2} maxLength={180} placeholder="เช่น กำหนดการรับสมัครนักเรียน" /></label><div className="form-two-col"><label htmlFor="announcement-category">หมวดหมู่<input id="announcement-category" data-testid="input-announcement-category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required minLength={2} maxLength={80} placeholder="ประกาศ" /></label><label className="publish-toggle-label" htmlFor="announcement-published"><span>เผยแพร่ทันที</span><small>ประกาศจะแสดงบนหน้าแรก</small><input id="announcement-published" data-testid="checkbox-announcement-published" type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} /><span className="toggle-track" /></label></div><label htmlFor="announcement-summary">เนื้อหาประกาศ<textarea id="announcement-summary" data-testid="input-announcement-summary" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} required minLength={2} maxLength={2000} rows={5} placeholder="เขียนรายละเอียดที่ผู้ปกครองและนักเรียนควรทราบ" /></label>{(createAnnouncement.isError || updateAnnouncement.isError) && <p className="form-error" role="alert">บันทึกไม่สำเร็จ กรุณาลองอีกครั้ง</p>}<div className="announcement-form-actions"><button type="button" className="button-secondary" data-testid="button-cancel-announcement" disabled={busy} onClick={() => setDialogOpen(false)}>ยกเลิก</button><button type="submit" className="admin-primary-button" data-testid="button-save-announcement" disabled={busy}>{busy ? 'กำลังบันทึก…' : editing ? 'บันทึกการแก้ไข' : 'บันทึกประกาศ'} <ArrowRight size={16} /></button></div></form></div></div>}
  </AdminFrame>;
}

function NotFound() {
  return <main className="not-found" data-testid="state-not-found"><Logo /><span className="eyebrow">404 / NOT HERE</span><h1>ไม่พบหน้าที่คุณกำลังมองหา</h1><p>ลองกลับไปยังหน้าเว็บไซต์หลักของโรงเรียน</p><Link href="/" className="admin-primary-button" data-testid="link-not-found-home">กลับสู่หน้าแรก <ArrowRight size={16} /></Link></main>;
}

function SignInPage() {
  return <div className="clerk-page"><div className="clerk-backdrop"><div className="clerk-brand-story"><Link href="/" data-testid="link-auth-home"><Logo /></Link><span className="eyebrow">OUR SCHOOL · STAFF PORTAL</span><h1>ดูแลทุกการติดต่อ<br /><em>ด้วยความใส่ใจ</em></h1><p>พื้นที่ทำงานสำหรับทีมโรงเรียน จัดการข้อความและแบ่งปันข่าวสารกับชุมชนของเรา</p><div className="auth-trust-note"><ShieldAlert size={16} /> ข้อมูลผู้ติดต่อของคุณปลอดภัย</div></div><div className="clerk-form-wrap"><SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} /></div></div></div>;
}

function SignUpPage() {
  return <div className="clerk-page"><div className="clerk-backdrop"><div className="clerk-brand-story"><Link href="/" data-testid="link-auth-home"><Logo /></Link><span className="eyebrow">OUR SCHOOL · STAFF PORTAL</span><h1>ร่วมดูแล<br /><em>ชุมชนโรงเรียน</em></h1><p>สร้างบัญชีเพื่อเข้าถึงพื้นที่จัดการงานของโรงเรียน การให้สิทธิ์ผู้ดูแลจะถูกตรวจสอบแยกต่างหาก</p><div className="auth-trust-note"><ShieldAlert size={16} /> การสร้างบัญชีไม่ได้ให้สิทธิ์ผู้ดูแลโดยอัตโนมัติ</div></div><div className="clerk-form-wrap"><SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} /></div></div></div>;
}

function ClerkCacheInvalidator() {
  const { addListener } = useClerk();
  const client = useQueryClient();
  useEffect(() => {
    let prior: string | null | undefined;
    return addListener(({ user }) => {
      const next = user?.id ?? null;
      if (prior !== undefined && prior !== next) client.clear();
      prior = next;
    });
  }, [addListener, client]);
  return null;
}

function AppRoutes() {
  const [, setLocation] = useLocation();
  return <ClerkProvider
    publishableKey={clerkPubKey}
    proxyUrl={clerkProxyUrl}
    appearance={clerkAppearance}
    signInUrl={`${basePath}/sign-in`}
    signUpUrl={`${basePath}/sign-up`}
    localization={{
      signIn: { start: { title: 'ยินดีต้อนรับกลับ', subtitle: 'เข้าสู่ระบบพื้นที่ผู้ดูแลโรงเรียน' } },
      signUp: { start: { title: 'สร้างบัญชีโรงเรียน', subtitle: 'สมัครเพื่อขอเข้าใช้งานพื้นที่โรงเรียน' } },
    }}
    routerPush={(to) => setLocation(stripBase(to))}
    routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
  >
    <ClerkCacheInvalidator />
    <Switch>
      <Route path="/" component={PublicHome} />
      <Route path="/admin" component={AdminInbox} />
      <Route path="/admin/announcements" component={AnnouncementManager} />
      <Route path="/sign-in/*?" component={SignInPage} />
      <Route path="/sign-up/*?" component={SignUpPage} />
      <Route component={NotFound} />
    </Switch>
  </ClerkProvider>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><ErrorBoundary><WouterRouter base={basePath}><AppRoutes /></WouterRouter><Toaster /></ErrorBoundary></TooltipProvider></QueryClientProvider>;
}

export default App;