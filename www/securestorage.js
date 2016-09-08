var SecureStorage, SecureStorageiOS, SecureStorageAndroid, SecureStorageWindows, SecureStorageBrowser;
var sjcl_ss = cordova.require('cordova-plugin-secure-storage.sjcl_ss');
var _AES_PARAM = {
    ks: 256,
    ts: 128,
    mode: 'ccm',
    cipher: 'aes'
};

var _checkCallbacks = function (success, error) {
    if (typeof success != 'function') {
        throw new Error('SecureStorage failure: success callback parameter must be a function');
    }
    if (typeof error != 'function') {
        throw new Error('SecureStorage failure: error callback parameter must be a function');
    }
};

var _merge_options = function (defaults, options){
    var res = {};
    var attrname;

    for (attrname in defaults) {
        res[attrname] = defaults[attrname];
    }
    for (attrname in options) {
        if (res.hasOwnProperty(attrname)) {
            res[attrname] = options[attrname];
        } else {
            throw new Error('SecureStorage failure: invalid option ' + attrname);
        }
    }

    return res;
};

/**
 * Helper method to execute Cordova native method
 *
 * @param   {String}    nativeMethodName Method to execute.
 * @param   {Array}     args             Execution arguments.
 * @param   {Function}  success          Called when returning successful result from an action.
 * @param   {Function}  error            Called when returning error result from an action.
 *
 */
var _executeNativeMethod = function (success, error, nativeMethodName, args) {
    // args checking
    _checkCallbacks(success, error);

    // By convention a failure callback should always receive an instance
    // of a JavaScript Error object.
    var fail = function(err) {
        // provide default message if no details passed to callback
        if (typeof err === 'undefined') {
            err = new Error("Error occured while executing native method.");
        }
        // wrap string to Error instance if necessary
        error(typeof err === 'string' ? new Error(err) : err);
    };

    cordova.exec(success, fail, 'SecureStorage', nativeMethodName, args);
};

SecureStorageiOS = function (success, error, service) {
    this.service = service;
    setTimeout(success, 0);
    return this;
};

SecureStorageiOS.prototype = {
    get: function (success, error, key) {
        try {
            _executeNativeMethod(success, error, 'get', [this.service, key]);
        } catch (e) {
            error(e);
        }
    },

    set: function (success, error, key, value) {
        try {
            _executeNativeMethod(success, error, 'set', [this.service, key, value]);
        } catch (e) {
            error(e);
        }
    },

    remove: function (success, error, key) {
        try {
            _executeNativeMethod(success, error, 'remove', [this.service, key]);
        } catch (e) {
            error(e);
        }
    }
};

// SecureStorage for Windows web interface and proxy parameters are the same as on iOS
// so we don't create own definition for Windows and simply re-use iOS
SecureStorageWindows = SecureStorageiOS;

SecureStorageAndroid = function(success, error, service) {
    this.service = service;
    try {
        _executeNativeMethod(success, error, "init", [this.service]);
    } catch (e) {
        error(e);
    }
    return this;
};

SecureStorageAndroid.prototype = {

    set: function(success, error, key, value) {
        try {
            _executeNativeMethod(success, error, "encrypt", [key, value]);
        } catch (e) {
            error(e);
        }
    },

    get: function(success, error, key) {
        try {
            _executeNativeMethod(success, error, "decrypt", [key]);;
        } catch (e) {
            error(e);
        }
    },

    remove: function (success, error, key) {
        try {
            _executeNativeMethod(success, error, "removeKeys", [key]);
        } catch (e) {
            error(e);
        }
    }

};

SecureStorageBrowser = function (success, error, service) {
    this.service = service;
    setTimeout(success, 0);
    return this;
};

SecureStorageBrowser.prototype = {

    get: function (success, error, key) {
        var value;
        try {
            _checkCallbacks(success, error);
            value = localStorage.getItem('_SS_' + key);
            if (!value) {
                error(new Error('Key "' + key + '" not found.'));
            } else {
                success(value);
            }
        } catch (e) {
            error(e);
        }
    },

    set: function (success, error, key, value) {
        try {
            _checkCallbacks(success, error);
            localStorage.setItem('_SS_' + key, value);
            success(key);
        } catch (e) {
            error(e);
        }
    },
    remove: function (success, error, key) {
        localStorage.removeItem('_SS_' + key);
        success(key);
    }
};

switch (cordova.platformId) {
case 'ios':
    SecureStorage = SecureStorageiOS;
    break;
case 'android':
    SecureStorage = SecureStorageAndroid;
    break;
case 'windows':
    SecureStorage = SecureStorageWindows;
    break;
case 'browser':
    SecureStorage = SecureStorageBrowser;
    break;
default:
    SecureStorage = null;
}

if (!cordova.plugins) {
    cordova.plugins = {};
}

if (!cordova.plugins.SecureStorage) {
    cordova.plugins.SecureStorage = SecureStorage;
}

if (typeof module != 'undefined' && module.exports) {
    module.exports = SecureStorage;
}
