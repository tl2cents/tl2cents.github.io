---
tags: CTF Writeup Cryptography ETH
title: SECCON CTF 2024 Quals Writeup
published: true
---

{: .info}
**tl;dr:** Last week, I participated in SECCON CTF 2024 with team Never Stop Exploiting. Here are the writeups for challenges `dual_summon`, `Tidal wave` and `Trillion Ether` solved by me.

<!--more-->

---

## dual_summon

{: .success}
You are a beginner summoner. It's finally time to learn dual summon. `nc dual-summon.seccon.games 2222`. [Attachment](/assets/ctf-stuff/2024-seccon/dual_summon.tar.gz)


### Solution

The challenge gives us a `summon` oracle to query any tag of our chosen plaintext. To win the challenge, we need to find a tag collision between two different keys detailed in the following code snippet.

```python
def summon(number, plaintext):
    assert len(plaintext) == 16
    aes = AES.new(key=keys[number-1], mode=AES.MODE_GCM, nonce=nonce)
    ct, tag = aes.encrypt_and_digest(plaintext)
    return ct, tag

# When you can exec dual_summon, you will win
def dual_summon(plaintext):
    assert len(plaintext) == 16
    aes1 = AES.new(key=keys[0], mode=AES.MODE_GCM, nonce=nonce)
    aes2 = AES.new(key=keys[1], mode=AES.MODE_GCM, nonce=nonce)
    ct1, tag1 = aes1.encrypt_and_digest(plaintext)
    ct2, tag2 = aes2.encrypt_and_digest(plaintext)
    # When using dual_summon you have to match tags
    assert tag1 == tag2
```

The tag of `AES-GCM` is computed from the padded ciphertext and associated data. Denote the merged message `pad(AD) || pad(CT) || len(AD) || len(CT)` as $$p = (p_1, \cdots, p_n) \in \mathbb{F}_{2^{128}}^{n}$$. The GHASH function in `AES-GCM` is a simple polynomial evaluation:

$$
tag = \sum_{i=1}^{n} p_i \cdot H^{i} + C
$$

More details of `AES-GCM` can be found in [AEAD-Nonce-Reuse-Attacks](https://github.com/tl2cents/AEAD-Nonce-Reuse-Attacks). The `summon` oracle allows us to query a tag with a fixed H and C since the key and nonce are fixed. Therefore, by choosing a known plaintext differential, we can recover the MAC key H from an equation like $t_1 - t_2 = H^2 \cdot (p_1 - p_2)$. After recovering two MAC keys, use the two known tags of the same plaintext i.e. GHASH(k1, pt) and GHASH(k2, pt) to find a delta such that GHASH(k1, pt + delta) = GHASH(k2, pt + delta). Refer to the following exploit for details.

### Exploit

<details class="exploit">
<summary><b>Exploit</b></summary>
<div markdown="1">

```python
from pwn import remote, process, info
from sage.all import GF

x = GF(2)["x"].gen()
gf2e = GF(2 ** 128, name="y", modulus=x ** 128 + x ** 7 + x ** 2 + x + 1)

# Converts an integer to a gf2e element, little endian.
def _to_gf2e(n):
    return gf2e([(n >> i) & 1 for i in range(127, -1, -1)])

# Converts a gf2e element to an integer, little endian.
def _from_gf2e(p):
    n = p.integer_representation()
    ans = 0
    for i in range(128):
        ans <<= 1
        ans |= ((n >> i) & 1)
    return int(ans)

# nc dual-summon.seccon.games 2222
local = False
if local:
    io = process(['python3', 'server.py'])
else:
    io = remote('dual-summon.seccon.games', 2222)

pt1 = b"\x00"*16
pt2 = b"\x00"*15 + b"\x01"
p1 = _to_gf2e(int.from_bytes(pt1, 'big'))
p2 = _to_gf2e(int.from_bytes(pt2, 'big'))
# gcm length block
l = _to_gf2e(((8 * 0) << 64) | (8 * 16))

def summon_oracle(io: remote, number:int, name:bytes):
    io.sendlineafter(b"[1] summon, [2] dual summon >", b'1')
    io.sendlineafter('>', str(number).encode())
    io.sendlineafter('>', name.hex().encode())
    io.recvuntil(b'tag(hex) = ')
    tag = io.recvline().strip().decode()
    return bytes.fromhex(tag)

def leak_H_key(io: remote, number: int = 1):
    # leak H_key
    tag1 = summon_oracle(io, number, pt1)
    tag2 = summon_oracle(io, number, pt2)
    t1 = _to_gf2e(int.from_bytes(tag1, 'big'))
    t2 = _to_gf2e(int.from_bytes(tag2, 'big'))
    h_square = (t1 - t2) / (p1 - p2)
    h = h_square.sqrt()
    return h, t1, t2

# h1^2 p + h1 * l + c1 = h2^2 p + h2 * l + c2
h1, t11, t12 = leak_H_key(io, 1)
h2, t21, t22 = leak_H_key(io, 2)
# delta = t11 - t21
# = h1 * l + c1  - h2 * l - c2  + h1^2 p - h2^2 p
delta = t21 - t11
# (h1^2 - h2^2) delta_p = -delta
delta_p = -delta / (h1 ** 2 - h2 ** 2)
target_pt = _from_gf2e(delta_p).to_bytes(16, 'big')

io.sendlineafter(b"[1] summon, [2] dual summon >", b'2')
io.sendlineafter('>', target_pt.hex().encode())
io.interactive()
```

</div>
</details>

## Tidal wave

{: .success}
A torrent of data. [Attachment](/assets/ctf-stuff/2024-seccon/Tidal_wave.tar.gz)

### Overview

The challenge generates a [Reed-Solomon code](https://en.wikipedia.org/wiki/Reed%E2%80%93Solomon_error_correction) over integer ring $\mathbb{Z}_{N}$ where the factorization of $N = pq$ is unknown. Denote the Reed-Solomon code as $\textsf{GRS}(n = 36, k = 8)$ in this challenge. The generator matrix $G$ is a Vandermonde matrix with the form:

$$
G = \begin{bmatrix}
1 & 1 & 1 & \cdots & 1 \\
\alpha_1 & \alpha_2 & \alpha_3 & \cdots & \alpha_{36} \\
\vdots & \vdots & \vdots & \ddots & \vdots \\
\alpha_1^7 & \alpha_2^7 & \alpha_3^7 & \cdots & \alpha_{36}^7 \\
\end{bmatrix}
$$

In this challenge, several equations of secret vector $\vec \alpha = (\alpha_1, \cdots, \alpha_{n})$ are given, and we are asked to recover two encoded messages: $P_e = \vec p \cdot G + e \mod N$ and $K_e = \vec k \cdot G + e \mod N$ to recover the flag. The overall solution is outlined as follows:

1. Solve high degree multivariate equations to recover the alphas (and thus the G matrix).
2. Solve a LWE problem  to recover the p vector and then factor n.
3. Solve a GRS error-correcting problem to recover the key vector.

### Step 1. Recover Alphas

The following equations are given:

$$
\text{Square Equation: }
\begin{cases}
\alpha_1 ^2 = a_1 \mod N \\
\alpha_2 ^2 = a_2 \mod N \\
\cdots \\
\alpha_n ^2 = a_n \mod N \\
\end{cases}
\\
\text{RSA Equation: } 
(\sum_1^n \alpha_i)^{65537} =  b \mod N \\
\text{Det Equation: }
\begin{cases}
\det G[0:8, 0:8] = d_0 \mod N \\
\det G[0:8, 7:15] = d_1 \mod N \\
\cdots \\
\det G[0:8, 28:36] = d_4 \mod N \\
\end{cases}
$$


Five multivariate equations of $\vec \alpha = (\alpha_1, \cdots, \alpha_{n})$ are embedded in the determinant computation of Vandermonde matrices. We cannot simplify the RSA equation directly. Even if we use the square equations to reduce the maximum degree of each variable to 1, the time and memory complexity of multivariate polynomial power is at least $O(2^{36})$. 


{: .error}
The key point of solving this problem is to find linear (or simple) relations from square equations and det equations. Then we can apply the linear relations of $(\alpha_1, \cdots, \alpha_{n})$ to reduce the number of variables in the RSA equation which makes the computation of polynomial power efficient.

- We first apply grobner basis on square equations and det equations to find 35 linear relations of $\vec \alpha = (\alpha_1, \cdots, \alpha_{n})$ (surprising fact!):
  
  $$
    \begin{cases}
    \alpha_1 = c_1 \alpha_{36} \mod N \\
    \alpha_2 = c_2 \alpha_{36} \mod N \\
    \cdots \\
    \alpha_{35} = c_n \alpha_{36} \mod N \\
    \end{cases}
  $$

- Substitute the simple equations in the high-degree rsa equations to make it univariate and then combine it with $\alpha_{36}^2 = a_{36}$ to recover $\alpha_{36}$. Finally, we can recover the whole vector $\vec \alpha = (\alpha_1, \cdots, \alpha_{n})$.

<details class="exploit">
<summary><b>RecoverAlphas.py</b></summary>
<div markdown="1">

```python

from sage.all import Zmod, matrix, PolynomialRing, Sequence, Ideal, save, load, prod
from output import dets, double_alphas, alpha_sum_rsa, p_encoded, key_encoded, N, encrypted_flag

k, n = 8, 36
Zn = Zmod(N)
Zx = PolynomialRing(Zn, [f"alpha_{i}" for i in range(1, n + 1)])
alphas = Zx.gens()
mod_polys = [alphas[i]**2 - double_alphas[i] for i in range(n)]
G = matrix(Zx, k, n, lambda i, j: (alphas[j]**(i%2) * pow(double_alphas[j], (i//2), N)) % N)

det_polys = []
for i in range(5):
    start_col = i * k - i
    submatrix = G.submatrix(0, start_col, 8, 8)
    det_polys.append(submatrix.det() - dets[i])

# try to use groebner basis to solve the equations
seq = Sequence(det_polys + mod_polys)
# seq += [sum(alphas)**65537 -  alpha_sum_rsa]
I = Ideal(seq)
groebner_basis = I.groebner_basis()
poly_rsa = sum(alphas)
eqs = []
for i, poly in enumerate(groebner_basis):
    print(f"{i = }, {poly = }")
    poly_rsa %= poly
    if i != 0:
        eqs.append(poly)
# solve the equations
print(f"{poly_rsa = }")
res = poly_rsa
for i in range(16):
    poly_rsa = poly_rsa ** 2
    poly_rsa %= mod_polys[-1]
    
poly_rsa = res * poly_rsa - alpha_sum_rsa
poly_rsa %= mod_polys[-1]

eqs.append(poly_rsa)
print(f"{poly_rsa = }")

seq = Sequence(eqs)
mat, monos = seq.coefficients_monomials()

b = -mat[:, -1]
mat = mat[:, :-1]
sol = mat.solve_right(b).list()
print(f"{sol = }")
for i, si in enumerate(sol):
    assert si**2 % N == double_alphas[i]
    
print(f"OK")
```

</div>
</details>

### Step 2. Recover Vector P

The p vector is encoded in a way similar to LWE:

$$
P_e = \vec p \cdot G + e \mod N
$$

where $$G \in \mathbb{Z}_{N}^{k \times n}$$ and $$P_{e} \in \mathbb{Z}_{N}^{n}$$ is known. The extra information is that $$e \in  \mathbb{Z}_{N}^{n}$$ is bounded by $$2^{1000} \ll 2^{1024} \approx N$$ and $$\vec{p} \in \mathbb{Z}_{N}^{k}$$ is bounded by $$2^{64}$$. We can construct a lattice to solve the Shortest Vector Problem to recover the p vector. Because the first row of $$G$$ is $$(1, \cdots, 1)$$, the shortest vector we find is not what we expect in the first target dimension (i.e., $$p_0 \cdot (1, 1, \cdots, 1)$$ is not counted in the shortest vector). Nevertheless, the other bits are enough to factor $$N = pq$$ by coppersmith or pruning.

<details class="exploit">
<summary><b>RecoverP.py</b></summary>
<div markdown="1">

```python
from sage.all import Zmod, matrix, block_matrix, identity_matrix, PolynomialRing, Sequence, ZZ, save, load, prod, vector
from output import dets, double_alphas, alpha_sum_rsa, p_encoded, key_encoded, N, encrypted_flag, alphas
# save alphas in output.py

k, n = 8, 36
Zn = Zmod(N)
G = matrix(ZZ, k, n, lambda i, j: pow(alphas[j], i, N))

# p_encoded = pvec*G + make_random_vector(R, n)
G = G.stack(vector(p_encoded))
In = identity_matrix(ZZ, n) * N
Ik = identity_matrix(ZZ, k + 1) * 2**(1000 - 64)
Ik[-1,-1] = 2**1000
M = block_matrix([
   [G, Ik],
   [In, 0]
])

L = M.LLL()
for row in L:
    row_bits = [int(x).bit_length() for x in row]
    if all(900 <= x <= 1000 for x in row_bits[:-(k+1)]):
        print(row[-(k+1):-1])
        p_vec = [abs(ZZ(num/2**(1000 - 64))) for num in row[-(k+1):-1]]
        print(f"{p_vec = }")
        ph = sum(p_vec[i] * pow(2, 64*i) for i in range(k))
        pr = PolynomialRing(Zmod(N), 'x')
        x = pr.gen()
        fx = ph + x 
        pl = fx.small_roots(X=2**64, beta=0.495)
        p = ZZ(pl[0]) + ph
        assert N % p == 0
        q = N // p
        print(f"{p = }")
        print(f"{q = }")
        break
```

</div>
</details>

### Step 3. Recover Key Vector

The key vector is encoded by a Reed-Solomon code whose generator matrix is $G \in \mathbb{Z}_{N}^{k \times n}$:

$$
K_e = \vec k \cdot G + e \mod N
$$

where $$G \in \mathbb{Z}_{N}^{k \times n}$$ and $$K_e \in  \mathbb{Z}_{N}^{n}$$ is known. In this case, the Hamming weight of the error vector is small (28 errors in total). This is a typical error-correcting problem in code-based cryptography. To decode the corrupted codeword, we reduce this problem from $$\mathbb{Z}_{N}$$ to $$\mathbb{F}_{p}$$ and $$\mathbb{F}_q$$ since there are only 14 errors in the two sub-fields. The GRS code can decode up to $$d = (n - k + 1)/2 =14.5$$ errors and this is expected in this challenge. Details of decoding Generalized Reed-Solomon codes can be found in [SageMath Docs](https://doc.sagemath.org/html/en/reference/coding/sage/coding/grs_code.html).

<details class="exploit">
<summary><b>RecoverKey.py</b></summary>
<div markdown="1">

```python
from sage.all import Zmod, matrix, block_matrix, identity_matrix, PolynomialRing, Sequence, ZZ, save, load, prod, vector, codes, GF, crt
from output import dets, double_alphas, alpha_sum_rsa, p_encoded, key_encoded, N, encrypted_flag, alphas

k, n = 8, 36
Zn = Zmod(N)
G = matrix(ZZ, k, n, lambda i, j: pow(alphas[j], i, N))

p = 12565690801374373168209122780100947393207836436607880099543667078825364019537227017599533210660179091620475025517583119411701260337964778535342984769252959
q = 13063745862781294589547896930952928867567164583215526040684813499782622799740291421111907000771263532192148557705806567586876208831387558514840698244078507

Fq = GF(q)
Fp = GF(p)
betas = [1 for i in range(n)]
alphas_p = [Fp(alpha) for alpha in alphas]
alphas_q = [Fq(alpha) for alpha in alphas]
Cp = codes.GeneralizedReedSolomonCode(alphas_p, k, betas)
print(Cp.decoders_available())
dp = Cp.minimum_distance() // 2
# r = c + e
rp = vector(Fp, key_encoded)
print(f"{dp = }")
# d = (n- k + 1) //2
mp = Cp.decode_to_message(rp, decoder_name='Gao')
print(mp)

Cq = codes.GeneralizedReedSolomonCode(alphas_q, k, betas)
print(Cq.decoders_available())
dq = Cq.minimum_distance() // 2
# r = c + e
rq = vector(Fq, key_encoded)
print(f"{dq = }")
# d = (n- k + 1) //2
mq = Cq.decode_to_message(rq, decoder_name='Gao')
print(mq)

key_list = [crt([ZZ(mp[i]), ZZ(mq[i])], [p, q]) for i in range(k)]
keyvec = vector(ZZ, key_list)

import hashlib
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad
key = hashlib.sha256(str(keyvec).encode()).digest()
cipher = AES.new(key, AES.MODE_ECB)
flag = cipher.decrypt(encrypted_flag)
print(f"{flag=}")
```

</div>
</details>


## Trillion Ether

{: .success}
Get Chance! `nc trillion-ether.seccon.games 31337`. [Attachment](/assets/ctf-stuff/2024-seccon/Trillion_Ether.tar.gz)

### Solution

In the contract,  `_createWallet` is buggy.  `_createWallet` does not initialize the wallet object and the function actually modifies the values in slots 0, 1, 2 as Name, Balance, Address. However, the slot 0 stores the current length of dynamic array `wallets`. Then `wallets.push(_newWallet(name, msg.value, msg.sender))` increases the length by 1 and copies the values in slots 0, 1, 2 to the slots of the `name`-th item in the wallets, i.e., the starting slot ID is `keccak(0) + 3*(name)` referring [dynamic-arrays layout](https://docs.soliditylang.org/en/v0.8.28/internals/layout_in_storage.html#mappings-and-). By slot overflow (up to $2^{256}$), we can find a wallet ID with its balance and address both being our address! Denote our address as `ADDR`: 
- Call `createWallet` with name being `ADDR-1` 
- Call `createWallet` with name being `ADDR-2` 
- Call `createWallet` with name being  $2^{256}-2$. (increase the length of wallets)
- Now we can see the walletID of `ADDR - 1  + 2*(2**256 // 3)`  has a balance number of our address and the owner is also our address.
- Call `withdraw(ADDR - 1  + 2*(2**256 // 3) , 1_000_000_000_000 ether)` to solve this challenge

The slot storage layout of the dynamic array is as follows

```python
# slot info: 
# user address: adr
# WalletID            SlodID                    Content
# adr - 2     keccak(0) + 3*(adr - 2) + 0       Name   : adr - 1 
# adr - 2     keccak(0) + 3*(adr - 2) + 1       Balance: 0
# adr - 2     keccak(0) + 3*(adr - 2) + 2       Owner  : adr
# adr - 1     keccak(0) + 3*(adr - 1) + 0       Name   : adr
# adr - 1     keccak(0) + 3*(adr - 1) + 1       Balance: 0
# adr - 1     keccak(0) + 3*(adr - 1) + 2       Owner  : adr

# 3 * walletid  % 2^256 = 3*(adr - 2) + 2
# since 2**256 % 3 = 1, 
# let WalletID = adr - 1  + 2*(2**256 // 3) 
#              = adr - 1 +  2*(2**256 -1) / 3
# then the slodID = keccak(0) + 3 * (adr - 1  + 2*(2**256 -1) / 3)
#                 = keccak(0) + 3 * adr - 3 + 2**256 - 2 % 2**256
#                 = keccak(0) + 3 * adr - 5
#                 = keccak(0) + 3 * (adr - 2) + 1
# For WalletID = adr - 1  + 2*(2**256 // 3): 
# Name:     keccak(0) + 3*(adr - 2) + 1       0
# Balance:  keccak(0) + 3*(adr - 2) + 2       adr
# Owner  :  keccak(0) + 3*(adr - 1) + 0       adr
# We now have a wallet with balance amount being our address!
```
