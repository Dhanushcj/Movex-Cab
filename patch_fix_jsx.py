import sys
import re

file_path = r'g:\Dhanush\New folder\Movex-Cab\customer-app\App.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target = """                <View style={styles.homeTaglineRow}>
                  <Text style={styles.homeTagline}>#goMoveX</Text>
                  <Text style={styles.homeTaglineSub}>{t('home.yourCityYourRide') || 'Your city, your ride.'}</Text>
                </View>
              </ScrollView>
            )}
          </View>
            </View>
          )}
        </View>"""

replacement = """                <View style={styles.homeTaglineRow}>
                  <Text style={styles.homeTagline}>#goMoveX</Text>
                  <Text style={styles.homeTaglineSub}>{t('home.yourCityYourRide') || 'Your city, your ride.'}</Text>
                </View>
              </ScrollView>
            )}
          </View>
          )}
            </View>
          )}
        </View>"""

content = content.replace(target, replacement)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed missing closing bracket!")
