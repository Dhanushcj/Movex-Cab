import { useTheme } from '../context/ThemeContext';
import Colors from '../constants/colors';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Animated } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import CustomerPaymentOptionsSheet from './CustomerPaymentOptionsSheet';
import API from '../services/api';

export default function CustomerQRScannerScreen({ ride, onPaymentComplete, onClose }: any) {
    const { isDark } = useTheme();
    const styles = getStyles(Colors);

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [qrData, setQrData] = useState<any>(null);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  const handleBarCodeScanned = ({ type, data }: { type: string, data: string }) => {
    if (scanned) return;
    setScanned(true);

    // Format expected: upi://pay?pa=movex.company@cabapp&pn=MoveX Cabs&am=150&tn=Ride-123-Driver-456&cu=INR&ref=...
    if (data.includes('upi://pay') && data.includes(`Ride-${ride._id}`)) {
      try {
        const urlParams = new URLSearchParams(data.split('?')[1]);
        const amount = urlParams.get('am');
        setQrData({ amount });
        setShowPaymentOptions(true);
      } catch (e) {
        Alert.alert('Error', 'Invalid QR code');
        setScanned(false);
      }
    } else {
      Alert.alert('Invalid QR', 'Please scan the QR code displayed on the driver\'s device.');
      setTimeout(() => setScanned(false), 2000);
    }
  };

  const processPayment = async (method: string) => {
    setProcessing(true);
    try {
      const response = await API.put(`/bookings/${ride._id}/pay`, { paymentMethod: method });
      if (response.data.success) {
        onPaymentComplete();
      }
    } catch (e: any) {
      Alert.alert('Payment Failed', e.response?.data?.message || 'Failed to process payment');
      setProcessing(false);
    }
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backBtn}>
          <Feather name="chevron-left" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan to Pay</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.scannerContainer}>
        {!showPaymentOptions && (
          <View style={{ flex: 1 }}>
            <CameraView
              style={StyleSheet.absoluteFillObject}
              facing="back"
              onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: ["qr"],
              }}
            />
            <View style={[StyleSheet.absoluteFillObject, styles.overlay]}>
              <View style={styles.scanBox} />
              <Text style={styles.scanText}>Position the driver's QR code in this frame</Text>
            </View>
          </View>
        )}
      </View>

      {showPaymentOptions && (
        <CustomerPaymentOptionsSheet
          amount={qrData?.amount}
          onSelect={processPayment}
          processing={processing}
          onCancel={() => {
            setShowPaymentOptions(false);
            setScanned(false);
          }}
        />
      )}
    </View>
  );
}

const getStyles = (Colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary
  },
  header: {
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.bgSecondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderGlass
  },
  backBtn: {
    padding: 8,
    marginLeft: -8
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary
  },
  scannerContainer: {
    flex: 1,
    overflow: 'hidden'
  },
  camera: {
    flex: 1
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  scanBox: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#00C896',
    backgroundColor: 'transparent',
    borderRadius: 20
  },
  scanText: {
    color: Colors.bgSecondary,
    marginTop: 20,
    fontSize: 14,
    fontWeight: '500'
  },
  permissionText: {
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
    color: Colors.textSecondary,
    paddingHorizontal: 20
  },
  permissionBtn: {
    backgroundColor: '#0053B3',
    marginHorizontal: 40,
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center'
  },
  permissionBtnText: {
    color: Colors.bgSecondary,
    fontWeight: '600',
    fontSize: 16
  }
});
