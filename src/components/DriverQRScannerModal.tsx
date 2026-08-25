import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface DriverQRScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onScan: (data: string) => Promise<boolean>;
}

export default function DriverQRScannerModal({ visible, onClose, onScan }: DriverQRScannerModalProps) {
  const { colors } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (visible && !permission) {
      requestPermission();
    }
  }, [visible, permission]);

  const handleBarCodeScanned = async ({ type, data }: { type: string, data: string }) => {
    if (scanned || processing) return;
    setScanned(true);
    setProcessing(true);
    
    const success = await onScan(data);
    if (!success) {
      setTimeout(() => {
        setScanned(false);
        setProcessing(false);
      }, 2000);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 50, backgroundColor: 'rgba(0,0,0,0.5)', position: 'absolute', top: 0, width: '100%', zIndex: 10 }}>
          <TouchableOpacity onPress={onClose} style={{ padding: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20 }}>
            <Feather name="x" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold', marginLeft: 16 }}>Scan Customer Pass</Text>
        </View>

        {!permission ? (
           <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} />
        ) : !permission.granted ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <Text style={{ color: '#FFF', textAlign: 'center', marginBottom: 20 }}>We need your permission to show the camera</Text>
            <TouchableOpacity style={{ padding: 12, backgroundColor: colors.accent, borderRadius: 8 }} onPress={requestPermission}>
              <Text style={{ color: '#FFF' }}>Grant Permission</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            <CameraView
              style={StyleSheet.absoluteFillObject}
              facing="back"
              onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
              barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            />
            <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }]}>
               <View style={{ width: 250, height: 250, borderWidth: 2, borderColor: colors.accent, backgroundColor: 'transparent' }} />
               <Text style={{ color: '#FFF', marginTop: 20, fontSize: 16, textAlign: 'center' }}>
                 {processing ? 'Verifying Pass...' : 'Align QR Code within frame'}
               </Text>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}
