---
tags: CTF Writeup Cryptography
title: hxp CTF 2024 Writeup
published: true
---

{: .info}
**tl;dr:** Writeups for circus, cccircus, cccccircus and spiky elf. Related tags: `Galois Field`, `MITM`.

<!--more-->

---

## circus, cccircus, cccccircus

{: .success}
**circus**: My friend said CRC is insecure, so I made it better™. Surely it’s safe now!? [Attachment](/assets/ctf-stuff/2024-hxp/circus-626cf2b1fe5d61b5.tar.xz)

{: .success}
**cccircus**: Come on, how much more betterer™ do I have to make CRC for it to become secure?!?? 🎪🐘🦁🔥🤹 [Attachment](/assets/ctf-stuff/2024-hxp/cccircus-b17dbb48e606a93b.tar.xz)

{: .success}
**cccccircus**: Let’s try that again! 🥜🍿🥳 [Attachment](/assets/ctf-stuff/2024-hxp/cccccircus-4cd2b310162153ea.tar.xz)

<details class="warning">
<summary><b>cccccircus_server.py</b></summary>
<div markdown="1">

``` python
#!/usr/bin/env python3

f = 0x1f3267f571be716d65f11ecb21b86d2e9

def to_bits(bs):
    return int.from_bytes(bs)

def from_bits(v):
    return int.to_bytes(v, 8)

def red(x):
    while (l := x.bit_length()) > 128:
        x ^= f << l - 129
    return x

def mul(x, y):
    z = 0
    for i in range(x.bit_length()):
        if (x >> i) & 1:
            z ^= y << i
    return red(z)

def exp(x, n):
    assert n >= 0
    if not n:
        return 1
    if n % 2:
        return mul(x, exp(x, n-1))
    return exp(mul(x, x), n//2)

class Mac:
    def __init__(self, key):
        self.key = key

    def __call__(self, msg):
        tag = exp(to_bits(self.key + bytes([len(msg)]) + msg), 1000000)
        return from_bits(tag >> 64)

if __name__ == '__main__':
    import os, signal
    signal.alarm(60)

    mac = Mac(os.urandom(32))
    for _ in range(99):
        try:
            inp = input().strip().split(' ')
        except EOFError:
            exit()
        cmd, data = inp[0], bytes.fromhex(inp[1])
        if cmd == 'solve':
            break
        if cmd == 'query':
            print(mac(data).hex())
        else:
            print('bad command')
    else:
        print('no more')
        exit()

    key = bytes.fromhex(inp[1])
    mac_ = Mac(key)
    for l in range(256):
        msg = os.urandom(l)
        if Mac(key)(msg) != mac(msg):
            print('wrong key')
            break
    else:
        print(open('flag.txt').read().strip())
```

</div>
</details>

### Solution

The `MAC` is based on the Galois field $\mathbb{F}_{2^{128}}$ with modulus polynomial `0x1f3267f571be716d65f11ecb21b86d2e9` denoted as $f(x)$. We are given the following oracle:

$$
\textsf{MAC}(k(x), m(x), \ell) =  (k(x) \cdot x^{8(\ell + 1)} + m(x))^{e} \mod f(x)
$$

where $m(x)$ is the padded message `len(msg) || msg` and $\ell$ is the byte length of `msg`. It looks like RSA encryption in the Galois field. In circus and cccircus, we simply RSA-decrypt the mac value $t$, i.e., compute $d = e^{-1} \bmod {2^{128} - 1}$ and $pt = t^d$. Since $\mathcal{GCD}(e, 2^{128} -1) = 5$, a more convenient way is to compute `nth_root` in sage and we have a chance of 1/5 to submit the correct key to the server.

The oracle in cccccircus is slightly different. Denote the final mac value as coefficient vector:

$$
\begin{aligned}
\textsf{MAC}(k(x), m(x), \ell) &=  (k(x) x^{8(\ell + 1)} + m(x))^{e} \mod f(x) \\
&:= \sum_{i=0}^{127} t_i x^{i} \mod f(x)
\end{aligned}
$$

The cccccircus oracle returns the half MSB bits of mac: $\mathcal{T}(m) = (t_{64}, \cdots, t_{127})$. If we expand the power, there will be numerous annoying monomials. However, by manipulating our message, we can make the padded message `len(msg) || msg`  be zero in $\mathbb{F}_{2^{128}}$, i.e., $m(x) \equiv  0 \mod f(x)$. Denote $m(x) = \ell(x) \cdot x^{8\ell} + m_0(x)$ where $\ell(x)$ is the length polynomial and $m_0(x)$ is message payload polynomial. For fixed length message, we compute $m_0(x) = -\ell(x) \cdot x^{8\ell} \mod f(x)$ and immediately $m(x) = 0$. The returned mac value is:

$$
\begin{aligned}
\textsf{MAC}(k(x), m(x), \ell) &=  (k(x) \cdot x^{8(\ell + 1)})^{e} \mod f(x) \\
& = \underbrace{k(x)^{e}}_{K(x)} \cdot \underbrace{x^{8e(\ell + 1)}}_{L(x)} \mod f(x) \\
&:= (t_0, t_1, \cdots, t_{127})
\end{aligned}
$$

{: .error}
**The leak bits $\mathcal{T}(m) = (t_{64}, \cdots, t_{127})$ reveal 64 linear equations of the coefficient vector of $K(x) = k(x)^e$ since $L(x) = x^{8e(\ell + 1)}$ is known.** 

Note that in polynomial multiplication modulo $f(x)$, every polynomial $g(x)$ can be represented as its accompanying circulant matrix:

$$
\mathbf{M}(g) = 
\begin{bmatrix}
g_{0,0} & g_{0,1}  & \cdots  & g_{0, 127} \\
g_{1,0} & g_{1,1}  & \cdots  & g_{1, 127} \\
\vdots & \vdots & \ddots  & \vdots \\
g_{127,0} & g_{127,1}  & \cdots  & g_{127, 127} 
\end{bmatrix}
$$

where $g(x) x^{i} = \sum_{j} g_{i, j}x^j \mod f(x)$. The polynomial multiplication modulo $f(x)$ is equivalent to circulant matrix multiplication. Denote the vector representation of polynomial $h(x) = h_0 + h_1 x + \cdots h_{127} x^{127}$ as $\vec{h(x)} = (h_0, h_1, \cdots, h_{127})$. We have: 

$$
\begin{aligned}
r(x) &= h(x) \cdot g(x) \mod f(x)  \\
&= h_0 \cdot g(x)x^0 + h_1 \cdot g(x)x^1 + \cdots g(x)x^{127} \mod f(x) \\
\implies  \vec{r(x)} &= \vec{h(x)} \mathbf{M}(g)
\end{aligned}
$$

Using above representation, the linear equations can be easily derived. Collect enough linear equations with full rank 128 and solve for $K(x) = k(x)^e$. The remaining part is the same as the previous two challenges.

### Exploit

<details class="exploit">
<summary><b>Exploit for cccccircus</b></summary>
<div markdown="1">

``` python
from sage.all import GF, PolynomialRing, ZZ, matrix, vector
from pwn import remote, process

P = PolynomialRing(GF(2), 'x')
x = P.gen()

def int_to_poly(h):
    return sum(((int(h) >> i) & 1) * x**i for i in range(int(h).bit_length()))

def poly_to_hex(f):
    num = int("".join([str(i) for i in f.list()[::-1]]), 2)
    return num.to_bytes((num.bit_length() + 7) // 8, "big").hex()

f = int_to_poly(0x1f3267f571be716d65f11ecb21b86d2e9)
F = GF(2**128, name='a', modulus=f)
a = F.gen()

def generate_special_message(target_len):
    assert 255 >= target_len >= 16
    prefix = bytes([target_len]) + b"\x00" * target_len
    pre_poly = F(int_to_poly(int.from_bytes(prefix, "big")))
    suffix16 = bytes.fromhex(poly_to_hex(-pre_poly))
    suffix = b"\x00" * (target_len - len(suffix16)) + suffix16
    return bytes([target_len]) +  suffix


def polynomial_to_circulant_matrix(poly, n, mod, F=ZZ):
    x = poly.variables()[0]
    M = []
    for i in range(n):
        tmp_pol = poly * x**i % mod
        M.append(tmp_pol.list() + [0] * (n - 1 - tmp_pol.degree()))
    return matrix(F, M)

local = False
while True:
    if local:
        io = process(["python3", "vuln.py"], level='info')
    else:
        io = remote("78.46.142.212", "7777", level='info')
    eqs = []
    leaks = []
    for tlen in range(32, 32 + 10):
        io.sendline(b"query " + generate_special_message(tlen)[1:].hex().encode())
        mask_poly = P(F(int_to_poly(1 << (8*tlen + 8))) ** 1000000)
        M = polynomial_to_circulant_matrix(mask_poly, 128, f)
        leak = ZZ(int(io.recvline().strip().decode(), 16))
        leak_bits = [(leak >> i) & 1 for i in range(64)]
        assert len(leak_bits) == 64 and leak < 2**64
        eqs += [M.column(i + 64) for i in range(64)]
        leaks += leak_bits
    mat = matrix(GF(2), eqs)
    vec = vector(GF(2), leaks)
    sol = mat.solve_right(vec)
    kpoly = F(sol.list())
    c = [poly_to_hex(i) for i in kpoly.nth_root(1000000, all=True)]
    print(f"submit {c[0]}")
    io.sendline(b"solve " + c[0].encode())
    res = io.recvline()
    print(res.decode().strip())
    if b"hxp" in res:
        break
    io.close()
```

</div>
</details>

## spiky elf

{: .success}
So I recently¹ did some power analysis stuff² and found this RSA private key, except I think I got a few bits wrong? [Attachment](/assets/ctf-stuff/2024-hxp/spiky_elf-722497613bbe984c.tar.xz)


<details class="warning">
<summary><b>spiky_elf.sage</b></summary>
<div markdown="1">

``` python
#!/usr/bin/env sage
proof.all(False)

bits = 1024
errs = 16

p = random_prime(2^(bits//2))
q = random_prime(2^(bits//2))
n = p * q
e = 0x10001
print(f'{n = :#x}')
print(f'{e = :#x}')

flag = pow(int.from_bytes(open('flag.txt','rb').read().strip()), e, n)
print(f'{flag = :#x}')

d = inverse_mod(e, lcm(p-1, q-1))
locs = sorted(Subsets(range(bits), errs).random_element())
for loc in locs:
    d ^^= 1 << loc
print(f'{d = :#x}')
```

</div>
</details>


### Solution 

The private key $d$ is leaked as follows:

``` python
errs = 16
bits = 1024
locs = sorted(Subsets(range(bits), errs).random_element())
for loc in locs:
    d ^^= 1 << loc
```

Precisely, 16 of 1024 bits are randomly flipped. We take two steps to figure out the error positions:

1. Find the error bits in the half msb bits of $d$, i.e., from $512$ to $1024$ by brute forcing $k \in [1, e-1]$ and the approximation $d^\prime \approx \frac{kn + 1}{e}$ where $e$ is 65537. The correct $k$ reveals the correct msb bits of $d$ and this can be determined by the known error-mixed leak of $d$. 
2. For the remaining 8 (actually it's 7) error bits, we use a meet-in-the-middle strategy. 

We briefly discuss the meet-in-the-middle part here. After the solving the first part, we found that $520$ msb bits are determined and $9$ errors can be found. There are $7$ errors in $504$ positions to be corrected. Denote $d$ as:

$$
d := d_{1}2^{504} + d_0 = d_12^{504} + \underbrace{a \cdot 2^{252} + b}_{d_0}
$$

The distribution of errors in $a$ and $b$ is probably 3, 4 or 4, 3. Let $c = 2^e \mod n$. From $c^d = 2$, we obtain:

$$
\begin{aligned}
c^{ d_1 \cdot 2^{504} + a \cdot 2^{252} + b} &= 2 \\
\implies c^{b} (c^{2^{252}})^a &= 2 \cdot c^{-d_1 \cdot 2^{504}}
\end{aligned}
$$

The right-hand side is known and we bruteforce the candidates of $a, b$ in a meet-in-the-middle way:

- Enumerate $b$, compute table containing all possible values of $2 \cdot c^{-d_1 \cdot 2^{504}} \cdot c^{-b}$.
- Enumerate $a$, compute $(c^{2^{252}})^a$ and check if there is a collision in the aforementioned table. Once we find a collision, we can retrieve $a, b$ and correct the error bits.

The enumeration space is at most $\binom{252}{4} \approx 2^{28}$. We can accelerate the computing process of $c^b$ and $(c^{2^{252}})^a$ by precomputing power basis, i.e., precomputing $c^{2^i}, c^{-2^i}$ for $i \in [1, 504]$. The complete search of $(4,3)$ or $(3,4)$ error distribution takes 1 min with 12 cores in Python. A single-core implementation takes at most 20 mins (but actually finishes after 2 mins) if we correctly guess the $(4,3)$ or $(3,4)$ distribution.

### Exploit

<details class="exploit">
<summary><b>Correcting MSB</b></summary>
<div markdown="1">

``` python
from sage.all import ZZ

def count_msb_errors(d, d_bar, nmsb=600):
    return bin(d ^ d_bar)[2:].zfill(1024)[:nmsb].count('1')

n = 0x639d87bf6a02786607d67741ebde10aa39746dc8ed22b191ff2fefe9c210b3ee2ce68b185dc7f8069e78441bdec1d33e2b342c226b5cde8a49f567ac11a3bcb7ff88eeededdd0d50eb981635920d2380a6b878d327b261821355d65b2ef9f807035a70c77252d09787c2b3dfafdfa4f5c6b39a1c66c5b39fe9d1ee4b36d86d5
e = 0x10001
flag = 0x40208a7900b1575431a49690030e4eb8be6269edcd3c7b2d97ae94a6eb744e9c622d81b95ea45b23ee6e0d773e3dd48adc6bb2c7c6423d8fd52eddcc6c0710f607590d5fc57a45883a36ad0d851f84d4bee86ffaf65bc1773f97430080926550dce3666051befa87bacc01d44dd09baa6ae93a85cedde5933f7cbbe2cb56cdd
d = 0x1a54893799cd9805600cfaee1c8a408813525db268fbc29e7f2a81eb47b64d2dd20dc8be52b6332e375f92a120957042a92a4bd4f5e13ef14e9b398bec330602dc9dbbb63cf3dfe6d33bf95d08306a894b052e005a57cc41673fe866f4f8b2ffb0aa26fc4c51a8f5135e40df2107e0259ddf4c1d9c1eb41b1f702b135c941

# cc = (p - 1)(q-1) / lcm(p-1, q-1)
cc_max = n // d
nmsb = 520

for k in range(1, e):
    for cc in range(2, cc_max, 2):
        # ed = k(n - p - q + 1)/cc + 1
        d_real_msb = (k * n // cc + 1) // e
        err_num = count_msb_errors(d, d_real_msb, nmsb)
        if err_num <= 16:
            err_pos = [i for i, (a, b) in enumerate(zip(bin(d)[2:].zfill(1024)[:nmsb], bin(d_real_msb)[2:].zfill(1024)[:nmsb])) if a != b]
            print(f"Found: {d_real_msb = } with {k//cc = }")
            print(f"Found: {err_num =  } in {nmsb} msb bits")
            print(f"Found: {err_pos = } from highest bit to lowest bit")
            exit(0)

# Found: d_real_msb = 4514088967547488951649479902515202812774123491743896551436762406242971627370506765191178449599877062466101307468179199203541042200279058948411943214043223303232663400817011215091948406144006044666676764127646300202138127044251756808659462372075867443194976482310771190867332273026020227834408536297872091 with k//cc = 67
# Found: err_num =  9 in 520 msb bits
# Found: err_pos = [46, 102, 235, 252, 280, 394, 412, 434, 485] from highest bit to lowest bit
```

</div>
</details>

<details class="exploit">
<summary><b>Single-process MITM</b></summary>
<div markdown="1">

``` python
from sage.all import ZZ, binomial
from itertools import combinations
from tqdm import tqdm

n = 0x639d87bf6a02786607d67741ebde10aa39746dc8ed22b191ff2fefe9c210b3ee2ce68b185dc7f8069e78441bdec1d33e2b342c226b5cde8a49f567ac11a3bcb7ff88eeededdd0d50eb981635920d2380a6b878d327b261821355d65b2ef9f807035a70c77252d09787c2b3dfafdfa4f5c6b39a1c66c5b39fe9d1ee4b36d86d5
e = 0x10001
flag = 0x40208a7900b1575431a49690030e4eb8be6269edcd3c7b2d97ae94a6eb744e9c622d81b95ea45b23ee6e0d773e3dd48adc6bb2c7c6423d8fd52eddcc6c0710f607590d5fc57a45883a36ad0d851f84d4bee86ffaf65bc1773f97430080926550dce3666051befa87bacc01d44dd09baa6ae93a85cedde5933f7cbbe2cb56cdd
d = 0x1a54893799cd9805600cfaee1c8a408813525db268fbc29e7f2a81eb47b64d2dd20dc8be52b6332e375f92a120957042a92a4bd4f5e13ef14e9b398bec330602dc9dbbb63cf3dfe6d33bf95d08306a894b052e005a57cc41673fe866f4f8b2ffb0aa26fc4c51a8f5135e40df2107e0259ddf4c1d9c1eb41b1f702b135c941
d_real_msb = 4514088967547488951649479902515202812774123491743896551436762406242971627370506765191178449599877062466101307468179199203541042200279058948411943214043223303232663400817011215091948406144006044666676764127646300202138127044251756808659462372075867443194976482310771190867332273026020227834408536297872091

err_pos = [46, 102, 235, 252, 280, 394, 412, 434, 485]
unknown_nbit = 1024 - 520
d_msb = (d_real_msb >> unknown_nbit) << unknown_nbit
d_lsb = d & ((1 << unknown_nbit) - 1)

enc2 = pow(2, e, n)
inv_enc2 = pow(enc2, -1, n)
# enc2^(d_msb) * enc2^(d_l) = 2
# c:= enc2^(d_l) = 2 * pow(enc2, -d_msb, n) % n
# d_l := a*2**252 + b 
# c = enc2 ^ (a*2**252 + b) = (enc2^(2^252))^a * enc2 ^ b
# c *  * (enc2^-1) ^ b) = (enc2^(2^252))^a

c  = 2 * pow(enc2, - d_msb, n) % n
X = pow(enc2, 2**252, n)

enc2_basis = [pow(enc2, 2**i, n) for i in range(unknown_nbit // 2)]
enc2_inv_basis = [pow(inv_enc2, 2**i, n) for i in range(unknown_nbit // 2)]
X_basis = [pow(X, 2**i, n) for i in range(unknown_nbit // 2)]
X_inv_basis = [pow(pow(X, -1, n), 2**i, n) for i in range(unknown_nbit // 2)]

d_l_msb = d_lsb >> (unknown_nbit // 2)
d_l_lsb = d_lsb & ((1 << (unknown_nbit // 2)) - 1)
d_l_lsb_bits = [d_l_lsb >> i & 1 for i in range(unknown_nbit // 2)]
d_l_msb_bits = [d_l_msb >> i & 1 for i in range(unknown_nbit // 2)]

B_initial = pow(inv_enc2, d_l_lsb, n) * c % n
A_initial = pow(X, d_l_msb, n)

# build table
search_err1 = 3
search_err2 = 4
pos_size = 252 # unknown_nbit // 2
bf_space = combinations(range(pos_size), search_err1) 
total_size = binomial(pos_size, search_err1)
table = {}

for pos1 in tqdm(bf_space, total=total_size):
    lhs = A_initial
    for idx in pos1:
        if d_l_msb_bits[idx] == 1:
            lhs = lhs * X_inv_basis[idx] % n
        else:
            lhs = lhs * X_basis[idx] % n
    table[lhs] = pos1

bf_space = combinations(range(pos_size), search_err2) 
total_size = binomial(pos_size, search_err2)

for pos2 in tqdm(bf_space, total=total_size):
    rhs = B_initial
    for idx in pos2:
        if d_l_lsb_bits[idx] == 1:
            rhs = rhs * enc2_basis[idx] % n
        else:
            rhs = rhs * enc2_inv_basis[idx] % n
    if rhs in table:
        pos1 = table[rhs]
        print(f"{pos1 = }")
        print(f"{pos2 = }")
        break
```

</div>
</details>

<details class="exploit">
<summary><b>Multi-process MITM</b></summary>
<div markdown="1">

``` python
# Generated by GPT-4o (rewrite a multi-process version of the above code).
from sage.all import binomial
from itertools import combinations
from tqdm import tqdm
from multiprocessing import Pool, cpu_count

n = 0x639d87bf6a02786607d67741ebde10aa39746dc8ed22b191ff2fefe9c210b3ee2ce68b185dc7f8069e78441bdec1d33e2b342c226b5cde8a49f567ac11a3bcb7ff88eeededdd0d50eb981635920d2380a6b878d327b261821355d65b2ef9f807035a70c77252d09787c2b3dfafdfa4f5c6b39a1c66c5b39fe9d1ee4b36d86d5
e = 0x10001
flag = 0x40208a7900b1575431a49690030e4eb8be6269edcd3c7b2d97ae94a6eb744e9c622d81b95ea45b23ee6e0d773e3dd48adc6bb2c7c6423d8fd52eddcc6c0710f607590d5fc57a45883a36ad0d851f84d4bee86ffaf65bc1773f97430080926550dce3666051befa87bacc01d44dd09baa6ae93a85cedde5933f7cbbe2cb56cdd
d = 0x1a54893799cd9805600cfaee1c8a408813525db268fbc29e7f2a81eb47b64d2dd20dc8be52b6332e375f92a120957042a92a4bd4f5e13ef14e9b398bec330602dc9dbbb63cf3dfe6d33bf95d08306a894b052e005a57cc41673fe866f4f8b2ffb0aa26fc4c51a8f5135e40df2107e0259ddf4c1d9c1eb41b1f702b135c941
d_real_msb = 4514088967547488951649479902515202812774123491743896551436762406242971627370506765191178449599877062466101307468179199203541042200279058948411943214043223303232663400817011215091948406144006044666676764127646300202138127044251756808659462372075867443194976482310771190867332273026020227834408536297872091

err_pos = [46, 102, 235, 252, 280, 394, 412, 434, 485]
unknown_nbit = 1024 - 520
d_msb = (d_real_msb >> unknown_nbit) << unknown_nbit
d_lsb = d & ((1 << unknown_nbit) - 1)

enc2 = pow(2, e, n)
inv_enc2 = pow(enc2, -1, n)
c  = 2 * pow(enc2, - d_msb, n) % n
c_inv = pow(c, -1, n)
enc2_basis = [pow(enc2, 2**i, n) for i in range(unknown_nbit // 2)]
enc2_inv_basis = [pow(inv_enc2, 2**i, n) for i in range(unknown_nbit // 2)]

search_err1 = 3 # build table with 3 errors (may be the msb or lsb, depending on your implementation)
search_err2 = 4 # search table with 4 errors (may be the msb or lsb, depending on your implementation)
pos_size = 252  # unknown_nbit // 2

d_l_msb = d_lsb >> (unknown_nbit // 2)
d_l_lsb = d_lsb & ((1 << (unknown_nbit // 2)) - 1)
B_initial = c * pow(inv_enc2, d_l_lsb, n) % n
d_l_lsb_bits = [d_l_lsb >> i & 1 for i in range(unknown_nbit // 2)]
d_l_msb_bits = [d_l_msb >> i & 1 for i in range(unknown_nbit // 2)]

X = pow(enc2, 2**252, n)
X_basis = [pow(X, 2**i, n) for i in range(unknown_nbit // 2)]
X_inv_basis = [pow(pow(X, -1, n), 2**i, n) for i in range(unknown_nbit // 2)]
A_initial = pow(X, d_l_msb, n)

# def build_table_task(pos1_chunk):
#     table_chunk = {}
#     for pos1 in pos1_chunk:
#         lhs = B_initial
#         for idx in pos1:
#             if d_l_lsb_bits[idx] == 1:
#                 lhs = lhs * enc2_basis[idx] % n
#             else:
#                 lhs = lhs * enc2_inv_basis[idx] % n
#         table_chunk[lhs] = pos1
#     return table_chunk

def build_table_task(pos1_chunk):
    table_chunk = {}
    for pos1 in pos1_chunk:
        lhs = A_initial
        for idx in pos1:
            if d_l_msb_bits[idx] == 1:
                lhs = lhs * X_inv_basis[idx] % n
            else:
                lhs = lhs * X_basis[idx] % n
        table_chunk[lhs] = pos1
    return table_chunk

def parallel_build_table():
    bf_space = list(combinations(range(pos_size), search_err1))
    total_size = binomial(pos_size, search_err1)
    chunk_size = total_size // cpu_count()
    chunks = [bf_space[i:i+chunk_size] for i in range(0, len(bf_space), chunk_size)]

    with Pool() as pool:
        results = list(tqdm(pool.imap(build_table_task, chunks), total=len(chunks)))

    table = {}
    for chunk in results:
        table.update(chunk)
    return table

# def search_table_task(args):
#     pos2_chunk, table = args
#     results = []
#     for pos2 in pos2_chunk:
#         rhs = A_initial
#         for idx in pos2:
#             if d_l_msb_bits[idx] == 1:
#                 rhs = rhs * X_inv_basis[idx] % n
#             else:
#                 rhs = rhs * X_basis[idx] % n
#         if rhs in table:
#             print(f"{pos2 = }")
#             print(f"{table[rhs] = }")
#             results.append((table[rhs], pos2))
#     return results

def search_table_task(args):
    pos2_chunk, table = args
    results = []
    for pos2 in pos2_chunk:
        rhs = B_initial
        for idx in pos2:
            if d_l_lsb_bits[idx] == 1:
                rhs = rhs * enc2_basis[idx] % n
            else:
                rhs = rhs * enc2_inv_basis[idx] % n
        if rhs in table:
            print(f"{pos2 = }")
            print(f"{table[rhs] = }")
            results.append((table[rhs], pos2))
    return results


def parallel_search_table(table):
    bf_space = list(combinations(range(pos_size), search_err2))
    total_size = binomial(pos_size, search_err2)
    chunk_size = total_size // cpu_count()
    chunks = [bf_space[i:i + chunk_size] for i in range(0, len(bf_space), chunk_size)]

    with Pool() as pool:
        # Pass both chunks and the table as arguments
        results = list(tqdm(pool.imap(search_table_task, [(chunk, table) for chunk in chunks]), total=len(chunks)))

    for chunk in results:
        for pos1, pos2 in chunk:
            print(f"{pos1 = }")
            print(f"{pos2 = }")

def main():
    print("Building table...")
    table = parallel_build_table()
    print("Searching table...")
    parallel_search_table(table)

if __name__ == "__main__":
    print(f"{cpu_count() = }")
    main()
```

</div>
</details>

---
