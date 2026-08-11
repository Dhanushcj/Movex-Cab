import os
import re

jsx_path = r"g:\Dhanush\New folder\Movex-Cab\web-portal\src\pages\CustomerBooking.jsx"
css_path = r"g:\Dhanush\New folder\Movex-Cab\web-portal\src\pages\CustomerBooking.module.css"

with open(jsx_path, "r", encoding="utf-8") as f:
    jsx_content = f.read()

# Replace vehicles list
new_vehicles = """
  const vehicles = [
    { id: 'bike', name: 'Forge Bike', capacity: 1, time: '2 min', baseFare: 45, icon: BikeIcon, type: 'bike' },
    { id: 'auto', name: 'Forge Auto', capacity: 3, time: '3 min', baseFare: 65, icon: AutoRickshawIcon, type: 'auto' },
    { id: 'mini', name: 'Forge Mini', capacity: 3, time: '4 min', baseFare: 120, icon: CarIcon, type: 'car' },
    { id: 'bus', name: 'Forge Bus', capacity: 40, time: '6 min', baseFare: 180, icon: BusIcon, type: 'bus' },
  ];
"""
jsx_content = re.sub(r"const vehicles = \[.*?\];", new_vehicles.strip(), jsx_content, flags=re.DOTALL)

# Add Lucide icons to import
jsx_content = jsx_content.replace(
    "import { MapPin, Users, CheckCircle2, ChevronRight, Navigation } from 'lucide-react';",
    "import { MapPin, Users, CheckCircle2, ChevronRight, Navigation, Bell, User, Ticket, Search, LocateFixed, Check } from 'lucide-react';"
)

# Update sidebar content
sidebar_header_old = """
        <div className={styles.panelHeader}>
          <h1 className={styles.title}>Book a Ride</h1>
          {renderStepIndicator()}
        </div>
"""

sidebar_header_new = """
        <div className={styles.topHeader}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>Book a Ride</h1>
            <p className={styles.subtitle}>Choose your route and ride type</p>
          </div>
          <div className={styles.headerRight}>
            <button className={styles.iconBtn}><Bell size={20} /></button>
            <button className={styles.iconBtn}><User size={20} /></button>
          </div>
        </div>
        {renderStepIndicator()}
"""
jsx_content = jsx_content.replace(sidebar_header_old.strip(), sidebar_header_new.strip())

# Replace sidebar content block
sidebar_content_block = """
        <div className={styles.sidebarContent}>
          <div className={styles.bookingStateCard}>
            <h3 className={styles.sectionTitle}>Where are you going?</h3>
            <div className={styles.locationsSummary}>
              <div className={styles.locItem}>
                <div className={styles.locDot}></div>
                <div className={styles.locInputWrapper}>
                  <span className={styles.locLabel}>Pickup</span>
                  <div className={styles.locInputBox}>
                    <MapPin size={16} color="var(--forge-blue)" />
                    <span className={styles.locValue}>{pickupLocation ? pickupLocation.name : "Select from map or search..."}</span>
                  </div>
                </div>
              </div>
              <div className={styles.locLine}></div>
              <div className={styles.locItem}>
                <div className={styles.locDotDrop}></div>
                <div className={styles.locInputWrapper}>
                  <span className={styles.locLabel}>Drop-off</span>
                  <div className={styles.locInputBox}>
                    <MapPin size={16} color="#EF4444" />
                    <span className={styles.locValue}>{dropLocation ? dropLocation.name : "Select from map or search..."}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={styles.searchControls}>
              <button className={styles.controlBtn}><LocateFixed size={16} /> Use current location</button>
              <button className={styles.controlBtn}><Search size={16} /> Search destination</button>
            </div>
            
            {pickupLocation && dropLocation && (
              <div className={styles.routeDistanceInfo}>
                <span className={styles.routeText}>{pickupLocation.name.split(',')[0]} → {dropLocation.name.split(',')[0]}</span>
                <span className={styles.routeMeta}>48 km • 55 min</span>
              </div>
            )}
          </div>

          {pickupLocation && dropLocation && (
            <>
              <div className={styles.passCard}>
                <div className={styles.passIcon}><Ticket size={24} color="#FBBF24" /></div>
                <div className={styles.passInfo}>
                  <h4>Gold Mobility Pass Applied</h4>
                  <p>₹180 fare waived on this route</p>
                  <a href="#">View Pass →</a>
                </div>
                <div className={styles.passStatus}>ACTIVE</div>
              </div>

              <div className={styles.vehicleSelection}>
                <h3 className={styles.sectionTitle}>Select Vehicle</h3>
                <div className={styles.vehicleList}>
                  {vehicles.map(v => {
                    const Icon = v.icon;
                    const isSelected = selectedVehicle === v.id;
                    return (
                      <div 
                        key={v.id} 
                        className={`${styles.vehicleCard} ${isSelected ? styles.selected : ''}`}
                        onClick={() => setSelectedVehicle(v.id)}
                      >
                        <div className={styles.vehicleImage}>
                          <Icon size={32} color={isSelected ? "var(--forge-blue)" : "#64748b"} />
                        </div>
                        <div className={styles.vehicleInfo}>
                          <h4>{v.name} <Users size={12} className={styles.capacityIcon}/> {v.capacity}</h4>
                          <p>{v.time} ETA</p>
                        </div>
                        <div className={styles.vehiclePriceBox}>
                           <div className={styles.vehiclePrice}>₹{v.baseFare}</div>
                           {isSelected && <div className={styles.checkIcon}><Check size={16} /></div>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className={styles.fareSummaryCard}>
                <h3 className={styles.summaryTitle}>Fare Summary <span className={styles.summaryBadge}>(Gold Pass Applied)</span></h3>
                <div className={styles.fareDetailsList}>
                  <div className={styles.fareRow}>
                    <span>Base Fare</span>
                    <span>₹180</span>
                  </div>
                  <div className={styles.fareRow}>
                    <span>Pass Discount</span>
                    <span className={styles.discountText}>-₹180</span>
                  </div>
                  <div className={styles.fareRow}>
                    <span>Taxes & Fees</span>
                    <span>₹0</span>
                  </div>
                  <div className={styles.fareDivider}></div>
                  <div className={`${styles.fareRow} ${styles.fareTotalRow}`}>
                    <span>Total Fare</span>
                    <span>₹0.00</span>
                  </div>
                  <div className={styles.savingsRow}>
                    You save ₹180
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {pickupLocation && dropLocation && (
          <div className={styles.actionFooter}>
            <button 
              className={styles.btnPrimary}
              onClick={handleConfirmBooking}
              disabled={loading || bookingStatus}
            >
              {bookingStatus === 'searching' ? 'Finding Driver...' : bookingStatus === 'booked' ? 'Ride Booked!' : 'Continue to Confirm →'}
            </button>
          </div>
        )}
"""

# Regex substitute to replace the whole sidebar content
jsx_content = re.sub(r"<div className=\{styles\.sidebarContent\}>.*?</button>\s*</div>\s*\)\}\s*", sidebar_content_block.strip() + "\n\n        ", jsx_content, flags=re.DOTALL)


# Add "3 vehicles nearby" to map overlay
map_overlay_old = r"<div className=\{styles\.mapFloatingOverlay\}>.*?</div>"
map_overlay_new = """
          <>
            <div className={styles.mapFloatingOverlay}>
              <div className={styles.overlayText}>
                <strong>{pickupLocation.name.split(',')[0]} → {dropLocation.name.split(',')[0]}</strong> / 48 km / 55 min
              </div>
            </div>
            <div className={styles.vehiclesNearbyOverlay}>
              3 vehicles nearby
            </div>
          </>
"""
jsx_content = re.sub(map_overlay_old, map_overlay_new.strip(), jsx_content, flags=re.DOTALL)

with open(jsx_path, "w", encoding="utf-8") as f:
    f.write(jsx_content)

# Update CSS
with open(css_path, "r", encoding="utf-8") as f:
    css_content = f.read()

css_append = """
.topHeader {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}
.headerLeft {
  display: flex;
  flex-direction: column;
}
.headerRight {
  display: flex;
  gap: 12px;
}
.iconBtn {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s;
}
.iconBtn:hover {
  background: var(--bg-soft-blue);
  color: var(--forge-blue);
}
.locInputWrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.locInputBox {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #F8FAFC;
  border: 1px solid var(--border);
  padding: 10px 12px;
  border-radius: 12px;
  color: var(--text-primary);
  font-size: 14px;
}
.searchControls {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  margin-bottom: 16px;
}
.controlBtn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  background: #ffffff;
  border: 1px solid var(--border);
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  color: var(--forge-blue);
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}
.routeDistanceInfo {
  background: #F0F9FF;
  padding: 12px;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  border: 1px solid #BAE6FD;
}
.routeText {
  font-weight: 600;
  color: var(--forge-blue);
  font-size: 14px;
}
.routeMeta {
  font-size: 13px;
  color: var(--forge-blue);
  opacity: 0.8;
}
.passCard {
  background: linear-gradient(to right, #FFFBEB, #ffffff);
  border: 1px solid #FCD34D;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.1);
  position: relative;
}
.passIcon {
  width: 48px;
  height: 48px;
  background: #FEF3C7;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.passInfo h4 {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}
.passInfo p {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 6px;
}
.passInfo a {
  font-size: 13px;
  font-weight: 600;
  color: #D49F0C;
  text-decoration: none;
}
.passStatus {
  position: absolute;
  top: 16px;
  right: 16px;
  background: #10B981;
  color: white;
  font-size: 10px;
  font-weight: 800;
  padding: 4px 8px;
  border-radius: 20px;
}
.vehiclePriceBox {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}
.checkIcon {
  background: #FBBF24;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.summaryTitle {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.summaryBadge {
  font-size: 12px;
  font-weight: 600;
  color: #D49F0C;
  background: #FEF3C7;
  padding: 2px 8px;
  border-radius: 12px;
}
.savingsRow {
  background: #ECFDF5;
  color: #059669;
  padding: 10px;
  border-radius: 8px;
  text-align: center;
  font-weight: 700;
  font-size: 14px;
  margin-top: 12px;
}
.vehiclesNearbyOverlay {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: #ffffff;
  padding: 10px 20px;
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  font-weight: 600;
  font-size: 14px;
  color: var(--text-primary);
  z-index: 10;
  border: 1px solid var(--border);
}
"""
css_content += "\n" + css_append

with open(css_path, "w", encoding="utf-8") as f:
    f.write(css_content)

print("Patched successfully")
