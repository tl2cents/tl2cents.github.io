---
tags: CTF Writeup Cryptography
title: R3CTF 2024 Crypto Writeup
published: true
---

{: .info}
**tl;dr:** Writeups for R3CTF 2024, including the challenges `r0,1,2system`, `TinySeal`, and `SPARROW`. Amazing challenges about: poly-nonce attack of ECDSA, BFV fully homomorphic encryption, and linearization of symmetric cipher.

<!--more-->

## r0,1,2system

{: .success}
**Challenge Info**: A rudimentary and work-in-progress account system. [Attachment1](/assets/ctf-stuff/2024-r3ctf/r0system.zip) [Attachment2](/assets/ctf-stuff/2024-r3ctf/r1system.zip)


### 题目分析

r0system，r1system，r2system 的题解。最终目的都是拿到 Alice 和 Bob 通过 ECDH 生成的共享密钥，只要拿到 Alice 和 Bob 的任意一个私钥，即可解密加密的消息。

- **r0system**：第一问是 reset password 功能未限制用户权限，任意用户 X 登录后，可以更改其他用户的 password，从而登录上 Alice 的账户拿到私钥。

- **r1system**：第二问看代码就知道是一个非预期，

  ``` python
  if username == AliceUsername or username == AliceUsername:
  ```

  可以直接注册 Bob 的账户，从而拿到私钥解密数据。

- **r2system** ：修复 r1system 的非预期，最多可以注册 10 次，注意到 PRNG 使用了多项式形式的 LCG ，这时利用类似 ecdsa-polynomial-nonce-recurrence-attack ，可以恢复出服务器的私钥 $x$ 和 PRNG 的内部状态，从而能够完全预测出最后服务器端注册 Bob 账号时的 token 的值，进而拿到 Bob 的私钥。



### Ecdsa Polynomial Nonce Recurrence Attack

{: .info}
**相关实现和论文参考**：GitHub 开源实现 [**Polynonce: ECDSA Attack**](https://github.com/kudelskisecurity/ecdsa-polynomial-nonce-recurrence-attack)，论文 [A Novel Related Nonce Attack for ECDSA](https://eprint.iacr.org/2023/305.pdf) page 7 section 3.2。


注意到本题 nonce 的生成方式在数学本质上和 ECDSA 签名是类似的：

``` python
    def generate_token(self,username):
        s = self.RNG.next()
        u = b2i(username)
        return i2b(int((self.x * pow(s + u,-1,MOD)) % MOD),128)
```

记模数为 $N$ ，上述 poly-RNG （次数为 7）多项式为：

$$
f(x) = \sum_{0}^{7} a_i x^i \mod N \\
\text{update }\implies s = f(s)
$$

服务器的私钥为 $x$ ，则用户 $u_i$ 的 token 生成为：

$$
s_i= f(s_{i-1}) \\
t_i = x (s_i + u_i)^{-1} \mod N
$$

则每次的 nonce 可以表示为服务器私钥的函数 $s_i = x t_i^{-1} - u_i \mod N$。于是得到 10 组方程：

$$
s_0 = x t_0^{-1} - u_0 \mod N \\
\cdots \\ \tag{S}
s_{9} = x t_{9}^{-1} - u_{9} \mod N 
$$

以及由 poly-RNG 生成的 9 组方程：

$$
\begin{aligned}
s_1 & =a_{7} s_0^{7}+a_{6} s_0^{6}+\cdots+a_1 s_0+a_0 \\
s_2 & =a_{7} s_1^{7}+a_{6} s_1^{6}+\cdots+a_1 s_1+a_0 \\
& \cdots \\
s_{9} & =a_{7} s_{8}^{7}+a_{6} s_{8}^{6}+\cdots+a_1 s_{8}+a_0
\end{aligned} \tag{P}
$$

将 (S) 带入 (P)，最终可以得到关于九个变量 $a_0, \cdots, a_7, x$ 的九个方程。因为 $a_i$ 在 (P) 中的最高次数都是 1，可以消元得到一个只与 $x$ 有关的高次的方程组，对于素数的模数 $N$ 来说，求解这样方程的根是简单的。记 $k_{i,j} = k_i - k_j$ ，关于消元的递归算法在 [A Novel Related Nonce Attack for ECDSA](https://eprint.iacr.org/2023/305.pdf) 的 Algorithm 2 中给出

![image-20240609220217887](/assets/ctf-stuff/2024-r3ctf/image-20240609220217887.png)

求解私钥多项式的根得到 $x$ 和系数 $a_i$ 的若干个解，预测 $s_{10}$ 即可得到最后一次注册 Bob 的账号时的 token。



### Exploit

<details class="exploit">
<summary><b>recover_x.py</b></summary>
<div markdown="1">

``` python
#!/usr/bin/env sage

from sage.all import GF, PolynomialRing
import hashlib
import ecdsa
import random
from utils import *
import os


def separator():
    print("-" * 150)

def gen_kij_poly(ys_inv, us, x, mod):
    def k_ij_poly(i, j):
        coeff1 = (ys_inv[i] - ys_inv[j]) % mod
        coeff2 = (us[i] - us[j]) % mod
        poly = coeff1*x - coeff2
        return poly
    return k_ij_poly


def dpoly(k_ij_poly, n, i, j):
    if i == 0:
        return (k_ij_poly(j+1, j+2))*(k_ij_poly(j+1, j+2)) - (k_ij_poly(j+2, j+3))*(k_ij_poly(j+0, j+1))
    else:
        left = dpoly(k_ij_poly, n, i-1, j)
        for m in range(1, i+2):
            left = left*(k_ij_poly(j+m, j+i+2))
        right = dpoly(k_ij_poly, n, i-1, j+1)
        for m in range(1, i+2):
            right = right*(k_ij_poly(j, j+m))
        return (left - right)


def print_dpoly(n, i, j):
    if i == 0:
        print('(k', j+1, j+2, '*k', j+1, j+2, '-k', j+2,
              j+3, '*k', j+0, j+1, ')', sep='', end='')
    else:
        print('(', sep='', end='')
        print_dpoly(n, i-1, j)
        for m in range(1, i+2):
            print('*k', j+m, j+i+2, sep='', end='')
        print('-', sep='', end='')
        print_dpoly(n, i-1, j+1)
        for m in range(1, i+2):
            print('*k', j, j+m, sep='', end='')
        print(')', sep='', end='')
        
def recover_sk(us, ys, degree, mod):
    assert len(us) == len(ys)
    assert len(us) >= degree + 3
    Z = GF(mod)
    R = PolynomialRing(Z, names=('x',))
    (x,) = R._first_ngens(1)
    
    ys_inv = [int(pow(y, -1, mod)) for y in ys]
    k_ij_poly = gen_kij_poly(ys_inv, us, x, mod)
    poly_target = dpoly(k_ij_poly, degree - 1, degree - 1, 0)
    d_guesses = poly_target.roots(multiplicities=False)
    # separator()
    # print("Roots of the polynomial :")
    # print(d_guesses)
    # separator()
    return d_guesses
    
    
def test_recover():
    MOD = 0x10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000283
    SEED = b2i(os.urandom(128))

    N = 10
    x = randint(1, MOD)
    a = []
    for i in range(N-2):
        a.append(random.randint(1, MOD - 1))
        
    k = []
    k.append(randint(1, MOD))
    for i in range(N-1):
        new_k = 0
        for j in range(N-2):
            new_k += a[j]*(k[i]**j) % MOD
        k.append(new_k % MOD)

    us = [randint(1, MOD) for _ in range(N)]
    ys = []
    ys_inv = []

    for i in range(N):
        y = (x * pow(k[i] + us[i], -1, MOD)) % MOD
        ys.append(y)
        ys_inv.append(int(pow(y, -1, MOD)))
    
    sk = recover_sk(us, ys, N-2, MOD)
    print(f"Check : {x in sk}")

if __name__ == "__main__":
    test_recover()
```

</div>
</details>


<details class="exploit">
<summary><b>Exploit</b></summary>
<div markdown="1">

``` python
from pwn import remote, context, log, process
import os
from recover_x import recover_sk
from Crypto.Util.number import long_to_bytes, bytes_to_long
from sage.all import GF, PolynomialRing
from utils import ECDH, b2p, p2b
from Crypto.Cipher import AES

def pad(msg):
    return msg + bytes([i for i in range(16 - int(len(msg) % 16))])

def enc(msg,key):
    aes = AES.new(key,AES.MODE_ECB)
    return aes.encrypt(pad(msg))

def dec(msg,key):
    aes = AES.new(key,AES.MODE_ECB)
    return aes.decrypt(msg)

def sing_up(io:remote, uname:bytes, pwd:bytes):
    io.sendlineafter(b"Now input your option: ", b'3')
    io.sendlineafter(b"Username[HEX]: ", uname.hex().encode())
    io.sendlineafter(b"Password[HEX]: ", pwd.hex().encode())
    io.recvuntil(b"token is ")
    token = io.recvline().strip().decode()
    return token  

def login_by_password(io:remote, uname:bytes, pwd:bytes):
    io.sendlineafter(b"Now input your option: ", b'1')
    io.sendlineafter(b"Username[HEX]: ", uname.hex().encode())
    io.sendlineafter(b"Password[HEX]: ", pwd.hex().encode())
    respone = io.recvline().strip().decode()
    if respone == "Login successfully!":
        return True, uname
    return False, uname

def login_by_token(io:remote, uname:bytes, token:bytes):
    io.sendlineafter(b"Now input your option: ", b'2')
    io.sendlineafter(b"Username[HEX]: ", uname.hex().encode())
    io.sendlineafter(b"Token[HEX]: ", token.hex().encode())
    respone = io.recvline().strip().decode()
    if respone == "Login successfully!":
        return True, uname
    return False, uname

def reset_password(io:remote, uname:bytes, new_pwd:bytes):
    io.sendlineafter(b",do you need any services? ", b'1')
    io.sendlineafter(b"Username[HEX]: ", uname.hex().encode())
    io.sendlineafter(b"New Password[HEX]: ", new_pwd.hex().encode())
    respone = io.recvline().strip().decode()
    return respone

def exit_login(io:remote):
    io.sendlineafter(b",do you need any services? ", b'5')

def get_PublicChannels(io:remote):
    io.sendlineafter(b"do you need any services? ", b'3')
    # respone = io.recvuntil(b" Wow! I know your flag now! ")
    io.recvuntil(b"[AliceIsSomeBody] to [BobCanBeAnyBody]: My Pubclic key is: ")
    pka = bytes.fromhex(io.recvline().strip().decode())
    io.recvuntil(b"[BobCanBeAnyBody] to [AliceIsSomeBody]: My Pubclic key is: ")
    pkb = bytes.fromhex(io.recvline().strip().decode())
    io.recvuntil(b"BobCanBeAnyBody]: Now its my encrypted flag:\n[AliceIsSomeBody] to [BobCanBeAnyBody]: ")
    encflag = bytes.fromhex(io.recvline().strip().decode())
    return pka, pkb, encflag

def get_ecdh_keys(io:remote):
    io.sendlineafter(b",do you need any services? ", b'4')
    io.recvuntil(b"Your private key is:")
    sk = bytes.fromhex(io.recvline().strip().decode())
    io.recvuntil(b"Your public key is:")
    pk = bytes.fromhex(io.recvline().strip().decode())
    return sk, pk

def gen_possible_tokens(sk, us, ys, uname, degree, mod):
    # x = yi(ui + ki) % mod
    R = GF(mod)
    pr = PolynomialRing(R, names=('x',))
    next_u = bytes_to_long(uname)
    tokens = []
    for x in sk:
        ks = []
        for ui, yi in zip(us, ys):
            ki = x * pow(yi, -1, mod) - ui
            ki = int(ki) % mod
            ks.append(ki)
        points = [(ks[i], ks[i+1]) for i in range(len(ks) - 1)]
        poly = pr.lagrange_polynomial(points)
        if poly.degree() == degree:
            next_k = poly(ks[-1])
            token_num = int((x * pow(next_k + next_u, -1, mod)) % mod)
            tokens.append(long_to_bytes(token_num).hex())
    return tokens
        

local = False
# ctf2024-entry.r3kapig.com:30517
io = process(['python3', 'server.py']) if local else remote('ctf2024-entry.r3kapig.com', 30517)


# context.log_level = 'debug'

# recover sk
us = []
tokens = []
pwds = []
unames = []
N = 10

for i in range(N):
    uname = b'tl2cents' + str(i).encode()
    pwd = b'password_' + os.urandom(8).hex().encode()
    token = sing_up(io, uname, pwd)
    pwds.append(pwd)
    unames.append(uname)
    # log.info(f"{uname}'s token: {token}")
    tokens.append(int(token.strip("."), 16))
    us.append(bytes_to_long(uname))
    
degree = 7
MOD  = 0x10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000283
sk = recover_sk(us, tokens, degree, MOD)
BobUsername   = b'BobCanBeAnyBody'
bob_tokens = gen_possible_tokens(sk, us, tokens, BobUsername, degree, MOD)
log.info(f"Bob's possible tokens number : {len(bob_tokens)}")

is_login, uname = login_by_password(io, unames[-1], pwds[-1])
assert is_login, "Login failed"
pka, pkb, encflag = get_PublicChannels(io)
log.info(f"pka: {pka.hex()}")
log.info(f"pkb: {pkb.hex()}")
log.info(f"encflag: {encflag.hex()}")

exit_login(io)
# try login by token
is_login = False
for token in bob_tokens:
    is_login, uname = login_by_token(io, BobUsername, bytes.fromhex(token))
    if is_login:
        log.info(f"Login successfully with token: {token}")
        break
if not is_login:
    log.error("Login failed")
    exit()
sk, pk = get_ecdh_keys(io)
assert pk == pkb, "ECDH keys not match"

pka = b2p(pka)
pkb = b2p(pkb)
ecdh_alice = ECDH()
ecdh_alice.private_key = bytes_to_long(sk)
ecdh_alice.public_key = pkb

ecdh_bob = ECDH()
ecdh_bob.public_key = pka

shared_secret = ecdh_alice.exchange_key(ecdh_bob.public_key)
log.info(shared_secret.hex())

flag = dec(encflag, shared_secret)
log.info(f"flag : {flag}")
```
</div>
</details>


## TinySeal

{: .success}
**Challenge Info**: Today, DengFeng wants to do some calculations over his private data. He wants you to do the calculation for him, but he doesn't want you to know his private data... Can you help him? [Attachment](/assets/ctf-stuff/2024-r3ctf/TinySEAL.zip) 

### 题目场景

隐私保护的安全计算场景。使用全同态加密算法 BFV 进行同态加密，将密文发送给服务器，服务器对密文进行客户预先要求的计算，返回客户。

这里我们需要充当安全云计算里服务器的角色，对于随机的明文多项式 $p(x)$ ，我们需要在其密文 $C_{p(x)} = (c_1(x), c_2(x))$ 上进行密文同态运算 $\textsf{OPs}$，最终得到 $p(x)$ 的常数项 $p(x)[0]$ 对应的密文：

$$
C_t = \textsf{Eval}(c_{p(x)},\textsf{OPs}) = C_{p(x)[0]}
$$

于是我们的目的就是找到这样的同态运算 $\textsf{OPs}$ 。



### 同态系数提取（Sample Extraction）

从多项式密文同态提取出一个明文系数对应密文的操作称为 Sample Extraction。笔者之前对 TFHE 比较熟悉，印象里 TFHE 的密文同态系数提取是很简单的，性能开销非常低（$GLWE$ 到 $LWE$ 密文的转换）。花了一些时间对比 TFHE 和 BFV 的密文结构，发现密文结构差异很大，BFV 的同态系数提取很难参考 TFHE 的 Sample Extraction 过程。

所以回到题目本身使用的 TenSeal 库和 BFV 全同态加密算法。全同态加密一定可以进行下面两个同态计算：

- 同态乘法：$\textsf{Eval}(C_{m_1}, C_{m_2},\textsf{Mul}) = C_{m_1m_2}$
- 同态加法: $\textsf{Eval}(C_{m_1}, C_{m_2},\textsf{Add}) = C_{m_1 + m_2}$

其他运算：
- Bootstrapping 运算：相当于对密文进行同态解密，其核心目的是减少密文在多次同态运算后累积的噪声，从而实现无限制的全同态运算。
- 更多关于 BFV/BGV 全同态加密的运算，参考：[HElib Design](https://eprint.iacr.org/2020/1481.pdf)

其中明文 $m_1, m_2$ 是定义在多项式商环 $Q[x] = GF(p)[x]/(x^n + 1)$ 上的多项式，所有明文的同态运算都是基于 $Q[x] = GF(p)[x]/(x^n + 1)$ 上加法和乘法运算。在本题中 $p =163841, n = 4096$。

{: .warning}
**给定一个多项式 $f(x) \in Q[x]$ ，$f(x)$ 只能当作一个整体进行运算，如何通过对 $f(x)$ 进行加法、乘法操作最终得到 $f(x)$ 的常数项系数？**

一般来说，除法是很难同态计算的（理论上可以），提取多项式系数的运算单纯通过同态乘法和加法是很难实现的。



### Galois 自同构（Galois Automorphism）

注意到 TenSeal 库允许我们选择 `galois_keys`，即允许我们计算 Galois 自同构（Galois Automorphism）。

Galois 自同构是一个环同构，记多项式商环 $\mathcal{A}=\mathbb{Z}[X] /\left(\Phi_m(X)\right)$，其中 $\Phi_m(X)$ 是第 $m$ 个分圆多项式（cyclotomic polynomial），对任意 $j \in \mathbb{Z}_m^*$,  第 $j$ 个  Galois 自同构为 $\theta_j$ ：

$$
\begin{aligned}
\theta_j: \mathcal{A} & \longrightarrow \mathcal{A} \\
f(x) & \longmapsto f\left(x^j\right) \quad(\text { for } f(X) \in \mathbb{Z}[X]) .
\end{aligned}
$$

本题恰好是分圆多项式商环 $Q[x] = GF(p)[x]/(x^{4096} + 1) = \Phi_{8192}(x)$ ，可行的 Galois 自同构被限制在奇数 $1, 3, 5, \cdots, 4095, \cdots$ 上。（如果允许形如 $f(x^{2i})$ 的映射，这不再是一个环同构，例如 $f(x^{4096}) = f(-1)$ ）

对于任意多项式 $f(x) \in Q[x]$ ，因为 BFV 的密文不具可拆分性质，$f(x)$ 只能当作一个整体进行运算，我们可以进行下面三种运算：

- 同态加法：$f(x) + g(x)$ 
- 同态乘法： $f(x)g(x)$
- Galois 自同构：$\theta_i(f) = f(x^i), i =1, 3, 5, \cdots, 4095, \cdots$

容易得到，$x$ 在商环 $Q[x] = GF(p)[x]/(x^{4096} + 1)$ 上的阶为 $4096 * 2 = 8192$ ，因此理论上可行的 Galois 自同构为 $\theta_1, \theta_3, \cdots, \theta_{8191}$ 。观察到， Galois 自同构，实际上就是保持常数项不变，而其他项的系数进行移动的运算。具体来说：

$$
f(x) = a_0 + a_1 x + \cdots a_n x^{n-1} \\
f(x^3) = a_0 + a_1 x^{3} + \cdots a_n x^{3(n-1)} \pmod {x^n + 1} \\
\cdots
$$

由于 $x,x^3,\cdots x^{n-1}, x^{n} = -x, \cdots x^{2n-1} = -x^{n-1} \cdots$ ，所有系数要么直接进行了移动，要么乘以 -1 后进行了移动（$x^i \rightarrow x^{i + \Delta}$），

{: .error}
**那么有没有可能某些 Galois 自同构得到的多项式相加后，所有非常数单项式的系数都恰好消去等于 0 呢？或者每个系数 $a_i, \ \forall i \ge 1$ 对应的单项式求和后恰好等于0？** 这样就得到了 $f(x)$ 的常数项。


记在 $Q[x] = GF(p)[x]/(x^{n} + 1)$  上的 Galois 自同构群为 $ \mathcal{G_n}:( \\{\theta_j \| \mathcal{GCD}(j, 2n) = 1 \\}, \circ )$ ，群运算 $\circ$ 为映射复合。容易注意到这样一个群同构：

$$
\mathcal{G}:(\{\theta_j\}, \circ) \cong \mathbb{Z}_{2n}^{*}
$$

将 $\mathcal{G_n}$ 的所有元素都作用一遍 $f(x) = a_0 + a_1 x + \cdots a_n x^{n-1}$ ，考虑每个系数 $a_i$ 在每个 Galois 自同构作用下对应的单项式为序列为

$$
x^{i}, x^{3i}, x^{5i}, \cdots, x^{(2n - 3)i}, x^{(2n -1)i} \tag{Xi}
$$

与题目保持一致，**以下假设 $n = 2^m$，偶数**。

等比数列求和得到：

$$
\begin{aligned}
S_i(x) &= \sum_j (X_{i})_j \\
&=x^{i} + x^{3i} +  \cdots + x^{(2n - 3)i} + x^{(2n -1)i} \\
& = x^{i} \frac{x^{2ni} - 1}{x^{2i} - 1} \\
& = x^{i} \frac{1^{i} - 1}{x^{2i} - 1} \pmod {x^{n} + 1} \\
& = 0 \pmod {x^n-1}
\end{aligned}
$$

上述证明有一点小问题在于 $x^{2i} - 1$ 在 $x^{n} + 1$ 不一定可逆。证明 $x^{2ni} - 1$ 同时整除 $(x^{2i} - 1)(x^n + 1)$ 即可。因此 $n$ 个 Galois 自同构作用后的结果等于：

$$
\begin{aligned}
F(x) &= \theta_1(f(x)) +  \theta_3(f(x)) + \cdots +   \theta_{2n-1}(f(x))\\
&= f(x) + f(x^3) + \cdots + f(x^{2n-1}) \\
& = na_0 + a_1 S_1(x) + \cdots + a_{n-1} S_{n-1}x\\
& = na_0
\end{aligned}
$$

值得说明的是，上述结果对任意 $n$ 都成立。从整数商环的角度来看，考虑 $\mathbb{Z}_{n}^*$ ，有一个和上述等式很类似的定理，即模 $n$ 乘法群的元素之和为 0 （加法逆元配对）。

$$
\sum_{k, gcd(k,n)=1} k = 0 \mod n
$$



如果定义映射 $\theta_0 = f(x^0)$ ，则上述 $F(X)$ 的表达式就是一个非常类似的结果（~~也许可以定义新的元素和运算得到环同构？~~）

$$
n\theta_0(x) =  \theta_1(f(x)) +  \theta_3(f(x)) + \cdots +   \theta_{2n-1}(f(x))
$$

回到本题，我们是可以通过同态加法、同态乘法、同态 Galois 自同构运算组合得到同态系数提取（Sample Extraction）操作的，提取 $x^i$ 单项式系数 $a_i$ 的过程如下：

- 旋转（Rotation）：同态乘法乘以 $x^{-i}$ 的密文将目标系数 $a_i$ 旋转到常数项。
- Galois 自同构（Galois Automorphism）：作用所有的 Galois 自同构，得到一系列 $F = \{ f(x^i) \| \mathcal{GCD}(i, 2n) = 1 \}$
- 系数提取（Sample Extraction）：同态求和 $F$ 集合内的密文，然后乘以 $\varphi(2n)^{-1} \mod p$ ，最终得到系数 $a_i$ 的密文。



### 系数提取优化

上面的系数提取需要计算 $\varphi(2n)$ 个 Galois 自同构，本题 $n = 4096$ ，因此需要计算 $\varphi(8192) = 4096$ 次 Galois 自同构。并且 BFV 全同态加密的 Galois 自同构密钥的 size 随着 Galois 自同构的数量而迅速增大，在使用 TenSeal 进行计算时，一个包含所有 4096 个 Galois 自同构的 Galois Key 的大小达到了 1 GB。想要做一个简单的系数提取需要这么大的密钥，肯定是不现实的。并且题目也限制了 Galois Key 最多包含 12 个 Galois 自同构。于是，我们**需要用尽可能少的 Galois 自同构和尽可能少的同态操作次数，做到系数提取的操作。** 实际上这是 key-size 和同态计算工作量的一个 trade-off。

前面提到过：

$$
\mathcal{G}:(\{\theta_j\}, \circ) \cong \mathbb{Z}_{2n}^{*}
$$

于是通过寻找若干个生成元 $\{\theta_i\}$ ，然后通过映射复合，我们就可以生成的 Galois 自同构群 $\mathcal{G}$ 。生成元选择的素数次数形式的 Galois 自同构：

$$
j = {3, 5, 7, 11, 13 , \cdots, 8191}
$$

12 个生成元肯定能生成整个群，由于我们需要找到尽可能短的路径去生成所有的 Galois 自同构，于是我选择了爆破组合的方式，在生成整个群  $\mathcal{G}$  的同时，生成最短的路径 $\theta = g_1^{e_1}  \circ g_1^{e_2} \cdots \circ g_k^{e_k}, \ \forall \theta \in \mathcal{G}$。具体来说，选择 6 个生成元 $g_s = [3, 5, 7, 11, 13, 17]$ ，设置一个指数的最大值 $E = 6$，即可生成整个群 $\mathcal{G}$，并且映射复合的操作的最大次数为 $6 *6 = 36$ 次。足够通过本题的时间限制。


<details class="exploit">
<summary><b>compute_trace.py</b></summary>
<div markdown="1">

``` python
import itertools
    
gens = [3, 5, 7, 11, 13, 17]
exp_bound = 6

target_sub_group = sorted(range(1, 4096 * 2, 2))
sums = {}
sums[1] = 0
sub_group = {}
sub_group[1] = [0] * len(gens)
exps = itertools.product(range(exp_bound), repeat=len(gens))

for exp in exps:
    s = 1
    for g, e in zip(gens, exp):
        s = s * g ** e % (4096 * 2)
    if s not in sub_group:
        sub_group[s] = exp
        sums[s] = sum(exp)
    elif sum(exp) < sums[s]:
        sub_group[s] = exp
        sums[s] = sum(exp)
                        
# print(f"{len(sub_group) = }")
sub_group_keys = sorted(sub_group.keys())
assert (sub_group_keys == target_sub_group)
```
</div>
</details>


### Exploit

<details class="exploit">
<summary><b>Exploit</b></summary>
<div markdown="1">

``` python
import tenseal.sealapi as sealapi
import base64
import os
from tqdm import tqdm
from compute_trace import gens, sub_group
from pwn import remote, log

poly_modulus_degree = 4096
plain_modulus = 163841

flag = os.getenv('FLAG')


def gen_keys():
    parms = sealapi.EncryptionParameters(sealapi.SCHEME_TYPE.BFV)
    parms.set_poly_modulus_degree(poly_modulus_degree)
    parms.set_plain_modulus(plain_modulus)
    coeff = sealapi.CoeffModulus.BFVDefault(
        poly_modulus_degree, sealapi.SEC_LEVEL_TYPE.TC128)
    parms.set_coeff_modulus(coeff)

    ctx = sealapi.SEALContext(parms, True, sealapi.SEC_LEVEL_TYPE.TC128)

    keygen = sealapi.KeyGenerator(ctx)
    public_key = sealapi.PublicKey()
    keygen.create_public_key(public_key)
    secret_key = keygen.secret_key()

    parms.save("./app/parms")
    public_key.save("./app/public_key")
    secret_key.save("./app/secret_key")


def load():
    parms = sealapi.EncryptionParameters(sealapi.SCHEME_TYPE.BFV)
    parms.load("./parms")

    ctx = sealapi.SEALContext(parms, True, sealapi.SEC_LEVEL_TYPE.TC128)

    public_key = sealapi.PublicKey()
    public_key.load(ctx, "./public_key")
    
    return ctx, public_key


def gen_galois_keys(ctx, secret_key, elt):
    keygen = sealapi.KeyGenerator(ctx, secret_key)
    galois_keys = sealapi.GaloisKeys()
    keygen.create_galois_keys(elt, galois_keys)
    galois_keys.save("./galois_key")
    return galois_keys


def gen_polynomial(a):
    poly = hex(a[0])[2:]
    for i in range(1, len(a)):
        poly = hex(a[i])[2:] + 'x^' + str(i) + ' + ' + poly
    return poly


def check_result(ctx, decryptor, target):
    plaintext = sealapi.Plaintext()
    ciphertext = sealapi.Ciphertext(ctx)
    ciphertext.load(ctx, "./computation")
    decryptor.decrypt(ciphertext, plaintext)
    assert plaintext.to_string() == target.to_string()


def send(filepath):
    f = open(filepath, "rb")
    data = base64.b64encode(f.read()).decode()
    f.close()
    print(data)


def recv(filepath):
    try:
        data = base64.b64decode(input())
    except:
        print("Invalid Base64!")
        exit(0)

    f = open(filepath, "wb")
    f.write(data)
    f.close()

def list_methods(obj):
    all_attributes = dir(obj)
    methods = [attribute for attribute in all_attributes if callable(getattr(obj, attribute))]
    return methods


ctx, public_key = load()
encryptor = sealapi.Encryptor(ctx, public_key)
elt = gens

io = remote('ctf2024-entry.r3kapig.com', 30800)

io.recvuntil(b'Here Is Ciphertext:\n')
raw_line = io.recvline().strip()
data = base64.b64decode(raw_line)
f = open("./ciphertext", "wb")
f.write(data)
f.close()

ciphertext = sealapi.Ciphertext(ctx)
ciphertext.load(ctx, "./ciphertext")


io.recvuntil(b"Please give me your choice:")
inp = b" ".join([str(elt[j]).encode() for j in range(6)])
io.sendline(inp)
log.info(io.recvline().decode())

data = base64.b64decode(io.recvline().strip())
f = open("./galois_key", "wb")
f.write(data)
f.close()

galois_keys = sealapi.GaloisKeys()
galois_keys.load(ctx, "./galois_key")

evaluator = sealapi.Evaluator(ctx)
target_ciphertext = ciphertext

for i in tqdm(range(3, 4096 * 2 , 2)):
    ciphertext = sealapi.Ciphertext(ctx)
    ciphertext.load(ctx, "./ciphertext")
    res = 1
    exps = sub_group[i]
    # print(f"Computing {i}: {exps}")
    for j in range(len(exps)):
        res *= elt[j] ** exps[j] 
        res %= (4096 * 2)
        for _ in range(exps[j]):
            evaluator.apply_galois_inplace(ciphertext, elt[j], galois_keys)
    assert res == i, f"Failed at {i}: {res = }"
    # add ciphertext
    evaluator.add_inplace(target_ciphertext, ciphertext)

# mul target_ciphertext with constant value `mul`
mul = pow(4096, -1, plain_modulus)
plaintext_mul = sealapi.Plaintext(hex(mul)[2:])
evaluator.multiply_plain_inplace(target_ciphertext, plaintext_mul)
target_ciphertext.save("./computation")
f = open("./computation", "rb")
data = base64.b64encode(f.read()).decode()
f.close()
io.sendlineafter(b"Give Me Your Computation\n", data.encode())
print(io.recvline().decode())
```
</div>
</details>




## SPARROW

{: .success}
**Challenge Info**: Let me tell you a story about Sparrow. [Attachment](/assets/ctf-stuff/2024-r3ctf/Sparrow.zip) 

### 题目场景

给了一个自定义的对称加密算法 $\textsf{E}$，加密算法内部有一个 rng，内部的置乱（permutation）由 rng.shuffle 生成，固定 cipher 的 seed 即可让 permutation 固定。提供一个加入了密钥 error 和 密文 shuffle 的 Oracle，返回同一个明文的密文。最终需要恢复出明文和密钥。



### 线性 Sbox = 线性加密

注意到本题使用了线性的 Sbox 用于加密算法，因此当 seed 固定时，整个加密算法变成了线性加密。准确来说，变成了 $\mathbb{F}_2^{128}$ 上的线性加密，即存在一个矩阵 $A \in \mathbb{F}_2^{128\times 128}$，对任意明文 $m \in \mathbb{F}_2^{128}$ 和密钥 $k \in \mathbb{F}_2^{128}$ ，满足

$$
\textsf{E}(k, m) = Am + c(k)
$$

 当 $k$ 固定时，上式就是一个仿射函数，注意到整个加密过程密钥 $k$ 的运算也都是线性的，于是上式可以进一步写成下面的形式：

$$
\textsf{E}(k, m) = Am + Bk + C
$$

其中 $A, B \in  \mathbb{F}_2^{128\times 128}$ 是一个与密钥、明文均无关的矩阵，$C \in \mathbb{F}_2^{128}$ 是一个与密钥、明文均无关的向量，一旦 seed 固定，$A, B, C$ 就都是已知的，可以**本地计算得到**，比如 $C = E(0, 0)$ ，$A$ 矩阵可以通过固定密钥，选取 $(1,0,\cdots,0), (0,1, \cdots, 0)$ 的 128 组明文计算密文，然后解方程得到，同理 $B$ 矩阵可以固定明文解方程得到。

于是题目中的 Oracle 返回的密文可以用下面的代数方程表示：

$$
\textsf{E}(k, m) = P(Am + B(k + e) + C)
$$

其中 $e$ 是已知的随机的误差向量，$P$ 是未知的随机置换（shuffle）。

- 单次 Oracle 内部返回 $t$ 个密文，即：

  $$
  \textsf{E}(k, m, e_j) = P_j(Am + B(k + e_j) + C), j =[1..t] \tag{O1}
  $$


- 多次 Oracle 会生成不同的 seed，即矩阵 $A, B$ 会发生变换：

  $$
  \textsf{E}_i(k, m) = P(A_i m + B_i (k + e) + C_i), i =[1..k]  \tag{O2}
  $$





### 恢复密文

考虑 $(O1)$  内部返回的 $t$ 个密文，由于明文和密钥 $m, k $ 都是固定的，所以 $(O1)$ 内 $Am + Bk$ 是固定的，于是将 $(O1)$  重新整理化简后得到：

$$
\begin{aligned}
\textsf{E}(k, m, e_j) &= P_j(Am + B(k + e_j) + C)\\
& =  P_j (\underbrace{Am + Bk}_{Y} + \underbrace{Be_j + C}_{E_j}) \\
& = P_j (Y + E_j), \quad j =[1..t] 
\end{aligned}
$$

其中 $E_j$ 已知，如何从上述 $t$ 个噪声密文中恢复出无噪声的密文 $Y = Am + Bk$ ?

考虑随机置换（shuffle）前后保持的不变量：累积和，即 $\textsf{Sum}(P \vec v) = \textsf{Sum}(\vec v)$ ，我们仍然可以从噪声的密文中构建方程。令 

$$
\begin{aligned}
C_j &= \textsf{E}(k, m, e_j) = (c_{j, 1}, \cdots, c_{j,128}) \\
E_j &= (e_{j, 1}, \cdots, e_{j,128}) \\
Y &=  (y_1, y_2, \cdots, y_{128})
\end{aligned}
$$

因为上述运算都是 $\mathbb{F}_2$ 的加法，因此至少我们可以构建出一个  $\mathbb{F}_2$ 上的方程

$$
\sum_k c_{j, k} = \sum_{i} y_i + \sum_{k} e_{j, k} \mod 2
$$

问题来了，对 $j =1,2, \cdots, t$，上述方程其实都是一个方程，**无论 $t$ 多大，我们只能得到一个比特信息！**

{: .error}
是否存在一种方法将 $\textsf{Sum}$ 不变量转换到整数环上的线性方程？对于模 2 有限域上的**单次加法**，我们可以很轻松地通过取反，转换为整数环上的加法！

注意到，

$$
\hat c_i = y_i + e_i =
\left\{\begin{aligned}
y_i , \text{ if } e_i = 0\\
1 - y_i \text{ if } e_i = 1
\end{aligned}
\right.
$$

因此，可以构造整数环上的方程：

$$
\sum_k c_{j, k} = \sum_{k} \hat c_{j, k} 
$$

这样我们可以得到 $t$ 组整数环上的方程！如果需要完全解出 $Y =  (y_1, y_2, \cdots, y_{128})$ ，我们至少需要 128 组方程，实际需要的方程数可以更小，因为解为 0,1 向量，在欠定方程组的情况下，可以用格解 SIS 问题。



### 恢复密钥/明文

恢复出若干组 $Y_i$ 后，即

$$
Y_i = A_i m + B_i k
$$

实际上一组 $Y_i$ 提供了 128 个 $\mathbb{F}_2$ 上的方程，未知向量 $m, k$ 含有 $128 + 128 = 256$ 个变量，因此我们需要至少 2 组 $Y_i$ ，即可解线性方程组恢复 $m,k$ 。



### Exploit

<details class="exploit">
<summary><b>linearization.py</b></summary>
<div markdown="1">

``` python
from sage.all import GF, matrix, vector
from utils import Sparrow
import os


sec = os.urandom(16)
spr = Sparrow(key=os.urandom(16))
SEED= os.urandom(16)

def encrypt(msg, seed=SEED):
    spr.st(seed)
    ct = spr.encrypt(msg)
    spr.ed()
    return ct

def encrypt0(key, seed=SEED):
    spr.st(seed)
    spr.key = key
    msg = b"\x00" * 16
    ct = spr.encrypt(msg)
    spr.ed()
    return ct

def encrypt1(key, msg, seed=SEED):
    spr.st(seed)
    spr.key = key
    ct = spr.encrypt(msg)
    spr.ed()
    return ct

def getA(seed):
    base = b"\x00" * 16
    c0 = encrypt(base, seed)
    vecs = []
    for i in range(128):
        p = [0] * 128
        p[i] = 1
        p = spr.unite(p)
        row = spr.xor(encrypt(p, seed),c0)
        vecs.append(spr.split(row))
    A = matrix(GF(2), vecs).T
    return A

def getBC(seed):
    base_key0 = b"\x00" * 16
    c00 = encrypt0(base_key0, seed)

    vecs = []
    for i in range(128):
        k = [0] * 128
        k[i] = 1
        k = spr.unite(k)
        row = spr.xor(encrypt0(k, seed),c00)
        vecs.append(spr.split(row))

    B = matrix(GF(2), vecs).T
    C = vector(GF(2), spr.split(c00))
    return B, C

def ABC_linearization(seed):
    A = getA(seed)
    B, C = getBC(seed)
    return A, B, C

def test_impl():
    key = os.urandom(16)
    msg = os.urandom(16)
    seed = os.urandom(16)
    A, B, C = ABC_linearization(seed)
    k_vec = vector(GF(2), spr.split(key))
    m_vec = vector(GF(2), spr.split(msg))

    ct1 = encrypt1(key, msg, seed)
    ct2 = spr.unite(A*m_vec + B*k_vec + C)
    print(f"key = {key.hex()}")
    print(f"msg = {msg.hex()}")
    print(f"ct1 = {ct1.hex()}")
    print(f"ct2 = {ct2.hex()}")
    assert ct1 == ct2
    print("Test passed")
    
if __name__ == "__main__":
    test_impl()
```
</div>
</details>


<details class="exploit">
<summary><b>Exploit</b></summary>
<div markdown="1">

``` python
from linearizaion import ABC_linearization
from sage.all import PolynomialRing, GF, matrix, vector, QQ, BooleanPolynomialRing, ZZ, Sequence, solve
from utils import Sparrow, fault, noise
import os
from pwn import remote, log, context
import json
from pwnlib.util.iters import mbruteforce
import string
import hashlib

spr = Sparrow(key=os.urandom(16))
# ctf2024-entry.r3kapig.com:32063
io = remote("ctf2024-entry.r3kapig.com", 32063)
# context.log_level = 'debug'

def solve_pow(io:remote):
    io.recvuntil(b"|    sha256(XXXX + ")
    suffix = io.recvuntil(b") == ").strip(b") == ")
    target = io.recvline().strip().decode()
    log.info(f"{suffix = }")
    log.info(f"{target = }")
    table = string.ascii_letters + string.digits
    sol = mbruteforce(lambda x: hashlib.sha256(x.encode() + suffix).hexdigest() == target, table, 4)
    io.sendlineafter(b"|    XXXX>", sol.encode())

def oracle(t: int) -> dict:
    io.sendlineafter(b'|  >', b'h')
    io.sendlineafter(b'|  chaos>', str(t).encode())
    data = io.recvline().strip().decode().replace("'", '"')
    return json.loads(data)
    
def recover_ct(t = 132):
    ys = PolynomialRing(ZZ, 128, 'y').gens()
    data = oracle(t)
    seed = bytes.fromhex(data['s'])
    cts = [bytes.fromhex(data['c'][i:i+32]) for i in range(0, len(data['c']), 32)]
    es = [bytes.fromhex(data['e'][i:i+32]) for i in range(0, len(data['e']), 32)]
    A, B, C = ABC_linearization(seed)
    eqs = []
    for e, ct in zip(es, cts):
        e_vec = spr.split(e)
        ct_vec = spr.split(ct)
        rh = sum(ct_vec)
        lh = 0
        cc = B * vector(GF(2), e_vec) + C
        cc = [int(i) for i in cc]
        for i in range(128):
            if cc[i] == 1:
                lh += (1 - ys[i])
            else:
                lh += ys[i]
        eqs.append(lh - rh)
    seq = Sequence(eqs)
    M, b = seq.coefficient_matrix()
    ker = M.right_kernel().basis()
    if len(ker) == 0:
        print("No solution")
        print("Check the equations")
    elif len(ker) > 1:
        print(f"Multiple solutions {len(ker) = }")
    sol = ker[0]
    # print(f"{sol = }")
    return A, B, C, sol

solve_pow(io)
A1, B1, C1, sol1 = recover_ct()
A2, B2, C2, sol2 = recover_ct()
A3, B3, C3, sol3 = recover_ct()


br = BooleanPolynomialRing(256, 'x')
xs = br.gens()
assert sol1[128] == 1 and sol2[128] == 1 and sol3[128] == 1
S1 = vector(br, [int(i) for i in sol1[:128]])
S2 = vector(br, [int(i) for i in sol2[:128]])
S3 = vector(br, [int(i) for i in sol3[:128]])

ms = list(xs[:128])
ks = list(xs[128:])
eqs = []
# A1 * x + B1 * m = S1
# A2 * x + B2 * m = S2
# A3 * x + B3 * m = S3

polys = A1 * vector(ms) + B1 * vector(ks) + S1
eqs.extend(list(polys))
polys = A2 * vector(ms) + B2 * vector(ks) + S2
eqs.extend(list(polys))
polys = A3 * vector(ms) + B3 * vector(ks) + S3
eqs.extend(list(polys))

seq = Sequence(eqs)
M, b = seq.coefficient_matrix()
ker = M.right_kernel().basis()
if len(ker) == 0:
    print("No solution")
    print("Check the equations")
assert len(ker) == 1, f"{len(ker) = } solutions found, try more samples"
log.info(f"{len(ker) = }")
sol = ker[0]

msg_bits = [int(i) for i in sol[:128]]
key_bits = [int(i) for i in sol[128:256]]
assert sol[256] == 1
recovered_msg = spr.unite(msg_bits)
recoverd_key = spr.unite(key_bits)

io.sendlineafter(b'|  >', b's')
io.sendlineafter(b'|  key>', recoverd_key.hex().encode())
io.sendlineafter(b'|  sec>', recovered_msg.hex().encode())
log.info(io.recvline().decode().strip())
log.info(io.recvline().decode().strip())
```
</div>
</details>



---
