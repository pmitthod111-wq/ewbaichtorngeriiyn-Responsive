import { useEffect, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  ArrowRight,
  Bell,
  Building2,
  ChevronDown,
  ChevronUp,
  CircleUserRound,
  DoorOpen,
  Facebook,
  Instagram,
  Layers3,
  MapPin,
  Menu,
  MessageCircle,
  Move3d,
  Search,
  Send,
  UsersRound,
  X,
  Youtube,
} from 'lucide-react';

const queryClient = new QueryClient();

type NewsItem = {
  id: string;
  date: string;
  title: string;
  detail: string;
  category: string;
};

const stats = [
  { value: '6', label: 'อาคารเรียน', icon: Building2, tone: 'orange' },
  { value: '128', label: 'ห้องเรียน', icon: DoorOpen, tone: 'green' },
  { value: '15', label: 'สถานที่สำคัญ', icon: MapPin, tone: 'orange' },
  { value: '2,345', label: 'นักเรียนทั้งหมด', icon: UsersRound, tone: 'green' },
];

const features = [
  {
    id: 'buildings',
    title: 'อาคารเรียน',
    description: 'ดูข้อมูลอาคารเรียนแต่ละอาคาร ชั้น และห้องเรียน',
    icon: Building2,
    accent: 'orange',
    action: 'ดูอาคารเรียน',
  },
  {
    id: 'places',
    title: 'สถานที่',
    description: 'ค้นหาสนาม ห้องอาหาร ห้องสมุด และสถานที่สำคัญ',
    icon: MapPin,
    accent: 'green',
    action: 'ดูสถานที่',
  },
  {
    id: 'plans',
    title: 'แผนผังโรงเรียน',
    description: 'สำรวจเส้นทางและตำแหน่งอาคารภายในโรงเรียน',
    icon: Layers3,
    accent: 'orange',
    action: 'ดูแผนผัง',
  },
  {
    id: 'search',
    title: 'ค้นหา',
    description: 'ค้นหาอาคาร ห้องเรียน หรือสถานที่ที่คุณต้องการ',
    icon: Search,
    accent: 'green',
    action: 'เริ่มค้นหา',
  },
];

const news: NewsItem[] = [
  {
    id: 'admission',
    date: '10 มิ.ย. 2567',
    category: 'ประกาศ',
    title: 'ประกาศวันหยุดพิเศษประจำเดือนมิถุนายน',
    detail: 'โรงเรียนของเราประกาศหยุดเรียนในวันศุกร์ที่ 21 มิถุนายน 2567 และเปิดเรียนตามปกติในวันจันทร์ที่ 24 มิถุนายน',
  },
  {
    id: 'sports',
    date: '8 มิ.ย. 2567',
    category: 'กิจกรรม',
    title: 'กิจกรรมกีฬาสีประจำปีการศึกษา 2567',
    detail: 'ขอเชิญนักเรียนและผู้ปกครองร่วมส่งกำลังใจให้กับนักกีฬา ในวันที่ 25–26 กรกฎาคม 2567 ณ สนามกีฬาโรงเรียน',
  },
  {
    id: 'registration',
    date: '1 มิ.ย. 2567',
    category: 'รับสมัคร',
    title: 'ประกาศรับสมัครนักเรียนระดับชั้น ม.1 และ ม.4',
    detail: 'เปิดรับสมัครตั้งแต่วันที่ 1–30 พฤศจิกายน 2567 สามารถติดต่อฝ่ายวิชาการเพื่อขอรายละเอียดและคู่มือการสมัครได้',
  },
];

function Logo() {
  return (
    <div className="brand-lockup" data-testid="text-school-brand">
      <span className="brand-mark" aria-hidden="true">
        <span className="brand-roof" />
        <span className="brand-shield">ร</span>
      </span>
      <span className="brand-words">
        <strong>โรงเรียนของเรา</strong>
        <small>มุ่งมั่น พัฒนา ร่วมกัน</small>
      </span>
    </div>
  );
}

function AppContent() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [interestOpen, setInterestOpen] = useState(false);
  const [interestSent, setInterestSent] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeNews, setActiveNews] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = 'โรงเรียนของเรา | ระบบแนะนำและสำรวจโรงเรียน';
  }, []);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openSearch = () => {
    setSearchOpen(true);
    window.setTimeout(() => searchRef.current?.focus(), 80);
  };

  const handleFeature = (id: string) => {
    if (id === 'search') {
      openSearch();
      return;
    }
    scrollTo(id === 'plans' ? 'campus-map' : 'explore-detail');
  };

  const filteredNews = news.filter((item) => `${item.title} ${item.category}`.includes(query.trim()));

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="container page-header">
          <button data-testid="button-brand" className="brand-button focus-ring" onClick={() => scrollTo('top')} aria-label="กลับสู่หน้าแรก">
            <Logo />
          </button>
          <nav className="desktop-nav" aria-label="เมนูหลัก">
            <button data-testid="link-home" className="nav-link active" onClick={() => scrollTo('top')}>หน้าหลัก</button>
            <button data-testid="link-buildings" className="nav-link" onClick={() => scrollTo('explore-detail')}>อาคารเรียน</button>
            <button data-testid="link-places" className="nav-link" onClick={() => scrollTo('campus-map')}>สถานที่</button>
            <button data-testid="link-plans" className="nav-link" onClick={() => scrollTo('campus-map')}>แผนผังโรงเรียน</button>
            <button data-testid="button-header-search" className="nav-link" onClick={openSearch}>ค้นหา</button>
          </nav>
          <button data-testid="button-login" className="login-button focus-ring" onClick={() => setLoginOpen(true)}>
            <CircleUserRound size={16} /> เข้าสู่ระบบ
          </button>
          <button data-testid="button-mobile-menu" className="mobile-menu-button focus-ring" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? 'ปิดเมนู' : 'เปิดเมนู'} aria-expanded={menuOpen}>
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
        {menuOpen && (
          <div className="mobile-panel">
            <button data-testid="mobile-link-home" onClick={() => scrollTo('top')}>หน้าหลัก <ArrowRight size={16} /></button>
            <button data-testid="mobile-link-buildings" onClick={() => scrollTo('explore-detail')}>อาคารเรียน <ArrowRight size={16} /></button>
            <button data-testid="mobile-link-places" onClick={() => scrollTo('campus-map')}>สถานที่ <ArrowRight size={16} /></button>
            <button data-testid="mobile-link-plans" onClick={() => scrollTo('campus-map')}>แผนผังโรงเรียน <ArrowRight size={16} /></button>
            <button data-testid="mobile-link-search" onClick={openSearch}>ค้นหา <Search size={16} /></button>
            <button data-testid="mobile-link-login" onClick={() => { setMenuOpen(false); setLoginOpen(true); }}>เข้าสู่ระบบ <CircleUserRound size={16} /></button>
          </div>
        )}
      </header>

      <main id="top">
        <section className="hero-section">
          <div className="hero-color-wash" aria-hidden="true" />
          <div className="container hero-grid">
            <div className="hero-copy">
              <p className="hero-kicker"><span /> ระบบแนะนำและสำรวจโรงเรียน</p>
              <h1 data-testid="text-hero-title">ค้นหาและสำรวจ<br /><em>โรงเรียนในฝัน</em></h1>
              <p className="hero-description">ค้นหาอาคาร ห้องเรียน และสถานที่ต่าง ๆ ภายในโรงเรียน<br className="desktop-only" /> ได้อย่างง่ายดาย ครบ จบในที่เดียว</p>
              <div className="hero-search">
                <Search size={19} aria-hidden="true" />
                <input data-testid="input-hero-search" ref={searchRef} value={query} onChange={(event) => setQuery(event.target.value)} onFocus={() => setSearchOpen(true)} placeholder="ค้นหาอาคาร ห้องเรียน หรือสถานที่..." aria-label="ค้นหาอาคาร ห้องเรียน หรือสถานที่" />
                <button data-testid="button-hero-search" className="hero-search-submit focus-ring" onClick={openSearch} aria-label="เปิดผลการค้นหา"><ArrowRight size={18} /></button>
              </div>
              <button data-testid="button-explore-campus" className="primary-button focus-ring" onClick={() => scrollTo('explore-detail')}><MapPin size={17} /> สำรวจโรงเรียน <ArrowRight size={17} /></button>
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
            {stats.map(({ value, label, icon: Icon, tone }) => (
              <div data-testid={`stat-${label}`} className="stat-item" key={label}>
                <span className={`stat-icon ${tone}`}><Icon size={22} /></span>
                <span><strong>{value}</strong><small>{label}</small></span>
              </div>
            ))}
          </div>
        </section>

        <section id="explore-detail" className="explore-section section-anchor">
          <div className="container">
            <div className="section-heading centered">
              <span className="section-label">EXPLORE SCHOOL</span>
              <h2 data-testid="text-explore-title">เลือกสิ่งที่คุณต้องการค้นหา</h2>
              <span className="heading-rule" />
              <p>ทุกข้อมูลที่คุณกำลังมองหาเกี่ยวกับโรงเรียน<br className="desktop-only" /> อยู่ที่นี่แล้ว</p>
            </div>
            <div className="feature-grid">
              {features.map(({ id, title, description, icon: Icon, accent, action }) => (
                <button data-testid={`card-feature-${id}`} className={`feature-card ${accent}`} key={id} onClick={() => handleFeature(id)}>
                  <span className="feature-icon"><Icon size={31} strokeWidth={1.8} /></span>
                  <span className="feature-title">{title}</span>
                  <span className="feature-description">{description}</span>
                  <span className="feature-action">{action} <ArrowRight size={16} /></span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section id="campus-map" className="campus-section section-anchor">
          <div className="container campus-grid">
            <div className="map-card">
              <div className="map-card-copy">
                <span className="mini-label">EXPLORE IN 3D</span>
                <h2>สำรวจโรงเรียน<br /><em>ในรูปแบบ 3D</em></h2>
                <p>ชมพื้นที่ภายในโรงเรียนแบบเสมือนจริง พร้อมดูรายละเอียดอาคารและสถานที่ต่าง ๆ ได้ทุกที่ทุกเวลา</p>
                <button data-testid="button-open-3d" className="small-green-button focus-ring" onClick={() => setInterestOpen(true)}><Move3d size={16} /> ดูตัวอย่าง 3D <ArrowRight size={15} /></button>
              </div>
              <div className="map-illustration" aria-label="ภาพจำลองแผนผังโรงเรียน">
                <img src="/campus-hero.png" alt="" />
                <div className="map-grid-overlay" />
                <span className="map-pin pin-one"><MapPin size={20} /></span>
                <span className="map-pin pin-two"><MapPin size={20} /></span>
                <span className="map-3d-badge">3D</span>
              </div>
            </div>
            <div className="news-card">
              <div className="news-card-heading"><div><span className="mini-label">LATEST UPDATE</span><h2>ข่าวสารและประกาศ</h2></div><button data-testid="button-all-news" className="text-button" onClick={() => setActiveNews(activeNews ? null : news[0].id)}>ดูทั้งหมด</button></div>
              <div className="news-list">
                {news.map((item) => (
                  <div className="news-row" data-testid={`row-news-${item.id}`} key={item.id}>
                    <button data-testid={`button-news-${item.id}`} className="news-row-button" onClick={() => setActiveNews(activeNews === item.id ? null : item.id)} aria-expanded={activeNews === item.id}>
                      <span className="news-bell"><Bell size={16} /></span>
                      <span className="news-row-copy"><strong>{item.title}</strong><small>{item.category}</small></span>
                      <span className="news-date">{item.date}</span>
                      {activeNews === item.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {activeNews === item.id && <p className="news-detail" data-testid={`text-news-detail-${item.id}`}>{item.detail}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="interest-section">
          <div className="container interest-inner">
            <div><span className="section-label">STAY CONNECTED</span><h2>อยากรู้จักโรงเรียน<br /><em>ของเราให้มากขึ้น?</em></h2><p>ฝากข้อมูลความสนใจไว้ เราจะติดต่อกลับพร้อมข้อมูลที่เหมาะกับคุณ</p></div>
            <button data-testid="button-interest" className="white-button focus-ring" onClick={() => setInterestOpen(true)}>ลงทะเบียนความสนใจ <ArrowRight size={17} /></button>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div className="footer-brand"><Logo /><p>แหล่งรวมข้อมูลโรงเรียน<br />เพื่อการค้นพบที่ง่ายขึ้น</p><div className="social-links"><a data-testid="link-facebook" href="https://facebook.com" aria-label="Facebook"><Facebook size={17} /></a><a data-testid="link-instagram" href="https://instagram.com" aria-label="Instagram"><Instagram size={17} /></a><a data-testid="link-youtube" href="https://youtube.com" aria-label="Youtube"><Youtube size={17} /></a></div></div>
          <div className="footer-column"><h3>เมนูหลัก</h3><button data-testid="footer-link-home" onClick={() => scrollTo('top')}>หน้าหลัก</button><button data-testid="footer-link-buildings" onClick={() => scrollTo('explore-detail')}>อาคารเรียน</button><button data-testid="footer-link-places" onClick={() => scrollTo('campus-map')}>สถานที่</button><button data-testid="footer-link-plans" onClick={() => scrollTo('campus-map')}>แผนผังโรงเรียน</button></div>
          <div className="footer-column"><h3>ข้อมูลโรงเรียน</h3><button data-testid="footer-link-about" onClick={() => setInterestOpen(true)}>เกี่ยวกับโรงเรียน</button><button data-testid="footer-link-contact" onClick={() => setInterestOpen(true)}>ติดต่อเรา</button><button data-testid="footer-link-help" onClick={() => setLoginOpen(true)}>ช่วยเหลือ</button></div>
          <div className="footer-column footer-contact"><h3>ติดต่อเรา</h3><p><MapPin size={15} /> 123 หมู่ 1 ตำบลทุ่งสุข<br />อำเภอเมือง จังหวัดเชียงใหม่</p><p><MessageCircle size={15} /> 02-123-4567</p><p><Send size={15} /> info@our-school.ac.th</p></div>
        </div>
        <div className="container footer-bottom"><span>© 2024 โรงเรียนของเรา สงวนลิขสิทธิ์</span><span>สร้างพื้นที่เพื่อการค้นพบและการเรียนรู้</span></div>
      </footer>

      {searchOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSearchOpen(false); }}>
          <div className="search-modal" role="dialog" aria-modal="true" aria-labelledby="search-title">
            <div className="modal-top"><span className="section-label">SEARCH SCHOOL</span><button data-testid="button-close-search" className="icon-close focus-ring" onClick={() => setSearchOpen(false)} aria-label="ปิดการค้นหา"><X size={19} /></button></div>
            <h2 id="search-title">ค้นหาข้อมูลโรงเรียน</h2>
            <div className="modal-search"><Search size={18} /><input data-testid="input-search-modal" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="พิมพ์คำค้นหา เช่น อาคาร 1 ห้องสมุด" autoFocus /></div>
            {query.trim() ? <div className="search-results">{filteredNews.length ? filteredNews.map((item) => <button data-testid={`result-search-${item.id}`} key={item.id} onClick={() => { setSearchOpen(false); setActiveNews(item.id); scrollTo('campus-map'); }}><Bell size={16} /><span>{item.title}<small>{item.category}</small></span><ArrowRight size={16} /></button>) : <p className="empty-search">ไม่พบข้อมูลที่ตรงกัน ลองค้นหาด้วยคำอื่น</p>}</div> : <p className="search-hint">ลองค้นหา “ห้องสมุด”, “อาคารเรียน” หรือ “สนามกีฬา”</p>}
          </div>
        </div>
      )}

      {loginOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setLoginOpen(false); }}>
          <div className="login-modal" role="dialog" aria-modal="true" aria-labelledby="login-title">
            <button data-testid="button-close-login" className="icon-close focus-ring" onClick={() => setLoginOpen(false)} aria-label="ปิดหน้าต่างเข้าสู่ระบบ"><X size={19} /></button>
            <span className="login-icon"><CircleUserRound size={26} /></span><h2 id="login-title">เข้าสู่ระบบ</h2><p>สำหรับนักเรียน ผู้ปกครอง และบุคลากรของโรงเรียน</p>
            <button data-testid="button-login-student" className="modal-primary-button" onClick={() => setLoginOpen(false)}>เข้าสู่ระบบโรงเรียน <ArrowRight size={17} /></button>
            <button data-testid="button-login-help" className="modal-secondary-button" onClick={() => { setLoginOpen(false); setInterestOpen(true); }}>ขอความช่วยเหลือ</button>
          </div>
        </div>
      )}

      {interestOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setInterestOpen(false); }}>
          <div className="interest-modal" role="dialog" aria-modal="true" aria-labelledby="interest-title">
            <button data-testid="button-close-interest" className="icon-close focus-ring" onClick={() => setInterestOpen(false)} aria-label="ปิดแบบฟอร์ม"><X size={19} /></button>
            {!interestSent ? <><span className="login-icon green"><MessageCircle size={25} /></span><h2 id="interest-title">ลงทะเบียนความสนใจ</h2><p>กรอกข้อมูลสั้น ๆ ให้ทีมโรงเรียนติดต่อกลับ</p><form data-testid="form-interest" onSubmit={(event) => { event.preventDefault(); setInterestSent(true); }}><label>ชื่อผู้ติดต่อ<input data-testid="input-interest-name" required placeholder="ชื่อ - นามสกุล" /></label><label>อีเมลหรือเบอร์โทรศัพท์<input data-testid="input-interest-contact" required placeholder="สำหรับติดต่อกลับ" /></label><label>เรื่องที่สนใจ<select data-testid="select-interest-topic" defaultValue="visit"><option value="visit">นัดเยี่ยมชมโรงเรียน</option><option value="admission">ข้อมูลการสมัครเรียน</option><option value="3d">ชมโรงเรียนรูปแบบ 3D</option></select></label><button data-testid="button-submit-interest" className="modal-primary-button" type="submit">ส่งข้อมูลความสนใจ <Send size={16} /></button></form></> : <div className="success-state"><span className="success-check">✓</span><h2>ขอบคุณที่สนใจโรงเรียนของเรา</h2><p>ทีมงานจะติดต่อกลับภายใน 1–2 วันทำการ</p><button data-testid="button-close-success" className="modal-primary-button" onClick={() => { setInterestOpen(false); setInterestSent(false); }}>เรียบร้อย</button></div>}
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ErrorBoundary>
          <AppContent />
          <Toaster />
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;