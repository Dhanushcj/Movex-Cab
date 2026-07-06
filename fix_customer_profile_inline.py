with open('App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update HomeScreen props and hooks
content = content.replace(
    "function HomeScreen({ onRideBooked, onNavigateProfileEdit }: { onRideBooked: (ride: any) => void; onNavigateProfileEdit: () => void; }) {",
    "function HomeScreen({ onRideBooked, onNavigateProfileEdit, onNavigateLanguage }: { onRideBooked: (ride: any) => void; onNavigateProfileEdit: () => void; onNavigateLanguage: () => void; }) {"
)
content = content.replace(
    "  const { t } = useLanguage();\n  const { location, locationAddress, geocodeSearch } = useLocation();",
    "  const { t } = useLanguage();\n  const { isDark, toggleTheme } = useTheme();\n  const { location, locationAddress, geocodeSearch } = useLocation();"
)

# 2. Update HomeScreen usage
content = content.replace(
    "            onNavigateProfileEdit={() => setActiveScreen('customerProfileEdit')}\n          />",
    "            onNavigateProfileEdit={() => setActiveScreen('customerProfileEdit')}\n            onNavigateLanguage={() => setActiveScreen('customerLanguage')}\n          />"
)

# 3. Add customerLanguage route
content = content.replace(
    "      {activeScreen === 'driverLanguage' && (",
    "      {activeScreen === 'customerLanguage' && (\n        <LanguageScreen onBack={() => setActiveScreen('home')} />\n      )}\n      {activeScreen === 'driverLanguage' && ("
)

# 4. Update the Options Block
target_options = '''            {/* Options Block */}
            <View style={{ backgroundColor: '#FCFCFC', borderRadius: 16, paddingHorizontal: 16, marginBottom: 20 }}>
              {[
                { icon: 'moon', label: 'Dark theme', color: '#0053B3', toggle: true },
                { icon: 'globe', label: 'App language', color: '#0053B3' },
                { icon: 'volume-2', label: 'Alert sound', color: '#0053B3' },
              ].map((item, idx) => (
                <View key={idx}>
                  <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, gap: 12 }} activeOpacity={0.7}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#F6F8FE', borderWidth: 1.5, borderColor: 'rgba(0, 83, 179, 0.2)', alignItems: 'center', justifyContent: 'center' }}>
                      <Feather name={item.icon as any} size={18} color={item.color} />
                    </View>
                    <Text style={{ fontSize: 14, color: '#262D36', fontWeight: '500', flex: 1 }}>{item.label}</Text>
                    {item.toggle ? (
                      <View style={{ width: 56, height: 28, backgroundColor: '#DEE0E3', borderRadius: 16, justifyContent: 'center', paddingHorizontal: 2 }}>
                        <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#F5F5F5' }} />
                      </View>
                    ) : (
                      <Text style={{ fontSize: 20, color: '#262D36', opacity: 0.5 }}>›</Text>
                    )}
                  </TouchableOpacity>
                  {idx < 2 && <View style={{ height: 1, backgroundColor: '#F3F4F6', marginHorizontal: -16 }} />}
                </View>
              ))}
            </View>'''

replacement_options = '''            {/* Options Block */}
            <View style={{ backgroundColor: Colors.bgSecondary, borderRadius: 16, paddingHorizontal: 16, marginBottom: 20 }}>
              {[
                { key: 'darkTheme', icon: 'moon', color: '#0053B3', toggle: true },
                { key: 'appLanguage', icon: 'globe', color: '#0053B3', onPress: onNavigateLanguage },
                { key: 'alertSound', icon: 'volume-2', color: '#0053B3' },
              ].map((item, idx) => (
                <View key={idx}>
                  <TouchableOpacity onPress={item.toggle ? toggleTheme : item.onPress} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, gap: 12 }} activeOpacity={0.7} disabled={!item.toggle && !item.onPress}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.iconBg, borderWidth: 1.5, borderColor: 'rgba(0, 83, 179, 0.2)', alignItems: 'center', justifyContent: 'center' }}>
                      <Feather name={item.icon as any} size={18} color={item.color} />
                    </View>
                    <Text style={{ fontSize: 14, color: Colors.textPrimary, fontWeight: '500', flex: 1 }}>{t(profile.)}</Text>
                    {item.toggle ? (
                      <View style={[{ width: 56, height: 28, backgroundColor: Colors.borderGlass, borderRadius: 16, justifyContent: 'center', paddingHorizontal: 2 }, isDark && { backgroundColor: '#0053B3' }]}>
                        <View style={[{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#F5F5F5' }, isDark && { transform: [{ translateX: 28 }] }]} />
                      </View>
                    ) : (
                      <Text style={{ fontSize: 20, color: Colors.textPrimary, opacity: 0.5 }}>›</Text>
                    )}
                  </TouchableOpacity>
                  {idx < 2 && <View style={{ height: 1, backgroundColor: Colors.bgPrimary, marginHorizontal: -16 }} />}
                </View>
              ))}
            </View>'''

content = content.replace(target_options, replacement_options)

# 5. Update the Support Block
target_support = '''            {/* Support Block */}
            <View style={{ backgroundColor: '#FCFCFC', borderRadius: 16, paddingHorizontal: 16, marginBottom: 20 }}>
              {[
                { icon: 'help-circle', label: 'Help Centre', color: '#0053B3' },
                { icon: 'message-square', label: 'Support tickets', color: '#0053B3' },
                { icon: 'settings', label: 'Settings', color: '#0053B3' },
              ].map((item, idx) => (
                <View key={idx}>
                  <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, gap: 12 }} activeOpacity={0.7}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#F6F8FE', borderWidth: 1.5, borderColor: 'rgba(0, 83, 179, 0.2)', alignItems: 'center', justifyContent: 'center' }}>
                      <Feather name={item.icon as any} size={18} color={item.color} />
                    </View>
                    <Text style={{ fontSize: 14, color: '#262D36', fontWeight: '500', flex: 1 }}>{item.label}</Text>
                    <Text style={{ fontSize: 20, color: '#262D36', opacity: 0.5 }}>›</Text>
                  </TouchableOpacity>
                  {idx < 2 && <View style={{ height: 1, backgroundColor: '#F3F4F6', marginHorizontal: -16 }} />}
                </View>
              ))}
            </View>'''

replacement_support = '''            {/* Support Block */}
            <View style={{ backgroundColor: Colors.bgSecondary, borderRadius: 16, paddingHorizontal: 16, marginBottom: 20 }}>
              {[
                { key: 'helpCentre', icon: 'help-circle', color: '#0053B3' },
                { key: 'supportTickets', icon: 'message-square', color: '#0053B3' },
                { key: 'settings', icon: 'settings', color: '#0053B3' },
              ].map((item, idx) => (
                <View key={idx}>
                  <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, gap: 12 }} activeOpacity={0.7}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.iconBg, borderWidth: 1.5, borderColor: 'rgba(0, 83, 179, 0.2)', alignItems: 'center', justifyContent: 'center' }}>
                      <Feather name={item.icon as any} size={18} color={item.color} />
                    </View>
                    <Text style={{ fontSize: 14, color: Colors.textPrimary, fontWeight: '500', flex: 1 }}>{t(profile.)}</Text>
                    <Text style={{ fontSize: 20, color: Colors.textPrimary, opacity: 0.5 }}>›</Text>
                  </TouchableOpacity>
                  {idx < 2 && <View style={{ height: 1, backgroundColor: Colors.bgPrimary, marginHorizontal: -16 }} />}
                </View>
              ))}
            </View>'''

content = content.replace(target_support, replacement_support)

with open('App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Success')
