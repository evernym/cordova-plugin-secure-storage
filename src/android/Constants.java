package com.crypho.plugins;

// Secure key store helper class, contains constants used for encrypting/decrypting data on Android.

public class Constants {

    // Key Store
    public static final String KEYSTORE = "AndroidKeyStore";
    public static final String RSA_ALGORITHM = "RSA/ECB/PKCS1Padding";
    public static final String TAG = "SecureKeyStore";

    // Internal storage file
    public static final String SKS_FILENAME = "SKS_KEY_FILE";
}