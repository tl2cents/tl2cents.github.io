---
tags: Writeup Cryptography Paillier LLL CMAC RSA
title: DownUnderCTF 2025 Crypto Writeup
published: true
---

{: .info}
**tl;dr:** Writeup of the crypto challenges from DownUnderCTF 2025. Exploits and source code are available in the repository [tl2cents/CTF-Writeups](https://github.com/tl2cents/CTF-Writeups).
<!--more-->


---


## yet-another-login

{: .success}
Yet another login task... Authenticate as admin to get the flag!

<details class="warning">
<summary><b>chall.py</b></summary>
<div markdown="1">

``` python
#!/usr/bin/env python3

from Crypto.Util.number import getPrime, bytes_to_long, long_to_bytes
from hashlib import sha256
from secrets import randbits
import os

FLAG = os.getenv('FLAG', 'DUCTF{FLAG_TODO}')

class TokenService: 
    def __init__(self):
        self.p = getPrime(512)
        self.q = getPrime(512)
        self.n = self.p * self.q
        self.n2 = self.n * self.n
        self.l = (self.p - 1) * (self.q - 1)
        self.g = self.n + 1
        self.mu = pow(self.l, -1, self.n)
        self.secret = os.urandom(16)

    def _encrypt(self, m):
        r = randbits(1024)
        c = pow(self.g, m, self.n2) * pow(r, self.n, self.n2) % self.n2
        return c

    def _decrypt(self, c):
        return ((pow(c, self.l, self.n2) - 1) // self.n) * self.mu % self.n

    def generate(self, msg):
        h = bytes_to_long(sha256(self.secret + msg).digest())
        return long_to_bytes(self._encrypt(h))

    def verify(self, msg, mac):
        h = sha256(self.secret + msg).digest()
        w = long_to_bytes(self._decrypt(bytes_to_long(mac)))
        return h == w[-32:]


def menu():
    print('1. Register')
    print('2. Login')
    return int(input('> '))


def main():
    ts = TokenService()
    print(ts.n)

    while True:
        choice = menu()
        if choice == 1:
            username = input('Username: ').encode()
            if b'admin' in username:
                print('Cannot register admin user')
                exit(1)
            msg = b'user=' + username
            mac = ts.generate(msg)
            print('Token:', (msg + b'|' + mac).hex())
        elif choice == 2:
            token = bytes.fromhex(input('Token: '))
            msg, _, mac = token.partition(b'|')
            if ts.verify(msg, mac):
                user = msg.rpartition(b'user=')[2]
                print(f'Welcome {user}!')
                if user == b'admin':
                    print(FLAG)
            else:
                print('Failed to verify token')
        else:
            exit(1)

if __name__ == '__main__':
    main()
```

</div>
</details>


### Solution

The server provides two oracles

- **Register**: encrypting oracle: returns the ciphertext of sha256 hash of `secret + msg` .
- **Verify**: decrypting oracle to check whether the plaintext ends with the 32 bytes sha256 hash: `sha256(secret + msg)`.

To authenticate as an admin, one must successfully interact with the verifying oracle with the username exactly equal to `admin`. Notably, the server parses the username using the expression `msg.rpartition(b'user=')[2]`. This allows for a potential parsing ambiguity: if the message is crafted as `user=uname user=admin`, the server may interpret the last occurrence and treat the user as `admin`. This behavior is reminiscent of the SHA-256 length extension attack. Specifically, if the SHA-256 hash of `secret + "user=uname" ` is known, the Merkle–Damgård construction enables the computation of a valid hash for a message of the form `secret + "user=uname****user=admin"` without knowledge of the original secret.

For a detailed discussion of this attack, refer to the repository [hash-length-extension](https://github.com/thecrabsterchief/hash-length-extension). In our setting, we can query a Paillier ciphertext corresponding to the hash value $h = \text{sha256}(\text{secret} + \texttt{b"user=tl2cents"})$ from the registration oracle. If we are able to decrypt $h$ using the verifying oracle, we can then forge a valid tag for the extended message ending with `"user=admin"`, thereby achieving admin authentication

<section class="info" markdown="1">

**Additive Homomorphism of Paillier**

Let $n$ be the modulus of Paillier encryption scheme. Paillier encryption is additively homomorphic, which means that the following two properties hold:

- For two ciphertexts $c_0 = E(m_0), c_1 = E(m_1)$ the value $c_0 \cdot c_1 \mod n^2$ encrypts $m_0 + m_1 \mod n$.
- For a ciphertext $c = E(m)$, the value $c^k \mod n^2$ encrypts the message $k m \mod n$

</section>

&nbsp;

<section class="warning" markdown="1">

**Paillier Decryption Oracle**

The modulus is 1024 bits while the sha256 hash is only 256 bits. Given a valid token pair $(m, t)$ where the mac $t = E(\textsf{sha256}(m))$, we can recover $h = \textsf{sha256}(m)$ as follows:

1. Denote $m = (h \ll (1024 - 256)) + h$ which is in form of  `h || 0 || h`.  Compute $t^{\prime} = E\left(m - 2^{1023} \right)$ by additive homomorphism.
2. Since the 1024-th bit (msb) of $n$ is 1, we have: 
   - If $t^{\prime}$ passes verification, this indicates that $m - 2^{1023} > 0, $ and thus the msb of $h$ is 1.
   - If $t^{\prime}$ fails verification, this indicates that $m - 2^{1023} < 0, $ and thus the msb of $h$ is 0.
3. Update $h_i = h - h_{known}$. And then recover $h_i$'s msb by submitting ciphertext of `h_i || 0 || h` similarly. This requires 256 oracles to fully recover $h = \textsf{sha256}(m)$.

</section>

### Exploit

See [exp.py](https://github.com/tl2cents/CTF-Writeups/blob/master/2025/DownUnder/yet-another-login/exp.py).

## speak friend, and enter

{: .success}
I will happily give you the flag... if you can sign my challenge!

<details class="warning">
<summary><b>chall.py</b></summary>
<div markdown="1">

``` python
#!/usr/bin/env python3

from Crypto.Hash import CMAC, SHA512
from Crypto.Cipher import AES
from Crypto.PublicKey import RSA
from Crypto.Util.number import long_to_bytes, bytes_to_long
from binascii import unhexlify
import random, json, string

from cryptosecrets import NIST_SP_800_38B_Appendix_D1_K, flag

## Generated once and MAC saved
# r = RSA.generate(2048)
# cc = CMAC.new(NIST_SP_800_38B_Appendix_D1_K, ciphermod=AES)
# server_cmac_publickey = cc.update(long_to_bytes(r.n)).digest()

server_cmac_publickey = unhexlify('9d4dfd27cb483aa0cf623e43ff3d3432')

challenge_string = "".join([random.choice(string.ascii_letters + string.digits) for _ in range(48)]).encode()

print(f"Here is your challenge string: {challenge_string.decode()}")
print('Enter your signature for verification as a json string {"public_key": (int), "signature" : (int)}:') 
js = input()

try:
    j = json.loads(js)
    public_key = j['public_key']
    signature = j['signature']
except Exception as e:
    print(f"Error in input: {e}")
    exit(0)


## Check public key hash matches server
cc = CMAC.new(NIST_SP_800_38B_Appendix_D1_K, ciphermod=AES)
mac = cc.update(long_to_bytes(public_key)).digest()

if mac != server_cmac_publickey:
    print("Public key MAC did not match")
    exit(0)

if public_key.bit_length() != 2048:
    print("Public key size incorrect")
    exit(0)

r = RSA.construct((public_key, 65537))
s = bytes_to_long(SHA512.new(challenge_string).digest())

if pow(signature, 65537, r.n) == s:
    print(f'Signature verified! Here is your flag: {flag}')
    exit(0)
else:
    print("Signature incorrect")
    exit(0)
```

</div>
</details>

### Solution

We need to pass a CMAC check to submit a 1024-bit RSA public key $n$ and also a signature check that verifies `pow(s, 65537, n) == challenge_string`. The CMAC key is given as `NIST_SP_800_38B_Appendix_D1_K` and we can find the key value [here](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38b.pdf) and the CMAC illustration:

<img src="/assets/ctf-stuff/2025-downunder/image-20250720165934785.png" referrerpolicy="no-referrer" alt="and-gate" style="display: block; margin-left: auto; margin-right: auto;">

CMAC operates similarly to CBC-MAC, with the distinction that it derives two additional subkeys, $K_1$ and $K_2$, to handle the final block, and it outputs only the last ciphertext block as the MAC tag. Given knowledge of the secret key, forging a valid message-tag pair becomes straightforward. Specifically, one can set the IV to a zero block, choose the desired MAC value as the final ciphertext block, and then reverse the CBC process to construct a message that authenticates to the target MAC. Possessing the key also enables controlled generation of many valid CMAC-tagged messages. By manipulating the intermediate CBC blocks, one can generate a large number of valid 1024-bit candidate values that satisfy the CMAC verification process. Among these, it is feasible to brute-force until a prime 1024-bit number is found, which can then be submitted as a valid RSA public key. Since this 'public key' corresponds to a prime modulus rather than a standard RSA composite modulus, signing the challenge string becomes trivial.

### Exploit

See [solve.py](https://github.com/tl2cents/CTF-Writeups/blob/master/2025/DownUnder/Speak-Friend-and-Enter/solve.py).

## sh-rsa

{: .success}
You should only need a short amount of time to break this short hash RSA signature scheme!

<details class="warning">
<summary><b>chall.py</b></summary>
<div markdown="1">

``` python
#!/usr/bin/env python3

from Crypto.Util.number import long_to_bytes, bytes_to_long
from gmpy2 import mpz, next_prime
from hashlib import shake_128
import secrets, signal, os

def H(N, m):
    return shake_128(long_to_bytes(N) + m).digest(8)

def sign(N, d, m):
    return pow(mpz(bytes_to_long(H(N, m))), d, N)

def verify(N, e, m, s):
    return long_to_bytes(pow(s, e, N))[:8] == H(N, m)
    # return long_to_bytes(pow(s, e, N))[-8:] == H(N, m)
    

def main():
    p = int(next_prime(secrets.randbits(2048)))
    q = int(next_prime(secrets.randbits(2048)))
    N = p * q
    e = 0x10001
    d = pow(e, -1, (p - 1) * (q - 1))

    print(f'{N = }')
    print(f'{e = }')

    for i in range(256):
        m = long_to_bytes(i)
        s = sign(N, d, m)
        print(m.hex(), hex(s))

    signal.alarm(46)

    s = int(input('s: '), 16)
    if verify(N, e, b'challenge', s):
        print(os.getenv('FLAG', 'DUCTF{test_flag}'))
    else:
        print('Nope')

if __name__ == '__main__':
    main()
```

</div>
</details>

### Solution

``` python
def H(N, m):
    return shake_128(long_to_bytes(N) + m).digest(8)

def sign(N, d, m):
    return pow(mpz(bytes_to_long(H(N, m))), d, N)

def verify(N, e, m, s):
    return long_to_bytes(pow(s, e, N))[:8] == H(N, m)
```

The server only reveals 92 signatures of $m = 0, 1, \ldots,91$ and we need to submit a signature that signs `c = challenge`. Denote the corresponding 64-bit hash value as $h_{0}, h_{1}, \ldots, h_{91}$ and the our target hash as $h_t = H(N, c)$. Let $\textsf{MSB}_{64}(\cdot)$ be the first 64 bits of the input number, byte-aligned. 

By the multiplicative homomorphism of RSA, we need to find $k_{0}, k_{1}, \ldots, k_{91}$ such that:

$$
\textsf{MSB}_{64}(\prod_{i=0}^{91} h_{i}^{k_i} \mod n) = h_t.
$$

Since reducing modulo $n$ is annoying, we can cancel the modulo if the following two conditions hold:

$$
\begin{cases}
k_0, \ldots, k_{91} \ge 0 \\
\prod_{i=0}^{91} h_{i}^{k_i} < n
\end{cases} 
\implies
\begin{cases}
k_0, \ldots, k_{91} \ge 0 \\
\sum_i {k_i} \le B 
\end{cases}
$$

where $B$ is a small bound slightly greater than $64$. We can also bound the product to remove $\textsf{MSB}_{64}(\cdot)$. To make sure that the target value is smaller than $n$, we shift $h_t$ by $s = 4096 - 64 - 8$. Then find small coefficients $k_i$ such that:

$$
(h_t \ll s) \le \prod_{i=0}^{91} h_{i}^{k_i} < ((h_t + 1) \ll s)
$$

Take the logarithm with base 2:

$$
\log_2 (h_t \ll s) \le \sum_{i=0}^{91} {k_i} \log_2 (h_{i})  < \log_2 ((h_t + 1) \ll s)
$$

Again, handling real number or float is not easy. Considering that we only need to maintain a certain level of precision, real numbers can be converted into integers for processing, as demonstrated below:

``` bash
sage: RR128 = RealField(128)
sage: r = randint(1, 2**64)
sage: logr_int = int(RR(log(r,2)) * 2**128)
```

Denote $lb = \log_2 (h_t \ll s) , ub = \log_2 ((h_t + 1) \ll s)$ and $r_i =  \log_2 (h_{i})$. After converting everything into integer, this challenge is to solve the following inequality:

$$
lb \le \sum_{i=0}^{91} {k_i} r_i  < ub
$$

with $k_i$ bounded as small positive values. The remaining part is to construct a lattice to find a valid solution.


{: .info}
**Remarks.** Optimizing the lattice construction or employing CVP techniques can further increase the probability of finding positive integer solutions. For this challenge, such optimizations are unnecessary.

### Exploit

See [exp_clean.py](https://github.com/tl2cents/CTF-Writeups/blob/master/2025/DownUnder/sh-rsa/exp_clean.py).


## good game spawn point

{: .success}
it's 4pm on a school afternoon. you just got home, tossed your bag on the floor, and turned on ABC3. it's time.. for GGSP

<details class="warning">
<summary><b>chall.py</b></summary>
<div markdown="1">

``` python
#!/usr/bin/env python3
import os
import secrets
import hashlib
from Crypto.Util.number import getPrime
from Crypto.PublicKey import ECC

FLAG = os.getenv("FLAG", "DUCTF{testflag}")

# https://neuromancer.sk/std/nist/P-256
order = 0xFFFFFFFF00000000FFFFFFFFFFFFFFFFBCE6FAADA7179E84F3B9CAC2FC632551 * 0x1


def ec_key():
    eck = ECC.generate(curve="p256")
    secret = int(eck.d)
    public_key = {
        "x": int(eck.public_key().pointQ.x),
        "y": int(eck.public_key().pointQ.y),
    }
    return secret, public_key


def paillier_key():
    p = getPrime(1024)
    q = getPrime(1024)
    n = p * q
    return p, q, n


def mta_response(ciphertext, n, secret):
    beta = secrets.randbelow(n)
    nsq = n * n

    # E(plaintext * secret)
    mta_response = pow(ciphertext, secret, nsq)

    # E(beta)
    r = secrets.randbelow(n)
    beta_enc = (pow(r, n, nsq) * pow(n + 1, beta, nsq)) % nsq

    # E(plaintext * secret + beta)
    mta_response = (mta_response * beta_enc) % nsq

    return mta_response, beta


def zk_schnorr(beta):
    r = secrets.randbelow(order)
    r_pub = ECC.construct(curve="p256", d=r % order).public_key().pointQ
    beta_pub = ECC.construct(curve="p256", d=beta % order).public_key().pointQ

    challenge_input = f"{beta}{order}{beta_pub}{r_pub}".encode()
    c_hash = int.from_bytes(hashlib.sha256(challenge_input).digest(), "big")
    z = (r + beta * c_hash) % order

    return {
        "hash": c_hash,
        "r_pub": {
            "x": int(r_pub.x),
            "y": int(r_pub.y),
        },
        "beta_pub": {
            "x": int(beta_pub.x),
            "y": int(beta_pub.y),
        },
    }


def main():
    print(
        """
        it's 4pm on a school afternoon. you just got home, tossed your bag
        on the floor, and turned on ABC3. it's time.. for GGSP
        """
    )

    secret, public_key = ec_key()
    print("public key:", public_key)

    p, q, n = paillier_key()
    print("paillier key:", {"p": p, "q": q})

    for _ in range(5):
        c = int(input("ciphertext:"))
        response, beta = mta_response(c, n, secret)
        print("mta response:", response)

        proof = zk_schnorr(beta)
        print("zk schnorr:", proof)

    guess = int(input("guess secret:"))
    if guess == secret:
        print("nice :o", FLAG)
    else:
        print("bad luck")


if __name__ == "__main__":
    main()
```

</div>
</details>

### Solution

The server has a secret key $s$ of P-256 and its public key $S = [s]G$ is given. The private key $p, q$ of Paillier scheme is also given. If we submit a Paillier ciphertext encrypting $a$, the server will further reveal the following information:

$$
\begin{cases}
C = E_{paillier}(a \cdot s + \beta \mod n) \\
B = \beta G \\
\cdots
\end{cases}
$$

Then we can retrieve $c = a \cdot s + \beta \mod n$. Rewrite this without modulo $n$ as:

$$
c = a \cdot s + \beta - kn
$$

Let $N = [n]G$.  Then we can reconstruct a discrete logarithm problem:

$$
[c]G =  [a]S + B - [k] N \implies [k]N = [a]S + B - [c]G
$$

By carefully designing $a$, we can ensure that the bit-length of $k$ is approximately $\ell$ bits. Once $k$ is recovered by solving discrete logarithm, we can thereby retrieve $\ell$ bits of $s$. In total, five interactions are provided; however, given that the public key $S = [s]G$ is known, we effectively obtain six discrete logarithm instances, each leaking only $\ell = 43$ bits of information.


<section class="error" markdown="1">
**How to choose $a$?**

Since $s$ is only $256$ bits, we align it to $1024 + \ell$ bits, i.e., $a_0 = 2^{1024 - 256 + \ell}$ solves for $k_0$ bounded in range $[0, 2^{\ell + 1}]$.

$$
c_0 = a_0 \cdot s + \beta_0 - k_0 n \implies \beta_0 = c_0 + k_0 n - a_0 \cdot s \in [0, n).
$$

This reveals $\ell$ bits of $s$.  For the general case, let $a_{i+1} = 2^{\ell} a_{i}$. In the i-th round,  we have $\beta_i \in [0, n)$ and thus:

$$
c_i = a_i \cdot s + \beta_i - k_i n \implies a_i s \in (c_i + k_i n - n, c_i + k_i n].
$$

In the $(i+1)$-th round:

$$
c_{i+1} = a_{i+1} \cdot s + \beta_{i+1} - k_{i+1} n
$$

which implies:

$$
a_{i+1} \cdot s - c_{i+1} < k_{i+1} n  \le  a_{i+1} \cdot s  + n - c_{i+1}.
$$

By substituting $a_{i+1} = 2^{\ell} a_i$ and $a_i s \in (c_i + k_i n - n, c_i + k_i n]$, we know that $k_{i + 1}$ is bounded by:

$$
\begin{cases}
k_{i+1} \le \frac{2^{\ell}a_i \cdot s + n - c_{i+1}}{n} \le \frac{2^{\ell}(c_i + k_i n) + n - c_{i+1}}{n}  \\
k_{i+1} > \frac{2^{\ell}a_i \cdot s - c_{i+1}}{n} > \frac{2^{\ell}(c_i + k_i n - n) - c_{i+1}}{n}
\end{cases}
$$

where the length of the new interval $\Delta = ub_{i} - lb_{i} =  2^{\ell} + 1$. Solve a discrete logarithm instance to recover $k_{i+1}$. Finally, after solving the five discrete logarithms, we can use the public key $S = [s]G$ to recover the remaining bits.
</section>

### Exploit

See [solve.py](https://github.com/tl2cents/CTF-Writeups/blob/master/2025/DownUnder/good-game-spawn-point/solve.py).
