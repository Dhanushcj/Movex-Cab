import re

with open('App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = '''      {activeTab === 'account' && (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F4F6' }}>
          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, paddingHorizontal: 16, paddingTop: 60 }} contentContainerStyle={{ paddingBottom: 120 }}>
            {/* Header */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 24, fontWeight: '800', color: Colors.textPrimary }}>My Profile</Text>
            </View>

            {/* Profile Card */}
            <TouchableOpacity onPress={onNavigateProfileEdit} style={{ backgroundColor: '#0053B3', borderRadius: 16, padding: 16, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 }} activeOpacity={0.9}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#005FCC', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 22, fontWeight: '700', color: '#fff' }}>{formatInitials(user?.name || 'U')}</Text>
                </View>
                <View style={{ justifyContent: 'center', flex: 1 }}>
                  <Text style={{ color: '#FCFCFC', fontSize: 16, fontWeight: '600' }}>{user?.name || 'Rider'}</Text>
                  <Text style={{ color: '#A1A3A6', fontSize: 14, marginTop: 4 }}>{user?.phone || 'No phone'}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 4 }}>
                    <Text style={{ color: '#FED101', fontSize: 12 }}>?</Text>
                    <Text style={{ color: '#FED101', fontSize: 12 }}>?</Text>
                    <Text style={{ color: '#FED101', fontSize: 12 }}>?</Text>
                    <Text style={{ color: '#FED101', fontSize: 12 }}>?</Text>
                    <Text style={{ color: '#8DABCE', fontSize: 12, opacity: 0.5 }}>?</Text>
                    <Text style={{ color: '#FCFCFC', fontSize: 14, fontWeight: '500', marginLeft: 4 }}>4.9</Text>
                  </View>
                </View>
                <Feather name="edit-2" size={20} color="#FCFCFC" style={{ opacity: 0.8 }} />
              </View>
            </TouchableOpacity>

            {/* Wallet Quick Access */}
            <TouchableOpacity onPress={() => setShowWalletModal(true)} style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E0F2FE', alignItems: 'center', justifyContent: 'center' }}>
                  <Feather name="credit-card" size={20} color="#0284C7" />
                </View>
                <View>
                  <Text style={{ color: '#000000', fontSize: 14, fontWeight: '500' }}>MoveX Wallet</Text>
                  <Text style={{ color: '#7C848D', fontSize: 12, marginTop: 2 }}>Top up your balance</Text>
                </View>
              </View>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#0053B3' }}>? {user?.wallet?.balance || 0}</Text>
            </TouchableOpacity>

            {/* Options Block */}
            <View style={{ backgroundColor: Colors.bgSecondary, borderRadius: 16, paddingHorizontal: 16, marginBottom: 20 }}>
              {([ { key: 'darkTheme', icon: 'moon', color: '#0053B3', toggle: true },
                { key: 'appLanguage', icon: 'globe', color: '#0053B3', onPress: onNavigateLanguage },
                { key: 'alertSound', icon: 'volume-2', color: '#0053B3' }, ] as any[]).map((item, idx) => (
                <View key={idx}>
                  <TouchableOpacity onPress={item.toggle ? toggleTheme : item.onPress} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, gap: 12 }} activeOpacity={0.7} disabled={!item.toggle && !item.onPress}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.iconBg, borderWidth: 1.5, borderColor: '#0053B3', alignItems: 'center', justifyContent: 'center' }}>
                      <Feather name={item.icon as any} size={18} color={item.color} />
                    </View>
                    <Text style={{ fontSize: 14, color: Colors.textPrimary, fontWeight: '500', flex: 1 }}>{t('profile.' + item.key)}</Text>
                    {item.toggle ? (
                      <View style={[{ width: 56, height: 28, backgroundColor: '#DEE0E3', borderRadius: 16 }, isDark && { backgroundColor: '#22282F' }]}>
                        <View style={[{ position: 'absolute', top: -3, width: 34, height: 34, borderRadius: 17, backgroundColor: '#A1A3A6', left: -3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 3 }, isDark && { backgroundColor: '#0053B3', left: 25 }]} />
                      </View>
                    ) : (
                      <Feather name="chevron-right" size={24} color={Colors.textPrimary} style={{ opacity: 0.5 }} />
                    )}
                  </TouchableOpacity>
                  {idx < 2 && <View style={{ height: 1, backgroundColor: Colors.bgPrimary, marginHorizontal: -16 }} />}
                </View>
              ))}
            </View>

            {/* Support Block */}
            <View style={{ backgroundColor: Colors.bgSecondary, borderRadius: 16, paddingHorizontal: 16, marginBottom: 20 }}>
              {([ { key: 'helpCentre', icon: 'help-circle', color: '#0053B3' },
                { key: 'supportTickets', icon: 'message-square', color: '#0053B3' },
                { key: 'settings', icon: 'settings', color: '#0053B3' }, ] as any[]).map((item, idx) => (
                <View key={idx}>
                  <TouchableOpacity onPress={item.toggle ? toggleTheme : item.onPress} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, gap: 12 }} activeOpacity={0.7} disabled={!item.toggle && !item.onPress}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.iconBg, borderWidth: 1.5, borderColor: '#0053B3', alignItems: 'center', justifyContent: 'center' }}>
                      <Feather name={item.icon as any} size={18} color={item.color} />
                    </View>
                    <Text style={{ fontSize: 14, color: Colors.textPrimary, fontWeight: '500', flex: 1 }}>{t('profile.' + item.key)}</Text>
                    <Feather name="chevron-right" size={24} color={Colors.textPrimary} style={{ opacity: 0.5 }} />
                  </TouchableOpacity>
                  {idx < 2 && <View style={{ height: 1, backgroundColor: Colors.bgPrimary, marginHorizontal: -16 }} />}
                </View>
              ))}
            </View>

            {/* Log out */}
            <TouchableOpacity style={{ borderWidth: 1, borderColor: '#F52F14', borderRadius: 16, padding: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 40 }} onPress={async () => { await logout(); }}>
              <Text style={{ color: '#F52F14', fontSize: 14, fontWeight: '500' }}>Log Out</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      )}'''

replacement = '''      {activeTab === 'account' && (
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bgPrimary }}>
          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, paddingHorizontal: 16, paddingTop: 40 }} contentContainerStyle={{ paddingBottom: 120 }}>
            {/* Header (Back button in image) */}
            <TouchableOpacity style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.iconBg, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }} onPress={() => setActiveTab('home')}>
              <Feather name="chevron-left" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>

            {/* Profile Card */}
            <TouchableOpacity onPress={onNavigateProfileEdit} style={{ backgroundColor: '#0053B3', borderRadius: 16, padding: 16, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 }} activeOpacity={0.9}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#005FCC', alignItems: 'center', justifyContent: 'center', borderWidth: 2.1, borderColor: '#FCFCFC' }}>
                  <Feather name="user" size={28} color="#FCFCFC" />
                </View>
                <View style={{ justifyContent: 'center', flex: 1 }}>
                  <Text style={{ color: '#FCFCFC', fontSize: 16, fontWeight: '600', fontFamily: 'sans-serif' }}>{user?.name || 'Rider'}</Text>
                  <Text style={{ color: '#A1A3A6', fontSize: 14, marginTop: 4, letterSpacing: 1 }}>{user?.id?.substring(0, 9).toUpperCase() || 'FE2889108'}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 4 }}>
                    <Text style={{ color: '#FED101', fontSize: 14 }}>?</Text>
                    <Text style={{ color: '#FED101', fontSize: 14 }}>?</Text>
                    <Text style={{ color: '#FED101', fontSize: 14 }}>?</Text>
                    <Text style={{ color: '#FED101', fontSize: 14 }}>?</Text>
                    <Text style={{ color: '#8DABCE', fontSize: 14 }}>?</Text>
                    <Text style={{ color: '#FCFCFC', fontSize: 14, fontWeight: '500', marginLeft: 4 }}>4.9</Text>
                  </View>
                </View>
                <Feather name="chevron-right" size={24} color="#FCFCFC" style={{ opacity: 1 }} />
              </View>
            </TouchableOpacity>

            {/* Referral Bonus */}
            <TouchableOpacity style={{ backgroundColor: Colors.bgSecondary, borderRadius: 16, padding: 20, marginBottom: 20, flexDirection: 'column', gap: 4 }}>
              <Text style={{ color: Colors.textPrimary, fontSize: 14, fontWeight: '400' }}>Upto ?4,500 referral bonus</Text>
              <Text style={{ color: Colors.textMuted, fontSize: 12 }}>Refer your friend and earn</Text>
            </TouchableOpacity>

            {/* Options Block */}
            <View style={{ backgroundColor: Colors.bgSecondary, borderRadius: 16, paddingHorizontal: 16, marginBottom: 20 }}>
              {([ { key: 'darkTheme', icon: 'moon', color: '#0053B3', toggle: true },
                { key: 'appLanguage', icon: 'globe', color: '#0053B3', onPress: onNavigateLanguage },
                { key: 'alertSound', icon: 'volume-2', color: '#0053B3' }, ] as any[]).map((item, idx) => (
                <View key={idx}>
                  <TouchableOpacity onPress={item.toggle ? toggleTheme : item.onPress} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, gap: 12 }} activeOpacity={0.7} disabled={!item.toggle && !item.onPress}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.iconBg, borderWidth: 1.5, borderColor: '#0053B3', alignItems: 'center', justifyContent: 'center' }}>
                      <Feather name={item.icon as any} size={18} color={item.color} />
                    </View>
                    <Text style={{ fontSize: 14, color: Colors.textPrimary, fontWeight: '400', flex: 1 }}>{t('profile.' + item.key)}</Text>
                    {item.toggle ? (
                      <View style={[{ width: 56, height: 28, backgroundColor: '#DEE0E3', borderRadius: 16 }, isDark && { backgroundColor: '#22282F' }]}>
                        <View style={[{ position: 'absolute', top: -3, width: 34, height: 34, borderRadius: 17, backgroundColor: '#A1A3A6', left: -3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 3 }, isDark && { backgroundColor: '#0053B3', left: 25 }]} />
                      </View>
                    ) : (
                      <Feather name="chevron-right" size={24} color={Colors.textPrimary} style={{ opacity: 1 }} />
                    )}
                  </TouchableOpacity>
                  {idx < 2 && <View style={{ height: 1, backgroundColor: Colors.bgPrimary, marginHorizontal: -16 }} />}
                </View>
              ))}
            </View>

            {/* Support Block */}
            <View style={{ backgroundColor: Colors.bgSecondary, borderRadius: 16, paddingHorizontal: 16, marginBottom: 20 }}>
              {([ { key: 'helpCentre', icon: 'help-circle', color: '#0053B3' },
                { key: 'supportTickets', icon: 'message-square', color: '#0053B3' },
                { key: 'settings', icon: 'settings', color: '#0053B3' }, ] as any[]).map((item, idx) => (
                <View key={idx}>
                  <TouchableOpacity onPress={item.toggle ? toggleTheme : item.onPress} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, gap: 12 }} activeOpacity={0.7} disabled={!item.toggle && !item.onPress}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.iconBg, borderWidth: 1.5, borderColor: '#0053B3', alignItems: 'center', justifyContent: 'center' }}>
                      <Feather name={item.icon as any} size={18} color={item.color} />
                    </View>
                    <Text style={{ fontSize: 14, color: Colors.textPrimary, fontWeight: '400', flex: 1 }}>{t('profile.' + item.key)}</Text>
                    <Feather name="chevron-right" size={24} color={Colors.textPrimary} style={{ opacity: 1 }} />
                  </TouchableOpacity>
                  {idx < 2 && <View style={{ height: 1, backgroundColor: Colors.bgPrimary, marginHorizontal: -16 }} />}
                </View>
              ))}
            </View>

            {/* Log out */}
            <TouchableOpacity style={{ flexDirection: 'row', gap: 10, borderWidth: 1, borderColor: '#F52F14', borderRadius: 16, padding: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 40 }} onPress={async () => { await logout(); }}>
              <Feather name="log-out" size={18} color="#F52F14" />
              <Text style={{ color: '#F52F14', fontSize: 14, fontWeight: '400' }}>{t('app.Logout')}</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      )}'''

if target in content:
    content = content.replace(target, replacement)
    with open('App.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print('Success')
else:
    print('Target not found')
