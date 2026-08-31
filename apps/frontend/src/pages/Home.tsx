import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import {
  Cards,
  BookOpen,
  Flame,
  ArrowRight,
  SpeakerHigh,
  ArrowsClockwise,
  CheckCircle,
  Star,
  Users,
  Check,
  CaretDown,
  CaretLeft,
  CaretRight,
  Microphone,
} from '@phosphor-icons/react';
import { useAuth } from '../store/AuthContext';

export const Home: React.FC = () => {
  const { user } = useAuth();

  // Scroll Parallax Hooks for Hero Section
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  // Parallax transforms for Hero
  const heroY = useTransform(heroScroll, [0, 1], [0, 120]);
  const heroOpacity = useTransform(heroScroll, [0, 0.8], [1, 0]);
  const cardStackY = useTransform(heroScroll, [0, 1], [0, -90]);
  const cardStackRotate = useTransform(heroScroll, [0, 1], [0, 8]);
  const bgGlowY = useTransform(heroScroll, [0, 1], [0, 200]);

  // Scroll Parallax Hooks for Feature Section
  const featureRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: featureScroll } = useScroll({
    target: featureRef,
    offset: ['start end', 'end start'],
  });
  const featureParallaxY1 = useTransform(featureScroll, [0, 1], [60, -40]);
  const featureParallaxY2 = useTransform(featureScroll, [0, 1], [100, -60]);

  // Interactive 3D Card Flip state for Hero
  const [activeHeroCard, setActiveHeroCard] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [ratedFeedback, setRatedFeedback] = useState<string | null>(null);

  // Mode Switcher Tab State
  const [activeTab, setActiveTab] = useState<'srs' | 'quiz' | 'tts' | 'streak'>('srs');

  // Deck Category Filter State & Carousel Slide Index
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [carouselIndex, setCarouselIndex] = useState<number>(0);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Hero Card Samples
  const heroCards = [
    {
      term: 'Resilience',
      ipa: '/rɪˈzɪl.jəns/',
      pos: 'n',
      meaning: 'Khả năng phục hồi, sự kiên cường vượt qua nghịch cảnh',
      exampleEn: 'Her resilience helped her overcome every obstacle in learning English.',
      exampleVi: 'Sự kiên cường giúp cô ấy vượt qua mọi rào cản khi học tiếng Anh.',
      tag: 'Oxford 3000',
    },
    {
      term: 'Collaborate',
      ipa: '/kəˈlæb.ə.reɪt/',
      pos: 'v',
      meaning: 'Hợp tác, phối hợp cùng làm việc',
      exampleEn: 'Teams from different departments collaborate on global projects.',
      exampleVi: 'Các đội ngũ từ các phòng ban khác nhau hợp tác trong dự án toàn cầu.',
      tag: 'Business English',
    },
    {
      term: 'Meticulous',
      ipa: '/məˈtɪk.jə.ləs/',
      pos: 'adj',
      meaning: 'Tỉ mỉ, cẩn thận, chỉn chu từng chi tiết',
      exampleEn: 'He gave a meticulous presentation in front of the IELTS examiner.',
      exampleVi: 'Anh ấy có bài trình bày chỉn chu trước giám khảo IELTS.',
      tag: 'IELTS Academic',
    },
  ];

  const currentCard = heroCards[activeHeroCard];

  const handleRate = (label: string) => {
    setRatedFeedback(label);
    setTimeout(() => {
      setIsFlipped(false);
      setRatedFeedback(null);
      setActiveHeroCard((prev) => (prev + 1) % heroCards.length);
    }, 1400);
  };

  // Sample Decks Data with Rich Cover Photos & Sample Vocab Chips
  const sampleDecks = [
    {
      id: '1',
      title: 'Oxford 3000 Từ Thông Dụng',
      category: 'communication',
      description: '3000 từ vựng cốt lõi bao phủ 85% hội thoại tiếng Anh hàng ngày.',
      cardCount: 3000,
      learners: 14200,
      rating: 4.9,
      tag: 'Cơ bản - Trung cấp',
      cover: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&auto=format&fit=crop&q=80',
      sampleWords: ['resilience', 'eloquent', 'pragmatic'],
      badgeColor: 'from-amber-500 to-orange-500',
    },
    {
      id: '2',
      title: '600 Từ Vựng TOEIC Giao Tiếp',
      category: 'toeic',
      description: 'Từ vựng chuyên dùng trong môi trường doanh nghiệp, văn phòng & thương mại.',
      cardCount: 600,
      learners: 9800,
      rating: 4.8,
      tag: 'Đi Làm - Công Sở',
      cover: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80',
      sampleWords: ['collaborate', 'negotiate', 'agenda'],
      badgeColor: 'from-blue-500 to-indigo-500',
    },
    {
      id: '3',
      title: 'IELTS Academic Band 7.0+',
      category: 'ielts',
      description: 'Từ vựng học thuật trình độ cao giúp nâng điểm Writing & Speaking.',
      cardCount: 1200,
      learners: 7300,
      rating: 4.9,
      tag: 'Học Thuật Nâng Cao',
      cover: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&auto=format&fit=crop&q=80',
      sampleWords: ['meticulous', 'substantive', 'paradigm'],
      badgeColor: 'from-purple-500 to-pink-500',
    },
    {
      id: '4',
      title: 'Tiếng Anh Du Lịch & Khách Sạn',
      category: 'travel',
      description: 'Cụm từ mẫu & từ vựng khi đi sân bay, đặt phòng, hỏi đường & gọi món.',
      cardCount: 450,
      learners: 5600,
      rating: 4.7,
      tag: 'Thực Tế Du Lịch',
      cover: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&auto=format&fit=crop&q=80',
      sampleWords: ['itinerary', 'boarding', 'concierge'],
      badgeColor: 'from-emerald-500 to-teal-500',
    },
    {
      id: '5',
      title: 'Thành Ngữ Idioms & Slang',
      category: 'communication',
      description: 'Cách nói tự nhiên như người bản xứ trong các cuộc trò chuyện thân mật.',
      cardCount: 500,
      learners: 8100,
      rating: 4.9,
      tag: 'Phản Xạ Tự Nhiên',
      cover: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80',
      sampleWords: ['break a leg', 'hit the sack', 'under the weather'],
      badgeColor: 'from-rose-500 to-red-500',
    },
    {
      id: '6',
      title: 'Từ Vựng Công Nghệ & IT',
      category: 'toeic',
      description: 'Từ vựng chuyên ngành Lập trình, Phần mềm & Công nghệ thông tin.',
      cardCount: 750,
      learners: 4200,
      rating: 4.8,
      tag: 'Chuyên Ngành IT',
      cover: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
      sampleWords: ['deprecated', 'refactor', 'concurrency'],
      badgeColor: 'from-cyan-500 to-blue-500',
    },
  ];

  const filteredDecks =
    selectedCategory === 'all'
      ? sampleDecks
      : sampleDecks.filter((d) => d.category === selectedCategory);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setCarouselIndex(0);
  };

  const nextSlide = () => {
    setCarouselIndex((prev) => (prev + 1) % filteredDecks.length);
  };

  const prevSlide = () => {
    setCarouselIndex((prev) => (prev - 1 + filteredDecks.length) % filteredDecks.length);
  };

  // Learner Reviews Data
  const learnerReviews = [
    {
      name: 'Minh Anh',
      role: 'Sinh viên ĐH Bách Khoa',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      comment: 'Thẻ từ vựng nhắc ôn tập rất đúng lúc! Mình đã học thuộc hơn 800 từ Oxford chỉ trong 1 tháng mà không bị quên.',
      learnedWords: 850,
      streak: 34,
    },
    {
      name: 'Trần Hoàng',
      role: 'Lập trình viên Frontend',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      comment: 'Giao diện cực kỳ trực quan, nghĩa tiếng Việt dịch rất sát thực tế công việc chứ không bị dịch máy cứng đờ.',
      learnedWords: 1200,
      streak: 52,
    },
    {
      name: 'Bích Phương',
      role: 'Chuyên viên Nhân sự',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      comment: 'Các bài trắc nghiệm phản xạ giúp mình tự tin hơn nhiều khi viết email và nói chuyện với đồng nghiệp nước ngoài.',
      learnedWords: 600,
      streak: 28,
    },
  ];

  // FAQ Data
  const faqs = [
    {
      question: 'Phương pháp thẻ học thông minh hoạt động như thế nào?',
      answer: 'Hệ thống tự động theo dõi mức độ thuộc từ vựng của bạn. Từ vựng bạn thấy khó sẽ được nhắc lại thường xuyên hơn, trong khi từ dễ sẽ được hẹn lịch ôn xa hơn để bạn ghi nhớ sâu mà không tốn nhiều thời gian.',
    },
    {
      question: 'Tôi có thể tự tạo bộ thẻ từ vựng riêng hoặc tải lên file CSV không?',
      answer: 'Có! Bạn hoàn toàn có thể tự tạo bộ thẻ cá nhân hoặc import file CSV từ vựng của bạn. Hệ thống sẽ tự động bổ sung phiên âm IPA, phát âm audio và câu ví dụ cho bạn.',
    },
    {
      question: 'Ứng dụng có hoàn toàn miễn phí không?',
      answer: 'Ứng dụng mở các tính năng thẻ học, trắc nghiệm và kho bộ thẻ chuẩn miễn phí 100% cho người học cá nhân.',
    },
    {
      question: 'Tôi có thể sử dụng trên điện thoại di động không?',
      answer: 'Có! Giao diện được tối ưu chuẩn responsive, chạy mượt mà trên cả điện thoại di động, máy tính bảng và máy tính bàn.',
    },
  ];

  return (
    <div className="relative min-h-[calc(100dvh-68px)] bg-[#faf9f6] text-slate-800 overflow-x-hidden">
      {/* Ambient Glow */}
      <motion.div
        style={{ y: bgGlowY }}
        className="pointer-events-none absolute -top-24 right-0 -z-10 h-96 w-96 rounded-full bg-slate-200/40 blur-3xl"
      />

      {/* ---------------- SECTION 1: HERO SECTION ---------------- */}
      <section ref={heroRef} className="relative mx-auto flex max-w-7xl flex-col justify-center px-4 pt-12 pb-16 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          {/* Left Column: Clean Editorial Copy */}
          <motion.div
            style={{ y: heroY, opacity: heroOpacity }}
            className="flex flex-col items-start lg:col-span-6"
          >
            {/* Clean Category Label */}
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-indigo-600">
              LINGOVERSE — SMART VOCABULARY PLATFORM
            </span>

            {/* Solid Editorial Headline */}
            <h1 className="mt-3 font-heading text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl leading-[1.12]">
              Biến từ vựng mới thành <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-8">vốn từ của bạn</span> mỗi ngày.
            </h1>

            {/* Subtext */}
            <p className="mt-6 max-w-[54ch] text-base text-slate-600 sm:text-lg leading-relaxed">
              Giải thích nghĩa chi tiết bằng tiếng Việt gần gũi, phát âm chuẩn người bản xứ và hệ thống nhắc ôn tập thông minh đúng thời điểm.
            </p>

            {/* Action CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              {user ? (
                <Link
                  to="/dashboard"
                  className="btn-primary flex items-center gap-2.5 rounded-xl px-7 py-3.5 text-base font-bold active:scale-[0.98]"
                >
                  <span>Bảng Học Tập</span>
                  <ArrowRight weight="bold" className="h-5 w-5" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="btn-primary flex items-center gap-2.5 rounded-xl px-7 py-3.5 text-base font-bold active:scale-[0.98]"
                  >
                    <span>Bắt Đầu Học Miễn Phí</span>
                    <ArrowRight weight="bold" className="h-5 w-5" />
                  </Link>
                  <Link
                    to="/decks"
                    className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-base font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98]"
                  >
                    <Cards weight="duotone" className="h-5 w-5 text-indigo-600" />
                    <span>Khám phá bộ thẻ</span>
                  </Link>
                </>
              )}
            </div>

            {/* Learner Active Proof Bar */}
            <div className="mt-10 flex items-center gap-4 border-t border-slate-200/80 pt-6">
              <div className="flex -space-x-2">
                <img
                  className="inline-block h-9 w-9 rounded-full ring-2 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="Learner"
                />
                <img
                  className="inline-block h-9 w-9 rounded-full ring-2 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                  alt="Learner"
                />
                <img
                  className="inline-block h-9 w-9 rounded-full ring-2 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
                  alt="Learner"
                />
              </div>
              <div className="text-xs">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} weight="fill" className="h-3.5 w-3.5" />
                  ))}
                  <span className="ml-1 font-bold text-slate-800">4.9/5</span>
                </div>
                <p className="mt-0.5 font-medium text-slate-500">
                  Hơn <strong className="text-slate-800">25,000+</strong> học viên đang ôn luyện mỗi ngày
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: 3D Interactive Flashcard */}
          <motion.div
            style={{ y: cardStackY, rotateZ: cardStackRotate }}
            className="relative lg:col-span-6"
          >
            <div className="relative mx-auto max-w-md">
              {/* Card Switcher Selector Pill */}
              <div className="relative mb-3 flex items-center justify-between rounded-xl bg-white border border-slate-200/90 p-1.5 shadow-2xs">
                <span className="ml-2 text-xs font-bold text-slate-600">Thử lật thẻ demo:</span>
                <div className="flex items-center gap-1">
                  {heroCards.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setActiveHeroCard(i);
                        setIsFlipped(false);
                      }}
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                        activeHeroCard === i
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {c.term}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main 3D Card */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="perspective-1000 cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 shadow-xl transition hover:border-indigo-300"
              >
                <div
                  className={`transform-style-3d relative min-h-[300px] w-full transition-transform duration-500 ${
                    isFlipped ? 'rotate-y-180' : ''
                  }`}
                >
                  {/* Front Side */}
                  <div className="backface-hidden flex min-h-[300px] flex-col justify-between rounded-xl border border-slate-100 bg-slate-50/90 p-6 text-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="rounded-md bg-slate-200/80 px-2.5 py-1 text-xs font-bold text-slate-700">
                        {currentCard.tag}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const utter = new SpeechSynthesisUtterance(currentCard.term);
                          utter.lang = 'en-US';
                          window.speechSynthesis?.speak(utter);
                        }}
                        title="Nghe phát âm chuẩn người bản xứ"
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-indigo-600 shadow-2xs transition hover:bg-indigo-50 active:scale-95"
                      >
                        <SpeakerHigh weight="bold" className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="my-auto text-center">
                      <h2 className="font-heading text-3xl font-extrabold text-slate-900 sm:text-4xl">
                        {currentCard.term}
                      </h2>
                      <p className="mt-1 font-mono text-sm text-slate-500">{currentCard.ipa}</p>
                      <span className="mt-2 inline-block rounded-md bg-slate-200/70 px-2.5 py-0.5 font-mono text-xs font-bold text-slate-700">
                        {currentCard.pos}
                      </span>
                    </div>

                    <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-indigo-600">
                      <ArrowsClockwise weight="bold" className="h-4 w-4 animate-spin" />
                      <span>Nhấp vào thẻ để xem nghĩa & ví dụ tiếng Việt</span>
                    </div>
                  </div>

                  {/* Back Side */}
                  <div className="rotate-y-180 backface-hidden absolute inset-0 flex min-h-[300px] flex-col justify-between rounded-xl border border-indigo-200 bg-indigo-50/50 p-6">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                        Nghĩa Tiếng Việt:
                      </span>
                      <p className="mt-1 font-heading text-xl font-bold text-slate-900">
                        {currentCard.meaning}
                      </p>

                      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3.5 text-xs shadow-2xs">
                        <p className="font-semibold text-slate-800">"{currentCard.exampleEn}"</p>
                        <p className="mt-1 text-slate-500">{currentCard.exampleVi}</p>
                      </div>
                    </div>

                    {/* Rating Buttons */}
                    <div>
                      <p className="mb-2 text-center text-xs font-semibold text-slate-600">
                        Đánh giá mức độ thuộc từ của bạn:
                      </p>
                      <div className="grid grid-cols-4 gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleRate('Chưa nhớ')}
                          className="flex flex-col items-center justify-center rounded-lg border border-rose-200 bg-rose-50 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100 active:scale-95"
                        >
                          <span>Chưa nhớ</span>
                        </button>
                        <button
                          onClick={() => handleRate('Cần ôn')}
                          className="flex flex-col items-center justify-center rounded-lg border border-amber-200 bg-amber-50 py-2 text-xs font-bold text-amber-700 transition hover:bg-amber-100 active:scale-95"
                        >
                          <span>Cần ôn</span>
                        </button>
                        <button
                          onClick={() => handleRate('Nhớ tốt')}
                          className="flex flex-col items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50 py-2 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100 active:scale-95"
                        >
                          <span>Nhớ tốt</span>
                        </button>
                        <button
                          onClick={() => handleRate('Rất dễ')}
                          className="flex flex-col items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 active:scale-95"
                        >
                          <span>Rất dễ</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {ratedFeedback && (
                  <div className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 text-xs font-bold text-white shadow-md">
                    <Check weight="bold" className="h-4 w-4" />
                    <span>Đã ghi nhận: {ratedFeedback} (+10 XP)</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ---------------- SECTION 2: INTERACTIVE LEARNING MODES ---------------- */}
      <section ref={featureRef} className="border-t border-slate-200 bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-heading text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Mọi tính năng bạn cần để làm chủ từ vựng
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Dễ dàng học thẻ nhớ, luyện tập trắc nghiệm, kiểm tra phát âm và theo dõi tiến độ mỗi ngày.
            </p>
          </div>

          {/* Interactive Mode Switcher Tabs */}
          <div className="mt-10 flex justify-center">
            <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-slate-100 p-1.5 border border-slate-200">
              <button
                onClick={() => setActiveTab('srs')}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition ${
                  activeTab === 'srs'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Cards weight="duotone" className="h-4 w-4" />
                Thẻ Từ Vựng SRS
              </button>
              <button
                onClick={() => setActiveTab('quiz')}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition ${
                  activeTab === 'quiz'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen weight="duotone" className="h-4 w-4" />
                Trắc Nghiệm 5 Dạng
              </button>
              <button
                onClick={() => setActiveTab('tts')}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition ${
                  activeTab === 'tts'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Microphone weight="duotone" className="h-4 w-4" />
                Phát Âm & Ví Dụ
              </button>
              <button
                onClick={() => setActiveTab('streak')}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition ${
                  activeTab === 'streak'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Flame weight="duotone" className="h-4 w-4" />
                Streak & Cấp Độ XP
              </button>
            </div>
          </div>

          {/* Dynamic Tab Content Preview */}
          <div className="mt-8">
            <AnimatePresence mode="wait">
              {activeTab === 'srs' && (
                <motion.div
                  key="srs"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.3 }}
                  className="app-card grid items-center gap-8 rounded-3xl p-8 lg:grid-cols-12"
                >
                  <motion.div style={{ y: featureParallaxY1 }} className="lg:col-span-7">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-indigo-600">
                      THUẬT TOÁN ÔN TẬP TỰ ĐỘNG
                    </span>
                    <h3 className="mt-2 font-heading text-2xl font-bold text-slate-900">
                      Chỉ ôn lại đúng những từ bạn chuẩn bị quên
                    </h3>
                    <p className="mt-3 text-slate-600 leading-relaxed">
                      Thay vì phải lặp lại hàng trăm từ vựng đã thuộc, hệ thống sẽ tự động nhắc nhở bạn ôn lại đúng thời điểm để khắc sâu vào bộ nhớ dài hạn mà không tốn nhiều thời gian.
                    </p>
                    <ul className="mt-5 space-y-2.5 text-sm font-semibold text-slate-700">
                      <li className="flex items-center gap-2">
                        <CheckCircle weight="fill" className="h-4 w-4 text-emerald-600" />
                        <span>Tự động phân loại 4 mức độ: Chưa nhớ, Cần ôn, Nhớ tốt, Rất dễ</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle weight="fill" className="h-4 w-4 text-emerald-600" />
                        <span>Tiết kiệm 70% thời gian học so với phương pháp ghi chép truyền thống</span>
                      </li>
                    </ul>
                  </motion.div>
                  <motion.div style={{ y: featureParallaxY2 }} className="lg:col-span-5 flex justify-center">
                    <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-md text-center">
                      <Cards weight="duotone" className="mx-auto h-12 w-12 text-indigo-600" />
                      <p className="mt-3 font-heading text-lg font-bold text-slate-900">30 Từ Vựng Cần Ôn Hôm Nay</p>
                      <p className="mt-1 text-xs text-slate-500">Hoàn thành bài học để nhận +300 XP</p>
                      <Link
                        to="/decks"
                        className="btn-primary mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold"
                      >
                        Bắt Đầu Ôn Ngay
                      </Link>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {activeTab === 'quiz' && (
                <motion.div
                  key="quiz"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.3 }}
                  className="app-card grid items-center gap-8 rounded-3xl p-8 lg:grid-cols-12"
                >
                  <motion.div style={{ y: featureParallaxY1 }} className="lg:col-span-7">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-purple-600">
                      RÈN LUYỆN PHẢN XẠ
                    </span>
                    <h3 className="mt-2 font-heading text-2xl font-bold text-slate-900">
                      5 Dạng bài trắc nghiệm đa dạng & phong phú
                    </h3>
                    <p className="mt-3 text-slate-600 leading-relaxed">
                      Kiểm tra kiến thức nhạy bén với Trắc nghiệm chọn 1 đáp án (MCQ), Điền từ vào chỗ trống, Ghép cặp từ vựng, Nghe chọn đáp án và Sắp xếp câu hoàn chỉnh.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-lg bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-bold text-slate-700">
                        Multiple Choice
                      </span>
                      <span className="rounded-lg bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-bold text-slate-700">
                        Fill in Blank
                      </span>
                      <span className="rounded-lg bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-bold text-slate-700">
                        Matching Pairs
                      </span>
                      <span className="rounded-lg bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-bold text-slate-700">
                        Listening Quiz
                      </span>
                    </div>
                  </motion.div>
                  <motion.div style={{ y: featureParallaxY2 }} className="lg:col-span-5 flex justify-center">
                    <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                        <span>Câu 3/10</span>
                        <span className="text-indigo-600 font-mono">00:45s</span>
                      </div>
                      <p className="mt-3 font-heading font-bold text-slate-900">
                        Từ nào đồng nghĩa với "Enthusiastic"?
                      </p>
                      <div className="mt-4 space-y-2">
                        <button className="w-full rounded-xl border border-indigo-200 bg-indigo-50 p-2.5 text-left text-xs font-bold text-indigo-700">
                          A. Passionate & Excited
                        </button>
                        <button className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-left text-xs font-semibold text-slate-600">
                          B. Tired & Exhausted
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {activeTab === 'tts' && (
                <motion.div
                  key="tts"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.3 }}
                  className="app-card grid items-center gap-8 rounded-3xl p-8 lg:grid-cols-12"
                >
                  <motion.div style={{ y: featureParallaxY1 }} className="lg:col-span-7">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-600">
                      ÂM THANH NGƯỜI BẢN XỨ
                    </span>
                    <h3 className="mt-2 font-heading text-2xl font-bold text-slate-900">
                      Nghe phát âm chuẩn & ví dụ ngữ cảnh thực tế
                    </h3>
                    <p className="mt-3 text-slate-600 leading-relaxed">
                      Mỗi thẻ từ vựng đều đính kèm file audio phát âm chuẩn Anh - Mỹ và các câu ví dụ minh họa sinh động giúp bạn áp dụng ngay vào giao tiếp.
                    </p>
                  </motion.div>
                  <motion.div style={{ y: featureParallaxY2 }} className="lg:col-span-5 flex justify-center">
                    <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-md">
                      <SpeakerHigh weight="duotone" className="mx-auto h-12 w-12 text-emerald-600 animate-pulse" />
                      <p className="mt-3 font-heading text-xl font-bold text-slate-900">/ˌpɜː.sɪˈvɪə.rəns/</p>
                      <p className="mt-1 text-xs text-slate-500">Giọng đọc chuẩn en-US bản xứ</p>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {activeTab === 'streak' && (
                <motion.div
                  key="streak"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.3 }}
                  className="app-card grid items-center gap-8 rounded-3xl p-8 lg:grid-cols-12"
                >
                  <motion.div style={{ y: featureParallaxY1 }} className="lg:col-span-7">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-600">
                      TẠO ĐỘNG LỰC HỌC MỖI NGÀY
                    </span>
                    <h3 className="mt-2 font-heading text-2xl font-bold text-slate-900">
                      Tích lũy XP, giữ chuỗi Streak & tăng Cấp Độ
                    </h3>
                    <p className="mt-3 text-slate-600 leading-relaxed">
                      Chỉ cần học 1 bài mỗi ngày để bảo vệ chuỗi ngày học Streak. Tích lũy điểm XP qua các thẻ nhớ và bài trắc nghiệm để thăng cấp danh hiệu.
                    </p>
                  </motion.div>
                  <motion.div style={{ y: featureParallaxY2 }} className="lg:col-span-5 flex justify-center">
                    <div className="w-full max-w-sm rounded-2xl border border-amber-200 bg-amber-50/60 p-6 text-center shadow-md">
                      <Flame weight="fill" className="mx-auto h-14 w-14 text-amber-500 animate-bounce" />
                      <p className="mt-2 font-heading text-2xl font-extrabold text-amber-800">14 Ngày Streak!</p>
                      <p className="mt-1 text-xs font-bold text-amber-600">Bạn đang nằm trong Top 10% học viên chăm chỉ</p>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ---------------- SECTION 3: INTERACTIVE SLIDE CAROUSEL DECK SHOWCASE ---------------- */}
      <section className="py-20 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header Controls Bar */}
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h2 className="font-heading text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Khám phá các bộ thẻ chọn lọc
              </h2>
              <p className="mt-2 text-sm text-slate-600">Bấm nút hoặc vuốt để khám phá các bộ thẻ từ vựng hấp dẫn nhất.</p>
            </div>

            {/* Controls Right: Category Pills + Next/Prev Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-white p-1.5 border border-slate-200 shadow-2xs">
                <button
                  onClick={() => handleCategoryChange('all')}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                    selectedCategory === 'all'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => handleCategoryChange('communication')}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                    selectedCategory === 'communication'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Giao Tiếp
                </button>
                <button
                  onClick={() => handleCategoryChange('toeic')}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                    selectedCategory === 'toeic'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  TOEIC
                </button>
                <button
                  onClick={() => handleCategoryChange('ielts')}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                    selectedCategory === 'ielts'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  IELTS
                </button>
              </div>

              {/* Prev / Next Carousel Navigation Arrows */}
              <div className="flex items-center gap-2">
                <button
                  onClick={prevSlide}
                  title="Bộ thẻ trước"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 shadow-xs transition hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 active:scale-95"
                >
                  <CaretLeft weight="bold" className="h-5 w-5" />
                </button>
                <button
                  onClick={nextSlide}
                  title="Bộ thẻ tiếp theo"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 shadow-xs transition hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 active:scale-95"
                >
                  <CaretRight weight="bold" className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Carousel Slide Track */}
          <div className="mt-8 relative w-full overflow-hidden">
            <motion.div
              animate={{ x: `-${carouselIndex * 100}%` }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              className="flex w-full gap-6"
            >
              {filteredDecks.map((deck) => (
                <div
                  key={deck.id}
                  className="w-full shrink-0 sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
                >
                  <div className="group relative flex flex-col justify-between h-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg transition hover:shadow-xl hover:border-indigo-300">
                    {/* Cover Image Container */}
                    <div className="relative h-52 w-full overflow-hidden">
                      <img
                        src={deck.cover}
                        alt={deck.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-transparent" />

                      {/* Cover Photo Pills */}
                      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                        <span className={`rounded-full bg-gradient-to-r ${deck.badgeColor} px-3 py-1 text-xs font-bold text-white shadow-xs`}>
                          {deck.tag}
                        </span>
                        <div className="flex items-center gap-1 rounded-full border border-amber-400/30 bg-slate-950/60 px-2.5 py-0.5 text-xs font-extrabold text-amber-300 backdrop-blur-md">
                          <Star weight="fill" className="h-3.5 w-3.5 text-amber-400" />
                          <span>{deck.rating}</span>
                        </div>
                      </div>

                      {/* Title overlaid at bottom of photo */}
                      <div className="absolute bottom-3 left-5 right-5 text-white">
                        <h3 className="font-heading text-xl font-extrabold text-white leading-tight drop-shadow-sm">
                          {deck.title}
                        </h3>
                      </div>
                    </div>

                    {/* Card Content Body */}
                    <div className="flex flex-1 flex-col justify-between p-5">
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                        {deck.description}
                      </p>

                      {/* Real Vocabulary Chips Preview */}
                      <div className="mt-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Từ vựng nổi bật:
                        </p>
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {deck.sampleWords.map((word, wIdx) => (
                            <span
                              key={wIdx}
                              className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-700"
                            >
                              {word}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Card Footer Info & CTA */}
                      <div className="mt-5 border-t border-slate-100 pt-4">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                          <span className="flex items-center gap-1">
                            <Cards weight="duotone" className="h-4 w-4 text-indigo-600" />
                            {deck.cardCount} thẻ
                          </span>
                          <span className="flex items-center gap-1">
                            <Users weight="duotone" className="h-4 w-4 text-emerald-600" />
                            {deck.learners.toLocaleString()} học viên
                          </span>
                        </div>

                        <Link
                          to="/decks"
                          className="btn-primary mt-4 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold active:scale-[0.98]"
                        >
                          <span>Học Thẻ Ngay</span>
                          <ArrowRight weight="bold" className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Carousel Pagination Dots Indicator */}
          <div className="mt-6 flex items-center justify-center gap-2">
            {filteredDecks.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCarouselIndex(idx)}
                title={`Trang ${idx + 1}`}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  carouselIndex === idx
                    ? 'w-8 bg-indigo-600'
                    : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- SECTION 4: LEARNER REVIEWS ---------------- */}
      <section className="border-t border-slate-200 bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-heading text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Tiến bộ mỗi ngày cùng LingoVerse
            </h2>
            <p className="mt-2 text-base text-slate-600">Cảm nhận thực tế từ các học viên đang học từ vựng mỗi ngày.</p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {learnerReviews.map((review, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="app-card flex flex-col justify-between rounded-2xl p-6"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(5)].map((_, starIndex) => (
                      <Star key={starIndex} weight="fill" className="h-4 w-4" />
                    ))}
                  </div>
                  <p className="mt-4 text-sm text-slate-700 leading-relaxed italic">
                    "{review.comment}"
                  </p>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={review.avatar}
                      alt={review.name}
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-indigo-100"
                    />
                    <div>
                      <h4 className="font-heading text-sm font-bold text-slate-900">{review.name}</h4>
                      <p className="text-[11px] text-slate-500">{review.role}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="block text-xs font-bold text-indigo-600">+{review.learnedWords} từ</span>
                    <span className="text-[10px] font-semibold text-amber-600">{review.streak} ngày streak</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- SECTION 5: FAQ ACCORDION ---------------- */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-heading text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Thắc Mắc Thường Gặp
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Giải đáp các câu hỏi phổ biến giúp bạn bắt đầu học tập hiệu quả nhất.
            </p>
          </div>

          <div className="mt-10 space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="app-card rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="flex w-full items-center justify-between p-5 text-left font-heading text-base font-bold text-slate-900 transition hover:bg-slate-50"
                >
                  <span>{faq.question}</span>
                  <CaretDown
                    weight="bold"
                    className={`h-5 w-5 shrink-0 text-indigo-600 transition-transform duration-200 ${
                      openFaqIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaqIndex === index && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-5 text-sm text-slate-600 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- SECTION 6: BOTTOM CALL TO ACTION ---------------- */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="gradient-indigo-btn relative overflow-hidden rounded-3xl p-10 text-center text-white sm:p-16"
        >
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="font-heading text-3xl font-extrabold sm:text-4xl">
              Bắt đầu hành trình ghi nhớ từ vựng hôm nay!
            </h2>
            <p className="mt-4 text-base text-indigo-100">
              Tạo tài khoản miễn phí chỉ trong 30 giây và trải nghiệm phương pháp học thẻ nhớ thông minh ngay bây giờ.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link
                to="/register"
                className="rounded-xl bg-white px-8 py-3.5 text-base font-bold text-indigo-700 shadow-xl transition hover:bg-slate-100 active:scale-95"
              >
                Tạo Tài Khoản Miễn Phí
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};
