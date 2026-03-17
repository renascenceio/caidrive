'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type Language = 'en' | 'ru' | 'zh' | 'ar' | 'hi' | 'ko' | 'ja' | 'pt'

interface LanguageInfo {
  code: Language
  name: string
  nativeName: string
  flag: string
  dir: 'ltr' | 'rtl'
}

export const languages: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', dir: 'ltr' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇦🇪', dir: 'rtl' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', dir: 'ltr' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', dir: 'ltr' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', dir: 'ltr' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷', dir: 'ltr' },
]

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  dir: 'ltr' | 'rtl'
  languageInfo: LanguageInfo
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Translations
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.cars': 'Cars',
    'nav.places': 'Places',
    'nav.rides': 'My Rides',
    'nav.profile': 'Profile',
    'nav.wishlist': 'Wishlist',
    'nav.login': 'Login',
    'nav.signup': 'Sign Up',
    'nav.logout': 'Logout',
    
    // Home
    'home.hero.title': 'The Ultimate Luxury Car Experience',
    'home.hero.subtitle': 'Discover and rent the world\'s most exceptional vehicles',
    'home.search.placeholder': 'Search anything...',
    'home.search.hint': 'Cars, brands, features, or ask in natural language',
    'home.featured': 'Featured Collection',
    'home.popular': 'Popular Cars',
    'home.viewAll': 'View All',
    
    // Cars
    'cars.title': 'Browse Cars',
    'cars.filter': 'Filter',
    'cars.sort': 'Sort',
    'cars.perDay': 'per day',
    'cars.book': 'Book Now',
    'cars.details': 'View Details',
    
    // Places
    'places.title': 'Exclusive Places',
    'places.subtitle': 'Partner locations with special offers for CAI members',
    'places.discount': 'off',
    
    // Auth
    'auth.login.title': 'Welcome Back',
    'auth.login.subtitle': 'Sign in to continue your journey',
    'auth.signup.title': 'Join CAI',
    'auth.signup.subtitle': 'Create an account to get started',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.fullName': 'Full Name',
    'auth.forgotPassword': 'Forgot password?',
    'auth.noAccount': 'Don\'t have an account?',
    'auth.hasAccount': 'Already have an account?',
    
    // Profile
    'profile.title': 'My Profile',
    'profile.settings': 'Settings',
    'profile.documents': 'Documents',
    'profile.payments': 'Payment Methods',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.retry': 'Try Again',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.confirm': 'Confirm',
  },
  ru: {
    'nav.home': 'Главная',
    'nav.cars': 'Автомобили',
    'nav.places': 'Места',
    'nav.rides': 'Мои поездки',
    'nav.profile': 'Профиль',
    'nav.wishlist': 'Избранное',
    'nav.login': 'Войти',
    'nav.signup': 'Регистрация',
    'nav.logout': 'Выйти',
    
    'home.hero.title': 'Лучший опыт люксовых автомобилей',
    'home.hero.subtitle': 'Откройте и арендуйте самые эксклюзивные автомобили мира',
    'home.search.placeholder': 'Искать...',
    'home.search.hint': 'Автомобили, бренды, функции или спросите на естественном языке',
    'home.featured': 'Избранная коллекция',
    'home.popular': 'Популярные автомобили',
    'home.viewAll': 'Смотреть все',
    
    'cars.title': 'Каталог автомобилей',
    'cars.filter': 'Фильтр',
    'cars.sort': 'Сортировка',
    'cars.perDay': 'в день',
    'cars.book': 'Забронировать',
    'cars.details': 'Подробнее',
    
    'places.title': 'Эксклюзивные места',
    'places.subtitle': 'Партнерские локации со специальными предложениями для участников CAI',
    'places.discount': 'скидка',
    
    'auth.login.title': 'С возвращением',
    'auth.login.subtitle': 'Войдите, чтобы продолжить',
    'auth.signup.title': 'Присоединяйтесь к CAI',
    'auth.signup.subtitle': 'Создайте аккаунт для начала',
    'auth.email': 'Email',
    'auth.password': 'Пароль',
    'auth.confirmPassword': 'Подтвердите пароль',
    'auth.fullName': 'Полное имя',
    'auth.forgotPassword': 'Забыли пароль?',
    'auth.noAccount': 'Нет аккаунта?',
    'auth.hasAccount': 'Уже есть аккаунт?',
    
    'profile.title': 'Мой профиль',
    'profile.settings': 'Настройки',
    'profile.documents': 'Документы',
    'profile.payments': 'Способы оплаты',
    
    'common.loading': 'Загрузка...',
    'common.error': 'Произошла ошибка',
    'common.retry': 'Повторить',
    'common.cancel': 'Отмена',
    'common.save': 'Сохранить',
    'common.edit': 'Редактировать',
    'common.delete': 'Удалить',
    'common.confirm': 'Подтвердить',
  },
  zh: {
    'nav.home': '首页',
    'nav.cars': '汽车',
    'nav.places': '地点',
    'nav.rides': '我的行程',
    'nav.profile': '个人资料',
    'nav.wishlist': '收藏夹',
    'nav.login': '登录',
    'nav.signup': '注册',
    'nav.logout': '退出',
    
    'home.hero.title': '终极豪华汽车体验',
    'home.hero.subtitle': '发现并租赁世界上最卓越的车辆',
    'home.search.placeholder': '搜索...',
    'home.search.hint': '汽车、品牌、功能或自然语言查询',
    'home.featured': '精选系列',
    'home.popular': '热门汽车',
    'home.viewAll': '查看全部',
    
    'cars.title': '浏览汽车',
    'cars.filter': '筛选',
    'cars.sort': '排序',
    'cars.perDay': '每天',
    'cars.book': '立即预订',
    'cars.details': '查看详情',
    
    'places.title': '专属场所',
    'places.subtitle': 'CAI会员专享优惠的合作伙伴场所',
    'places.discount': '折扣',
    
    'auth.login.title': '欢迎回来',
    'auth.login.subtitle': '登录以继续您的旅程',
    'auth.signup.title': '加入CAI',
    'auth.signup.subtitle': '创建账户开始使用',
    'auth.email': '电子邮件',
    'auth.password': '密码',
    'auth.confirmPassword': '确认密码',
    'auth.fullName': '全名',
    'auth.forgotPassword': '忘记密码？',
    'auth.noAccount': '没有账户？',
    'auth.hasAccount': '已有账户？',
    
    'profile.title': '我的资料',
    'profile.settings': '设置',
    'profile.documents': '文件',
    'profile.payments': '支付方式',
    
    'common.loading': '加载中...',
    'common.error': '发生错误',
    'common.retry': '重试',
    'common.cancel': '取消',
    'common.save': '保存',
    'common.edit': '编辑',
    'common.delete': '删除',
    'common.confirm': '确认',
  },
  ar: {
    'nav.home': 'الرئيسية',
    'nav.cars': 'السيارات',
    'nav.places': 'الأماكن',
    'nav.rides': 'رحلاتي',
    'nav.profile': 'الملف الشخصي',
    'nav.wishlist': 'المفضلة',
    'nav.login': 'تسجيل الدخول',
    'nav.signup': 'إنشاء حساب',
    'nav.logout': 'تسجيل الخروج',
    
    'home.hero.title': 'تجربة السيارات الفاخرة المثالية',
    'home.hero.subtitle': 'اكتشف واستأجر أفخم السيارات في العالم',
    'home.search.placeholder': 'ابحث...',
    'home.search.hint': 'السيارات، العلامات التجارية، الميزات أو اسأل بلغة طبيعية',
    'home.featured': 'المجموعة المميزة',
    'home.popular': 'السيارات الشائعة',
    'home.viewAll': 'عرض الكل',
    
    'cars.title': 'تصفح السيارات',
    'cars.filter': 'تصفية',
    'cars.sort': 'ترتيب',
    'cars.perDay': 'في اليوم',
    'cars.book': 'احجز الآن',
    'cars.details': 'عرض التفاصيل',
    
    'places.title': 'أماكن حصرية',
    'places.subtitle': 'مواقع شركاء مع عروض خاصة لأعضاء CAI',
    'places.discount': 'خصم',
    
    'auth.login.title': 'مرحباً بعودتك',
    'auth.login.subtitle': 'سجل الدخول لمتابعة رحلتك',
    'auth.signup.title': 'انضم إلى CAI',
    'auth.signup.subtitle': 'أنشئ حساباً للبدء',
    'auth.email': 'البريد الإلكتروني',
    'auth.password': 'كلمة المرور',
    'auth.confirmPassword': 'تأكيد كلمة المرور',
    'auth.fullName': 'الاسم الكامل',
    'auth.forgotPassword': 'نسيت كلمة المرور؟',
    'auth.noAccount': 'ليس لديك حساب؟',
    'auth.hasAccount': 'لديك حساب بالفعل؟',
    
    'profile.title': 'ملفي الشخصي',
    'profile.settings': 'الإعدادات',
    'profile.documents': 'المستندات',
    'profile.payments': 'طرق الدفع',
    
    'common.loading': 'جاري التحميل...',
    'common.error': 'حدث خطأ',
    'common.retry': 'حاول مرة أخرى',
    'common.cancel': 'إلغاء',
    'common.save': 'حفظ',
    'common.edit': 'تعديل',
    'common.delete': 'حذف',
    'common.confirm': 'تأكيد',
  },
  hi: {
    'nav.home': 'होम',
    'nav.cars': 'कारें',
    'nav.places': 'स्थान',
    'nav.rides': 'मेरी राइड्स',
    'nav.profile': 'प्रोफाइल',
    'nav.wishlist': 'विशलिस्ट',
    'nav.login': 'लॉगिन',
    'nav.signup': 'साइन अप',
    'nav.logout': 'लॉगआउट',
    
    'home.hero.title': 'अंतिम लक्जरी कार अनुभव',
    'home.hero.subtitle': 'दुनिया की सबसे असाधारण कारों को खोजें और किराए पर लें',
    'home.search.placeholder': 'खोजें...',
    'home.search.hint': 'कारें, ब्रांड, फीचर्स या प्राकृतिक भाषा में पूछें',
    'home.featured': 'विशेष संग्रह',
    'home.popular': 'लोकप्रिय कारें',
    'home.viewAll': 'सभी देखें',
    
    'cars.title': 'कारें ब्राउज़ करें',
    'cars.filter': 'फिल्टर',
    'cars.sort': 'सॉर्ट',
    'cars.perDay': 'प्रति दिन',
    'cars.book': 'अभी बुक करें',
    'cars.details': 'विवरण देखें',
    
    'places.title': 'एक्सक्लूसिव स्थान',
    'places.subtitle': 'CAI सदस्यों के लिए विशेष ऑफर वाले पार्टनर लोकेशन',
    'places.discount': 'छूट',
    
    'auth.login.title': 'वापस स्वागत है',
    'auth.login.subtitle': 'जारी रखने के लिए साइन इन करें',
    'auth.signup.title': 'CAI से जुड़ें',
    'auth.signup.subtitle': 'शुरू करने के लिए अकाउंट बनाएं',
    'auth.email': 'ईमेल',
    'auth.password': 'पासवर्ड',
    'auth.confirmPassword': 'पासवर्ड की पुष्टि करें',
    'auth.fullName': 'पूरा नाम',
    'auth.forgotPassword': 'पासवर्ड भूल गए?',
    'auth.noAccount': 'खाता नहीं है?',
    'auth.hasAccount': 'पहले से खाता है?',
    
    'profile.title': 'मेरी प्रोफाइल',
    'profile.settings': 'सेटिंग्स',
    'profile.documents': 'दस्तावेज',
    'profile.payments': 'भुगतान विधियाँ',
    
    'common.loading': 'लोड हो रहा है...',
    'common.error': 'एक त्रुटि हुई',
    'common.retry': 'पुनः प्रयास करें',
    'common.cancel': 'रद्द करें',
    'common.save': 'सहेजें',
    'common.edit': 'संपादित करें',
    'common.delete': 'हटाएं',
    'common.confirm': 'पुष्टि करें',
  },
  ko: {
    'nav.home': '홈',
    'nav.cars': '자동차',
    'nav.places': '장소',
    'nav.rides': '내 라이드',
    'nav.profile': '프로필',
    'nav.wishlist': '위시리스트',
    'nav.login': '로그인',
    'nav.signup': '회원가입',
    'nav.logout': '로그아웃',
    
    'home.hero.title': '최고의 럭셔리 자동차 경험',
    'home.hero.subtitle': '세계에서 가장 특별한 차량을 발견하고 렌트하세요',
    'home.search.placeholder': '검색...',
    'home.search.hint': '자동차, 브랜드, 기능 또는 자연어로 질문',
    'home.featured': '추천 컬렉션',
    'home.popular': '인기 자동차',
    'home.viewAll': '전체 보기',
    
    'cars.title': '자동차 찾아보기',
    'cars.filter': '필터',
    'cars.sort': '정렬',
    'cars.perDay': '일당',
    'cars.book': '지금 예약',
    'cars.details': '상세 보기',
    
    'places.title': '특별한 장소',
    'places.subtitle': 'CAI 회원을 위한 특별 혜택이 있는 파트너 장소',
    'places.discount': '할인',
    
    'auth.login.title': '다시 오신 것을 환영합니다',
    'auth.login.subtitle': '계속하려면 로그인하세요',
    'auth.signup.title': 'CAI 가입',
    'auth.signup.subtitle': '시작하려면 계정을 만드세요',
    'auth.email': '이메일',
    'auth.password': '비밀번호',
    'auth.confirmPassword': '비밀번호 확인',
    'auth.fullName': '전체 이름',
    'auth.forgotPassword': '비밀번호를 잊으셨나요?',
    'auth.noAccount': '계정이 없으신가요?',
    'auth.hasAccount': '이미 계정이 있으신가요?',
    
    'profile.title': '내 프로필',
    'profile.settings': '설정',
    'profile.documents': '문서',
    'profile.payments': '결제 수단',
    
    'common.loading': '로딩 중...',
    'common.error': '오류가 발생했습니다',
    'common.retry': '다시 시도',
    'common.cancel': '취소',
    'common.save': '저장',
    'common.edit': '편집',
    'common.delete': '삭제',
    'common.confirm': '확인',
  },
  ja: {
    'nav.home': 'ホーム',
    'nav.cars': '車',
    'nav.places': '場所',
    'nav.rides': 'マイライド',
    'nav.profile': 'プロフィール',
    'nav.wishlist': 'お気に入り',
    'nav.login': 'ログイン',
    'nav.signup': '新規登録',
    'nav.logout': 'ログアウト',
    
    'home.hero.title': '究極のラグジュアリーカー体験',
    'home.hero.subtitle': '世界で最も優れた車両を発見してレンタル',
    'home.search.placeholder': '検索...',
    'home.search.hint': '車、ブランド、機能、または自然言語で質問',
    'home.featured': '注目のコレクション',
    'home.popular': '人気の車',
    'home.viewAll': 'すべて見る',
    
    'cars.title': '車を探す',
    'cars.filter': 'フィルター',
    'cars.sort': '並び替え',
    'cars.perDay': '日額',
    'cars.book': '今すぐ予約',
    'cars.details': '詳細を見る',
    
    'places.title': '特別な場所',
    'places.subtitle': 'CAIメンバー向け特別オファーのパートナー施設',
    'places.discount': '割引',
    
    'auth.login.title': 'おかえりなさい',
    'auth.login.subtitle': '続けるにはサインインしてください',
    'auth.signup.title': 'CAIに参加',
    'auth.signup.subtitle': '始めるにはアカウントを作成',
    'auth.email': 'メール',
    'auth.password': 'パスワード',
    'auth.confirmPassword': 'パスワードの確認',
    'auth.fullName': 'フルネーム',
    'auth.forgotPassword': 'パスワードをお忘れですか？',
    'auth.noAccount': 'アカウントをお持ちでないですか？',
    'auth.hasAccount': 'すでにアカウントをお持ちですか？',
    
    'profile.title': 'マイプロフィール',
    'profile.settings': '設定',
    'profile.documents': '書類',
    'profile.payments': '支払い方法',
    
    'common.loading': '読み込み中...',
    'common.error': 'エラーが発生しました',
    'common.retry': '再試行',
    'common.cancel': 'キャンセル',
    'common.save': '保存',
    'common.edit': '編集',
    'common.delete': '削除',
    'common.confirm': '確認',
  },
  pt: {
    'nav.home': 'Início',
    'nav.cars': 'Carros',
    'nav.places': 'Lugares',
    'nav.rides': 'Minhas Viagens',
    'nav.profile': 'Perfil',
    'nav.wishlist': 'Favoritos',
    'nav.login': 'Entrar',
    'nav.signup': 'Cadastrar',
    'nav.logout': 'Sair',
    
    'home.hero.title': 'A Experiência Definitiva em Carros de Luxo',
    'home.hero.subtitle': 'Descubra e alugue os veículos mais excepcionais do mundo',
    'home.search.placeholder': 'Pesquisar...',
    'home.search.hint': 'Carros, marcas, recursos ou pergunte em linguagem natural',
    'home.featured': 'Coleção em Destaque',
    'home.popular': 'Carros Populares',
    'home.viewAll': 'Ver Tudo',
    
    'cars.title': 'Explorar Carros',
    'cars.filter': 'Filtrar',
    'cars.sort': 'Ordenar',
    'cars.perDay': 'por dia',
    'cars.book': 'Reservar Agora',
    'cars.details': 'Ver Detalhes',
    
    'places.title': 'Lugares Exclusivos',
    'places.subtitle': 'Locais parceiros com ofertas especiais para membros CAI',
    'places.discount': 'desconto',
    
    'auth.login.title': 'Bem-vindo de Volta',
    'auth.login.subtitle': 'Entre para continuar sua jornada',
    'auth.signup.title': 'Junte-se ao CAI',
    'auth.signup.subtitle': 'Crie uma conta para começar',
    'auth.email': 'E-mail',
    'auth.password': 'Senha',
    'auth.confirmPassword': 'Confirmar Senha',
    'auth.fullName': 'Nome Completo',
    'auth.forgotPassword': 'Esqueceu a senha?',
    'auth.noAccount': 'Não tem uma conta?',
    'auth.hasAccount': 'Já tem uma conta?',
    
    'profile.title': 'Meu Perfil',
    'profile.settings': 'Configurações',
    'profile.documents': 'Documentos',
    'profile.payments': 'Métodos de Pagamento',
    
    'common.loading': 'Carregando...',
    'common.error': 'Ocorreu um erro',
    'common.retry': 'Tentar Novamente',
    'common.cancel': 'Cancelar',
    'common.save': 'Salvar',
    'common.edit': 'Editar',
    'common.delete': 'Excluir',
    'common.confirm': 'Confirmar',
  },
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')

  useEffect(() => {
    const saved = localStorage.getItem('cai-language') as Language
    if (saved && languages.some(l => l.code === saved)) {
      setLanguageState(saved)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('cai-language', lang)
    // Update HTML dir attribute for RTL languages
    document.documentElement.dir = languages.find(l => l.code === lang)?.dir || 'ltr'
  }

  const t = (key: string): string => {
    return translations[language][key] || translations['en'][key] || key
  }

  const languageInfo = languages.find(l => l.code === language) || languages[0]

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      t, 
      dir: languageInfo.dir,
      languageInfo 
    }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
