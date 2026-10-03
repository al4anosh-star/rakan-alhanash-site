// ===== إعدادات الموقع الأساسية — عدّل هنا بيانات الشخصية =====
export const site = {
  name: 'راكان الحنش',
  fullName: 'راكان الشيخ صباح غازي الحنش',
  title: 'عضو مجلس النواب العراقي — لجنة النزاهة النيابية',
  slogan: 'نينوى لأهلها',
  welcome:
    'أرحّب بكم في موقعي الرسمي. أنا راكان صباح غازي الحنش، نائب عن محافظة نينوى في مجلس النواب العراقي وعضو لجنة النزاهة النيابية. أضع هذا الموقع بين أيديكم ليكون جسراً مباشراً مع أهلنا في نينوى، نعمل معاً للدفاع عن حقوق المحافظة وخدمة أبنائها.',
  photo: '/img/rakan.jpg',   // رابط صورة الشخصية (اتركه فارغاً لعرض الأيقونة)
  logo: '',    // رابط الشعار
  phone: '',
  email: '',
  address: 'شارع الببسي - الموصل - محافظة نينوى',
  officeHours: 'يومياً من الساعة 4:00 عصراً حتى 9:00 مساءً',
  social: {
    facebook: 'https://www.facebook.com/rakanalhansh/',
    instagram: 'https://www.instagram.com/rakan__alhanash/',
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
