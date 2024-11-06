
# מערכת ניהול תיקונים - הוראות התקנה והפעלה

## דרישות מערכת
- Node.js גרסה 14 ומעלה
- MongoDB גרסה 4.4 ומעלה

## צעדי התקנה

1. התקנת MongoDB (אם לא מותקן):
   - הורד והתקן מ: https://www.mongodb.com/try/download/community

2. הכנת הפרויקט:
```bash
# יצירת תיקיית הפרויקט
mkdir repair-system
cd repair-system

# יצירת תיקיית שרת
mkdir server
cd server

# העתקת קבצי הפרויקט
# העתק את כל הקבצים מהקוד שסופק לתיקייה הנוכחית

# התקנת תלויות
npm install
```

3. הגדרת משתני סביבה:
   - צור קובץ `.env` בתיקיית `server`
   - העתק את התוכן שסופק לקובץ

## הפעלת המערכת

1. וודא ש-MongoDB רץ:
```bash
# בדיקת סטטוס MongoDB
mongo --eval "db.version()"
```

2. הפעלת השרת:
```bash
# מצב פיתוח
npm run dev

# מצב ייצור
npm start
```

## פתרון בעיות נפוצות

1. בעיית פורט תפוס:
   - המערכת תנסה אוטומטית פורטים חלופיים
   - ניתן לשנות את הפורט בקובץ `.env`

2. בעיית חיבור ל-MongoDB:
   - וודא שהשירות רץ
   - בדוק את ה-URI בקובץ `.env`

3. בעיות התקנה:
   - נקה את תיקיית node_modules והתקן מחדש:
```bash
rm -rf node_modules
npm install
```

## מבנה תיקיות
```
server/
├── src/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   └── index.js
├── .env
└── package.json
```

## תמיכה
לתמיכה ושאלות, פנה ל: [your-email/contact]
