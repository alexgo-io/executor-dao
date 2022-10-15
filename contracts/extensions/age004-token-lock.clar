(impl-trait .extension-trait.extension-trait)

(define-constant ERR-NOT-AUTHORIZED (err u1000))
(define-constant ERR-SCHEDULE-NOT-FOUND (err u1001))
(define-constant ERR-BLOCK-HEIGHT-NOT-REACHED (err u1002))
(define-constant ERR-EXTENSION-NOT-AUTHORIZED (err u1004))

(define-data-var tokens-to-vest uint u0)

(define-map vesting-schedule 
    {address: principal, vesting-id: uint} 
    {amount: uint, vesting-timestamp: uint}
)

(define-public (is-dao-or-extension)
	(ok (asserts! (or (is-eq tx-sender .executor-dao) (contract-call? .executor-dao is-extension contract-caller)) err-unauthorised))
)

(define-read-only (get-tokens-to-vest)
    (var-get tokens-to-vest)
)

(define-public (set-vesting-schedule (address principal) (vesting-id uint) (vesting-timestamp uint) (amount uint))
    (begin 
        (try! (is-dao-or-extension))
        (map-set vesting-schedule { address: address, vesting-id: vesting-id } { amount: amount, vesting-timestamp: vesting-timestamp })
        (ok (var-set tokens-to-vest (+ (var-get tokens-to-vest) amount)))    
    )
)

(define-private (set-vesting-schedule-iter (item { address: principal, vesting-id: uint, vesting-timestamp: uint, amount: uint }))
    (set-token-schedule (get address item) (get vesting-id item) (get vesting-timestamp item) (get amount item))
)

(define-public (set-vesting-schedule-many (items (list 200 { address: principal, vesting-id: uint, vesting-timestamp: uint, amount: uint })))
    (ok (map set-token-schedule-iter items))
)

(define-read-only (get-vesting-schedule-or-fail (address principal) (vesting-id uint))
    (ok (unwrap! (map-get? vesting-schedule { address: address, vesting-id: vesting-id }) ERR-SCHEDULE-NOT-FOUND))
)

(define-public (get-tokens (extension <extension-trait>) (vesting-id uint))
    (begin
        (asserts! (is-eq (contract-of extension) (as-contract tx-sender)) ERR-EXTENSION-NOT-AUTHORIZED)
        ;; TODO: need to convert vesting-id into (buff 34)
        (contract-call? .executor-dao request-extension-callback extension vesting-id-in-buff)
    )
)

(define-public (get-tokens-many (extension <extension-trait>) (vesting-ids (list 100 uint)))
    (ok 
        (map 
            get-tokens 
            (list 
                extension	extension	extension	extension	extension	extension	extension	extension	extension	extension
                extension	extension	extension	extension	extension	extension	extension	extension	extension	extension
                extension	extension	extension	extension	extension	extension	extension	extension	extension	extension
                extension	extension	extension	extension	extension	extension	extension	extension	extension	extension
                extension	extension	extension	extension	extension	extension	extension	extension	extension	extension
                extension	extension	extension	extension	extension	extension	extension	extension	extension	extension
                extension	extension	extension	extension	extension	extension	extension	extension	extension	extension
                extension	extension	extension	extension	extension	extension	extension	extension	extension	extension
                extension	extension	extension	extension	extension	extension	extension	extension	extension	extension
                extension	extension	extension	extension	extension	extension	extension	extension	extension	extension
            )        
            vesting-ids
        )
    )
)

(define-public (callback (sender principal) (memo (buff 34)))
    (let 
        (
            ;; TODO: (buff 34) to uint    
            (schedule (try! (get-vesting-schedule-or-fail sender vesting-id)))
        )
        (asserts! (> (unwrap-panic (get-block-info? time (- block-height u1))) (get vesting-timestamp schedule)) ERR-BLOCK-HEIGHT-NOT-REACHED)
        (map-set vesting-schedule { address: sender, vesting-id: vesting-id } { vesting-timestamp: (get vesting-timestamp schedule), amount: u0 })
        (var-set tokens-to-vest (- (var-get tokens-to-vest) (get amount schedule)))
        (contract-call? .age000-governance-token transfer-fixed (get amount schedule) tx-sender sender none)
    )	
)


;; @desc buff-to-uint
;; @params bytes
;; @returns uint
(define-private (buff-to-uint (bytes (buff 16)))
    (let
        (
            (reverse-bytes (reverse-buff bytes))
        )
        (+
            (match (element-at reverse-bytes u0) byte (byte-to-uint byte) u0)
            (match (element-at reverse-bytes u1) byte (* (byte-to-uint byte) u256) u0)
            (match (element-at reverse-bytes u2) byte (* (byte-to-uint byte) u65536) u0)
            (match (element-at reverse-bytes u3) byte (* (byte-to-uint byte) u16777216) u0)
            (match (element-at reverse-bytes u4) byte (* (byte-to-uint byte) u4294967296) u0)
            (match (element-at reverse-bytes u5) byte (* (byte-to-uint byte) u1099511627776) u0)
            (match (element-at reverse-bytes u6) byte (* (byte-to-uint byte) u281474976710656) u0)
            (match (element-at reverse-bytes u7) byte (* (byte-to-uint byte) u72057594037927936) u0)
            (match (element-at reverse-bytes u8) byte (* (byte-to-uint byte) u18446744073709551616) u0)
            (match (element-at reverse-bytes u9) byte (* (byte-to-uint byte) u4722366482869645213696) u0)
            (match (element-at reverse-bytes u10) byte (* (byte-to-uint byte) u1208925819614629174706176) u0)
            (match (element-at reverse-bytes u11) byte (* (byte-to-uint byte) u309485009821345068724781056) u0)
            (match (element-at reverse-bytes u12) byte (* (byte-to-uint byte) u79228162514264337593543950336) u0)
            (match (element-at reverse-bytes u13) byte (* (byte-to-uint byte) u20282409603651670423947251286016) u0)
            (match (element-at reverse-bytes u14) byte (* (byte-to-uint byte) u5192296858534827628530496329220096) u0)
            (match (element-at reverse-bytes u15) byte (* (byte-to-uint byte) u1329227995784915872903807060280344576) u0)
        )
    )
)

;; lookup table for converting 1-byte buffers to uints via index-of
(define-constant BUFF-TO-BYTE (list 
    0x00 0x01 0x02 0x03 0x04 0x05 0x06 0x07 0x08 0x09 0x0a 0x0b 0x0c 0x0d 0x0e 0x0f
    0x10 0x11 0x12 0x13 0x14 0x15 0x16 0x17 0x18 0x19 0x1a 0x1b 0x1c 0x1d 0x1e 0x1f
    0x20 0x21 0x22 0x23 0x24 0x25 0x26 0x27 0x28 0x29 0x2a 0x2b 0x2c 0x2d 0x2e 0x2f
    0x30 0x31 0x32 0x33 0x34 0x35 0x36 0x37 0x38 0x39 0x3a 0x3b 0x3c 0x3d 0x3e 0x3f
    0x40 0x41 0x42 0x43 0x44 0x45 0x46 0x47 0x48 0x49 0x4a 0x4b 0x4c 0x4d 0x4e 0x4f
    0x50 0x51 0x52 0x53 0x54 0x55 0x56 0x57 0x58 0x59 0x5a 0x5b 0x5c 0x5d 0x5e 0x5f
    0x60 0x61 0x62 0x63 0x64 0x65 0x66 0x67 0x68 0x69 0x6a 0x6b 0x6c 0x6d 0x6e 0x6f
    0x70 0x71 0x72 0x73 0x74 0x75 0x76 0x77 0x78 0x79 0x7a 0x7b 0x7c 0x7d 0x7e 0x7f
    0x80 0x81 0x82 0x83 0x84 0x85 0x86 0x87 0x88 0x89 0x8a 0x8b 0x8c 0x8d 0x8e 0x8f
    0x90 0x91 0x92 0x93 0x94 0x95 0x96 0x97 0x98 0x99 0x9a 0x9b 0x9c 0x9d 0x9e 0x9f
    0xa0 0xa1 0xa2 0xa3 0xa4 0xa5 0xa6 0xa7 0xa8 0xa9 0xaa 0xab 0xac 0xad 0xae 0xaf
    0xb0 0xb1 0xb2 0xb3 0xb4 0xb5 0xb6 0xb7 0xb8 0xb9 0xba 0xbb 0xbc 0xbd 0xbe 0xbf
    0xc0 0xc1 0xc2 0xc3 0xc4 0xc5 0xc6 0xc7 0xc8 0xc9 0xca 0xcb 0xcc 0xcd 0xce 0xcf
    0xd0 0xd1 0xd2 0xd3 0xd4 0xd5 0xd6 0xd7 0xd8 0xd9 0xda 0xdb 0xdc 0xdd 0xde 0xdf
    0xe0 0xe1 0xe2 0xe3 0xe4 0xe5 0xe6 0xe7 0xe8 0xe9 0xea 0xeb 0xec 0xed 0xee 0xef
    0xf0 0xf1 0xf2 0xf3 0xf4 0xf5 0xf6 0xf7 0xf8 0xf9 0xfa 0xfb 0xfc 0xfd 0xfe 0xff
))

;; @desc byte-to-uint
;; @params byte
;; @returns uint
(define-read-only (byte-to-uint (byte (buff 1)))
    (unwrap-panic (index-of BUFF-TO-BYTE byte))
)

;; @desc concat-buff
;; @params a
;; @params b
;; @returns buff
(define-private (concat-buff (a (buff 16)) (b (buff 16)))
    (unwrap-panic (as-max-len? (concat a b) u16))
)

;; @desc reverse-buff
;; @params a
;; @returns buff
(define-read-only (reverse-buff (a (buff 16)))
    (fold concat-buff a 0x)
)

