// ⚠️ مفاتيح تجريبية بناءً على طلب صاحب المشروع — في الإنتاج النهائي يُفضل نقلها لـ secrets
export const CONFIG = {
  FIREBASE: {
    apiKey: 'AIzaSyAJMPG8SBYPGZD1axdzRpSlwIugZHLJlX4',
    authDomain: 'monsieur-mostafa.firebaseapp.com',
    projectId: 'monsieur-mostafa',
    storageBucket: 'monsieur-mostafa.firebasestorage.app',
    messagingSenderId: '822495222803',
    appId: '1:822495222803:web:abe2d2a886eef5cdbdb3e6',
    measurementId: 'G-D89L2DK4ZY'
  },
  GEMINI_KEYS: [] as string[],
  TELEGRAM: {
    token: '8919884226:AAEWkihaSv_EXi-sAmchg84Jo_CZlk0Xne0',
    botUsername: 'beshoy_romany_study_bot'
  },
  ADMIN_PASSWORD: '122131',
  SITE: {
    name: 'منصة مسيو مصطفى',
    phone: '01277076081',
    center: 'سنتر أجيال المستقبل — قفط',
    facebook: 'https://www.facebook.com/share/18JAuJCuxr/',
    youtube: 'https://youtube.com/channel/UCqJat3GB-1HVfMTorfJQfaQ',
    instagram: '',
    tiktok: ''
  }
}

export const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${CONFIG.FIREBASE.projectId}/databases/(default)/documents`
export const TG_API = `https://api.telegram.org/bot${CONFIG.TELEGRAM.token}`
