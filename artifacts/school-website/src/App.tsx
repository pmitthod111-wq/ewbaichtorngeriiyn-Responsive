import { type ReactNode, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  Clock3,
  Facebook,
  GraduationCap,
  Instagram,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Quote,
  Search,
  Sparkles,
  Star,
  Users,
  X,
  Youtube,
} from 'lucide-react';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

const news = [
  {
    id: 'news-01',
    date: '12 มิ.ย. 2567',
    category: 'ข่าวโรงเรียน',
    title: 'เปิดบ้านศรีวัฒน์ 2024 — ห้องเรียนที่อยากชวนคุณมาค้นพบ',
    text: 'ชวนครอบครัวมาสัมผัสการเรียนรู้จริง พบครู นักเรียน และผลงานจากทุกกลุ่มสาระ',
    image: 'https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=1200',
  },
  {
    id: 'news-02',
    date: '05 มิ.ย. 2567',
    category: 'ผลงานนักเรียน',
    title: 'ทีมดาวเหนือคว้ารางวัลออกแบบเมืองยั่งยืนระดับประเทศ',
    text: 'จากโจทย์ขยะริมคลอง สู่ต้นแบบเมืองเล็กที่ใช้ได้จริง โดยทีม ม.5 ของเรา',
    image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=900',
  },
  {
    id: 'news-03',
    date: '28 พ.ค. 2567',
    category: 'ชุมชนศรีวัฒน์',
    title: 'สวนครัวริมรั้วกลับมาแล้ว พร้อมอาสาสมัครกว่า 120 ครอบครัว',
    text: 'พื้นที่เล็ก ๆ ที่ทำให้เด็ก ๆ รู้ว่าความรู้เปลี่ยนแปลงชุมชนได้อย่างไร',
    image: 'https://images.pexels.com/photos/1595104/pexels-photo-1595104.jpeg?auto=compress&cs=tinysrgb&w=900',
  },
];

const programs = [
  {
    id: 'core',
    label: 'แกนกลาง',
    title: 'เรียนรู้ให้ลึก\nคิดให้ไกล',
    description: 'วิชาพื้นฐานที่ไม่หยุดอยู่แค่ในตำรา เราออกแบบโจทย์ให้เด็กเชื่อมโยงคณิตศาสตร์ วิทยาศาสตร์ ภาษา และสังคมเข้ากับโลกจริง',
    details: ['ห้องเรียนแบบโครงงาน', 'ครูที่ปรึกษารายบุคคล', 'ห้องทดลองและสตูดิโอสร้างสรรค์'],
    color: 'bg-[#e4efe9]',
  },
  {
    id: 'global',
    label: 'นานาชาติ',
    title: 'รู้จักโลก\nโดยไม่ทิ้งราก',
    description: 'ภาษาและวัฒนธรรมเปิดประตูให้เด็กกล้าสื่อสารกับโลก พร้อมเข้าใจบ้านเกิดของตัวเองอย่างมีความหมาย',
    details: ['English for real life', 'แลกเปลี่ยนกับเพื่อนต่างประเทศ', 'เวทีสื่อสารสาธารณะ'],
    color: 'bg-[#f6ead0]',
  },
  {
    id: 'maker',
    label: 'ลงมือทำ',
    title: 'มือทำงาน\nใจไม่กลัวลอง',
    description: 'พื้นที่สำหรับความสงสัยและการทดลอง ตั้งแต่หุ่นยนต์ ดนตรี ภาพยนตร์ ไปถึงการออกแบบเพื่อชุมชน',
    details: ['Maker space เปิดทุกวัน', 'ชมรมกว่า 32 ชมรม', 'เทศกาลผลงานปลายภาค'],
    color: 'bg-[#e5e0ed]',
  },
];

const events = [
  { id: 'event-01', day: '24', month: 'ส.ค.', title: 'วันเยี่ยมชมโรงเรียน', time: '09:00–12:00 น.', type: 'สำหรับผู้ปกครอง' },
  { id: 'event-02', day: '31', month: 'ส.ค.', title: 'เวิร์กช็อป Maker รุ่นเยาว์', time: '13:00–15:30 น.', type: 'สำหรับนักเรียน ป.6' },
  { id: 'event-03', day: '07', month: 'ก.ย.', title: 'แนะแนวเส้นทางการเรียน', time: '10:00–11:30 น.', type: 'ออนไลน์ · Zoom' },
];

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeProgram, setActiveProgram] = useState('core');
  const [selectedStory, setSelectedStory] = useState<(typeof news)[number] | (typeof events)[number] | null>(null);
  const [formSent, setFormSent] = useState(false);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'โรงเรียนศรีวัฒน์วิทยา | เรียนรู้วันนี้ เติบโตเพื่อวันพรุ่งนี้';
  }, []);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const active = programs.find((program) => program.id === activeProgram) ?? programs[0];

  return (
    <div className="noise min-h-[100dvh] overflow-x-hidden bg-[#f8f5ed] text-[#252b4d]">
      <header className="absolute left-0 right-0 top-0 z-40">
        <div className="container-shell flex items-center justify-between border-b border-white/20 py-4 text-white">
          <button data-testid="button-brand" onClick={() => scrollTo('top')} className="focus-ring flex items-center gap-3 text-left">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-[#efad4d] text-[#252b4d] shadow-lg">
              <Sparkles size={22} strokeWidth={2.5} />
            </span>
            <span>
              <span className="block font-serif text-lg font-extrabold leading-none">ศรีวัฒน์วิทยา</span>
              <span className="mt-1 block text-[10px] font-semibold tracking-[.16em] text-white/70">SRIVATANA SCHOOL</span>
            </span>
          </button>

          <nav className="hidden items-center gap-7 text-sm font-semibold lg:flex" aria-label="เมนูหลัก">
            <a data-testid="link-about" href="#about" className="focus-ring text-white/85 transition-colors hover:text-[#efad4d]">เรื่องของเรา</a>
            <a data-testid="link-learning" href="#learning" className="focus-ring text-white/85 transition-colors hover:text-[#efad4d]">การเรียนรู้</a>
            <a data-testid="link-news" href="#news" className="focus-ring text-white/85 transition-colors hover:text-[#efad4d]">ข่าวสารและกิจกรรม</a>
            <a data-testid="link-admissions" href="#admissions" className="focus-ring text-white/85 transition-colors hover:text-[#efad4d]">รับสมัครนักเรียน</a>
            <a data-testid="link-contact" href="#contact" className="focus-ring text-white/85 transition-colors hover:text-[#efad4d]">ติดต่อเรา</a>
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <a data-testid="link-search" href="#news" aria-label="ค้นหาข่าวสาร" className="focus-ring grid h-10 w-10 place-items-center rounded-full border border-white/25 transition hover:border-[#efad4d] hover:text-[#efad4d]"><Search size={17} /></a>
            <a data-testid="link-chat" href="#contact" className="focus-ring rounded-full bg-[#efad4d] px-4 py-2.5 text-sm font-bold text-[#252b4d] transition hover:-translate-y-0.5 hover:bg-[#f6c36e]">พูดคุยกับเรา</a>
          </div>

          <button data-testid="button-mobile-menu" aria-label={menuOpen ? 'ปิดเมนู' : 'เปิดเมนู'} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)} className="focus-ring grid h-11 w-11 place-items-center rounded-full border border-white/30 lg:hidden">
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
        {menuOpen && (
          <div className="container-shell mt-2 rounded-2xl border border-white/20 bg-[#252b4d]/95 p-3 shadow-2xl backdrop-blur-md lg:hidden">
            {[
              ['เรื่องของเรา', 'about'],
              ['การเรียนรู้', 'learning'],
              ['ข่าวสารและกิจกรรม', 'news'],
              ['รับสมัครนักเรียน', 'admissions'],
              ['ติดต่อเรา', 'contact'],
            ].map(([label, id]) => (
              <a data-testid={`mobile-link-${id}`} key={id} href={`#${id}`} onClick={() => setMenuOpen(false)} className="flex min-h-12 items-center border-b border-white/10 px-3 text-sm font-semibold text-white last:border-0">{label}<ArrowRight size={16} className="ml-auto text-[#efad4d]" /></a>
            ))}
          </div>
        )}
      </header>

      <main id="top">
        <section className="relative flex min-h-[720px] items-end overflow-hidden bg-[#252b4d] pb-14 pt-32 md:min-h-[780px] md:pb-20">
          <img src="/campus-hero.png" alt="บรรยากาศอาคารเรียนและสวนของโรงเรียนศรีวัฒน์วิทยา" className="absolute inset-0 h-full w-full object-cover object-center opacity-80" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(28,34,67,.94)_0%,rgba(37,43,77,.70)_42%,rgba(37,43,77,.20)_100%)]" />
          <div className="absolute bottom-10 right-[8%] hidden animate-drift text-white/30 md:block"><Sparkles size={160} strokeWidth={.6} /></div>
          <div className="container-shell relative z-10">
            <div className="max-w-3xl animate-rise-in">
              <p className="mb-5 flex items-center gap-3 text-sm font-bold tracking-[.12em] text-[#efad4d]"><span className="h-px w-10 bg-[#efad4d]" /> โรงเรียนมัธยมแห่งการเติบโต</p>
              <h1 className="max-w-2xl font-serif text-5xl font-extrabold leading-[1.13] tracking-[-.045em] text-[#fffaf0] sm:text-6xl md:text-8xl">เรียนรู้วันนี้<br /><span className="text-[#efad4d]">เติบโตเพื่อวันพรุ่งนี้</span></h1>
              <p className="mt-7 max-w-xl text-base leading-8 text-white/80 md:text-lg">พื้นที่ที่ความสงสัยของเด็กทุกคนมีความหมาย และการเรียนรู้เกิดขึ้นได้ทั้งในห้องเรียน บนสนาม และในชุมชนของเรา</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a data-testid="link-hero-explore" href="#about" className="focus-ring inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[#efad4d] px-7 font-bold text-[#252b4d] transition hover:-translate-y-1 hover:bg-[#f6c36e]">รู้จักศรีวัฒน์วิทยา <ArrowDown size={18} /></a>
                <a data-testid="link-hero-admissions" href="#admissions" className="focus-ring inline-flex min-h-14 items-center justify-center gap-3 rounded-full border border-white/40 px-7 font-bold text-white transition hover:border-white hover:bg-white/10">ดูข้อมูลรับสมัคร <ArrowRight size={18} /></a>
              </div>
            </div>
            <div className="mt-16 flex flex-wrap gap-x-8 gap-y-4 border-t border-white/20 pt-5 text-xs font-semibold text-white/65 md:mt-20">
              <span className="flex items-center gap-2"><MapPin size={15} className="text-[#efad4d]" /> เชียงใหม่ · ประเทศไทย</span>
              <span className="flex items-center gap-2"><Users size={15} className="text-[#efad4d]" /> ก่อตั้ง พ.ศ. 2528</span>
              <span className="flex items-center gap-2"><Star size={15} className="text-[#efad4d]" /> โรงเรียนคุณภาพเพื่อชุมชน</span>
            </div>
          </div>
        </section>

        <section className="bg-[#efad4d] py-5">
          <div className="container-shell grid gap-4 text-[#252b4d] sm:grid-cols-3 sm:gap-8">
            <div className="flex items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#252b4d]/10"><BookOpen size={19} /></span><span><strong className="block text-xl font-extrabold">39 ปี</strong><small className="font-semibold opacity-75">แห่งการเรียนรู้ร่วมกัน</small></span></div>
            <div className="flex items-center gap-3 border-[#252b4d]/15 sm:border-l sm:pl-8"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#252b4d]/10"><GraduationCap size={19} /></span><span><strong className="block text-xl font-extrabold">1,280 คน</strong><small className="font-semibold opacity-75">นักเรียนที่มีพื้นที่เป็นตัวเอง</small></span></div>
            <div className="flex items-center gap-3 border-[#252b4d]/15 sm:border-l sm:pl-8"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#252b4d]/10"><Sparkles size={19} /></span><span><strong className="block text-xl font-extrab-bold">32 ชมรม</strong><small className="font-semibold opacity-75">ให้ลองทำในสิ่งที่รัก</small></span></div>
          </div>
        </section>

        <section id="about" className="scroll-mt-12 bg-[#f8f5ed] py-20 md:py-32">
          <div className="container-shell grid items-center gap-14 lg:grid-cols-[.9fr_1.1fr] lg:gap-24">
            <div className="relative">
              <div className="absolute -left-6 -top-8 h-32 w-32 rounded-full border border-[#efad4d]/50 md:-left-12 md:-top-12 md:h-48 md:w-48" />
              <div className="relative overflow-hidden rounded-[2rem] rounded-bl-[5rem] bg-[#dbe8e1]">
                <img src="https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg?auto=compress&cs=tinysrgb&w=1100" alt="นักเรียนกำลังทำงานร่วมกันในห้องเรียน" className="aspect-[4/5] w-full object-cover" />
                <div className="absolute bottom-5 left-5 rounded-xl bg-[#252b4d] px-4 py-3 text-white shadow-xl"><p className="text-[11px] font-semibold text-white/60">คำถามที่เราให้คุณค่าที่สุด</p><p className="mt-1 font-bold">“วันนี้เราอยากรู้อะไร?”</p></div>
              </div>
            </div>
            <div>
              <p className="eyebrow">Our story · เรื่องของเรา</p>
              <h2 className="mt-4 max-w-xl font-serif text-4xl font-extrabold leading-tight tracking-[-.04em] md:text-6xl">โรงเรียนที่เชื่อว่า<br /><span className="text-[#2e8376]">เด็กทุกคนมีแสงของตัวเอง</span></h2>
              <p className="mt-7 max-w-xl text-base leading-8 text-[#596079]">ศรีวัฒน์วิทยาเริ่มต้นจากความตั้งใจของครูและคนในชุมชนเชียงใหม่ที่อยากสร้างโรงเรียนซึ่งมองเห็นเด็กทั้งคน ไม่ใช่แค่คะแนน เราจึงออกแบบทุกวันให้มีทั้งความรู้ ความกล้า และความสัมพันธ์ที่ดี</p>
              <div className="mt-8 grid gap-5 border-t border-[#d9d4c8] pt-7 sm:grid-cols-2">
                <div><p className="font-bold">ห้องเรียนที่มีคำถาม</p><p className="mt-2 text-sm leading-6 text-[#596079]">ครูชวนคิด ไม่ได้ชวนท่องจำ เด็กได้ลงมือแก้ปัญหาที่มีความหมาย</p></div>
                <div><p className="font-bold">ชุมชนที่ดูแลกัน</p><p className="mt-2 text-sm leading-6 text-[#596079]">ความสัมพันธ์ที่ดีทำให้เด็กกล้าลองผิดและกลับมาเริ่มใหม่</p></div>
              </div>
              <a data-testid="link-about-story" href="#contact" className="focus-ring mt-8 inline-flex items-center gap-2 font-bold text-[#2e8376] transition hover:gap-3">ทำความรู้จักเราให้มากขึ้น <ArrowRight size={17} /></a>
            </div>
          </div>
        </section>

        <section id="learning" className="scroll-mt-12 overflow-hidden bg-[#e4efe9] py-20 md:py-28">
          <div className="container-shell">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div><p className="eyebrow">Learning by doing · การเรียนรู้</p><h2 className="mt-4 max-w-2xl font-serif text-4xl font-extrabold leading-tight tracking-[-.04em] md:text-6xl">หลักสูตรที่พาเด็ก<br /><span className="text-[#2e8376]">ไปไกลกว่าคำตอบ</span></h2></div>
              <p className="max-w-sm text-sm leading-7 text-[#596079]">เราออกแบบเส้นทางที่จริงจังและยืดหยุ่น เพื่อให้เด็กได้เป็นเจ้าของการเรียนรู้ของตัวเอง</p>
            </div>
            <div className="mt-12 grid gap-8 lg:grid-cols-[.7fr_1.3fr]">
              <div className="flex gap-2 overflow-x-auto border-b border-[#b8d2c7] pb-2 lg:block lg:space-y-2 lg:border-0 lg:pb-0">
                {programs.map((program, index) => (
                  <button data-testid={`button-program-${program.id}`} key={program.id} onClick={() => setActiveProgram(program.id)} className={`focus-ring flex min-w-max items-center gap-4 rounded-2xl px-4 py-4 text-left transition lg:w-full ${activeProgram === program.id ? 'bg-[#252b4d] text-white shadow-xl' : 'text-[#596079] hover:bg-white/60'}`}>
                    <span className={`grid h-9 w-9 place-items-center rounded-full text-sm font-extrabold ${activeProgram === program.id ? 'bg-[#efad4d] text-[#252b4d]' : 'bg-[#f8f5ed] text-[#2e8376]'}`}>0{index + 1}</span><span className="font-bold">{program.label}</span><ArrowRight size={16} className="ml-auto hidden lg:block" />
                  </button>
                ))}
              </div>
              <div className={`${active.color} min-h-[360px] rounded-[2rem] p-7 md:p-12`}>
                <div className="flex items-start justify-between gap-6"><span className="rounded-full bg-white/60 px-3 py-1.5 text-xs font-bold text-[#2e8376]">เส้นทางการเรียนรู้ 0{programs.findIndex((p) => p.id === active.id) + 1}</span><Sparkles className="text-[#2e8376]/60" size={34} /></div>
                <h3 className="mt-10 whitespace-pre-line font-serif text-4xl font-extrabold leading-tight tracking-[-.04em] md:text-5xl">{active.title}</h3>
                <p className="mt-5 max-w-xl leading-7 text-[#596079]">{active.description}</p>
                <div className="mt-8 flex flex-wrap gap-3">{active.details.map((detail) => <span data-testid={`text-feature-${active.id}-${detail}`} key={detail} className="flex items-center gap-2 rounded-full bg-white/60 px-3 py-2 text-sm font-semibold"><Check size={15} className="text-[#2e8376]" /> {detail}</span>)}</div>
              </div>
            </div>
          </div>
        </section>

        <section id="news" className="scroll-mt-12 bg-[#f8f5ed] py-20 md:py-28">
          <div className="container-shell">
            <div className="flex items-end justify-between gap-6"><div><p className="eyebrow">From our campus · จากรั้วศรีวัฒน์</p><h2 className="mt-4 font-serif text-4xl font-extrabold tracking-[-.04em] md:text-5xl">เรื่องเล่าล่าสุด</h2></div><a data-testid="link-all-news" href="#events" className="hidden items-center gap-2 text-sm font-bold text-[#2e8376] sm:flex">ดูปฏิทินทั้งหมด <ArrowRight size={16} /></a></div>
            <div className="mt-10 grid gap-6 md:grid-cols-12">
              {news.map((item, index) => (
                <article data-testid={`card-news-${item.id}`} key={item.id} className={`group overflow-hidden rounded-[1.5rem] bg-white shadow-[0_8px_24px_rgba(32,42,82,.06)] ${index === 0 ? 'md:col-span-6' : 'md:col-span-3'}`}>
                  <button data-testid={`button-news-${item.id}`} onClick={() => setSelectedStory(item)} className="focus-ring block w-full text-left">
                    <div className={`${index === 0 ? 'aspect-[1.65/1]' : 'aspect-square'} overflow-hidden`}><img src={item.image} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /></div>
                    <div className="p-5 md:p-6"><div className="flex items-center justify-between gap-2 text-xs font-bold"><span className="text-[#2e8376]">{item.category}</span><span className="text-[#9394a0]">{item.date}</span></div><h3 className={`mt-3 font-serif font-extrabold leading-snug ${index === 0 ? 'text-2xl' : 'text-lg'}`}>{item.title}</h3><span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#2e8376]">อ่านเรื่องนี้ <ArrowRight size={15} /></span></div>
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="events" className="scroll-mt-12 bg-[#252b4d] py-20 text-white md:py-28">
          <div className="container-shell grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
            <div><p className="eyebrow text-[#efad4d]">Save the date · ปฏิทินกิจกรรม</p><h2 className="mt-4 font-serif text-4xl font-extrabold leading-tight tracking-[-.04em] md:text-6xl">มีอะไรให้<br /><span className="text-[#efad4d]">มาค้นพบเสมอ</span></h2><p className="mt-6 max-w-sm leading-7 text-white/65">แวะมาที่โรงเรียนหรือพบเราออนไลน์ เลือกช่วงเวลาที่เป็นคุณ แล้วเริ่มบทสนทนากัน</p><a data-testid="link-event-register" href="#contact" className="focus-ring mt-8 inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-3 text-sm font-bold transition hover:border-[#efad4d] hover:text-[#efad4d]">ลงทะเบียนความสนใจ <ArrowRight size={16} /></a></div>
            <div className="divide-y divide-white/15">{events.map((event) => <div data-testid={`row-event-${event.id}`} key={event.id} className="grid grid-cols-[64px_1fr_auto] items-center gap-4 py-5 sm:grid-cols-[80px_1fr_auto] sm:gap-6"><div className="text-center"><strong className="block font-serif text-4xl leading-none text-[#efad4d]">{event.day}</strong><span className="text-xs font-bold text-white/60">{event.month}</span></div><div><p className="text-[11px] font-bold tracking-[.1em] text-[#efad4d]">{event.type}</p><h3 className="mt-1 font-bold">{event.title}</h3><p className="mt-1 flex items-center gap-1.5 text-xs text-white/55"><Clock3 size={13} /> {event.time}</p>{expandedEvent === event.id && <p className="mt-3 text-sm leading-6 text-white/65">กิจกรรมเปิดให้ลงทะเบียนล่วงหน้า ที่นั่งมีจำนวนจำกัดและจะส่งรายละเอียดให้ทางอีเมล</p>}</div><button data-testid={`button-event-${event.id}`} aria-label={`ดูรายละเอียด ${event.title}`} onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)} className="focus-ring grid h-10 w-10 place-items-center rounded-full border border-white/25 transition hover:border-[#efad4d] hover:text-[#efad4d]">{expandedEvent === event.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</button></div>)}</div>
          </div>
        </section>

        <section id="admissions" className="scroll-mt-12 bg-[#efad4d] py-20 md:py-28">
          <div className="container-shell grid items-center gap-10 lg:grid-cols-[1fr_.8fr]">
            <div><p className="eyebrow text-[#252b4d]/70">Begin here · เริ่มต้นที่นี่</p><h2 className="mt-4 max-w-2xl font-serif text-4xl font-extrabold leading-tight tracking-[-.05em] md:text-7xl">พร้อมให้ลูกได้<br /><span className="text-[#f8f5ed]">เป็นตัวเองหรือยัง?</span></h2><p className="mt-6 max-w-xl text-lg leading-8 text-[#252b4d]/75">เราอยากรู้จักเด็กในแบบที่เขาเป็น และอยากให้ครอบครัวได้รู้จักเราเช่นกัน นัดเยี่ยมชมโรงเรียนหรือถามคำถามกับทีมรับสมัครได้เลย</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><a data-testid="link-admission-visit" href="#contact" className="focus-ring inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#252b4d] px-7 font-bold text-white transition hover:-translate-y-1 hover:bg-[#353d68]">นัดเยี่ยมชมโรงเรียน <ArrowRight size={17} /></a><a data-testid="link-admission-guide" href="#contact" className="focus-ring inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-[#252b4d]/30 px-7 font-bold text-[#252b4d] transition hover:bg-white/20">ขอคู่มือผู้ปกครอง <Mail size={17} /></a></div></div>
            <div className="relative mx-auto w-full max-w-md"><div className="absolute -right-3 -top-3 h-full w-full rounded-[2rem] border-2 border-[#252b4d]/20" /><div className="relative rounded-[2rem] bg-[#f8f5ed] p-7 text-[#252b4d] shadow-2xl md:p-9"><Quote className="text-[#2e8376]" size={34} /><p className="mt-6 font-serif text-2xl font-bold leading-snug">“การได้เห็นลูกกลับบ้านแล้วเล่าเรื่องที่เรียนด้วยแววตาเป็นประกาย คือคำตอบของเรา”</p><div className="mt-7 flex items-center gap-3 border-t border-[#ded8c8] pt-5"><div className="grid h-10 w-10 place-items-center rounded-full bg-[#dbe8e1] text-sm font-extrabold text-[#2e8376]">น</div><div><p className="text-sm font-bold">คุณแม่น้องนับดาว</p><p className="text-xs text-[#596079]">ผู้ปกครองศรีวัฒน์วิทยา รุ่น 2566</p></div></div></div></div>
          </div>
        </section>

        <section id="contact" className="scroll-mt-12 bg-[#f8f5ed] py-20 md:py-28">
          <div className="container-shell grid gap-12 lg:grid-cols-[.85fr_1.15fr]">
            <div><p className="eyebrow">Come say hi · ติดต่อเรา</p><h2 className="mt-4 font-serif text-4xl font-extrabold leading-tight tracking-[-.04em] md:text-6xl">คุยกันได้<br /><span className="text-[#2e8376]">ทุกเรื่องที่อยากรู้</span></h2><p className="mt-6 max-w-md leading-7 text-[#596079]">ทีมศรีวัฒน์พร้อมตอบคำถามเรื่องหลักสูตร การสมัคร และชีวิตในโรงเรียน วันจันทร์–ศุกร์ 08:00–16:30 น.</p><div className="mt-8 space-y-4 text-sm"><a data-testid="link-phone" href="tel:053218450" className="focus-ring flex items-center gap-3 font-bold hover:text-[#2e8376]"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#e4efe9] text-[#2e8376]"><Phone size={17} /></span> 053 218 450</a><a data-testid="link-email" href="mailto:hello@srivatana.ac.th" className="focus-ring flex items-center gap-3 font-bold hover:text-[#2e8376]"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#f6ead0] text-[#b97922]"><Mail size={17} /></span> hello@srivatana.ac.th</a><span className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#e5e0ed] text-[#655b85]"><MapPin size={17} /></span><span className="pt-2 font-semibold leading-6">189 ถนนดวงแก้ว ตำบลสุเทพ<br />อำเภอเมืองเชียงใหม่ 50200</span></span></div></div>
            <form data-testid="form-contact" onSubmit={(event) => { event.preventDefault(); setFormSent(true); }} className="rounded-[2rem] bg-white p-6 shadow-[0_8px_24px_rgba(32,42,82,.06)] md:p-9">
              {formSent ? <div data-testid="status-form-success" className="flex min-h-[320px] flex-col items-center justify-center text-center"><span className="grid h-16 w-16 place-items-center rounded-full bg-[#e4efe9] text-[#2e8376]"><Check size={30} /></span><h3 className="mt-6 font-serif text-3xl font-extrabold">ได้รับข้อความแล้ว</h3><p className="mt-3 max-w-sm leading-7 text-[#596079]">ขอบคุณที่สนใจศรีวัฒน์ ทีมของเราจะติดต่อกลับภายใน 1–2 วันทำการ</p><button data-testid="button-contact-reset" type="button" onClick={() => setFormSent(false)} className="focus-ring mt-6 text-sm font-bold text-[#2e8376]">ส่งข้อความอื่น</button></div> : <><div className="grid gap-5 sm:grid-cols-2"><label className="text-sm font-bold">ชื่อผู้ติดต่อ<input data-testid="input-contact-name" required name="name" placeholder="เช่น คุณมินตรา" className="focus-ring mt-2 min-h-12 w-full rounded-xl border border-[#ded8c8] bg-[#f8f5ed] px-4 font-normal outline-none transition focus:border-[#2e8376]" /></label><label className="text-sm font-bold">เบอร์โทรศัพท์<input data-testid="input-contact-phone" required name="phone" type="tel" placeholder="08x xxx xxxx" className="focus-ring mt-2 min-h-12 w-full rounded-xl border border-[#ded8c8] bg-[#f8f5ed] px-4 font-normal outline-none transition focus:border-[#2e8376]" /></label></div><label className="mt-5 block text-sm font-bold">อีเมล<input data-testid="input-contact-email" required name="email" type="email" placeholder="you@example.com" className="focus-ring mt-2 min-h-12 w-full rounded-xl border border-[#ded8c8] bg-[#f8f5ed] px-4 font-normal outline-none transition focus:border-[#2e8376]" /></label><label className="mt-5 block text-sm font-bold">เรื่องที่อยากคุยด้วย<textarea data-testid="input-contact-message" required name="message" rows={4} placeholder="เล่าให้เราฟังได้เลย..." className="focus-ring mt-2 w-full resize-none rounded-xl border border-[#ded8c8] bg-[#f8f5ed] px-4 py-3 font-normal outline-none transition focus:border-[#2e8376]" /></label><button data-testid="button-contact-submit" type="submit" className="focus-ring mt-6 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-[#252b4d] font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#353d68]">ส่งข้อความถึงศรีวัฒน์ <ArrowRight size={17} /></button></>}
            </form>
          </div>
        </section>
      </main>

      <footer className="bg-[#1c2141] py-12 text-white">
        <div className="container-shell">
          <div className="grid gap-10 border-b border-white/15 pb-10 md:grid-cols-[1.2fr_.8fr_.8fr]">
            <div><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-full bg-[#efad4d] text-[#252b4d]"><Sparkles size={22} /></span><span><strong className="block font-serif text-lg">ศรีวัฒน์วิทยา</strong><small className="text-[10px] tracking-[.15em] text-white/55">SRIVATANA SCHOOL</small></span></div><p className="mt-5 max-w-xs text-sm leading-7 text-white/55">พื้นที่ที่เด็กได้เรียนรู้ เติบโต และสร้างความหมายให้กับโลกของตัวเอง</p></div>
            <div><p className="mb-4 text-sm font-bold text-[#efad4d]">ทางลัด</p><div className="grid gap-3 text-sm text-white/65"><a data-testid="footer-link-about" href="#about" className="hover:text-white">เรื่องของเรา</a><a data-testid="footer-link-learning" href="#learning" className="hover:text-white">การเรียนรู้</a><a data-testid="footer-link-news" href="#news" className="hover:text-white">ข่าวสารล่าสุด</a><a data-testid="footer-link-admissions" href="#admissions" className="hover:text-white">รับสมัครนักเรียน</a></div></div>
            <div><p className="mb-4 text-sm font-bold text-[#efad4d]">ติดตามเรา</p><div className="flex gap-2"><a data-testid="link-facebook" href="#contact" aria-label="Facebook" className="grid h-10 w-10 place-items-center rounded-full border border-white/20 transition hover:border-[#efad4d] hover:text-[#efad4d]"><Facebook size={17} /></a><a data-testid="link-instagram" href="#contact" aria-label="Instagram" className="grid h-10 w-10 place-items-center rounded-full border border-white/20 transition hover:border-[#efad4d] hover:text-[#efad4d]"><Instagram size={17} /></a><a data-testid="link-youtube" href="#contact" aria-label="YouTube" className="grid h-10 w-10 place-items-center rounded-full border border-white/20 transition hover:border-[#efad4d] hover:text-[#efad4d]"><Youtube size={17} /></a></div><p className="mt-5 flex items-center gap-2 text-xs text-white/45"><MessageCircle size={14} /> ตอบแชตในเวลาทำการ</p></div>
          </div>
          <div className="flex flex-col justify-between gap-3 pt-6 text-xs text-white/40 sm:flex-row"><span>© 2024 โรงเรียนศรีวัฒน์วิทยา · สงวนลิขสิทธิ์</span><span>เว็บไซต์เพื่อการแนะนำโรงเรียน</span></div>
        </div>
      </footer>

      {selectedStory && (
        <div data-testid="modal-story" className="fixed inset-0 z-50 grid place-items-center bg-[#1c2141]/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" onClick={() => setSelectedStory(null)}>
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[1.5rem] bg-[#f8f5ed] shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#ded8c8] px-6 py-4"><span className="text-sm font-bold text-[#2e8376]">รายละเอียด</span><button data-testid="button-close-modal" aria-label="ปิดหน้าต่าง" onClick={() => setSelectedStory(null)} className="focus-ring grid h-9 w-9 place-items-center rounded-full hover:bg-[#e4efe9]"><X size={18} /></button></div>
            {'image' in selectedStory && <img src={selectedStory.image} alt="" className="aspect-[2/1] w-full object-cover" />}
            <div className="p-6 md:p-8">{'category' in selectedStory ? <><p className="text-xs font-bold text-[#2e8376]">{selectedStory.category} · {selectedStory.date}</p><h3 className="mt-3 font-serif text-3xl font-extrabold leading-tight">{selectedStory.title}</h3><p className="mt-5 leading-8 text-[#596079]">{selectedStory.text}</p></> : <><p className="text-xs font-bold text-[#2e8376]">{selectedStory.type} · {selectedStory.time}</p><h3 className="mt-3 font-serif text-3xl font-extrabold leading-tight">{selectedStory.title}</h3><p className="mt-5 leading-8 text-[#596079]">กิจกรรมนี้เปิดพื้นที่ให้คุณได้มาพบครูและนักเรียน สัมผัสบรรยากาศจริง และถามทุกเรื่องที่อยากรู้เกี่ยวกับการเรียนที่ศรีวัฒน์</p></>}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;