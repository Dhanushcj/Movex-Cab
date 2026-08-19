import React, { useState, useEffect, useRef } from 'react';
import { 
  QrCode, 
  MapPin, 
  Navigation2, 
  CheckCircle2, 
  ChevronRight, 
  ShieldCheck, 
  Car,
  Calendar,
  RefreshCcw,
  Clock,
  Download,
  Pause,
  Award,
  Crown,
  X,
  ArrowRight
} from 'lucide-react';
import BikeIcon from '../components/BikeIcon';
import AutoRickshawIcon from '../components/AutoRickshawIcon';
import CarIcon from '../components/CarIcon';
import BusIcon from '../components/BusIcon';
import API from '../services/api';
import styles from './CustomerPass.module.css';

const CustomerPass = () => {
  const [activePassData, setActivePassData] = useState(null);
  const [availablePasses, setAvailablePasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const exploreRef = useRef(null);
  
  const [autoRenew, setAutoRenew] = useState(true);
  const [passStatus, setPassStatus] = useState('Active');
  const [passTier, setPassTier] = useState('Gold');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showUpgradeConfirmModal, setShowUpgradeConfirmModal] = useState(false);
  const [upgradeTargetTier, setUpgradeTargetTier] = useState(null);
  const [pendingPurchaseTier, setPendingPurchaseTier] = useState(null);
  const passId = "FG-MP-849201";
  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [myPassRes, availableRes] = await Promise.all([
        API.get('/subscriptions/my-pass'),
        API.get('/subscriptions/available')
      ]);

      if (availableRes.data.success) {
        setAvailablePasses(availableRes.data.data);
      }

      if (myPassRes.data.success && myPassRes.data.data) {
        const up = myPassRes.data.data;
        setActivePassData(up);
        setPassStatus('Active');
        // Extract base tier from name (e.g. "GOLD PASS" -> "Gold")
        const tierName = up.pass.name.split(' ')[0];
        setPassTier(tierName.charAt(0).toUpperCase() + tierName.slice(1).toLowerCase());
      } else {
        setPassStatus('Cancelled');
      }
    } catch (err) {
      console.error(err);
      setPassStatus('Cancelled');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPass = () => {
    setShowCancelModal(true);
  };

  const confirmCancelPass = async () => {
    try {
      if (activePassData) {
        await API.post('/subscriptions/cancel', { passId: activePassData._id });
      }
      setPassStatus('Cancelled');
      setActivePassData(null);
      setAutoRenew(false);
      setShowCancelModal(false);
    } catch (err) {
      alert("Failed to cancel pass");
    }
  };

  const handleUpgradeSelect = (tier) => {
    setUpgradeTargetTier(tier);
    setShowUpgradeConfirmModal(true);
  };

  const confirmUpgrade = () => {
    setShowUpgradeConfirmModal(false);
    setShowUpgradeModal(false);
    handleInitiatePurchase(upgradeTargetTier);
  };

  const handleInitiatePurchase = (tier) => {
    setPendingPurchaseTier(tier);
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = async () => {
    await handlePurchasePass(pendingPurchaseTier);
    setShowPaymentModal(false);
    setPendingPurchaseTier(null);
  };

  const renderStars = (tier) => {
    if (tier === 'Silver') return <span>★</span>;
    if (tier === 'Diamond') return <><span>★</span><span>★</span><span>★</span><span>★</span><span>★</span></>;
    return <><span>★</span><span>★</span><span>★</span></>;
  };

  const getCarSrc = (tier) => {
    if (tier === 'Diamond') return "/car-black.png";
    if (tier === 'Gold') return "/car-yellow.png";
    return "/car.png"; // Silver / Default
  };

  const handlePurchasePass = async (tier) => {
    try {
      // Find pass by tier (e.g., "GOLD PASS" or "Gold")
      const passObj = availablePasses.find(p => p.name.toLowerCase().includes(tier.toLowerCase()));
      if (passObj) {
        await API.post('/subscriptions/purchase', { passId: passObj._id });
        await fetchData(); // refresh state from backend
      } else {
        alert("Plan not found!");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to purchase pass");
    }
  };

  const scrollToExplore = () => {
    exploreRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return <div style={{padding: 40}}>Loading passes...</div>;
  }

  if (passStatus === 'Cancelled') {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.noPassHero}>
          <div className={styles.npLeft}>
            <h1 className={styles.npTitle}>You don't have any<br/>active pass yet</h1>
            <p className={styles.npSub}>Get a mobility pass and enjoy unlimited rides across our fixed corridors with priority access and no surge pricing.</p>
            <button className={styles.btnExploreYellow} onClick={scrollToExplore}>Explore Passes <ArrowRight size={16} /></button>
          </div>
          <div className={styles.npRight}>
            <div className={styles.npIllus}>
              <div className={styles.npBuildings}></div>
              <div className={styles.npShield}>
                <Crown size={32} color="#FACC15" />
                <CheckCircle2 size={16} color="#FACC15" style={{marginTop: '4px'}} />
              </div>
              <div className={styles.npVehicles}>
                <AutoRickshawIcon size={64} color="#374151" />
                <BikeIcon size={64} color="#374151" />
                <CarIcon size={80} />
                <BusIcon size={80} color="#374151" />
              </div>
            </div>
          </div>
        </div>

        <div className={styles.npSection}>
          <h2 className={styles.npSectionTitle}>Why choose a Mobility Pass?</h2>
          <div className={styles.npBenefitsGrid}>
            <div className={styles.npBenefitCard}>
              <div className={styles.npIconBox} style={{color: '#3B82F6', background: '#EFF6FF'}}><RefreshCcw size={24} /></div>
              <h4>Unlimited Rides</h4>
              <p>Enjoy unlimited rides on covered routes.</p>
            </div>
            <div className={styles.npBenefitCard}>
              <div className={styles.npIconBox} style={{color: '#EAB308', background: '#FEF9C3'}}><Car size={24} /></div>
              <h4>Multiple Vehicles</h4>
              <p>Use Bike, Auto, Cab or Bus.</p>
            </div>
            <div className={styles.npBenefitCard}>
              <div className={styles.npIconBox} style={{color: '#22C55E', background: '#F0FDF4'}}><MapPin size={24} /></div>
              <h4>Fixed Corridors</h4>
              <p>Travel across selected fixed corridors.</p>
            </div>
            <div className={styles.npBenefitCard}>
              <div className={styles.npIconBox} style={{color: '#EF4444', background: '#FEF2F2'}}><ShieldCheck size={24} /></div>
              <h4>No Surge Pricing</h4>
              <p>Fixed price rides on covered routes.</p>
            </div>
          </div>
        </div>

        <div className={styles.npSection} ref={exploreRef}>
          <h2 className={styles.npSectionTitle}>Explore our passes</h2>
          <div className={styles.npPassesGrid}>
            {/* Silver */}
            <div className={styles.npPassCard}>
              <div className={styles.npPassHeader}>
                <div className={styles.npPassTier}>
                  <Award size={20} color="#9CA3AF" /> Silver
                </div>
              </div>
              <p className={styles.npPassDesc}>Great for occasional rides</p>
              <div className={styles.npPassFeats}>
                <div className={styles.npFeat}><CheckCircle2 size={16} color="#9CA3AF" /> 30 Rides / month</div>
                <div className={styles.npFeat}><CheckCircle2 size={16} color="#9CA3AF" /> Bike & Auto only</div>
                <div className={styles.npFeat}><CheckCircle2 size={16} color="#9CA3AF" /> Active corridors</div>
                <div className={styles.npFeat}><CheckCircle2 size={16} color="#9CA3AF" /> No surge pricing</div>
              </div>
              <div className={styles.npPassBottom}>
                <div className={styles.npPassPrice}>₹999 <span>/ month</span></div>
                <button className={styles.btnBuyOutline} style={{borderColor: '#9CA3AF', color: '#6B7280', width: '100%'}} onClick={() => handleInitiatePurchase('Silver')}>Get Silver Pass</button>
              </div>
            </div>

            {/* Gold */}
            <div className={styles.npPassCard} style={{background: '#FEFce8', borderColor: '#FEF08A'}}>
              <div className={styles.npPassHeader}>
                <div className={styles.npPassTier}>
                  <Crown size={20} color="#EAB308" /> Gold
                </div>
                <div className={styles.npBadgePop}>Most Popular</div>
              </div>
              <p className={styles.npPassDesc}>Perfect for daily travelers</p>
              <div className={styles.npPassFeats}>
                <div className={styles.npFeat}><CheckCircle2 size={16} /> Unlimited rides</div>
                <div className={styles.npFeat}><CheckCircle2 size={16} /> All vehicle types</div>
                <div className={styles.npFeat}><CheckCircle2 size={16} /> All active corridors</div>
                <div className={styles.npFeat}><CheckCircle2 size={16} /> No surge pricing</div>
              </div>
              <div className={styles.npPassBottom}>
                <div className={styles.npPassPrice}>₹1,499 <span>/ month</span></div>
                <button className={styles.btnBuyYellow} style={{width: '100%'}} onClick={() => handleInitiatePurchase('Gold')}>Get Gold Pass</button>
              </div>
            </div>

            {/* Diamond */}
            <div className={styles.npPassCard}>
              <div className={styles.npPassHeader}>
                <div className={styles.npPassTier}>
                  <Crown size={20} color="#6366F1" /> Diamond
                </div>
              </div>
              <p className={styles.npPassDesc}>Great for frequent commuters</p>
              <div className={styles.npPassFeats}>
                <div className={styles.npFeat}><CheckCircle2 size={16} color="#6366F1" /> Unlimited rides</div>
                <div className={styles.npFeat}><CheckCircle2 size={16} color="#6366F1" /> All vehicle types</div>
                <div className={styles.npFeat}><CheckCircle2 size={16} color="#6366F1" /> All active corridors</div>
                <div className={styles.npFeat}><CheckCircle2 size={16} color="#6366F1" /> Priority booking</div>
              </div>
              <div className={styles.npPassBottom}>
                <div className={styles.npPassPrice}>₹2,499 <span>/ month</span></div>
                <button className={styles.btnBuyOutline} style={{width: '100%'}} onClick={() => handleInitiatePurchase('Diamond')}>Get Diamond Pass</button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Payment Modal */}
        {showPaymentModal && (
          <div className={styles.modalOverlay} onClick={() => setShowPaymentModal(false)}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>Complete Payment</h3>
                <button className={styles.modalClose} onClick={() => setShowPaymentModal(false)}>
                  <X size={20} />
                </button>
              </div>
              <div style={{textAlign: 'center', padding: '20px 0'}}>
                <div style={{background: '#F3F4F6', padding: '24px', borderRadius: '12px', marginBottom: '20px'}}>
                  <h2 style={{margin: '0 0 8px 0', color: '#1F2937'}}>{pendingPurchaseTier} Pass</h2>
                  <p style={{margin: 0, color: '#6B7280'}}>You are about to purchase the {pendingPurchaseTier} Mobility Pass.</p>
                </div>
                <button className={styles.btnPrimary} style={{width: '100%', justifyContent: 'center'}} onClick={handleConfirmPayment}>
                  Confirm Payment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      
      {/* Main Grid */}
      <div className={styles.mainGrid}>
        
        {/* LEFT COLUMN */}
        <div className={styles.leftColumn}>
          
          {/* Premium Pass Card */}
          <div className={styles.cardContainer}>
            <div className={styles.premiumPassCard}>
              <div className={styles.passCardBg}></div>
              
              <div className={styles.passTopRow}>
                <div className={styles.passBranding}>
                  <Crown size={16} color="#FFD700" className={styles.brandIcon} />
                  <span>FORGE MOBILITY PASS</span>
                </div>
                <div className={styles.badgeActive} style={passStatus === 'Cancelled' ? { background: '#EF4444' } : {}}>
                  {passStatus.toUpperCase()}
                </div>
              </div>

              <h2 className={styles.passTier}>{passTier}</h2>
              <p className={styles.passDesc}>Unlimited rides across our fixed corridors</p>
              
              <div className={styles.passDivider}></div>
              
              <div className={styles.passInfoGrid}>
                <div className={styles.passInfoItem}>
                  <span className={styles.passInfoLabel}>VALID UNTIL</span>
                  <span className={styles.passInfoValue}>4 Sep 2026</span>
                </div>
                <div className={styles.passInfoItem}>
                  <span className={styles.passInfoLabel}>REMAINING</span>
                  <span className={styles.passInfoValue}>Unlimited Rides</span>
                </div>
                <div className={styles.passInfoItem}>
                  <span className={styles.passInfoLabel}>PASS ID</span>
                  <span className={styles.passInfoValue}>{passId}</span>
                </div>
              </div>

              {/* Shield Visual */}
              <div className={styles.shieldVisual}>
                <div className={styles.shieldInner}>
                  <Crown size={32} color="#FFF" />
                  <span className={styles.shieldText}>{passTier.toUpperCase()}</span>
                  <div className={styles.stars}>
                    {renderStars(passTier)}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Pass Controls Below Card */}
            <div className={styles.passControls}>
              <div className={styles.passControlItem}>
                <span className={styles.controlLabel}>Pass Status</span>
                <div className={styles.statusActive} style={passStatus === 'Cancelled' ? { color: '#EF4444' } : {}}>
                  <div className={styles.statusDot} style={passStatus === 'Cancelled' ? { background: '#EF4444' } : {}}></div>
                  {passStatus}
                </div>
              </div>
              <div className={styles.passControlItem}>
                <span className={styles.controlLabel}>Auto-renewal</span>
                <div 
                  className={`${styles.toggleSwitch} ${autoRenew ? styles.toggleOn : ''}`}
                  onClick={() => setAutoRenew(!autoRenew)}
                >
                  <span className={styles.toggleText}>{autoRenew ? 'ON' : 'OFF'}</span>
                </div>
              </div>
              <button className={styles.btnQr}>
                <QrCode size={18} /> View Pass QR
              </button>
            </div>
          </div>

          {/* Pass Management Card */}
          <div className={styles.cardContainer}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>PASS MANAGEMENT</h3>
            </div>
            <div className={styles.passManagementActions}>
              <div className={styles.pmActionBox}>
                <div className={styles.pmIconBoxUpgrade}>
                  <Crown size={24} color="#D49F0C" />
                </div>
                <div className={styles.pmContent}>
                  <h4>Upgrade Pass</h4>
                  <p>Get more benefits and priority access</p>
                </div>
                <button className={styles.btnUpgrade} onClick={() => setShowUpgradeModal(true)}>Upgrade</button>
              </div>
              
              <div className={styles.pmActionBox}>
                <div className={styles.pmIconBoxCancel}>
                  <Pause size={24} color="#E1251B" />
                </div>
                <div className={styles.pmContent}>
                  <h4>Cancel Pass</h4>
                  <p>End your pass benefits instantly</p>
                </div>
                <button className={styles.btnCancel} onClick={handleCancelPass} disabled={passStatus === 'Cancelled'}>
                  {passStatus === 'Cancelled' ? 'Cancelled' : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        </div>


        {/* RIGHT COLUMN */}
        <div className={styles.rightColumn}>
          
          {/* Pass Usage Card */}
          <div className={styles.cardContainer}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>PASS USAGE</h3>
              <button className={styles.btnText}>View History <ChevronRight size={16} /></button>
            </div>
            
            <div className={styles.usageStatsFlex}>
              <div className={styles.usageStatBox}>
                <div className={styles.uIconBox}><Calendar size={20} color="#0053B3" /></div>
                <div className={styles.uLabel}>RIDES USED</div>
                <div className={styles.uValue}>24</div>
                <div className={styles.uSub}>This Period</div>
              </div>
              
              <div className={styles.usageStatBoxActive}>
                <div className={styles.uIconBoxGold}><RefreshCcw size={20} color="#D49F0C" /></div>
                <div className={styles.uLabel}>RIDES REMAINING</div>
                <div className={styles.uValueBlue}>Unlimited</div>
                <div className={styles.uSub}>No daily limit</div>
              </div>
              
              <div className={styles.usageStatBox}>
                <div className={styles.uIconBoxGreen}><Calendar size={20} color="#10B981" /></div>
                <div className={styles.uLabel}>DAYS REMAINING</div>
                <div className={styles.uValueGreen}>21</div>
                <div className={styles.uSub}>Until 4 Sep 2026</div>
              </div>
            </div>
            
            <div className={styles.vehicleCoverageBox}>
              <div className={styles.vcLeft}>
                <ShieldCheck size={24} color="#0053B3" />
                <div>
                  <div className={styles.vcTitle}>You can take unlimited rides with all vehicle types</div>
                  <div className={styles.vcSub}>Bike, Auto, Cab, or Bus</div>
                </div>
              </div>
              <div className={styles.vcIcons}>
                <BikeIcon size={24} color="#374151" />
                <AutoRickshawIcon size={24} color="#374151" />
                <CarIcon size={24} color="#374151" />
                <BusIcon size={24} color="#374151" />
              </div>
            </div>
          </div>

          {/* What's Included Card */}
          <div className={styles.cardContainer}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>WHAT'S INCLUDED</h3>
            </div>
            
            <div className={styles.includedFlex}>
              <div className={styles.includedList}>
                <div className={styles.includedItem}>
                  <CheckCircle2 size={20} className={styles.checkIcon} />
                  <span>Unlimited rides on covered routes</span>
                </div>
                <div className={styles.includedItem}>
                  <CheckCircle2 size={20} className={styles.checkIcon} />
                  <span>Multiple vehicle types (Bike, Auto, Cab, Bus)</span>
                </div>
                <div className={styles.includedItem}>
                  <CheckCircle2 size={20} className={styles.checkIcon} />
                  <span>Fixed corridor access</span>
                </div>
                <div className={styles.includedItem}>
                  <CheckCircle2 size={20} className={styles.checkIcon} />
                  <span>Priority booking during high demand</span>
                </div>
                <div className={styles.includedItem}>
                  <CheckCircle2 size={20} className={styles.checkIcon} />
                  <span>Digital pass verification</span>
                </div>
                <div className={styles.includedItem}>
                  <CheckCircle2 size={20} className={styles.checkIcon} />
                  <span>No surge pricing on covered routes</span>
                </div>
              </div>
              
              <div className={styles.includedIllustration}>
                <div className={styles.illusBuilding1}></div>
                <div className={styles.illusBuilding2}></div>
                <div className={styles.illusBuilding3}></div>
                <div className={styles.illusShield}>
                  <Crown size={28} color="#FACC15" />
                  <CheckCircle2 size={20} color="#FACC15" style={{marginTop: 6}} />
                </div>
                <div className={styles.illusCar}>
                  <CarIcon size={120} src={getCarSrc(passTier)} />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
      


      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className={styles.modalOverlay} onClick={() => setShowUpgradeModal(false)}>
          <div className={styles.modalContentWide} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Choose a Plan to Upgrade</h3>
              <button className={styles.modalClose} onClick={() => setShowUpgradeModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className={styles.npPassesGrid} style={{marginTop: '20px'}}>
              {/* Silver */}
              <div className={styles.npPassCard}>
                <div className={styles.npPassHeader}>
                  <div className={styles.npPassTier}>
                    <Award size={20} color="#9CA3AF" /> Silver
                  </div>
                </div>
                <p className={styles.npPassDesc}>Great for occasional rides</p>
                <div className={styles.npPassFeats}>
                  <div className={styles.npFeat}><CheckCircle2 size={16} color="#9CA3AF" /> 30 Rides / month</div>
                  <div className={styles.npFeat}><CheckCircle2 size={16} color="#9CA3AF" /> Bike & Auto only</div>
                  <div className={styles.npFeat}><CheckCircle2 size={16} color="#9CA3AF" /> Active corridors</div>
                  <div className={styles.npFeat}><CheckCircle2 size={16} color="#9CA3AF" /> No surge pricing</div>
                </div>
                <div className={styles.npPassBottom}>
                  <div className={styles.npPassPrice}>₹999 <span>/ month</span></div>
                  {passTier === 'Silver' ? (
                    <button className={styles.btnBuyOutline} disabled style={{borderColor: '#D1D5DB', color: '#9CA3AF', cursor: 'not-allowed', width: '100%'}}>Current Plan</button>
                  ) : (
                    <button className={styles.btnBuyOutline} style={{borderColor: '#9CA3AF', color: '#6B7280', width: '100%'}} onClick={() => handleUpgradeSelect('Silver')}>Upgrade to Silver</button>
                  )}
                </div>
              </div>

              {/* Gold */}
              <div className={styles.npPassCard} style={{background: '#FEFce8', borderColor: '#FEF08A'}}>
                <div className={styles.npPassHeader}>
                  <div className={styles.npPassTier}>
                    <Crown size={20} color="#EAB308" /> Gold
                  </div>
                  <div className={styles.npBadgePop}>Most Popular</div>
                </div>
                <p className={styles.npPassDesc}>Perfect for daily travelers</p>
                <div className={styles.npPassFeats}>
                  <div className={styles.npFeat}><CheckCircle2 size={16} color="#EAB308" /> Unlimited rides</div>
                  <div className={styles.npFeat}><CheckCircle2 size={16} color="#EAB308" /> All vehicle types</div>
                  <div className={styles.npFeat}><CheckCircle2 size={16} color="#EAB308" /> All active corridors</div>
                  <div className={styles.npFeat}><CheckCircle2 size={16} color="#EAB308" /> No surge pricing</div>
                </div>
                <div className={styles.npPassBottom}>
                  <div className={styles.npPassPrice}>₹1,499 <span>/ month</span></div>
                  {passTier === 'Gold' ? (
                    <button className={styles.btnBuyYellow} disabled style={{background: '#F3F4F6', color: '#9CA3AF', cursor: 'not-allowed', width: '100%'}}>Current Plan</button>
                  ) : (
                    <button className={styles.btnBuyYellow} style={{width: '100%'}} onClick={() => handleUpgradeSelect('Gold')}>Upgrade to Gold</button>
                  )}
                </div>
              </div>

              {/* Diamond */}
              <div className={styles.npPassCard}>
                <div className={styles.npPassHeader}>
                  <div className={styles.npPassTier}>
                    <Crown size={20} color="#6366F1" /> Diamond
                  </div>
                </div>
                <p className={styles.npPassDesc}>Great for frequent commuters</p>
                <div className={styles.npPassFeats}>
                  <div className={styles.npFeat}><CheckCircle2 size={16} color="#6366F1" /> Unlimited rides</div>
                  <div className={styles.npFeat}><CheckCircle2 size={16} color="#6366F1" /> All vehicle types</div>
                  <div className={styles.npFeat}><CheckCircle2 size={16} color="#6366F1" /> All active corridors</div>
                  <div className={styles.npFeat}><CheckCircle2 size={16} color="#6366F1" /> Priority booking</div>
                </div>
                <div className={styles.npPassBottom}>
                  <div className={styles.npPassPrice}>₹2,499 <span>/ month</span></div>
                  {passTier === 'Diamond' ? (
                    <button className={styles.btnBuyOutline} disabled style={{borderColor: '#D1D5DB', color: '#9CA3AF', cursor: 'not-allowed', width: '100%'}}>Current Plan</button>
                  ) : (
                    <button className={styles.btnBuyOutline} style={{width: '100%'}} onClick={() => handleUpgradeSelect('Diamond')}>Upgrade to Diamond</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className={styles.modalOverlay} onClick={() => setShowPaymentModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Complete Payment</h3>
              <button className={styles.modalClose} onClick={() => setShowPaymentModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div style={{textAlign: 'center', padding: '20px 0'}}>
              <div style={{background: '#F3F4F6', padding: '24px', borderRadius: '12px', marginBottom: '20px'}}>
                <h2 style={{margin: '0 0 8px 0', color: '#1F2937'}}>{pendingPurchaseTier} Pass</h2>
                <p style={{margin: 0, color: '#6B7280'}}>You are about to purchase the {pendingPurchaseTier} Mobility Pass.</p>
              </div>
              <button className={styles.btnPrimary} style={{width: '100%', justifyContent: 'center'}} onClick={handleConfirmPayment}>
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Confirm Modal */}
      {showUpgradeConfirmModal && (
        <div className={styles.modalOverlay} onClick={() => setShowUpgradeConfirmModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Confirm Upgrade</h3>
              <button className={styles.modalClose} onClick={() => setShowUpgradeConfirmModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div style={{padding: '20px 0'}}>
              <div style={{background: '#FFFBEB', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #F59E0B', marginBottom: '20px'}}>
                <h4 style={{color: '#92400E', margin: '0 0 8px 0', fontSize: '16px'}}>Note on Upgrade</h4>
                <p style={{color: '#B45309', margin: 0, fontSize: '14px', lineHeight: '1.5'}}>
                  Your existing pass will be cancelled and will not be refunded. Please confirm to proceed to payment for the {upgradeTargetTier} Pass.
                </p>
              </div>
              <div style={{display: 'flex', gap: '12px'}}>
                <button className={styles.btnOutline} style={{flex: 1, borderColor: '#D1D5DB', color: '#374151', justifyContent: 'center'}} onClick={() => setShowUpgradeConfirmModal(false)}>
                  Go Back
                </button>
                <button className={styles.btnPrimary} style={{flex: 1, justifyContent: 'center'}} onClick={confirmUpgrade}>
                  Proceed to Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirm Modal */}
      {showCancelModal && (
        <div className={styles.modalOverlay} onClick={() => setShowCancelModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Cancel Mobility Pass</h3>
              <button className={styles.modalClose} onClick={() => setShowCancelModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div style={{padding: '20px 0'}}>
              <div style={{background: '#FEF2F2', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #EF4444', marginBottom: '20px'}}>
                <h4 style={{color: '#991B1B', margin: '0 0 8px 0', fontSize: '16px'}}>Warning</h4>
                <p style={{color: '#B91C1C', margin: 0, fontSize: '14px', lineHeight: '1.5'}}>
                  Are you sure you want to cancel your pass? Your current pass will be cancelled immediately and will not be refunded.
                </p>
              </div>
              <div style={{display: 'flex', gap: '12px'}}>
                <button className={styles.btnOutline} style={{flex: 1, borderColor: '#D1D5DB', color: '#374151', justifyContent: 'center'}} onClick={() => setShowCancelModal(false)}>
                  Keep Pass
                </button>
                <button className={styles.btnPrimary} style={{flex: 1, background: '#EF4444', borderColor: '#EF4444', justifyContent: 'center'}} onClick={confirmCancelPass}>
                  Yes, Cancel Pass
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CustomerPass;