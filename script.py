import re

with open('App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

replacements = [
    (
        r"{new Date\(\)\.getHours\(\) < 12 \? 'Good Morning' : new Date\(\)\.getHours\(\) < 17 \? 'Good Afternoon' : 'Good Evening'}",
        r"{new Date().getHours() < 12 ? t('home.goodMorning') : new Date().getHours() < 17 ? t('home.goodAfternoon') : t('home.goodEvening')}"
    ),
    (
        r"\{t\('driverHome\.goodMorning'\) \|\| 'Good Morning'\}",
        r"{new Date().getHours() < 12 ? t('home.goodMorning') : new Date().getHours() < 17 ? t('home.goodAfternoon') : t('home.goodEvening')}"
    ),
    (
        r"label: 'Home'",
        r"label: t('home.tabHome')"
    ),
    (
        r"label: 'Services'",
        r"label: t('home.tabServices')"
    ),
    (
        r"label: 'Wallet'",
        r"label: t('home.tabWallet')"
    ),
    (
        r"label: 'Trips'",
        r"label: t('home.tabTrips')"
    ),
    (
        r"label: 'Account'",
        r"label: t('home.tabAccount')"
    ),
    (
        r">You're Offline<",
        r">{t('driverHome.youreOffline')}<"
    ),
    (
        r">Go Online to Receive Trips<",
        r">{t('driverHome.goOnline')}<"
    ),
    (
        r">Total Earnings<",
        r">{t('driverHome.totalEarnings')}<"
    ),
    (
        r"<Text style=\{\{ fontFamily: 'sans-serif', fontSize: 14, color: '#C0C2C4' \}\}>Trips</Text>",
        r"<Text style={{ fontFamily: 'sans-serif', fontSize: 14, color: '#C0C2C4' }}>{t('driverHome.trips')}</Text>"
    ),
    (
        r">Hours Online<",
        r">{t('driverHome.hoursOnline')}<"
    ),
    (
        r">Home</Text>",
        r">{t('home.tabHome')}</Text>"
    )
]

for old, new in replacements:
    content = re.sub(old, new, content)

with open('App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
