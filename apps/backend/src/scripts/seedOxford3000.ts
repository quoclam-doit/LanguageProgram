import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Deck } from '../models/Deck';
import { Card } from '../models/Card';
import { User } from '../models/User';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/english_learning_db';

const sampleOxfordCards = [
  {
    term: 'Resilience',
    ipa: { us: '/rɪˈzɪl.jəns/', uk: '/rɪˈzɪl.jəns/' },
    meanings: [{ langCode: 'vi', text: 'Khả năng phục hồi, sự kiên cường vượt qua nghịch cảnh', partOfSpeech: 'n' }],
    examples: [
      { en: 'Her resilience helped her overcome every obstacle in learning English.', vi: 'Sự kiên cường giúp cô ấy vượt qua mọi rào cản khi học tiếng Anh.' },
      { en: 'The community showed remarkable resilience after the disaster.', vi: 'Cộng đồng cho thấy sự kiên cường đáng kinh ngạc sau thiên tai.' }
    ]
  },
  {
    term: 'Collaborate',
    ipa: { us: '/kəˈlæb.ə.reɪt/', uk: '/kəˈlæb.ə.reɪt/' },
    meanings: [{ langCode: 'vi', text: 'Hợp tác, phối hợp cùng làm việc', partOfSpeech: 'v' }],
    examples: [
      { en: 'Teams from different departments collaborate on global projects.', vi: 'Các đội ngũ từ các phòng ban khác nhau hợp tác trong dự án toàn cầu.' }
    ]
  },
  {
    term: 'Meticulous',
    ipa: { us: '/məˈtɪk.jə.ləs/', uk: '/məˈtɪk.jə.ləs/' },
    meanings: [{ langCode: 'vi', text: 'Tỉ mỉ, cẩn thận, chỉn chu từng chi tiết', partOfSpeech: 'adj' }],
    examples: [
      { en: 'He gave a meticulous presentation in front of the examiners.', vi: 'Anh ấy có bài trình bày chỉn chu trước các giám khảo.' }
    ]
  },
  {
    term: 'Perseverance',
    ipa: { us: '/ˌpɜː.sɪˈvɪə.rəns/', uk: '/ˌpɜː.sɪˈvɪə.rəns/' },
    meanings: [{ langCode: 'vi', text: 'Sự kiên trì, bền bỉ theo đuổi mục tiêu', partOfSpeech: 'n' }],
    examples: [
      { en: 'Through hard work and perseverance, she passed the IELTS exam.', vi: 'Nhờ chăm chỉ và kiên trì, cô ấy đã vượt qua kỳ thi IELTS.' }
    ]
  },
  {
    term: 'Eloquence',
    ipa: { us: '/ˈel.ə.kwəns/', uk: '/ˈel.ə.kwəns/' },
    meanings: [{ langCode: 'vi', text: 'Khả năng hùng biện, tài ăn nói lưu loát', partOfSpeech: 'n' }],
    examples: [
      { en: 'His speech was full of passion and eloquence.', vi: 'Bài phát biểu của anh ấy tràn đầy nhiệt huyết và sự hùng biện.' }
    ]
  },
  {
    term: 'Pragmatic',
    ipa: { us: '/præɡˈmæt.ɪk/', uk: '/præɡˈmæt.ɪk/' },
    meanings: [{ langCode: 'vi', text: 'Thực tế, trọng thực tiễn', partOfSpeech: 'adj' }],
    examples: [
      { en: 'We need a pragmatic approach to solving this software bug.', vi: 'Chúng ta cần giải pháp thực tế để khắc phục lỗi phần mềm này.' }
    ]
  }
];

export async function seedOxford3000() {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGO_URI);
    }
    console.log('[Seed] Connected to MongoDB Atlas...');

    // Find or create admin user
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      adminUser = await User.create({
        email: 'admin@lingoverse.app',
        passwordHash: 'admin_seeded_hash',
        name: 'LingoVerse Admin',
        role: 'admin',
        nativeLang: 'vi',
        targetLangs: ['en'],
      });
    }

    // Find or create Oxford 3000 Deck
    let deck = await Deck.findOne({ title: 'Oxford 3000 Từ Thông Dụng' });
    if (!deck) {
      deck = await Deck.create({
        ownerId: adminUser._id,
        langCode: 'en',
        title: 'Oxford 3000 Từ Thông Dụng',
        description: '3000 từ vựng cốt lõi bao phủ 85% hội thoại tiếng Anh hàng ngày.',
        isPublic: true,
        status: 'approved',
        tags: ['oxford', 'communication', 'foundation'],
        cardCount: 0,
      });
    }

    // Clear existing cards in deck to prevent duplicates
    await Card.deleteMany({ deckId: deck._id });

    for (const cardData of sampleOxfordCards) {
      await Card.create({
        ...cardData,
        deckId: deck._id,
        langCode: 'en',
      });
    }

    deck.cardCount = sampleOxfordCards.length;
    await deck.save();

    console.log(`[Seed] Successfully seeded Oxford 3000 Deck ID ${deck._id} with ${sampleOxfordCards.length} cards!`);
  } catch (error) {
    console.error('[Seed Error]:', error);
  }
}

if (require.main === module) {
  seedOxford3000().then(() => mongoose.disconnect());
}
