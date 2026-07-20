import re
import os

path = r"d:\Cab Application\customer-app\App.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add LinearGradient import if missing
if "expo-linear-gradient" not in content:
    content = content.replace("import { StatusBar } from 'expo-status-bar';", "import { StatusBar } from 'expo-status-bar';\nimport { LinearGradient } from 'expo-linear-gradient';")

# 2. Add showMap state
if "const [showMap, setShowMap] = useState(false);" not in content:
    content = content.replace(
        "const [bookingRide, setBookingRide] = useState(false);",
        "const [bookingRide, setBookingRide] = useState(false);\n  const [showMap, setShowMap] = useState(false);"
    )

# 3. Carefully locate the home tab start and end
home_start_marker = "{/* ─────────────────── HOME TAB ─────────────────── */}"
home_content_start = "      {activeTab === 'home' && ("

wallet_tab_marker = "{/* ─────────────────── WALLET TAB ─────────────────── */}"

if home_content_start in content:
    dashboard_ui = """
        <>
          {(!dropAddr && (!estimates || estimates.length === 0) && pickerMode === null && !bookingRide && !showMap) ? (
            <ScrollView style={{ flex: 1, backgroundColor: '#F3F4F6' }} contentContainerStyle={{ paddingBottom: 120 }}>
              {/* TOP HEADER */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: Platform.OS === 'ios' ? 60 : 40 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.bgTertiary, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.borderGlass }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.accent }}>{formatInitials(user?.name || 'U')}</Text>
                  </View>
                  <View>
                    <Text style={{ fontFamily: 'sans-serif', fontSize: 14, color: '#7C848D' }}>Good Morning!</Text>
                    <Text style={{ fontFamily: 'sans-serif', fontSize: 16, color: '#262D36', fontWeight: 'bold' }}>{user?.name?.split(' ')[0] || 'Rose'}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => setShowNotificationScreen(true)} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}>
                  <Feather name="bell" size={20} color="#262D36" />
                </TouchableOpacity>
              </View>

              {/* MONTHLY PASS CARD */}
              <View style={{ marginHorizontal: 16, marginTop: 12, borderRadius: 20, overflow: 'hidden' }}>
                <LinearGradient colors={['#ABCAED', '#EBEBEB']} start={{x:0, y:0}} end={{x:1, y:1}} style={{ padding: 20, height: 198 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View>
                      <Text style={{ fontFamily: 'sans-serif', fontSize: 16, color: '#262D36', fontWeight: 'bold' }}>Monthly Pass</Text>
                      <View style={{ backgroundColor: '#ECFDF2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, marginTop: 8, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Feather name="check" size={10} color="#39B45C" />
                        <Text style={{ color: '#39B45C', fontSize: 10, fontWeight: 'bold' }}>Active</Text>
                      </View>
                    </View>
                    <View style={{ backgroundColor: '#D49F0C', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Text style={{ color: '#FCFCFC', fontSize: 10, fontWeight: 'bold' }}>GOLD</Text>
                      <Feather name="shield" size={10} color="#FCFCFC" />
                    </View>
                  </View>
                  
                  <View style={{ marginTop: 40 }}>
                    <Text style={{ color: '#7C848D', fontSize: 10 }}>📅 Valid Till</Text>
                    <Text style={{ color: '#FCFCFC', fontSize: 14, fontWeight: 'bold', marginTop: 4 }}>July 29, 2026</Text>
                  </View>
                  <View style={{ marginTop: 12, height: 8, backgroundColor: '#F6F8FE', borderRadius: 4, width: '50%' }}>
                     <View style={{ width: '30%', height: 8, backgroundColor: '#0053B3', borderRadius: 4 }} />
                  </View>
                  <Text style={{ color: '#262D36', fontSize: 12, marginTop: 4 }}>22 Left</Text>
                  
                  <Image source={{ uri: 'https://www.pngplay.com/wp-content/uploads/13/White-Tata-Tiago-Transparent-PNG.png' }} style={{ position: 'absolute', right: -20, top: 40, width: 220, height: 120, resizeMode: 'contain' }} />
                </LinearGradient>
              </View>

              {/* SEARCH BAR */}
              <TouchableOpacity style={{ marginHorizontal: 16, marginTop: 24, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#E9EAEC' }} onPress={() => setPickerMode('drop')}>
                <Feather name="search" size={20} color="#7C848D" />
                <Text style={{ color: '#7C848D', fontSize: 14 }}>Search destination</Text>
              </TouchableOpacity>

              {/* FOR YOU */}
              <View style={{ marginHorizontal: 16, marginTop: 24 }}>
                <Text style={{ fontFamily: 'sans-serif', fontSize: 16, color: '#262D36', fontWeight: 'bold', marginBottom: 12 }}>For you</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-start', gap: 24 }}>
                  <TouchableOpacity style={{ alignItems: 'center', gap: 8 }} onPress={() => setShowPassConfig(true)}>
                    <View style={{ width: 68, height: 68, backgroundColor: '#F9FAFB', borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E9EAEC' }}>
                       <Feather name="credit-card" size={28} color="#0053B3" />
                    </View>
                    <Text style={{ color: '#262D36', fontSize: 14 }}>Buy Pass</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={{ alignItems: 'center', gap: 8 }} onPress={() => setPickerMode('drop')}>
                    <View style={{ width: 68, height: 68, backgroundColor: '#F9FAFB', borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E9EAEC' }}>
                       <Feather name="navigation" size={28} color="#0053B3" />
                    </View>
                    <Text style={{ color: '#262D36', fontSize: 14 }}>Book Ride</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={{ alignItems: 'center', gap: 8 }} onPress={() => Alert.alert('Coming Soon', 'Scheduled rides will be available soon.')}>
                    <View style={{ width: 68, height: 68, backgroundColor: '#F9FAFB', borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E9EAEC' }}>
                       <Feather name="calendar" size={28} color="#0053B3" />
                    </View>
                    <Text style={{ color: '#262D36', fontSize: 14 }}>Schedule Ride</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* TODAY's RIDE (Mocked for UI as per requirement) */}
              <View style={{ marginHorizontal: 16, marginTop: 24, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, shadowColor: '#000', shadowOffset: {width:0, height:2}, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
                 <Text style={{ fontFamily: 'sans-serif', fontSize: 16, color: '#262D36', fontWeight: 'bold', marginBottom: 16 }}>Today's Ride</Text>
                 <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                   <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                     <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#E9EAEC', alignItems: 'center', justifyContent: 'center' }}>
                       <Feather name="user" size={24} color="#7C848D" />
                     </View>
                     <View>
                       <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                         <Text style={{ fontSize: 16, color: '#262D36', fontWeight: 'bold' }}>Ravi</Text>
                         <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                           <Feather name="star" size={12} color="#EDBB31" />
                           <Text style={{ fontSize: 12, color: '#262D36' }}>4.9</Text>
                         </View>
                       </View>
                       <Text style={{ fontSize: 14, color: '#7C848D' }}>Maruti Swift</Text>
                     </View>
                   </View>
                   <View style={{ alignItems: 'center' }}>
                     <Image source={{ uri: 'https://www.pngplay.com/wp-content/uploads/13/White-Tata-Tiago-Transparent-PNG.png' }} style={{ width: 70, height: 35, resizeMode: 'contain' }} />
                     <View style={{ backgroundColor: '#F6F8FE', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginTop: 4 }}>
                       <Text style={{ fontSize: 12, color: '#262D36', fontWeight: 'bold' }}>KA AF 1123</Text>
                     </View>
                   </View>
                 </View>
                 
                 <View style={{ marginTop: 20, flexDirection: 'row' }}>
                   <View style={{ alignItems: 'center', marginRight: 12, marginTop: 4 }}>
                     <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#47BE61' }} />
                     <View style={{ width: 1, height: 30, backgroundColor: '#262D36', borderStyle: 'dashed', marginVertical: 4 }} />
                     <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#FAFAFA', borderWidth: 3, borderColor: '#F52F14' }} />
                   </View>
                   <View style={{ flex: 1, justifyContent: 'space-between', height: 60 }}>
                     <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                       <View>
                         <Text style={{ fontSize: 12, color: '#7C848D' }}>Pickup Location</Text>
                         <Text style={{ fontSize: 12, color: '#262D36', fontWeight: 'bold' }}>Rk Towers, Krishnagiri</Text>
                       </View>
                       <Text style={{ fontSize: 12, color: '#7C848D' }}>6:30 PM</Text>
                     </View>
                     <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                       <View>
                         <Text style={{ fontSize: 12, color: '#7C848D' }}>Drop</Text>
                         <Text style={{ fontSize: 12, color: '#262D36', fontWeight: 'bold' }}>Bus Stand, Krishnagiri</Text>
                       </View>
                       <Text style={{ fontSize: 12, color: '#7C848D' }}>6:45 PM</Text>
                     </View>
                   </View>
                 </View>
                 
                 <View style={{ flexDirection: 'row', marginTop: 24, gap: 12 }}>
                   <TouchableOpacity onPress={() => setShowMap(true)} style={{ flex: 1, backgroundColor: '#0053B3', borderRadius: 12, paddingVertical: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
                     <Feather name="map" size={16} color="#FCFCFC" />
                     <Text style={{ color: '#FCFCFC', fontSize: 14, fontWeight: 'bold' }}>Track</Text>
                   </TouchableOpacity>
                   <TouchableOpacity style={{ flex: 1, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#0053B3', borderRadius: 12, paddingVertical: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
                     <Feather name="phone" size={16} color="#0053B3" />
                     <Text style={{ color: '#0053B3', fontSize: 14, fontWeight: 'bold' }}>Call</Text>
                   </TouchableOpacity>
                 </View>
              </View>
            </ScrollView>
          ) : (
            <View style={{ flex: 1 }}>
              {showMap && (
                <TouchableOpacity onPress={() => setShowMap(false)} style={{ position: 'absolute', top: Platform.OS === 'ios' ? 60 : 40, left: 16, zIndex: 100, width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 }}>
                  <Feather name="arrow-left" size={24} color="#000" />
                </TouchableOpacity>
              )}
"""

    # We need to replace `        <>` inside the `activeTab === 'home'` with our `dashboard_ui`.
    # And then we need to find the `        </>\n      )}` just before `WALLET TAB` and replace it to close the ternary.
    
    # 1. Replace the open bracket
    original_open = "        <>"
    content = content.replace(
        "      {activeTab === 'home' && (\n" + original_open, 
        "      {activeTab === 'home' && (\n" + dashboard_ui, 
        1
    )

    # 2. Add closing ternary right at the end of the home tab block.
    # We can split the string by WALLET TAB, then replace the last `</>\n      )}` in the first half.
    parts = content.split(wallet_tab_marker)
    if len(parts) == 2:
        home_part = parts[0]
        # Find the last `</>` in home_part
        last_fragment_close = home_part.rfind("        </>\n      )}")
        if last_fragment_close != -1:
            closing_code = "            </View>\n          )}\n        </>\n      )}\n\n      "
            home_part = home_part[:last_fragment_close] + closing_code
            content = home_part + wallet_tab_marker + parts[1]

    # 3. Replace Bottom Tabs
    bottom_tab_regex = re.compile(r"\{\/\* ─────────────────── BOTTOM TAB BAR \(REDESIGNED\) ─────────────────── \*\/\}.*?\{\/\* ─────────────────── MANAGE PASS MODAL ─────────────────── \*\/\}", re.DOTALL)
    
    new_bottom_tabs = """{/* ─────────────────── BOTTOM TAB BAR (REDESIGNED) ─────────────────── */}
      {!(activeTab === 'home' && (!!dropAddr || (estimates && estimates.length > 0) || pickerMode !== null || showMap)) && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 12, position: 'absolute', bottom: 16, left: 16, right: 16, borderRadius: 20, backgroundColor: Colors.bgSecondary, shadowColor: Colors.textPrimary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 }}>
        {([
          { key: 'home',     icon: 'home',  label: 'Home' },
          { key: 'wallet',   icon: 'credit-card', label: 'My Pass' },
          { key: 'services', icon: 'grid', label: 'Plans' },
          { key: 'trips',    icon: 'clock', label: 'History' },
        ] as { key: 'home' | 'wallet' | 'services' | 'trips'; icon: string; label: string }[]).map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={activeTab === tab.key ? { backgroundColor: '#F6F8FE', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 6 } : { padding: 8 }}
            onPress={() => handleTabPress(tab.key)}
            activeOpacity={0.7}
          >
            <Feather name={tab.icon as any} size={activeTab === tab.key ? 18 : 24} color={activeTab === tab.key ? '#0053B3' : '#7C848D'} />
            {activeTab === tab.key && (
              <Text style={{ color: '#0053B3', fontSize: 14, fontWeight: '600', marginLeft: 6 }}>
                {tab.label}
              </Text>
            )}
          </TouchableOpacity>
        ))}
        </View>
      )}

      {/* ─────────────────── MANAGE PASS MODAL ─────────────────── */}"""
      
    content = re.sub(bottom_tab_regex, new_bottom_tabs, content)

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Success")
