with open('App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("Book {selectedVehicle?.vehicleType?.toUpperCase()}", "{t('app.Book')} {selectedVehicle?.vehicleType?.toUpperCase()}")
content = content.replace("Confirm Pickup Location", "{t('app.ConfirmPickupLocation')}")
content = content.replace("Confirm Drop Location", "{t('app.ConfirmDropLocation')}")

with open('App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Success')
