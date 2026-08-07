"""
Precise fix for the corrupted ScheduleConfirmScreen onSchedule handler in App.tsx.
The lines 1315-1356 are a corrupt mix of one-time schedule code and monthly payment modal code.
We need to restore the correct one-time schedule block and make sure the monthly modal is separate.
"""
file_path = r'g:\Dhanush\New folder\Movex-Cab\customer-app\App.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# The broken section starts at the try { on line 1315.
# The onSchedule handler should have proper nested try/catch for:
# 1. today (one-time)
# 2. weekly (recurring)
# 3. monthly (show payment modal)
# Then close the handler and the ScheduleConfirmScreen component.
# Then have the Monthly Payment Modal as a separate item.
# Then HOME TAB.

# Find the broken section - it starts right after "setIsScheduling(false);"
# inside the onSchedule handler

BROKEN_START = """          try {
            if (schedulePayload?.scheduleType === 'today') {
              const res = await API.post('/scheduled-rides/one-time', {
                pickup: { address: pickupAddr, location: { type: 'Point', coordinates: pickupCoords } },
                drop: { address: dropAddr, location: { type: 'Point', coordinates: dropCoords } },
                vehicleType: vehicleType,
                scheduledDate: schedulePayload.scheduledDate.toISOString().split('T')[0],
                scheduledTime: schedulePayload.scheduledTime.toISOString().split('T')[1].substring(0,5),
                      returnTime: schedulePayload.returnTime ? schedulePayload.returnTime.toISOString().split('T')[1].substring(0,5) : null,
                     startMonth: schedulePayload.startMonth,
                     numberOfMonths: schedulePayload.numMonths
                   });
                   if (res.data.success) {
                     Alert.alert('Monthly Schedule Created', 'Your monthly commute has been scheduled successfully!');
                     setShowMonthlyPayment(false);
                     if (res.data.data && res.data.data.rides && res.data.data.rides.length > 0) {
                       const upcoming = res.data.data.rides[0];
                       setScheduledRide({
                         ...upcoming,
                         pickup: upcoming.pickup?.address || pickupAddr,
                         drop: upcoming.drop?.address || dropAddr
                       });
                     } else {
                       setScheduledRide({ pickup: pickupAddr, drop: dropAddr });
                     }
                     setPickupAddr('');
                     setDropAddr('');
                     setPickupCoords(null);
                     setDropCoords(null);
                     setEstimates([]);
                     setPickerMode(null);
                   }
                 } catch (e) {
                   console.error(e);
                   Alert.alert('Error', 'Failed to schedule ride.');
                 }
                 setProcessingMonthlyPayment(false);
               }}
            />
          </View>
        </Modal>
      )}

      {/* ─────────────────── HOME TAB ─────────────────── */}"""

CORRECT_REPLACEMENT = """          try {
            if (schedulePayload?.scheduleType === 'today') {
              const res = await API.post('/scheduled-rides/one-time', {
                pickup: { address: pickupAddr, location: { type: 'Point', coordinates: pickupCoords } },
                drop: { address: dropAddr, location: { type: 'Point', coordinates: dropCoords } },
                vehicleType: vehicleType,
                scheduledDate: schedulePayload.scheduledDate?.toISOString().split('T')[0],
                scheduledTime: schedulePayload.scheduledTime?.toISOString().split('T')[1].substring(0,5),
                returnTime: schedulePayload.returnTime ? schedulePayload.returnTime.toISOString().split('T')[1].substring(0,5) : null,
              });
              if (res.data.success) {
                Alert.alert('Ride Scheduled', 'Your ride has been scheduled successfully!');
                setScheduledRide({ pickup: pickupAddr, drop: dropAddr });
                setPickupAddr(''); setDropAddr(''); setPickupCoords(null); setDropCoords(null); setEstimates([]); setPickerMode(null);
              }
            } else if (schedulePayload?.scheduleType === 'weekly') {
              const res = await API.post('/scheduled-rides', {
                pickup: { address: pickupAddr, location: { type: 'Point', coordinates: pickupCoords } },
                drop: { address: dropAddr, location: { type: 'Point', coordinates: dropCoords } },
                vehicleType: vehicleType,
                repeatDay: parseInt(schedulePayload.repeatDay, 10),
                scheduledTime: schedulePayload.scheduledTime?.toISOString().split('T')[1].substring(0,5),
                tripType: schedulePayload.tripType,
                returnTime: schedulePayload.returnTime ? schedulePayload.returnTime.toISOString().split('T')[1].substring(0,5) : null,
              });
              if (res.data.success) {
                Alert.alert('Weekly Schedule Created', 'Your weekly commute has been scheduled!');
                setScheduledRide({ pickup: pickupAddr, drop: dropAddr });
                setPickupAddr(''); setDropAddr(''); setPickupCoords(null); setDropCoords(null); setEstimates([]); setPickerMode(null);
              }
            } else if (schedulePayload?.scheduleType === 'monthly') {
              const baseFare = estimatedFare || 0;
              const numMonths = schedulePayload.numMonths || 1;
              const tripsPerDay = schedulePayload.tripType === 'round' ? 2 : 1;
              const totalEst = baseFare * tripsPerDay * numMonths * 30;
              const discount = totalEst * 0.10;
              setMonthlyFareAmount(totalEst - discount);
              setShowMonthlyPayment(true);
            }
          } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to schedule ride.');
          }

          if (schedulePayload?.scheduleType !== 'monthly' && schedulePayload?.scheduleType !== 'today') {
            setScheduledRide({ pickup: pickupAddr, drop: dropAddr });
          }
          setPickupAddr(''); setDropAddr(''); setPickupCoords(null); setDropCoords(null); setEstimates([]); setPickerMode(null);
        }}
        pickupAddress={pickupAddr}
        dropAddress={dropAddr}
        onSelectLocation={(field) => {
          setShowScheduleConfirmScreen(false);
          setPickerMode(field);
        }}
      />

      {showMonthlyPayment && (
        <Modal visible transparent animationType="slide">
          <View style={{flex:1, backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <TouchableOpacity style={{flex: 1}} activeOpacity={1} onPress={() => !processingMonthlyPayment && setShowMonthlyPayment(false)} />
            <CustomerPaymentOptionsSheet
               amount={monthlyFareAmount}
               processing={processingMonthlyPayment}
               onCancel={() => setShowMonthlyPayment(false)}
               onSelect={async (method: string) => {
                 setProcessingMonthlyPayment(true);
                 try {
                   const res = await API.post('/scheduled-rides/monthly', {
                     pickup: { address: pickupAddr, location: { type: 'Point', coordinates: pickupCoords } },
                     drop: { address: dropAddr, location: { type: 'Point', coordinates: dropCoords } },
                     vehicleType: 'mini',
                     repeatDay: parseInt(schedulePayload.repeatDay, 10),
                     scheduledTime: schedulePayload.scheduledTime?.toISOString().split('T')[1].substring(0,5),
                     tripType: schedulePayload.tripType,
                     returnTime: schedulePayload.returnTime ? schedulePayload.returnTime.toISOString().split('T')[1].substring(0,5) : null,
                     startMonth: schedulePayload.startMonth,
                     numberOfMonths: schedulePayload.numMonths
                   });
                   if (res.data.success) {
                     Alert.alert('Monthly Schedule Created', 'Your monthly commute has been scheduled successfully!');
                     setShowMonthlyPayment(false);
                     if (res.data.data && res.data.data.rides && res.data.data.rides.length > 0) {
                       const upcoming = res.data.data.rides[0];
                       setScheduledRide({ ...upcoming, pickup: upcoming.pickup?.address || pickupAddr, drop: upcoming.drop?.address || dropAddr });
                     } else {
                       setScheduledRide({ pickup: pickupAddr, drop: dropAddr });
                     }
                     setPickupAddr(''); setDropAddr(''); setPickupCoords(null); setDropCoords(null); setEstimates([]); setPickerMode(null);
                   }
                 } catch (e) {
                   console.error(e);
                   Alert.alert('Error', 'Failed to schedule ride.');
                 }
                 setProcessingMonthlyPayment(false);
               }}
            />
          </View>
        </Modal>
      )}

      {/* ─────────────────── HOME TAB ─────────────────── */}"""

if BROKEN_START in content:
    content = content.replace(BROKEN_START, CORRECT_REPLACEMENT, 1)
    print("SUCCESS: Fixed the corrupted ScheduleConfirmScreen onSchedule handler!")
else:
    print("ERROR: Could not find the broken section!")
    # Try to find it differently
    idx = content.find("setIsScheduling(false);\n\n          try {")
    if idx != -1:
        print(f"Found alternate start at index {idx}")
    else:
        print("Alternate search also failed. Printing context around 'today' schedule...")
        idx2 = content.find("scheduleType === 'today'")
        print(f"Found 'today' at index {idx2}")
        print(repr(content[idx2-200:idx2+500]))

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("File written.")
