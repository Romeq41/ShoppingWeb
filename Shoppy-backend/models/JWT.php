<?php

class JWT
{
    private $secret;
    private $header;

    public function __construct($secret)
    {
        $this->secret = $secret;
        $this->header = ['alg' => 'HS256', 'typ' => 'JWT'];
    }

    public function encode($data): string
    {
        $base64UrlHeader = $this->base64UrlEncode(json_encode($this->header));
        $base64UrlPayload = $this->base64UrlEncode(json_encode($data));

        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $this->secret, true);
        $base64UrlSignature = $this->base64UrlEncode($signature);

        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }

    public function decode($jwt): ?object
    {
        $parts = explode('.', $jwt);

        if (count($parts) !== 3) {
            return null; // Invalid JWT format
        }

        [$base64UrlHeader, $base64UrlPayload, $base64UrlSignature] = $parts;

        // Verify signature
        $expectedSignature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $this->secret, true);
        if (!hash_equals($this->base64UrlDecode($base64UrlSignature), $expectedSignature)) {
            return null; // Invalid signature
        }

        // Decode payload
        $payload = json_decode($this->base64UrlDecode($base64UrlPayload), true);

        if (!$payload || isset($payload['exp']) && time() > $payload['exp']) {
            return null; // Token expired or invalid
        }

        return (object) $payload;
    }

    private function base64UrlEncode($data): string
    {
        return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($data));
    }

    private function base64UrlDecode($data): string
    {
        return base64_decode(str_replace(['-', '_'], ['+', '/'], $data));
    }
}
