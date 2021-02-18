// webauthn.js
import { base64Escape, base64Unescape } from '@/scripts/utils.js';

// Base URL for relying party
const authBaseUrl = process.env.VUE_APP_AUTH_BASE_URL;

// Base64 to ArrayBuffer
const bufferDecode = (value) => {
  return Uint8Array.from(atob(base64Unescape(value)), c => c.charCodeAt(0));
}

// ArrayBuffer to URLBase64
const bufferEncode = (value) => {
  return base64Escape(btoa(String.fromCharCode.apply(null, new Uint8Array(value))))
}

export default {
  /**
   * Register given username with the WebAuthn relying party
   */
  register: async (username) => {
    // Fetch registration challenge
    let res = await fetch(`${authBaseUrl}/challenge/register/${username}`);
    if (!res.ok) {
      // TODO
      return;
    }

    // Create credentials
    let credentialCreationOptions = await res.json();
    credentialCreationOptions.publicKey.challenge = bufferDecode(credentialCreationOptions.publicKey.challenge);
    credentialCreationOptions.publicKey.user.id = bufferDecode(credentialCreationOptions.publicKey.user.id);
    let credential = await navigator.credentials.create({ publicKey: credentialCreationOptions.publicKey });

    // Register
    let result = await fetch(`${authBaseUrl}/register/${username}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify({
        id: credential.id,
        rawId: bufferEncode(credential.rawId),
        type: credential.type,
        response: {
          attestationObject: bufferEncode(credential.response.attestationObject),
          clientDataJSON: bufferEncode(credential.response.clientDataJSON),
        },
      })
    });

    return result;
  },

  /**
   * Login with given username in the WebAuthn relying party
   */
  login: async (username) => {
    // Fetch login challenge
    let res = await fetch(`${authBaseUrl}/challenge/login/${username}`);
    if (!res.ok) {
      // TODO
      return;
    }

    // Request credentials
    let credentialRequestOptions = await res.json();
    credentialRequestOptions.publicKey.challenge = bufferDecode(credentialRequestOptions.publicKey.challenge);
    credentialRequestOptions.publicKey.allowCredentials.forEach(item => {
      item.id = bufferDecode(item.id);
    });
    let assertion = await navigator.credentials.get({ publicKey: credentialRequestOptions.publicKey });

    // Login
    let result = await fetch(`${authBaseUrl}/login/${username}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify({
        id: assertion.id,
        rawId: bufferEncode(assertion.rawId),
        type: assertion.type,
        response: {
          authenticatorData: bufferEncode(assertion.response.authenticatorData),
          clientDataJSON: bufferEncode(assertion.response.clientDataJSON),
          signature: bufferEncode(assertion.response.signature),
          userHandle: bufferEncode(assertion.response.userHandle),
        },
      })
    });

    return result;
  }
}
