// ===== إعدادات الموقع الأساسية — عدّل هنا بيانات الشخصية =====
export const site = {
  name: 'راكان الحنش',
  fullName: 'راكان الشيخ صباح غازي الحنش',
  title: 'عضو مجلس النواب العراقي — لجنة النزاهة النيابية',
  slogan: 'نينوى لأهلها',
  welcome:
    'أرحّب بكم في موقعي الرسمي. أنا راكان الشيخ صباح غازي الحنش، نائب عن محافظة نينوى في مجلس النواب العراقي وعضو لجنة النزاهة النيابية. أضع هذا الموقع بين أيديكم ليكون جسراً مباشراً مع أهلنا في نينوى، نعمل معاً للدفاع عن حقوق المحافظة وخدمة أبنائها.',
  photo: '/img/rakan.jpg',   // رابط صورة الشخصية (اتركه فارغاً لعرض الأيقونة)
  logo: '/img/brand/emblem.png',   // شعار المكتب (الذهبي الدائري)
  nameImage: '/img/brand/name-blue.png',   // الاسم المزخرف بالخط الديواني/الثلث
  nameImageWhite: '/img/brand/name-white.png',
  committeeLogo: '/img/brand/committee.png',    // رابط الشعار
  phone: '07779006161',
  email: 'rakanalhansh313@gmail.com',
  address: 'الموصل - الجانب الأيسر - حي الوحدة - شارع البيبسي - مقابل بنزينخانة السيادة',
  // قنوات استلام الطلبات (للاستضافة الثابتة): أرقام بصيغة دولية بدون + مثل 9647701234567، ومعرّف تلغرام بدون @
  requestChannels: { whatsapp: '9647779006161', telegramUser: '' },
  // الشكاوى والبلاغات التي يستقبلها المكتب بصفته عضواً في لجنة النزاهة (من إعلان المكتب الرسمي)
  complaintAreas: ['الفساد الإداري', 'الرشوة', 'الابتزاز', 'استغلال المناصب', 'تأخير معاملات المواطنين', 'هدر المال العام'],
  officeHours: 'يومياً من الساعة 4:00 عصراً حتى 9:00 مساءً',
  social: {
    facebook: 'https://www.facebook.com/rakanalhansh/',
    instagram: 'https://www.instagram.com/rakan__alhanash/',
    whatsapp: 'https://wa.me/9647779006161',
    telegram: 'https://t.me/rakanalhanash1',
    x: 'https://x.com/rakanalhanash',
  },
}

export const provinces = [
  'بغداد', 'نينوى', 'البصرة', 'أربيل', 'السليمانية', 'دهوك', 'كركوك', 'الأنبار',
  'صلاح الدين', 'ديالى', 'بابل', 'كربلاء', 'النجف', 'القادسية', 'واسط',
  'ذي قار', 'ميسان', 'المثنى', 'حلبجة',
]

export const requestTypes = ['طلب خدمة', 'شكوى', 'طلب توظيف', 'طلب مساعدة', 'اقتراح', 'أخرى']
export const requestStatuses = {
  new: { label: 'جديد', color: 'bg-blue-100 text-blue-800' },
  in_progress: { label: 'قيد المتابعة', color: 'bg-amber-100 text-amber-800' },
  done: { label: 'منجز', color: 'bg-green-100 text-green-800' },
}
export const newsCategories = ['نشاطات', 'زيارات ميدانية', 'جلسات البرلمان', 'بيانات', 'لقاءات']
