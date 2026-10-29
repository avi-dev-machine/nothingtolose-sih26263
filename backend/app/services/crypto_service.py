import hmac
import hashlib
import json
from datetime import datetime
from typing import Dict, Any, Tuple
from app.config import settings

class CryptoService:
    @staticmethod
    def mask_apaar(apaar_id: str) -> str:
        """
        Masks APAAR ID preserving first 4 and last 4 digits for privacy.
        Example: 123456789012 -> '1234 **** 9012'
        """
        clean = apaar_id.replace(" ", "").replace("-", "")
        if len(clean) == 12:
            return f"{clean[:4]} **** {clean[8:]}"
        elif len(clean) > 8:
            return f"{clean[:3]} **** {clean[-3:]}"
        return "**** **** ****"

    @staticmethod
    def generate_apaar_hash(apaar_id: str) -> str:
        """
        Generates keyed HMAC-SHA256 lookup fingerprint.
        Avoids storing unsalted plaintext hashes that could be enumerated.
        """
        clean = apaar_id.strip().replace(" ", "").replace("-", "")
        return hmac.new(
            settings.HMAC_SALT_KEY.encode('utf-8'),
            clean.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()

    @staticmethod
    def sign_canonical_payload(payload: Dict[str, Any]) -> str:
        """
        Creates a cryptographic signature over canonical JSON payload.
        Ensures tamper-proof verification for student academic records.
        """
        # Canonical JSON string: sorted keys, compact separators
        canonical_str = json.dumps(payload, sort_keys=True, separators=(',', ':'))
        signature = hmac.new(
            settings.SECRET_KEY.encode('utf-8'),
            canonical_str.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        return signature

    @staticmethod
    def verify_payload_integrity(payload: Dict[str, Any], signature: str) -> Tuple[bool, str]:
        """
        Verifies if payload matches the signature.
        """
        try:
            expected_signature = CryptoService.sign_canonical_payload(payload)
            if hmac.compare_digest(expected_signature, signature):
                return True, "Record integrity verified successfully"
            return False, "Digital signature mismatch - record payload has been tampered with"
        except Exception as e:
            return False, f"Signature verification error: {str(e)}"

crypto_service = CryptoService()
