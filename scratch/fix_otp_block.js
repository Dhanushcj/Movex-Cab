const fs = require('fs');
let content = fs.readFileSync('customer-app/App.tsx', 'utf8');

const firstIdx = content.indexOf("{rideStatus === 'arrived' && (");
const secondIdx = content.indexOf("{rideStatus === 'arrived' && (", firstIdx + 1);

// The OTP block ends with '          )}\r\n\r\n\r\n        </View>'
const endSearch = "          )}\r\n\r\n\r\n        </View>";
const endIdx = content.indexOf(endSearch, secondIdx);
const blockEnd = endIdx + "          )}".length;

console.log('Block from', secondIdx, 'to', blockEnd);
console.log('First 200 chars being replaced:', JSON.stringify(content.substring(secondIdx, secondIdx + 200)));

const replacement = [
  "{rideStatus === 'arrived' && (",
  "            <View style={{ gap: 14 }}>",
  "              <TouchableOpacity",
  "                style={[styles.premiumButton, { backgroundColor: colors.accent }]}",
  "                onPress={() => setShowQRScannerHome(true)}",
  "                disabled={loading}",
  "              >",
  "                {loading",
  "                  ? <ActivityIndicator color={colors.bgSecondary} />",
  "                  : <Text style={styles.premiumButtonText}>Scan Pass to Start Ride</Text>",
  "                }",
  "              </TouchableOpacity>",
  "            </View>",
  "          )}",
  "",
  "          <DriverQRScannerModal",
  "            visible={showQRScannerHome}",
  "            onClose={() => setShowQRScannerHome(false)}",
  "            onScan={async (data) => {",
  "              setLoading(true);",
  "              try {",
  "                const response = await API.put(`/bookings/${rideData._id}/start`, { qrData: data.trim() });",
  "                if (response.data.success) {",
  "                  setRideStatus('in_progress');",
  "                  setIsOtpVerified(true);",
  "                  setShowQRScannerHome(false);",
  "                  if (socket) socket.emit('ride:started', { bookingId: rideData._id });",
  "                  return true;",
  "                }",
  "              } catch (e) {",
  "                Alert.alert('Error', (e && e.response && e.response.data && e.response.data.message) || 'Invalid QR Pass');",
  "              } finally {",
  "                setLoading(false);",
  "              }",
  "              return false;",
  "            }}",
  "          />"
].join("\r\n");

content = content.substring(0, secondIdx) + replacement + content.substring(blockEnd);
fs.writeFileSync('customer-app/App.tsx', content, 'utf8');
console.log('Done! Replacement applied successfully.');
