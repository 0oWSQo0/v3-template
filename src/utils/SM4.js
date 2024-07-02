const SM4Base64 = {
  DEFAULT: 0,
  NO_PADDING: 1,
  NO_WRAP: 2,
  CRLF: 4,
  URL_SAFE: 8,
  NO_CLOSE: 16,
  encodeToString: function (input, flags) {
    let bytes = this.encode(input, flags)
    return String.fromBytes(bytes, 'US-ASCII')
  },

  encodeToString2: function (input, offset, len, flags) {
    return String.fromBytes(this.encode2(input, offset, len, flags), 'US-ASCII')
  },

  encode: function (input, flags) {
    return this.encode2(input, 0, input.length, flags)
  },

  encode2: function (input, offset, len, flags) {
    let encoder = new Encoder(flags, null)
    let output_len = Math.floor(len / 3) * 4
    if (encoder.do_padding) {
      if (len % 3 > 0) {
        output_len += 4
      }
    } else {
      switch (len % 3) {
        case 0:
          break
        case 1:
          output_len += 2
          break
        case 2:
          output_len += 3
          break
      }
    }
    if (encoder.do_newline && len > 0) {
      output_len += (Math.floor((len - 1) / (3 * LINE_GROUPS)) + 1) * (encoder.do_cr ? 2 : 1)
    }
    encoder.output = new Array(output_len)
    encoder.process(input, offset, len, true)
    console.assert(encoder.op == output_len)
    return encoder.output
  },

  decode: function (str, flags) {
    let bytes = this.decode2(str.getBytes(), flags)
    return bytes
  },

  decode2: function (input, flags) {
    return this.decode3(input, 0, input.length, flags)
  },

  decode3: function (input, offset, len, flags) {
    let decoder = new Decoder(flags, new Array(Math.floor((len * 3) / 4)))
    if (!decoder.process(input, offset, len, true)) {
      throw 'bad base-64'
    }
    if (decoder.op == decoder.output.length) {
      return decoder.output
    }
    let temp = new Array(decoder.op)
    Array.Copy(decoder.output, 0, temp, 0, decoder.op)
    return temp
  }
}

const LINE_GROUPS = 19
const ENCODE = [
  65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115,
  116, 117, 118, 119, 120, 121, 122, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 43, 47
]
const ENCODE_WEBSAFE = [
  65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115,
  116, 117, 118, 119, 120, 121, 122, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 45, 95
]
const Decoder = function (flags, output) {
  const DECODE = [
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63, 52,
    53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -2, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28,
    29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1
  ]
  const DECODE_WEBSAFE = [
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, 52,
    53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -2, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, 63, -1, 26, 27, 28,
    29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1
  ]
  const SKIP = -1
  const EQUALS = -2
  this.output = output
  this.alphabet = (flags & SM4Base64.URL_SAFE) == 0 ? DECODE : DECODE_WEBSAFE
  this.state = 0
  this.value = 0
  this.maxOutputSize = function (len) {
    return Math.floor((len * 3) / 4) + 10
  }
  this.process = function (input, offset, len, finish) {
    if (this.state == 6) return false
    let p = offset
    len += offset

    let state = this.state
    let value = this.value
    let op = 0
    let output = this.output
    let alphabet = this.alphabet
    while (p < len) {
      if (state == 0) {
        while (p + 4 <= len && (value = (alphabet[input[p] & 0xff] << 18) | (alphabet[input[p + 1] & 0xff] << 12) | (alphabet[input[p + 2] & 0xff] << 6) | alphabet[input[p + 3] & 0xff]) >= 0) {
          output[op + 2] = Byte.cast(value)
          output[op + 1] = Byte.cast(value >> 8)
          output[op] = Byte.cast(value >> 16)
          op += 3
          p += 4
        }
        if (p >= len) break
      }
      let d = alphabet[input[p++] & 0xff]

      switch (state) {
        case 0:
          if (d >= 0) {
            value = d
            ++state
          } else if (d != SKIP) {
            this.state = 6
            return false
          }
          break

        case 1:
          if (d >= 0) {
            value = (value << 6) | d
            ++state
          } else if (d != SKIP) {
            this.state = 6
            return false
          }
          break

        case 2:
          if (d >= 0) {
            value = (value << 6) | d
            ++state
          } else if (d == EQUALS) {
            // Emit the last (partial) output tuple;
            // expect exactly one more padding character.
            output[op++] = Byte.cast(value >> 4)
            state = 4
          } else if (d != SKIP) {
            this.state = 6
            return false
          }
          break

        case 3:
          if (d >= 0) {
            // Emit the output triple and return to state 0.
            value = (value << 6) | d
            output[op + 2] = Byte.cast(value)
            output[op + 1] = Byte.cast(value >> 8)
            output[op] = Byte.cast(value >> 16)
            op += 3
            state = 0
          } else if (d == EQUALS) {
            // Emit the last (partial) output tuple;
            // expect no further data or padding characters.
            output[op + 1] = Byte.cast(value >> 2)
            output[op] = Byte.cast(value >> 10)
            op += 2
            state = 5
          } else if (d != SKIP) {
            this.state = 6
            return false
          }
          break

        case 4:
          if (d == EQUALS) {
            ++state
          } else if (d != SKIP) {
            this.state = 6
            return false
          }
          break

        case 5:
          if (d != SKIP) {
            this.state = 6
            return false
          }
          break
      }
    }
    if (!finish) {
      this.state = state
      this.value = value
      this.op = op
      return true
    }
    switch (state) {
      case 0:
        // Output length is a multiple of three.  Fine.
        break
      case 1:
        // Read one extra input byte, which isn't enough to
        // make another output byte.  Illegal.
        this.state = 6
        return false
      case 2:
        // Read two extra input bytes, enough to emit 1 more
        // output byte.  Fine.
        output[op++] = Byte.cast(value >> 4)
        break
      case 3:
        // Read three extra input bytes, enough to emit 2 more
        // output bytes.  Fine.
        output[op++] = Byte.cast(value >> 10)
        output[op++] = Byte.cast(value >> 2)
        break
      case 4:
        // Read one padding '=' when we expected 2.  Illegal.
        this.state = 6
        return false
      case 5:
        // Read all the padding '='s we expected and no more.
        // Fine.
        break
    }
    this.state = state
    this.op = op
    return true
  }
}

const Encoder = function (flags, output) {
  this.output = output
  this.do_padding = (flags & SM4Base64.NO_PADDING) == 0
  this.do_newline = (flags & SM4Base64.NO_WRAP) == 0
  this.do_cr = (flags & SM4Base64.CRLF) != 0
  this.alphabet = (flags & SM4Base64.URL_SAFE) == 0 ? ENCODE : ENCODE_WEBSAFE
  this.tail = new Array(2)
  this.tailLen = 0
  this.count = this.do_newline ? LINE_GROUPS : -1
  this.maxOutputSize = function (len) {
    return Math.floor((len * 8) / 5) + 10
  }
  this.process = function (input, offset, len, finish) {
    const alphabet = this.alphabet
    const output = this.output
    let op = 0
    let count = this.count
    let p = offset
    len += offset
    let v = -1
    switch (this.tailLen) {
      case 0:
        break
      case 1:
        if (p + 2 <= len) {
          v = ((this.tail[0] & 0xff) << 16) | ((input[p++] & 0xff) << 8) | (input[p++] & 0xff)
          this.tailLen = 0
        }
        break
      case 2:
        if (p + 1 <= len) {
          v = ((this.tail[0] & 0xff) << 16) | ((this.tail[1] & 0xff) << 8) | (input[p++] & 0xff)
          this.tailLen = 0
        }
        break
    }

    if (v != -1) {
      output[op++] = alphabet[(v >> 18) & 0x3f]
      output[op++] = alphabet[(v >> 12) & 0x3f]
      output[op++] = alphabet[(v >> 6) & 0x3f]
      output[op++] = alphabet[v & 0x3f]
      if (--count == 0) {
        if (this.do_cr) output[op++] = '\r'
        output[op++] = '\n'
        count = LINE_GROUPS
      }
    }

    while (p + 3 <= len) {
      v = ((input[p] & 0xff) << 16) | ((input[p + 1] & 0xff) << 8) | (input[p + 2] & 0xff)
      output[op] = alphabet[(v >> 18) & 0x3f]
      output[op + 1] = alphabet[(v >> 12) & 0x3f]
      output[op + 2] = alphabet[(v >> 6) & 0x3f]
      output[op + 3] = alphabet[v & 0x3f]
      p += 3
      op += 4
      if (--count == 0) {
        if (this.do_cr) output[op++] = '\r'
        output[op++] = '\n'
        count = LINE_GROUPS
      }
    }

    if (finish) {
      if (p - this.tailLen == len - 1) {
        let t = 0
        v = ((this.tailLen > 0 ? this.tail[t++] : input[p++]) & 0xff) << 4
        this.tailLen -= t
        output[op++] = alphabet[(v >> 6) & 0x3f]
        output[op++] = alphabet[v & 0x3f]
        if (this.do_padding) {
          output[op++] = '='.charCodeAt(0)
          output[op++] = '='.charCodeAt(0)
        }
        if (this.do_newline) {
          if (this.do_cr) output[op++] = '\r'
          output[op++] = '\n'
        }
      } else if (p - this.tailLen == len - 2) {
        let t = 0
        v = (((this.tailLen > 1 ? this.tail[t++] : input[p++]) & 0xff) << 10) | (((this.tailLen > 0 ? this.tail[t++] : input[p++]) & 0xff) << 2)
        this.tailLen -= t
        output[op++] = alphabet[(v >> 12) & 0x3f]
        output[op++] = alphabet[(v >> 6) & 0x3f]
        output[op++] = alphabet[v & 0x3f]
        if (this.do_padding) {
          output[op++] = '='.charCodeAt(0)
        }
        if (this.do_newline) {
          if (this.do_cr) output[op++] = '\r'
          output[op++] = '\n'
        }
      } else if (this.do_newline && op > 0 && count != LINE_GROUPS) {
        if (this.do_cr) output[op++] = '\r'
        output[op++] = '\n'
      }

      console.assert(this.tailLen == 0)
      console.assert(p == len)
    } else {
      if (p == len - 1) {
        this.tail[this.tailLen++] = input[p]
      } else if (p == len - 2) {
        this.tail[this.tailLen++] = input[p]
        this.tail[this.tailLen++] = input[p + 1]
      }
    }
    this.op = op
    this.count = count
    return true
  }
}

Array.Copy = function (sourceArray, sourceIndex, destinationArray, destinationIndex, length) {
  let cloneArray = sourceArray.slice(sourceIndex, sourceIndex + length)
  for (let i = 0; i < cloneArray.length; i += 1) {
    destinationArray[destinationIndex] = cloneArray[i]
    destinationIndex += 1
  }
}

const SM4_ENCRYPT = 1
const SM4_DECRYPT = 0
const SboxTable = [
  -42, -112, -23, -2, -52, -31, 61, -73, 22, -74, 20, -62, 40, -5, 44, 5, 43, 103, -102, 118, 42, -66, 4, -61, -86, 68, 19, 38, 73, -122, 6, -103, -100, 66, 80, -12, -111, -17, -104, 122, 51, 84, 11,
  67, -19, -49, -84, 98, -28, -77, 28, -87, -55, 8, -24, -107, -128, -33, -108, -6, 117, -113, 63, -90, 71, 7, -89, -4, -13, 115, 23, -70, -125, 89, 60, 25, -26, -123, 79, -88, 104, 107, -127, -78,
  113, 100, -38, -117, -8, -21, 15, 75, 112, 86, -99, 53, 30, 36, 14, 94, 99, 88, -47, -94, 37, 34, 124, 59, 1, 33, 120, -121, -44, 0, 70, 87, -97, -45, 39, 82, 76, 54, 2, -25, -96, -60, -56, -98,
  -22, -65, -118, -46, 64, -57, 56, -75, -93, -9, -14, -50, -7, 97, 21, -95, -32, -82, 93, -92, -101, 52, 26, 85, -83, -109, 50, 48, -11, -116, -79, -29, 29, -10, -30, 46, -126, 102, -54, 96, -64, 41,
  35, -85, 13, 83, 78, 111, -43, -37, 55, 69, -34, -3, -114, 47, 3, -1, 106, 114, 109, 108, 91, 81, -115, 27, -81, -110, -69, -35, -68, 127, 17, -39, 92, 65, 31, 16, 90, -40, 10, -63, 49, -120, -91,
  -51, 123, -67, 45, 116, -48, 18, -72, -27, -76, -80, -119, 105, -105, 74, 12, -106, 119, 126, 101, -71, -15, 9, -59, 110, -58, -124, 24, -16, 125, -20, 58, -36, 77, 32, 121, -18, 95, 62, -41, -53,
  57, 72
]
const FK = [0xa3b1bac6, 0x56aa3350, 0x677d9197, 0xb27022dc]
const CK = [
  0x00070e15, 0x1c232a31, 0x383f464d, 0x545b6269, 0x70777e85, 0x8c939aa1, 0xa8afb6bd, 0xc4cbd2d9, 0xe0e7eef5, 0xfc030a11, 0x181f262d, 0x343b4249, 0x50575e65, 0x6c737a81, 0x888f969d, 0xa4abb2b9,
  0xc0c7ced5, 0xdce3eaf1, 0xf8ff060d, 0x141b2229, 0x30373e45, 0x4c535a61, 0x686f767d, 0x848b9299, 0xa0a7aeb5, 0xbcc3cad1, 0xd8dfe6ed, 0xf4fb0209, 0x10171e25, 0x2c333a41, 0x484f565d, 0x646b7279
]
function SM4Context() {
  this.mode = SM4_ENCRYPT
  this.isPadding = true
  this.sk = new Array(32)
}

let Byte = {
  MIN_VALUE: -128,
  MAX_VALUE: 127,
  cast: function (number) {
    let result = number
    let min = this.MIN_VALUE
    let max = this.MAX_VALUE
    let offset = this.MIN_VALUE * 2
    if (typeof result === 'bigint') {
      min = BigInt(min)
      max = BigInt(max)
      offset = BigInt(offset)
    }
    while (result < min) {
      result -= offset
    }
    while (result > max) {
      result += offset
    }
    return parseInt(result)
  }
}

let Integer = {
  MIN_VALUE: -0x80000000,
  MAX_VALUE: 0x7fffffff,
  cast: function (number) {
    let result = number
    let min = this.MIN_VALUE
    let max = this.MAX_VALUE
    let offset = this.MIN_VALUE * 2
    if (typeof result === 'bigint') {
      min = BigInt(min)
      max = BigInt(max)
      offset = BigInt(offset)
    }
    while (result < min) {
      result -= offset
    }
    while (result > max) {
      result += offset
    }
    return parseInt(result)
  }
}

function SM4() {
  let GET_ULONG_BE = function (b, i) {
    return (BigInt(b[i] & 0xff) << BigInt(24)) | BigInt((b[i + 1] & 0xff) << 16) | BigInt((b[i + 2] & 0xff) << 8) | (BigInt(b[i + 3] & 0xff) & BigInt(-1))
  }

  let PUT_ULONG_BE = function (n, b, i) {
    b[i] = Byte.cast(Integer.cast(BigInt(0xff) & (n >> BigInt(24))))
    b[i + 1] = Byte.cast(Integer.cast(BigInt(0xff) & (n >> BigInt(16))))
    b[i + 2] = Byte.cast(Integer.cast(BigInt(0xff) & (n >> BigInt(8))))
    b[i + 3] = Byte.cast(Integer.cast(BigInt(0xff) & n))
  }

  let SHL = function (x, n) {
    return (BigInt(x) & BigInt(-1)) << BigInt(n)
  }

  let ROTL = function (x, n) {
    return SHL(x, n) | (BigInt(x) >> BigInt(32 - n))
  }

  let SWAP = function (sk, i) {
    let t = sk[i]
    sk[i] = sk[31 - i]
    sk[31 - i] = t
  }

  let sm4Sbox = function (inch) {
    let i = inch & 0xff
    return SboxTable[i]
  }

  let sm4Lt = function (ka) {
    let a = new Array(4)
    let b = new Array(4)
    PUT_ULONG_BE(ka, a, 0)
    b[0] = sm4Sbox(a[0])
    b[1] = sm4Sbox(a[1])
    b[2] = sm4Sbox(a[2])
    b[3] = sm4Sbox(a[3])
    let bb = GET_ULONG_BE(b, 0)
    return bb ^ ROTL(bb, 2) ^ ROTL(bb, 10) ^ ROTL(bb, 18) ^ ROTL(bb, 24)
  }

  let sm4F = function (x0, x1, x2, x3, rk) {
    return x0 ^ sm4Lt(x1 ^ x2 ^ x3 ^ rk)
  }

  let sm4CalciRK = function (ka) {
    let a = new Array(4)
    let b = new Array(4)
    PUT_ULONG_BE(ka, a, 0)
    b[0] = sm4Sbox(a[0])
    b[1] = sm4Sbox(a[1])
    b[2] = sm4Sbox(a[2])
    b[3] = sm4Sbox(a[3])
    let bb = GET_ULONG_BE(b, 0)
    return bb ^ ROTL(bb, 13) ^ ROTL(bb, 23)
  }

  let sm4_setkey = function (SK, key) {
    let MK = new Array(4)
    let k = new Array(36)
    MK[0] = GET_ULONG_BE(key, 0)
    MK[1] = GET_ULONG_BE(key, 4)
    MK[2] = GET_ULONG_BE(key, 8)
    MK[3] = GET_ULONG_BE(key, 12)
    k[0] = MK[0] ^ BigInt(FK[0])
    k[1] = MK[1] ^ BigInt(FK[1])
    k[2] = MK[2] ^ BigInt(FK[2])
    k[3] = MK[3] ^ BigInt(FK[3])
    let temp
    for (let i = 0; i < 32; i++) {
      temp = k[i + 1] ^ k[i + 2] ^ k[i + 3] ^ BigInt(CK[i])
      temp = sm4CalciRK(temp)
      k[i + 4] = k[i] ^ temp
      SK[i] = k[i + 4]
    }
  }

  let sm4_one_round = function (sk, input, output) {
    let i = 0
    let ulbuf = new Array(36)
    ulbuf[0] = GET_ULONG_BE(input, 0)
    ulbuf[1] = GET_ULONG_BE(input, 4)
    ulbuf[2] = GET_ULONG_BE(input, 8)
    ulbuf[3] = GET_ULONG_BE(input, 12)
    while (i < 32) {
      ulbuf[i + 4] = sm4F(ulbuf[i], ulbuf[i + 1], ulbuf[i + 2], ulbuf[i + 3], sk[i])
      i++
    }
    PUT_ULONG_BE(ulbuf[35], output, 0)
    PUT_ULONG_BE(ulbuf[34], output, 4)
    PUT_ULONG_BE(ulbuf[33], output, 8)
    PUT_ULONG_BE(ulbuf[32], output, 12)
  }

  let padding = function (input, mode) {
    if (input == null) {
      return null
    }
    let ret
    if (mode == SM4_ENCRYPT) {
      let p = 16 - (input.length % 16)
      ret = new Array(input.length + p)
      Array.Copy(input, 0, ret, 0, input.length)
      for (let i = 0; i < p; i++) {
        ret[input.length + i] = Byte.cast(p)
      }
    } else {
      let p = input[input.length - 1]
      ret = new Array(input.length - p)
      Array.Copy(input, 0, ret, 0, input.length - p)
    }
    return ret
  }

  let padding1 = function (input, mode) {
    if (input == null) {
      return null
    }
    let ret
    if (mode == SM4_ENCRYPT) {
      let p = 16 - (input.length % 16)
      ret = new Array(input.length + p)
      Array.Copy(input, 0, ret, 0, input.length)
      let i = 0
      for (i = 0; i < p; i++) {
        ret[input.length + i] = 0
      }

      //ret[input.length + i-1] = Byte.cast(0x80);
    } else {
      let p = input[input.length - 1]
      ret = new Array(input.length - p)
      Array.Copy(input, 0, ret, 0, input.length - p)
    }
    return ret
  }

  this.sm4_setkey_enc = function (ctx, key) {
    if (ctx == null) {
      throw 'ctx is null!'
    }

    if (key == null || key.length != 16) {
      throw 'key error!'
    }
    ctx.mode = SM4_ENCRYPT
    sm4_setkey(ctx.sk, key)
  }

  this.sm4_setkey_dec = function (ctx, key) {
    if (ctx == null) {
      throw 'ctx is null!'
    }

    if (key == null || key.length != 16) {
      throw 'key error!'
    }
    ctx.mode = SM4_DECRYPT
    sm4_setkey(ctx.sk, key)
    for (let i = 0; i < 16; i++) {
      SWAP(ctx.sk, i)
    }
  }

  this.sm4_crypt_ecb = function (ctx, input) {
    if (input == null) {
      throw 'input is null!'
    }

    if (ctx.isPadding && ctx.mode == SM4_ENCRYPT) {
      input = padding1(input, SM4_ENCRYPT)
    }

    let output = [],
      ins,
      out,
      i = 0
    for (let length = input.length; length > 0; length -= 16) {
      ins = new Array(16)
      out = new Array(16)
      Array.Copy(input, i, ins, 0, 16)
      i += 16
      sm4_one_round(ctx.sk, ins, out)
      output = output.concat(out)
    }
    if (ctx.isPadding && ctx.mode == SM4_DECRYPT) {
      output = padding1(output, SM4_DECRYPT)
    }
    return output
  }

  this.sm4_crypt_cbc = function (ctx, iv, input) {
    if (iv == null || iv.length != 16) {
      throw 'iv error!'
    }
    if (input == null) {
      throw 'input is null!'
    }
    if (ctx.isPadding && ctx.mode == SM4_ENCRYPT) {
      input = padding(input, SM4_ENCRYPT)
    }

    let i = 0,
      length = input.length
    let output = [],
      ins,
      out,
      out1,
      j = 0
    if (ctx.mode == SM4_ENCRYPT) {
      for (; length > 0; length -= 16) {
        ins = new Array(16)
        out = new Array(16)
        out1 = new Array(16)
        Array.Copy(input, j, ins, 0, 16)
        j += 16
        for (let i = 0; i < 16; i++) {
          out[i] = Byte.cast(ins[i] ^ iv[i])
        }
        sm4_one_round(ctx.sk, out, out1)
        Array.Copy(out1, 0, iv, 0, 16)
        output = output.concat(out1)
      }
    } else {
      let temp = new Array(16)
      for (; length > 0; length -= 16) {
        ins = Array(16)
        out = Array(16)
        out1 = Array(16)
        Array.Copy(input, j, ins, 0, 16)
        j += 16
        Array.Copy(ins, 0, temp, 0, 16)
        sm4_one_round(ctx.sk, ins, out)
        for (let i = 0; i < 16; i++) {
          out1[i] = Byte.cast(out[i] ^ iv[i])
        }
        Array.Copy(temp, 0, iv, 0, 16)
        output = output.concat(out1)
      }
    }
    if (ctx.isPadding && ctx.mode == SM4_DECRYPT) {
      output = padding(output, SM4_DECRYPT)
    }
    return output
  }
}

export const SM4EcbCrypter = {
  encrypt: function (msg, key) {
    let sm4 = new SM4()
    let mSM4Context = new SM4Context()
    mSM4Context.isPadding = true
    mSM4Context.mode = SM4_ENCRYPT
    sm4.sm4_setkey_enc(mSM4Context, key.getBytes())
    let plant = SM4Base64.decode(msg, SM4Base64.NO_WRAP)
    let result = sm4.sm4_crypt_ecb(mSM4Context, plant)
    if (result == null) {
      throw 'SM4加密失败！'
    }
    return SM4Base64.encodeToString(result, SM4Base64.NO_WRAP)
    //return String.fromBytes(result);
  },

  decrypt: function (msg, key) {
    let sm4 = new SM4()
    let mSM4Context = new SM4Context()
    SM4Context.isPadding = true
    mSM4Context.mode = SM4_DECRYPT
    sm4.sm4_setkey_dec(mSM4Context, key.getBytes(key))
    let enc = SM4Base64.decode(msg, SM4Base64.NO_WRAP)
    let dec = sm4.sm4_crypt_ecb(mSM4Context, enc)

    return SM4Base64.encodeToString(dec, SM4Base64.NO_WRAP)
    //return String.fromBytes(dec);
  }
}

const SM4Crypter = {
  encrypt: function (msg, key, cbc_iv) {
    let sm4 = new SM4()
    let mSM4Context = new SM4Context()
    mSM4Context.isPadding = true
    mSM4Context.mode = SM4_ENCRYPT
    sm4.sm4_setkey_enc(mSM4Context, key.getBytes())
    let result = sm4.sm4_crypt_cbc(mSM4Context, cbc_iv.getBytes(), msg.getBytes())
    if (result == null) {
      throw 'SM4加密失败！'
    }
    return SM4Base64.encodeToString(result, SM4Base64.NO_WRAP)
  },

  decrypt: function (msg, key, cbc_iv) {
    let sm4 = new SM4()
    let mSM4Context = new SM4Context()
    SM4Context.isPadding = true
    mSM4Context.mode = SM4_DECRYPT
    sm4.sm4_setkey_dec(mSM4Context, key.getBytes(key))
    let enc = SM4Base64.decode(msg, SM4Base64.NO_WRAP)
    let dec = sm4.sm4_crypt_cbc(mSM4Context, cbc_iv.getBytes(), enc)
    return String.fromBytes(dec)
  }
}

String.prototype.getBytes = function () {
  // Unicode编码(16进制)　║　UTF-8 字节流(二进制)
  // 000000 - 00007F　║　0xxxxxxx
  // 000080 - 0007FF　║　110xxxxx 10xxxxxx
  // 000800 - 00FFFF　║　1110xxxx 10xxxxxx 10xxxxxx
  // 010000 - 10FFFF　║　11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
  function signed(number) {
    return parseInt(number, 2) - 256
  }
  let array = [],
    charCode,
    codeStr,
    len,
    arr
  for (let i = 0; i < this.length; i++) {
    charCode = this.charCodeAt(i)
    if (charCode <= 0x00007f) {
      // 000000 - 00007F　║　0xxxxxxx
      array.push(charCode)
    } else if (charCode <= 0x0007ff) {
      // 000080 - 0007FF　║　110xxxxx 10xxxxxx
      codeStr = charCode.toString(2)
      codeStr = codeStr.prefix('0', 11 - codeStr.length)
      array.push(signed('110' + codeStr.substr(0, 5)))
      array.push(signed('10' + codeStr.substr(5, 6)))
    } else if (charCode <= 0x00ffff) {
      codeStr = charCode.toString(2)
      codeStr = codeStr.prefix('0', 16 - codeStr.length)
      array.push(signed('1110' + codeStr.substr(0, 4)))
      array.push(signed('10' + codeStr.substr(4, 6)))
      array.push(signed('10' + codeStr.substr(10, 6)))
    } else if (charCode <= 0x10ffff) {
      codeStr = charCode.toString(2)
      codeStr = codeStr.prefix('0', 21 - codeStr.length)
      array.push(signed('11110' + codeStr.substr(0, 3)))
      array.push(signed('10' + codeStr.substr(3, 6)))
      array.push(signed('10' + codeStr.substr(9, 6)))
      array.push(signed('10' + codeStr.substr(15, 6)))
    } else {
      throw '非法字符'
    }
  }
  return array
}

String.prototype.prefix = function (char, len) {
  return char.repeat(len) + this
}

String.fromBytes = function (bytes) {
  function unsign(number) {
    return Number(number + 256).toString(2)
  }
  if (bytes == null || bytes.length < 1) {
    return ''
  }
  let result = '',
    charCode,
    codeStr
  let part1, part2, part3, part4
  for (let i = 0; i < bytes.length; i++) {
    charCode = bytes[i]
    if (charCode > 0) {
      result += String.fromCharCode(Number(charCode))
    } else {
      codeStr = unsign(charCode)
      if (codeStr.startsWith('110')) {
        part1 = codeStr.substr(3, 5)
        part2 = unsign(bytes[++i]).substr(2, 6)
        result += String.fromCharCode(parseInt(part1 + part2, 2))
      } else if (codeStr.startsWith('1110')) {
        part1 = codeStr.substr(4, 4)
        part2 = unsign(bytes[++i]).substr(2, 6)
        part3 = unsign(bytes[++i]).substr(2, 6)
        result += String.fromCharCode(parseInt(part1 + part2 + part3, 2))
      } else if (codeStr.startsWith('11110')) {
        part1 = codeStr.substr(5, 3)
        part2 = unsign(bytes[++i]).substr(2, 6)
        part3 = unsign(bytes[++i]).substr(2, 6)
        part4 = unsign(bytes[++i]).substr(2, 6)
        result += String.fromCharCode(parseInt(part1 + part2 + part3 + part4, 2))
      } else {
        throw '非法字符'
      }
    }
  }
  return result
}
