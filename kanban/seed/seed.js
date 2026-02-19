import 'dotenv/config'
import { initializeApp } from 'firebase/app'
import { getFirestore, setDoc, doc } from 'firebase/firestore'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

const app = initializeApp({
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
})

const db = getFirestore(app)
const storage = getStorage(app)

// --- USERS ---
const USERS = [
  { id: 'master-rd', name: 'מאסטר R&D', avatarColor: '#6366f1' },
  { id: 'aurbachs',  name: 'אורבאכס',   avatarColor: '#f59e0b' },
  { id: 'shanshan',  name: 'שנשן',       avatarColor: '#10b981' },
  { id: 'bagi',      name: 'בגי',        avatarColor: '#ef4444' },
  { id: 'forest',    name: 'פורסט',      avatarColor: '#8b5cf6' },
]

// --- TASKS ---
const TASKS = [
  // Category 1: תשתית, אבטחה ונתונים
  { title: 'הקמת DB לשמירה',                           type: 'BE',   priority: 'critical', category: 'תשתית, אבטחה ונתונים' },
  { title: 'התחברות דרך Google (מימוש לוגיקה)',         type: 'BOTH', priority: 'critical', category: 'תשתית, אבטחה ונתונים' },
  { title: 'מסך התחברות (UI)',                          type: 'FE',   priority: 'high',     category: 'תשתית, אבטחה ונתונים' },
  { title: 'כפתור Logout',                              type: 'FE',   priority: 'medium',   category: 'תשתית, אבטחה ונתונים' },
  { title: 'התחברות באמצעות מייל וסיסמא',              type: 'BOTH', priority: 'high',     category: 'תשתית, אבטחה ונתונים' },
  { title: 'חיבור ל-AI דרך OpenRouter (Service)',       type: 'BE',   priority: 'critical', category: 'תשתית, אבטחה ונתונים' },
  { title: 'כתיבת Logs',                               type: 'BE',   priority: 'low',      category: 'תשתית, אבטחה ונתונים' },
  { title: 'שינוי Settings של יוזר',                   type: 'BOTH', priority: 'medium',   category: 'תשתית, אבטחה ונתונים' },
  { title: 'תמיכה בעברית (RTL & AI Logic)',             type: 'BOTH', priority: 'high',     category: 'תשתית, אבטחה ונתונים' },
  { title: 'אופטימיזציה של ה-DB (אינדקסים)',           type: 'BE',   priority: 'medium',   category: 'תשתית, אבטחה ונתונים' },
  { title: 'אבטחת מפתחות API (Environment Variables)', type: 'BE',   priority: 'critical', category: 'תשתית, אבטחה ונתונים' },

  // Category 2: ממשק משתמש וחווית שימוש
  { title: 'עיצוב Cards לטיולים',                      type: 'FE',   priority: 'high',   category: 'ממשק משתמש וחווית שימוש' },
  { title: 'שימוש ב-Unsplash API לתמונות דינמיות',     type: 'FE',   priority: 'medium', category: 'ממשק משתמש וחווית שימוש' },
  { title: 'Toggle מצב Dark/Light',                    type: 'FE',   priority: 'low',    category: 'ממשק משתמש וחווית שימוש' },
  { title: 'טעינת Skeleton בזמן יצירה',                type: 'FE',   priority: 'medium', category: 'ממשק משתמש וחווית שימוש' },
  { title: 'התאמה למובייל (Responsiveness)',            type: 'FE',   priority: 'high',   category: 'ממשק משתמש וחווית שימוש' },
  { title: 'התמודדות עם שגיאות (Snackbar/Toasts)',     type: 'FE',   priority: 'medium', category: 'ממשק משתמש וחווית שימוש' },
  { title: 'בנייה והוספת לוגו',                        type: 'FE',   priority: 'low',    category: 'ממשק משתמש וחווית שימוש' },
  { title: 'נגישות (Accessibility & Aria tags)',        type: 'FE',   priority: 'low',    category: 'ממשק משתמש וחווית שימוש' },

  // Category 3: מנוע תכנון הטיול וה-AI
  { title: 'טופס תכנון טיול מרכזי (ממשק משתמש)',           type: 'FE',   priority: 'critical', category: 'מנוע תכנון הטיול וה-AI' },
  { title: 'עיבוד פרמטרי טיול ושליחה ל-AI (לוגיקת שרת)', type: 'BE',   priority: 'critical', category: 'מנוע תכנון הטיול וה-AI' },
  { title: 'מצב עריכה חכמה (AI Chat/Update)',               type: 'BOTH', priority: 'high',     category: 'מנוע תכנון הטיול וה-AI' },
  { title: 'בקשה לבניית רשימת ציוד (Checklist)',            type: 'BOTH', priority: 'medium',   category: 'מנוע תכנון הטיול וה-AI' },
  { title: 'שילוב תחזית מזג אוויר',                        type: 'BOTH', priority: 'medium',   category: 'מנוע תכנון הטיול וה-AI' },
  { title: 'מנוע חיפוש טיולים שמורים לפי שם',              type: 'BOTH', priority: 'low',      category: 'מנוע תכנון הטיול וה-AI' },
  { title: 'חיפוש/סינון לפי תאריך',                        type: 'BOTH', priority: 'low',      category: 'מנוע תכנון הטיול וה-AI' },
  { title: 'הצעה ל"מסלול דומה"',                           type: 'BE',   priority: 'low',      category: 'מנוע תכנון הטיול וה-AI' },
  { title: 'ניתוח סנטימנט למקומות (ביקורות AI)',            type: 'BE',   priority: 'low',      category: 'מנוע תכנון הטיול וה-AI' },

  // Category 4: מפות ואינטגרציות
  { title: 'חיבור ל-Google Maps API',                      type: 'FE',   priority: 'high',   category: 'מפות ואינטגרציות' },
  { title: 'הצגת Markers על המפה',                         type: 'FE',   priority: 'high',   category: 'מפות ואינטגרציות' },
  { title: 'אייקונים ומספרים מקודדים במפה',                type: 'FE',   priority: 'medium', category: 'מפות ואינטגרציות' },
  { title: 'כרטיסים לאירועים - אינטגרציה (Ticketmaster)',  type: 'BE',   priority: 'medium', category: 'מפות ואינטגרציות' },
  { title: 'כרטיסים לאירועים - תצוגה בלו"ז',              type: 'FE',   priority: 'medium', category: 'מפות ואינטגרציות' },
  { title: 'חיבור ל-API של מלונות',                        type: 'BOTH', priority: 'medium', category: 'מפות ואינטגרציות' },
  { title: 'תצוגת Street View',                            type: 'FE',   priority: 'low',    category: 'מפות ואינטגרציות' },

  // Category 5: ניהול, עריכה וכלים
  { title: 'מערכת ניהול הוצאות (הזנת עלויות)',             type: 'BOTH', priority: 'medium', category: 'ניהול, עריכה וכלים' },
  { title: 'חישוב הוצאות משוער (תקציב כולל)',              type: 'BE',   priority: 'medium', category: 'ניהול, עריכה וכלים' },
  { title: 'שיתוף טיול דרך קישור ציבורי',                 type: 'BOTH', priority: 'high',   category: 'ניהול, עריכה וכלים' },
  { title: 'הזמנה לעריכה במייל (Multi-user)',              type: 'BOTH', priority: 'medium', category: 'ניהול, עריכה וכלים' },
  { title: 'שינוי סדר אטרקציות (Drag & Drop)',             type: 'FE',   priority: 'medium', category: 'ניהול, עריכה וכלים' },
  { title: 'מצב עריכה ידנית (מחיקה/הוספה)',                type: 'BOTH', priority: 'high',   category: 'ניהול, עריכה וכלים' },
  { title: 'ייצוא ל-PDF',                                  type: 'FE',   priority: 'medium', category: 'ניהול, עריכה וכלים' },
  { title: 'ייצוא ל-CSV',                                  type: 'FE',   priority: 'low',    category: 'ניהול, עריכה וכלים' },
  { title: 'המרת מטבע דינמית',                             type: 'BOTH', priority: 'low',    category: 'ניהול, עריכה וכלים' },
  { title: 'היסטוריית שינויים (Version Control)',           type: 'BE',   priority: 'low',    category: 'ניהול, עריכה וכלים' },

  // Category 6: DevOps ואיכות
  { title: 'העלאה ל-GH Pages / Deployment',                type: 'FE',   priority: 'high',   category: 'DevOps ואיכות' },
  { title: 'הגדרת ביקורת קוד אוטומטית (Claude Code)',      type: 'BE',   priority: 'low',    category: 'DevOps ואיכות' },
  { title: 'טסט E2E עם Playwright',                        type: 'BOTH', priority: 'medium', category: 'DevOps ואיכות' },
  { title: 'חיבור ל-GitHub (CI/CD)',                       type: 'BE',   priority: 'high',   category: 'DevOps ואיכות' },
]

async function uploadAvatarAndGetUrl(user) {
  const extensions = ['jpg', 'jpeg', 'png', 'webp']
  for (const ext of extensions) {
    const path = resolve(`avatars/${user.id}.${ext}`)
    if (existsSync(path)) {
      try {
        const file = readFileSync(path)
        const storageRef = ref(storage, `avatars/${user.id}`)
        await uploadBytes(storageRef, file)
        return getDownloadURL(storageRef)
      } catch (err) {
        console.warn(`  ⚠ Storage upload failed for ${user.name}: ${err.message}`)
        console.warn('    → Using color fallback. Enable Firebase Storage in the console to upload avatars.')
        return null
      }
    }
  }
  return null
}

async function seedUsers() {
  console.log('Seeding users...')
  for (const user of USERS) {
    const avatarUrl = await uploadAvatarAndGetUrl(user)
    await setDoc(doc(db, 'users', user.id), {
      name: user.name,
      avatarColor: user.avatarColor,
      avatarUrl: avatarUrl || null,
    })
    console.log(`  ✓ ${user.name} (avatar: ${avatarUrl ? 'uploaded' : 'color fallback'})`)
  }
}

async function seedTasks() {
  console.log('Seeding tasks...')
  for (let i = 0; i < TASKS.length; i++) {
    const task = TASKS[i]
    await setDoc(doc(db, 'tasks', `task-${String(i + 1).padStart(3, '0')}`), {
      title: task.title,
      description: '',
      type: task.type,
      priority: task.priority,
      category: task.category,
      assigneeId: null,
      status: 'backlog',
      order: i,
    })
    console.log(`  ✓ [${task.type}] ${task.title}`)
  }
}

async function main() {
  await seedUsers()
  await seedTasks()
  console.log('\nDone! All users and tasks seeded.')
  process.exit(0)
}

main().catch(err => { console.error(err); process.exit(1) })
